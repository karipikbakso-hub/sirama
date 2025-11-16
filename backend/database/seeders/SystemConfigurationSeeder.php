<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemConfiguration;

class SystemConfigurationSeeder extends Seeder
{
    public function run()
    {
        $configurations = [
            // === HOSPITAL INFORMATION ===
            [
                'key' => 'hospital_name',
                'value' => 'Rumah Sakit SIRAMA',
                'type' => 'string',
                'group' => 'hospital',
                'label' => 'Nama Rumah Sakit',
                'description' => 'Nama lengkap rumah sakit',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'hospital_address',
                'value' => 'Jl. Kesehatan No. 123, Jakarta',
                'type' => 'string',
                'group' => 'hospital',
                'label' => 'Alamat Rumah Sakit',
                'description' => 'Alamat lengkap rumah sakit',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'hospital_phone',
                'value' => '(021) 12345678',
                'type' => 'string',
                'group' => 'hospital',
                'label' => 'Telepon Rumah Sakit',
                'description' => 'Nomor telepon rumah sakit',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'hospital_email',
                'value' => 'info@sirama-hospital.com',
                'type' => 'string',
                'group' => 'hospital',
                'label' => 'Email Rumah Sakit',
                'description' => 'Alamat email resmi rumah sakit',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'hospital_type',
                'value' => 'general',
                'type' => 'string',
                'group' => 'hospital',
                'label' => 'Tipe Rumah Sakit',
                'description' => 'Tipe rumah sakit (general, specialist, etc.)',
                'options' => ['general' => 'Umum', 'specialist' => 'Spesialis', 'teaching' => 'Pengajar'],
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'hospital_class',
                'value' => 'B',
                'type' => 'string',
                'group' => 'hospital',
                'label' => 'Kelas Rumah Sakit',
                'description' => 'Kelas rumah sakit menurut Kemenkes',
                'options' => ['A' => 'Kelas A', 'B' => 'Kelas B', 'C' => 'Kelas C', 'D' => 'Kelas D'],
                'is_editable' => true,
                'requires_restart' => false,
            ],

            // === SYSTEM SETTINGS ===
            [
                'key' => 'app_name',
                'value' => 'SIRAMA - Sistem Informasi Rumah Sakit Modern & Akurat',
                'type' => 'string',
                'group' => 'system',
                'label' => 'Nama Aplikasi',
                'description' => 'Nama lengkap aplikasi SIRAMA',
                'is_editable' => true,
                'requires_restart' => true,
            ],
            [
                'key' => 'app_version',
                'value' => '1.0.0',
                'type' => 'string',
                'group' => 'system',
                'label' => 'Versi Aplikasi',
                'description' => 'Versi aplikasi saat ini',
                'is_editable' => false,
                'requires_restart' => false,
            ],
            [
                'key' => 'maintenance_mode',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'system',
                'label' => 'Mode Maintenance',
                'description' => 'Aktifkan mode maintenance untuk sistem',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'debug_mode',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'system',
                'label' => 'Debug Mode',
                'description' => 'Aktifkan mode debug untuk development',
                'is_editable' => true,
                'requires_restart' => true,
            ],
            [
                'key' => 'timezone',
                'value' => 'Asia/Jakarta',
                'type' => 'string',
                'group' => 'system',
                'label' => 'Timezone',
                'description' => 'Timezone untuk aplikasi',
                'options' => [
                    'Asia/Jakarta' => 'Asia/Jakarta (WIB)',
                    'Asia/Makassar' => 'Asia/Makassar (WITA)',
                    'Asia/Jayapura' => 'Asia/Jayapura (WIT)'
                ],
                'is_editable' => true,
                'requires_restart' => true,
            ],
            [
                'key' => 'locale',
                'value' => 'id',
                'type' => 'string',
                'group' => 'system',
                'label' => 'Bahasa Default',
                'description' => 'Bahasa default aplikasi',
                'options' => ['id' => 'Bahasa Indonesia', 'en' => 'English'],
                'is_editable' => true,
                'requires_restart' => false,
            ],

            // === SECURITY SETTINGS ===
            [
                'key' => 'session_lifetime',
                'value' => '480', // 8 hours in minutes
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Session Lifetime',
                'description' => 'Waktu hidup session dalam menit',
                'is_editable' => true,
                'requires_restart' => true,
            ],
            [
                'key' => 'password_min_length',
                'value' => '8',
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Panjang Password Minimum',
                'description' => 'Panjang minimum password pengguna',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'login_attempts_max',
                'value' => '5',
                'type' => 'integer',
                'group' => 'security',
                'label' => 'Maksimal Percobaan Login',
                'description' => 'Jumlah maksimal percobaan login sebelum lockout',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'two_factor_auth',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'security',
                'label' => 'Two-Factor Authentication',
                'description' => 'Aktifkan autentikasi dua faktor',
                'is_editable' => true,
                'requires_restart' => false,
            ],

            // === NOTIFICATION SETTINGS ===
            [
                'key' => 'email_notifications',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notifications',
                'label' => 'Notifikasi Email',
                'description' => 'Aktifkan notifikasi via email',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'sms_notifications',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'notifications',
                'label' => 'Notifikasi SMS',
                'description' => 'Aktifkan notifikasi via SMS',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'push_notifications',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notifications',
                'label' => 'Push Notifications',
                'description' => 'Aktifkan push notifications di aplikasi mobile',
                'is_editable' => true,
                'requires_restart' => false,
            ],

            // === BACKUP SETTINGS ===
            [
                'key' => 'auto_backup',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'backup',
                'label' => 'Backup Otomatis',
                'description' => 'Aktifkan backup otomatis database',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'backup_frequency',
                'value' => 'daily',
                'type' => 'string',
                'group' => 'backup',
                'label' => 'Frekuensi Backup',
                'description' => 'Frekuensi backup otomatis',
                'options' => [
                    'hourly' => 'Per Jam',
                    'daily' => 'Harian',
                    'weekly' => 'Mingguan',
                    'monthly' => 'Bulanan'
                ],
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'backup_retention_days',
                'value' => '30',
                'type' => 'integer',
                'group' => 'backup',
                'label' => 'Retention Backup',
                'description' => 'Berapa hari backup disimpan',
                'is_editable' => true,
                'requires_restart' => false,
            ],

            // === INTEGRATION SETTINGS ===
            [
                'key' => 'bpjs_integration',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'integration',
                'label' => 'Integrasi BPJS',
                'description' => 'Aktifkan integrasi dengan sistem BPJS',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'satusehat_integration',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'integration',
                'label' => 'Integrasi SATUSEHAT',
                'description' => 'Aktifkan integrasi dengan SATUSEHAT',
                'is_editable' => true,
                'requires_restart' => false,
            ],
            [
                'key' => 'external_api_timeout',
                'value' => '30',
                'type' => 'integer',
                'group' => 'integration',
                'label' => 'API Timeout',
                'description' => 'Timeout untuk external API calls (detik)',
                'is_editable' => true,
                'requires_restart' => false,
            ],
        ];

        foreach ($configurations as $config) {
            SystemConfiguration::updateOrCreate(
                ['key' => $config['key']],
                $config
            );
        }
    }
}
