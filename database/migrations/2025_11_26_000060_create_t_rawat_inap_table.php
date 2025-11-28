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
        if (!Schema::hasTable('t_rawat_inap')) {
            Schema::create('t_rawat_inap', function (Blueprint $table) {
            $table->id();
            $table->string('no_rawat_inap', 20)->unique();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('ruangan_id')->nullable();
            $table->unsignedBigInteger('registration_id');
            $table->unsignedBigInteger('dokter_id')->nullable();
            $table->dateTime('tanggal_masuk');
            $table->dateTime('tanggal_keluar')->nullable();
            $table->enum('status', ['dirawat', 'keluar', 'pindah_ruangan', 'meninggal', 'batal'])->default('dirawat');
            $table->text('diagnosa_masuk')->nullable();
            $table->text('diagnosa_keluar')->nullable();
            $table->text('catatan')->nullable();
            $table->decimal('biaya_per_hari', 10, 2)->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'status']);
            $table->index(['ruangan_id', 'status']);
            $table->index('tanggal_masuk');
            $table->index('no_rawat_inap');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_rawat_inap');
    }
};

