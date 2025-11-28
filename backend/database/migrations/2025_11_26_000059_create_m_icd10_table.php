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
        Schema::create('m_icd10', function (Blueprint $table) {
            $table->id();
            $table->string('kode_icd', 10)->unique();
            $table->string('nama_diagnosis', 255);
            $table->string('kategori', 100);
            $table->enum('status', ['aktif', 'tidak_aktif'])->default('aktif');
            $table->timestamps();

            $table->index('kode_icd');
            $table->index('kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_icd10');
    }
};

