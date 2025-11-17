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
        Schema::table('users', function (Blueprint $table) {
            // SIRAMA Hospital additional columns
            $table->string('username')->unique()->nullable()->after('name');
            $table->boolean('is_active')->default(true)->after('username');
            $table->string('nip', 18)->nullable()->after('is_active'); // 18-digit employee ID
            $table->string('phone', 15)->nullable()->after('nip'); // Indonesian phone format
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'is_active', 'nip', 'phone']);
        });
    }
};
