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
        Schema::create('patient_communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->string('communication_type'); // appointment_reminder, payment_reminder, etc.
            $table->enum('channel', ['whatsapp', 'sms', 'email', 'phone'])->default('sms');
            $table->text('message_content'); // isi pesan
            $table->enum('status', ['sent', 'delivered', 'read', 'failed'])->default('sent');
            $table->datetime('sent_at')->nullable();
            $table->datetime('delivered_at')->nullable();
            $table->datetime('read_at')->nullable();
            $table->text('delivery_confirmation')->nullable(); // konfirmasi pengiriman
            $table->string('message_id')->nullable(); // ID dari provider (Twilio, etc.)
            $table->decimal('cost', 8, 4)->nullable(); // biaya pengiriman
            $table->json('metadata')->nullable(); // additional data
            $table->text('error_message')->nullable(); // jika ada error
            $table->timestamps();

            $table->index(['patient_id', 'sent_at']);
            $table->index(['channel', 'status']);
            $table->index('communication_type');
            $table->index('message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_communications');
    }
};
