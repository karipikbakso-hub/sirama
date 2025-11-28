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
        Schema::table('t_triase', function (Blueprint $table) {
            // Kolom sesuai requirement ESI triase
            $table->enum('kategori_triase', ['merah', 'kuning', 'hijau', 'hitam'])->nullable()->after('triage_level');
            $table->text('keluhan_utama')->nullable()->after('chief_complaint');
            $table->text('mekanisme_cedera')->nullable()->after('keluhan_utama');
            $table->enum('airway', ['patent', 'obstruksi', 'bebas'])->nullable()->after('mekanisme_cedera');
            $table->enum('breathing', ['normal', 'sesak', 'tidak_ada'])->nullable()->after('airway');
            $table->enum('circulation', ['stabil', 'syok', 'tidak_teraba'])->nullable()->after('breathing');
            $table->enum('disability', ['composmentis', 'penurunan_kesadaran', 'koma'])->nullable()->after('circulation');
            $table->enum('exposure', ['cedera_tampak', 'tidak_ada'])->nullable()->after('disability');
            $table->unsignedBigInteger('vital_signs_id')->nullable()->after('exposure');
            $table->timestamp('response_time')->nullable()->after('vital_signs_id');

            // Foreign key untuk vital_signs - sementara dihapus karena tabel mungkin belum ada
            // 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_triase', function (Blueprint $table) {
            // $table->dropForeign(['vital_signs_id']); // Foreign key sudah dihapus
            $table->dropColumn([
                'kategori_triase',
                'keluhan_utama',
                'mekanisme_cedera',
                'airway',
                'breathing',
                'circulation',
                'disability',
                'exposure',
                'vital_signs_id',
                'response_time'
            ]);
        });
    }
};

