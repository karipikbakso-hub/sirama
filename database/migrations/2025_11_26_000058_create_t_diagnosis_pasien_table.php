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
        if (!Schema::hasTable('t_diagnosis_pasien')) {
            Schema::create('t_diagnosis_pasien', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('dokter_id')->nullable();
            $table->unsignedBigInteger('icd10_id')->nullable();
            $table->unsignedBigInteger('registration_id');
            $table->enum('tipe_diagnosis', ['utama', 'sekunder', 'komorbiditas'])->default('utama');
            $table->enum('kepastian', ['terkonfirmasi', 'presumtif', 'rule_out'])->default('terkonfirmasi');
            $table->text('catatan')->nullable();
            $table->timestamp('tanggal_diagnosis')->useCurrent();
            $table->timestamps();

            $table->index(['patient_id', 'tanggal_diagnosis']);
            $table->index(['dokter_id', 'tanggal_diagnosis']);
            $table->index('tipe_diagnosis');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_diagnosis_pasien');
    }
};

