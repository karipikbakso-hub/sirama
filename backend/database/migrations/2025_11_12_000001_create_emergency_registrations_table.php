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
        Schema::create('emergency_registrations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->string('emergency_type'); // kecelakaan, serangan jantung, dll
            $table->enum('severity', ['kritis', 'darurat', 'urgent'])->default('urgent');
            $table->datetime('arrival_time');
            $table->enum('triage_level', ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'])->default('level_3');
            $table->text('symptoms')->nullable();
            $table->json('vital_signs')->nullable(); // blood pressure, heart rate, temperature, etc.
            $table->enum('status', ['menunggu', 'dalam_perawatan', 'stabil', 'dirujuk', 'meninggal'])->default('menunggu');
            $table->text('initial_diagnosis')->nullable();
            $table->text('treatment_given')->nullable();
            $table->string('room_assigned')->nullable();
            $table->unsignedBigInteger('doctor_assigned')->nullable();
            $table->unsignedBigInteger('nurse_assigned')->nullable();
            $table->datetime('discharge_time')->nullable();
            $table->text('discharge_notes')->nullable();
            $table->timestamps();

            $table->index(['arrival_time', 'status']);
            $table->index('severity');
            $table->index('triage_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_registrations');
    }
};

