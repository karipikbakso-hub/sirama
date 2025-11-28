<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('emergency_registrations', function (Blueprint $table) {
            // Skip if column already exists
            if (!Schema::hasColumn('emergency_registrations', 'registration_id')) {
                $table->foreignId('registration_id')->nullable()->after('patient_id')
                      ->constrained('t_registrasi')->onDelete('cascade')
                      ->comment('Link to general registration table');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergency_registrations', function (Blueprint $table) {
            // Only drop foreign key if column exists
            if (Schema::hasColumn('emergency_registrations', 'registration_id')) {
                // Check if foreign key constraint exists before dropping
                $foreignKeys = DB::select("
                    SELECT CONSTRAINT_NAME
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE TABLE_NAME = 'emergency_registrations'
                    AND COLUMN_NAME = 'registration_id'
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ");

                if (!empty($foreignKeys)) {
                    $table->dropForeign($foreignKeys[0]->CONSTRAINT_NAME);
                }

                $table->dropColumn('registration_id');
            }
        });
    }
};

