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
        Schema::table('m_pasien', function (Blueprint $table) {
            // Kolom alergi, penyakit_kronis, golongan_darah sudah ada di tabel m_pasien
            // Tidak perlu menambahkan lagi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_pasien', function (Blueprint $table) {
            $table->dropColumn(['alergi', 'penyakit_kronis', 'golongan_darah']);
        });
    }
};

