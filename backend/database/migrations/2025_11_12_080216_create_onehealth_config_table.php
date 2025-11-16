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
        Schema::create('onehealth_config', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('SATUSEHAT Integration');
            $table->string('status')->default('inactive'); // active, inactive
            $table->string('client_id')->nullable();
            $table->string('client_secret')->nullable();
            $table->string('base_url')->nullable();
            $table->string('organization_id')->nullable();
            $table->string('facility_id')->nullable();
            $table->json('additional_config')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onehealth_config');
    }
};
