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
            $table->foreignId('priority_id')->nullable()->after('queue_order')->constrained('queue_priorities')->onDelete('set null');
            $table->index('priority_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropIndex(['priority_id']);
            $table->dropForeign(['priority_id']);
            $table->dropColumn('priority_id');
        });
    }
};
