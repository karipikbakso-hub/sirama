<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ExecutiveDashboardController extends Controller
{
    /**
     * Get executive dashboard KPI data
     */
    public function getKPIData(Request $request)
    {
        $period = $request->get('period', '30d'); // 7d, 30d, 90d, 1y
        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : $this->getStartDate($period);
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : now();

        return response()->json([
            'kpis' => $this->getMainKPIs($startDate, $endDate),
            'charts' => [
                'kunjungan' => $this->getKunjunganTrends($startDate, $endDate),
                'pendapatan' => $this->getPendapatanTrends($startDate, $endDate),
                'bor' => $this->getBORTrends($startDate, $endDate),
                'los' => $this->getLOSDistribution($startDate, $endDate),
                'kunjungan_per_poli' => $this->getKunjunganPerPoli($startDate, $endDate),
                'top_diagnosa' => $this->getTopDiagnosa($startDate, $endDate),
                'top_obat' => $this->getTopObat($startDate, $endDate),
            ],
            'alerts' => $this->getAlerts($startDate, $endDate),
            'period' => $period,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Get main KPI metrics
     */
    private function getMainKPIs($startDate, $endDate)
    {
        // Kunjungan (dari t_registrasi)
        $totalKunjungan = DB::table('t_registrasi')
            ->where('created_at', '>=', $startDate)
            ->count();

        $kunjunganHariIni = DB::table('t_registrasi')
            ->whereDate('created_at', today())
            ->count();

        $kunjunganKemarin = DB::table('t_registrasi')
            ->whereDate('created_at', today()->subDay())
            ->count();

        $persentaseKunjungan = $kunjunganKemarin > 0 ?
            (($kunjunganHariIni - $kunjunganKemarin) / $kunjunganKemarin) * 100 : 0;

        // Pendapatan (dari t_billing)
        $totalPendapatan = DB::table('t_billing')
            ->where('created_at', '>=', $startDate)
            ->where('status', 'lunas')
            ->sum('total_bayar');

        $pendapatanHariIni = DB::table('t_billing')
            ->whereDate('created_at', today())
            ->where('status', 'lunas')
            ->sum('total_bayar');

        $pendapatanKemarin = DB::table('t_billing')
            ->whereDate('created_at', today()->subDay())
            ->where('status', 'lunas')
            ->sum('total_bayar');

        $persentasePendapatan = $pendapatanKemarin > 0 ?
            (($pendapatanHariIni - $pendapatanKemarin) / $pendapatanKemarin) * 100 : 0;

        // BOR (Bed Occupancy Rate) dari t_rawat_inap dan m_ruangan
        $borData = $this->calculateBOR($startDate, $endDate);

        // LOS (Length of Stay) dari t_rawat_inap
        $losData = $this->calculateAverageLOS($startDate, $endDate);

        // Revenue per hari rata-rata
        $totalDays = max(1, now()->diffInDays($startDate) + 1);
        $avgRevenuePerDay = $totalPendapatan / $totalDays;

        // Growth percentage (bandingkan dengan periode sebelumnya)
        $previousPeriodStart = Carbon::parse($startDate)->subDays($totalDays);
        $previousPeriodRevenue = DB::table('t_billing')
            ->where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $startDate)
            ->where('status', 'lunas')
            ->sum('total_bayar');

        $growthPercentage = $previousPeriodRevenue > 0 ?
            (($totalPendapatan - $previousPeriodRevenue) / $previousPeriodRevenue) * 100 : 0;

        return [
            [
                'nama' => 'Total Kunjungan',
                'nilai' => number_format($totalKunjungan),
                'satuan' => 'pasien',
                'hari_ini' => number_format($kunjunganHariIni),
                'persentase' => round($persentaseKunjungan, 1),
                'trend' => $persentaseKunjungan >= 0 ? 'naik' : 'turun',
                'ikon' => 'FaUsers',
                'warna' => '#3B82F6'
            ],
            [
                'nama' => 'Total Pendapatan',
                'nilai' => 'Rp ' . number_format($totalPendapatan, 0, ',', '.'),
                'satuan' => 'rupiah',
                'hari_ini' => 'Rp ' . number_format($pendapatanHariIni, 0, ',', '.'),
                'persentase' => round($persentasePendapatan, 1),
                'trend' => $persentasePendapatan >= 0 ? 'naik' : 'turun',
                'ikon' => 'FaMoneyBillWave',
                'warna' => '#10B981'
            ],
            [
                'nama' => 'Revenue per Hari Rata-rata',
                'nilai' => 'Rp ' . number_format($avgRevenuePerDay, 0, ',', '.'),
                'satuan' => 'rupiah',
                'hari_ini' => 'Rp ' . number_format($pendapatanHariIni, 0, ',', '.'),
                'persentase' => round($persentasePendapatan, 1),
                'trend' => $persentasePendapatan >= 0 ? 'naik' : 'turun',
                'ikon' => 'FaMoneyBillWave',
                'warna' => '#059669'
            ],
            [
                'nama' => 'Growth Percentage',
                'nilai' => number_format($growthPercentage, 1) . '%',
                'satuan' => 'persen',
                'hari_ini' => number_format($growthPercentage, 1) . '%',
                'persentase' => round($growthPercentage, 1),
                'trend' => $growthPercentage >= 0 ? 'naik' : 'turun',
                'ikon' => 'FaChartLine',
                'warna' => '#7C3AED'
            ],
            [
                'nama' => 'Bed Occupancy Rate (BOR)',
                'nilai' => number_format($borData['bor'], 1) . '%',
                'satuan' => 'persen',
                'hari_ini' => number_format($borData['bor'], 1) . '%',
                'persentase' => 0, // BOR biasanya tidak dibandingkan harian
                'trend' => 'stabil',
                'ikon' => 'FaBed',
                'warna' => '#8B5CF6'
            ],
            [
                'nama' => 'Average Length of Stay (LOS)',
                'nilai' => number_format($losData['average_los'], 1) . ' hari',
                'satuan' => 'hari',
                'hari_ini' => number_format($losData['average_los'], 1) . ' hari',
                'persentase' => 0, // LOS biasanya tidak dibandingkan harian
                'trend' => 'stabil',
                'ikon' => 'FaClock',
                'warna' => '#F59E0B'
            ],
        ];
    }

    /**
     * Calculate BOR (Bed Occupancy Rate)
     */
    private function calculateBOR($startDate, $endDate = null)
    {
        // Get all inpatient rooms
        $ruangans = DB::table('m_ruangan')
            ->where('jenis_ruangan', 'rawat_inap')
            ->get();

        $totalBeds = $ruangans->sum('kapasitas');
        $totalOccupiedBeds = 0;

        foreach ($ruangans as $ruangan) {
            // Count currently occupied beds for this room
            $occupiedBeds = DB::table('t_rawat_inap')
                ->where('ruangan_id', $ruangan->id)
                ->where('status', 'dirawat')
                ->where('tanggal_masuk', '>=', $startDate)
                ->count();
            $totalOccupiedBeds += $occupiedBeds;
        }

        $bor = $totalBeds > 0 ? ($totalOccupiedBeds / $totalBeds) * 100 : 0;

        return [
            'bor' => round($bor, 1),
            'total_beds' => $totalBeds,
            'occupied_beds' => $totalOccupiedBeds,
            'empty_beds' => $totalBeds - $totalOccupiedBeds,
        ];
    }

    /**
     * Calculate Average Length of Stay (LOS)
     */
    private function calculateAverageLOS($startDate, $endDate = null)
    {
        $dischargedPatients = DB::table('t_rawat_inap')
            ->whereIn('status', ['keluar', 'meninggal', 'pindah_ruangan'])
            ->where('tanggal_keluar', '>=', $startDate)
            ->whereNotNull('tanggal_keluar')
            ->get();

        $totalDays = 0;
        $totalPatients = 0;

        foreach ($dischargedPatients as $patient) {
            $tanggalMasuk = Carbon::parse($patient->tanggal_masuk);
            $tanggalKeluar = Carbon::parse($patient->tanggal_keluar);
            $days = $tanggalMasuk->diffInDays($tanggalKeluar);
            $totalDays += $days;
            $totalPatients++;
        }

        $averageLOS = $totalPatients > 0 ? $totalDays / $totalPatients : 0;

        return [
            'average_los' => round($averageLOS, 1),
            'total_patients' => $totalPatients,
            'total_days' => $totalDays,
        ];
    }

    /**
     * Get kunjungan trends for charts
     */
    private function getKunjunganTrends($startDate, $endDate = null)
    {
        $trends = DB::table('t_registrasi')
            ->select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as jumlah')
            )
            ->where('t_registrasi.created_at', '>=', $startDate)
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => Carbon::parse($item->tanggal)->format('d/m'),
                    'kunjungan' => (int) $item->jumlah,
                ];
            });

        return $trends;
    }

    /**
     * Get pendapatan trends for charts
     */
    private function getPendapatanTrends($startDate, $endDate = null)
    {
        $query = DB::table('t_billing')
            ->select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('SUM(total_bayar) as total')
            )
            ->where('created_at', '>=', $startDate)
            ->where('status', 'lunas');

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $trends = $query->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => Carbon::parse($item->tanggal)->format('d/m'),
                    'pendapatan' => (float) $item->total,
                ];
            });

        return $trends;
    }

    /**
     * Get BOR trends for charts
     */
    private function getBORTrends($startDate, $endDate = null)
    {
        $endDate = now();
        $dateRange = [];

        // Generate date range
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($start->lte($end)) {
            $dateRange[] = $start->format('Y-m-d');
            $start->addDay();
        }

        $trends = [];
        foreach ($dateRange as $date) {
            $borData = $this->calculateBOR($date);

            $trends[] = [
                'tanggal' => Carbon::parse($date)->format('d/m'),
                'bor' => $borData['bor'],
            ];
        }

        return $trends;
    }

    /**
     * Get LOS distribution for charts
     */
    private function getLOSDistribution($startDate, $endDate = null)
    {
        $losCategories = [
            ['range' => '1-3 hari', 'min' => 1, 'max' => 3],
            ['range' => '4-7 hari', 'min' => 4, 'max' => 7],
            ['range' => '8-14 hari', 'min' => 8, 'max' => 14],
            ['range' => '>14 hari', 'min' => 15, 'max' => 999],
        ];

        $distribution = [];
        foreach ($losCategories as $category) {
            $patients = DB::table('t_rawat_inap')
                ->whereIn('status', ['keluar', 'meninggal', 'pindah_ruangan'])
                ->where('tanggal_keluar', '>=', $startDate)
                ->whereNotNull('tanggal_keluar')
                ->get()
                ->filter(function ($patient) use ($category) {
                    $tanggalMasuk = Carbon::parse($patient->tanggal_masuk);
                    $tanggalKeluar = Carbon::parse($patient->tanggal_keluar);
                    $days = $tanggalMasuk->diffInDays($tanggalKeluar);
                    return $days >= $category['min'] && $days <= $category['max'];
                })
                ->count();

            $distribution[] = [
                'range' => $category['range'],
                'pasien' => $patients,
            ];
        }

        return $distribution;
    }

    /**
     * Get kunjungan per poli for charts
     */
    private function getKunjunganPerPoli($startDate, $endDate = null)
    {
        $query = DB::table('t_registrasi')
            ->join('m_poli', 't_registrasi.poli_id', '=', 'm_poli.id')
            ->select(
                'm_poli.nama_poli as poli',
                DB::raw('COUNT(*) as jumlah')
            )
            ->where('t_registrasi.created_at', '>=', $startDate);

        if ($endDate) {
            $query->where('t_registrasi.created_at', '<=', $endDate);
        }

        $data = $query->groupBy('m_poli.id', 'm_poli.nama_poli')
            ->orderBy('jumlah', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'poli' => $item->poli,
                    'jumlah' => (int) $item->jumlah,
                ];
            });

        return $data;
    }

    /**
     * Get top 10 diagnosa
     */
    private function getTopDiagnosa($startDate, $endDate = null)
    {
        $query = DB::table('t_diagnosis_pasien')
            ->join('m_icd10', 't_diagnosis_pasien.icd10_id', '=', 'm_icd10.id')
            ->select(
                'm_icd10.kode_icd',
                'm_icd10.nama_diagnosis',
                DB::raw('COUNT(*) as jumlah')
            )
            ->where('t_diagnosis_pasien.created_at', '>=', $startDate);

        if ($endDate) {
            $query->where('t_diagnosis_pasien.created_at', '<=', $endDate);
        }

        $data = $query->groupBy('m_icd10.id', 'm_icd10.kode_icd', 'm_icd10.nama_diagnosis')
            ->orderBy('jumlah', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'kode' => $item->kode_icd,
                    'nama' => $item->nama_diagnosis,
                    'jumlah' => (int) $item->jumlah,
                ];
            });

        return $data;
    }

    /**
     * Get top 10 obat terlaris
     */
    private function getTopObat($startDate, $endDate = null)
    {
        $query = DB::table('t_obat_keluar')
            ->join('m_obat', 't_obat_keluar.medicine_id', '=', 'm_obat.id')
            ->select(
                'm_obat.nama_obat',
                DB::raw('SUM(t_obat_keluar.quantity_given) as total_terjual')
            )
            ->where('t_obat_keluar.given_at', '>=', $startDate)
            ->where('t_obat_keluar.status', 'selesai');

        if ($endDate) {
            $query->where('t_obat_keluar.given_at', '<=', $endDate);
        }

        $data = $query->groupBy('m_obat.id', 'm_obat.nama_obat')
            ->orderBy('total_terjual', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'nama_obat' => $item->nama_obat,
                    'total_terjual' => (int) $item->total_terjual,
                ];
            });

        return $data;
    }

    /**
     * Get alerts for dashboard
     */
    private function getAlerts($startDate, $endDate = null)
    {
        $alerts = [];

        // BOR alert - jika BOR > 85%
        $borData = $this->calculateBOR($startDate);
        if ($borData['bor'] > 85) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'BOR Tinggi',
                'message' => "Bed Occupancy Rate saat ini {$borData['bor']}% (target: ≤85%)",
                'action' => 'Periksa kapasitas tempat tidur'
            ];
        }

        // LOS alert - jika LOS > 5 hari
        $losData = $this->calculateAverageLOS($startDate);
        if ($losData['average_los'] > 5) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'LOS Tinggi',
                'message' => "Average Length of Stay {$losData['average_los']} hari (target: ≤5 hari)",
                'action' => 'Optimalkan proses perawatan'
            ];
        }

        // Revenue growth alert - jika growth negative
        $totalDays = max(1, now()->diffInDays($startDate) + 1);
        $totalPendapatan = DB::table('t_billing')
            ->where('created_at', '>=', $startDate)
            ->where('status', 'lunas')
            ->sum('total_bayar');

        $previousPeriodStart = Carbon::parse($startDate)->subDays($totalDays);
        $previousPeriodRevenue = DB::table('t_billing')
            ->where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $startDate)
            ->where('status', 'lunas')
            ->sum('total_bayar');

        $growthPercentage = $previousPeriodRevenue > 0 ?
            (($totalPendapatan - $previousPeriodRevenue) / $previousPeriodRevenue) * 100 : 0;

        if ($growthPercentage < -10) {
            $alerts[] = [
                'type' => 'danger',
                'title' => 'Penurunan Pendapatan',
                'message' => "Pendapatan turun {$growthPercentage}% dibanding periode sebelumnya",
                'action' => 'Evaluasi strategi pemasaran'
            ];
        }

        // Patient satisfaction alert (jika ada data survey)
        $avgSatisfaction = DB::table('t_hasil_survey')
            ->where('created_at', '>=', $startDate)
            ->avg('nilai_rata_rata');

        if ($avgSatisfaction && $avgSatisfaction < 80) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Kepuasan Pasien Rendah',
                'message' => "Rata-rata kepuasan pasien: {$avgSatisfaction} (target: ≥80)",
                'action' => 'Tingkatkan layanan'
            ];
        }

        return $alerts;
    }

    /**
     * Get start date based on period
     */
    private function getStartDate($period)
    {
        return match($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30),
        };
    }
}
