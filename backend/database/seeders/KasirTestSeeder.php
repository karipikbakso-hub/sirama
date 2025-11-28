<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KasirTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating Kasir test data...');

        // Check if we have existing patients, if not create some
        $patientCount = DB::table('m_pasien')->count();
        if ($patientCount == 0) {
            $this->command->warn('No patients found, creating basic patient data...');
            $this->createBasicPatients();
        }

        // Create doctor for registrations
        $doctorId = $this->getOrCreateDoctor();

        // Create test registrations for billing
        $this->createRegistrations($doctorId);

        // Create billings
        $this->createBillings();

        // Create payments
        $this->createPayments();

        $this->command->info('Kasir test data created successfully!');
        $this->command->info('Run: php artisan db:seed --class=KasirTestSeeder');
    }

    private function getOrCreateDoctor()
    {
        $doctor = DB::table('users')->where('role', 'dokter')->first();

        if (!$doctor) {
            return DB::table('users')->insertGetId([
                'name' => 'Dr. Kasir Test',
                'email' => 'dokter.kasir@test.com',
                'password' => bcrypt('password'),
                'role' => 'dokter',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $doctor->id;
    }

    private function createBasicPatients()
    {
        // Get the patient table name - could be m_pasien or patients
        $tableName = 'm_pasien';

        for ($i = 1; $i <= 10; $i++) {
            DB::table($tableName)->insert([
                'id' => $i,
                'nama_lengkap' => 'Pasien Kasir ' . $i,
                'no_rm' => 'RM-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'nik' => '1234567890' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'tanggal_lahir' => Carbon::now()->subYears(rand(20, 60))->format('Y-m-d'),
                'jenis_kelamin' => rand(0, 1) ? 'L' : 'P',
                'no_hp' => '0812345678' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'alamat' => 'Jl. Test Kasir No. ' . $i,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function createRegistrations($doctorId)
    {
        $tableName = 't_registrasi';

        // Check if table exists and create records
        $registrationsStartId = DB::table($tableName)->max('id') ?: 0;

        for ($i = 1; $i <= 15; $i++) {
            $regId = $registrationsStartId + $i;

            try {
                DB::table($tableName)->insert([
                    'id' => $regId,
                    'patient_id' => rand(1, 10),
                    'doctor_id' => $doctorId,
                    'no_registrasi' => 'REG24-' . str_pad($regId, 6, '0', STR_PAD_LEFT),
                    'tanggal_daftar' => Carbon::now()->subDays(rand(0, 30)),
                    'status' => 'selesai',
                    'keluhan' => 'Keluhan test pasien ' . $i,
                    'diagnosa' => 'Diagnosa test ' . $i,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Exception $e) {
                $this->command->warn("Failed to create registration {$i}: " . $e->getMessage());
            }
        }
    }

    private function createBillings()
    {
        $tableName = 't_billing';

        // Check if table exists and create records
        $billingStartId = DB::table($tableName)->max('id') ?: 0;

        for ($i = 1; $i <= 12; $i++) {
            $billingId = $billingStartId + $i;
            $registrationId = rand(1, DB::table('t_registrasi')->max('id') ?: 15);

            $totalAmount = rand(50000, 500000);
            $isPaid = $i <= 8; // 8 lunas, 4 pending

            try {
                DB::table($tableName)->insert([
                    'id' => $billingId,
                    'registrasi_id' => $registrationId,
                    'no_invoice' => 'INV24-' . str_pad($billingId, 6, '0', STR_PAD_LEFT),
                    'total_tagihan' => $totalAmount,
                    'status' => $isPaid ? 'lunas' : 'belum_lunas',
                    'tanggal_billing' => Carbon::now()->subDays(rand(1, 30)),
                    'jatuh_tempo' => Carbon::now()->addDays(30),
                    'keterangan' => $isPaid ? 'Sudah dibayar' : 'Menunggu pembayaran',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Exception $e) {
                $this->command->warn("Failed to create billing {$i}: " . $e->getMessage());
            }
        }
    }

    private function createPayments()
    {
        $tableName = 't_pembayaran';

        // Check if table exists and create records
        $paymentStartId = DB::table($tableName)->max('id') ?: 0;

        // Create user for cashier
        $cashierId = $this->getOrCreateCashier();

        // Get billings that should be paid
        $paidBillings = DB::table('t_billing')
            ->where('status', 'lunas')
            ->limit(8)
            ->get();

        foreach ($paidBillings as $index => $billing) {
            $paymentId = $paymentStartId + $index + 1;

            try {
                DB::table($tableName)->insert([
                    'id' => $paymentId,
                    'billing_id' => $billing->id,
                    'user_id' => $cashierId,
                    'tanggal_bayar' => Carbon::now()->subDays(rand(1, 30)),
                    'jumlah_bayar' => $billing->total_tagihan,
                    'metode_bayar' => ['tunai', 'debit', 'transfer', 'bpjs'][rand(0, 3)],
                    'no_referensi' => 'REF-' . str_pad($paymentId, 6, '0', STR_PAD_LEFT),
                    'catatan' => 'Pembayaran via kasir',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Exception $e) {
                $this->command->warn("Failed to create payment for billing {$billing->id}: " . $e->getMessage());
            }
        }

        $this->command->info("Created " . $paidBillings->count() . " payment records");
    }

    private function getOrCreateCashier()
    {
        $cashier = DB::table('users')->where('role', 'kasir')->first();

        if (!$cashier) {
            return DB::table('users')->insertGetId([
                'name' => 'Kasir Test',
                'email' => 'kasir@test.com',
                'password' => bcrypt('password'),
                'role' => 'kasir',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $cashier->id;
    }
}
