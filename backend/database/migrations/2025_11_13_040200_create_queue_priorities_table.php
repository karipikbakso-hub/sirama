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
        Schema::create('queue_priorities', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // 'normal', 'urgent', 'emergency', 'vip'
            $table->string('name');
            $table->string('display_name');
            $table->integer('priority_level')->default(0); // higher number = higher priority
            $table->string('color_code')->default('#6B7280'); // hex color for UI
            $table->string('icon_class')->nullable(); // CSS class for icon
            $table->text('description')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->integer('max_wait_time_minutes')->nullable(); // SLA
            $table->boolean('auto_call')->default(false); // automatically call when available
            $table->boolean('skip_queue')->default(false); // bypass normal queue
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['priority_level', 'is_active']);
            $table->index('code');
        });

        // Insert default priority levels
        DB::table('queue_priorities')->insert([
            [
                'code' => 'normal',
                'name' => 'Normal',
                'display_name' => 'Pasien Normal',
                'priority_level' => 1,
                'color_code' => '#10B981',
                'icon_class' => 'fa-user',
                'description' => 'Pasien dengan prioritas normal',
                'requires_approval' => false,
                'max_wait_time_minutes' => 60,
                'auto_call' => false,
                'skip_queue' => false,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'urgent',
                'name' => 'Urgent',
                'display_name' => 'Pasien Urgent',
                'priority_level' => 3,
                'color_code' => '#F59E0B',
                'icon_class' => 'fa-exclamation-triangle',
                'description' => 'Pasien dengan kondisi urgent',
                'requires_approval' => true,
                'max_wait_time_minutes' => 15,
                'auto_call' => true,
                'skip_queue' => false,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'emergency',
                'name' => 'Emergency',
                'display_name' => 'Pasien Emergency',
                'priority_level' => 5,
                'color_code' => '#EF4444',
                'icon_class' => 'fa-ambulance',
                'description' => 'Pasien emergency/kritis',
                'requires_approval' => false,
                'max_wait_time_minutes' => 5,
                'auto_call' => true,
                'skip_queue' => true,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'vip',
                'name' => 'VIP',
                'display_name' => 'Pasien VIP',
                'priority_level' => 4,
                'color_code' => '#8B5CF6',
                'icon_class' => 'fa-crown',
                'description' => 'Pasien VIP/prioritas tinggi',
                'requires_approval' => true,
                'max_wait_time_minutes' => 10,
                'auto_call' => true,
                'skip_queue' => false,
                'is_active' => true,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_priorities');
    }
};
