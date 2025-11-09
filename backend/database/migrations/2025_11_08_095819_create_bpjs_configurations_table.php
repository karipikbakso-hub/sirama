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
        Schema::create('bpjs_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('api_endpoint'); // URL BPJS API
            $table->text('api_key')->nullable(); // encrypted API key
            $table->text('secret_key')->nullable(); // encrypted secret key
            $table->datetime('token_expiry')->nullable(); // token expiry time
            $table->integer('rate_limit')->default(1000); // requests per hour
            $table->boolean('is_active')->default(true); // configuration status
            $table->string('environment')->default('production'); // production/sandbox
            $table->json('additional_config')->nullable(); // additional configuration
            $table->text('description')->nullable(); // configuration description
            $table->timestamps();

            $table->index(['is_active', 'environment']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bpjs_configurations');
    }
};
