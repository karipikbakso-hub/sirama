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
        Schema::create('nursing_queues', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('poli_id');
            $table->unsignedBigInteger('registration_id');
            $table->string('queue_number', 10); // Format: A-001, B-001, etc.
            $table->date('queue_date');
            $table->enum('status', ['waiting', 'called', 'serving', 'completed', 'skipped'])->default('waiting');
            $table->timestamp('called_at')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->timestamps();

            $table->index(['poli_id', 'queue_date']);
            $table->index(['registration_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_queues');
    }
};

