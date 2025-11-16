<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExecutiveDashboardController extends Controller
{
    /**
     * Get executive dashboard KPI data
     */
    public function getKPIData(Request $request)
    {
        $period = $request->get('period', '30d'); // 7d, 30d, 90d, 1y
        $startDate = $this->getStartDate($period);

        return response()->json([
            'kpis' => $this->getMainKPIs($startDate),
            'charts' => [
                'kunjungan' => $this->getKunjunganTrends($startDate),
                'pendapatan' => $this->getPendapatanTrends($startDate),
                'bor' => $this->getBORTrends($startDate),
                'los' => $this->getLOSDistribution($startDate),
            ],
            'period' => $period,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Get main KPI metrics
     */
    private function getMainKPIs($startDate)
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
        $borData = $this->calculateBOR($startDate);

        // LOS (Length of Stay) dari t_rawat_inap
        $losData = $this->calculateAverageLOS($startDate);

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
    private function calculateBOR($startDate)
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
    private function calculateAverageLOS($startDate)
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
    private function getKunjunganTrends($startDate)
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
    private function getPendapatanTrends($startDate)
    {
        $trends = DB::table('t_billing')
            ->select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('SUM(total_bayar) as total')
            )
            ->where('created_at', '>=', $startDate)
            ->where('status', 'lunas')
            ->groupBy('tanggal')
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
    private function getBORTrends($startDate)
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
    private function getLOSDistribution($startDate)
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
