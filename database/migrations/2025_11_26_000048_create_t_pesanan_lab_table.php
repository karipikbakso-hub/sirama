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
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('dokter_id');
            $table->unsignedBigInteger('laboratorium_id');
            $table->dateTime('tanggal_pesanan');
            $table->enum('urgensi', ['rutin', 'cito', 'stat'])->default('rutin');
            $table->enum('status_pesanan', ['menunggu', 'diproses', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->text('diagnosa_klinis')->nullable();
            $table->text('catatan')->nullable();
            $table->text('hasil')->nullable();
            $table->dateTime('tanggal_hasil')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status_pesanan']);
            $table->index(['dokter_id', 'tanggal_pesanan']);
            $table->index(['laboratorium_id', 'status_pesanan']);
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

