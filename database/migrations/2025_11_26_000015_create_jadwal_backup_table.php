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
        Schema::create('jadwal_backup', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jadwal');
            $table->enum('frekuensi', ['daily', 'weekly', 'monthly']);
            $table->time('waktu_eksekusi');
            $table->tinyInteger('hari_eksekusi')->nullable()->comment('1-7 untuk weekly (1=Sunday)');
            $table->boolean('status_aktif')->default(true);
            $table->timestamp('terakhir_dijalankan')->nullable();
            $table->timestamps();

            $table->index(['status_aktif'], 'idx_status_aktif');
            $table->index(['frekuensi'], 'idx_frekuensi');
            $table->index(['terakhir_dijalankan'], 'idx_terakhir_dijalankan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_backup');
    }
};

