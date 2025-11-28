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
        Schema::create('pengaturan_sistem', function (Blueprint $table) {
            $table->id();
            $table->string('kategori'); // hospital, billing, notification, system, etc
            $table->string('kunci'); // hospital.name, billing.currency, etc
            $table->text('nilai')->nullable(); // nilai setting (string/number/boolean)
            $table->string('tipe_data')->default('string'); // string, number, boolean
            $table->text('deskripsi')->nullable(); // penjelasan setting
            $table->timestamps();

            // Indexes
            $table->index(['kategori', 'kunci']);
            $table->unique(['kategori', 'kunci']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_sistem');
    }
};
