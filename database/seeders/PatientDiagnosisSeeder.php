<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PatientDiagnosisSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some patients, diagnoses, and users for seeding
        $patients = DB::table('patients')->limit(8)->get();
        $diagnoses = DB::table('m_diagnosa')->where('aktif', true)->limit(7)->get();
        $users = DB::table('users')->where('email', 'like', '%@sirama.com')->get();

        if ($patients->isEmpty() || $diagnoses->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Tidak ada data pasien, diagnosis, atau user untuk seeding diagnosis pasien');
            return;
        }

        $patientDiagnoses = [];

        // Sample diagnosis notes
        $diagnosisNotes = [
            'Pasien datang dengan keluhan utama demam tinggi dan batuk produktif',
            'Diagnosis berdasarkan gejala klinis dan pemeriksaan fisik',
            'Sudah dilakukan pemeriksaan penunjang berupa foto toraks',
            'Pasien responsif terhadap terapi yang diberikan',
            'Perlu dilakukan kontrol ulang dalam 1 minggu',
            'Diagnosis sementara, perlu konfirmasi dengan pemeriksaan lanjutan',
            'Pasien sudah mendapat edukasi tentang penyakitnya',
            'Rekomendasi istirahat total dan minum obat teratur'
        ];

        $tipeDiagnoses = ['utama', 'sekunder', 'komorbiditas'];
        $kepastians = ['terkonfirmasi', 'presumtif', 'rule_out'];

        // Create diagnoses for each patient
        foreach ($patients as $index => $patient) {
            $user = $users->random();
            $numDiagnoses = rand(1, 3); // Each patient gets 1-3 diagnoses

            for ($i = 0; $i < $numDiagnoses; $i++) {
                $diagnosis = $diagnoses->random();

                $patientDiagnoses[] = [
                    'pasien_id' => $patient->id,
                    'registrasi_id' => null, // Could link to registrations if needed
                    'diagnosis_id' => $diagnosis->id,
                    'dokter_id' => $user->id,
                    'tipe_diagnosis' => $tipeDiagnoses[array_rand($tipeDiagnoses)],
                    'kepastian' => $kepastians[array_rand($kepastians)],
                    'catatan' => $diagnosisNotes[array_rand($diagnosisNotes)],
                    'tanggal_diagnosis' => Carbon::now()->subDays(rand(0, 30)),
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                    'updated_at' => Carbon::now()->subDays(rand(0, 7)),
                ];
            }
        }

        DB::table('t_diagnosis_pasien')->insert($patientDiagnoses);

        $this->command->info('Berhasil membuat ' . count($patientDiagnoses) . ' data diagnosis pasien untuk testing');
    }
}
