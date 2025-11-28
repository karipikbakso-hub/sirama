<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Deposit;
use App\Models\DepositTransaction;
use App\Models\Indonesian\Pasien;
use Illuminate\Support\Facades\DB;

class DepositSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some existing patients
        $patients = Pasien::limit(10)->get();

        if ($patients->isEmpty()) {
            // If no patients exist, create some test patients first
            $testPatients = [];
            for ($i = 1; $i <= 3; $i++) {
                $patient = Pasien::create([
                    'nama_lengkap' => 'Test Patient ' . $i,
                    'no_rm' => 'RM' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'tanggal_lahir' => now()->subYears(rand(20, 60)),
                    'jenis_kelamin' => rand(0, 1) ? 'L' : 'P',
                    'alamat' => 'Test Address ' . $i,
                    'telepon' => '0812345678' . $i,
                    'kontak_darurat' => 'Emergency Contact ' . $i,
                    'telepon_darurat' => '0818765432' . $i,
                    'jenis_asuransi' => 'Umum',
                ]);
                $testPatients[] = $patient;
            }
            $patients = collect($testPatients);
        }

        foreach ($patients as $patient) {
            // Create deposits for different types
            $depositTypes = ['rawat_inap', 'rawat_jalan'];

            foreach ($depositTypes as $type) {
                // Create deposit with random balance
                $balance = rand(50000, 500000); // Random balance between 50k-500k

                $deposit = Deposit::create([
                    'patient_id' => $patient->id,
                    'deposit_type' => $type,
                    'balance' => $balance,
                    'status' => 'active',
                ]);

                // Create some transactions for this deposit
                $this->createTransactionsForDeposit($deposit, $balance);
            }
        }

        // Create some low balance deposits for testing alerts
        $lowBalancePatients = Pasien::limit(3)->get();
        foreach ($lowBalancePatients as $patient) {
            $deposit = Deposit::create([
                'patient_id' => $patient->id,
                'deposit_type' => 'rawat_inap',
                'balance' => rand(10000, 90000), // Low balance 10k-90k
                'status' => 'active',
            ]);

            // Create initial top-up transaction
            DepositTransaction::create([
                'deposit_id' => $deposit->id,
                'type' => 'top_up',
                'amount' => $deposit->balance,
                'payment_method' => 'tunai',
                'created_by' => 1, // Assuming admin user exists
                'notes' => 'Initial deposit for testing'
            ]);
        }
    }

    /**
     * Create transactions for a deposit
     */
    private function createTransactionsForDeposit(Deposit $deposit, float $finalBalance): void
    {
        $transactions = [];
        $currentBalance = 0;

        // Create initial top-up
        $initialTopUp = rand(100000, 300000);
        $transactions[] = [
            'type' => 'top_up',
            'amount' => $initialTopUp,
            'payment_method' => collect(['tunai', 'transfer', 'kartu_kredit'])->random(),
            'notes' => 'Initial deposit top-up'
        ];
        $currentBalance += $initialTopUp;

        // Create some usage transactions
        $usageCount = rand(1, 3);
        for ($i = 0; $i < $usageCount; $i++) {
            if ($currentBalance > 50000) { // Don't go below 50k
                $usageAmount = rand(20000, min(100000, $currentBalance - 20000));
                $transactions[] = [
                    'type' => 'deduct',
                    'amount' => $usageAmount,
                    'reference_id' => 'BILL' . rand(1000, 9999),
                    'notes' => 'Payment for services'
                ];
                $currentBalance -= $usageAmount;
            }
        }

        // Add more top-ups if needed to reach final balance
        while ($currentBalance < $finalBalance) {
            $additionalTopUp = rand(50000, 200000);
            $transactions[] = [
                'type' => 'top_up',
                'amount' => $additionalTopUp,
                'payment_method' => collect(['tunai', 'transfer', 'kartu_kredit'])->random(),
                'notes' => 'Additional deposit top-up'
            ];
            $currentBalance += $additionalTopUp;
        }

        // Create transactions in database
        foreach ($transactions as $transaction) {
            DepositTransaction::create([
                'deposit_id' => $deposit->id,
                'type' => $transaction['type'],
                'amount' => $transaction['amount'],
                'payment_method' => $transaction['payment_method'] ?? null,
                'reference_id' => $transaction['reference_id'] ?? null,
                'created_by' => 1, // Assuming admin user exists
                'notes' => $transaction['notes'],
                'created_at' => now()->subDays(rand(0, 30)), // Random date within last 30 days
            ]);
        }
    }
}
