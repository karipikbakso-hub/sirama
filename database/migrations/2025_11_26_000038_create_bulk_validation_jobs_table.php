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
        Schema::create('bulk_validation_jobs', function (Blueprint $table) {
            $table->id();
            $table->integer('total_seps');
            $table->integer('batch_size')->default(25);
            $table->enum('status', ['queued', 'processing', 'completed', 'failed'])->default('queued');
            $table->unsignedBigInteger('initiated_by');
            $table->boolean('force_revalidate')->default(false);
            $table->integer('current_batch')->nullable();
            $table->integer('total_batches')->nullable();
            $table->integer('processed_seps')->default(0);
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->integer('successful_validations')->default(0);
            $table->integer('failed_validations')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('estimated_completion')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            
            $table->index(['status', 'created_at']);
            $table->index(['initiated_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bulk_validation_jobs');
    }
};

