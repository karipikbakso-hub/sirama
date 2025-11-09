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
        Schema::create('bpjs_integrations', function (Blueprint $table) {
            $table->id();
            $table->string('service_type'); // SEP, verification, claim, dll
            $table->json('request_data'); // JSON data request
            $table->json('response_data')->nullable(); // JSON data response
            $table->enum('status', ['success', 'error', 'pending', 'timeout'])->default('pending');
            $table->integer('response_time_ms')->nullable(); // response time in milliseconds
            $table->foreignId('patient_id')->nullable()->constrained('patients');
            $table->string('bpjs_number')->nullable(); // nomor BPJS pasien
            $table->string('endpoint')->nullable(); // BPJS endpoint yang dipanggil
            $table->text('error_message')->nullable(); // pesan error jika ada
            $table->string('request_id')->nullable(); // ID request dari BPJS
            $table->datetime('processed_at')->nullable(); // waktu diproses
            $table->timestamps();

            $table->index(['service_type', 'status']);
            $table->index(['patient_id', 'created_at']);
            $table->index('bpjs_number');
            $table->index('request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bpjs_integrations');
    }
};
