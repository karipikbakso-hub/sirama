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
        // Drop the existing foreign key constraint that points to t_registrasi
        Schema::table('t_laboratorium', function (Blueprint $table) {
            $table->dropForeign(['registrasi_id']);
        });

        // Add new foreign key constraint that points to registrations table
        Schema::table('t_laboratorium', function (Blueprint $table) {
            $table->foreign('registrasi_id')->references('id')->on('registrations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the foreign key constraint that points to registrations
        Schema::table('t_laboratorium', function (Blueprint $table) {
            $table->dropForeign(['registrasi_id']);
        });

        // Add back the foreign key constraint that points to t_registrasi
        Schema::table('t_laboratorium', function (Blueprint $table) {
            $table->foreign('registrasi_id')->references('id')->on('t_registrasi')->onDelete('cascade');
        });
    }
};
