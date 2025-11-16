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
        Schema::create('t_pemeriksaan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('registration_id');
            $table->unsignedBigInteger('doctor_id');
            $table->unsignedBigInteger('patient_id');

            // Anamnesis (Riwayat)
            $table->text('keluhan_utama')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('riwayat_penyakit_dahulu')->nullable();
            $table->text('riwayat_penyakit_keluarga')->nullable();
            $table->text('riwayat_alergi')->nullable();
            $table->text('riwayat_pengobatan')->nullable();

            // Pemeriksaan Fisik
            $table->json('tanda_vital')->nullable(); // blood_pressure, heart_rate, temperature, respiration_rate, oxygen_saturation, weight, height, bmi
            $table->text('keadaan_umum')->nullable();
            $table->text('kesadaran')->nullable();
            $table->text('kepala')->nullable();
            $table->text('mata')->nullable();
            $table->text('telinga')->nullable();
            $table->text('hidung')->nullable();
            $table->text('tenggorokan')->nullable();
            $table->text('leher')->nullable();
            $table->text('thorax')->nullable();
            $table->text('jantung')->nullable();
            $table->text('paru')->nullable();
            $table->text('abdomen')->nullable();
            $table->text('ekstremitas')->nullable();
            $table->text('neurologi')->nullable();
            $table->text('kulit')->nullable();
            $table->text('lain_lain')->nullable();

            // Diagnosis
            $table->json('diagnosis')->nullable(); // array of diagnosis with ICD-10 codes
            $table->text('diagnosis_utama')->nullable();
            $table->text('diagnosis_sekunder')->nullable();
            $table->text('diagnosis_banding')->nullable();

            // Planning/Treatment
            $table->json('tindakan')->nullable(); // array of treatments/procedures
            $table->json('terapi')->nullable(); // medications, therapy plans
            $table->text('rencana_tindak_lanjut')->nullable();
            $table->date('tanggal_kontrol')->nullable();
            $table->text('instruksi_pasien')->nullable();

            // Status
            $table->enum('status', ['draft', 'completed', 'cancelled'])->default('draft');
            $table->timestamp('tanggal_pemeriksaan');
            $table->text('catatan_dokter')->nullable();

            // Audit fields
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            // Foreign keys
            $table->foreign('registration_id')->references('id')->on('registrations')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index(['registration_id', 'tanggal_pemeriksaan']);
            $table->index(['doctor_id', 'tanggal_pemeriksaan']);
            $table->index(['patient_id', 'tanggal_pemeriksaan']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_pemeriksaan');
    }
};
