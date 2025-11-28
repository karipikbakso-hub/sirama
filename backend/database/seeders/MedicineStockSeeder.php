<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockMovement;
use App\Models\User;
use Carbon\Carbon;

class MedicineStockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first admin user for stock adjustments
        $adminUser = User::where('role', 'admin')->first() ?? User::first();

        // Medicine data with realistic Indonesian hospital medicines
        $medicines = [
            [
                'kode_obat' => 'PCT001',
                'nama_obat' => 'Paracetamol',
                'nama_generik' => 'Paracetamol',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '500mg',
                'satuan' => 'tablet',
                'golongan_obat' => 'bebas',
                'harga_jual' => 2500,
                'stok_minimum' => 50,
                'stok_maksimum' => 500,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'PCT-2024-001', 'expired_date' => '2026-12-31', 'stock' => 100, 'purchase_price' => 500],
                    ['batch_number' => 'PCT-2024-002', 'expired_date' => '2027-06-30', 'stock' => 75, 'purchase_price' => 550],
                ]
            ],
            [
                'kode_obat' => 'AMX001',
                'nama_obat' => 'Amoxicillin 500mg',
                'nama_generik' => 'Amoxicillin',
                'bentuk_sediaan' => 'Kapsul',
                'kekuatan' => '500mg',
                'satuan' => 'kapsul',
                'golongan_obat' => 'keras',
                'harga_jual' => 15000,
                'stok_minimum' => 20,
                'stok_maksimum' => 200,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'AMX-2024-001', 'expired_date' => '2026-08-15', 'stock' => 30, 'purchase_price' => 1500],
                    ['batch_number' => 'AMX-2024-002', 'expired_date' => '2027-02-20', 'stock' => 45, 'purchase_price' => 1600],
                ]
            ],
            [
                'kode_obat' => 'IBU001',
                'nama_obat' => 'Ibuprofen 200mg',
                'nama_generik' => 'Ibuprofen',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '200mg',
                'satuan' => 'tablet',
                'golongan_obat' => 'bebas_terbatas',
                'harga_jual' => 3200,
                'stok_minimum' => 30,
                'stok_maksimum' => 300,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'IBU-2024-001', 'expired_date' => '2026-11-10', 'stock' => 80, 'purchase_price' => 800],
                ]
            ],
            [
                'kode_obat' => 'OMP001',
                'nama_obat' => 'Omeprazole 20mg',
                'nama_generik' => 'Omeprazole',
                'bentuk_sediaan' => 'Kapsul',
                'kekuatan' => '20mg',
                'satuan' => 'kapsul',
                'golongan_obat' => 'keras',
                'harga_jual' => 25000,
                'stok_minimum' => 25,
                'stok_maksimum' => 250,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'OMP-2024-001', 'expired_date' => '2026-09-05', 'stock' => 60, 'purchase_price' => 2500],
                    ['batch_number' => 'OMP-2024-002', 'expired_date' => '2027-03-12', 'stock' => 25, 'purchase_price' => 2600],
                ]
            ],
            [
                'kode_obat' => 'CTZ001',
                'nama_obat' => 'Cetirizine 10mg',
                'nama_generik' => 'Cetirizine',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '10mg',
                'satuan' => 'tablet',
                'golongan_obat' => 'bebas_terbatas',
                'harga_jual' => 3000,
                'stok_minimum' => 40,
                'stok_maksimum' => 400,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'CTZ-2024-001', 'expired_date' => '2027-01-25', 'stock' => 90, 'purchase_price' => 300],
                ]
            ],
            [
                'kode_obat' => 'AML001',
                'nama_obat' => 'Amlodipine 5mg',
                'nama_generik' => 'Amlodipine',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '5mg',
                'satuan' => 'tablet',
                'golongan_obat' => 'keras',
                'harga_jual' => 12000,
                'stok_minimum' => 15,
                'stok_maksimum' => 150,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'AML-2024-001', 'expired_date' => '2026-10-20', 'stock' => 35, 'purchase_price' => 1200],
                ]
            ],
            [
                'kode_obat' => 'MTF001',
                'nama_obat' => 'Metformin 500mg',
                'nama_generik' => 'Metformin',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '500mg',
                'satuan' => 'tablet',
                'golongan_obat' => 'keras',
                'harga_jual' => 4000,
                'stok_minimum' => 30,
                'stok_maksimum' => 300,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'MTF-2024-001', 'expired_date' => '2027-04-15', 'stock' => 70, 'purchase_price' => 400],
                    ['batch_number' => 'MTF-2024-002', 'expired_date' => '2026-12-08', 'stock' => 40, 'purchase_price' => 420],
                ]
            ],
            [
                'kode_obat' => 'SLB001',
                'nama_obat' => 'Salbutamol Inhaler',
                'nama_generik' => 'Salbutamol',
                'bentuk_sediaan' => 'Inhaler',
                'kekuatan' => '100mcg',
                'satuan' => 'inhaler',
                'golongan_obat' => 'keras',
                'harga_jual' => 85000,
                'stok_minimum' => 10,
                'stok_maksimum' => 100,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'SLB-2024-001', 'expired_date' => '2026-07-30', 'stock' => 15, 'purchase_price' => 85000],
                ]
            ],
            [
                'kode_obat' => 'VITC001',
                'nama_obat' => 'Vitamin C 500mg',
                'nama_generik' => 'Ascorbic Acid',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '500mg',
                'satuan' => 'tablet',
                'golongan_obat' => 'bebas',
                'harga_jual' => 2000,
                'stok_minimum' => 60,
                'stok_maksimum' => 600,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'VITC-2024-001', 'expired_date' => '2027-05-20', 'stock' => 120, 'purchase_price' => 200],
                ]
            ],
            [
                'kode_obat' => 'RNT001',
                'nama_obat' => 'Ranitidine 150mg',
                'nama_generik' => 'Ranitidine',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '150mg',
                'satuan' => 'tablet',
                'golongan_obat' => 'bebas_terbatas',
                'harga_jual' => 6000,
                'stok_minimum' => 35,
                'stok_maksimum' => 350,
                'aktif' => true,
                'batches' => [
                    ['batch_number' => 'RNT-2024-001', 'expired_date' => '2026-11-28', 'stock' => 55, 'purchase_price' => 600],
                ]
            ]
        ];

        foreach ($medicines as $medicineData) {
            // Create medicine
            $batches = $medicineData['batches'];
            unset($medicineData['batches']);

            $medicine = Medicine::create($medicineData);

            // Create batches for this medicine
            foreach ($batches as $batchData) {
                $batch = MedicineBatch::create([
                    'medicine_id' => $medicine->id,
                    ...$batchData
                ]);

                // Create initial stock movement for this batch
                StockMovement::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'type' => 'in',
                    'quantity' => $batchData['stock'],
                    'reference_type' => 'initial_stock',
                    'reference_id' => null,
                    'created_at' => Carbon::now()->subDays(rand(1, 30))
                ]);
            }

            // Add some random stock movements for demonstration
            $this->createRandomMovements($medicine, $adminUser);
        }
    }

    /**
     * Create random stock movements for demonstration
     */
    private function createRandomMovements(Medicine $medicine, User $user): void
    {
        $movementTypes = ['in', 'out', 'adjustment'];
        $reasons = [
            'in' => ['Pembelian rutin', 'Restock darurat', 'Donasi'],
            'out' => ['Dispensing pasien', 'Transfer ke unit lain', 'Expired disposal'],
            'adjustment' => ['Opname fisik', 'Koreksi stok', 'Damage goods']
        ];

        // Create 3-8 random movements per medicine
        $movementCount = rand(3, 8);

        for ($i = 0; $i < $movementCount; $i++) {
            $type = $movementTypes[array_rand($movementTypes)];
            $quantity = rand(1, 20) * ($type === 'out' ? -1 : 1);

            // Get random batch for this medicine
            $batch = MedicineBatch::where('medicine_id', $medicine->id)->inRandomOrder()->first();

            StockMovement::create([
                'medicine_id' => $medicine->id,
                'batch_id' => $batch?->id,
                'type' => $type,
                'quantity' => abs($quantity),
                'reference_type' => 'demo_movement',
                'reference_id' => rand(1000, 9999),
                'created_at' => Carbon::now()->subDays(rand(1, 60))
            ]);

            // Create corresponding stock adjustment if it's an adjustment
            if ($type === 'adjustment' && rand(0, 1)) {
                \App\Models\StockAdjustment::create([
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch?->id,
                    'type' => $type,
                    'quantity' => abs($quantity),
                    'reason' => $reasons[$type][array_rand($reasons[$type])],
                    'adjusted_by' => $user->id,
                    'created_at' => Carbon::now()->subDays(rand(1, 60))
                ]);
            }
        }
    }
}
