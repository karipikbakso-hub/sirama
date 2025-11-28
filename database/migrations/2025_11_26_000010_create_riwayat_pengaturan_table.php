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
        Schema::create('riwayat_pengaturan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengaturan_sistem_id');
            $table->text('nilai_lama')->nullable();
            $table->text('nilai_baru')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->index(['pengaturan_sistem_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_pengaturan');
    }
};

