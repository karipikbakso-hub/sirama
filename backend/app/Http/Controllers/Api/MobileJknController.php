<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MobileJknController extends Controller
{
    /**
     * Get Mobile JKN statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_registrations' => Patient::whereNotNull('bpjs_number')->count(),
                'active_users' => Patient::whereNotNull('bpjs_number')
                    ->where('status', 'active')->count(),
                'today_registrations' => Patient::whereNotNull('bpjs_number')
                    ->whereDate('created_at', now()->toDateString())->count(),
                'verification_success' => 97.8, // Placeholder - calculate from actual verification logs
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch Mobile JKN statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register patient for Mobile JKN.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'bpjs_number' => 'required|string|size:13|unique:patients,bpjs_number',
            'phone' => 'required|string|max:15',
            'email' => 'nullable|email|max:100',
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

            $patient = Patient::findOrFail($request->patient_id);

            // Update patient with BPJS and contact info
            $patient->update([
                'bpjs_number' => $request->bpjs_number,
                'phone' => $request->phone,
                'email' => $request->email,
                'status' => 'active',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Patient registered for Mobile JKN successfully',
                'data' => $patient
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to register patient for Mobile JKN',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify BPJS card.
     */
    public function verifyCard(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bpjs_number' => 'required|string|size:13',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $patient = Patient::where('bpjs_number', $request->bpjs_number)->first();

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'BPJS number not found'
                ], 404);
            }

            // Simulate verification process
            $isValid = $this->verifyBpjsCard($request->bpjs_number);

            if ($isValid) {
                return response()->json([
                    'success' => true,
                    'message' => 'BPJS card verified successfully',
                    'data' => [
                        'patient_id' => $patient->id,
                        'name' => $patient->name,
                        'bpjs_number' => $patient->bpjs_number,
                        'status' => 'active',
                        'verified_at' => now()->toISOString(),
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'BPJS card verification failed - card may be expired or invalid'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate QR code for registration.
     */
    public function generateQR(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'service_type' => 'required|string|in:registration,queue,appointment',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $patient = Patient::findOrFail($request->patient_id);

            // Generate QR code data
            $qrData = [
                'patient_id' => $patient->id,
                'bpjs_number' => $patient->bpjs_number,
                'service_type' => $request->service_type,
                'timestamp' => now()->toISOString(),
                'token' => $this->generateSecureToken(),
            ];

            // In a real implementation, you would generate an actual QR code image
            // For now, return the data that would be encoded in the QR
            $qrCode = base64_encode(json_encode($qrData));

            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'data' => [
                    'qr_code' => $qrCode,
                    'qr_data' => $qrData,
                    'expires_at' => now()->addMinutes(30)->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activities.
     */
    public function getActivities(Request $request): JsonResponse
    {
        try {
            // In a real implementation, you would have an activities/audit log table
            // For now, return mock activities based on recent patient registrations
            $activities = Patient::whereNotNull('bpjs_number')
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($patient) {
                    $actions = ['Berhasil daftar poli', 'Verifikasi kartu BPJS', 'Update nomor telepon', 'Berhasil daftar poli'];
                    $statuses = ['success', 'success', 'success', 'success', 'failed'];

                    return [
                        'id' => rand(1000, 9999),
                        'time' => now()->subMinutes(rand(1, 60))->format('H:i'),
                        'user' => $patient->name,
                        'action' => $actions[array_rand($actions)],
                        'status' => $statuses[array_rand($statuses)],
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get app features and usage stats.
     */
    public function getFeatures(): JsonResponse
    {
        try {
            $features = [
                [
                    'id' => 1,
                    'name' => 'Daftar Online',
                    'description' => 'Pendaftaran kunjungan tanpa antri',
                    'icon' => 'FaMobileAlt',
                    'status' => 'active',
                    'usage' => rand(1000, 1500),
                ],
                [
                    'id' => 2,
                    'name' => 'Verifikasi Kartu',
                    'description' => 'Validasi kartu BPJS secara digital',
                    'icon' => 'FaIdCard',
                    'status' => 'active',
                    'usage' => rand(800, 1200),
                ],
                [
                    'id' => 3,
                    'name' => 'Notifikasi Real-time',
                    'description' => 'Update status antrian via push notification',
                    'icon' => 'FaBell',
                    'status' => 'active',
                    'usage' => rand(600, 900),
                ],
                [
                    'id' => 4,
                    'name' => 'Riwayat Kunjungan',
                    'description' => 'Akses riwayat kesehatan digital',
                    'icon' => 'FaHistory',
                    'status' => 'beta',
                    'usage' => rand(300, 700),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $features
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch features',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update patient contact information.
     */
    public function updateContact(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'phone' => 'nullable|string|max:15',
            'email' => 'nullable|email|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $patient = Patient::findOrFail($request->patient_id);

            $patient->update([
                'phone' => $request->phone,
                'email' => $request->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Contact information updated successfully',
                'data' => $patient
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update contact information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify BPJS card (placeholder implementation).
     */
    private function verifyBpjsCard(string $bpjsNumber): bool
    {
        // Placeholder - implement actual BPJS card verification logic
        // This would typically call BPJS API to verify card validity

        // For demo purposes, consider cards starting with '000' as invalid
        return !str_starts_with($bpjsNumber, '000');
    }

    /**
     * Generate secure token for QR code.
     */
    private function generateSecureToken(): string
    {
        return bin2hex(random_bytes(16));
    }
}
