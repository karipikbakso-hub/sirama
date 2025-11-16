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
        Schema::create('t_hasil_survey', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id')->nullable();
            $table->unsignedBigInteger('registration_id')->nullable();
            $table->string('jenis_layanan')->nullable(); // rawat_jalan, rawat_inap, gawat_darurat
            $table->date('tanggal_survey');
            $table->json('ratings'); // Store all ratings as JSON: {kesopanan: 5, kualitas_pelayanan: 4, dll}
            $table->decimal('nilai_rata_rata', 3, 2)->nullable(); // Calculated average rating
            $table->text('komentar')->nullable();
            $table->string('kelompok_usia')->nullable(); // anak, remaja, dewasa, lansia
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->boolean('disarankan')->default(false); // apakah menyaranpakan rumah sakit

            // Audit fields
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            // Foreign keys
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
            $table->foreign('registration_id')->references('id')->on('registrations')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index(['patient_id', 'tanggal_survey']);
            $table->index(['registration_id', 'tanggal_survey']);
            $table->index('tanggal_survey');
            $table->index('jenis_layanan');
            $table->index(['jenis_layanan', 'tanggal_survey']);
            $table->index('nilai_rata_rata');
            $table->index('kelompok_usia');
            $table->index('jenis_kelamin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_hasil_survey');
    }
};
