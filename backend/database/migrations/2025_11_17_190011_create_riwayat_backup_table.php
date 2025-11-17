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
        Schema::create('riwayat_backup', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('jadwal_backup_id')->nullable();
            $table->string('nama_file');
            $table->bigInteger('ukuran_file')->nullable();
            $table->string('path_file', 500)->nullable();
            $table->integer('durasi_detik')->nullable();
            $table->enum('status', ['running', 'completed', 'failed', 'cancelled'])->default('running');
            $table->text('pesan_error')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('jadwal_backup_id')->references('id')->on('jadwal_backup')->onDelete('set null');
            $table->index(['status'], 'idx_status');
            $table->index(['jadwal_backup_id'], 'idx_jadwal_backup_id');
            $table->index(['created_at'], 'idx_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_backup');
    }
};
