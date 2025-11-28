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
        Schema::create('t_tanda_vital', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('registration_id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('nurse_id');

            // Tanda Vital
            $table->integer('blood_pressure_systolic')->nullable();
            $table->integer('blood_pressure_diastolic')->nullable();
            $table->integer('heart_rate')->nullable(); // bpm
            $table->decimal('temperature', 4, 1)->nullable(); // °C
            $table->integer('respiration_rate')->nullable(); // /menit
            $table->integer('oxygen_saturation')->nullable(); // %

            // Antropometri
            $table->decimal('weight', 5, 1)->nullable(); // kg
            $table->decimal('height', 5, 1)->nullable(); // cm
            $table->decimal('bmi', 4, 1)->nullable(); // calculated

            // Status dan Catatan
            $table->enum('status', ['normal', 'warning', 'critical'])->default('normal');
            $table->text('notes')->nullable();

            // Timestamp pengukuran
            $table->timestamp('measured_at');

            // Audit fields
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            // Foreign keys
            
            
            
            
            

            // Indexes
            $table->index(['registration_id', 'measured_at']);
            $table->index(['patient_id', 'measured_at']);
            $table->index(['nurse_id', 'measured_at']);
            $table->index('status');
            $table->index('measured_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_tanda_vital');
    }
};

