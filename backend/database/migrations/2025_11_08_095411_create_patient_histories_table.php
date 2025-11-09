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
        Schema::create('patient_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->date('visit_date');
            $table->string('diagnosis')->nullable();
            $table->foreignId('doctor_id')->nullable()->constrained('users');
            $table->string('department')->nullable();
            $table->text('treatment')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['selesai', 'dalam_perawatan', 'menunggu', 'dibatalkan'])->default('selesai');
            $table->json('vital_signs')->nullable(); // blood pressure, temperature, etc.
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'visit_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_histories');
    }
};
