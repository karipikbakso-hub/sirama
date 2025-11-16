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
        Schema::create('service_counters', function (Blueprint $table) {
            $table->id();
            $table->string('counter_number')->unique(); // 'A01', 'B02', etc.
            $table->string('counter_name');
            $table->string('service_type'); // 'registration', 'payment', 'pharmacy', etc.
            $table->string('location')->nullable(); // physical location
            $table->enum('status', ['active', 'inactive', 'maintenance', 'offline'])->default('active');
            $table->unsignedBigInteger('current_user_id')->nullable(); // user currently assigned
            $table->unsignedBigInteger('current_registration_id')->nullable(); // current patient being served
            $table->timestamp('last_activity')->nullable();
            $table->integer('total_served_today')->default(0);
            $table->integer('average_service_time')->default(0); // in minutes
            $table->boolean('is_priority_counter')->default(false); // for VIP/emergency
            $table->json('supported_priorities')->nullable(); // ['normal', 'urgent', 'emergency']
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['service_type', 'status']);
            $table->index(['status', 'is_priority_counter']);
            $table->index('counter_number');

            $table->foreign('current_user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('current_registration_id')->references('id')->on('registrations')->onDelete('set null');
        });

        // Insert sample counters
        DB::table('service_counters')->insert([
            [
                'counter_number' => 'A01',
                'counter_name' => 'Loket Pendaftaran 1',
                'service_type' => 'registration',
                'location' => 'Lantai 1 - Area Pendaftaran',
                'status' => 'active',
                'total_served_today' => 0,
                'average_service_time' => 5,
                'is_priority_counter' => false,
                'supported_priorities' => json_encode(['normal', 'urgent']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'counter_number' => 'A02',
                'counter_name' => 'Loket Pendaftaran 2',
                'service_type' => 'registration',
                'location' => 'Lantai 1 - Area Pendaftaran',
                'status' => 'active',
                'total_served_today' => 0,
                'average_service_time' => 4,
                'is_priority_counter' => false,
                'supported_priorities' => json_encode(['normal', 'urgent']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'counter_number' => 'P01',
                'counter_name' => 'Loket Pembayaran Prioritas',
                'service_type' => 'payment',
                'location' => 'Lantai 1 - Area Kasir',
                'status' => 'active',
                'total_served_today' => 0,
                'average_service_time' => 3,
                'is_priority_counter' => true,
                'supported_priorities' => json_encode(['normal', 'urgent', 'emergency', 'vip']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'counter_number' => 'E01',
                'counter_name' => 'Loket Emergency',
                'service_type' => 'emergency',
                'location' => 'UGD - Area Emergency',
                'status' => 'active',
                'total_served_today' => 0,
                'average_service_time' => 2,
                'is_priority_counter' => true,
                'supported_priorities' => json_encode(['emergency']),
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
        Schema::dropIfExists('service_counters');
    }
};
