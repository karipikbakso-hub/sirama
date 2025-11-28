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
        Schema::create('m_poli', function (Blueprint $table) {
            $table->id();
            $table->string('kode_poli', 10)->unique();
            $table->string('nama_poli', 100);
            $table->text('deskripsi')->nullable();
            $table->enum('jenis_poli', ['umum', 'spesialis', 'penunjang', 'gawat_darurat']);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'jenis_poli']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_poli');
    }
};
