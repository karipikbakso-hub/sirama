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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained('m_dokter');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('service_type')->default('Konsultasi Rutin'); // Konsultasi, Follow-up, dll
            $table->enum('status', ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'])->default('pending');
            $table->text('notes')->nullable();
            $table->boolean('reminder_sent')->default(false);
            $table->datetime('reminder_sent_at')->nullable();
            $table->string('reminder_channel')->nullable(); // whatsapp, sms, email
            $table->text('cancellation_reason')->nullable();
            $table->datetime('cancelled_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->text('follow_up_notes')->nullable();
            $table->decimal('consultation_fee', 10, 2)->nullable();
            $table->boolean('is_paid')->default(false);
            $table->timestamps();

            $table->index(['appointment_date', 'appointment_time']);
            $table->index(['patient_id', 'appointment_date']);
            $table->index('status');
            $table->index('doctor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
