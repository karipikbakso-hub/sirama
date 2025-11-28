<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PrescriptionTestSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan ada data patients, doctors, dan medicines terlebih dahulu
        $this->ensureRequiredData();

        // Create test prescriptions
        $this->createTestPrescriptions();
    }

    private function ensureRequiredData()
    {
        // Ensure we have patients
        if (DB::table('m_pasien')->count() == 0) {
            DB::table('m_pasien')->insert([
                [
                    'nama_lengkap' => 'Ahmad Surya',
                    'no_rm' => 'MR-20251121-001',
                    'jenis_kelamin' => 'L',
                    'tanggal_lahir' => '1990-05-15',
                    'alamat' => 'Jl. Sudirman No. 123',
                    'jenis_penjamin' => 'bpjs',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nama_lengkap' => 'Siti Aminah',
                    'no_rm' => 'MR-20251121-002',
                    'jenis_kelamin' => 'P',
                    'tanggal_lahir' => '1985-08-20',
                    'alamat' => 'Jl. Thamrin No. 456',
                    'jenis_penjamin' => 'umum',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nama_lengkap' => 'Budi Santoso',
                    'no_rm' => 'MR-20251121-003',
                    'jenis_kelamin' => 'L',
                    'tanggal_lahir' => '1978-12-10',
                    'alamat' => 'Jl. Gatot Subroto No. 789',
                    'jenis_penjamin' => 'bpjs',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Ensure we have doctors
        if (DB::table('users')->where('role', 'dokter')->count() == 0) {
            DB::table('users')->insert([
                [
                    'name' => 'Dr. Ahmad Rahman',
                    'email' => 'ahmad.rahman@hospital.test',
                    'password' => bcrypt('password'),
                    'role' => 'dokter',
                    'nip' => 'DOK001',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Dr. Siti Nurhaliza',
                    'email' => 'siti.nurhaliza@hospital.test',
                    'password' => bcrypt('password'),
                    'role' => 'dokter',
                    'nip' => 'DOK002',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Ensure we have medicines
        if (DB::table('m_obat')->count() == 0) {
            DB::table('m_obat')->insert([
                [
                    'nama_obat' => 'Paracetamol 500mg',
                    'nama_generik' => 'Paracetamol',
                    'stock' => 100,
                    'harga' => 1000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nama_obat' => 'Amoxicillin 500mg',
                    'nama_generik' => 'Amoxicillin',
                    'stock' => 50,
                    'harga' => 2500,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nama_obat' => 'Ibuprofen 400mg',
                    'nama_generik' => 'Ibuprofen',
                    'stock' => 75,
                    'harga' => 1500,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nama_obat' => 'Omeprazole 20mg',
                    'nama_generik' => 'Omeprazole',
                    'stock' => 30,
                    'harga' => 3000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Ensure we have registrations
        if (DB::table('t_registrasi')->count() == 0) {
            $patients = DB::table('m_pasien')->get();
            $doctors = DB::table('users')->where('role', 'dokter')->get();

            foreach ($patients as $patient) {
                DB::table('t_registrasi')->insert([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctors->random()->id,
                    'poli_id' => 1,
                    'penjamin_id' => 1,
                    'no_registrasi' => 'REG-' . date('Ymd') . '-' . str_pad($patient->id, 3, '0', STR_PAD_LEFT),
                    'tanggal_registrasi' => now()->format('Y-m-d'),
                    'jam_registrasi' => now()->format('H:i:s'),
                    'status' => 'menunggu',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function createTestPrescriptions()
    {
        $registrations = DB::table('t_registrasi')->get();
        $medicines = DB::table('m_obat')->get();
        $doctors = DB::table('users')->where('role', 'dokter')->get();

        $prescriptionData = [];

        // Create 15 test prescriptions with different statuses
        for ($i = 0; $i < 15; $i++) {
            $registration = $registrations->random();
            $doctor = $doctors->random();
            $createdAt = Carbon::now()->subDays(rand(0, 7));

            $status = $this->getRandomStatus($i);
            $isUrgent = rand(1, 10) <= 2; // 20% urgent

            $prescription = [
                'registration_id' => $registration->id,
                'doctor_id' => $doctor->id,
                'status' => $status,
                'is_urgent' => $isUrgent,
                'total_price' => 0, // Will be calculated
                'notes' => $this->getRandomNotes(),
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];

            // Add timestamps based on status
            if ($status === 'validated') {
                $prescription['validated_at'] = $createdAt->copy()->addHours(rand(1, 4));
            } elseif ($status === 'dispensed') {
                $prescription['validated_at'] = $createdAt->copy()->addHours(rand(1, 4));
                $prescription['dispensed_at'] = $createdAt->copy()->addHours(rand(5, 8));
            } elseif ($status === 'completed') {
                $prescription['validated_at'] = $createdAt->copy()->addHours(rand(1, 4));
                $prescription['dispensed_at'] = $createdAt->copy()->addHours(rand(5, 8));
                $prescription['completed_at'] = $createdAt->copy()->addHours(rand(9, 12));
            }

            $prescriptionId = DB::table('prescriptions')->insertGetId($prescription);

            // Create prescription items
            $totalPrice = $this->createPrescriptionItems($prescriptionId, $medicines);

            // Update total price
            DB::table('prescriptions')->where('id', $prescriptionId)->update(['total_price' => $totalPrice]);

            $prescriptionData[] = [
                'id' => $prescriptionId,
                'status' => $status,
                'is_urgent' => $isUrgent,
                'total_price' => $totalPrice,
                'created_at' => $createdAt->toISOString(),
            ];
        }

        $this->command->info('Created ' . count($prescriptionData) . ' test prescriptions');
        $this->command->info('Status distribution:');
        $statusCount = array_count_values(array_column($prescriptionData, 'status'));
        foreach ($statusCount as $status => $count) {
            $this->command->info("  - $status: $count");
        }
    }

    private function getRandomStatus($index)
    {
        $statuses = ['pending', 'validated', 'dispensed', 'completed'];

        // Distribute statuses: more pending, fewer completed
        if ($index < 6) return 'pending';
        if ($index < 10) return 'validated';
        if ($index < 13) return 'dispensed';
        return 'completed';
    }

    private function getRandomNotes()
    {
        $notes = [
            'Pasien demam tinggi, berikan antipiretik',
            'Pasien hipertensi, kontrol tekanan darah',
            'Pasien diabetes melitus tipe 2',
            'Pasien infeksi saluran pernapasan atas',
            'Pasien gastritis kronis',
            'Pasien nyeri punggung bawah',
            'Pasien alergi terhadap penicillin',
            'Pasien hamil trimester kedua',
            'Pasien lanjut usia, berikan dosis rendah',
            'Pasien dengan riwayat penyakit jantung',
        ];

        return $notes[array_rand($notes)];
    }

    private function createPrescriptionItems($prescriptionId, $medicines)
    {
        $totalPrice = 0;
        $itemCount = rand(1, 4); // 1-4 items per prescription

        $selectedMedicines = $medicines->random(min($itemCount, $medicines->count()));

        foreach ($selectedMedicines as $medicine) {
            $quantity = rand(5, 30); // 5-30 tablets/capsules
            $price = $medicine->harga;
            $subtotal = $quantity * $price;

            DB::table('prescription_items')->insert([
                'prescription_id' => $prescriptionId,
                'medicine_id' => $medicine->id,
                'medicine_name' => $medicine->nama_obat,
                'dosage' => $this->getRandomDosage($medicine->nama_obat),
                'frequency' => $this->getRandomFrequency(),
                'duration' => $this->getRandomDuration(),
                'quantity' => $quantity,
                'price' => $price,
                'subtotal' => $subtotal,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $totalPrice += $subtotal;
        }

        return $totalPrice;
    }

    private function getRandomDosage($medicineName)
    {
        if (str_contains(strtolower($medicineName), 'paracetamol')) {
            return '500mg';
        } elseif (str_contains(strtolower($medicineName), 'amoxicillin')) {
            return '500mg';
        } elseif (str_contains(strtolower($medicineName), 'ibuprofen')) {
            return '400mg';
        } elseif (str_contains(strtolower($medicineName), 'omeprazole')) {
            return '20mg';
        }

        return '1 tablet';
    }

    private function getRandomFrequency()
    {
        $frequencies = [
            '3x sehari',
            '2x sehari',
            '1x sehari',
            '4x sehari',
            '6x sehari',
            '1x 12 jam',
            '1x 8 jam',
        ];

        return $frequencies[array_rand($frequencies)];
    }

    private function getRandomDuration()
    {
        $durations = [
            '3 hari',
            '5 hari',
            '7 hari',
            '10 hari',
            '14 hari',
            '1 bulan',
            '2 minggu',
        ];

        return $durations[array_rand($durations)];
    }
}