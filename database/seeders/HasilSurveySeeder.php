<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\HasilSurvey;

class HasilSurveySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $surveys = [];

        // Data survey untuk beberapa bulan kebelakang
        for ($month = 1; $month <= 6; $month++) {
            $year = $month > 5 ? 2024 : 2025; // Mix data across years
            $monthNumber = $month > 5 ? $month - 5 : $month;

            // Generate 10-15 surveys per month
            $surveysPerMonth = rand(10, 15);

            for ($i = 0; $i < $surveysPerMonth; $i++) {
                $tanggal = now()->setYear($year)->setMonth($monthNumber)->setDay(rand(1, 28));

                // Survey questions Indonesian hospital survey
                $ratings = [
                    'kesopanan_petugas' => rand(3, 5),
                    'kecepatan_pelayanan' => rand(3, 5),
                    'kualitas_pelayanan' => rand(3, 5),
                    'fasilitas_rs' => rand(3, 5),
                    'kemudahan_akses' => rand(3, 5),
                    'kebersihan_rs' => rand(3, 5),
                    'harga_layanan' => rand(2, 5),
                    'komunikasi_dokter' => rand(3, 5),
                    'pelayanan_keperawatan' => rand(3, 5),
                    'proses_administrasi' => rand(2, 5)
                ];

                // Calculate average
                $averageRating = round(array_sum($ratings) / count($ratings), 2);

                $komentarTemplates = [
                    'Pelayanan sangat baik dan memuaskan',
                    'Tim medis sangat profesional',
                    'Waktu tunggu cukup lama, perlu ditingkatkan',
                    'Fasilitas kelas dunia, sangat nyaman',
                    'Proses pendaftaran kurang lancar',
                    'Dokter sangat sabar dan jelas menjelaskan',
                    'Perawat sangat perhatian dan telaten',
                    'Kamar bersih dan nyaman',
                    'Harga layanan terjangkau',
                    'Sistem antrian perlu diperbaiki',
                    'Tidak ada keluhan, semua baik',
                    'Pelayanan farmasi sangat cepat',
                    'Proses pembayaran lancar',
                    'Sarana parkir kurang luas',
                    'Tempat makan terjangkau dan bersih'
                ];

                $ageGroups = ['anak', 'remaja', 'dewasa', 'lansia'];
                $serviceTypes = ['rawat_jalan', 'rawat_inap', 'gawat_darurat'];

                $surveys[] = [
                    'patient_id' => null, // Will be set if we have patients
                    'registration_id' => null, // No registrations for survey demo
                    'jenis_layanan' => $serviceTypes[array_rand($serviceTypes)],
                    'tanggal_survey' => $tanggal->format('Y-m-d'),
                    'ratings' => $ratings,
                    'nilai_rata_rata' => $averageRating,
                    'komentar' => $komentarTemplates[array_rand($komentarTemplates)],
                    'kelompok_usia' => $ageGroups[array_rand($ageGroups)],
                    'jenis_kelamin' => rand(0, 1) ? 'L' : 'P',
                    'disarankan' => rand(1, 10) > 3, // 70% chance recommend
                    'created_by' => 1,
                    'created_at' => $tanggal,
                    'updated_at' => $tanggal,
                ];
            }
        }

        // Insert in chunks to avoid memory issues
        foreach (array_chunk($surveys, 50) as $chunk) {
            HasilSurvey::insert($chunk);
        }

        $this->command->info('Generated ' . count($surveys) . ' survey records');
    }
}
