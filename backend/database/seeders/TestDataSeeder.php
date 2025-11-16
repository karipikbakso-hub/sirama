<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test patients
        $patients = [
            [
                'name' => 'Ahmad Surya',
                'mrn' => 'MR001',
                'birth_date' => '1985-05-15',
                'gender' => 'L',
                'address' => 'Jl. Sudirman No. 123, Jakarta',
                'phone' => '081234567890',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Aminah',
                'mrn' => 'MR002',
                'birth_date' => '1990-08-20',
                'gender' => 'P',
                'address' => 'Jl. Thamrin No. 456, Jakarta',
                'phone' => '081234567891',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Budi Santoso',
                'mrn' => 'MR003',
                'birth_date' => '1978-12-10',
                'gender' => 'L',
                'address' => 'Jl. Gatot Subroto No. 789, Jakarta',
                'phone' => '081234567892',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($patients as $patient) {
            DB::table('patients')->insert($patient);
        }

        // Create test doctor
        $doctorId = DB::table('m_dokter')->insertGetId([
            'nama_dokter' => 'Dr. Hendra Wijaya',
            'nip' => '123456789',
            'spesialisasi' => 'Umum',
            'no_sip' => 'SIP001',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create test poli
        $poliId = DB::table('m_poli')->insertGetId([
            'nama_poli' => 'Poli Umum',
            'kode_poli' => 'UMUM',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create test penjamin
        $penjaminId = DB::table('m_penjamin')->insertGetId([
            'nama_penjamin' => 'BPJS Kesehatan',
            'kode_penjamin' => 'BPJS',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create today's registrations
        $registrations = [
            [
                'no_registrasi' => 'REG001',
                'patient_id' => 1,
                'poli_id' => $poliId,
                'dokter_id' => $doctorId,
                'penjamin_id' => $penjaminId,
                'tanggal_registrasi' => today(),
                'jam_registrasi' => '08:00:00',
                'jenis_kunjungan' => 'baru',
                'status' => 'menunggu',
                'keluhan' => 'Demam dan batuk',
                'biaya_registrasi' => 25000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'no_registrasi' => 'REG002',
                'patient_id' => 2,
                'poli_id' => $poliId,
                'dokter_id' => $doctorId,
                'penjamin_id' => $penjaminId,
                'tanggal_registrasi' => today(),
                'jam_registrasi' => '09:00:00',
                'jenis_kunjungan' => 'kontrol',
                'status' => 'menunggu',
                'keluhan' => 'Pusing dan mual',
                'biaya_registrasi' => 25000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'no_registrasi' => 'REG003',
                'patient_id' => 3,
                'poli_id' => $poliId,
                'dokter_id' => $doctorId,
                'penjamin_id' => $penjaminId,
                'tanggal_registrasi' => today(),
                'jam_registrasi' => '10:00:00',
                'jenis_kunjungan' => 'baru',
                'status' => 'menunggu',
                'keluhan' => 'Sakit perut',
                'biaya_registrasi' => 25000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($registrations as $registration) {
            DB::table('registrations')->insert($registration);
        }

        // Create test user for doctor
        DB::table('users')->insert([
            'name' => 'Dr. Hendra Wijaya',
            'email' => 'doctor@test.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Test data seeded successfully!');
        $this->command->info('Doctor login: doctor@test.com / password');
    }
}
