<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawatInap;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LOSController extends Controller
{
    /**
     * Get LOS (Length of Stay) analysis data
     */
    public function index(Request $request)
    {
        try {
            $period = $request->get('period', 'monthly'); // daily, weekly, monthly
            $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', now()->endOfMonth()->toDateString());

            // Get all inpatient data within the period
            $rawatInaps = RawatInap::with(['patient', 'ruangan', 'dokter'])
                ->where(function($query) use ($startDate, $endDate) {
                    $query->whereBetween('tanggal_masuk', [$startDate, $endDate])
                          ->orWhere(function($q) use ($startDate, $endDate) {
                              $q->where('tanggal_masuk', '<=', $endDate)
                                ->where(function($sq) use ($startDate) {
                                    $sq->whereNull('tanggal_keluar')
                                       ->orWhere('tanggal_keluar', '>=', $startDate);
                                });
                          });
                })
                ->whereIn('status', ['keluar', 'pindah_ruangan', 'meninggal'])
                ->get();

            $losData = [];
            $totalPatientDays = 0;
            $totalDischarges = 0;
            $totalDeaths = 0;
            $totalTransfers = 0;
            $losByRoom = [];
            $losByDiagnosis = [];

            foreach ($rawatInaps as $rawatInap) {
                $durasi = $rawatInap->durasi;
                $totalPatientDays += $durasi;

                if ($rawatInap->status === 'keluar') {
                    $totalDischarges++;
                } elseif ($rawatInap->status === 'meninggal') {
                    $totalDeaths++;
                } elseif ($rawatInap->status === 'pindah_ruangan') {
                    $totalTransfers++;
                }

                // Group by room
                $roomName = $rawatInap->ruangan->nama_ruangan ?? 'Unknown';
                if (!isset($losByRoom[$roomName])) {
                    $losByRoom[$roomName] = [
                        'total_patients' => 0,
                        'total_days' => 0,
                        'average_los' => 0
                    ];
                }
                $losByRoom[$roomName]['total_patients']++;
                $losByRoom[$roomName]['total_days'] += $durasi;

                // Group by diagnosis
                $diagnosis = $rawatInap->diagnosa_masuk ?? 'Tidak diketahui';
                if (!isset($losByDiagnosis[$diagnosis])) {
                    $losByDiagnosis[$diagnosis] = [
                        'total_patients' => 0,
                        'total_days' => 0,
                        'average_los' => 0
                    ];
                }
                $losByDiagnosis[$diagnosis]['total_patients']++;
                $losByDiagnosis[$diagnosis]['total_days'] += $durasi;

                $losData[] = [
                    'id' => $rawatInap->id,
                    'no_rawat_inap' => $rawatInap->no_rawat_inap,
                    'patient_name' => $rawatInap->patient->nama_pasien ?? 'Unknown',
                    'no_rm' => $rawatInap->patient->no_rm ?? '',
                    'ruangan' => $roomName,
                    'dokter' => $rawatInap->dokter ? $rawatInap->dokter->nama_dokter : null,
                    'tanggal_masuk' => $rawatInap->tanggal_masuk->format('Y-m-d'),
                    'tanggal_keluar' => $rawatInap->tanggal_keluar?->format('Y-m-d'),
                    'durasi' => $durasi,
                    'diagnosa_masuk' => $rawatInap->diagnosa_masuk,
                    'diagnosa_keluar' => $rawatInap->diagnosa_keluar,
                    'status' => $rawatInap->status,
                    'biaya_per_hari' => $rawatInap->biaya_per_hari,
                    'total_biaya' => $rawatInap->total_biaya,
                ];
            }

            // Calculate averages
            foreach ($losByRoom as $room => $data) {
                $losByRoom[$room]['average_los'] = $data['total_patients'] > 0
                    ? round($data['total_days'] / $data['total_patients'], 2)
                    : 0;
            }

            foreach ($losByDiagnosis as $diagnosis => $data) {
                $losByDiagnosis[$diagnosis]['average_los'] = $data['total_patients'] > 0
                    ? round($data['total_days'] / $data['total_patients'], 2)
                    : 0;
            }

            $overallAverageLOS = ($totalDischarges + $totalDeaths + $totalTransfers) > 0
                ? round($totalPatientDays / ($totalDischarges + $totalDeaths + $totalTransfers), 2)
                : 0;

            $summary = [
                'total_pasien' => $rawatInaps->count(),
                'total_hari_rawat' => $totalPatientDays,
                'rata_rata_los' => $overallAverageLOS,
                'total_keluar' => $totalDischarges,
                'total_meninggal' => $totalDeaths,
                'total_pindah_ruangan' => $totalTransfers,
                'los_by_ruangan' => $losByRoom,
                'los_by_diagnosa' => $losByDiagnosis,
                'periode' => [
                    'start' => $startDate,
                    'end' => $endDate,
                    'type' => $period
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'pasien' => $losData
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch LOS data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get LOS statistics by room
     */
    public function getByRoom($roomId)
    {
        try {
            $room = Ruangan::findOrFail($roomId);

            $rawatInaps = RawatInap::with(['patient', 'dokter'])
                ->where('ruangan_id', $roomId)
                ->whereIn('status', ['keluar', 'pindah_ruangan', 'meninggal'])
                ->get();

            $totalPatientDays = 0;
            $totalPatients = $rawatInaps->count();

            foreach ($rawatInaps as $rawatInap) {
                $totalPatientDays += $rawatInap->durasi;
            }

            $averageLOS = $totalPatients > 0 ? round($totalPatientDays / $totalPatients, 2) : 0;

            $patients = $rawatInaps->map(function($rawatInap) {
                return [
                    'id' => $rawatInap->id,
                    'no_rawat_inap' => $rawatInap->no_rawat_inap,
                    'patient' => [
                        'id' => $rawatInap->patient->id,
                        'nama_pasien' => $rawatInap->patient->nama_pasien,
                        'no_rm' => $rawatInap->patient->no_rm,
                        'tanggal_lahir' => $rawatInap->patient->tanggal_lahir,
                        'jenis_kelamin' => $rawatInap->patient->jenis_kelamin,
                    ],
                    'tanggal_masuk' => $rawatInap->tanggal_masuk,
                    'tanggal_keluar' => $rawatInap->tanggal_keluar,
                    'durasi' => $rawatInap->durasi,
                    'diagnosa_masuk' => $rawatInap->diagnosa_masuk,
                    'diagnosa_keluar' => $rawatInap->diagnosa_keluar,
                    'dokter' => $rawatInap->dokter ? [
                        'id' => $rawatInap->dokter->id,
                        'nama_dokter' => $rawatInap->dokter->nama_dokter,
                        'spesialisasi' => $rawatInap->dokter->spesialisasi,
                    ] : null,
                    'status' => $rawatInap->status,
                    'catatan' => $rawatInap->catatan,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'ruangan' => [
                        'id' => $room->id,
                        'nama_ruangan' => $room->nama_ruangan,
                        'kapasitas' => $room->kapasitas,
                        'total_pasien' => $totalPatients,
                        'total_hari_rawat' => $totalPatientDays,
                        'rata_rata_los' => $averageLOS,
                    ],
                    'pasien' => $patients
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch room LOS details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}