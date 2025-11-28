<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\SatusehatSyncLog;
use App\Models\OnehealthConfig;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SatusehatController extends Controller
{
    /**
     * Get SATUSEHAT sync dashboard data
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = [
                'total_patients' => Patient::count(),
                'synced_patients' => SatusehatSyncLog::where('resource_type', 'Patient')
                    ->where('sync_status', 'success')
                    ->distinct('patient_id')
                    ->count('patient_id'),
                'pending_sync' => SatusehatSyncLog::where('sync_status', 'pending')->count(),
                'failed_sync' => SatusehatSyncLog::where('sync_status', 'failed')->count(),
                'last_sync' => SatusehatSyncLog::latest('sync_completed_at')->first()?->sync_completed_at,
                'sync_success_rate' => $this->calculateSyncSuccessRate(),
            ];

            $recentSyncs = SatusehatSyncLog::with('patient:id,mrn,name')
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'recent_syncs' => $recentSyncs,
                    'config_status' => $this->getConfigStatus(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting SATUSEHAT dashboard', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dashboard SATUSEHAT'
            ], 500);
        }
    }

    /**
     * Sync patient data to SATUSEHAT
     */
    public function syncPatient(Request $request): JsonResponse
    {
        $request->validate([
            'patient_id' => 'required|integer|exists:patients,id',
            'force_sync' => 'boolean'
        ]);

        try {
            $patient = Patient::findOrFail($request->patient_id);
            $forceSync = $request->boolean('force_sync', false);

            // Check if already synced (unless force sync)
            if (!$forceSync) {
                $existingSync = SatusehatSyncLog::where('patient_id', $patient->id)
                    ->where('resource_type', 'Patient')
                    ->where('sync_status', 'success')
                    ->first();

                if ($existingSync) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Pasien sudah di-sync ke SATUSEHAT'
                    ], 422);
                }
            }

            $result = $this->syncPatientToSatusehat($patient);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'data' => $result['data'] ?? null
            ]);

        } catch (\Exception $e) {
            Log::error('Error syncing patient to SATUSEHAT', [
                'patient_id' => $request->patient_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal sync pasien ke SATUSEHAT'
            ], 500);
        }
    }

    /**
     * Bulk sync patients to SATUSEHAT
     */
    public function bulkSync(Request $request): JsonResponse
    {
        $request->validate([
            'patient_ids' => 'nullable|array',
            'patient_ids.*' => 'integer|exists:patients,id',
            'limit' => 'nullable|integer|min:1|max:100',
            'sync_unsynced_only' => 'boolean'
        ]);

        try {
            $batchId = Str::uuid();
            $limit = $request->get('limit', 50);
            $syncUnsyncedOnly = $request->boolean('sync_unsynced_only', true);

            // Get patients to sync
            $query = Patient::query();

            if ($request->has('patient_ids')) {
                $query->whereIn('id', $request->patient_ids);
            }

            if ($syncUnsyncedOnly) {
                $syncedPatientIds = SatusehatSyncLog::where('resource_type', 'Patient')
                    ->where('sync_status', 'success')
                    ->pluck('patient_id')
                    ->toArray();

                $query->whereNotIn('id', $syncedPatientIds);
            }

            $patients = $query->limit($limit)->get();

            $results = [];
            $successCount = 0;
            $failCount = 0;

            foreach ($patients as $patient) {
                $result = $this->syncPatientToSatusehat($patient, $batchId);
                $results[] = [
                    'patient_id' => $patient->id,
                    'patient_name' => $patient->name,
                    'success' => $result['success'],
                    'message' => $result['message']
                ];

                if ($result['success']) {
                    $successCount++;
                } else {
                    $failCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Bulk sync selesai: {$successCount} berhasil, {$failCount} gagal",
                'data' => [
                    'batch_id' => $batchId,
                    'total_processed' => count($results),
                    'success_count' => $successCount,
                    'fail_count' => $failCount,
                    'results' => $results
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error bulk syncing patients to SATUSEHAT', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan bulk sync'
            ], 500);
        }
    }

    /**
     * Get sync logs with filtering
     */
    public function syncLogs(Request $request): JsonResponse
    {
        try {
            $query = SatusehatSyncLog::with('patient:id,mrn,name')
                ->orderBy('updated_at', 'desc');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('sync_status', $request->status);
            }

            if ($request->has('resource_type') && $request->resource_type !== 'all') {
                $query->where('resource_type', $request->resource_type);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
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
            Log::error('Error getting sync logs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil log sync'
            ], 500);
        }
    }

    /**
     * Retry failed syncs
     */
    public function retryFailedSyncs(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:50'
        ]);

        try {
            $limit = $request->get('limit', 20);

            $failedSyncs = SatusehatSyncLog::readyForRetry()
                ->with('patient')
                ->limit($limit)
                ->get();

            $results = [];
            $successCount = 0;

            foreach ($failedSyncs as $syncLog) {
                $result = $this->retrySyncLog($syncLog);
                $results[] = $result;

                if ($result['success']) {
                    $successCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Retry selesai: {$successCount} dari {$failedSyncs->count()} berhasil",
                'data' => [
                    'total_attempted' => $failedSyncs->count(),
                    'success_count' => $successCount,
                    'results' => $results
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrying failed syncs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan retry sync'
            ], 500);
        }
    }

    /**
     * Get patients available for sync
     */
    public function availablePatients(Request $request): JsonResponse
    {
        try {
            $syncedPatientIds = SatusehatSyncLog::where('resource_type', 'Patient')
                ->where('sync_status', 'success')
                ->pluck('patient_id')
                ->toArray();

            $query = Patient::whereNotIn('id', $syncedPatientIds)
                ->select('id', 'mrn', 'name', 'birth_date', 'gender')
                ->orderBy('name');

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('mrn', 'like', "%{$search}%");
                });
            }

            $patients = $query->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $patients
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting available patients', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar pasien tersedia'
            ], 500);
        }
    }

    /**
     * Sync single patient to SATUSEHAT
     */
    private function syncPatientToSatusehat(Patient $patient, string $batchId = null): array
    {
        try {
            // Create or update sync log
            $syncLog = SatusehatSyncLog::updateOrCreate(
                [
                    'patient_id' => $patient->id,
                    'resource_type' => 'Patient',
                    'local_resource_id' => $patient->id
                ],
                [
                    'sync_status' => 'pending',
                    'sync_batch_id' => $batchId,
                    'sync_attempted_at' => now(),
                ]
            );

            // Generate FHIR Patient resource
            $fhirPatient = $this->generateFhirPatient($patient);

            // Get SATUSEHAT config
            $config = OnehealthConfig::where('status', 'active')->first();
            if (!$config) {
                $syncLog->markAsFailed('Konfigurasi SATUSEHAT tidak ditemukan');
                return [
                    'success' => false,
                    'message' => 'Konfigurasi SATUSEHAT tidak ditemukan'
                ];
            }

            // Send to SATUSEHAT API
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->getSatusehatToken($config),
                    'Content-Type' => 'application/json'
                ])
                ->post($config->base_url . '/Patient', $fhirPatient);

            $syncLog->update([
                'request_payload' => $fhirPatient,
                'response_data' => $response->json()
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $resourceId = $responseData['id'] ?? null;

                $syncLog->markAsSuccessful($resourceId, $responseData);

                return [
                    'success' => true,
                    'message' => 'Pasien berhasil di-sync ke SATUSEHAT',
                    'data' => [
                        'resource_id' => $resourceId,
                        'sync_log_id' => $syncLog->id
                    ]
                ];
            } else {
                $errorMessage = $response->json()['issue'][0]['diagnostics'] ?? $response->body();
                $syncLog->markAsFailed($errorMessage, $response->json());

                return [
                    'success' => false,
                    'message' => 'Gagal sync pasien: ' . $errorMessage
                ];
            }

        } catch (\Exception $e) {
            $syncLog->markAsFailed($e->getMessage());
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Retry a specific sync log
     */
    private function retrySyncLog(SatusehatSyncLog $syncLog): array
    {
        try {
            if ($syncLog->resource_type === 'Patient') {
                $patient = Patient::find($syncLog->patient_id);
                if (!$patient) {
                    return [
                        'sync_log_id' => $syncLog->id,
                        'success' => false,
                        'message' => 'Pasien tidak ditemukan'
                    ];
                }

                $result = $this->syncPatientToSatusehat($patient);
                return [
                    'sync_log_id' => $syncLog->id,
                    'patient_name' => $patient->name,
                    'success' => $result['success'],
                    'message' => $result['message']
                ];
            }

            return [
                'sync_log_id' => $syncLog->id,
                'success' => false,
                'message' => 'Tipe resource tidak didukung untuk retry'
            ];

        } catch (\Exception $e) {
            return [
                'sync_log_id' => $syncLog->id,
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate FHIR Patient resource
     */
    private function generateFhirPatient(Patient $patient): array
    {
        return [
            'resourceType' => 'Patient',
            'identifier' => [
                [
                    'system' => 'https://rsud-jakarta.go.id',
                    'value' => $patient->mrn
                ]
            ],
            'name' => [
                [
                    'use' => 'official',
                    'text' => $patient->name,
                    'family' => explode(' ', $patient->name)[0] ?? $patient->name,
                    'given' => array_slice(explode(' ', $patient->name), 1)
                ]
            ],
            'gender' => $this->mapGender($patient->gender),
            'birthDate' => $patient->birth_date?->format('Y-m-d'),
            'address' => $patient->address ? [
                [
                    'use' => 'home',
                    'text' => $patient->address
                ]
            ] : [],
            'telecom' => $patient->phone ? [
                [
                    'system' => 'phone',
                    'value' => $patient->phone,
                    'use' => 'mobile'
                ]
            ] : []
        ];
    }

    /**
     * Map gender to FHIR format
     */
    private function mapGender(?string $gender): string
    {
        return match (strtolower($gender ?? '')) {
            'l', 'laki-laki', 'male' => 'male',
            'p', 'perempuan', 'female' => 'female',
            default => 'unknown'
        };
    }

    /**
     * Get SATUSEHAT access token
     */
    private function getSatusehatToken(OnehealthConfig $config): ?string
    {
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
     * Get configuration status
     */
    private function getConfigStatus(): array
    {
        $config = OnehealthConfig::where('status', 'active')->first();

        if (!$config) {
            return [
                'configured' => false,
                'status' => 'not_configured',
                'message' => 'SATUSEHAT belum dikonfigurasi'
            ];
        }

        // Test connection
        try {
            $token = $this->getSatusehatToken($config);
            if ($token) {
                return [
                    'configured' => true,
                    'status' => 'connected',
                    'message' => 'SATUSEHAT terhubung dan aktif',
                    'last_sync' => $config->last_sync_at
                ];
            }
        } catch (\Exception $e) {
            // Continue to return offline status
        }

        return [
            'configured' => true,
            'status' => 'offline',
            'message' => 'SATUSEHAT dikonfigurasi tapi tidak dapat terhubung'
        ];
    }

    /**
     * Calculate sync success rate
     */
    private function calculateSyncSuccessRate(): float
    {
        $total = SatusehatSyncLog::count();
        if ($total === 0) return 0;

        $successful = SatusehatSyncLog::where('sync_status', 'success')->count();
        return round(($successful / $total) * 100, 2);
    }
}
