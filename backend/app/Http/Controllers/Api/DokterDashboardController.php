<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DokterDashboardController extends Controller
{
    public function summary(Request $request)
    {
        try {
            $doctorId = auth()->id();
            $today = Carbon::today();

            // Get today's registrations for this doctor
            $todayRegistrations = DB::table('t_registrasi')
                ->where('doctor_id', $doctorId)
                ->whereDate('tanggal_registrasi', $today)
                ->count();

            // Get current queue stats
            $queueStats = DB::table('queue_managements')
                ->where('doctor_id', $doctorId)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            // Get pending orders
            $pendingLabOrders = DB::table('t_pesanan_lab')
                ->where('doctor_id', $doctorId)
                ->where('status', 'pending')
                ->count();

            $pendingRadiologyOrders = DB::table('t_pesanan_radiologi')
                ->where('doctor_id', $doctorId)
                ->where('status', 'pending')
                ->count();

            // Get completed consultations today
            $completedToday = DB::table('t_pemeriksaan')
                ->where('doctor_id', $doctorId)
                ->whereDate('tanggal_pemeriksaan', $today)
                ->where('status', 'completed')
                ->count();

            // Get upcoming appointments
            $upcomingAppointments = DB::table('t_janji_temu')
                ->where('doctor_id', $doctorId)
                ->where('tanggal_janji', '>=', $today)
                ->where('status', 'scheduled')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'todayPatients' => $todayRegistrations,
                    'currentQueue' => [
                        'waiting' => $queueStats['waiting'] ?? 0,
                        'in_progress' => $queueStats['in_progress'] ?? 0,
                        'completed' => $queueStats['completed'] ?? 0
                    ],
                    'pendingLabOrders' => $pendingLabOrders,
                    'pendingRadiologyOrders' => $pendingRadiologyOrders,
                    'completedConsultations' => $completedToday,
                    'upcomingAppointments' => $upcomingAppointments
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function antrean(Request $request)
    {
        try {
            $doctorId = auth()->id();
            $poli = $request->get('poli', 'all');
            $shift = $request->get('shift', 'all');

            $query = DB::table('t_registrasi')
                ->leftJoin('m_pasien', 't_registrasi.pasien_id', '=', 'm_pasien.id')
                ->leftJoin('m_dokter', 't_registrasi.dokter_id', '=', 'm_dokter.id')
                ->where('t_registrasi.dokter_id', $doctorId)
                ->whereIn('t_registrasi.status', ['menunggu', 'dipanggil', 'sedang_diperiksa'])
                ->select([
                    't_registrasi.id',
                    't_registrasi.no_registrasi as registration_no',
                    't_registrasi.status',
                    't_registrasi.created_at as visit_date',
                    'm_pasien.nama_lengkap',
                    'm_pasien.no_rm as mrn',
                    'm_pasien.tanggal_lahir as birth_date',
                    'm_pasien.jenis_kelamin as gender',
                    't_registrasi.keluhan as complaint',
                    't_registrasi.id as registration_id'
                ]);

            // Filter by poli if specified
            if ($poli !== 'all') {
                $query->where('t_registrasi.poli_id', $poli);
            }

            $registrations = $query->orderBy('t_registrasi.created_at', 'asc')->get();

            // Transform to match CPPT page expectations
            $encounters = $registrations->map(function($reg) {
                return [
                    'id' => $reg->registration_id,
                    'registration_no' => $reg->registration_no,
                    'patient_data' => [
                        'id' => $reg->registration_id, // Using reg id for patient id temporarily
                        'name' => $reg->nama_lengkap,
                        'mrn' => $reg->mrn ?? 'RM-' . str_pad($reg->registration_id, 6, '0', STR_PAD_LEFT),
                        'birth_date' => $reg->birth_date,
                        'gender' => $reg->gender
                    ],
                    'status' => $reg->status,
                    'visit_date' => $reg->visit_date,
                    'complaint' => $reg->complaint
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $encounters
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queue data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function alerts(Request $request)
    {
        try {
            $doctorId = auth()->id();

            // Get abnormal vital signs from recent examinations
            $abnormalVitals = DB::table('t_pemeriksaan')
                ->leftJoin('m_pasien', 't_pemeriksaan.patient_id', '=', 'm_pasien.id')
                ->where('t_pemeriksaan.doctor_id', $doctorId)
                ->where('t_pemeriksaan.status', 'completed')
                ->whereNotNull('t_pemeriksaan.tanda_vital')
                ->select([
                    't_pemeriksaan.id',
                    't_pemeriksaan.tanda_vital',
                    'm_pasien.nama_lengkap as patient_name',
                    't_pemeriksaan.tanggal_pemeriksaan'
                ])
                ->orderBy('t_pemeriksaan.tanggal_pemeriksaan', 'desc')
                ->limit(10)
                ->get();

            $alerts = [];

            foreach ($abnormalVitals as $exam) {
                $vitals = json_decode($exam->tanda_vital, true);

                if ($vitals) {
                    // Check for abnormal blood pressure
                    if (isset($vitals['systolic']) && isset($vitals['diastolic'])) {
                        $systolic = (int) $vitals['systolic'];
                        $diastolic = (int) $vitals['diastolic'];

                        if ($systolic >= 140 || $diastolic >= 90) {
                            $alerts[] = [
                                'id' => 'vital_' . $exam->id,
                                'type' => 'vital_critical',
                                'patient' => $exam->patient_name,
                                'message' => "Tekanan darah tinggi: {$systolic}/{$diastolic}",
                                'time' => Carbon::parse($exam->tanggal_pemeriksaan)->format('H:i'),
                                'urgent' => true
                            ];
                        }
                    }

                    // Check for abnormal heart rate
                    if (isset($vitals['heart_rate'])) {
                        $hr = (int) $vitals['heart_rate'];
                        if ($hr < 60 || $hr > 100) {
                            $alerts[] = [
                                'id' => 'hr_' . $exam->id,
                                'type' => 'vital_abnormal',
                                'patient' => $exam->patient_name,
                                'message' => "Detak jantung abnormal: {$hr} bpm",
                                'time' => Carbon::parse($exam->tanggal_pemeriksaan)->format('H:i'),
                                'urgent' => $hr < 50 || $hr > 120
                            ];
                        }
                    }
                }
            }

            // Get pending lab results
            $pendingLabs = DB::table('t_pesanan_lab')
                ->leftJoin('m_pasien', 't_pesanan_lab.patient_id', '=', 'm_pasien.id')
                ->where('t_pesanan_lab.doctor_id', $doctorId)
                ->where('t_pesanan_lab.status', 'completed')
                ->where('t_pesanan_lab.hasil', '!=', null)
                ->where('t_pesanan_lab.is_reviewed', false)
                ->select([
                    't_pesanan_lab.id',
                    'm_pasien.nama_lengkap as patient_name',
                    't_pesanan_lab.created_at'
                ])
                ->orderBy('t_pesanan_lab.created_at', 'desc')
                ->limit(5)
                ->get();

            foreach ($pendingLabs as $lab) {
                $alerts[] = [
                    'id' => 'lab_' . $lab->id,
                    'type' => 'lab_urgent',
                    'patient' => $lab->patient_name,
                    'message' => 'Hasil lab baru perlu direview',
                    'time' => Carbon::parse($lab->created_at)->format('H:i'),
                    'urgent' => true
                ];
            }

            return response()->json([
                'success' => true,
                'data' => array_slice($alerts, 0, 10) // Limit to 10 alerts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function callPatient(Request $request)
    {
        try {
            $queueId = $request->get('queue_id');
            $doctorId = auth()->id();

            // Update queue status
            DB::table('t_antrian')
                ->where('id', $queueId)
                ->where('doctor_id', $doctorId)
                ->update([
                    'status' => 'called',
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Patient called successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to call patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function startExamination(Request $request)
    {
        try {
            $registrationId = $request->get('reg_id');
            $doctorId = auth()->id();

            // Update queue status to in_progress
            DB::table('t_antrian')
                ->where('registration_id', $registrationId)
                ->where('doctor_id', $doctorId)
                ->update([
                    'status' => 'in_progress',
                    'updated_at' => now()
                ]);

            // Create examination record if not exists
            $existingExam = DB::table('t_pemeriksaan')
                ->where('registration_id', $registrationId)
                ->first();

            if (!$existingExam) {
                DB::table('t_pemeriksaan')->insert([
                    'registration_id' => $registrationId,
                    'doctor_id' => $doctorId,
                    'patient_id' => DB::table('t_registrasi')->where('id', $registrationId)->value('patient_id'),
                    'status' => 'draft',
                    'tanggal_pemeriksaan' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                    'created_by' => $doctorId
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Examination started successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start examination',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
