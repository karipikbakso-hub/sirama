<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Note: Master tables (m_dokter, m_obat, m_diagnosa) already exist with proper Indonesian structure
        // and have been seeded with correct data. We only need to drop the old English-named tables.

        // Drop old tables - data migration not needed since master tables already have correct data
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('medicines');
        Schema::dropIfExists('icd10_diagnoses');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate old tables and migrate data back (if needed for rollback)
        // This is a complex operation, so for now we'll just note that
        // a full rollback would require recreating the old table structures
        // and migrating data back from the new Indonesian tables.
    }
};
