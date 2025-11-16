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
        Schema::create('backup_histories', function (Blueprint $table) {
            $table->id();
            $table->string('backup_name');
            $table->string('filename');
            $table->enum('backup_type', ['full', 'incremental', 'differential', 'manual']);
            $table->enum('status', ['running', 'completed', 'failed', 'cancelled']);
            $table->bigInteger('file_size_bytes')->nullable();
            $table->string('file_size_human')->nullable();
            $table->string('file_path')->nullable();
            $table->string('checksum')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('backup_config')->nullable(); // Store backup configuration used
            $table->json('statistics')->nullable(); // Tables backed up, rows count, etc.
            $table->boolean('is_compressed')->default(false);
            $table->boolean('is_encrypted')->default(false);
            $table->string('storage_location');
            $table->unsignedBigInteger('schedule_id')->nullable(); // Reference to backup_schedules
            $table->unsignedBigInteger('created_by');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('schedule_id')->references('id')->on('backup_schedules')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users');
            $table->index(['status', 'created_at']);
            $table->index(['schedule_id', 'created_at']);
            $table->index('backup_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backup_histories');
    }
};
