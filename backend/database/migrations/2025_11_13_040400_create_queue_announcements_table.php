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
        Schema::create('queue_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('template_code')->unique(); // 'call_normal', 'call_emergency', etc.
            $table->string('template_name');
            $table->enum('announcement_type', ['voice', 'display', 'both'])->default('both');
            $table->enum('language', ['id', 'en'])->default('id');
            $table->text('voice_template'); // Template text for TTS
            $table->text('display_template')->nullable(); // Template for screen display
            $table->string('voice_gender')->default('female'); // male, female
            $table->decimal('voice_speed', 3, 2)->default(1.0); // 0.5 to 2.0
            $table->integer('voice_pitch')->default(0); // -10 to 10
            $table->integer('repeat_count')->default(1);
            $table->integer('repeat_interval_seconds')->default(30);
            $table->boolean('is_active')->default(true);
            $table->integer('priority_level')->default(1); // for emergency announcements
            $table->json('variables')->nullable(); // ['queue_number', 'patient_name', 'service_unit']
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['announcement_type', 'is_active']);
            $table->index(['priority_level', 'is_active']);
            $table->index('template_code');
        });

        // Insert default announcement templates
        DB::table('queue_announcements')->insert([
            [
                'template_code' => 'call_normal',
                'template_name' => 'Panggilan Pasien Normal',
                'announcement_type' => 'both',
                'language' => 'id',
                'voice_template' => 'Nomor antrian {queue_number}, {patient_name}, silakan menuju ke {service_unit}',
                'display_template' => '📢 Nomor {queue_number} - {patient_name}\n🏥 Menuju ke {service_unit}',
                'voice_gender' => 'female',
                'voice_speed' => 0.9,
                'voice_pitch' => 0,
                'repeat_count' => 2,
                'repeat_interval_seconds' => 30,
                'is_active' => true,
                'priority_level' => 1,
                'variables' => json_encode(['queue_number', 'patient_name', 'service_unit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_code' => 'call_emergency',
                'template_name' => 'Panggilan Pasien Emergency',
                'announcement_type' => 'both',
                'language' => 'id',
                'voice_template' => 'DARURAT! Nomor antrian {queue_number}, {patient_name}, segera menuju ke {service_unit}',
                'display_template' => '🚨 DARURAT 🚨\nNomor {queue_number} - {patient_name}\n🏥 Segera ke {service_unit}',
                'voice_gender' => 'female',
                'voice_speed' => 1.2,
                'voice_pitch' => 2,
                'repeat_count' => 3,
                'repeat_interval_seconds' => 15,
                'is_active' => true,
                'priority_level' => 5,
                'variables' => json_encode(['queue_number', 'patient_name', 'service_unit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_code' => 'call_vip',
                'template_name' => 'Panggilan Pasien VIP',
                'announcement_type' => 'both',
                'language' => 'id',
                'voice_template' => 'Pasien prioritas, nomor antrian {queue_number}, {patient_name}, silakan menuju ke {service_unit}',
                'display_template' => '👑 PRIORITAS 👑\nNomor {queue_number} - {patient_name}\n🏥 Menuju ke {service_unit}',
                'voice_gender' => 'female',
                'voice_speed' => 1.0,
                'voice_pitch' => 1,
                'repeat_count' => 2,
                'repeat_interval_seconds' => 20,
                'is_active' => true,
                'priority_level' => 3,
                'variables' => json_encode(['queue_number', 'patient_name', 'service_unit']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_code' => 'complete_service',
                'template_name' => 'Penyelesaian Layanan',
                'announcement_type' => 'voice',
                'language' => 'id',
                'voice_template' => 'Terima kasih nomor antrian {queue_number} telah menggunakan layanan kami',
                'display_template' => '✅ Terima kasih nomor {queue_number}',
                'voice_gender' => 'female',
                'voice_speed' => 0.8,
                'voice_pitch' => 0,
                'repeat_count' => 1,
                'repeat_interval_seconds' => 0,
                'is_active' => true,
                'priority_level' => 1,
                'variables' => json_encode(['queue_number']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'template_code' => 'skip_patient',
                'template_name' => 'Lewati Pasien',
                'announcement_type' => 'display',
                'language' => 'id',
                'voice_template' => '',
                'display_template' => '⏭️ Nomor {queue_number} dilewati\nMohon bersabar',
                'voice_gender' => 'female',
                'voice_speed' => 1.0,
                'voice_pitch' => 0,
                'repeat_count' => 1,
                'repeat_interval_seconds' => 0,
                'is_active' => true,
                'priority_level' => 2,
                'variables' => json_encode(['queue_number']),
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
        Schema::dropIfExists('queue_announcements');
    }
};
