<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function dokter(Request $request)
    {
        try {
            $doctorId = auth()->id();
            $unread = $request->get('unread', false);

            $notifications = [];

            // Get lab order notifications (results ready)
            $pendingLabs = DB::table('t_pesanan_lab')
                ->leftJoin('m_pasien', 't_pesanan_lab.id_pasien', '=', 'm_pasien.id')
                ->where('t_pesanan_lab.id_dokter', $doctorId)
                ->where('t_pesanan_lab.status_pesanan', 'completed')
                ->whereNotNull('t_pesanan_lab.hasil')
                ->when($unread, function ($query) {
                    $query->where('t_pesanan_lab.is_reviewed', false);
                })
                ->select([
                    't_pesanan_lab.id',
                    'm_pasien.nama_lengkap as patient_name',
                    't_pesanan_lab.created_at',
                    DB::raw("'lab' as type"),
                    DB::raw("'Hasil laboratorium siap direview' as message"),
                    't_pesanan_lab.is_reviewed'
                ])
                ->get();

            foreach ($pendingLabs as $lab) {
                $notifications[] = [
                    'id' => 'lab_' . $lab->id,
                    'patient' => $lab->patient_name,
                    'message' => $lab->message,
                    'type' => 'lab_result_ready',
                    'created_at' => Carbon::parse($lab->created_at)->format('Y-m-d H:i:s'),
                    'read' => $lab->is_reviewed
                ];
            }

            // Get radiology order notifications (results ready)
            $pendingRadiology = DB::table('t_pesanan_radiologi')
                ->leftJoin('m_pasien', 't_pesanan_radiologi.id_pasien', '=', 'm_pasien.id')
                ->where('t_pesanan_radiologi.id_dokter', $doctorId)
                ->where('t_pesanan_radiologi.status_pesanan', 'completed')
                ->whereNotNull('t_pesanan_radiologi.hasil')
                ->when($unread, function ($query) {
                    $query->where('t_pesanan_radiologi.is_reviewed', false);
                })
                ->select([
                    't_pesanan_radiologi.id',
                    'm_pasien.nama_lengkap as patient_name',
                    't_pesanan_radiologi.created_at',
                    DB::raw("'radiology' as type"),
                    DB::raw("'Hasil radiologi siap direview' as message"),
                    't_pesanan_radiologi.is_reviewed'
                ])
                ->get();

            foreach ($pendingRadiology as $rad) {
                $notifications[] = [
                    'id' => 'rad_' . $rad->id,
                    'patient' => $rad->patient_name,
                    'message' => $rad->message,
                    'type' => 'radiology_result_ready',
                    'created_at' => Carbon::parse($rad->created_at)->format('Y-m-d H:i:s'),
                    'read' => $rad->is_reviewed
                ];
            }

            // Sort by created_at descending
            usort($notifications, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
