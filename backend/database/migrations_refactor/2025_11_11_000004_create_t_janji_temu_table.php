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
        Schema::create('t_janji_temu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasien_id')->constrained('m_pasien')->onDelete('cascade');
            $table->foreignId('dokter_id')->nullable()->constrained('m_dokter');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->date('tanggal_janji');
            $table->time('waktu_janji');
            $table->string('jenis_layanan')->default('Konsultasi Rutin');
            $table->enum('status', ['dikonfirmasi', 'menunggu', 'dibatalkan', 'selesai', 'tidak_hadir'])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->boolean('pengiriman_pengingat')->default(false);
            $table->datetime('waktu_pengingat_dikirim')->nullable();
            $table->string('saluran_pengingat')->nullable(); // whatsapp, sms, email
            $table->text('alasan_pembatalan')->nullable();
            $table->datetime('waktu_dibatalkan')->nullable();
            $table->datetime('waktu_selesai')->nullable();
            $table->text('catatan_tindak_lanjut')->nullable();
            $table->decimal('biaya_konsultasi', 10, 2)->nullable();
            $table->boolean('sudah_dibayar')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['tanggal_janji', 'waktu_janji']);
            $table->index(['pasien_id', 'tanggal_janji']);
            $table->index('status');
            $table->index('dokter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_janji_temu');
    }
};
