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
        Schema::create('m_dokter', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 20)->unique();
            $table->string('nama_dokter', 100);
            $table->string('spesialisasi', 100)->nullable();
            $table->string('no_str', 50)->nullable();
            $table->string('no_sip', 50)->nullable();
            $table->string('telepon', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->enum('status', ['aktif', 'nonaktif', 'cuti', 'pensiun'])->default('aktif');
            $table->timestamps();

            $table->index(['status', 'spesialisasi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_dokter');
    }
};
