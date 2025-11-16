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
        Schema::create('system_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, boolean, json, file
            $table->string('group')->default('general'); // general, hospital, system, security, etc.
            $table->string('label');
            $table->text('description')->nullable();
            $table->json('options')->nullable(); // For select/radio options
            $table->boolean('is_editable')->default(true);
            $table->boolean('requires_restart')->default(false);
            $table->timestamps();

            $table->index(['group', 'is_editable']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_configurations');
    }
};
