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
        Schema::dropIfExists('t_obat_keluar');

        Schema::create('t_obat_keluar', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('registration_id')->nullable();
            $table->unsignedBigInteger('prescription_item_id')->nullable();
            $table->unsignedBigInteger('medicine_id')->nullable();
            $table->integer('quantity_given')->default(0);
            $table->timestamp('given_at')->nullable();
            $table->unsignedBigInteger('nurse_id')->nullable();
            $table->enum('status', ['menunggu', 'dikeluarkan', 'selesai'])->default('menunggu');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Foreign keys - corrected table names
            
            
            
            

            // Indexes
            $table->index('registration_id', 't_obat_keluar_registration_id_index');
            $table->index('prescription_item_id', 't_obat_keluar_prescription_item_id_index');
            $table->index('medicine_id', 't_obat_keluar_medicine_id_index');
            $table->index('nurse_id', 't_obat_keluar_nurse_id_index');
            $table->index('status', 't_obat_keluar_status_index');
            $table->index('given_at', 't_obat_keluar_given_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_obat_keluar');
    }
};

