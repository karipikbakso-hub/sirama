<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TodayDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing doctor and poli
        $doctor = DB::table('m_dokter')->first();
        $poli = DB::table('m_poli')->first();
        $penjamin = DB::table('m_penjamin')->first();

        if (!$doctor || !$poli || !$penjamin) {
            $this->command->error('Required master data not found. Please run other seeders first.');
            return;
        }

        // Get existing patients
        $patients = DB::table('patients')->limit(3)->get();

        if ($patients->isEmpty()) {
            $this->command->error('No patients found. Please run patient seeders first.');
            return;
        }

        // Create today's registrations
        $registrations = [
            [
                'registration_no' => 'REG-' . date('Ymd') . '-001',
                'patient_id' => $patients[0]->id,
                'service_unit' => $poli->nama_poli,
                'doctor_id' => $doctor->id,
                'arrival_type' => 'mandiri',
                'payment_method' => 'bpjs',
                'status' => 'registered',
                'notes' => 'Demam tinggi dan batuk berdahak',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_no' => 'REG-' . date('Ymd') . '-002',
                'patient_id' => $patients[1]->id ?? $patients[0]->id,
                'service_unit' => $poli->nama_poli,
                'doctor_id' => $doctor->id,
                'arrival_type' => 'mandiri',
                'payment_method' => 'bpjs',
                'status' => 'registered',
                'notes' => 'Pusing dan mual, suspek hipertensi',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'registration_no' => 'REG-' . date('Ymd') . '-003',
                'patient_id' => $patients[2]->id ?? $patients[0]->id,
                'service_unit' => $poli->nama_poli,
                'doctor_id' => $doctor->id,
                'arrival_type' => 'mandiri',
                'payment_method' => 'bpjs',
                'status' => 'registered',
                'notes' => 'Nyeri perut sebelah kanan bawah',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($registrations as $registration) {
            try {
                DB::table('registrations')->insert($registration);
            } catch (\Exception $e) {
                // Skip if registration number already exists
                if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                    throw $e;
                }
            }
        }

        $this->command->info('Today\'s registration data seeded successfully!');
        $this->command->info('Created ' . count($registrations) . ' registrations for today.');
    }
}
