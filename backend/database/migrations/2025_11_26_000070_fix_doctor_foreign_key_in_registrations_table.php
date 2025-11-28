<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('t_registrasi', function (Blueprint $table) {
            // Check if foreign key exists before dropping
            $foreignKeys = DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 't_registrasi' AND COLUMN_NAME = 'dokter_id' AND REFERENCED_TABLE_NAME IS NOT NULL");

            if (count($foreignKeys) > 0) {
                // Drop the existing foreign key constraint
                $table->dropForeign(['dokter_id']);
            }

            // Add the correct foreign key constraint to m_dokter table
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_registrasi', function (Blueprint $table) {
            // Check if foreign key exists before dropping
            $foreignKeys = DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 't_registrasi' AND COLUMN_NAME = 'dokter_id' AND REFERENCED_TABLE_NAME = 'm_dokter'");

            if (count($foreignKeys) > 0) {
                // Drop the correct foreign key constraint to m_dokter table
                $table->dropForeign(['dokter_id']);
            }

            // Restore the incorrect foreign key constraint to users table
            
        });
    }
};

