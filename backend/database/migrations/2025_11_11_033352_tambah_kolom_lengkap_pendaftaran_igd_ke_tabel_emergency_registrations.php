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
        // Skip migration if columns already exist (prevent duplicate column errors)
        if (Schema::hasColumn('emergency_registrations', 'nama_kontak_darurat')) {
            return;
        }

        Schema::table('emergency_registrations', function (Blueprint $table) {
            // ===== DATA KONTAK EMERGENCY =====
            $table->string('nama_kontak_darurat', 255)->nullable()->after('patient_id')
                  ->comment('Nama kontak darurat pasien');
            $table->string('telepon_kontak_darurat', 20)->nullable()->after('nama_kontak_darurat')
                  ->comment('Nomor telepon kontak darurat');
            $table->string('hubungan_kontak_darurat', 50)->nullable()->after('telepon_kontak_darurat')
                  ->comment('Hubungan kontak darurat dengan pasien');

            // ===== INFORMASI ASURANSI =====
            $table->enum('jenis_asuransi', ['BPJS', 'Asuransi_Swasta', 'Tunai'])
                  ->default('Tunai')->after('hubungan_kontak_darurat')
                  ->comment('Jenis asuransi yang digunakan pasien');
            $table->string('nomor_asuransi', 50)->nullable()->after('jenis_asuransi')
                  ->comment('Nomor kartu asuransi');
            $table->string('penyedia_asuransi', 100)->nullable()->after('nomor_asuransi')
                  ->comment('Nama penyedia asuransi');

            // ===== KELUHAN UTAMA & GEJALA =====
            $table->text('keluhan_utama')->nullable()->after('nomor_asuransi')
                  ->comment('Keluhan utama pasien saat kedatangan');
            $table->tinyInteger('skala_nyeri')->nullable()->after('keluhan_utama')
                  ->comment('Skala nyeri 1-10');
            $table->text('gejala')->nullable()->after('skala_nyeri')
                  ->comment('Gejala-gejala yang dialami pasien');

            // ===== CARA KEDATANGAN =====
            $table->enum('cara_kedatangan', [
                'jalan_kaki', 'ambulance', 'mobil_pribadi', 'dibawa_orang',
                'angkutan_umum', 'helikopter', 'lainnya'
            ])->nullable()->after('gejala')
            ->comment('Cara pasien sampai ke IGD');

            // ===== LOKASI & WAKTU KEJADIAN =====
            $table->text('lokasi_kejadian')->nullable()->after('cara_kedatangan')
                  ->comment('Lokasi terjadinya kejadian/kejadian');
            $table->datetime('waktu_kejadian')->nullable()->after('lokasi_kejadian')
                  ->comment('Waktu terjadinya kejadian');

            // ===== TANDA-TANDA VITAL =====
            $table->string('tekanan_darah', 20)->nullable()->after('waktu_kejadian')
                  ->comment('Tekanan darah sistolik/diastolik (mmHg)');
            $table->integer('denyut_nadi')->nullable()->after('tekanan_darah')
                  ->comment('Denyut nadi per menit');
            $table->decimal('suhu_tubuh', 4, 1)->nullable()->after('denyut_nadi')
                  ->comment('Suhu tubuh dalam derajat Celsius');
            $table->integer('frekuensi_nafas')->nullable()->after('suhu_tubuh')
                  ->comment('Frekuensi nafas per menit');
            $table->integer('saturasi_oksigen')->nullable()->after('frekuensi_nafas')
                  ->comment('Saturasi oksigen (SpO2) dalam persen');
            $table->enum('kesadaran', [
                'alert', 'verbal', 'pain', 'unresponsive', 'confusion'
            ])->nullable()->after('saturasi_oksigen')
            ->comment('Tingkat kesadaran pasien (AVPU)');

            // ===== RIWAYAT KESEHATAN =====
            $table->json('alergi')->nullable()->after('kesadaran')
                  ->comment('Riwayat alergi pasien (array)');
            $table->json('obat_rutin')->nullable()->after('alergi')
                  ->comment('Obat-obatan rutin yang dikonsumsi');
            $table->json('penyakit_kronis')->nullable()->after('obat_rutin')
                  ->comment('Penyakit kronis yang diderita');
            $table->json('riwayat_operasi')->nullable()->after('penyakit_kronis')
                  ->comment('Riwayat operasi yang pernah dilakukan');
            $table->enum('golongan_darah', [
                'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Tidak_Diketahui'
            ])->nullable()->after('riwayat_operasi')
            ->comment('Golongan darah pasien');

            // ===== RIWAYAT SOSIAL =====
            $table->boolean('perokok')->nullable()->after('golongan_darah')
                  ->comment('Status perokok (true/false)');
            $table->boolean('konsumsi_alkohol')->nullable()->after('perokok')
                  ->comment('Konsumsi alkohol (true/false)');
            $table->boolean('pengguna_narkoba')->nullable()->after('konsumsi_alkohol')
                  ->comment('Pengguna narkoba (true/false)');

            // ===== DATA EMERGENCY SPESIFIK =====
            $table->string('nomor_ambulance', 50)->nullable()->after('pengguna_narkoba')
                  ->comment('Nomor ambulance yang membawa pasien');
            $table->string('rujukan_dari', 255)->nullable()->after('nomor_ambulance')
                  ->comment('Rujukan dari rumah sakit/puskesmas lain');
            $table->string('orang_yang_menemani', 255)->nullable()->after('rujukan_dari')
                  ->comment('Nama orang yang menemani pasien');
            $table->string('telepon_penemani', 20)->nullable()->after('orang_yang_menemani')
                  ->comment('Nomor telepon orang yang menemani');

            // ===== TRIAGE & PENILAIAN =====
            $table->text('penilaian_awal')->nullable()->after('telepon_penemani')
                  ->comment('Penilaian awal oleh perawat/triage officer');
            $table->text('intervensi_awal')->nullable()->after('penilaian_awal')
                  ->comment('Intervensi awal yang dilakukan');

            // ===== INDEXES UNTUK PERFORMA =====
            $table->index(['arrival_time', 'status'], 'idx_waktu_kedatangan_status');
            $table->index(['severity', 'status'], 'idx_keparahan_status');
            $table->index('jenis_asuransi', 'idx_jenis_asuransi');
            $table->index('cara_kedatangan', 'idx_cara_kedatangan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergency_registrations', function (Blueprint $table) {
            // Hapus semua kolom yang ditambahkan dalam urutan terbalik
            $table->dropIndex('idx_cara_kedatangan');
            $table->dropIndex('idx_jenis_asuransi');
            $table->dropIndex('idx_keparahan_status');
            $table->dropIndex('idx_waktu_kedatangan_status');

            $table->dropColumn([
                'intervensi_awal',
                'penilaian_awal',
                'telepon_penemani',
                'orang_yang_menemani',
                'rujukan_dari',
                'nomor_ambulance',
                'pengguna_narkoba',
                'konsumsi_alkohol',
                'perokok',
                'golongan_darah',
                'riwayat_operasi',
                'penyakit_kronis',
                'obat_rutin',
                'alergi',
                'kesadaran',
                'saturasi_oksigen',
                'frekuensi_nafas',
                'suhu_tubuh',
                'denyut_nadi',
                'tekanan_darah',
                'waktu_kejadian',
                'lokasi_kejadian',
                'cara_kedatangan',
                'gejala',
                'skala_nyeri',
                'keluhan_utama',
                'penyedia_asuransi',
                'nomor_asuransi',
                'jenis_asuransi',
                'hubungan_kontak_darurat',
                'telepon_kontak_darurat',
                'nama_kontak_darurat'
            ]);
        });
    }
};
