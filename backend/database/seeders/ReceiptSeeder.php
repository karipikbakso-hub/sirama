<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReceiptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing payments to create receipts for
        $payments = DB::table('t_pembayaran')->get();

        if ($payments->isEmpty()) {
            // Create some test payments first if none exist
            $this->createTestPayments();
            $payments = DB::table('t_pembayaran')->get();
        }

        foreach ($payments as $payment) {
            // Generate receipt number
            $date = Carbon::parse($payment->tanggal_bayar)->format('Ymd');
            $receiptNumber = 'RCP-' . $date . '-' . str_pad($payment->id, 4, '0', STR_PAD_LEFT);

            DB::table('receipts')->insert([
                'payment_id' => $payment->id,
                'receipt_number' => $receiptNumber,
                'status' => 'active',
                'voided_at' => null,
                'void_reason' => null,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
            ]);
        }

        // Create some voided receipts for testing
        $activeReceipts = DB::table('receipts')->where('status', 'active')->limit(2)->get();

        foreach ($activeReceipts as $receipt) {
            DB::table('receipts')->where('id', $receipt->id)->update([
                'status' => 'voided',
                'voided_at' => Carbon::now(),
                'void_reason' => 'Test void: Salah input data',
                'updated_at' => Carbon::now(),
            ]);
        }
    }

    private function createTestPayments()
    {
        // Get existing billings
        $billings = DB::table('t_billing')->where('status', 'lunas')->get();

        if ($billings->isEmpty()) {
            return; // No billings to create payments for
        }

        foreach ($billings->take(5) as $billing) {
            DB::table('t_pembayaran')->insert([
                'billing_id' => $billing->id,
                'user_id' => 1, // Assuming user ID 1 exists
                'tanggal_bayar' => Carbon::now(),
                'jumlah_bayar' => $billing->total_bayar,
                'metode_bayar' => 'tunai',
                'no_referensi' => null,
                'catatan' => 'Test payment',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
