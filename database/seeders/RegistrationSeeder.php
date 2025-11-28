<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Registration;
use App\Models\Patient;
use App\Models\User;
use App\Models\QueueManagement;

class RegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing patients
        $patients = Patient::limit(10)->get();
        $doctors = User::where('role', 'dokter')->limit(5)->get();

        if ($patients->isEmpty()) {
            $this->command->info('No patients found. Please run PatientSeeder first.');
            return;
        }

        $today = today();
        $registrations = [];

        foreach ($patients as $index => $patient) {
            $doctor = $doctors->isNotEmpty() ? $doctors->random() : null;
            $serviceUnit = ['Umum', 'Poli Penyakit Dalam', 'Poli Anak', 'Poli Kandungan'][rand(0, 3)];

            $registration = [
                'patient_id' => $patient->id,
                'registration_no' => 'REG-' . date('Ymd') . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'service_unit' => $serviceUnit,
                'doctor_id' => $doctor ? $doctor->id : null,
                'arrival_type' => ['jalan', 'darurat'][rand(0, 1)],
                'referral_source' => null,
                'payment_method' => ['tunai', 'bpjs', 'asuransi'][rand(0, 2)],
                'insurance_number' => null,
                'queue_number' => $serviceUnit[0] . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'status' => ['registered', 'checked-in', 'completed'][rand(0, 2)],
                'notes' => null,
                'created_by' => 1, // Assuming admin user exists
                'created_at' => $today,
                'updated_at' => $today
            ];

            $registrations[] = $registration;
        }

        foreach ($registrations as $registration) {
            $reg = Registration::create($registration);

            // Create queue management entry
            QueueManagement::create([
                'registration_id' => $reg->id,
                'poli_id' => rand(1, 5), // Assuming poli IDs exist
                'current_number' => $reg->queue_number,
                'status' => $reg->status === 'completed' ? 'completed' : 'active',
                'priority' => rand(1, 5),
                'estimated_wait_time' => rand(10, 60),
                'called_at' => $reg->status !== 'registered' ? now() : null,
                'completed_at' => $reg->status === 'completed' ? now() : null,
                'created_at' => $today,
                'updated_at' => $today
            ]);
        }

        $this->command->info('Created ' . count($registrations) . ' registrations with queue management entries.');
    }
}
