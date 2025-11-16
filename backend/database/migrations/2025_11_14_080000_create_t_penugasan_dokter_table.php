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
        Schema::create('t_penugasan_dokter', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // doctor_id
            $table->unsignedBigInteger('poli_id');
            $table->date('tanggal_penugasan');
            $table->time('waktu_mulai');
            $table->time('waktu_selesai');
            $table->enum('jenis_shift', ['pagi', 'siang', 'malam', 'jaga']);
            $table->boolean('aktif')->default(true);
            $table->text('catatan')->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('poli_id')->references('id')->on('m_poli')->onDelete('cascade');

            // Indexes
            $table->index(['user_id', 'tanggal_penugasan']);
            $table->index(['poli_id', 'tanggal_penugasan']);
            $table->index('tanggal_penugasan');
            $table->index('aktif');

            // Unique constraint - satu dokter hanya bisa satu poli per shift per hari
            $table->unique(['user_id', 'poli_id', 'tanggal_penugasan', 'jenis_shift'], 'unique_doctor_poli_shift_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_penugasan_dokter');
    }
};
