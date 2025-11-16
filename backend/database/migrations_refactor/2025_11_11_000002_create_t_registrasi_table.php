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
        Schema::create('t_registrasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasien_id')->constrained('m_pasien')->onDelete('restrict');
            $table->string('no_registrasi', 20)->unique();
            $table->foreignId('poli_id')->constrained('m_poli')->onDelete('restrict'); // Fixed: was service_unit string
            $table->foreignId('dokter_id')->nullable()->constrained('m_dokter')->onDelete('set null');
            $table->enum('jenis_kunjungan', ['baru', 'lama', 'kontrol', 'rujukan'])->default('baru');
            $table->string('sumber_rujukan', 255)->nullable();
            $table->enum('penjamin', ['tunai', 'bpjs', 'asuransi'])->default('tunai');
            $table->string('no_asuransi', 50)->nullable();
            $table->string('no_antrian', 10)->nullable();
            $table->enum('status', ['menunggu', 'dipanggil', 'sedang_diperiksa', 'selesai', 'batal'])->default('menunggu');
            $table->text('keluhan')->nullable();
            $table->decimal('biaya_registrasi', 10, 2)->default(0);
            $table->boolean('is_igd')->default(false); // Flag untuk IGD
            $table->text('gejala_igd')->nullable(); // Khusus IGD
            $table->json('tanda_vital_igd')->nullable(); // Khusus IGD
            $table->enum('triage_level', ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'])->nullable(); // Khusus IGD
            $table->foreignId('perawat_triage')->nullable()->constrained('users')->onDelete('set null'); // Khusus IGD
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->softDeletes(); // Untuk audit trail
            $table->timestamps();

            // Indexes for performance
            $table->index('pasien_id');
            $table->index('dokter_id');
            $table->index('no_registrasi');
            $table->index('poli_id');
            $table->index('status');
            $table->index('created_by');
            $table->index('no_antrian');
            $table->index(['pasien_id', 'created_at']); // Patient registration history
            $table->index(['status', 'created_at']); // Status filtering
            $table->index(['poli_id', 'status']); // Service unit status
            $table->index('created_at'); // For date-based queries
            $table->index('is_igd'); // IGD filtering
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_registrasi');
    }
};
