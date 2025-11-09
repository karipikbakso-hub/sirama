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
        // Master Poli/Unit Pelayanan
        Schema::create('m_poli', function (Blueprint $table) {
            $table->id();
            $table->string('kode_poli', 10)->unique();
            $table->string('nama_poli', 100);
            $table->text('deskripsi')->nullable();
            $table->enum('jenis_poli', ['umum', 'spesialis', 'penunjang', 'gawat_darurat']);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'jenis_poli']);
        });

        // Master Dokter
        Schema::create('m_dokter', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 20)->unique();
            $table->string('nama_dokter', 100);
            $table->string('spesialisasi', 100)->nullable();
            $table->string('no_str', 50)->nullable();
            $table->string('no_sip', 50)->nullable();
            $table->string('telepon', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->enum('status', ['aktif', 'nonaktif', 'cuti', 'pensiun'])->default('aktif');
            $table->timestamps();

            $table->index(['status', 'spesialisasi']);
        });

        // Master Obat
        Schema::create('m_obat', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 20)->unique();
            $table->string('nama_obat', 150);
            $table->string('nama_generik', 150)->nullable();
            $table->text('indikasi')->nullable();
            $table->text('kontraindikasi')->nullable();
            $table->string('bentuk_sediaan', 50); // tablet, kapsul, sirup, injeksi, dll
            $table->string('kekuatan', 50)->nullable(); // 500mg, 10ml, dll
            $table->string('satuan', 20); // mg, ml, tablet, dll
            $table->enum('golongan_obat', ['bebas', 'bebas_terbatas', 'keras', 'narkotika', 'psikotropika']);
            $table->decimal('harga_jual', 12, 2);
            $table->integer('stok_minimum')->default(10);
            $table->integer('stok_maksimum')->default(1000);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'golongan_obat']);
            $table->index('nama_obat');
        });

        // Master Diagnosa ICD-10
        Schema::create('m_diagnosa', function (Blueprint $table) {
            $table->id();
            $table->string('kode_icd', 10)->unique();
            $table->string('nama_diagnosa', 255);
            $table->text('deskripsi')->nullable();
            $table->enum('kategori', ['penyakit', 'cedera', 'gejala', 'faktor_eksternal']);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'kategori']);
            $table->index('nama_diagnosa');
        });

        // Master Tindakan Medis
        Schema::create('m_tindakan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_tindakan', 20)->unique();
            $table->string('nama_tindakan', 150);
            $table->text('deskripsi')->nullable();
            $table->enum('kategori', ['pemeriksaan', 'tindakan', 'operasi', 'terapi', 'rehabilitasi']);
            $table->decimal('tarif', 12, 2);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'kategori']);
            $table->index('nama_tindakan');
        });

        // Master Asuransi/Penjamin
        Schema::create('m_penjamin', function (Blueprint $table) {
            $table->id();
            $table->string('kode_penjamin', 10)->unique();
            $table->string('nama_penjamin', 100);
            $table->enum('jenis_penjamin', ['bpjs', 'asuransi_swasta', 'perusahaan', 'pemerintah', 'perorangan']);
            $table->text('alamat')->nullable();
            $table->string('telepon', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'jenis_penjamin']);
        });

        // Master Ruangan/Kamar
        Schema::create('m_ruangan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_ruangan', 10)->unique();
            $table->string('nama_ruangan', 100);
            $table->enum('jenis_ruangan', ['rawat_inap', 'icu', 'nicu', 'operasi', 'bersalin', 'igd', 'poli']);
            $table->integer('kapasitas')->default(1);
            $table->decimal('tarif_per_hari', 10, 2)->nullable();
            $table->enum('status', ['tersedia', 'digunakan', 'maintenance', 'nonaktif'])->default('tersedia');
            $table->text('fasilitas')->nullable();
            $table->timestamps();

            $table->index(['status', 'jenis_ruangan']);
        });

        // Master Supplier
        Schema::create('m_supplier', function (Blueprint $table) {
            $table->id();
            $table->string('kode_supplier', 10)->unique();
            $table->string('nama_supplier', 100);
            $table->text('alamat')->nullable();
            $table->string('telepon', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('pic', 100)->nullable(); // Person in Charge
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index('aktif');
        });

        // Master Laboratorium
        Schema::create('m_laboratorium', function (Blueprint $table) {
            $table->id();
            $table->string('kode_lab', 10)->unique();
            $table->string('nama_pemeriksaan', 150);
            $table->text('deskripsi')->nullable();
            $table->string('kategori', 50); // hematologi, kimia, serologi, dll
            $table->string('satuan', 20)->nullable();
            $table->string('nilai_normal', 100)->nullable();
            $table->decimal('tarif', 10, 2);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'kategori']);
            $table->index('nama_pemeriksaan');
        });

        // Master Radiologi
        Schema::create('m_radiologi', function (Blueprint $table) {
            $table->id();
            $table->string('kode_radio', 10)->unique();
            $table->string('nama_pemeriksaan', 150);
            $table->text('deskripsi')->nullable();
            $table->string('kategori', 50); // X-Ray, CT-Scan, MRI, USG, dll
            $table->decimal('tarif', 10, 2);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'kategori']);
            $table->index('nama_pemeriksaan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_radiologi');
        Schema::dropIfExists('m_laboratorium');
        Schema::dropIfExists('m_supplier');
        Schema::dropIfExists('m_ruangan');
        Schema::dropIfExists('m_penjamin');
        Schema::dropIfExists('m_tindakan');
        Schema::dropIfExists('m_diagnosa');
        Schema::dropIfExists('m_obat');
        Schema::dropIfExists('m_dokter');
        Schema::dropIfExists('m_poli');
    }
};
