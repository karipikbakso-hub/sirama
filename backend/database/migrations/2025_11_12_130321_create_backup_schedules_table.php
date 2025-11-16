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
        Schema::create('backup_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('backup_type', ['full', 'incremental', 'differential']);
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'custom']);
            $table->time('schedule_time');
            $table->json('schedule_config')->nullable(); // For custom cron expressions
            $table->boolean('is_active')->default(true);
            $table->string('storage_path')->default('storage/backups');
            $table->integer('retention_days')->default(30);
            $table->boolean('compress_backup')->default(true);
            $table->boolean('encrypt_backup')->default(false);
            $table->string('encryption_key')->nullable();
            $table->json('include_tables')->nullable(); // Specific tables to backup
            $table->json('exclude_tables')->nullable(); // Tables to exclude
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->enum('status', ['active', 'paused', 'disabled'])->default('active');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users');
            $table->index(['is_active', 'next_run_at']);
            $table->index('frequency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backup_schedules');
    }
};
