<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TodayQueueDataSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $today = Carbon::today();

        // Sample patients (using patients table structure)
        $patients = [
            ['name' => 'Ahmad Santoso', 'mrn' => 'RM-2025-001', 'birth_date' => Carbon::create(1979, 11, 15), 'gender' => 'L', 'address' => 'Jl. Sudirman No. 1, Jakarta', 'phone' => '081234567890'],
            ['name' => 'Siti Aminah', 'mrn' => 'RM-2025-002', 'birth_date' => Carbon::create(1992, 11, 15), 'gender' => 'P', 'address' => 'Jl. Malioboro No. 2, Yogyakarta', 'phone' => '081234567891'],
            ['name' => 'Budi Hartono', 'mrn' => 'RM-2025-003', 'birth_date' => Carbon::create(1996, 11, 15), 'gender' => 'L', 'address' => 'Jl. Cikampek No. 3, Bandung', 'phone' => '081234567892'],
            ['name' => 'Maya Sari', 'mrn' => 'RM-2025-004', 'birth_date' => Carbon::create(1969, 11, 15), 'gender' => 'P', 'address' => 'Jl. Diponegoro No. 4, Surabaya', 'phone' => '081234567893'],
            ['name' => 'Rian Nugroho', 'mrn' => 'RM-2025-005', 'birth_date' => Carbon::create(1986, 11, 15), 'gender' => 'L', 'address' => 'Jl. Veteran No. 5, Malang', 'phone' => '081234567894'],
            ['name' => 'Dewi Lestari', 'mrn' => 'RM-2025-006', 'birth_date' => Carbon::create(1995, 11, 15), 'gender' => 'P', 'address' => 'Jl. Magelang No. 6, Semarang', 'phone' => '081234567895'],
            ['name' => 'Hendro Sugito', 'mrn' => 'RM-2025-007', 'birth_date' => Carbon::create(1982, 11, 15), 'gender' => 'L', 'address' => 'Jl. Pajajaran No. 7, Bogor', 'phone' => '081234567896'],
            ['name' => 'Rina Permata', 'mrn' => 'RM-2025-008', 'birth_date' => Carbon::create(1998, 11, 15), 'gender' => 'P', 'address' => 'Jl. Malioboro No. 8, Yogyakarta', 'phone' => '081234567897'],
            ['name' => 'Dian Sari', 'mrn' => 'RM-2025-009', 'birth_date' => Carbon::create(1963, 11, 15), 'gender' => 'P', 'address' => 'Jl. Sudirman No. 9, Jakarta', 'phone' => '081234567898'],
            ['name' => 'Aji Widodo', 'mrn' => 'RM-2025-010', 'birth_date' => Carbon::create(1989, 11, 15), 'gender' => 'L', 'address' => 'Jl. Malioboro No. 10, Yogyakarta', 'phone' => '081234567899'],
            ['name' => 'Nurul Hidayah', 'mrn' => 'RM-2025-011', 'birth_date' => Carbon::create(1993, 11, 15), 'gender' => 'P', 'address' => 'Jl. Hayam Wuruk No. 11, Tangerang', 'phone' => '081234567800'],
            ['name' => 'Arif Rahman', 'mrn' => 'RM-2025-012', 'birth_date' => Carbon::create(1972, 11, 15), 'gender' => 'L', 'address' => 'Jl. Brawijaya No. 12, Kediri', 'phone' => '081234567801'],
            ['name' => 'Lisa Pratiwi', 'mrn' => 'RM-2025-013', 'birth_date' => Carbon::create(2002, 11, 15), 'gender' => 'P', 'address' => 'Jl. Tunjungan No. 13, Surabaya', 'phone' => '081234567802'],
            ['name' => 'Muhammad Ali', 'mrn' => 'RM-2025-014', 'birth_date' => Carbon::create(1997, 11, 15), 'gender' => 'L', 'address' => 'Jl. Malioboro No. 14, Yogyakarta', 'phone' => '081234567803'],
            ['name' => 'Putri Ananda', 'mrn' => 'RM-2025-015', 'birth_date' => Carbon::create(1976, 11, 15), 'gender' => 'P', 'address' => 'Jl. Sudirman No. 15, Jakarta', 'phone' => '081234567804'],
        ];

        // Insert patients first
        foreach ($patients as $patient) {
            $existingPatient = DB::table('patients')
                ->where('mrn', $patient['mrn'])
                ->first();

            if (!$existingPatient) {
                DB::table('patients')->insert([
                    'mrn' => $patient['mrn'],
                    'name' => $patient['name'],
                    'birth_date' => $patient['birth_date'],
                    'gender' => $patient['gender'],
                    'address' => $patient['address'],
                    'phone' => $patient['phone'],
                    'status' => 'active',
                    'created_at' => $today,
                    'updated_at' => $today
                ]);
            }
        }

        // Sample registrations for today
        $registrations = [
            // Poli Umum
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-001',
                'patient_name' => 'Ahmad Santoso',
                'service_unit' => 'Poli Umum',
                'arrival_type' => 'mandiri',
                'doctor_id' => 1, // Ahmad Susanto
                'status' => 'dalam_perawatan',
                'queue_number' => 'U001',
                'queue_order' => 1,
                'notes' => 'Kontrol hipertensi',
                'created_at' => $today->setTime(7, 30, 0),
                'updated_at' => $today->setTime(7, 30, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-002',
                'patient_name' => 'Siti Aminah',
                'service_unit' => 'Poli Umum',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 1,
                'status' => 'dipanggil',
                'queue_number' => 'U002',
                'queue_order' => 2,
                'notes' => 'Keluhan demam tinggi',
                'created_at' => $today->setTime(8, 0, 0),
                'updated_at' => $today->setTime(8, 0, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-003',
                'patient_name' => 'Budi Hartono',
                'service_unit' => 'Poli Umum',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 1,
                'status' => 'menunggu',
                'queue_number' => 'U003',
                'queue_order' => 3,
                'notes' => 'Konstulasi pusing kronis',
                'created_at' => $today->setTime(8, 30, 0),
                'updated_at' => $today->setTime(8, 30, 0)
            ],

            // Poli Penyakit Dalam
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-004',
                'patient_name' => 'Maya Sari',
                'service_unit' => 'Poli Penyakit Dalam',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 2, // Siti Aminah, Sp.PD
                'status' => 'sedang_diperiksa',
                'queue_number' => 'PD001',
                'queue_order' => 1,
                'notes' => 'Kontrol diabetes mellitus',
                'created_at' => $today->setTime(8, 15, 0),
                'updated_at' => $today->setTime(8, 15, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-005',
                'patient_name' => 'Rian Nugroho',
                'service_unit' => 'Poli Penyakit Dalam',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 2,
                'status' => 'menunggu',
                'queue_number' => 'PD002',
                'queue_order' => 2,
                'notes' => 'Kontrol hipertensi tahunan',
                'created_at' => $today->setTime(8, 45, 0),
                'updated_at' => $today->setTime(8, 45, 0)
            ],

            // Poli Anak
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-006',
                'patient_name' => 'Dewi Lestari',
                'service_unit' => 'Poli Anak',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 3, // Budi Santoso, Sp.A
                'status' => 'sedang_diperiksa',
                'queue_number' => 'A001',
                'queue_order' => 1,
                'notes' => 'Imunisasi ulang',
                'created_at' => $today->setTime(8, 20, 0),
                'updated_at' => $today->setTime(8, 20, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-007',
                'patient_name' => 'Hendro Sugito',
                'service_unit' => 'Poli Anak',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 3,
                'status' => 'dipanggil',
                'queue_number' => 'A002',
                'queue_order' => 2,
                'notes' => 'Kontrol tumbuh kembang anak',
                'created_at' => $today->setTime(9, 0, 0),
                'updated_at' => $today->setTime(9, 0, 0)
            ],

            // Poli Kandungan
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-008',
                'patient_name' => 'Rina Permata',
                'service_unit' => 'Poli Kandungan',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 4, // Lestari Dewi, Sp.OG
                'status' => 'menunggu',
                'queue_number' => 'OG001',
                'queue_order' => 1,
                'notes' => 'Kontrol kehamilan trimester 2',
                'created_at' => $today->setTime(9, 15, 0),
                'updated_at' => $today->setTime(9, 15, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-009',
                'patient_name' => 'Dian Sari',
                'service_unit' => 'Poli Kandungan',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 4,
                'status' => 'menunggu',
                'queue_number' => 'OG002',
                'queue_order' => 2,
                'notes' => 'USG kehamilan',
                'created_at' => $today->setTime(9, 45, 0),
                'updated_at' => $today->setTime(9, 45, 0)
            ],

            // Poli Jantung
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-010',
                'patient_name' => 'Aji Widodo',
                'service_unit' => 'Poli Jantung',
                'arrival_type' => 'igd',
                'doctor_id' => 5, // Hendro Wicaksono, Sp.JP
                'status' => 'menunggu',
                'queue_number' => 'JP001',
                'queue_order' => 1,
                'notes' => 'Keluhan nyeri dada',
                'created_at' => $today->setTime(10, 0, 0),
                'updated_at' => $today->setTime(10, 0, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-011',
                'patient_name' => 'Nurul Hidayah',
                'service_unit' => 'Poli Jantung',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 5,
                'status' => 'menunggu',
                'queue_number' => 'JP002',
                'queue_order' => 2,
                'notes' => 'Kontrol post-angioplasti',
                'created_at' => $today->setTime(10, 30, 0),
                'updated_at' => $today->setTime(10, 30, 0)
            ],

            // IGD
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-012',
                'patient_name' => 'Arif Rahman',
                'service_unit' => 'IGD',
                'arrival_type' => 'igd',
                'doctor_id' => 1,
                'status' => 'sedang_diperiksa',
                'queue_number' => 'GD001',
                'queue_order' => 1,
                'notes' => 'Kecelakaan lalu lintas - patah tangan',
                'created_at' => $today->setTime(6, 30, 0),
                'updated_at' => $today->setTime(6, 30, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-013',
                'patient_name' => 'Lisa Pratiwi',
                'service_unit' => 'IGD',
                'arrival_type' => 'igd',
                'doctor_id' => 2,
                'status' => 'dipanggil',
                'queue_number' => 'GD002',
                'queue_order' => 2,
                'notes' => 'Demam tinggi anak',
                'created_at' => $today->setTime(7, 15, 0),
                'updated_at' => $today->setTime(7, 15, 0)
            ],

            // Completed cases
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-014',
                'patient_name' => 'Muhammad Ali',
                'service_unit' => 'Poli Umum',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 1,
                'status' => 'selesai',
                'queue_number' => 'U004',
                'queue_order' => 4,
                'notes' => 'Kontrol kesehatan berkala',
                'created_at' => $today->setTime(7, 0, 0),
                'updated_at' => $today->setTime(8, 15, 0)
            ],
            [
                'registration_no' => 'REG-'.$today->format('Ymd').'-015',
                'patient_name' => 'Putri Ananda',
                'service_unit' => 'Poli Penyakit Dalam',
                'arrival_type' => 'rawat_jalan',
                'doctor_id' => 2,
                'status' => 'selesai',
                'queue_number' => 'PD003',
                'queue_order' => 3,
                'notes' => 'Kontrol kolesterol tinggi',
                'created_at' => $today->setTime(7, 45, 0),
                'updated_at' => $today->setTime(8, 30, 0)
            ],
        ];

        // Insert registrations
        foreach ($registrations as $registration) {
            $patient = DB::table('patients')
                ->where('name', $registration['patient_name'])
                ->first();

            if ($patient) {
                DB::table('registrations')->insert([
                    'registration_no' => $registration['registration_no'],
                    'patient_id' => $patient->id,
                    'service_unit' => $registration['service_unit'],
                    'arrival_type' => $registration['arrival_type'],
                    'doctor_id' => $registration['doctor_id'],
                    'status' => $registration['status'],
                    'queue_number' => $registration['queue_number'],
                    'queue_order' => $registration['queue_order'],
                    'notes' => $registration['notes'],
                    'created_by' => 1, // Assume admin user
                    'created_at' => $registration['created_at'],
                    'updated_at' => $registration['updated_at']
                ]);
            }
        }
    }
}
