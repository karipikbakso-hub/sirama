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
        // Transaction: Registrasi Pasien
        Schema::create('t_registrasi', function (Blueprint $table) {
            $table->id();
            $table->string('no_registrasi', 20)->unique();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('poli_id')->constrained('m_poli')->onDelete('cascade');
            $table->foreignId('dokter_id')->nullable()->constrained('m_dokter')->onDelete('set null');
            $table->foreignId('penjamin_id')->constrained('m_penjamin')->onDelete('cascade');
            $table->date('tanggal_registrasi');
            $table->time('jam_registrasi');
            $table->enum('jenis_kunjungan', ['baru', 'lama', 'kontrol', 'rujukan']);
            $table->enum('status', ['menunggu', 'dipanggil', 'sedang_diperiksa', 'selesai', 'batal'])->default('menunggu');
            $table->text('keluhan')->nullable();
            $table->decimal('biaya_registrasi', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['patient_id', 'tanggal_registrasi']);
            $table->index(['status', 'poli_id']);
            $table->index('no_registrasi');
        });

        // Transaction: Resep
        Schema::create('t_resep', function (Blueprint $table) {
            $table->id();
            $table->string('no_resep', 20)->unique();
            $table->foreignId('registrasi_id')->constrained('t_registrasi')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('m_dokter')->onDelete('cascade');
            $table->date('tanggal_resep');
            $table->text('diagnosa')->nullable();
            $table->text('instruksi')->nullable();
            $table->enum('status', ['draft', 'final', 'dibuat', 'selesai'])->default('draft');
            $table->timestamps();

            $table->index(['registrasi_id', 'status']);
            $table->index('no_resep');
        });

        // Transaction: Detail Resep (Obat dalam resep)
        Schema::create('t_resep_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resep_id')->constrained('t_resep')->onDelete('cascade');
            $table->foreignId('obat_id')->constrained('m_obat')->onDelete('cascade');
            $table->integer('jumlah');
            $table->string('aturan_pakai', 100); // contoh: "3x1 tablet", "2x1 sendok teh"
            $table->integer('hari')->default(1);
            $table->text('instruksi')->nullable();
            $table->decimal('harga_satuan', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();

            $table->index(['resep_id', 'obat_id']);
        });

        // Transaction: Pemeriksaan Medis
        Schema::create('t_pemeriksaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registrasi_id')->constrained('t_registrasi')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('m_dokter')->onDelete('cascade');
            $table->dateTime('tanggal_pemeriksaan');
            $table->text('anamnesis')->nullable(); // riwayat penyakit
            $table->text('pemeriksaan_fisik')->nullable();
            $table->decimal('berat_badan', 5, 2)->nullable();
            $table->decimal('tinggi_badan', 5, 2)->nullable();
            $table->decimal('tekanan_darah_sistolik', 5, 2)->nullable();
            $table->decimal('tekanan_darah_diastolik', 5, 2)->nullable();
            $table->decimal('suhu_badan', 4, 2)->nullable();
            $table->integer('denyut_nadi')->nullable();
            $table->text('diagnosa')->nullable();
            $table->text('terapi')->nullable();
            $table->text('catatan')->nullable();
            $table->enum('status', ['draft', 'final'])->default('draft');
            $table->timestamps();

            $table->index(['registrasi_id', 'tanggal_pemeriksaan']);
        });

        // Transaction: Tindakan Medis
        Schema::create('t_tindakan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pemeriksaan_id')->constrained('t_pemeriksaan')->onDelete('cascade');
            $table->foreignId('tindakan_master_id')->constrained('m_tindakan')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('m_dokter')->onDelete('cascade');
            $table->dateTime('tanggal_tindakan');
            $table->integer('jumlah')->default(1);
            $table->decimal('tarif_satuan', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['pemeriksaan_id', 'tanggal_tindakan']);
        });

        // Transaction: Laboratorium
        Schema::create('t_laboratorium', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registrasi_id')->constrained('t_registrasi')->onDelete('cascade');
            $table->foreignId('lab_id')->constrained('m_laboratorium')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('m_dokter')->onDelete('cascade');
            $table->dateTime('tanggal_permintaan');
            $table->dateTime('tanggal_hasil')->nullable();
            $table->text('hasil')->nullable();
            $table->string('satuan', 20)->nullable();
            $table->string('nilai_normal', 100)->nullable();
            $table->enum('status', ['diminta', 'proses', 'selesai', 'batal'])->default('diminta');
            $table->decimal('tarif', 10, 2);
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['registrasi_id', 'status']);
            $table->index('tanggal_permintaan');
        });

        // Transaction: Radiologi
        Schema::create('t_radiologi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registrasi_id')->constrained('t_registrasi')->onDelete('cascade');
            $table->foreignId('radio_id')->constrained('m_radiologi')->onDelete('cascade');
            $table->foreignId('dokter_id')->constrained('m_dokter')->onDelete('cascade');
            $table->dateTime('tanggal_permintaan');
            $table->dateTime('tanggal_hasil')->nullable();
            $table->text('hasil')->nullable();
            $table->text('kesan')->nullable();
            $table->enum('status', ['diminta', 'proses', 'selesai', 'batal'])->default('diminta');
            $table->decimal('tarif', 10, 2);
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['registrasi_id', 'status']);
            $table->index('tanggal_permintaan');
        });

        // Transaction: Obat Keluar (Dispensing)
        Schema::create('t_obat_keluar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resep_detail_id')->constrained('t_resep_detail')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // apoteker
            $table->dateTime('tanggal_keluar');
            $table->integer('jumlah_keluar');
            $table->decimal('harga_satuan', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->enum('status', ['menunggu', 'dikeluarkan', 'selesai'])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['resep_detail_id', 'status']);
            $table->index('tanggal_keluar');
        });

        // Transaction: Billing/Tagihan
        Schema::create('t_billing', function (Blueprint $table) {
            $table->id();
            $table->string('no_invoice', 20)->unique();
            $table->foreignId('registrasi_id')->constrained('t_registrasi')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // kasir
            $table->dateTime('tanggal_billing');
            $table->decimal('total_tagihan', 12, 2);
            $table->decimal('diskon', 10, 2)->default(0);
            $table->decimal('total_bayar', 12, 2);
            $table->enum('status', ['draft', 'final', 'lunas', 'batal'])->default('draft');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['registrasi_id', 'status']);
            $table->index('no_invoice');
            $table->index('tanggal_billing');
        });

        // Transaction: Pembayaran
        Schema::create('t_pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_id')->constrained('t_billing')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // kasir
            $table->dateTime('tanggal_bayar');
            $table->decimal('jumlah_bayar', 12, 2);
            $table->enum('metode_bayar', ['tunai', 'transfer', 'kartu_kredit', 'kartu_debit', 'e_wallet']);
            $table->string('no_referensi', 50)->nullable(); // nomor transfer, dll
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['billing_id', 'tanggal_bayar']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_pembayaran');
        Schema::dropIfExists('t_billing');
        Schema::dropIfExists('t_obat_keluar');
        Schema::dropIfExists('t_radiologi');
        Schema::dropIfExists('t_laboratorium');
        Schema::dropIfExists('t_tindakan');
        Schema::dropIfExists('t_pemeriksaan');
        Schema::dropIfExists('t_resep_detail');
        Schema::dropIfExists('t_resep');
        Schema::dropIfExists('t_registrasi');
    }
};
