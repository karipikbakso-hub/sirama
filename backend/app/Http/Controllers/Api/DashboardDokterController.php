<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardDokterController extends Controller
{
    public function index(Request $request)
    {
        try {
            $doctorId = auth()->id();
            $today = Carbon::today();

            // Get count of registrations for this doctor today by status
            $stats = DB::table('t_registrasi')
                ->where('doctor_id', $doctorId)
                ->whereDate('tanggal_registrasi', $today)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_pasien' => array_sum($stats),
                    'menunggu' => $stats['menunggu'] ?? 0,
                    'selesai' => $stats['selesai'] ?? 0,
                    'batal' => $stats['batal'] ?? 0,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
