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
        Schema::create('t_resep_obat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pasien')->constrained('patients')->onDelete('cascade');
            $table->foreignId('id_dokter')->constrained('m_dokter')->onDelete('cascade');
            $table->date('tanggal_resep');
            $table->text('diagnosa')->nullable();
            $table->enum('status', ['aktif', 'selesai', 'dibatalkan'])->default('aktif');
            $table->text('catatan')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['id_pasien', 'status']);
            $table->index(['id_dokter', 'tanggal_resep']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_resep_obat');
    }
};
