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
            // Performance indexes for audit logs queries
            $table->index(['created_at'], 'idx_audit_logs_created_at');
            $table->index(['user_id'], 'idx_audit_logs_user_id');
            $table->index(['action'], 'idx_audit_logs_action');
            $table->index(['resource'], 'idx_audit_logs_resource');
            $table->index(['user_id', 'created_at'], 'idx_audit_logs_user_created');
            $table->index(['action', 'resource'], 'idx_audit_logs_action_resource');
            $table->index(['created_at', 'action'], 'idx_audit_logs_created_action');
            $table->index(['user_name'], 'idx_audit_logs_user_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Drop performance indexes
            $table->dropIndex('idx_audit_logs_created_at');
            $table->dropIndex('idx_audit_logs_user_id');
            $table->dropIndex('idx_audit_logs_action');
            $table->dropIndex('idx_audit_logs_resource');
            $table->dropIndex('idx_audit_logs_user_created');
            $table->dropIndex('idx_audit_logs_action_resource');
            $table->dropIndex('idx_audit_logs_created_action');
            $table->dropIndex('idx_audit_logs_user_name');
        });
    }
};
