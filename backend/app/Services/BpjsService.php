<?php

namespace App\Services;

use App\Models\BpjsConfiguration;
use App\Models\BpjsIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class BpjsService
{
    protected ?BpjsConfiguration $config;

    public function __construct()
    {
        $this->config = BpjsConfiguration::where('is_active', true)->first();
    }

    /**
     * Generate BPJS API signature
     */
    protected function generateSignature(string $endpoint, string $method = 'GET'): string
    {
        if (!$this->config) {
            throw new Exception('BPJS configuration not found');
        }

        $timestamp = time();
        $data = $this->config->cons_id . '&' . $timestamp;

        if ($method === 'POST' || $method === 'PUT') {
            $data .= '&' . $endpoint;
        }

        return hash_hmac('sha256', $data, $this->config->secret_key);
    }

    /**
     * Make authenticated request to BPJS API
     */
    protected function makeRequest(string $endpoint, string $method = 'GET', array $data = []): array
    {
        $timestamp = time();
        $signature = $this->generateSignature($endpoint, $method);
        $url = $this->config->base_url . $endpoint;

        $startTime = microtime(true);

        try {
            $httpClient = Http::timeout(30)
                ->withHeaders([
                    'X-Cons-ID' => $this->config->cons_id,
                    'X-Timestamp' => $timestamp,
                    'X-Signature' => $signature,
                    'Content-Type' => 'application/json',
                ]);

            $response = match ($method) {
                'GET' => $httpClient->get($url),
                'POST' => $httpClient->post($url, $data),
                'PUT' => $httpClient->put($url, $data),
                'DELETE' => $httpClient->delete($url),
                default => throw new Exception("Unsupported HTTP method: {$method}")
            };

            $endTime = microtime(true);
            $responseTime = round(($endTime - $startTime) * 1000, 2);

            // Log the API interaction
            BpjsIntegration::create([
                'service_type' => $this->extractServiceType($endpoint),
                'endpoint' => $endpoint,
                'request_data' => json_encode($data),
                'response_data' => $response->body(),
                'status' => $response->successful() ? 'success' : 'error',
                'response_time_ms' => $responseTime,
                'user_id' => auth()->id(),
                'error_message' => $response->successful() ? null : $response->body(),
            ]);

            if ($response->successful()) {
                $responseData = $response->json();

                // Check BPJS response structure
                if (isset($responseData['metaData']['code']) && $responseData['metaData']['code'] === 200) {
                    return [
                        'success' => true,
                        'data' => $responseData['response'] ?? $responseData,
                        'meta' => $responseData['metaData'] ?? null,
                        'response_time' => $responseTime
                    ];
                } else {
                    return [
                        'success' => false,
                        'error' => $responseData['metaData']['message'] ?? 'BPJS API error',
                        'code' => $responseData['metaData']['code'] ?? null,
                        'response_time' => $responseTime
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'error' => 'HTTP ' . $response->status() . ': ' . $response->body(),
                    'code' => $response->status(),
                    'response_time' => $responseTime
                ];
            }

        } catch (Exception $e) {
            $endTime = microtime(true);
            $responseTime = round(($endTime - $startTime) * 1000, 2);

            // Log failed request
            BpjsIntegration::create([
                'service_type' => $this->extractServiceType($endpoint),
                'endpoint' => $endpoint,
                'request_data' => json_encode($data),
                'status' => 'error',
                'response_time_ms' => $responseTime,
                'user_id' => auth()->id(),
                'error_message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'response_time' => $responseTime
            ];
        }
    }

    /**
     * Extract service type from endpoint
     */
    protected function extractServiceType(string $endpoint): string
    {
        if (str_contains($endpoint, '/sep/')) {
            return 'sep';
        } elseif (str_contains($endpoint, '/peserta/')) {
            return 'participant';
        } elseif (str_contains($endpoint, '/referensi/')) {
            return 'reference';
        } elseif (str_contains($endpoint, '/klaim/')) {
            return 'claim';
        }

        return 'general';
    }

    /**
     * Validate BPJS participant by NIK
     */
    public function validateParticipantByNik(string $nik): array
    {
        return $this->makeRequest("/v1/peserta/nik/{$nik}");
    }

    /**
     * Validate BPJS participant by BPJS number
     */
    public function validateParticipantByBpjsNumber(string $bpjsNumber): array
    {
        return $this->makeRequest("/v1/peserta/{$bpjsNumber}");
    }

    /**
     * Get participant details with additional info
     */
    public function getParticipantDetails(string $identifier, string $type = 'bpjs'): array
    {
        if ($type === 'nik') {
            return $this->validateParticipantByNik($identifier);
        } else {
            return $this->validateParticipantByBpjsNumber($identifier);
        }
    }

    /**
     * Create SEP via BPJS API
     */
    public function createSep(array $sepData): array
    {
        return $this->makeRequest('/v1/sep', 'POST', $sepData);
    }

    /**
     * Update SEP status
     */
    public function updateSepStatus(string $sepNumber, array $statusData): array
    {
        return $this->makeRequest("/v1/sep/{$sepNumber}", 'PUT', $statusData);
    }

    /**
     * Get SEP details
     */
    public function getSepDetails(string $sepNumber): array
    {
        return $this->makeRequest("/v1/sep/{$sepNumber}");
    }

    /**
     * Delete SEP
     */
    public function deleteSep(string $sepNumber): array
    {
        return $this->makeRequest("/v1/sep/{$sepNumber}", 'DELETE');
    }

    /**
     * Get reference data (poli, dokter, etc.)
     */
    public function getReferenceData(string $type, array $params = []): array
    {
        $endpoint = "/v1/referensi/{$type}";
        if (!empty($params)) {
            $queryString = http_build_query($params);
            $endpoint .= "?{$queryString}";
        }

        return $this->makeRequest($endpoint);
    }

    /**
     * Check API connectivity
     */
    public function testConnection(): array
    {
        try {
            $result = $this->makeRequest('/v1/sep');

            return [
                'success' => $result['success'],
                'message' => $result['success'] ? 'BPJS API connection successful' : 'BPJS API connection failed',
                'response_time' => $result['response_time'] ?? 0,
                'error' => $result['error'] ?? null
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'BPJS API connection failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get API statistics
     */
    public function getApiStatistics(): array
    {
        $today = today();

        return [
            'total_requests_today' => BpjsIntegration::whereDate('created_at', $today)->count(),
            'success_requests_today' => BpjsIntegration::whereDate('created_at', $today)->where('status', 'success')->count(),
            'failed_requests_today' => BpjsIntegration::whereDate('created_at', $today)->where('status', 'error')->count(),
            'average_response_time' => BpjsIntegration::whereDate('created_at', $today)->whereNotNull('response_time_ms')->avg('response_time_ms'),
            'last_request' => BpjsIntegration::latest('created_at')->first()?->created_at?->toISOString(),
        ];
    }
}
