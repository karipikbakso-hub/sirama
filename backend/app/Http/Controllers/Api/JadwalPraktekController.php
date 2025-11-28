<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenugasanDokter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class JadwalPraktekController extends Controller
{
    public function index(Request $request)
    {
        try {
            $doctorId = $request->get('doctor_id', auth()->id());
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));

            // Get doctor's schedule for the specified date
            $schedules = PenugasanDokter::with(['user', 'poli'])
                ->where('user_id', $doctorId)
                ->where('tanggal_penugasan', $date)
                ->where('aktif', true)
                ->orderBy('waktu_mulai')
                ->get();

            $result = $schedules->map(function($schedule) {
                // Count registered patients for this schedule
                $registeredCount = DB::table('t_registrasi')
                    ->where('doctor_id', $schedule->user_id)
                    ->whereDate('tanggal_registrasi', $schedule->tanggal_penugasan)
                    ->whereTime('created_at', '>=', $schedule->waktu_mulai)
                    ->whereTime('created_at', '<=', $schedule->waktu_selesai)
                    ->count();

                return [
                    'id' => $schedule->id,
                    'waktu' => $schedule->waktu_mulai->format('H:i') . ' - ' . $schedule->waktu_selesai->format('H:i'),
                    'lokasi' => $schedule->poli ? $schedule->poli->nama_poli : 'Tidak ditentukan',
                    'kuota' => 20, // Default quota, you may want to make this configurable
                    'registered' => $registeredCount,
                    'shift_type' => $schedule->jenis_shift,
                    'tanggal' => $schedule->tanggal_penugasan->format('Y-m-d'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch jadwal praktek',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
