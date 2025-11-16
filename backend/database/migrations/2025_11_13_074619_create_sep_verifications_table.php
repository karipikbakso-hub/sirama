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
        Schema::create('sep_verifications', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('sep_id')->constrained('seps')->onDelete('cascade');
            $table->foreignId('checked_by')->nullable()->constrained('users')->onDelete('set null');

            // Verification details
            $table->enum('verification_type', ['status_check', 'detail_validation'])->default('status_check');
            $table->enum('result', ['success', 'failed', 'error'])->default('error');

            // Response data
            $table->json('response_data')->nullable();
            $table->integer('response_time_ms')->default(0);

            // Timestamps
            $table->timestamp('checked_at');
            $table->timestamps();

            // Indexes
            $table->index(['sep_id', 'checked_at']);
            $table->index(['verification_type', 'result']);
            $table->index('checked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sep_verifications');
    }
};
