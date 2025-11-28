<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DoctorCpptController extends Controller
{
    public function getCpptEntries($registrationId)
    {
        try {
            $doctorId = auth()->id();

            // Verify doctor has access to this registration/encounter
            $registration = DB::table('t_registrasi')
                ->where('id', $registrationId)
                ->where('doctor_id', $doctorId)
                ->first();

            if (!$registration) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration not found or access denied'
                ], 403);
            }

            // Get CPPT entries for this registration
            $cpptEntries = DB::table('cppt_entries')
                ->leftJoin('users', 'cppt_entries.user_id', '=', 'users.id')
                ->leftJoin('m_pasien', 'cppt_entries.pasien_id', '=', 'm_pasien.id')
                ->leftJoin('t_registrasi', 'cppt_entries.registrasi_id', '=', 't_registrasi.id')
                ->where('cppt_entries.registrasi_id', $registrationId)
                ->select([
                    'cppt_entries.id',
                    'cppt_entries.pasien_id',
                    'cppt_entries.registrasi_id',
                    'cppt_entries.user_id',
                    'cppt_entries.tanggal_waktu',
                    'cppt_entries.subjektif',
                    'cppt_entries.objektif',
                    'cppt_entries.asesmen',
                    'cppt_entries.planning',
                    'cppt_entries.status',
                    'cppt_entries.created_at',
                    'users.name as doctor_name',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as patient_mrn',
                    't_registrasi.no_registrasi'
                ])
                ->orderBy('cppt_entries.tanggal_waktu', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $cpptEntries
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve CPPT entries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function saveCppt(Request $request, $registrationId)
    {
        try {
            $doctorId = auth()->id();

            // Verify doctor has access to this registration/encounter
            $registration = DB::table('t_registrasi')
                ->where('id', $registrationId)
                ->where('doctor_id', $doctorId)
                ->first();

            if (!$registration) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration not found or access denied'
                ], 403);
            }

            $validatedData = $request->validate([
                'subjektif' => 'nullable|string',
                'objektif' => 'nullable|string',
                'asesmen' => 'nullable|string',
                'planning' => 'nullable|string',
                'instruksi' => 'nullable|string',
                'evaluasi' => 'nullable|string',
                'status' => 'required|in:draft,final'
            ]);

            // Create or update CPPT entry
            $cpptData = [
                'pasien_id' => $registration->patient_id,
                'registrasi_id' => $registrationId,
                'user_id' => $doctorId,
                'tanggal_waktu' => now(),
                'shift' => $this->determineShift(),
                'status' => $validatedData['status'],
                'updated_at' => now()
            ];

            // Add SOAP data
            $soapFields = ['subjektif', 'objektif', 'asesmen', 'planning', 'instruksi', 'evaluasi'];
            foreach ($soapFields as $field) {
                if (isset($validatedData[$field])) {
                    $cpptData[$field] = $validatedData[$field];
                }
            }

            // Check if CPPT entry already exists for today for this encounter
            $existingCppt = DB::table('cppt_entries')
                ->where('registrasi_id', $registrationId)
                ->where('user_id', $doctorId)
                ->whereDate('tanggal_waktu', today())
                ->first();

            if ($existingCppt) {
                // Update existing entry
                DB::table('cppt_entries')
                    ->where('id', $existingCppt->id)
                    ->update($cpptData);

                $cpptId = $existingCppt->id;
            } else {
                // Create new entry
                $cpptData['created_at'] = now();
                $cpptId = DB::table('cppt_entries')->insertGetId($cpptData);
            }

            return response()->json([
                'success' => true,
                'message' => 'CPPT entry saved successfully',
                'data' => [
                    'cppt_id' => $cpptId
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function signCppt($registrationId)
    {
        try {
            $doctorId = auth()->id();

            // Get the latest draft CPPT entry for this registration
            $cpptEntry = DB::table('cppt_entries')
                ->where('registrasi_id', $registrationId)
                ->where('user_id', $doctorId)
                ->where('status', 'draft')
                ->orderBy('tanggal_waktu', 'desc')
                ->first();

            if (!$cpptEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'No draft CPPT entry found to sign'
                ], 404);
            }

            // Update status to final and add signing info
            DB::table('cppt_entries')
                ->where('id', $cpptEntry->id)
                ->update([
                    'status' => 'final',
                    'updated_at' => now(),
                    // Note: Adding signer info would require additional columns
                ]);

            return response()->json([
                'success' => true,
                'message' => 'CPPT entry signed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sign CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function searchCppt(Request $request)
    {
        try {
            $doctorId = auth()->id();
            $query = $request->get('q', '');
            $limit = $request->get('limit', 20);

            if (empty($query)) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            // Search CPPT entries by doctor (for privacy)
            $results = DB::table('cppt_entries')
                ->leftJoin('m_pasien', 'cppt_entries.pasien_id', '=', 'm_pasien.id')
                ->leftJoin('users', 'cppt_entries.user_id', '=', 'users.id')
                ->leftJoin('t_registrasi', 'cppt_entries.registrasi_id', '=', 't_registrasi.id')
                ->where('cppt_entries.user_id', $doctorId) // Only doctor's own entries
                ->where(function($q) use ($query) {
                    $q->where('cppt_entries.subjektif', 'LIKE', "%{$query}%")
                      ->orWhere('cppt_entries.objektif', 'LIKE', "%{$query}%")
                      ->orWhere('cppt_entries.asesmen', 'LIKE', "%{$query}%")
                      ->orWhere('cppt_entries.planning', 'LIKE', "%{$query}%")
                      ->orWhere('m_pasien.nama_lengkap', 'LIKE', "%{$query}%")
                      ->orWhere('m_pasien.no_rm', 'LIKE', "%{$query}%");
                })
                ->select([
                    'cppt_entries.id',
                    'cppt_entries.pasien_id',
                    'cppt_entries.registrasi_id',
                    'cppt_entries.user_id',
                    'cppt_entries.tanggal_waktu',
                    'cppt_entries.subjektif',
                    'cppt_entries.objektif',
                    'cppt_entries.asesmen',
                    'cppt_entries.planning',
                    'cppt_entries.status',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as patient_mrn',
                    'users.name as doctor_name',
                    't_registrasi.no_registrasi'
                ])
                ->orderBy('cppt_entries.tanggal_waktu', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search CPPT entries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCpptMetrics($doctorId)
    {
        try {
            // Verify requesting user has access to this doctor's metrics
            $requestingUser = auth()->id();
            if ($requestingUser != $doctorId) {
                // Could add admin check here
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied'
                ], 403);
            }

            $today = Carbon::today();

            // Calculate daily completion rate
            $todayRegistrations = DB::table('t_registrasi')
                ->where('doctor_id', $doctorId)
                ->whereDate('tanggal_registrasi', $today)
                ->count();

            $todayCppts = DB::table('cppt_entries')
                ->where('user_id', $doctorId)
                ->whereDate('tanggal_waktu', $today)
                ->where('status', 'final')
                ->distinct('registrasi_id')
                ->count('registrasi_id');

            $completionRate = $todayRegistrations > 0 ? ($todayCppts / $todayRegistrations) * 100 : 0;

            // Average signing time (simplified calculation)
            $avgSignTime = DB::table('cppt_entries')
                ->where('user_id', $doctorId)
                ->whereDate('created_at', $today)
                ->avg(DB::raw('TIMESTAMPDIFF(MINUTE, created_at, updated_at)'));

            return response()->json([
                'success' => true,
                'data' => [
                    'daily_completion_rate' => round($completionRate, 1),
                    'total_cppt_today' => $todayCppts,
                    'avg_sign_time' => round($avgSignTime ?: 0, 1),
                    'doctor_completion' => $completionRate >= 80 ? 'good' : ($completionRate >= 50 ? 'fair' : 'poor')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch CPPT metrics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function determineShift()
    {
        $hour = now()->hour;

        if ($hour >= 7 && $hour < 14) {
            return 'pagi';
        } elseif ($hour >= 14 && $hour < 21) {
            return 'siang';
        } else {
            return 'malam';
        }
    }
}
