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
        Schema::create('performance_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_type'); // 'api_response_time', 'database_query_time', 'memory_usage', etc.
            $table->string('service_name')->nullable(); // 'api', 'database', 'cache', etc.
            $table->string('endpoint')->nullable(); // API endpoint or query identifier
            $table->decimal('value', 10, 2); // metric value
            $table->string('unit'); // 'ms', 'MB', 'percentage', etc.
            $table->json('metadata')->nullable(); // additional context
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['metric_type', 'recorded_at']);
            $table->index(['service_name', 'recorded_at']);
            $table->index('recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_metrics');
    }
};
