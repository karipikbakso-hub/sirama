<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('restrict');
            $table->string('registration_no', 20)->unique();
            $table->string('service_unit', 100); // Poli/Unit tujuan
            $table->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('arrival_type', ['mandiri', 'rujukan', 'igd'])->default('mandiri');
            $table->string('referral_source', 255)->nullable();
            $table->enum('payment_method', ['tunai', 'bpjs', 'asuransi'])->default('tunai');
            $table->string('insurance_number', 50)->nullable();
            $table->string('queue_number', 10)->nullable();
            $table->enum('status', ['registered', 'checked-in', 'completed', 'cancelled'])->default('registered');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            // Indexes for performance
            $table->index('patient_id');
            $table->index('doctor_id');
            $table->index('registration_no');
            $table->index('service_unit');
            $table->index('status');
            $table->index('created_by');
            $table->index('queue_number');
            $table->index(['patient_id', 'created_at']); // Patient registration history
            $table->index(['status', 'created_at']); // Status filtering
            $table->index(['service_unit', 'status']); // Service unit status
            $table->index('created_at'); // For date-based queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
