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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('mrn', 20)->unique(); // Medical Record Number
            $table->string('name', 255);
            $table->string('nik', 16)->nullable()->unique();
            $table->date('birth_date');
            $table->enum('gender', ['L', 'P']); // L = Laki-laki, P = Perempuan
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact', 20)->nullable();
            $table->string('bpjs_number', 20)->nullable()->unique();
            $table->enum('status', ['active', 'inactive', 'deceased'])->default('active');
            $table->timestamps();

            // Indexes for performance
            $table->index('mrn');
            $table->index('nik');
            $table->index('bpjs_number');
            $table->index('status');
            $table->index('name');
            $table->index(['name', 'birth_date']); // For patient search
            $table->index(['mrn', 'status']); // For MRN + status queries

            // Fulltext search for patient lookup
            $table->fullText(['name', 'address', 'phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
