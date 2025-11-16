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
        Schema::create('t_triase', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('registration_id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('nurse_id');

            // Triase data
            $table->tinyInteger('triage_level'); // 1-5
            $table->text('chief_complaint');
            $table->json('vital_signs'); // Store all vital signs as JSON
            $table->enum('priority', ['immediate', 'urgent', 'standard', 'non_urgent']);
            $table->string('estimated_wait_time');
            $table->text('notes')->nullable();

            // Triase timestamp
            $table->timestamp('triage_time');

            // Audit fields
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            // Foreign keys
            $table->foreign('registration_id')->references('id')->on('registrations')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('nurse_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index(['registration_id', 'triage_time']);
            $table->index(['patient_id', 'triage_time']);
            $table->index(['nurse_id', 'triage_time']);
            $table->index('triage_level');
            $table->index('priority');
            $table->index('triage_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_triase');
    }
};
