<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CpptEntrySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some patients and users for seeding
        $patients = DB::table('patients')->limit(5)->get();
        $users = DB::table('users')->where('email', 'like', '%@sirama.com')->get();

        if ($patients->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Tidak ada data pasien atau user untuk seeding CPPT entries');
            return;
        }

        $cpptEntries = [];

        // Sample SOAP notes data
        $soapNotes = [
            [
                'subjektif' => 'Pasien mengeluh nyeri dada sebelah kiri yang menjalar ke lengan kiri, sesak napas, dan berkeringat dingin.',
                'objektif' => 'TD: 160/95 mmHg, Nadi: 110x/menit, RR: 24x/menit, Suhu: 36.8°C. Pasien tampak kesakitan, berkeringat.',
                'asesmen' => 'Suspect Acute Coronary Syndrome - STEMI',
                'planning' => 'Monitor EKG, beri O2 2L/menit, dapatkan akses IV, persiapkan untuk kateterisasi koroner.',
                'instruksi' => 'Pantau tanda vital setiap 15 menit, siapkan trolley resusitasi',
                'evaluasi' => 'Pasien stabil, akan dilakukan pemeriksaan lanjutan'
            ],
            [
                'subjektif' => 'Pasien demam tinggi 3 hari, batuk berdahak, sesak napas saat beraktivitas.',
                'objektif' => 'TD: 120/80 mmHg, Nadi: 95x/menit, RR: 28x/menit, Suhu: 38.5°C. Ronki basah di kedua lapang paru.',
                'asesmen' => 'Pneumonia lobaris dextra',
                'planning' => 'Beri antibiotik IV (Ceftriaxone 2g), mukolitik, antipiretik, istirahat total.',
                'instruksi' => 'Monitor suhu setiap 4 jam, pastikan hidrasi adekuat',
                'evaluasi' => 'Demam belum turun, akan dievaluasi kembali besok pagi'
            ],
            [
                'subjektif' => 'Pasien mengeluh mual dan muntah berulang, tidak bisa makan, nyeri epigastrium.',
                'objektif' => 'TD: 110/70 mmHg, Nadi: 85x/menit, RR: 18x/menit, Suhu: 37.2°C. Abdomen lunak, nyeri tekan epigastrium.',
                'asesmen' => 'Gastritis akut',
                'planning' => 'Beri antiemetik IV, PPI IV, diet cair, pantau tanda perdarahan.',
                'instruksi' => 'Pantau muntah dan nyeri perut, catat intake output',
                'evaluasi' => 'Mual berkurang, akan dilanjutkan terapi konservatif'
            ],
            [
                'subjektif' => 'Pasien jatuh dari tangga, nyeri punggung bawah dan tidak bisa berjalan.',
                'objektif' => 'TD: 130/85 mmHg, Nadi: 88x/menit, RR: 20x/menit, Suhu: 36.9°C. Nyeri tekan vertebra lumbalis.',
                'asesmen' => 'Suspect fraktur vertebra lumbalis',
                'planning' => 'Bed rest, analgetik, persiapkan foto thoracolumbal, konsultasi ortopedi.',
                'instruksi' => 'Jaga imobilisasi, pantau sensorik ekstremitas bawah',
                'evaluasi' => 'Nyeri masih ada, akan dilakukan rontgen hari ini'
            ],
            [
                'subjektif' => 'Pasien diabetes melitus tipe 2 kontrol buruk, gula darah tinggi, gejala poliuria dan polidipsia.',
                'objektif' => 'TD: 140/90 mmHg, Nadi: 82x/menit, RR: 16x/menit, Suhu: 36.7°C. GDS: 320 mg/dL.',
                'asesmen' => 'Diabetes melitus tipe 2 - uncontrolled',
                'planning' => 'Regulasi gula darah dengan insulin, edukasi diet dan olahraga, kontrol HbA1c.',
                'instruksi' => 'Monitor gula darah 4x sehari, edukasi pasien tentang DM',
                'evaluasi' => 'Gula darah turun menjadi 180 mg/dL, akan dilanjutkan terapi'
            ]
        ];

        $shifts = ['pagi', 'siang', 'malam'];
        $statuses = ['draft', 'final'];

        // Create CPPT entries for each patient
        foreach ($patients as $index => $patient) {
            $user = $users->random();
            $soapNote = $soapNotes[$index % count($soapNotes)];

            // Create entries for different days and shifts
            for ($i = 0; $i < 3; $i++) {
                $cpptEntries[] = [
                    'pasien_id' => $patient->id,
                    'registrasi_id' => null, // Could link to registrations if needed
                    'user_id' => $user->id,
                    'tanggal_waktu' => Carbon::now()->subDays(rand(0, 7))->setTime(rand(7, 22), rand(0, 59)),
                    'shift' => $shifts[array_rand($shifts)],
                    'subjektif' => $soapNote['subjektif'],
                    'objektif' => $soapNote['objektif'],
                    'asesmen' => $soapNote['asesmen'],
                    'planning' => $soapNote['planning'],
                    'instruksi' => $soapNote['instruksi'],
                    'evaluasi' => $soapNote['evaluasi'],
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => Carbon::now()->subDays(rand(0, 7)),
                    'updated_at' => Carbon::now()->subDays(rand(0, 3)),
                ];
            }
        }

        DB::table('cppt_entries')->insert($cpptEntries);

        $this->command->info('Berhasil membuat ' . count($cpptEntries) . ' data CPPT entries untuk testing');
    }
}
