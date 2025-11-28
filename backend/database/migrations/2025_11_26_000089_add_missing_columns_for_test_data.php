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
        // Add stock column to m_obat table
        Schema::table('m_obat', function (Blueprint $table) {
            if (!Schema::hasColumn('m_obat', 'stock')) {
                $table->integer('stock')->default(0)->after('nama_generik');
            }
        });

        // Add default values for t_registrasi table
        Schema::table('t_registrasi', function (Blueprint $table) {
            if (Schema::hasColumn('t_registrasi', 'registration_no')) {
                $table->string('registration_no')->default('AUTO')->change();
            }
            if (Schema::hasColumn('t_registrasi', 'poli_id')) {
                $table->unsignedBigInteger('poli_id')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove stock column from m_obat table
        Schema::table('m_obat', function (Blueprint $table) {
            if (Schema::hasColumn('m_obat', 'stock')) {
                $table->dropColumn('stock');
            }
        });

        // Revert default values for t_registrasi table
        Schema::table('t_registrasi', function (Blueprint $table) {
            if (Schema::hasColumn('t_registrasi', 'registration_no')) {
                $table->string('registration_no')->nullable(false)->change();
            }
            if (Schema::hasColumn('t_registrasi', 'poli_id')) {
                $table->unsignedBigInteger('poli_id')->nullable(false)->change();
            }
        });
    }
};
