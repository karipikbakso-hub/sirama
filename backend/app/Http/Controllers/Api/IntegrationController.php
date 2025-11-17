<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiLog;
use App\Models\BpjsConfiguration;
use App\Models\OnehealthConfig;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
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
            'cons_id' => 'nullable|string',
            'secret_key' => 'nullable|string',
            'user_key' => 'nullable|string',
            'rate_limit' => 'nullable|integer|min:1',
            'environment' => 'nullable|in:production,sandbox',
            'is_active' => 'boolean'
        ]);

        try {
            // Encrypt sensitive credentials before saving
            $configData = $request->only([
                'api_endpoint',
                'rate_limit',
                'environment',
                'is_active'
            ]);

            if ($request->has('cons_id') && !empty($request->cons_id)) {
                $configData['api_key'] = Crypt::encrypt($request->cons_id);
            }

            if ($request->has('secret_key') && !empty($request->secret_key)) {
                $configData['secret_key'] = Crypt::encrypt($request->secret_key);
            }

            if ($request->has('user_key') && !empty($request->user_key)) {
                $configData['user_key'] = Crypt::encrypt($request->user_key);
            }

            $config = BpjsConfiguration::updateOrCreate(
                ['is_active' => true],
                $configData
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
            // Encrypt sensitive credentials before saving
            $configData = $request->only([
                'client_id', // client_id is public, does not need encryption
                'base_url',
                'organization_id',
                'facility_id',
                'status'
            ]);

            if ($request->has('client_secret') && !empty($request->client_secret)) {
                $configData['client_secret'] = Crypt::encrypt($request->client_secret);
            }

            $config = OnehealthConfig::updateOrCreate(
                ['name' => 'SATUSEHAT Integration'],
                $configData
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
     * Get SATUSEHAT access token with caching
     */
    private function getSatusehatToken(OnehealthConfig $config): ?string
    {
        try {
            // Create cache key based on client_id
            $cacheKey = "satusehat_token_{$config->client_id}";

            // Check if token exists in cache
            if (Cache::has($cacheKey)) {
                $cachedToken = Cache::get($cacheKey);
                if ($this->validateCachedToken($cachedToken, $config)) {
                    return $cachedToken['access_token'];
                }
                // Token in cache is invalid, remove it
                Cache::forget($cacheKey);
            }

            // Request new token
            $response = Http::timeout(30)
                ->post($config->base_url . '/oauth2/token', [
                    'grant_type' => 'client_credentials',
                    'client_id' => Crypt::decrypt($config->client_id),
                    'client_secret' => Crypt::decrypt($config->client_secret)
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $accessToken = $data['access_token'];
                $expiresIn = $data['expires_in'] ?? 3600; // Default 1 hour

                // Cache token with expiry (cache for 5 minutes less than actual expiry)
                $cacheExpiry = now()->addSeconds(max($expiresIn - 300, 300));
                Cache::put($cacheKey, [
                    'access_token' => $accessToken,
                    'expires_at' => $cacheExpiry,
                    'client_id' => $config->client_id
                ], $cacheExpiry);

                return $accessToken;
            }

            Log::warning('Failed to obtain SATUSEHAT token', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting SATUSEHAT token', [
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Validate cached token
     */
    private function validateCachedToken(array $cachedToken, OnehealthConfig $config): bool
    {
        // Check if token is expired
        $expiresAt = $cachedToken['expires_at'] ?? null;
        if (!$expiresAt || now()->isAfter($expiresAt)) {
            return false;
        }

        // Check if client_id matches
        if (($cachedToken['client_id'] ?? null) !== $config->client_id) {
            return false;
        }

        return true;
    }

    /**
     * Refresh SATUSEHAT token forcefully
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

            // Clear existing cache
            $cacheKey = "satusehat_token_{$config->client_id}";
            Cache::forget($cacheKey);

            // Force get new token (will request from API)
            $token = $this->getSatusehatToken($config);

            if ($token) {
                $config->update([
                    'last_sync_at' => now()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Token SATUSEHAT berhasil diperbarui',
                    'data' => [
                        'refreshed_at' => now()->toISOString(),
                        'cache_cleared' => true
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mendapatkan token SATUSEHAT baru'
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
     * Rotate BPJS API Key
     */
    public function rotateBpjsKey(): JsonResponse
    {
        try {
            DB::transaction(function () {
                $config = BpjsConfiguration::where('is_active', true)->first();
                if (!$config) {
                    throw new \Exception('BPJS configuration not found');
                }

                // Log old keys for audit (masked)
                AuditLog::create([
                    'user_name' => auth()->user()->name,
                    'action' => 'bpjs_key_rotation_started',
                    'resource_type' => 'api_integration',
                    'description' => 'BPJS API key rotation initiated',
                    'level' => 'info',
                    'old_values' => ['status' => 'current_keys'],
                    'new_values' => null,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent()
                ]);

                // Generate new keys
                $newConsId = Crypt::encrypt('cons-' . Str::random(20));
                $newSecret = Crypt::encrypt('secret-' . Str::random(32));

                // Update config
                $config->update([
                    'api_key' => $newConsId,
                    'secret_key' => $newSecret
                ]);

                // Log rotation completion
                AuditLog::create([
                    'user_name' => auth()->user()->name,
                    'action' => 'bpjs_key_rotation_completed',
                    'resource_type' => 'api_integration',
                    'description' => 'BPJS API key rotation completed successfully',
                    'level' => 'info',
                    'old_values' => null,
                    'new_values' => ['status' => 'keys_rotated'],
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent()
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Kunci API BPJS berhasil diputar',
                'data' => [
                    'rotated_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error rotating BPJS key', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            // Log error
            AuditLog::create([
                'user_name' => auth()->user()->name ?? 'System',
                'action' => 'bpjs_key_rotation_failed',
                'resource_type' => 'api_integration',
                'description' => 'BPJS API key rotation failed: ' . $e->getMessage(),
                'level' => 'error',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memutar kunci API BPJS'
            ], 500);
        }
    }

    /**
     * Rotate SATUSEHAT API Key
     */
    public function rotateSatusehatKey(): JsonResponse
    {
        try {
            DB::transaction(function () {
                $config = OnehealthConfig::where('status', 'active')->first();
                if (!$config) {
                    throw new \Exception('SATUSEHAT configuration not found');
                }

                // Log key rotation start
                AuditLog::create([
                    'user_name' => auth()->user()->name,
                    'action' => 'satusehat_key_rotation_started',
                    'resource_type' => 'api_integration',
                    'description' => 'SATUSEHAT API key rotation initiated',
                    'level' => 'info',
                    'old_values' => ['status' => 'current_keys'],
                    'new_values' => null,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent()
                ]);

                // Generate new OAuth credentials
                $newClientId = 'client-' . Str::random(16);
                $newClientSecret = Crypt::encrypt('secret-' . Str::random(32));

                // Update config
                $config->update([
                    'client_id' => $newClientId,
                    'client_secret' => $newClientSecret
                ]);

                // Clear cache for old token
                $oldCacheKey = "satusehat_token_{$config->client_id}";
                Cache::forget($oldCacheKey);

                // Log rotation completion
                AuditLog::create([
                    'user_name' => auth()->user()->name,
                    'action' => 'satusehat_key_rotation_completed',
                    'resource_type' => 'api_integration',
                    'description' => 'SATUSEHAT API key rotation completed successfully',
                    'level' => 'info',
                    'old_values' => null,
                    'new_values' => ['status' => 'keys_rotated'],
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent()
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Kunci API SATUSEHAT berhasil diputar',
                'data' => [
                    'rotated_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error rotating SATUSEHAT key', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            // Log error
            AuditLog::create([
                'user_name' => auth()->user()->name ?? 'System',
                'action' => 'satusehat_key_rotation_failed',
                'resource_type' => 'api_integration',
                'description' => 'SATUSEHAT API key rotation failed: ' . $e->getMessage(),
                'level' => 'error',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memutar kunci API SATUSEHAT'
            ], 500);
        }
    }

    /**
     * Enhanced BPJS connection test with service-specific testing
     */
    public function testBpjsConnection(Request $request): JsonResponse
    {
        $request->validate([
            'service' => 'nullable|in:vclaim,pcare,antrean,apotek'
        ]);

        $service = $request->input('service', 'vclaim');
        $startTime = microtime(true);

        try {
            $config = BpjsConfiguration::where('is_active', true)->first();

            if (!$config) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konfigurasi BPJS tidak ditemukan'
                ], 404);
            }

            $endpoints = [
                'vclaim' => '/vclaim-rest/referensi/diagnosa/1',
                'pcare' => '/pcare-rest/v1/diagnosa',
                'antrean' => '/antrean/ambilantrean/status',
                'apotek' => '/apotek/mappingobat',
            ];

            $endpoint = $endpoints[$service] ?? $endpoints['vclaim'];

            // Test basic connectivity
            $response = Http::timeout(30)
                ->withHeaders([
                    'X-Cons-ID' => decrypt($config->api_key),
                    'X-Timestamp' => now()->timestamp,
                    'X-Signature' => $this->generateBpjsSignature($config, decrypt($config->api_key)),
                    'Content-Type' => 'application/json'
                ])
                ->get($config->api_endpoint . $endpoint);

            $responseTime = round((microtime(true) - $startTime) * 1000);

            $this->logApiRequest(
                'bpjs',
                "{$service}_test",
                'GET',
                null,
                $response->successful() ? ['status' => 'success', 'service' => $service] : null,
                $response->status(),
                $responseTime,
                $response->successful() ? null : $response->body()
            );

            if ($response->successful()) {
                // Check if response is valid JSON from BPJS
                $responseData = $response->json();
                $isValidResponse = isset($responseData['metaData']['code']) || isset($responseData['response']);

                return response()->json([
                    'success' => true,
                    'message' => "Koneksi BPJS {$service} berhasil",
                    'data' => [
                        'service' => $service,
                        'status_code' => $response->status(),
                        'response_time' => $responseTime,
                        'is_valid_response' => $isValidResponse,
                        'message' => "API {$service} dapat diakses"
                    ]
                ]);
            } else {
                $errorData = $response->json();

                return response()->json([
                    'success' => false,
                    'message' => "Koneksi BPJS {$service} gagal",
                    'data' => [
                        'service' => $service,
                        'status_code' => $response->status(),
                        'response_time' => $responseTime,
                        'error' => isset($errorData['response']) ? $errorData['response'] : $response->body(),
                        'meta_data' => $errorData['metaData'] ?? null
                    ]
                ], 400);
            }
        } catch (\Exception $e) {
            $responseTime = round((microtime(true) - $startTime) * 1000);

            $this->logApiRequest('bpjs', "{$service}_test", 'GET', null, null, null, $responseTime, $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => "Error testing BPJS {$service} connection",
                'data' => [
                    'service' => $service,
                    'response_time' => $responseTime,
                    'error' => $e->getMessage()
                ]
            ], 500);
        }
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
