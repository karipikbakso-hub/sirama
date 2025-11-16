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
        Schema::table('m_laboratorium', function (Blueprint $table) {
            $table->string('kode_pemeriksaan', 20)->unique()->nullable()->after('kode_lab');
        });

        // Copy data from kode_lab to kode_pemeriksaan
        DB::statement('UPDATE m_laboratorium SET kode_pemeriksaan = kode_lab WHERE kode_pemeriksaan IS NULL');

        // Make kode_pemeriksaan not nullable after data is copied
        Schema::table('m_laboratorium', function (Blueprint $table) {
            $table->string('kode_pemeriksaan', 20)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_laboratorium', function (Blueprint $table) {
            $table->dropColumn('kode_pemeriksaan');
        });
    }
};
