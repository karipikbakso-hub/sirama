<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DistribusiObatSeeder extends Seeder
{
    public function run(): void
    {
        // Cek apakah ada data di tabel-tabel yang dibutuhkan
        $patients = DB::table('patients')->limit(5)->get();
        $resepDetails = DB::table('t_resep_detail')->limit(10)->get();
        $obat = DB::table('m_obat')->limit(5)->get();
        $users = DB::table('users')->where('role', 'perawat')->limit(3)->get();

        if ($patients->isEmpty() || $obat->isEmpty()) {
            echo "Tidak ada data pasien atau obat, skip seeding distribusi obat\n";
            return;
        }

        // Buat data resep dulu jika belum ada
        if ($resepDetails->isEmpty()) {
            $resepIds = [];
            for ($i = 1; $i <= 5; $i++) {
                // Get a registration for the resep
                $registration = DB::table('t_registrasi')->orderBy('id')->first();
                if (!$registration) {
                    // Create a dummy registration if none exists (use a temporary ID for no_registrasi first)
                    $tempId = 1;
                    $registrationId = DB::table('t_registrasi')->insertGetId([
                        'patient_id' => $patients->first()->id ?? 1,
                        'poli_id' => DB::table('m_poli')->first()->id ?? 1,
                        'dokter_id' => DB::table('m_dokter')->first()->id ?? 1,
                        'penjamin_id' => DB::table('m_penjamin')->first()->id ?? 1,
                        'tanggal_registrasi' => Carbon::now()->subDays(rand(0, 7))->toDateString(),
                        'jam_registrasi' => Carbon::now()->subHours(rand(0, 8))->toTimeString(),
                        'no_registrasi' => 'REG-' . date('Y') . '-' . str_pad($tempId, 6, '0', STR_PAD_LEFT),
                        'jenis_kunjungan' => ['baru', 'lama'][array_rand(['baru', 'lama'])],
                        'status' => 'selesai',
                        'keluhan' => 'Pemeriksaan rutin',
                        'biaya_registrasi' => 50000,
                        'created_at' => Carbon::now()->subDays(rand(0, 7)),
                        'updated_at' => Carbon::now(),
                    ]);

                    // Update the no_registrasi with correct ID
                    DB::table('t_registrasi')
                        ->where('id', $registrationId)
                        ->update(['no_registrasi' => 'REG-' . date('Y') . '-' . str_pad($registrationId, 6, '0', STR_PAD_LEFT)]);
                } else {
                    $registrationId = $registration->id;
                }

                $resepId = DB::table('t_resep')->insertGetId([
                    'no_resep' => 'RX-2025-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'tanggal_resep' => Carbon::now()->subDays(rand(0, 7)),
                    'status' => 'final', // valid enum: 'draft','final','dibuat','selesai'
                    'registrasi_id' => $registrationId,
                    'dokter_id' => DB::table('m_dokter')->inRandomOrder()->first()->id ?? 1,
                    'created_at' => Carbon::now()->subDays(rand(0, 7)),
                    'updated_at' => Carbon::now(),
                ]);
                $resepIds[] = $resepId;
            }

            // Buat resep detail
            foreach ($resepIds as $resepId) {
                $selectedObat = $obat->random();
                $jumlah = rand(5, 30);
                $hargaSatuan = rand(1000, 15000);
                $subtotal = $jumlah * $hargaSatuan;

                DB::table('t_resep_detail')->insert([
                    'resep_id' => $resepId,
                    'obat_id' => $selectedObat->id,
                    'jumlah' => $jumlah,
                    'hari' => rand(1, 7),
                    'aturan_pakai' => $this->getRandomAturanPakai(),
                    'harga_satuan' => $hargaSatuan,
                    'subtotal' => $subtotal,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }

            $resepDetails = DB::table('t_resep_detail')->limit(10)->get();
        }

        // Status distribusi
        $statuses = ['menunggu', 'dikeluarkan', 'selesai'];
        $statusWeights = [0.4, 0.3, 0.3]; // 40% menunggu, 30% dikeluarkan, 30% selesai

        $distribusiData = [];

        foreach ($resepDetails as $resepDetail) {
            // Ambil patient secara random
            $patient = $patients->random();

            // Ambil user (perawat) random atau default
            $randomStatus = $this->weightedRandom($statuses, $statusWeights);

            $userId = $users->isNotEmpty() ? $users->random()->id : 1;

            $distribusiData[] = [
                'resep_detail_id' => $resepDetail->id,
                'user_id' => $userId,
                'jumlah_keluar' => $resepDetail->jumlah,
                'harga_satuan' => $resepDetail->harga_satuan,
                'subtotal' => $resepDetail->harga_satuan * $resepDetail->jumlah,
                'status' => $randomStatus,
                'tanggal_keluar' => $randomStatus !== 'menunggu'
                    ? Carbon::now()->subHours(rand(1, 24))
                    : null,
                'catatan' => $this->getRandomCatatan($randomStatus),
                'created_at' => Carbon::now()->subDays(rand(0, 7)),
                'updated_at' => Carbon::now()->subHours(rand(0, 24)),
            ];
        }

        DB::table('t_obat_keluar')->insert($distribusiData);

        echo "✅ Berhasil create " . count($distribusiData) . " data distribusi obat\n";
    }

    private function getRandomAturanPakai()
    {
        $aturan = [
            '3x1 tablet setelah makan',
            '2x1 kapsul sebelum makan',
            '1x1 sendok teh 3 kali sehari',
            '2x2 tablet sehari',
            '3x1 tablet sehari pagi malam',
            '1x1 kapsul setiap 12 jam',
            '2x1 vial subcutan sehari',
        ];
        return $aturan[array_rand($aturan)];
    }

    private function getRandomLokasi()
    {
        $lokasi = [
            'Ruang Ward A-101',
            'Ruang ICU',
            'Ruang Rawat Inap B-205',
            'Ruang Emergency',
            'Ruang Operasi',
            'Poliklinik Dalam',
            'Ruang Isolasi C-307'
        ];
        return $lokasi[array_rand($lokasi)];
    }

    private function getRandomCatatan($status)
    {
        $catatanMenunggu = [
            'Menunggu konfirmasi stok dari apotek',
            'Obat dalam proses persiapan',
            'Menunggu verifikasi resep'
        ];

        $catatanDikeluarkan = [
            'Obat sudah siap didistribusikan ke ruangan',
            'Disimpan di lemari obat ruangan',
            'Telah diverifikasi oleh perawat jaga'
        ];

        $catatanSelesai = [
            'Obat telah diberikan kepada pasien',
            'Diterima oleh keluarga pasien',
            'Tanda tangan telah dilakukan di formulir'
        ];

        switch ($status) {
            case 'menunggu':
                return $catatanMenunggu[array_rand($catatanMenunggu)];
            case 'dikeluarkan':
                return $catatanDikeluarkan[array_rand($catatanDikeluarkan)];
            case 'selesai':
                return $catatanSelesai[array_rand($catatanSelesai)];
            default:
                return 'Catatan distribusi obat';
        }
    }

    private function weightedRandom($values, $weights)
    {
        $totalWeight = array_sum($weights);
        $random = mt_rand(1, $totalWeight);

        foreach ($values as $index => $value) {
            $random -= $weights[$index];
            if ($random <= 0) {
                return $value;
            }
        }

        return $values[0]; // fallback
    }
}
