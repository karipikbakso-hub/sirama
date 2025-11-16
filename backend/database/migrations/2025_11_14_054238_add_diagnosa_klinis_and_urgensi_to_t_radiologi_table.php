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
        Schema::table('t_radiologi', function (Blueprint $table) {
            $table->text('diagnosa_klinis')->nullable()->after('tanggal_permintaan');
            $table->enum('urgensi', ['rutin', 'urgent', 'stat'])->default('rutin')->after('diagnosa_klinis');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_radiologi', function (Blueprint $table) {
            $table->dropColumn(['diagnosa_klinis', 'urgensi']);
        });
    }
};
