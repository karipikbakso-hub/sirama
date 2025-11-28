<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create users for different roles
        $users = [
            [
                'name' => 'Admin Sistem',
                'email' => 'admin@sirama.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Petugas Pendaftaran',
                'email' => 'pendaftaran@sirama.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Dokter Umum',
                'email' => 'dokter@sirama.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Apoteker',
                'email' => 'apoteker@sirama.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Perawat',
                'email' => 'perawat@sirama.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Kasir',
                'email' => 'kasir@sirama.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        // Seed master data first
        $this->call([
            // Comprehensive Master Data
            ComprehensiveMasterDataSeeder::class,

            // Patient and Transaction Data
            ComprehensivePatientSeeder::class,

            // Additional Data (Survey, Backup, Audit, etc.)
            AdditionalDataSeeder::class,

            // Legacy seeders (now empty, kept for compatibility)
            MasterTablesSeeder::class,
            NursingMasterDataSeeder::class,
            DoctorSeeder::class,
            MedicineSeeder::class,
            Icd10DiagnosisSeeder::class,
            BpjsConfigurationSeeder::class,
            PatientSeeder::class,
            RegistrationSeeder::class,
            SepSeeder::class,
            LabOrderSeeder::class,
            PatientHistorySeeder::class,
            EmergencyRegistrationSeeder::class,
            QueueManagementSeeder::class,
            PrescriptionTestSeeder::class,
        ]);
    }
}
