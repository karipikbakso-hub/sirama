<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Icd10Diagnosis;

class Icd10DiagnosisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Note: Master data for ICD-10 diagnoses is now handled by MasterTablesSeeder
        // This seeder is kept for compatibility but doesn't add new data
        // since m_diagnosa table already has proper Indonesian data seeded.
    }
}
