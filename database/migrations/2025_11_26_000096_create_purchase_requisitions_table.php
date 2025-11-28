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
        Schema::create('purchase_requisitions', function (Blueprint $table) {
            $table->id();
            $table->string('pr_number')->unique();
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'rejected', 'converted_to_po'])->default('draft');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->integer('total_items')->default(0);
            $table->integer('total_quantity')->default(0);
            $table->timestamps();

            
            
        });

        Schema::create('purchase_requisition_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('purchase_requisition_id');
            $table->unsignedBigInteger('medicine_id');
            $table->integer('quantity_requested');
            $table->integer('quantity_approved')->nullable();
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_requisitions');
    }
};

