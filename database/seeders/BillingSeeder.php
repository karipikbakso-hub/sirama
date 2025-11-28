<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BillingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some existing registrations
        $registrations = DB::table('t_registrasi')->limit(5)->get();
        $userId = 1; // Assuming user ID 1 exists

        if ($registrations->isEmpty()) {
            // Create a simple registration if none exist
            $registrationId = DB::table('t_registrasi')->insertGetId([
                'no_registrasi' => 'REG24-TEST001',
                'patient_id' => 1, // Assuming patient ID 1 exists
                'poli_id' => 1, // Assuming poli ID 1 exists
                'penjamin_id' => 1, // Assuming penjamin ID 1 exists
                'tanggal_registrasi' => now()->toDateString(),
                'jam_registrasi' => now()->toTimeString(),
                'jenis_kunjungan' => 'baru',
                'status' => 'selesai',
                'biaya_registrasi' => 50000,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $registrations = collect([['id' => $registrationId]]);
        }

        foreach ($registrations as $index => $registration) {
            $totalAmount = rand(100000, 500000); // Random amount between 100k-500k

            DB::table('t_billing')->insert([
                'no_invoice' => 'INV24-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'registrasi_id' => $registration->id,
                'user_id' => $userId,
                'tanggal_billing' => now()->toDateTimeString(),
                'total_tagihan' => $totalAmount,
                'diskon' => 0,
                'total_bayar' => $totalAmount,
                'status' => $index < 3 ? 'final' : 'lunas', // First 3 are pending, rest are paid
                'catatan' => 'Billing test data',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create payments for the paid billings
        $paidBillings = DB::table('t_billing')->where('status', 'lunas')->get();

        foreach ($paidBillings as $billing) {
            DB::table('t_pembayaran')->insert([
                'billing_id' => $billing->id,
                'user_id' => $userId,
                'tanggal_bayar' => now()->toDateTimeString(),
                'jumlah_bayar' => $billing->total_bayar,
                'metode_bayar' => 'tunai',
                'no_referensi' => null,
                'catatan' => 'Payment test data',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
