<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BpjsIntegration;
use App\Models\BpjsConfiguration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BpjsIntegrationController extends Controller
{
    /**
     * Display BPJS integration statistics and status.
     */
    public function index(): JsonResponse
    {
        try {
            $stats = [
                'total_requests' => BpjsIntegration::count(),
                'success_rate' => BpjsIntegration::count() > 0 ?
                    round((BpjsIntegration::where('status', 'success')->count() / BpjsIntegration::count()) * 100, 2) : 0,
                'last_sync' => BpjsIntegration::latest('created_at')->first()?->created_at?->toISOString() ?? now()->toISOString(),
                'active_connections' => BpjsConfiguration::where('is_active', true)->count(),
                'services' => $this->getServiceStats(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch BPJS integration stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync data with BPJS.
     */
    public function sync(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'service_type' => 'nullable|string|in:sep,patient,claim,referral',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $serviceType = $request->get('service_type', 'all');
            $results = [];

            // Get active BPJS configuration
            $config = BpjsConfiguration::where('is_active', true)->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active BPJS configuration found'
                ], 400);
            }

            // Sync based on service type
            switch ($serviceType) {
                case 'sep':
                    $results = $this->syncSEPData($config);
                    break;
                case 'patient':
                    $results = $this->syncPatientData($config);
                    break;
                case 'claim':
                    $results = $this->syncClaimData($config);
                    break;
                case 'referral':
                    $results = $this->syncReferralData($config);
                    break;
                default:
                    $results = array_merge(
                        $this->syncSEPData($config),
                        $this->syncPatientData($config),
                        $this->syncClaimData($config),
                        $this->syncReferralData($config)
                    );
            }

            return response()->json([
                'success' => true,
                'message' => 'BPJS sync completed',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('BPJS Sync Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'BPJS sync failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test BPJS API connection.
     */
    public function testConnection(): JsonResponse
    {
        try {
            $config = BpjsConfiguration::where('is_active', true)->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active BPJS configuration found'
                ], 400);
            }

            // Test connection to BPJS API
            $response = Http::timeout(30)
                ->withHeaders([
                    'X-Cons-ID' => $config->cons_id,
                    'X-Timestamp' => time(),
                    'X-Signature' => $this->generateSignature($config),
                    'Content-Type' => 'application/json',
                ])
                ->get($config->base_url . '/v1/sep');

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'BPJS connection successful',
                    'data' => [
                        'status_code' => $response->status(),
                        'response_time' => $response->handlerStats()['total_time'] ?? 0,
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'BPJS connection failed',
                    'data' => [
                        'status_code' => $response->status(),
                        'error' => $response->body()
                    ]
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get BPJS configuration.
     */
    public function getConfiguration(): JsonResponse
    {
        try {
            $config = BpjsConfiguration::where('is_active', true)->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active BPJS configuration found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'base_url' => $config->base_url,
                    'cons_id' => $config->cons_id,
                    'secret_key' => '••••••••', // Masked for security
                    'is_active' => $config->is_active,
                    'last_updated' => $config->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get configuration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update BPJS configuration.
     */
    public function updateConfiguration(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'base_url' => 'required|url',
            'cons_id' => 'required|string|max:50',
            'secret_key' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Deactivate all existing configurations
            BpjsConfiguration::where('is_active', true)->update(['is_active' => false]);

            // Create new active configuration
            $config = BpjsConfiguration::create([
                'base_url' => $request->base_url,
                'cons_id' => $request->cons_id,
                'secret_key' => $request->secret_key,
                'is_active' => $request->is_active ?? true,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'BPJS configuration updated successfully',
                'data' => $config
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update configuration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get API logs.
     */
    public function getLogs(Request $request): JsonResponse
    {
        try {
            $logs = BpjsIntegration::with(['user'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get service statistics.
     */
    private function getServiceStats(): array
    {
        return [
            [
                'name' => 'SEP Creation',
                'status' => 'active',
                'last_used' => BpjsIntegration::where('service_type', 'sep')->latest('created_at')->first()?->created_at?->toISOString(),
                'requests_today' => BpjsIntegration::where('service_type', 'sep')->whereDate('created_at', today())->count(),
                'success_rate' => $this->calculateSuccessRate('sep'),
            ],
            [
                'name' => 'Patient Verification',
                'status' => 'active',
                'last_used' => BpjsIntegration::where('service_type', 'patient')->latest('created_at')->first()?->created_at?->toISOString(),
                'requests_today' => BpjsIntegration::where('service_type', 'patient')->whereDate('created_at', today())->count(),
                'success_rate' => $this->calculateSuccessRate('patient'),
            ],
            [
                'name' => 'Claim Submission',
                'status' => 'active',
                'last_used' => BpjsIntegration::where('service_type', 'claim')->latest('created_at')->first()?->created_at?->toISOString(),
                'requests_today' => BpjsIntegration::where('service_type', 'claim')->whereDate('created_at', today())->count(),
                'success_rate' => $this->calculateSuccessRate('claim'),
            ],
            [
                'name' => 'Referral Processing',
                'status' => 'warning',
                'last_used' => BpjsIntegration::where('service_type', 'referral')->latest('created_at')->first()?->created_at?->toISOString(),
                'requests_today' => BpjsIntegration::where('service_type', 'referral')->whereDate('created_at', today())->count(),
                'success_rate' => $this->calculateSuccessRate('referral'),
            ],
        ];
    }

    /**
     * Calculate success rate for a service type.
     */
    private function calculateSuccessRate(string $serviceType): float
    {
        $total = BpjsIntegration::where('service_type', $serviceType)->count();
        if ($total === 0) return 0;

        $success = BpjsIntegration::where('service_type', $serviceType)
            ->where('status', 'success')
            ->count();

        return round(($success / $total) * 100, 2);
    }

    /**
     * Generate BPJS API signature.
     */
    private function generateSignature(BpjsConfiguration $config): string
    {
        $timestamp = time();
        $data = $config->cons_id . '&' . $timestamp;
        return hash_hmac('sha256', $data, $config->secret_key);
    }

    /**
     * Sync SEP data (placeholder implementation).
     */
    private function syncSEPData(BpjsConfiguration $config): array
    {
        // Placeholder - implement actual BPJS SEP sync logic
        BpjsIntegration::create([
            'service_type' => 'sep',
            'endpoint' => '/v1/sep',
            'request_data' => json_encode(['sync_type' => 'sep']),
            'status' => 'success',
            'response_data' => json_encode(['message' => 'SEP sync completed']),
            'user_id' => auth()->id(),
        ]);

        return ['sep' => ['status' => 'success', 'message' => 'SEP data synced']];
    }

    /**
     * Sync patient data (placeholder implementation).
     */
    private function syncPatientData(BpjsConfiguration $config): array
    {
        // Placeholder - implement actual BPJS patient sync logic
        BpjsIntegration::create([
            'service_type' => 'patient',
            'endpoint' => '/v1/patient',
            'request_data' => json_encode(['sync_type' => 'patient']),
            'status' => 'success',
            'response_data' => json_encode(['message' => 'Patient data synced']),
            'user_id' => auth()->id(),
        ]);

        return ['patient' => ['status' => 'success', 'message' => 'Patient data synced']];
    }

    /**
     * Sync claim data (placeholder implementation).
     */
    private function syncClaimData(BpjsConfiguration $config): array
    {
        // Placeholder - implement actual BPJS claim sync logic
        BpjsIntegration::create([
            'service_type' => 'claim',
            'endpoint' => '/v1/claim',
            'request_data' => json_encode(['sync_type' => 'claim']),
            'status' => 'success',
            'response_data' => json_encode(['message' => 'Claim data synced']),
            'user_id' => auth()->id(),
        ]);

        return ['claim' => ['status' => 'success', 'message' => 'Claim data synced']];
    }

    /**
     * Sync referral data (placeholder implementation).
     */
    private function syncReferralData(BpjsConfiguration $config): array
    {
        // Placeholder - implement actual BPJS referral sync logic
        BpjsIntegration::create([
            'service_type' => 'referral',
            'endpoint' => '/v1/referral',
            'request_data' => json_encode(['sync_type' => 'referral']),
            'status' => 'success',
            'response_data' => json_encode(['message' => 'Referral data synced']),
            'user_id' => auth()->id(),
        ]);

        return ['referral' => ['status' => 'success', 'message' => 'Referral data synced']];
    }
}
