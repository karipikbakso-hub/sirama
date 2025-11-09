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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->string('from_hospital'); // RS asal
            $table->string('to_hospital'); // RS tujuan
            $table->text('referral_reason'); // alasan rujukan
            $table->enum('urgency_level', ['darurat', 'urgent', 'elektif'])->default('elektif');
            $table->enum('status', ['menunggu', 'disetujui', 'ditolak', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->foreignId('doctor_id')->nullable()->constrained('users'); // dokter yang merujuk
            $table->string('specialty')->nullable(); // spesialisasi yang dibutuhkan
            $table->text('medical_summary')->nullable(); // ringkasan medis
            $table->text('diagnostic_results')->nullable(); // hasil diagnosis
            $table->text('treatment_history')->nullable(); // riwayat pengobatan
            $table->text('approval_notes')->nullable(); // catatan approval
            $table->datetime('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->text('rejection_reason')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->text('completion_notes')->nullable();
            $table->json('attachments')->nullable(); // file attachments
            $table->timestamps();

            $table->index(['status', 'urgency_level']);
            $table->index(['from_hospital', 'to_hospital']);
            $table->index('patient_id');
            $table->index('doctor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
