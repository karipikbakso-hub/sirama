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
        Schema::create('t_diagnosis_pasien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasien_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('registrasi_id')->nullable()->constrained('registrations')->onDelete('cascade');
            $table->foreignId('diagnosis_id')->constrained('m_diagnosa')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('users')->onDelete('cascade');
            $table->enum('tipe_diagnosis', ['utama', 'sekunder', 'komorbiditas'])->default('utama');
            $table->enum('kepastian', ['terkonfirmasi', 'presumtif', 'rule_out'])->default('terkonfirmasi');
            $table->text('catatan')->nullable();
            $table->timestamp('tanggal_diagnosis')->useCurrent();
            $table->timestamps();

            $table->index(['pasien_id', 'tanggal_diagnosis']);
            $table->index(['dokter_id', 'tanggal_diagnosis']);
            $table->index('tipe_diagnosis');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_diagnosis_pasien');
    }
};
