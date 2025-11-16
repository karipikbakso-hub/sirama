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
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('level', ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug']);
            $table->string('level_name')->index();
            $table->text('message');
            $table->json('context')->nullable(); // Additional context data
            $table->string('channel')->default('default')->index();
            $table->json('extra')->nullable(); // Extra data like stack traces
            $table->string('logger_name')->nullable();
            $table->timestamp('logged_at');
            $table->string('file')->nullable();
            $table->integer('line')->nullable();
            $table->string('function')->nullable();
            $table->string('class')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('request_method')->nullable();
            $table->text('request_url')->nullable();
            $table->json('request_data')->nullable();
            $table->string('session_id')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            // Indexes for efficient querying
            $table->index(['level', 'logged_at']);
            $table->index(['channel', 'logged_at']);
            $table->index(['user_id', 'logged_at']);
            $table->index('resolved');
            $table->index('logged_at');

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('resolved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
