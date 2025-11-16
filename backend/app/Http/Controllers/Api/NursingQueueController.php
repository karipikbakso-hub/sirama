<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class NursingQueueController extends Controller
{
    /**
     * Get all service units (polyclinics) with queue statistics
     */
    public function polyclinics(Request $request): JsonResponse
    {
        try {
            // Get active polyclinics with queue statistics for today
            $polyclinics = Registration::select('service_unit')
                ->whereDate('created_at', today())
                ->distinct()
                ->get()
                ->map(function ($poli) {
                    $registrations = Registration::with(['patient', 'doctor'])
                        ->where('service_unit', $poli->service_unit)
                        ->whereDate('created_at', today())
                        ->get();

                    $current = $registrations->where('status', 'sedang_diperiksa')->first();
                    $next = $registrations->where('status', 'dipanggil')->first();
                    $waiting = $registrations->whereIn('status', ['menunggu', 'dipanggil'])->count();
                    $served = $registrations->where('status', 'selesai')->count();

                    return [
                        'id' => $poli->service_unit,
                        'name' => $poli->service_unit,
                        'current_queue' => $current,
                        'next_queue' => $next,
                        'total_waiting' => $waiting,
                        'total_served' => $served,
                        'status' => 'active' // Could be dynamic based on doctor schedule
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $polyclinics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch polyclinics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get queue items for a specific polyclinic
     */
    public function show($serviceUnit): JsonResponse
    {
        try {
            $registrations = Registration::with(['patient', 'doctor', 'creator'])
                ->where('service_unit', $serviceUnit)
                ->whereDate('created_at', today())
                ->whereNotIn('status', ['selesai', 'batal'])
                ->orderBy('queue_order')
                ->orderBy('created_at')
                ->get()
                ->map(function ($registration) {
                    return [
                        'id' => $registration->id,
                        'queueNumber' => $registration->queue_number ?: $registration->registration_no,
                        'patientId' => $registration->patient_id,
                        'patientName' => $registration->patient->nama ?? '',
                        'medicalRecordNumber' => $registration->patient->no_rm ?? '',
                        'age' => $registration->patient->usia ?? 0,
                        'gender' => $registration->patient->jenis_kelamin ?? 'male',
                        'polyclinic' => $registration->service_unit,
                        'doctor' => $registration->doctor->name ?? '',
                        'appointmentTime' => $registration->created_at->format('Y-m-d H:i:s'),
                        'arrivalTime' => $registration->created_at->format('Y-m-d H:i:s'),
                        'status' => $registration->status,
                        'priority' => $this->determinePriority($registration),
                        'estimatedWaitTime' => $this->calculateWaitTime($registration),
                        'notes' => $registration->notes,
                        'registration_no' => $registration->registration_no,
                        'service_unit' => $registration->service_unit
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $registrations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queue items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Call next patient in queue for a polyclinic
     */
    public function callNext(Request $request, $serviceUnit): JsonResponse
    {
        try {
            // Find the next patient in queue
            $nextPatient = Registration::where('service_unit', $serviceUnit)
                ->where('status', 'menunggu')
                ->orderBy('queue_order')
                ->orderBy('created_at')
                ->first();

            if (!$nextPatient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada pasien dalam antrian'
                ], 404);
            }

            // Update status to called
            $nextPatient->update(['status' => 'dipanggil']);

            // Set current serving patient to completed
            $currentServing = Registration::where('service_unit', $serviceUnit)
                ->where('status', 'sedang_diperiksa')
                ->update(['status' => 'selesai']);

            return response()->json([
                'success' => true,
                'message' => 'Pasien berikutnya dipanggil',
                'data' => $nextPatient->load(['patient', 'doctor'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to call next patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark patient as being served
     */
    public function startServing(Request $request, Registration $registration): JsonResponse
    {
        try {
            // Check if another patient is currently being served
            $currentServing = Registration::where('service_unit', $registration->service_unit)
                ->where('status', 'sedang_diperiksa')
                ->where('id', '!=', $registration->id)
                ->exists();

            if ($currentServing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ada pasien lain yang sedang dilayani'
                ], 400);
            }

            $registration->update(['status' => 'sedang_diperiksa']);

            return response()->json([
                'success' => true,
                'message' => 'Pasien mulai dilayani',
                'data' => $registration->load(['patient', 'doctor'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start serving patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark patient service as completed
     */
    public function completeService(Request $request, Registration $registration): JsonResponse
    {
        try {
            $registration->update(['status' => 'selesai']);

            return response()->json([
                'success' => true,
                'message' => 'Layanan selesai',
                'data' => $registration->load(['patient', 'doctor'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Skip patient (will be called again later)
     */
    public function skipPatient(Request $request, Registration $registration): JsonResponse
    {
        try {
            $registration->update(['status' => 'menunggu']);

            // Move to end of queue - find max queue_order and add 1
            $maxOrder = Registration::where('service_unit', $registration->service_unit)
                ->whereDate('created_at', today())
                ->max('queue_order') ?? 0;

            $registration->update(['queue_order' => $maxOrder + 1]);

            return response()->json([
                'success' => true,
                'message' => 'Pasien dilewatkan',
                'data' => $registration->load(['patient', 'doctor'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to skip patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get queue statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $today = today();

            $stats = [
                'total_active_polyclinics' => Registration::whereDate('created_at', $today)->distinct('service_unit')->count('service_unit'),
                'total_patients_today' => Registration::whereDate('created_at', $today)->count(),
                'total_waiting' => Registration::whereDate('created_at', $today)->where('status', 'menunggu')->count(),
                'total_called' => Registration::whereDate('created_at', $today)->where('status', 'dipanggil')->count(),
                'total_being_served' => Registration::whereDate('created_at', $today)->where('status', 'sedang_diperiksa')->count(),
                'total_completed' => Registration::whereDate('created_at', $today)->where('status', 'selesai')->count(),
                'total_cancelled' => Registration::whereDate('created_at', $today)->where('status', 'batal')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queue statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function determinePriority(Registration $registration): string
    {
        // Determine priority based on arrival type or other criteria
        if ($registration->arrival_type === 'ugd' || $registration->arrival_type === 'igd') {
            return 'urgent';
        }
        return 'normal';
    }

    private function calculateWaitTime(Registration $registration): string
    {
        // Calculate estimated wait time based on position in queue
        switch ($registration->status) {
            case 'sedang_diperiksa':
                return 'Selesai';
            case 'dipanggil':
                return 'Sedang dipanggil';
            case 'menunggu':
                // Simple calculation - position * 10 minutes
                $position = Registration::where('service_unit', $registration->service_unit)
                    ->whereDate('created_at', today())
                    ->where('status', 'menunggu')
                    ->where('created_at', '<=', $registration->created_at)
                    ->count();
                $estimatedMinutes = $position * 10;
                return $estimatedMinutes . ' menit';
            default:
                return '-';
        }
    }
}
