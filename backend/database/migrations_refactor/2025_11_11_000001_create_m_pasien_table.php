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
        Schema::create('m_pasien', function (Blueprint $table) {
            $table->id();
            $table->string('no_rm', 20)->unique(); // Medical Record Number
            $table->string('nama', 255);
            $table->string('nik', 16)->nullable()->unique();
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['L', 'P']); // L = Laki-laki, P = Perempuan
            $table->string('telepon', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->string('kontak_darurat', 20)->nullable();
            $table->string('no_bpjs', 20)->nullable()->unique();
            $table->enum('status', ['aktif', 'tidak_aktif', 'meninggal'])->default('aktif');
            $table->timestamps();

            // Indexes for performance
            $table->index('no_rm');
            $table->index('nik');
            $table->index('no_bpjs');
            $table->index('status');
            $table->index('nama');
            $table->index(['nama', 'tanggal_lahir']); // For patient search
            $table->index(['no_rm', 'status']); // For MRN + status queries

            // Fulltext search for patient lookup
            $table->fullText(['nama', 'alamat', 'telepon']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_pasien');
    }
};
