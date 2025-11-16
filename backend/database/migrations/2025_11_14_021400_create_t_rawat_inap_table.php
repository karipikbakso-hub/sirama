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
        Schema::create('t_rawat_inap', function (Blueprint $table) {
            $table->id();
            $table->string('no_rawat_inap', 20)->unique();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('registration_id')->nullable()->constrained('t_registrasi')->onDelete('set null');
            $table->foreignId('ruangan_id')->constrained('m_ruangan')->onDelete('cascade');
            $table->foreignId('dokter_id')->nullable()->constrained('m_dokter')->onDelete('set null');
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_rawat_inap');
    }
};
