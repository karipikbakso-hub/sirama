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
        Schema::create('prescription_handovers', function (Blueprint $table) {
            $table->id();

            // Foreign key to prescriptions
            $table->unsignedBigInteger('prescription_id');
            

            // Receiver information
            $table->string('receiver_name');
            $table->enum('receiver_relation', ['pasien', 'suami', 'istri', 'anak', 'orangtua', 'lainnya']);

            // Handover details
            $table->timestamp('handover_at');
            $table->unsignedBigInteger('pharmacist_id');
            

            // Education checklist (JSON)
            $table->json('education_checklist')->nullable();

            // Digital signature (optional)
            $table->text('digital_signature')->nullable();

            // Additional notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['prescription_id']);
            $table->index(['pharmacist_id']);
            $table->index(['handover_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescription_handovers');
    }
};

