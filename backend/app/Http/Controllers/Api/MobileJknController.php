<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MobileJknBooking;
use App\Models\Appointment;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class MobileJknController extends Controller
{
    /**
     * Check if Mobile JKN integration is properly configured
     */
    private function isConfigured(): bool
    {
        $enabled = config('integration.mobile_jkn.enabled', false);
        $kdppk = config('integration.mobile_jkn.kdppk');
        $consId = config('integration.mobile_jkn.cons_id');
        $secretKey = config('integration.mobile_jkn.secret_key');

        return $enabled && !empty($kdppk) && !empty($consId) && !empty($secretKey);
    }

    /**
     * Get configuration status
     */
    public function getConfigurationStatus(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'enabled' => config('integration.mobile_jkn.enabled', false),
                'configured' => $this->isConfigured(),
                'kdppk' => !empty(config('integration.mobile_jkn.kdppk')),
                'cons_id' => !empty(config('integration.mobile_jkn.cons_id')),
                'secret_key' => !empty(config('integration.mobile_jkn.secret_key')),
            ]
        ]);
    }

    /**
     * Sync bookings from BPJS Mobile JKN API
     */
    public function sync(Request $request): JsonResponse
    {
        // Check if Mobile JKN is configured
        if (!$this->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Mobile JKN integration is not configured. Please contact administrator.',
                'error' => 'MOBILE_JKN_NOT_CONFIGURED'
            ], 400);
        }

        try {
            $syncStart = Carbon::now();

            // Check last sync time to respect rate limits
            $cacheKey = 'last_mobile_jkn_sync';
            $lastSync = Cache::get($cacheKey, now()->subMinutes(16));

            if ($lastSync > now()->subMinutes(15)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sync too frequent, please wait ' . $lastSync->diffForHumans(now()->addMinutes(15), true)
                ], 429);
            }

            // Get sync configuration
            $syncDays = $request->get('sync_days', 3); // Default 3 days: H-0, H+1, H+2

            $newBookingsCount = 0;
            $errors = [];

            // Sync for each day
            for ($i = 0; $i < $syncDays; $i++) {
                $syncDate = now()->addDays($i)->format('Y-m-d');

                try {
                    $result = $this->syncBookingsForDate($syncDate);
                    $newBookingsCount += $result['new_count'];

                    if (!empty($result['errors'])) {
                        $errors = array_merge($errors, $result['errors']);
                    }
                } catch (\Exception $e) {
                    $errors[] = "Error syncing {$syncDate}: " . $e->getMessage();
                    Log::error('Mobile JKN sync error for date', [
                        'date' => $syncDate,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Update last sync time
            Cache::put($cacheKey, now(), 900); // 15 minutes

            $syncDuration = $syncStart->diffInSeconds(now());

            // Log the sync operation
            Log::info('Mobile JKN sync completed', [
                'new_bookings' => $newBookingsCount,
                'duration_seconds' => $syncDuration,
                'errors_count' => count($errors)
            ]);

            return response()->json([
                'success' => true,
                'message' => "Sync completed. {$newBookingsCount} new bookings added.",
                'data' => [
                    'new_bookings' => $newBookingsCount,
                    'sync_duration' => $syncDuration,
                    'synced_dates' => array_map(fn($i) => now()->addDays($i)->format('Y-m-d'), range(0, $syncDays - 1)),
                    'errors' => $errors
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Mobile JKN sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Sync failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync bookings for specific date
     */
    private function syncBookingsForDate(string $date): array
    {
        // Simulate BPJS API call
        // In real implementation, this would call BPJS Antrean API
        $bpjsBookings = $this->fetchBpjsBookings($date);

        $newCount = 0;
        $errors = [];

        foreach ($bpjsBookings as $bpjsBooking) {
            try {
                $result = DB::transaction(function () use ($bpjsBooking) {
                    // Check if booking already exists
                    $existing = MobileJknBooking::where('kode_booking', $bpjsBooking['kode_booking'])->first();

                    if ($existing) {
                        // Update existing if JKN data is newer
                        $existing->updateFromJknData($bpjsBooking);
                        $existing->markAsSynced();
                        return 'updated';
                    }

                    // Create new booking
                    $booking = MobileJknBooking::create($this->mapBpjsToBooking($bpjsBooking));
                    $booking->markAsSynced();
                    return 'created';
                });

                if ($result === 'created') {
                    $newCount++;
                }

                // Log API call
                $this->logApiCall('sync_booking', $bpjsBooking, ['result' => $result]);

            } catch (\Exception $e) {
                $errors[] = "Failed to process booking {$bpjsBooking['kode_booking']}: " . $e->getMessage();
            }
        }

        return [
            'new_count' => $newCount,
            'total_processed' => count($bpjsBookings),
            'errors' => $errors
        ];
    }

    /**
     * Mock BPJS API call - replace with actual implementation
     */
    private function fetchBpjsBookings(string $date): array
    {
        // Mock data for now - replace with actual BPJS API integration
        // This should include headers: X-cons-id, X-timestamp, X-signature

        $mockBookings = [
            [
                'kode_booking' => 'ABC123',
                'no_kartu' => '1234567890123456',
                'nik_pasien' => '1234567890123456',
                'tanggal_periksa' => $date,
                'jam_praktek' => '08:00',
                'kode_dokter' => 'DR001',
                'nama_dokter' => 'Dr. John Doe',
                'kode_poli' => 'POL001',
                'nama_poli' => 'Poli Umum',
                'jenis_kunjungan' => 1, // 1=rujukan, 2=kontrol
                'no_rujukan' => 'R123456',
                'estimasi_dilayani' => '08:30',
            ]
        ];

        return $mockBookings;
    }

    /**
     * Map BPJS data to booking fields
     */
    private function mapBpjsToBooking(array $bpjsData): array
    {
        return [
            'kode_booking' => $bpjsData['kode_booking'],
            'no_kartu' => $bpjsData['no_kartu'],
            'nik_pasien' => $bpjsData['nik_pasien'],
            'tanggal_periksa' => $bpjsData['tanggal_periksa'],
            'jam_praktek' => $bpjsData['jam_praktek'],
            'kode_dokter' => $bpjsData['kode_dokter'],
            'nama_dokter' => $bpjsData['nama_dokter'],
            'kode_poli' => $bpjsData['kode_poli'],
            'nama_poli' => $bpjsData['nama_poli'],
            'jenis_kunjungan' => $bpjsData['jenis_kunjungan'],
            'no_rujukan' => $bpjsData['no_rujukan'] ?? null,
            'estimasi_dilayani' => $bpjsData['estimasi_dilayani'] ?? null,
            'status' => 'pending',
            'jkn_data' => $bpjsData
        ];
    }

    /**
     * List bookings with filtering
     */
    public function list(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tanggal' => 'nullable|date',
            'status' => 'nullable|string|in:pending,approved,rejected,completed,cancelled',
            'poli' => 'nullable|string',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = MobileJknBooking::with('patient');

        // Apply filters
        if ($request->has('tanggal')) {
            $query->whereDate('tanggal_periksa', $request->tanggal);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('poli')) {
            $query->where('kode_poli', $request->poli);
        }

        // Default ordering
        $query->orderBy('tanggal_periksa')
              ->orderBy('jam_praktek');

        $bookings = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        // Transform for response
        $transformedBookings = $bookings->through(function ($booking) {
            return [
                'id' => $booking->id,
                'kode_booking' => $booking->kode_booking,
                'no_kartu' => $booking->no_kartu,
                'patient_name' => $booking->patient_name,
                'tanggal_periksa' => $booking->tanggal_periksa,
                'jam_praktek' => $booking->jam_praktek,
                'kode_dokter' => $booking->kode_dokter,
                'nama_dokter' => $booking->nama_dokter,
                'kode_poli' => $booking->kode_poli,
                'nama_poli' => $booking->nama_poli,
                'jenis_kunjungan' => $booking->jenis_kunjungan,
                'no_rujukan' => $booking->no_rujukan,
                'estimasi_dilayani' => $booking->estimasi_dilayani,
                'status' => $booking->status,
                'status_color' => $booking->status_color,
                'reason_rejected' => $booking->reason_rejected,
                'synced_at' => $booking->synced_at,
                'created_at' => $booking->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedBookings
        ]);
    }

    /**
     * Approve booking
     */
    public function approve(Request $request, $bookingId): JsonResponse
    {
        $booking = MobileJknBooking::findOrFail($bookingId);

        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Booking can only be approved if status is pending'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'slot_available' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check slot availability (simplified - in real implementation check doctor schedule)
        if (!$request->slot_available) {
            return response()->json([
                'success' => false,
                'message' => 'Slot not available for this booking'
            ], 422);
        }

        try {
            DB::transaction(function () use ($booking) {
                // Call BPJS approval API
                $bpjsResponse = $this->callBpjsApi('approve', [
                    'kode_booking' => $booking->kode_booking,
                    'keterangan' => 'Approved by RS'
                ]);

                if (!$bpjsResponse['success']) {
                    throw new \Exception('BPJS approval failed: ' . $bpjsResponse['message']);
                }

                // Create local appointment (janji_temu)
                $appointment = Appointment::create([
                    'patient_id' => $booking->patient?->id,
                    'doctor_id' => $this->findDoctorByCode($booking->kode_dokter)?->id,
                    'poli_id' => $this->findPoliByCode($booking->kode_poli)?->id,
                    'appointment_date' => $booking->tanggal_periksa,
                    'appointment_time' => $booking->jam_praktek,
                    'status' => 'scheduled',
                    'source' => 'mobile_jkn',
                    'notes' => "Mobile JKN booking: {$booking->kode_booking}"
                ]);

                // Update booking status
                $booking->update([
                    'status' => 'approved',
                    'appointment_id' => $appointment->id // Assuming we add this field
                ]);

                // Log API call
                $this->logApiCall('approve', $booking, $bpjsResponse);
            });

            return response()->json([
                'success' => true,
                'message' => 'Booking approved successfully',
                'data' => [
                    'booking_id' => $booking->id,
                    'status' => 'approved'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Booking approval failed', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Approval failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject booking
     */
    public function reject(Request $request, $bookingId): JsonResponse
    {
        $booking = MobileJknBooking::findOrFail($bookingId);

        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Booking can only be rejected if status is pending'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::transaction(function () use ($booking, $request) {
                // Call BPJS rejection API
                $bpjsResponse = $this->callBpjsApi('reject', [
                    'kode_booking' => $booking->kode_booking,
                    'alasan_batal' => $request->reason
                ]);

                if (!$bpjsResponse['success']) {
                    throw new \Exception('BPJS rejection failed: ' . $bpjsResponse['message']);
                }

                // Update booking
                $booking->update([
                    'status' => 'rejected',
                    'reason_rejected' => $request->reason
                ]);

                // Log API call
                $this->logApiCall('reject', $booking, $bpjsResponse);
            });

            return response()->json([
                'success' => true,
                'message' => 'Booking rejected successfully',
                'data' => [
                    'booking_id' => $booking->id,
                    'status' => 'rejected',
                    'reason' => $request->reason
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Booking rejection failed', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Rejection failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check-in patient (convert to registration)
     */
    public function checkin($bookingId): JsonResponse
    {
        $booking = MobileJknBooking::findOrFail($bookingId);

        if ($booking->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Only approved bookings can be checked in'
            ], 422);
        }

        try {
            $queueNumber = DB::transaction(function () use ($booking) {
                // Check if already converted
                if ($booking->registration_id) { // Assuming we add this field
                    throw new \Exception('Booking already converted to registration');
                }

                // Create registration
                $registration = Registration::create([
                    'patient_id' => $booking->patient?->id,
                    'doctor_id' => $this->findDoctorByCode($booking->kode_dokter)?->id,
                    'poli_id' => $this->findPoliByCode($booking->kode_poli)?->id,
                    'registration_date' => $booking->tanggal_periksa,
                    'status' => 'checked-in',
                    'source' => 'mobile_jkn'
                ]);

                // Generate queue number
                $queueNumber = $this->generateQueueNumber($registration);

                // Update booking
                $booking->update([
                    'status' => 'completed',
                    'registration_id' => $registration->id // Assuming we add this field
                ]);

                return $queueNumber;
            });

            return response()->json([
                'success' => true,
                'message' => 'Patient checked in successfully',
                'data' => [
                    'booking_id' => $booking->id,
                    'queue_number' => $queueNumber,
                    'status' => 'completed'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Check-in failed', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Check-in failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get booking details
     */
    public function show($bookingId): JsonResponse
    {
        $booking = MobileJknBooking::with('patient')->findOrFail($bookingId);

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    /**
     * Call BPJS API
     */
    private function callBpjsApi(string $action, array $data): array
    {
        // Mock implementation - replace with actual BPJS API calls

        // Generate mock signature
        $timestamp = now()->timestamp;
        $consId = config('bpjs.cons_id');
        $secretKey = config('bpjs.secret_key');

        $signature = hash_hmac('sha256', $consId . "&" . $timestamp, $secretKey);

        $headers = [
            'X-cons-id' => $consId,
            'X-timestamp' => $timestamp,
            'X-signature' => $signature,
            'Content-Type' => 'application/json'
        ];

        // Mock successful response
        $response = [
            'success' => true,
            'message' => 'OK',
            'data' => ['status' => 'success']
        ];

        // Log the API call
        Log::info('BPJS API call', [
            'action' => $action,
            'data' => $data,
            'response' => $response
        ]);

        return $response;
    }

    /**
     * Log API call to api_logs table
     */
    private function logApiCall(string $action, $requestData, $responseData = null)
    {
        \App\Models\ApiLog::create([
            'endpoint' => 'bpjs/mobile-jkn/' . $action,
            'method' => 'POST',
            'request_data' => json_encode($requestData),
            'response_data' => json_encode($responseData),
            'status_code' => $responseData['success'] ? 200 : 400,
            'duration_ms' => 500, // Mock duration
            'user_id' => auth()->id()
        ]);
    }

    /**
     * Find doctor by code
     */
    private function findDoctorByCode(string $kode_dokter)
    {
        return \App\Models\Doctor::where('code', $kode_dokter)->first();
    }

    /**
     * Find poli by code
     */
    private function findPoliByCode(string $kode_poli)
    {
        return \App\Models\Poli::where('code', $kode_poli)->first();
    }

    /**
     * Generate queue number
     */
    private function generateQueueNumber(Registration $registration): string
    {
        $date = $registration->registration_date->format('Ymd');
        $poliPrefix = $registration->poli->kode ?? 'U';

        $existingNumbers = Registration::whereDate('registration_date', $registration->registration_date)
            ->where('poli_id', $registration->poli_id)
            ->whereNotNull('queue_number')
            ->pluck('queue_number');

        $nextNumber = $existingNumbers->isEmpty() ? 1 : ($existingNumbers->max() + 1);

        return $date . $poliPrefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}
