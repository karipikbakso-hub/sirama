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
        Schema::create('mobile_jkn_appointments', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');

            // BPJS data
            $table->string('bpjs_number', 16);
            $table->string('booking_code', 50)->nullable()->unique();
            $table->string('source')->default('jkn'); // jkn, manual, etc.

            // Appointment details
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('doctor_name', 100);
            $table->string('poli_name', 100);
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'no_show'])->default('scheduled');

            // JKN API data
            $table->json('jkn_data')->nullable(); // Store complete JKN response

            // Sync tracking
            $table->enum('sync_status', ['pending', 'success', 'failed', 'partial'])->default('pending');
            $table->timestamp('synced_at')->nullable();
            $table->timestamp('last_sync_attempt')->nullable();
            $table->text('sync_error')->nullable();

            // Metadata
            $table->timestamps();

            // Indexes
            $table->index(['patient_id', 'appointment_date']);
            $table->index(['bpjs_number', 'appointment_date']);
            $table->index(['booking_code']);
            $table->index(['status', 'appointment_date']);
            $table->index(['sync_status']);
            $table->index(['synced_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_jkn_appointments');
    }
};
