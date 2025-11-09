<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = [
            [
                'mrn' => 'MR-2025-001',
                'name' => 'Ahmad Susanto',
                'nik' => '1234567890123456',
                'birth_date' => '1990-05-15',
                'gender' => 'L',
                'phone' => '081234567890',
                'address' => 'Jl. Merdeka No. 123, Yogyakarta',
                'emergency_contact' => '081987654321',
                'bpjs_number' => '00012345678901',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-002',
                'name' => 'Siti Aminah',
                'nik' => '2345678901234567',
                'birth_date' => '1985-12-03',
                'gender' => 'P',
                'phone' => '082198765432',
                'address' => 'Jl. Malioboro No. 45, Yogyakarta',
                'emergency_contact' => '081234567891',
                'bpjs_number' => '00012345678902',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-003',
                'name' => 'Budi Santoso',
                'nik' => '3456789012345678',
                'birth_date' => '1978-08-20',
                'gender' => 'L',
                'phone' => '083456789012',
                'address' => 'Jl. Prawirotaman No. 67, Yogyakarta',
                'emergency_contact' => '082345678901',
                'bpjs_number' => '00012345678903',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-004',
                'name' => 'Dewi Lestari',
                'nik' => '4567890123456789',
                'birth_date' => '1992-03-10',
                'gender' => 'P',
                'phone' => '084567890123',
                'address' => 'Jl. Affandi No. 89, Yogyakarta',
                'emergency_contact' => '083456789012',
                'bpjs_number' => '00012345678904',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-005',
                'name' => 'Joko Widodo',
                'nik' => '5678901234567890',
                'birth_date' => '1970-11-25',
                'gender' => 'L',
                'phone' => '085678901234',
                'address' => 'Jl. Gejayan No. 12, Yogyakarta',
                'emergency_contact' => '084567890123',
                'bpjs_number' => '00012345678905',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-006',
                'name' => 'Rina Sari',
                'nik' => '6789012345678901',
                'birth_date' => '1988-07-18',
                'gender' => 'P',
                'phone' => '086789012345',
                'address' => 'Jl. Colombo No. 34, Yogyakarta',
                'emergency_contact' => '085678901234',
                'bpjs_number' => '00012345678906',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-007',
                'name' => 'Agus Setiawan',
                'nik' => '7890123456789012',
                'birth_date' => '1982-09-05',
                'gender' => 'L',
                'phone' => '087890123456',
                'address' => 'Jl. Magelang KM 5, Yogyakarta',
                'emergency_contact' => '086789012345',
                'bpjs_number' => '00012345678907',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-008',
                'name' => 'Maya Putri',
                'nik' => '8901234567890123',
                'birth_date' => '1995-01-30',
                'gender' => 'P',
                'phone' => '088901234567',
                'address' => 'Jl. Solo KM 8, Yogyakarta',
                'emergency_contact' => '087890123456',
                'bpjs_number' => '00012345678908',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-009',
                'name' => 'Hendra Gunawan',
                'nik' => '9012345678901234',
                'birth_date' => '1975-04-12',
                'gender' => 'L',
                'phone' => '089012345678',
                'address' => 'Jl. Wates KM 10, Yogyakarta',
                'emergency_contact' => '088901234567',
                'bpjs_number' => '00012345678909',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'mrn' => 'MR-2025-010',
                'name' => 'Lina Marlina',
                'nik' => '0123456789012345',
                'birth_date' => '1980-06-22',
                'gender' => 'P',
                'phone' => '081123456789',
                'address' => 'Jl. Parangtritis KM 15, Yogyakarta',
                'emergency_contact' => '089012345678',
                'bpjs_number' => '00012345678910',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($patients as $patient) {
            Patient::create($patient);
        }
    }
}
