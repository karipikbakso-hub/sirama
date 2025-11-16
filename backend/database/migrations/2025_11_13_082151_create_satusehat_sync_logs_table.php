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
        Schema::create('satusehat_sync_logs', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');

            // SATUSEHAT sync data
            $table->string('resource_type', 50); // Patient, Encounter, Condition, Observation, etc.
            $table->string('resource_id', 100)->nullable(); // SATUSEHAT resource ID
            $table->string('local_resource_id', 100); // Local resource ID (patient ID, registration ID, etc.)
            $table->enum('sync_status', ['pending', 'success', 'failed'])->default('pending');
            $table->timestamp('sync_attempted_at')->nullable();
            $table->timestamp('sync_completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('fhir_data')->nullable(); // Store complete FHIR resource
            $table->json('request_payload')->nullable(); // Store request data for debugging
            $table->json('response_data')->nullable(); // Store response data for debugging

            // Metadata
            $table->integer('retry_count')->default(0);
            $table->timestamp('next_retry_at')->nullable();
            $table->string('sync_batch_id', 100)->nullable(); // For batch operations
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['patient_id', 'resource_type']);
            $table->index(['resource_type', 'sync_status']);
            $table->index(['sync_status', 'sync_attempted_at']);
            $table->index(['sync_batch_id']);
            $table->index(['next_retry_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('satusehat_sync_logs');
    }
};
