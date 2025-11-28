<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Registration;
use App\Models\QueueManagement;
use App\Models\Patient;
use App\Models\Poli;

class PendaftaranDashboardController extends Controller
{
    /**
     * Get dashboard statistics for pendaftaran role
     */
    public function stats(): JsonResponse
    {
        try {
            $today = today();
            $yesterday = today()->subDay();

            // 1. Total Kunjungan Hari Ini
            $totalKunjunganHariIni = Registration::whereDate('created_at', $today)->count();

            // Breakdown by service type - using poli_id to determine service type
            $kunjunganRawatJalan = Registration::whereDate('created_at', $today)
                ->whereHas('poli', function($query) {
                    $query->where('nama_poli', 'not like', '%igd%');
                })
                ->count();

            $kunjunganIGD = Registration::whereDate('created_at', $today)
                ->whereHas('poli', function($query) {
                    $query->where('nama_poli', 'like', '%igd%');
                })
                ->count();

            $kunjunganKontrol = Registration::whereDate('created_at', $today)
                ->where('jenis_kunjungan', 'kontrol')
                ->count();

            // 2. Pasien Dalam Antrian
            $pasienDalamAntrian = QueueManagement::where('status', 'active')
                ->whereDate('created_at', $today)
                ->count();

            // 3. Pasien Baru Hari Ini
            $pasienBaruHariIni = Registration::whereDate('created_at', $today)
                ->whereHas('patient', function($query) use ($today) {
                    $query->whereDate('created_at', $today);
                })
                ->count();

            $pasienBaruKemarin = Registration::whereDate('created_at', $yesterday)
                ->whereHas('patient', function($query) use ($yesterday) {
                    $query->whereDate('created_at', $yesterday);
                })
                ->count();

            // Calculate trend for new patients
            $pasienBaruTrend = $pasienBaruKemarin > 0 ?
                (($pasienBaruHariIni - $pasienBaruKemarin) / $pasienBaruKemarin) * 100 : 0;

            // 4. Rata-rata Waktu Layanan
            $avgWaktuLayanan = DB::table('queue_managements')
                ->whereDate('created_at', $today)
                ->whereNotNull('estimated_wait_time')
                ->avg('estimated_wait_time') ?? 15; // Default 15 minutes

            return response()->json([
                'success' => true,
                'data' => [
                    'totalKunjunganHariIni' => [
                        'value' => $totalKunjunganHariIni,
                        'breakdown' => [
                            'rawatJalan' => $kunjunganRawatJalan,
                            'igd' => $kunjunganIGD,
                            'kontrol' => $kunjunganKontrol
                        ]
                    ],
                    'pasienDalamAntrian' => [
                        'value' => $pasienDalamAntrian,
                        'trend' => round($this->calculateQueueTrend(), 1)
                    ],
                    'pasienBaruHariIni' => [
                        'value' => $pasienBaruHariIni,
                        'vsKemarin' => $pasienBaruKemarin,
                        'trend' => round($pasienBaruTrend, 1)
                    ],
                    'rataRataWaktuLayanan' => [
                        'value' => round($avgWaktuLayanan, 1),
                        'target' => 15, // minutes
                        'status' => $avgWaktuLayanan <= 15 ? 'good' : 'warning'
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get kunjungan chart data for 7 days
     */
    public function kunjunganChart(): JsonResponse
    {
        try {
            $data = [];
            $labels = [];

            // Generate data for last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $date = today()->subDays($i);
                $dateString = $date->format('Y-m-d');

                // Indonesian day names
                $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                $dayOfWeek = (int) $date->format('w'); // 0 = Sunday
                $indonesianDay = $dayNames[$dayOfWeek];

                $labels[] = $indonesianDay;

                // Count registrations by type
                $rawatJalan = Registration::whereDate('created_at', $date)
                    ->whereHas('poli', function($query) {
                        $query->where('nama_poli', 'not like', '%igd%');
                    })
                    ->count();

                $igd = Registration::whereDate('created_at', $date)
                    ->whereHas('poli', function($query) {
                        $query->where('nama_poli', 'like', '%igd%');
                    })
                    ->count();

                $kontrol = Registration::whereDate('created_at', $date)
                    ->where('jenis_kunjungan', 'kontrol')
                    ->count();

                $data[] = [
                    'date' => $dateString,
                    'day' => $indonesianDay,
                    'rawatJalan' => $rawatJalan,
                    'igd' => $igd,
                    'kontrol' => $kontrol,
                    'total' => $rawatJalan + $igd + $kontrol
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'labels' => $labels,
                    'data' => $data
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch kunjungan chart data',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get realtime queue status
     */
    public function antrianRealtime(): JsonResponse
    {
        try {
            $today = today();

            // Queue status counts
            $waiting = QueueManagement::where('status', 'active')
                ->whereDate('created_at', $today)
                ->count();

            $called = QueueManagement::where('status', 'called')
                ->whereDate('created_at', $today)
                ->count();

            $completed = QueueManagement::where('status', 'completed')
                ->whereDate('created_at', $today)
                ->count();

            $cancelled = QueueManagement::where('status', 'cancelled')
                ->whereDate('created_at', $today)
                ->count();

            // Recent queue items (last 10)
            $recentQueues = QueueManagement::with(['doctor'])
                ->whereDate('created_at', $today)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($queue) {
                    return [
                        'id' => $queue->id,
                        'queueNumber' => $queue->current_number,
                        'patientName' => 'Patient ' . $queue->id, // Placeholder
                        'doctorName' => $queue->doctor->name ?? 'Dokter',
                        'status' => $queue->status,
                        'estimatedTime' => $queue->estimated_wait_time ?? 15,
                        'createdAt' => $queue->created_at->toISOString()
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => [
                        'waiting' => $waiting,
                        'called' => $called,
                        'completed' => $completed,
                        'cancelled' => $cancelled
                    ],
                    'recentQueues' => $recentQueues,
                    'lastUpdated' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch realtime queue data',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get today's registered patients
     */
    public function pasienHariIni(): JsonResponse
    {
        try {
            $today = today();

            // First, get registrations without eager loading to avoid relationship errors
            $registrations = Registration::whereDate('created_at', $today)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Then manually load relationships with error handling
            $patients = $registrations->map(function ($registration) {
                try {
                    $patient = $registration->patient; // Load patient relationship
                    $doctor = $registration->doctor;   // Load doctor relationship

                    return [
                        'id' => $registration->id,
                        'registrationNumber' => $registration->registration_no ?? 'REG-' . $registration->id,
                        'patientName' => $patient ? ($patient->name ?? 'Unknown') : 'Unknown',
                        'patientNik' => $patient ? ($patient->nik ?? '') : '',
                        'serviceType' => $registration->service_unit ?? 'Umum',
                        'doctorName' => $doctor ? ($doctor->name ?? 'Dokter') : 'Dokter',
                        'status' => $registration->status ?? 'registered',
                        'queueNumber' => $registration->queue_number ?? $registration->id,
                        'registeredAt' => $registration->created_at ? $registration->created_at->toISOString() : now()->toISOString(),
                        'patientId' => $patient ? $patient->id : null,
                        'doctorId' => $doctor ? $doctor->id : null
                    ];
                } catch (\Exception $e) {
                    // If relationship fails, return basic data
                    return [
                        'id' => $registration->id,
                        'registrationNumber' => $registration->registration_no ?? 'REG-' . $registration->id,
                        'patientName' => 'Unknown',
                        'patientNik' => '',
                        'serviceType' => $registration->service_unit ?? 'Umum',
                        'doctorName' => 'Dokter',
                        'status' => $registration->status ?? 'registered',
                        'queueNumber' => $registration->queue_number ?? $registration->id,
                        'registeredAt' => $registration->created_at ? $registration->created_at->toISOString() : now()->toISOString(),
                        'patientId' => null,
                        'doctorId' => null
                    ];
                }
            });

            return response()->json([
                'success' => true,
                'data' => $patients,
                'count' => $patients->count()
            ]);

        } catch (\Exception $e) {
            // If all fails, return empty array instead of error
            return response()->json([
                'success' => true,
                'data' => [],
                'count' => 0,
                'message' => 'No patients found for today',
                'error' => config('app.debug') ? $e->getMessage() : null
            ]);
        }
    }

    /**
     * Get all queues for monitoring (grouped by poli)
     */
    public function all(Request $request): JsonResponse
    {
        try {
            $showCompleted = $request->query('show_completed', 'false') === 'true';
            $statusFilter = $request->query('status', 'all');
            $poliFilter = $request->query('poli', 'all');

            $today = today();

            // Build query with filters
            $query = QueueManagement::with(['registration.patient'])
                ->whereDate('created_at', $today);

            // Apply status filter
            if ($statusFilter !== 'all') {
                $query->where('status', $statusFilter);
            } elseif (!$showCompleted) {
                // Hide completed by default if show_completed is false
                $query->where('status', '!=', 'completed');
            }

            // Apply poli filter if specified
            if ($poliFilter !== 'all') {
                $query->where('poli_id', $poliFilter);
            }

            // Get all queues
            $queues = $query->orderBy('priority', 'desc')
                ->orderBy('created_at', 'asc')
                ->get();

            // Group by poli and calculate stats
            $polies = [];
            $stats = [
                'total_waiting' => 0,
                'total_called' => 0,
                'total_in_progress' => 0,
                'total_completed' => 0,
                'total_cancelled' => 0,
                'total_skipped' => 0,
                'avg_wait_time' => 15, // Default
                'longest_wait' => [
                    'queue_id' => null,
                    'wait_time' => 0
                ]
            ];

            // Get all active polies
            $activePolies = QueueManagement::select('poli_id')
                ->whereDate('created_at', $today)
                ->distinct()
                ->pluck('poli_id')
                ->filter()
                ->toArray();

            if (empty($activePolies)) {
                // Fallback to all polies with some activity in last 30 days
                $activePolies = QueueManagement::select('poli_id')
                    ->where('created_at', '>=', today()->subDays(30))
                    ->distinct()
                    ->pluck('poli_id')
                    ->filter()
                    ->take(10) // Limit to 10 polies
                    ->toArray();
            }

            foreach ($activePolies as $poliId) {
                $poliQueues = $queues->where('poli_id', $poliId);

                // Get poli info (fallback to default if not found)
                $poliInfo = DB::table('m_poli')->where('id', $poliId)->first();
                $poliName = $poliInfo ? $poliInfo->nama_poli : 'Poli ' . $poliId;
                $serviceUnit = $poliInfo ? $poliInfo->jenis_poli : 'Umum';

                // Calculate current serving (called or in_progress)
                $currentServing = $poliQueues->whereIn('status', ['called', 'in_progress'])->first();

                // Get waiting list (active queues after current serving)
                $waitingList = $poliQueues->where('status', 'active')
                    ->filter(function($queue) use ($currentServing) {
                        return !$currentServing || $queue->id !== $currentServing->id;
                    })
                    ->take(20) // Limit to prevent performance issues
                    ->values();

                // Next 3 from waiting list
                $next3 = $waitingList->take(3);

                // Calculate avg wait time for completed queues in this poli
                $avgWaitTime = $poliQueues->where('status', 'completed')
                    ->avg('estimated_wait_time') ?: 15;

                // Update overall stats
                $stats['total_waiting'] += $waitingList->count();
                $stats['total_called'] += $poliQueues->where('status', 'called')->count();
                $stats['total_in_progress'] += $poliQueues->where('status', 'in_progress')->count();
                $stats['total_completed'] += $poliQueues->where('status', 'completed')->count();
                $stats['total_cancelled'] += $poliQueues->where('status', 'cancelled')->count();
                $stats['total_skipped'] += $poliQueues->where('status', 'skipped')->count();

                // Check for longest wait time
                foreach ($poliQueues as $queue) {
                    $waitTime = $queue->estimated_wait_time ?? 15;
                    if ($waitTime > $stats['longest_wait']['wait_time']) {
                        $stats['longest_wait'] = [
                            'queue_id' => $queue->id,
                            'wait_time' => $waitTime
                        ];
                    }
                }

                // Transform queues for frontend
                $transformedQueues = $poliQueues->map(function($queue) {
                    return [
                        'id' => $queue->id,
                        'queue_number' => $queue->current_number ?? 'Q' . $queue->id,
                        'patient_id' => $queue->registration?->patient_id ?? $queue->id,
                        'registration_id' => $queue->registration_id ?? $queue->id,
                        'service_unit' => $queue->registration?->service_unit ?? 'Umum',
                        'poli_id' => $queue->poli_id,
                        'status' => $queue->status,
                        'created_at' => $queue->created_at->toISOString(),
                        'updated_at' => $queue->updated_at->toISOString(),
                        'estimated_wait_time' => $queue->estimated_wait_time ?? 15,
                        'called_at' => $queue->called_at?->toISOString(),
                        'completed_at' => $queue->completed_at?->toISOString(),
                        'patient' => $queue->registration?->patient ? [
                            'id' => $queue->registration->patient->id,
                            'mrn' => $queue->registration->patient->mrn ?? '',
                            'name' => $queue->registration->patient->name ?? 'Unknown',
                            'nik' => $queue->registration->patient->nik ?? ''
                        ] : [
                            'id' => $queue->id,
                            'mrn' => '',
                            'name' => 'Pasien ' . $queue->id,
                            'nik' => ''
                        ]
                    ];
                });

                $polies[$poliId] = [
                    'poli_id' => $poliId,
                    'poli_name' => $poliName,
                    'service_unit' => $serviceUnit,
                    'current_serving' => $currentServing ? $transformedQueues->find(function($q) use ($currentServing) {
                        return $q['id'] === $currentServing->id;
                    }) : null,
                    'waiting_list' => $waitingList->map(function($queue) use ($transformedQueues) {
                        return $transformedQueues->find(function($tq) use ($queue) {
                            return $tq['id'] === $queue->id;
                        });
                    })->filter()->values(),
                    'next_3' => $next3->map(function($queue) use ($transformedQueues) {
                        return $transformedQueues->find(function($tq) use ($queue) {
                            return $tq['id'] === $queue->id;
                        });
                    })->filter()->values(),
                    'avg_wait_time' => $avgWaitTime,
                    'stats' => [
                        'total_waiting' => $waitingList->count(),
                        'total_completed_today' => $poliQueues->where('status', 'completed')->count(),
                        'avg_wait_time' => $avgWaitTime
                    ]
                ];
            }

            // Calculate overall avg wait time
            $stats['avg_wait_time'] = $queues->avg('estimated_wait_time') ?: 15;

            return response()->json([
                'queues' => $transformedQueues->flatten(1)->values(),
                'stats' => $stats,
                'by_poli' => $polies,
                'last_updated' => now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queue data',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Calculate queue trend (simplified)
     */
    private function calculateQueueTrend(): float
    {
        $today = today();
        $yesterday = today()->subDay();

        $todayCount = QueueManagement::whereDate('created_at', $today)->count();
        $yesterdayCount = QueueManagement::whereDate('created_at', $yesterday)->count();

        if ($yesterdayCount == 0) return 0;

        return (($todayCount - $yesterdayCount) / $yesterdayCount) * 100;
    }
}
