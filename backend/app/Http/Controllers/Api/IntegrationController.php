<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiLog;
use App\Models\BpjsConfiguration;
use App\Models\OnehealthConfig;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class IntegrationController extends Controller
{
    /**
     * Get integration configurations and status
     */
    public function getConfigurations(): JsonResponse
    {
        try {
            $bpjsConfig = BpjsConfiguration::where('is_active', true)->first();
            $satusehatConfig = OnehealthConfig::where('status', 'active')->first();

            $bpjsStatus = $this->checkBpjsStatus($bpjsConfig);
            $satusehatStatus = $this->checkSatusehatStatus($satusehatConfig);

            return response()->json([
                'success' => true,
                'data' => [
                    'bpjs' => [
                        'config' => $bpjsConfig,
                        'status' => $bpjsStatus
                    ],
                    'satusehat' => [
                        'config' => $satusehatConfig,
                        'status' => $satusehatStatus
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting integration configurations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil konfigurasi integrasi'
            ], 500);
        }
    }

    /**
     * Update BPJS configuration
     */
    public function updateBpjsConfiguration(Request $request): JsonResponse
    {
        $request->validate([
            'api_endpoint' => 'required|url',
            'api_key' => 'nullable|string',
            'secret_key' => 'nullable|string',
            'rate_limit' => 'nullable|integer|min:1',
            'environment' => 'nullable|in:production,sandbox',
            'is_active' => 'boolean'
        ]);

        try {
            $config = BpjsConfiguration::updateOrCreate(
                ['is_active' => true],
                $request->only([
                    'api_endpoint',
                    'api_key',
                    'secret_key',
                    'rate_limit',
                    'environment',
                    'is_active'
                ])
            );

            return response()->json([
                'success' => true,
                'message' => 'Konfigurasi BPJS berhasil diperbarui',
                'data' => $config
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating BPJS configuration', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui konfigurasi BPJS'
            ], 500);
        }
    }

    /**
     * Update SATUSEHAT configuration
     */
    public function updateSatusehatConfiguration(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'nullable|string',
            'client_secret' => 'nullable|string',
            'base_url' => 'nullable|url',
            'organization_id' => 'nullable|string',
            'facility_id' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            $config = OnehealthConfig::updateOrCreate(
                ['name' => 'SATUSEHAT Integration'],
                $request->only([
                    'client_id',
                    'client_secret',
                    'base_url',
                    'organization_id',
                    'facility_id',
                    'status'
                ])
            );

            return response()->json([
                'success' => true,
                'message' => 'Konfigurasi SATUSEHAT berhasil diperbarui',
                'data' => $config
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating SATUSEHAT configuration', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui konfigurasi SATUSEHAT'
            ], 500);
        }
    }

    /**
     * Test BPJS connection
     */
    public function testBpjsConnection(): JsonResponse
    {
        $startTime = microtime(true);

        try {
            $config = BpjsConfiguration::where('is_active', true)->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konfigurasi BPJS tidak ditemukan'
                ], 404);
            }

            // Test basic connectivity to BPJS endpoint
            $response = Http::timeout(30)
                ->withHeaders([
                    'X-Cons-ID' => $config->api_key ?? '',
                    'X-Timestamp' => now()->timestamp,
                    'X-Signature' => $this->generateBpjsSignature($config),
                    'Content-Type' => 'application/json'
                ])
                ->get($config->api_endpoint . '/vclaim-rest/referensi/diagnosa/1');

            $responseTime = round((microtime(true) - $startTime) * 1000);

            $this->logApiRequest('bpjs', 'test-connection', 'GET', null, [
                'status_code' => $response->status(),
                'response' => $response->json()
            ], $response->status(), $responseTime, $response->successful() ? null : $response->body());

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Koneksi BPJS berhasil',
                    'data' => [
                        'status_code' => $response->status(),
                        'response_time' => $responseTime,
                        'message' => 'API BPJS dapat diakses'
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Koneksi BPJS gagal',
                    'data' => [
                        'status_code' => $response->status(),
                        'response_time' => $responseTime,
                        'error' => $response->body()
                    ]
                ], 400);
            }
        } catch (\Exception $e) {
            $responseTime = round((microtime(true) - $startTime) * 1000);

            $this->logApiRequest('bpjs', 'test-connection', 'GET', null, null, null, $responseTime, $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error testing BPJS connection',
                'data' => [
                    'response_time' => $responseTime,
                    'error' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Test SATUSEHAT connection
     */
    public function testSatusehatConnection(): JsonResponse
    {
        $startTime = microtime(true);

        try {
            $config = OnehealthConfig::where('status', 'active')->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konfigurasi SATUSEHAT tidak ditemukan'
                ], 404);
            }

            // Test basic connectivity to SATUSEHAT
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->getSatusehatToken($config),
                    'Content-Type' => 'application/json'
                ])
                ->get($config->base_url . '/Organization');

            $responseTime = round((microtime(true) - $startTime) * 1000);

            $this->logApiRequest('satusehat', 'test-connection', 'GET', null, [
                'status_code' => $response->status(),
                'response' => $response->json()
            ], $response->status(), $responseTime, $response->successful() ? null : $response->body());

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Koneksi SATUSEHAT berhasil',
                    'data' => [
                        'status_code' => $response->status(),
                        'response_time' => $responseTime,
                        'message' => 'API SATUSEHAT dapat diakses'
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Koneksi SATUSEHAT gagal',
                    'data' => [
                        'status_code' => $response->status(),
                        'response_time' => $responseTime,
                        'error' => $response->body()
                    ]
                ], 400);
            }
        } catch (\Exception $e) {
            $responseTime = round((microtime(true) - $startTime) * 1000);

            $this->logApiRequest('satusehat', 'test-connection', 'GET', null, null, null, $responseTime, $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error testing SATUSEHAT connection',
                'data' => [
                    'response_time' => $responseTime,
                    'error' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Refresh BPJS token
     */
    public function refreshBpjsToken(): JsonResponse
    {
        try {
            $config = BpjsConfiguration::where('is_active', true)->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konfigurasi BPJS tidak ditemukan'
                ], 404);
            }

            // BPJS token refresh logic
            $response = Http::timeout(30)
                ->withHeaders([
                    'X-Cons-ID' => $config->api_key ?? '',
                    'X-Timestamp' => now()->timestamp,
                    'X-Signature' => $this->generateBpjsSignature($config),
                    'Content-Type' => 'application/json'
                ])
                ->get($config->api_endpoint . '/vclaim-rest/oauth/token');

            if ($response->successful()) {
                $data = $response->json();
                $config->update([
                    'token_expiry' => Carbon::now()->addSeconds($data['expires_in'] ?? 3600)
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Token BPJS berhasil diperbarui',
                    'data' => [
                        'expires_at' => $config->token_expiry
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memperbarui token BPJS',
                    'data' => [
                        'error' => $response->body()
                    ]
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Error refreshing BPJS token', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error refreshing BPJS token'
            ], 500);
        }
    }

    /**
     * Refresh SATUSEHAT token
     */
    public function refreshSatusehatToken(): JsonResponse
    {
        try {
            $config = OnehealthConfig::where('status', 'active')->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konfigurasi SATUSEHAT tidak ditemukan'
                ], 404);
            }

            // SATUSEHAT OAuth2 token refresh
            $response = Http::timeout(30)
                ->post($config->base_url . '/oauth2/token', [
                    'grant_type' => 'client_credentials',
                    'client_id' => $config->client_id,
                    'client_secret' => $config->client_secret
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $config->update([
                    'last_sync_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Token SATUSEHAT berhasil diperbarui',
                    'data' => [
                        'token_type' => $data['token_type'] ?? 'Bearer',
                        'expires_in' => $data['expires_in'] ?? 3600
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memperbarui token SATUSEHAT',
                    'data' => [
                        'error' => $response->body()
                    ]
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Error refreshing SATUSEHAT token', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error refreshing SATUSEHAT token'
            ], 500);
        }
    }

    /**
     * Get API logs with pagination and filtering
     */
    public function getLogs(Request $request): JsonResponse
    {
        try {
            $query = ApiLog::with('user:id,name,email')
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('service') && $request->service !== 'all') {
                $query->where('service', $request->service);
            }

            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'success') {
                    $query->where('is_success', true);
                } elseif ($request->status === 'error') {
                    $query->where('is_success', false);
                }
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $logs = $query->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting API logs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil log API'
            ], 500);
        }
    }

    /**
     * Get integration statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'bpjs' => [
                    'total_requests' => ApiLog::service('bpjs')->count(),
                    'success_rate' => $this->calculateSuccessRate('bpjs'),
                    'avg_response_time' => ApiLog::service('bpjs')->whereNotNull('response_time')->avg('response_time'),
                    'last_sync' => ApiLog::service('bpjs')->latest('created_at')->first()?->created_at
                ],
                'satusehat' => [
                    'total_requests' => ApiLog::service('satusehat')->count(),
                    'success_rate' => $this->calculateSuccessRate('satusehat'),
                    'avg_response_time' => ApiLog::service('satusehat')->whereNotNull('response_time')->avg('response_time'),
                    'last_sync' => ApiLog::service('satusehat')->latest('created_at')->first()?->created_at
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting integration statistics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik integrasi'
            ], 500);
        }
    }

    /**
     * Helper method to check BPJS status
     */
    private function checkBpjsStatus(?BpjsConfiguration $config): array
    {
        if (!$config) {
            return [
                'connected' => false,
                'status' => 'disconnected',
                'message' => 'Konfigurasi BPJS belum diatur'
            ];
        }

        // Check if token is expired
        if ($config->token_expiry && $config->token_expiry->isPast()) {
            return [
                'connected' => false,
                'status' => 'expired',
                'message' => 'Token BPJS sudah expired'
            ];
        }

        // Check recent API calls
        $recentLog = ApiLog::service('bpjs')
            ->where('created_at', '>=', now()->subHours(1))
            ->latest()
            ->first();

        if ($recentLog && $recentLog->is_success) {
            return [
                'connected' => true,
                'status' => 'connected',
                'message' => 'BPJS terhubung dan aktif',
                'last_sync' => $recentLog->created_at
            ];
        }

        return [
            'connected' => false,
            'status' => 'unknown',
            'message' => 'Status BPJS belum diketahui'
        ];
    }

    /**
     * Helper method to check SATUSEHAT status
     */
    private function checkSatusehatStatus(?OnehealthConfig $config): array
    {
        if (!$config || $config->status !== 'active') {
            return [
                'connected' => false,
                'status' => 'inactive',
                'message' => 'SATUSEHAT tidak aktif'
            ];
        }

        // Check recent API calls
        $recentLog = ApiLog::service('satusehat')
            ->where('created_at', '>=', now()->subHours(1))
            ->latest()
            ->first();

        if ($recentLog && $recentLog->is_success) {
            return [
                'connected' => true,
                'status' => 'connected',
                'message' => 'SATUSEHAT terhubung dan aktif',
                'last_sync' => $recentLog->created_at
            ];
        }

        return [
            'connected' => false,
            'status' => 'unknown',
            'message' => 'Status SATUSEHAT belum diketahui'
        ];
    }

    /**
     * Generate BPJS signature
     */
    private function generateBpjsSignature(BpjsConfiguration $config): string
    {
        $timestamp = now()->timestamp;
        $data = $config->api_key . '&' . $timestamp;
        return hash_hmac('sha256', $data, $config->secret_key ?? '');
    }

    /**
     * Get SATUSEHAT access token
     */
    private function getSatusehatToken(OnehealthConfig $config): ?string
    {
        // This is a simplified implementation
        // In real implementation, you should cache and refresh tokens properly
        try {
            $response = Http::timeout(30)
                ->post($config->base_url . '/oauth2/token', [
                    'grant_type' => 'client_credentials',
                    'client_id' => $config->client_id,
                    'client_secret' => $config->client_secret
                ]);

            if ($response->successful()) {
                return $response->json()['access_token'];
            }
        } catch (\Exception $e) {
            Log::error('Error getting SATUSEHAT token', [
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Calculate success rate for a service
     */
    private function calculateSuccessRate(string $service): float
    {
        $total = ApiLog::service($service)->count();
        if ($total === 0) return 0;

        $successful = ApiLog::service($service)->successful()->count();
        return round(($successful / $total) * 100, 2);
    }

    /**
     * Log API request
     */
    private function logApiRequest(
        string $service,
        string $endpoint,
        string $method,
        ?array $requestData,
        ?array $responseData,
        ?int $statusCode,
        ?int $responseTime,
        ?string $errorMessage = null
    ): void {
        try {
            ApiLog::create([
                'service' => $service,
                'endpoint' => $endpoint,
                'method' => $method,
                'request_data' => $requestData,
                'response_data' => $responseData,
                'status_code' => $statusCode,
                'response_time' => $responseTime,
                'error_message' => $errorMessage,
                'request_id' => Str::uuid(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'user_id' => auth()->id(),
                'is_success' => $statusCode && $statusCode >= 200 && $statusCode < 300
            ]);
        } catch (\Exception $e) {
            Log::error('Error logging API request', [
                'error' => $e->getMessage(),
                'service' => $service,
                'endpoint' => $endpoint
            ]);
        }
    }
}
