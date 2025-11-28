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
        Schema::table('t_tanda_vital', function (Blueprint $table) {
            $table->integer('pain_scale')->nullable()->after('oxygen_saturation');
            $table->enum('consciousness', ['composmentis', 'apatis', 'somnolen', 'sopor', 'koma'])->nullable()->after('pain_scale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_tanda_vital', function (Blueprint $table) {
            $table->dropColumn(['pain_scale', 'consciousness']);
        });
    }
};

