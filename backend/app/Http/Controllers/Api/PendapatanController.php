<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Billing;
use App\Models\Registration;
use App\Models\Poli;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PendapatanController extends Controller
{
    /**
     * Get pendapatan per unit (poli)
     */
    public function index(Request $request)
    {
        try {
            $unitType = $request->get('unit_type', 'poli'); // poli, ruangan, dll
            $period = $request->get('period', 'monthly'); // daily, weekly, monthly, yearly, custom
            $startDate = Carbon::parse($request->get('start_date', now()->startOfMonth()->toDateString()));
            $endDate = Carbon::parse($request->get('end_date', now()->endOfMonth()->toDateString()));

            $query = Pembayaran::with([
                'billing.registrasi.poli',
                'billing.registrasi.ruangan'
            ])
            ->whereBetween('tanggal_bayar', [$startDate, $endDate]);

            $pendapatanData = [];
            $totalPendapatan = 0;
            $unitCounts = [];

            // Group by unit type
            $groupField = $this->getGroupField($unitType);

            $units = $query->get()
                ->groupBy(function($pembayaran) use ($groupField, $unitType) {
                    if ($unitType === 'poli') {
                        return $pembayaran->billing->registrasi->poli->nama_poli ?? 'Tidak Diketahui';
                    } elseif ($unitType === 'ruangan') {
                        return $pembayaran->billing->registrasi->ruangan->nama_ruangan ?? 'Tidak Diketahui';
                    } else {
                        return 'Umum';
                    }
                });

            foreach ($units as $unitName => $unitPembayarans) {
                $totalUnit = $unitPembayarans->sum('jumlah_bayar');
                $count = $unitPembayarans->count();
                $average = $count > 0 ? $totalUnit / $count : 0;

                $unitCounts[$unitName] = $count;
                $totalPendapatan += $totalUnit;

                $pendapatanData[] = [
                    'unit' => $unitName,
                    'total_pendapatan' => (float) $totalUnit,
                    'jumlah_pembayaran' => $count,
                    'rata_rata_per_pembayaran' => round($average, 2),
                    'persentase_dari_total' => 0, // akan dihitung setelah loop
                    'pembayaran' => $unitPembayarans->take(10)->map(function($pembayaran) { // ambil 10 terakhir untuk sample
                        return [
                            'id' => $pembayaran->id,
                            'tanggal_bayar' => $pembayaran->tanggal_bayar->format('Y-m-d H:i'),
                            'metode_bayar' => $pembayaran->metode_bayar,
                            'jumlah_bayar' => (float) $pembayaran->jumlah_bayar,
                            'no_invoice' => $pembayaran->billing->no_invoice,
                            'patient_name' => $pembayaran->billing->registrasi->patient->nama_pasien ?? 'Unknown',
                        ];
                    })
                ];
            }

            // Hitung persentase
            foreach ($pendapatanData as &$data) {
                $data['persentase_dari_total'] = $totalPendapatan > 0 ?
                    round(($data['total_pendapatan'] / $totalPendapatan) * 100, 2) : 0;
            }

            // Sort berdasarkan total pendapatan descending
            usort($pendapatanData, function($a, $b) {
                return $b['total_pendapatan'] <=> $a['total_pendapatan'];
            });

            // Data untuk chart
            $chartData = [
                'labels' => array_column($pendapatanData, 'unit'),
                'datasets' => [
                    [
                        'label' => 'Total Pendapatan',
                        'data' => array_column($pendapatanData, 'total_pendapatan'),
                        'backgroundColor' => 'rgba(54, 162, 235, 0.6)',
                        'borderColor' => 'rgba(54, 162, 235, 1)',
                        'borderWidth' => 1,
                    ]
                ]
            ];

            $summary = [
                'unit_type' => $unitType,
                'total_pendapatan' => (float) $totalPendapatan,
                'total_unit' => count($pendapatanData),
                'rata_rata_per_unit' => count($pendapatanData) > 0 ? round($totalPendapatan / count($pendapatanData), 2) : 0,
                'unit_tertinggi' => $pendapatanData[0]['unit'] ?? '',
                'unit_terendah' => $pendapatanData[count($pendapatanData)-1]['unit'] ?? '',
                'periode' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString(),
                    'type' => $period,
                    'total_days' => $startDate->diffInDays($endDate) + 1
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'pendapatan' => $pendapatanData,
                    'chart' => $chartData
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pendapatan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detail pembayaran per unit
     */
    public function showUnitDetail(Request $request, $unitId)
    {
        try {
            $unitType = $request->get('unit_type', 'poli');
            $startDate = Carbon::parse($request->get('start_date', now()->startOfMonth()->toDateString()));
            $endDate = Carbon::parse($request->get('end_date', now()->endOfMonth()->toDateString()));

            $query = Pembayaran::with([
                'billing.registrasi.patient',
                'billing.registrasi.poli',
                'billing.registrasi.ruangan',
                'user'
            ])
            ->whereBetween('tanggal_bayar', [$startDate, $endDate]);

            // Filter berdasarkan unit
            if ($unitType === 'poli') {
                $query->whereHas('billing.registrasi.poli', function($q) use ($unitId) {
                    $q->where('nama_poli', $unitId);
                });
            } elseif ($unitType === 'ruangan') {
                $query->whereHas('billing.registrasi.ruangan', function($q) use ($unitId) {
                    $q->where('nama_ruangan', $unitId);
                });
            }

            $pembayarans = $query->orderBy('tanggal_bayar', 'desc')->get();

            $detail = [
                'unit' => $unitId,
                'total_pembayaran' => $pembayarans->count(),
                'total_pendapatan' => (float) $pembayarans->sum('jumlah_bayar'),
                'pembayaran' => $pembayarans->map(function($pembayaran) {
                    return [
                        'id' => $pembayaran->id,
                        'no_invoice' => $pembayaran->billing->no_invoice,
                        'tanggal_bayar' => $pembayaran->tanggal_bayar->format('Y-m-d H:i'),
                        'metode_bayar' => $pembayaran->metode_bayar,
                        'jumlah_bayar' => (float) $pembayaran->jumlah_bayar,
                        'kasir' => $pembayaran->user->name,
                        'patient' => [
                            'id' => $pembayaran->billing->registrasi->patient->id,
                            'nama_pasien' => $pembayaran->billing->registrasi->patient->nama_pasien,
                            'no_rm' => $pembayaran->billing->registrasi->patient->no_rm,
                        ],
                        'poli' => $pembayaran->billing->registrasi->poli->nama_poli ?? '',
                        'ruangan' => $pembayaran->billing->registrasi->ruangan->nama_ruangan ?? ''
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $detail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unit detail',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getGroupField($unitType)
    {
        $fields = [
            'poli' => 'registrasi.poli.nama_poli',
            'ruangan' => 'registrasi.ruangan.nama_ruangan',
        ];

        return $fields[$unitType] ?? 'umum';
    }
}
