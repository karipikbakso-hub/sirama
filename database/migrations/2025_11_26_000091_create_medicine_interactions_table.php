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
        Schema::create('medicine_interactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medicine1_id');
            $table->unsignedBigInteger('medicine2_id');
            $table->enum('severity', ['minor', 'moderate', 'major'])->default('moderate');
            $table->text('description');
            $table->text('management')->nullable();
            $table->text('reference')->nullable();
            $table->timestamps();

            // Foreign keys
            
            

            // Ensure medicine1_id < medicine2_id to prevent duplicate pairs
            $table->unique(['medicine1_id', 'medicine2_id']);

            $table->index(['medicine1_id', 'severity']);
            $table->index(['medicine2_id', 'severity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_interactions');
    }
};

