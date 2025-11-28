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
            $table->string('kategori', 50)->index(); // hospital, app, integration, security, notifications, backup
            $table->string('kunci')->unique();
            $table->text('nilai')->nullable();
            $table->enum('tipe_data', ['string', 'integer', 'boolean', 'enum', 'file', 'json', 'encrypted'])->default('string');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_sensitif')->default(false);
            $table->timestamps();

            $table->index(['kategori', 'is_sensitif']);
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

