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
        Schema::create('t_jadwal_dokter', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('m_dokter')->onDelete('cascade');
            $table->foreignId('poli_id')->constrained('m_poli')->onDelete('cascade');
            $table->enum('hari', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->boolean('is_active')->default(true);
            $table->integer('quota_pasien')->default(50);
            $table->timestamps();

            // Index untuk performa
            $table->index(['doctor_id', 'poli_id']);
            $table->index(['hari', 'is_active']);
            $table->index(['poli_id', 'hari', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_jadwal_dokter');
    }
};