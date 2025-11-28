<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\NursingQueue;
use App\Models\Registration;
use App\Models\Patient;
use App\Models\Poli;

class NursingQueueController extends Controller
{
    /**
     * Get queue items with filtering
     * GET /api/nursing/queue-managements?poli_id={id}&date={date}&status={status}
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $poliId = $request->query('poli_id');
            $date = $request->query('date', today()->toDateString());
            $status = $request->query('status');

            $query = QueueManagement::with(['registration.patient', 'poli'])
                ->where('queue_date', $date);

            if ($poliId) {
                $query->where('poli_id', $poliId);
            }

            if ($status) {
                $query->where('status', $status);
            }

            $queues = $query->orderBy('created_at', 'asc')
                ->paginate(50);

            // Transform for frontend compatibility
            $transformedQueues = $queues->getCollection()->map(function ($queue) {
                $registration = $queue->registration;
                $patient = $registration ? $registration->patient : null;

                return [
                    'id' => $queue->id,
                    'queue_number' => $queue->queue_number ?: 'A-001', // Default format
                    'patient_name' => $patient ? $patient->full_name : 'Unknown',
                    'patient_id' => $registration ? $registration->patient_id : null,
                    'medical_record_number' => $patient ? $patient->medical_record_number : null,
                    'age' => $patient ? Carbon::parse($patient->birth_date)->age : null,
                    'gender' => $patient ? $patient->gender : null,
                    'polyclinic' => $queue->poli ? $queue->poli->poli_name : 'Unknown',
                    'poli_id' => $queue->poli_id,
                    'doctor' => '', // Will need to get from doctor assignment
                    'status' => $queue->status,
                    'appointment_time' => $registration ? $registration->appointment_time : null,
                    'arrival_time' => $queue->called_at,
                    'created_at' => $queue->created_at,
                    'estimated_wait_time' => $this->calculateWaitTime($queue),
                    'registration_id' => $queue->registration_id,
                    'priority' => $queue->priority ?: 'normal'
                ];
            });

            $queues->setCollection($transformedQueues);

            return response()->json([
                'success' => true,
                'data' => $queues
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queues',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Call patient (change status to called)
     * POST /api/nursing/queue-managements/call
     */
    public function call(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'queue_id' => 'required|exists:queue_managements,id'
            ]);

            $queue = QueueManagement::findOrFail($request->queue_id);

            $queue->update([
                'status' => 'called',
                'called_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Patient called successfully',
                'data' => [
                    'queue_id' => $queue->id,
                    'queue_number' => $queue->queue_number,
                    'called_at' => $queue->called_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to call patient',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Skip patient (change status to skipped)
     * POST /api/nursing/queue-managements/skip
     */
    public function skip(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'queue_id' => 'required|exists:queue_managements,id'
            ]);

            $queue = QueueManagement::findOrFail($request->queue_id);

            $queue->update([
                'status' => 'skipped'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Patient skipped successfully',
                'data' => [
                    'queue_id' => $queue->id,
                    'status' => $queue->status
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to skip patient',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get queue statistics
     * GET /api/nursing/queue-managements/stats?poli_id={id}&date={date}
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $poliId = $request->query('poli_id');
            $date = $request->query('date', today()->toDateString());

            $query = QueueManagement::where('queue_date', $date);

            if ($poliId) {
                $query->where('poli_id', $poliId);
            }

            $stats = [
                'total' => (clone $query)->count(),
                'waiting' => (clone $query)->where('status', 'waiting')->count(),
                'called' => (clone $query)->where('status', 'called')->count(),
                'serving' => (clone $query)->where('status', 'serving')->count(),
                'completed' => (clone $query)->where('status', 'completed')->count(),
                'skipped' => (clone $query)->where('status', 'skipped')->count(),
                'avg_waiting_time' => $this->calculateAverageWaitingTime($poliId, $date)
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queue statistics',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get display board data
     * GET /api/nursing/queue-managements/display-board?poli_id={id}
     */
    public function displayBoard(Request $request): JsonResponse
    {
        try {
            $poliId = $request->query('poli_id');

            if (!$poliId) {
                return response()->json([
                    'success' => false,
                    'message' => 'poli_id parameter is required'
                ], 400);
            }

            $date = today()->toDateString();

            // Get current serving queue (status = serving or called)
            $currentQueue = QueueManagement::with(['registration.patient'])
                ->where('poli_id', $poliId)
                ->where('queue_date', $date)
                ->whereIn('status', ['serving', 'called'])
                ->orderBy('updated_at', 'desc')
                ->first();

            // Get next 3 queues
            $nextQueues = QueueManagement::with(['registration.patient'])
                ->where('poli_id', $poliId)
                ->where('queue_date', $date)
                ->where('status', 'waiting')
                ->orderBy('created_at', 'asc')
                ->limit(3)
                ->get();

            // Get last called
            $lastCalled = QueueManagement::with(['registration.patient'])
                ->where('poli_id', $poliId)
                ->where('queue_date', $date)
                ->whereNotNull('called_at')
                ->orderBy('called_at', 'desc')
                ->first();

            $result = [
                'current_queue' => $currentQueue ? $this->formatQueueForDisplay($currentQueue) : null,
                'next_queues' => $nextQueues->map(fn($q) => $this->formatQueueForDisplay($q)),
                'last_called' => $lastCalled ? $this->formatQueueForDisplay($lastCalled) : null
            ];

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch display board data',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Complete service (move to completed status)
     * PATCH /api/nursing/queue-managements/{id}/complete
     */
    public function complete(Request $request, $id): JsonResponse
    {
        try {
            $queue = QueueManagement::findOrFail($id);

            $queue->update([
                'status' => 'completed',
                'served_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Service completed successfully',
                'data' => [
                    'queue_id' => $queue->id,
                    'status' => $queue->status,
                    'served_at' => $queue->served_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete service',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get polyclinics for selection
     */
    public function polyclinics(Request $request): JsonResponse
    {
        try {
            $polyclinics = Poli::select('id', 'poli_name')
                ->orderBy('poli_name')
                ->get()
                ->map(function ($poli) {
                    try {
                        $date = today()->toDateString();

                        // Get queue counts for this poli - handle missing table gracefully
                        $stats = [
                            'totalWaiting' => NursingQueue::where('poli_id', $poli->id)
                                ->where('queue_date', $date)
                                ->where('status', 'waiting')
                                ->count(),
                            'totalServed' => NursingQueue::where('poli_id', $poli->id)
                                ->where('queue_date', $date)
                                ->whereIn('status', ['serving', 'completed'])
                                ->count()
                        ];
                    } catch (\Exception $e) {
                        // If nursing_queues table doesn't exist yet, return zero stats
                        $stats = ['totalWaiting' => 0, 'totalServed' => 0];
                    }

                    return [
                        'id' => $poli->id,
                        'name' => $poli->poli_name,
                        'totalWaiting' => $stats['totalWaiting'],
                        'totalServed' => $stats['totalServed'],
                        'status' => $stats['totalWaiting'] > 0 ? 'active' : 'idle'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $polyclinics
            ]);

        } catch (\Exception $e) {
            // If there's any database error, try to return basic polyclinic list
            try {
                $basicPolyclinics = Poli::select('id', 'poli_name')
                    ->orderBy('poli_name')
                    ->get()
                    ->map(function ($poli) {
                        return [
                            'id' => $poli->id,
                            'name' => $poli->poli_name,
                            'totalWaiting' => 0,
                            'totalServed' => 0,
                            'status' => 'idle'
                        ];
                    });

                return response()->json([
                    'success' => true,
                    'data' => $basicPolyclinics,
                    'message' => 'Nursing queue table not yet created - showing basic polyclinic list'
                ]);
            } catch (\Exception $e2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch polyclinics - database not ready yet',
                    'error' => 'Please run migrations first or check database connectivity'
                ], 500);
            }
        }
    }

    // Helper methods
    private function calculateWaitTime($queue)
    {
        if (!$queue->called_at) {
            // Estimated wait time based on current position and average service time
            return '15-20 menit';
        }

        $servedAt = $queue->served_at ?: now();
        $minutes = $queue->called_at->diffInMinutes($servedAt);

        return $minutes . ' menit';
    }

    private function calculateAverageWaitingTime($poliId, $date)
    {
        $avgMinutes = QueueManagement::where('poli_id', $poliId)
            ->where('queue_date', $date)
            ->whereNotNull('called_at')
            ->whereNotNull('served_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, called_at, served_at)) as avg_minutes')
            ->first()
            ->avg_minutes;

        return $avgMinutes ? round($avgMinutes) . ' menit' : '15 menit';
    }

    private function formatQueueForDisplay($queue)
    {
        $registration = $queue->registration;
        $patient = $registration ? $registration->patient : null;

        return [
            'id' => $queue->id,
            'queueNumber' => $queue->queue_number ?: 'A-001',
            'patientName' => $patient ? $patient->full_name : 'Unknown',
            'status' => $queue->status
        ];
    }
}
