<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\Registration;
use App\Models\Sep;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SepSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing registrations and patients
        $registrations = Registration::with('patient')->get();
        $users = User::all();

        if ($registrations->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No registrations or users found. Skipping SEP seeding.');
            return;
        }

        // Create SEPs for some registrations
        $sepData = [];
        $diagnoses = [
            'Demam Berdarah',
            'Pneumonia',
            'Hipertensi',
            'Diabetes Mellitus',
            'Bronkitis',
            'Gastritis',
            'Anemia',
            'Asma',
            'Hepatitis',
            'Tuberkulosis',
            'Stroke',
            'Infeksi Saluran Kemih',
            'Osteoarthritis',
            'Depresi',
            'Thyroid Disorder'
        ];

        $serviceTypes = ['Rawat Jalan', 'Rawat Inap', 'Rawat Darurat', 'Prosedur'];
        $statuses = ['active', 'inactive', 'rejected'];

        // Create SEPs for about 60% of registrations
        $selectedRegistrations = $registrations->random(min((int)($registrations->count() * 0.6), $registrations->count()));

        foreach ($selectedRegistrations as $registration) {
            // Generate BPJS number (16 digits)
            $bpjsNumber = '';
            for ($i = 0; $i < 16; $i++) {
                $bpjsNumber .= mt_rand(0, 9);
            }

            $createdAt = $registration->created_at->copy()->addMinutes(mt_rand(30, 1440)); // 30 minutes to 24 hours after registration

            $sepData[] = [
                'patient_id' => $registration->patient_id,
                'registration_id' => $registration->id,
                'sep_number' => Sep::generateSepNumber(),
                'bpjs_number' => $bpjsNumber,
                'service_type' => $serviceTypes[array_rand($serviceTypes)],
                'diagnosis' => $diagnoses[array_rand($diagnoses)],
                'status' => $statuses[array_rand($statuses)],
                'notes' => mt_rand(0, 1) ? 'SEP dibuat untuk pelayanan kesehatan' : null,
                'created_by' => $users->random()->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt->copy()->addMinutes(mt_rand(0, 60)),
            ];
        }

        // Insert SEPs in chunks to avoid memory issues
        foreach (array_chunk($sepData, 50) as $chunk) {
            Sep::insert($chunk);
        }

        $this->command->info('Created ' . count($sepData) . ' SEP records');
    }
}
