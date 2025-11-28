<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Medicine;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Note: Master data for medicines is now handled by MasterTablesSeeder
        // This seeder is kept for compatibility but doesn't add new data
        // since m_obat table already has proper Indonesian data seeded.
    }
}
