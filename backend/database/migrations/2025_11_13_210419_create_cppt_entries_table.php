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
        Schema::create('cppt_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pasien_id');
            $table->unsignedBigInteger('registrasi_id')->nullable();
            $table->unsignedBigInteger('user_id'); // dokter/perawat yang membuat catatan
            $table->timestamp('tanggal_waktu');
            $table->enum('shift', ['pagi', 'siang', 'malam'])->default('pagi');
            $table->text('subjektif')->nullable(); // S - Subjective
            $table->text('objektif')->nullable(); // O - Objective
            $table->text('asesmen')->nullable(); // A - Assessment
            $table->text('planning')->nullable(); // P - Planning
            $table->text('instruksi')->nullable(); // Instruksi khusus
            $table->text('evaluasi')->nullable(); // Evaluasi hasil
            $table->enum('status', ['draft', 'final'])->default('draft');
            $table->timestamps();

            $table->foreign('pasien_id')->references('id')->on('patients');
            $table->foreign('registrasi_id')->references('id')->on('registrations');
            $table->foreign('user_id')->references('id')->on('users');

            $table->index(['pasien_id', 'tanggal_waktu']);
            $table->index(['registrasi_id']);
            $table->index(['user_id', 'shift']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cppt_entries');
    }
};
