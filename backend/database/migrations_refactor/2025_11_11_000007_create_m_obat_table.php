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
        Schema::create('m_obat', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 20)->unique();
            $table->string('nama_obat', 150);
            $table->string('nama_generik', 150)->nullable();
            $table->text('indikasi')->nullable();
            $table->text('kontraindikasi')->nullable();
            $table->string('bentuk_sediaan', 50);
            $table->string('kekuatan', 50)->nullable();
            $table->string('satuan', 20);
            $table->enum('golongan_obat', ['bebas', 'bebas_terbatas', 'keras', 'narkotika', 'psikotropika']);
            $table->decimal('harga_jual', 12, 2);
            $table->integer('stok_minimum')->default(10);
            $table->integer('stok_maksimum')->default(1000);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'golongan_obat']);
            $table->index('nama_obat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_obat');
    }
};
