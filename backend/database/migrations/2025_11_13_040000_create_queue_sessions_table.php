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
        Schema::create('queue_sessions', function (Blueprint $table) {
            $table->id();
            $table->date('session_date');
            $table->string('service_type');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->enum('status', ['scheduled', 'active', 'paused', 'completed', 'cancelled'])->default('scheduled');
            $table->integer('total_expected_patients')->default(0);
            $table->integer('total_served_patients')->default(0);
            $table->integer('total_skipped_patients')->default(0);
            $table->integer('average_wait_time')->default(0); // in minutes
            $table->integer('average_service_time')->default(0); // in minutes
            $table->decimal('satisfaction_score', 3, 2)->nullable();
            $table->text('notes')->nullable();
            $table->json('performance_metrics')->nullable();
            $table->timestamps();

            $table->index(['session_date', 'service_type']);
            $table->index(['status', 'session_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_sessions');
    }
};
