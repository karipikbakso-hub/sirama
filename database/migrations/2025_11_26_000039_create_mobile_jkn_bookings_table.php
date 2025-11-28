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
        Schema::create('mobile_jkn_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('kode_booking', 50)->unique()->comment('Unique booking code from JKN');
            $table->string('no_kartu', 20)->index()->comment('BPJS card number');
            $table->string('nik_pasien', 16)->comment('Patient NIK');
            $table->date('tanggal_periksa')->index();
            $table->time('jam_praktek');
            $table->string('kode_dokter', 20);
            $table->string('nama_dokter', 100);
            $table->string('kode_poli', 20);
            $table->string('nama_poli', 100);
            $table->tinyInteger('jenis_kunjungan')->comment('1=rujukan, 2=kontrol');
            $table->string('no_rujukan', 20)->nullable()->comment('Referral number if jenis_kunjungan=1');
            $table->time('estimasi_dilayani')->nullable()->comment('Estimated service time');
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->text('reason_rejected')->nullable()->comment('Reason if rejected');
            $table->json('jkn_data')->nullable()->comment('Full JKN API response data');
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['tanggal_periksa', 'kode_poli']);
            $table->index(['no_kartu', 'tanggal_periksa']);
            $table->index(['status']);
            $table->index(['synced_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_jkn_bookings');
    }
};

