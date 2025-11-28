<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Medicine;
use App\Models\MedicineBatch;

class MedicineBatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medicines = Medicine::all();

        foreach ($medicines as $medicine) {
            // Create 2-3 batches per medicine with different expiry dates
            $batches = [
                [
                    'batch_number' => 'BATCH-' . date('Y') . '-001',
                    'expired_date' => date('Y-m-d', strtotime('+6 months')),
                    'stock' => rand(20, 100),
                    'purchase_price' => $medicine->harga_jual * 0.7,
                ],
                [
                    'batch_number' => 'BATCH-' . date('Y') . '-002',
                    'expired_date' => date('Y-m-d', strtotime('+12 months')),
                    'stock' => rand(15, 80),
                    'purchase_price' => $medicine->harga_jual * 0.75,
                ],
                [
                    'batch_number' => 'BATCH-' . date('Y') . '-003',
                    'expired_date' => date('Y-m-d', strtotime('+18 months')),
                    'stock' => rand(10, 60),
                    'purchase_price' => $medicine->harga_jual * 0.8,
                ],
            ];

            // Add some expired batches for testing
            if (rand(0, 1)) {
                $batches[] = [
                    'batch_number' => 'BATCH-' . (date('Y') - 1) . '-001',
                    'expired_date' => date('Y-m-d', strtotime('-3 months')),
                    'stock' => rand(5, 20),
                    'purchase_price' => $medicine->harga_jual * 0.6,
                ];
            }

            foreach ($batches as $batch) {
                MedicineBatch::create([
                    'medicine_id' => $medicine->id,
                    'batch_number' => $batch['batch_number'],
                    'expired_date' => $batch['expired_date'],
                    'stock' => $batch['stock'],
                    'purchase_price' => $batch['purchase_price'],
                ]);
            }
        }
    }
}
