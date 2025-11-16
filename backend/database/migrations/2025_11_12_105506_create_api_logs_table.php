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
        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->string('service')->index(); // bpjs, satusehat, etc
            $table->string('endpoint'); // API endpoint URL
            $table->string('method', 10); // GET, POST, PUT, DELETE
            $table->json('request_data')->nullable(); // request payload
            $table->json('response_data')->nullable(); // response data
            $table->integer('status_code')->nullable(); // HTTP status code
            $table->integer('response_time')->nullable(); // response time in ms
            $table->text('error_message')->nullable(); // error message if any
            $table->string('request_id')->nullable(); // unique request identifier
            $table->string('ip_address')->nullable(); // client IP
            $table->text('user_agent')->nullable(); // user agent string
            $table->unsignedBigInteger('user_id')->nullable(); // user who made the request
            $table->string('environment')->default('production'); // production/sandbox
            $table->boolean('is_success')->default(true); // request success status
            $table->timestamps();

            $table->index(['service', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['is_success', 'created_at']);
            $table->index(['status_code']);

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
    }
};
