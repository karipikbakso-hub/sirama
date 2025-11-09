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
        Schema::create('queue_managements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->nullable()->constrained('m_dokter');
            $table->string('service_type');
            $table->integer('current_number')->default(0);
            $table->integer('last_called_number')->default(0);
            $table->integer('estimated_wait_time')->default(0);
            $table->enum('status', ['active', 'paused', 'stopped'])->default('active');
            $table->time('working_hours_start')->nullable();
            $table->time('working_hours_end')->nullable();
            $table->integer('max_queue_per_hour')->default(10);
            $table->integer('average_consultation_time')->default(20);
            $table->date('queue_date');
            $table->integer('total_served_today')->default(0);
            $table->integer('total_skipped_today')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['service_type', 'queue_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_managements');
    }
};
