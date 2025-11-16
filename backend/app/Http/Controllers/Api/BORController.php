<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawatInap;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BORController extends Controller
{
    /**
     * Get BOR (Bed Occupancy Rate) and LOS (Length of Stay) data
     */
    public function index(Request $request)
    {
        try {
            $period = $request->get('period', 'daily'); // daily, weekly, monthly
            $startDate = Carbon::parse($request->get('start_date', now()->startOfMonth()->toDateString()));
            $endDate = Carbon::parse($request->get('end_date', now()->endOfMonth()->toDateString()));

            // Get all inpatient rooms
            $ruangans = Ruangan::rawatInap()->with(['rawatInaps' => function($query) use ($startDate, $endDate) {
                $query->where(function($q) use ($startDate, $endDate) {
                    $q->whereBetween('tanggal_masuk', [$startDate, $endDate])
                      ->orWhere(function($sq) use ($startDate, $endDate) {
                          $sq->where('tanggal_masuk', '<=', $endDate)
                            ->where(function($tsq) use ($startDate, $endDate) {
                                $tsq->whereNull('tanggal_keluar')
                                   ->orWhere('tanggal_keluar', '>=', $startDate);
                            });
                      });
                });
            }])->get();

            $borData = [];
            $totalBeds = 0;
            $totalOccupiedBeds = 0;
            $totalPatientDays = 0;
            $totalBedDaysAvailable = 0; // Total hari tempat tidur tersedia
            $totalDischarges = 0;
            $totalDeaths = 0;

            // Calculate total days in period
            $totalDaysInPeriod = $startDate->diffInDays($endDate) + 1;

            foreach ($ruangans as $ruangan) {
                $occupiedBeds = $ruangan->rawatInaps->where('status', 'dirawat')->count();
                $totalBeds += $ruangan->kapasitas;
                $totalOccupiedBeds += $occupiedBeds;

                // Calculate bed days available for this room
                $roomBedDaysAvailable = $ruangan->kapasitas * $totalDaysInPeriod;
                $totalBedDaysAvailable += $roomBedDaysAvailable;

                // Calculate patient days for this room
                $roomPatientDays = 0;
                foreach ($ruangan->rawatInaps as $rawatInap) {
                    $admissionDate = Carbon::parse($rawatInap->tanggal_masuk);
                    $dischargeDate = $rawatInap->tanggal_keluar ? Carbon::parse($rawatInap->tanggal_keluar) : null;

                    // Calculate patient days within the period
                    $periodStart = max($admissionDate, $startDate);
                    $periodEnd = min($dischargeDate ?: now(), $endDate);

                    if ($periodStart <= $periodEnd) {
                        $patientDaysInPeriod = $periodStart->diffInDays($periodEnd) + 1;
                        $roomPatientDays += $patientDaysInPeriod;
                        $totalPatientDays += $patientDaysInPeriod;

                        if ($rawatInap->status === 'keluar') {
                            $totalDischarges++;
                        } elseif ($rawatInap->status === 'meninggal') {
                            $totalDeaths++;
                        }
                    }
                }

                // Calculate BOR for this room (Patient Days / Bed Days Available * 100)
                $roomBOR = $roomBedDaysAvailable > 0 ? round(($roomPatientDays / $roomBedDaysAvailable) * 100, 2) : 0;

                $borData[] = [
                    'id' => $ruangan->id,
                    'kode_ruangan' => $ruangan->kode_ruangan,
                    'nama_ruangan' => $ruangan->nama_ruangan,
                    'kapasitas' => $ruangan->kapasitas,
                    'terisi' => $occupiedBeds,
                    'kosong' => $ruangan->kapasitas - $occupiedBeds,
                    'tingkat_okupansi' => $roomBOR,
                    'status' => $ruangan->status,
                    'fasilitas' => $ruangan->fasilitas,
                    'pasien' => $ruangan->rawatInaps->where('status', 'dirawat')->map(function($rawatInap) {
                        return [
                            'id' => $rawatInap->id,
                            'no_rawat_inap' => $rawatInap->no_rawat_inap,
                            'patient_name' => $rawatInap->patient->nama_pasien ?? 'Unknown',
                            'tanggal_masuk' => $rawatInap->tanggal_masuk->format('Y-m-d H:i'),
                            'durasi' => $rawatInap->durasi,
                            'diagnosa' => $rawatInap->diagnosa_masuk,
                            'dokter' => $rawatInap->dokter ? $rawatInap->dokter->nama_dokter : null,
                        ];
                    })
                ];
            }

            // Calculate overall BOR (Patient Days / Bed Days Available * 100)
            $overallBOR = $totalBedDaysAvailable > 0 ? round(($totalPatientDays / $totalBedDaysAvailable) * 100, 2) : 0;

            // Calculate average LOS
            $averageLOS = $totalDischarges > 0 ? round($totalPatientDays / $totalDischarges, 2) : 0;

            $summary = [
                'total_ruangan' => $ruangans->count(),
                'total_tempat_tidur' => $totalBeds,
                'total_terisi' => $totalOccupiedBeds,
                'total_kosong' => $totalBeds - $totalOccupiedBeds,
                'bor_persen' => $overallBOR,
                'total_patient_days' => $totalPatientDays,
                'total_bed_days_available' => $totalBedDaysAvailable,
                'total_discharges' => $totalDischarges,
                'total_deaths' => $totalDeaths,
                'average_los' => $averageLOS,
                'period' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString(),
                    'type' => $period,
                    'total_days' => $totalDaysInPeriod
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'ruangan' => $borData
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch BOR data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get room status details
     */
    public function showRoom($roomId)
    {
        try {
            $ruangan = Ruangan::with(['rawatInaps.patient', 'rawatInaps.dokter'])->findOrFail($roomId);

            $currentPatients = $ruangan->rawatInaps->where('status', 'dirawat')->map(function($rawatInap) {
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
                    'durasi' => $rawatInap->durasi,
                    'diagnosa_masuk' => $rawatInap->diagnosa_masuk,
                    'dokter' => $rawatInap->dokter ? [
                        'id' => $rawatInap->dokter->id,
                        'nama_dokter' => $rawatInap->dokter->nama_dokter,
                        'spesialisasi' => $rawatInap->dokter->spesialisasi,
                    ] : null,
                    'catatan' => $rawatInap->catatan,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'ruangan' => [
                        'id' => $ruangan->id,
                        'kode_ruangan' => $ruangan->kode_ruangan,
                        'nama_ruangan' => $ruangan->nama_ruangan,
                        'kapasitas' => $ruangan->kapasitas,
                        'terisi' => $currentPatients->count(),
                        'kosong' => $ruangan->kapasitas - $currentPatients->count(),
                        'tingkat_okupansi' => $ruangan->kapasitas > 0 ? round(($currentPatients->count() / $ruangan->kapasitas) * 100, 2) : 0,
                        'status' => $ruangan->status,
                        'fasilitas' => $ruangan->fasilitas,
                        'tarif_per_hari' => $ruangan->tarif_per_hari,
                    ],
                    'current_patients' => $currentPatients
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch room details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
