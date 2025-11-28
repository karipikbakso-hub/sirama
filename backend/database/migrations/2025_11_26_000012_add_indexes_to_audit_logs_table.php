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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['user_name', 'resource_type', 'created_at'], 'idx_audit_logs_user_module_date');
            $table->index('action');
            $table->index('resource_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_logs_user_module_date');
            $table->dropIndex(['action']);
            $table->dropIndex(['resource_type']);
            $table->dropIndex(['created_at']);
        });
    }
};

