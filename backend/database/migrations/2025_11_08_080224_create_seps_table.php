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
        Schema::create('seps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('registration_id')->constrained('registrations')->onDelete('cascade');
            $table->string('sep_number', 20)->unique();
            $table->string('bpjs_number', 20);
            $table->enum('service_type', ['Rawat Jalan', 'Rawat Inap', 'Rawat Darurat', 'Prosedur']);
            $table->string('diagnosis', 255);
            $table->enum('status', ['active', 'inactive', 'rejected'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['registration_id']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seps');
    }
};
