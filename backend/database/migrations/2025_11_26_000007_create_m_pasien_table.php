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
        Schema::create('m_pasien', function (Blueprint $table) {
            $table->id();
            $table->string('no_rm', 20)->unique(); // MR-YYYYMMDD-XXXX format
            $table->string('nama_lengkap', 255);
            $table->string('nik', 16)->nullable()->unique();
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['L', 'P']); // L = Laki-laki, P = Perempuan
            $table->string('golongan_darah', 3)->nullable(); // A/B/AB/O
            $table->enum('rhesus', ['+', '-'])->nullable();

            // Address breakdown
            $table->text('alamat')->nullable();
            $table->string('provinsi', 100)->nullable();
            $table->string('kota', 100)->nullable();
            $table->string('kecamatan', 100)->nullable();
            $table->string('kelurahan', 100)->nullable();
            $table->string('kode_pos', 5)->nullable();

            // Contact details
            $table->string('telepon', 20);
            $table->string('email', 255)->nullable();
            $table->string('kontak_darurat', 255);
            $table->string('telepon_darurat', 20);

            // Insurance details
            $table->enum('jenis_asuransi', ['BPJS', 'Asuransi Swasta', 'Perusahaan', 'Umum']);
            $table->string('kelas_bpjs', 5)->nullable(); // 1/2/3 for BPJS
            $table->string('provider_asuransi', 255)->nullable();
            $table->string('nomor_asuransi', 50)->nullable();
            $table->string('no_bpjs', 20)->nullable()->unique();

            // Medical history (JSON arrays)
            $table->json('alergi')->nullable(); // ['Obat', 'Makanan', 'Lainnya']
            $table->json('penyakit_kronis')->nullable(); // ['Hipertensi', 'Diabetes', etc.]

            // Audit fields
            $table->unsignedBigInteger('created_by')->nullable(); // Temporarily nullable for testing
            $table->enum('status_aktif', ['aktif', 'tidak_aktif'])->default('aktif');
            $table->timestamps();

            // Foreign key constraint
            

            // Indexes for performance
            $table->index('no_rm');
            $table->index('nik');
            $table->index('no_bpjs');
            $table->index('status_aktif');
            $table->index('nama_lengkap');
            $table->index(['nama_lengkap', 'tanggal_lahir']); // For patient search
            $table->index(['no_rm', 'status_aktif']); // For MRN + status queries
            $table->index('jenis_asuransi');
            $table->index('created_by');

            // Fulltext search for patient lookup
            $table->fullText(['nama_lengkap', 'alamat', 'telepon']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_pasien');
    }
};

