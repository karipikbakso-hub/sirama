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
        Schema::table('registrations', function (Blueprint $table) {
            // Drop the incorrect foreign key constraint to users table
            $table->dropForeign(['doctor_id']);

            // Add the correct foreign key constraint to m_dokter table
            $table->foreign('doctor_id')->references('id')->on('m_dokter')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            // Drop the correct foreign key constraint to m_dokter table
            $table->dropForeign(['doctor_id']);

            // Restore the incorrect foreign key constraint to users table
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
