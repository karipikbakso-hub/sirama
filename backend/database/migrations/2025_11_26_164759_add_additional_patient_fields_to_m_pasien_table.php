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
            // Additional address fields
            $table->string('rt', 3)->nullable()->after('kelurahan');
            $table->string('rw', 3)->nullable()->after('rt');

            // Additional contact fields
            $table->string('telepon_alternatif', 20)->nullable()->after('telepon');

            // Personal information fields
            $table->string('pekerjaan', 100)->nullable()->after('email');
            $table->string('status_pernikahan', 50)->nullable()->after('pekerjaan');
            $table->string('agama', 50)->nullable()->after('status_pernikahan');

            // Emergency contact fields
            $table->string('nama_penanggung_jawab', 255)->after('kontak_darurat');
            $table->string('hubungan_penanggung_jawab', 50)->nullable()->after('nama_penanggung_jawab');
            $table->string('telepon_penanggung_jawab', 20)->after('hubungan_penanggung_jawab');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_pasien', function (Blueprint $table) {
            $table->dropColumn([
                'rt',
                'rw',
                'telepon_alternatif',
                'pekerjaan',
                'status_pernikahan',
                'agama',
                'nama_penanggung_jawab',
                'hubungan_penanggung_jawab',
                'telepon_penanggung_jawab'
            ]);
        });
    }
};
