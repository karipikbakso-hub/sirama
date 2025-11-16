<?php

namespace Database\Seeders;

use App\Models\Pemeriksaan;
use App\Models\Registration;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ExaminationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some existing data
        $registrations = Registration::with(['patient', 'doctor'])->take(5)->get();
        $doctors = User::where('role', 'dokter')->take(3)->get();

        if ($registrations->isEmpty()) {
            // Create some sample registrations if none exist
            $patients = Patient::take(3)->get();
            $doctors = User::where('role', 'dokter')->take(2)->get();

            if ($patients->isNotEmpty() && $doctors->isNotEmpty()) {
                foreach ($patients as $patient) {
                    Registration::create([
                        'patient_id' => $patient->id,
                        'dokter_id' => $doctors->random()->id,
                        'tanggal_registrasi' => Carbon::now()->subDays(rand(0, 7)),
                        'keluhan' => 'Keluhan rutin',
                        'status' => 'selesai',
                        'no_registrasi' => 'REG-' . strtoupper(uniqid()),
                    ]);
                }
                $registrations = Registration::with(['patient', 'doctor'])->take(3)->get();
            }
        }

        if ($registrations->isNotEmpty()) {
            foreach ($registrations as $registration) {
                Pemeriksaan::create([
                    'registration_id' => $registration->id,
                    'doctor_id' => $registration->dokter_id ?? $doctors->random()->id ?? 1,
                    'patient_id' => $registration->patient_id,

                    // Anamnesis
                    'keluhan_utama' => 'Nyeri dada sebelah kiri, sesak napas, berkeringat dingin',
                    'riwayat_penyakit_sekarang' => 'Keluhan dimulai 2 hari yang lalu setelah aktivitas berat. Nyeri seperti tertusuk, menjalar ke lengan kiri.',
                    'riwayat_penyakit_dahulu' => 'Hipertensi sejak 5 tahun lalu, kontrol teratur',
                    'riwayat_penyakit_keluarga' => 'Ayah meninggal karena serangan jantung',
                    'riwayat_alergi' => 'Alergi aspirin',
                    'riwayat_pengobatan' => 'Menggunakan kaptopril 25mg sehari',

                    // Vital Signs
                    'tanda_vital' => [
                        'blood_pressure' => '150/95',
                        'heart_rate' => '95',
                        'temperature' => '36.8',
                        'respiration_rate' => '20',
                        'oxygen_saturation' => '96',
                        'weight' => '75',
                        'height' => '170',
                        'bmi' => 25.95
                    ],

                    // Physical Examination
                    'keadaan_umum' => 'Pasien tampak sakit sedang, kesadaran compos mentis',
                    'kesadaran' => 'Compos mentis',
                    'thorax' => 'Jantung: irama reguler, murmur (-), Paru: suara nafas vesikuler, ronki (-)',
                    'abdomen' => 'Supel, nyeri tekan (-)',
                    'ekstremitas' => 'Akral hangat, edema (-)',

                    // Diagnosis
                    'diagnosis_utama' => 'Angina Pektoris',
                    'diagnosis_sekunder' => 'Hipertensi Grade 2',
                    'diagnosis_banding' => 'Pneumonia, GERD',

                    // Treatment
                    'tindakan' => ['EKG', 'Laboratorium darah', 'Rontgen thorax'],
                    'terapi' => '1. Istirahat total\n2. Diet rendah garam\n3. Obat: Captopril 25mg 3x1, Aspirin 80mg 1x1',
                    'rencana_tindak_lanjut' => 'Kontrol kembali dalam 1 minggu, lakukan treadmill test',
                    'tanggal_kontrol' => Carbon::now()->addDays(7)->format('Y-m-d'),
                    'instruksi_pasien' => 'Hindari aktivitas berat, jaga pola makan, kontrol tekanan darah rutin',

                    // Status
                    'status' => 'completed',
                    'tanggal_pemeriksaan' => Carbon::now()->subDays(rand(0, 3)),
                    'catatan_dokter' => 'Pasien perlu edukasi tentang penyakit jantung dan modifikasi gaya hidup',

                    // Audit
                    'created_by' => $registration->dokter_id ?? 1,
                    'updated_by' => $registration->dokter_id ?? 1,
                ]);
            }
        }

        // Create additional sample examinations
        $sampleExaminations = [
            [
                'keluhan_utama' => 'Demam tinggi, batuk berdahak, sesak napas',
                'diagnosis_utama' => 'Pneumonia Lobus Inferior Dekstra',
                'terapi' => '1. Antibiotik: Levofloxacin 500mg 1x1 selama 7 hari\n2. Paracetamol 500mg jika demam\n3. Istirahat total',
                'status' => 'completed'
            ],
            [
                'keluhan_utama' => 'Mual, muntah, nyeri perut kanan atas',
                'diagnosis_utama' => 'Cholelithiasis',
                'terapi' => '1. Diet rendah lemak\n2. Analgesik: Tramadol 50mg jika nyeri\n3. Konsultasi bedah',
                'status' => 'completed'
            ],
            [
                'keluhan_utama' => 'Kontrol diabetes melitus',
                'diagnosis_utama' => 'Diabetes Melitus Tipe 2 - Terkontrol',
                'terapi' => '1. Metformin 500mg 2x1\n2. Diet dan olahraga teratur\n3. Kontrol gula darah',
                'status' => 'completed'
            ]
        ];

        foreach ($sampleExaminations as $exam) {
            if ($registrations->isNotEmpty()) {
                $reg = $registrations->random();
                Pemeriksaan::create([
                    'registration_id' => $reg->id,
                    'doctor_id' => $reg->dokter_id ?? $doctors->random()->id ?? 1,
                    'patient_id' => $reg->patient_id,
                    'keluhan_utama' => $exam['keluhan_utama'],
                    'diagnosis_utama' => $exam['diagnosis_utama'],
                    'terapi' => $exam['terapi'],
                    'status' => $exam['status'],
                    'tanggal_pemeriksaan' => Carbon::now()->subDays(rand(0, 7)),
                    'created_by' => $reg->dokter_id ?? 1,
                    'updated_by' => $reg->dokter_id ?? 1,
                ]);
            }
        }
    }
}
