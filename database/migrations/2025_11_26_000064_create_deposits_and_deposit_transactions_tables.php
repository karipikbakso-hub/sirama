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
        // Create deposits table
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->enum('deposit_type', ['rawat_inap', 'rawat_jalan']);
            $table->decimal('balance', 12, 2)->default(0);
            $table->enum('status', ['active', 'inactive', 'refunded'])->default('active');
            $table->timestamps();

            
            $table->index(['patient_id', 'deposit_type']);
            $table->index('status');
        });

        // Create deposit_transactions table
        Schema::create('deposit_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('deposit_id');
            $table->enum('type', ['top_up', 'deduct', 'refund']);
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['tunai', 'transfer', 'kartu_kredit', 'kartu_debit', 'e_wallet', 'bpjs'])->nullable();
            $table->string('reference_id', 50)->nullable(); // nomor referensi pembayaran atau billing id
            $table->unsignedBigInteger('created_by')->nullable(); // kasir yang melakukan transaksi
            $table->text('notes')->nullable();
            $table->timestamps();

            
            
            $table->index(['deposit_id', 'type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposit_transactions');
        Schema::dropIfExists('deposits');
    }
};

