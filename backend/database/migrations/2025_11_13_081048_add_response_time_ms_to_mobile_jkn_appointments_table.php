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
        Schema::table('mobile_jkn_appointments', function (Blueprint $table) {
            $table->integer('response_time_ms')->default(0)->after('sync_error');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mobile_jkn_appointments', function (Blueprint $table) {
            $table->dropColumn('response_time_ms');
        });
    }
};
