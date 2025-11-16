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
        Schema::create('t_antrian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokter_id')->constrained('m_dokter')->onDelete('cascade');
            $table->string('jenis_layanan', 100)->default('Konsultasi Rutin');
            $table->integer('no_antrian_sekarang')->default(0);
            $table->integer('no_antrian_terakhir')->default(0);
            $table->decimal('waktu_tunggu_rata_rata', 5, 2)->nullable(); // dalam menit
            $table->enum('status', ['aktif', 'tidak_aktif'])->default('aktif');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->integer('antrian_per_jam')->default(12);
            $table->decimal('waktu_konsultasi_rata_rata', 5, 2)->default(25); // dalam menit
            $table->date('tanggal');
            $table->integer('total_dilayani_hari_ini')->default(0);
            $table->integer('total_dilewati_hari_ini')->default(0);
            $table->text('catatan')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['tanggal', 'jam_mulai']);
            $table->index(['dokter_id', 'tanggal']);
            $table->index('status');
            $table->index('dokter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_antrian');
    }
};
