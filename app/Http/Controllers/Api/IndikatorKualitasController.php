<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawatInap;
use App\Models\Registration;
use App\Models\DiagnosisPasien;
use Illuminate\Http\Request;
use Carbon\Carbon;

class IndikatorKualitasController extends Controller
{
    /**
     * Mendapatkan indikator kualitas rumah sakit
     */
    public function index(Request $request)
    {
        try {
            $periode = $request->get('periode', 'bulanan'); // harian, mingguan, bulanan, tahunan
            $tanggalAwal = Carbon::parse($request->get('tanggal_awal', now()->startOfMonth()->toDateString()));
            $tanggalAkhir = Carbon::parse($request->get('tanggal_akhir', now()->endOfMonth()->toDateString()));

            // Tingkat Infeksi Nosokomial
            $tingkatInfeksi = $this->hitungTingkatInfeksi($tanggalAwal, $tanggalAkhir);

            // Tingkat Readmisi
            $tingkatReadmisi = $this->hitungTingkatReadmisi($tanggalAwal, $tanggalAkhir);

            // Data grafik tingkat infeksi (per bulan dalam 1 tahun terakhir)
            $grafikInfeksi = $this->ambilGrafikTingkatInfeksi($tanggalAwal->copy()->subMonths(11), $tanggalAkhir);

            // Data grafik tingkat readmisi (per bulan dalam 1 tahun terakhir)
            $grafikReadmisi = $this->ambilGrafikTingkatReadmisi($tanggalAwal->copy()->subMonths(11), $tanggalAkhir);

            return response()->json([
                'success' => true,
                'data' => [
                    'ringkasan' => [
                        'tingkat_infeksi_nosokomial' => round($tingkatInfeksi['persentase'], 2),
                        'total_kasus_infeksi' => $tingkatInfeksi['total_kasus'],
                        'total_pasien_rawat_inap' => $tingkatInfeksi['total_pasien'],
                        'tingkat_readmisi' => round($tingkatReadmisi['persentase'], 2),
                        'total_readmisi' => $tingkatReadmisi['total_readmisi'],
                        'total_discharge' => $tingkatReadmisi['total_discharge'],
                        'periode' => [
                            'awal' => $tanggalAwal->toDateString(),
                            'akhir' => $tanggalAkhir->toDateString(),
                            'tipe' => $periode,
                        ]
                    ],
                    'grafik' => [
                        'tingkat_infeksi' => $grafikInfeksi,
                        'tingkat_readmisi' => $grafikReadmisi,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data indikator kualitas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghitung tingkat infeksi nosokomial
     */
    private function hitungTingkatInfeksi(Carbon $tanggalAwal, Carbon $tanggalAkhir)
    {
        // Total pasien rawat inap dalam periode
        $totalPasienRawatInap = RawatInap::whereBetween('tanggal_masuk', [$tanggalAwal, $tanggalAkhir])
            ->whereNotNull('tanggal_keluar')
            ->count();

        // Kasus infeksi nosokomial - berdasarkan diagnosis dengan kode ICD mulai A atau B
        $kasusInfeksi = DiagnosisPasien::whereHas('diagnosis', function($query) {
                $query->where('kode_icd', 'like', 'A%')
                      ->orWhere('kode_icd', 'like', 'B%');
            })
            ->whereHas('registrasi', function($query) use ($tanggalAwal, $tanggalAkhir) {
                $query->whereBetween('created_at', [$tanggalAwal, $tanggalAkhir]);
            })
            ->distinct('pasien_id')
            ->count('pasien_id');

        $persentase = $totalPasienRawatInap > 0 ? ($kasusInfeksi / $totalPasienRawatInap) * 100 : 0;

        return [
            'total_kasus' => $kasusInfeksi,
            'total_pasien' => $totalPasienRawatInap,
            'persentase' => $persentase
        ];
    }

    /**
     * Menghitung tingkat readmisi (pasien kembali dalam 30 hari)
     */
    private function hitungTingkatReadmisi(Carbon $tanggalAwal, Carbon $tanggalAkhir)
    {
        // Total discharge (pasien yang keluar) dalam periode
        $totalDischarge = RawatInap::whereBetween('tanggal_keluar', [$tanggalAwal, $tanggalAkhir])
            ->whereNotNull('tanggal_keluar')
            ->count();

        $totalReadmisi = 0;

        // Ambil semua pasien yang discharge dalam periode
        $dischargePasien = RawatInap::whereBetween('tanggal_keluar', [$tanggalAwal, $tanggalAkhir])
            ->whereNotNull('tanggal_keluar')
            ->with('patient')
            ->get();

        foreach ($dischargePasien as $discharge) {
            // Cek apakah pasien kembali dalam 30 hari setelah discharge
            $readmisiCount = RawatInap::where('patient_id', $discharge->patient_id)
                ->where('tanggal_masuk', '>', $discharge->tanggal_keluar)
                ->where('tanggal_masuk', '<=', $discharge->tanggal_keluar->copy()->addDays(30))
                ->count();

            if ($readmisiCount > 0) {
                $totalReadmisi++;
            }
        }

        $persentase = $totalDischarge > 0 ? ($totalReadmisi / $totalDischarge) * 100 : 0;

        return [
            'total_readmisi' => $totalReadmisi,
            'total_discharge' => $totalDischarge,
            'persentase' => $persentase
        ];
    }

    /**
     * Mengambil data grafik tingkat infeksi per bulan
     */
    private function ambilGrafikTingkatInfeksi(Carbon $tanggalAwal, Carbon $tanggalAkhir)
    {
        $dataGrafik = [];

        $tanggal = $tanggalAwal->copy();
        while ($tanggal <= $tanggalAkhir) {
            $bulanAwal = $tanggal->copy()->startOfMonth();
            $bulanAkhir = $tanggal->copy()->endOfMonth();

            $infeksi = $this->hitungTingkatInfeksi($bulanAwal, $bulanAkhir);

            $dataGrafik[] = [
                'bulan' => $tanggal->format('Y-m'),
                'nama_bulan' => $tanggal->format('M Y'),
                'tingkat_infeksi' => round($infeksi['persentase'], 2),
                'total_kasus' => $infeksi['total_kasus'],
                'total_pasien' => $infeksi['total_pasien']
            ];

            $tanggal->addMonth();
        }

        return $dataGrafik;
    }

    /**
     * Mengambil data grafik tingkat readmisi per bulan
     */
    private function ambilGrafikTingkatReadmisi(Carbon $tanggalAwal, Carbon $tanggalAkhir)
    {
        $dataGrafik = [];

        $tanggal = $tanggalAwal->copy();
        while ($tanggal <= $tanggalAkhir) {
            $bulanAwal = $tanggal->copy()->startOfMonth();
            $bulanAkhir = $tanggal->copy()->endOfMonth();

            $readmisi = $this->hitungTingkatReadmisi($bulanAwal, $bulanAkhir);

            $dataGrafik[] = [
                'bulan' => $tanggal->format('Y-m'),
                'nama_bulan' => $tanggal->format('M Y'),
                'tingkat_readmisi' => round($readmisi['persentase'], 2),
                'total_readmisi' => $readmisi['total_readmisi'],
                'total_discharge' => $readmisi['total_discharge']
            ];

            $tanggal->addMonth();
        }

        return $dataGrafik;
    }
}
