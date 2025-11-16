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
        Schema::table('patient_histories', function (Blueprint $table) {
            // Change status enum to English first (allows all values temporarily)
            $table->enum('status', ['completed', 'in_progress', 'cancelled', 'selesai', 'dalam_perawatan', 'menunggu', 'dibatalkan'])->default('completed')->change();

            // Add new columns
            $table->date('follow_up_date')->nullable()->after('notes');
            $table->text('prescription')->nullable()->after('vital_signs');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null')->after('prescription');

            // Add new indexes
            $table->index(['doctor_id', 'visit_date']);
            $table->index('created_by');
        });

        // Now update existing status values to match new enum
        DB::table('patient_histories')->where('status', 'selesai')->update(['status' => 'completed']);
        DB::table('patient_histories')->where('status', 'dalam_perawatan')->update(['status' => 'in_progress']);
        DB::table('patient_histories')->where('status', 'menunggu')->update(['status' => 'in_progress']);
        DB::table('patient_histories')->where('status', 'dibatalkan')->update(['status' => 'cancelled']);

        // Finally, restrict enum to only new values
        Schema::table('patient_histories', function (Blueprint $table) {
            $table->enum('status', ['completed', 'in_progress', 'cancelled'])->default('completed')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_histories', function (Blueprint $table) {
            // Drop new foreign key and column
            $table->dropForeign(['created_by']);
            $table->dropColumn(['follow_up_date', 'prescription', 'created_by']);

            // Drop new indexes
            $table->dropIndex(['doctor_id', 'visit_date']);
            $table->dropIndex(['created_by']);

            // Revert status enum to Indonesian
            $table->enum('status', ['selesai', 'dalam_perawatan', 'menunggu', 'dibatalkan'])->default('selesai')->change();

            // Drop and recreate doctor_id foreign key to users
            $table->dropForeign(['doctor_id']);
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('set null');

            // Add back old columns
            $table->string('department')->nullable()->after('doctor_id');
            $table->decimal('weight', 5, 2)->nullable()->after('vital_signs');
            $table->decimal('height', 5, 2)->nullable()->after('weight');
        });
    }
};
