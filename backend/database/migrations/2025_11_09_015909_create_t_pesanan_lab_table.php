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
        Schema::create('t_pesanan_lab', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pasien')->constrained('patients')->onDelete('cascade');
            $table->foreignId('id_dokter')->constrained('m_dokter')->onDelete('cascade');
            $table->foreignId('id_laboratorium')->constrained('m_laboratorium')->onDelete('cascade');
            $table->dateTime('tanggal_pesanan');
            $table->enum('urgensi', ['rutin', 'cito', 'stat'])->default('rutin');
            $table->enum('status_pesanan', ['menunggu', 'diproses', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->text('diagnosa_klinis')->nullable();
            $table->text('catatan')->nullable();
            $table->text('hasil')->nullable();
            $table->dateTime('tanggal_hasil')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['id_pasien', 'status_pesanan']);
            $table->index(['id_dokter', 'tanggal_pesanan']);
            $table->index(['id_laboratorium', 'status_pesanan']);
            $table->index(['urgensi', 'status_pesanan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_pesanan_lab');
    }
};
