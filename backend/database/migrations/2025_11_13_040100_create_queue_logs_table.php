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
        Schema::create('queue_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained('registrations')->onDelete('cascade');
            $table->string('queue_number');
            $table->string('action_type'); // 'called', 'skipped', 'completed', 'reordered', 'recalled'
            $table->string('previous_status')->nullable();
            $table->string('new_status');
            $table->unsignedBigInteger('performed_by')->nullable(); // user_id
            $table->string('service_unit');
            $table->integer('wait_time_minutes')->nullable(); // time waited before action
            $table->integer('service_time_minutes')->nullable(); // time spent in service
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // additional data like counter number, voice announcement, etc.
            $table->timestamp('action_timestamp');
            $table->timestamps();

            $table->index(['registration_id', 'action_timestamp']);
            $table->index(['action_type', 'action_timestamp']);
            $table->index(['service_unit', 'action_timestamp']);
            $table->index(['performed_by', 'action_timestamp']);

            $table->foreign('performed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_logs');
    }
};
