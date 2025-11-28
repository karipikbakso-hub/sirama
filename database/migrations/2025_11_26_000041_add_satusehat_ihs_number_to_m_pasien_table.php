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
        Schema::table('m_pasien', function (Blueprint $table) {
            $table->string('satusehat_ihs_number', 50)->nullable()->unique()
                  ->after('no_bpjs')
                  ->comment('IHS number from SATUSEHAT platform for patient identification');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_pasien', function (Blueprint $table) {
            $table->dropColumn('satusehat_ihs_number');
        });
    }
};

