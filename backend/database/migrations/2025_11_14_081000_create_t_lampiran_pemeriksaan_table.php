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
        Schema::create('t_lampiran_pemeriksaan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pemeriksaan_id');
            $table->string('nama_file');
            $table->string('path_file');
            $table->string('tipe_file'); // image, document, lab-result, radiology, etc
            $table->string('mime_type');
            $table->unsignedBigInteger('ukuran_file'); // dalam bytes
            $table->text('deskripsi')->nullable();
            $table->string('uploaded_by')->nullable(); // nama atau ID user yang upload
            $table->timestamp('uploaded_at');
            $table->boolean('aktif')->default(true);

            $table->timestamps();

            // Foreign keys
            $table->foreign('pemeriksaan_id')->references('id')->on('t_pemeriksaan')->onDelete('cascade');

            // Indexes
            $table->index(['pemeriksaan_id', 'aktif']);
            $table->index('tipe_file');
            $table->index('uploaded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_lampiran_pemeriksaan');
    }
};
