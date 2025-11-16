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
            // Drop the old foreign key constraint
            $table->dropForeign(['registrasi_id']);

            // Add new foreign key constraint to registrations table
            $table->foreign('registrasi_id')->references('id')->on('registrations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_radiologi', function (Blueprint $table) {
            // Drop the new foreign key constraint
            $table->dropForeign(['registrasi_id']);

            // Add back the old foreign key constraint to t_registrasi table
            $table->foreign('registrasi_id')->references('id')->on('t_registrasi')->onDelete('cascade');
        });
    }
};
