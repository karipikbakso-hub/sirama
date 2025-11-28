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
        // Drop existing table if exists (to fix migration issues)
        Schema::dropIfExists('t_catatan_cppt');
        
        Schema::create('t_catatan_cppt', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('dokter_id')->nullable();
            $table->dateTime('tanggal_waktu');
            $table->text('subjective')->nullable(); // Keluhan pasien
            $table->text('objective')->nullable(); // Pemeriksaan fisik, vital signs
            $table->text('assessment')->nullable(); // Diagnosis dan penilaian
            $table->text('plan')->nullable(); // Rencana tindakan dan pengobatan
            $table->text('instruksi')->nullable(); // Instruksi khusus
            $table->text('evaluasi')->nullable(); // Evaluasi tindakan sebelumnya
            $table->enum('jenis_profesi', ['dokter', 'perawat', 'bidan', 'ahli_gizi', 'fisioterapis'])->default('dokter');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'tanggal_waktu']);
            $table->index(['dokter_id', 'tanggal_waktu']);
            $table->index('jenis_profesi');
            $table->index('tanggal_waktu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_catatan_cppt');
    }
};

