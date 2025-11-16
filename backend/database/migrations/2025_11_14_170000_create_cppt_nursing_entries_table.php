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
        Schema::create('cppt_nursing_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pasien_id');
            $table->unsignedBigInteger('registrasi_id')->nullable();
            $table->unsignedBigInteger('user_id'); // perawat yang membuat catatan
            $table->timestamp('tanggal_waktu');
            $table->enum('shift', ['pagi', 'siang', 'malam'])->default('pagi');

            // Data SOAP dalam format JSON
            $table->json('assessment')->nullable(); // Subjective, Objective, Vital Signs, dll
            $table->json('diagnosis')->nullable(); // Diagnosis keperawatan dan medis
            $table->json('planning')->nullable(); // Planning jangka pendek dan panjang
            $table->json('intervention')->nullable(); // Intervensi keperawatan, medis, edukasi
            $table->json('evaluation')->nullable(); // Outcome, follow-up, notes

            $table->enum('status', ['draft', 'active', 'completed', 'reviewed'])->default('draft');
            $table->timestamps();

            $table->foreign('pasien_id')->references('id')->on('patients');
            $table->foreign('registrasi_id')->references('id')->on('registrations');
            $table->foreign('user_id')->references('id')->on('users');

            $table->index(['pasien_id', 'tanggal_waktu']);
            $table->index(['registrasi_id']);
            $table->index(['user_id', 'shift']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cppt_nursing_entries');
    }
};