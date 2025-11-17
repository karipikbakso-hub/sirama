<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PengaturanSistem;

class PengaturanSistemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Informasi Rumah Sakit
            [
                'kategori' => 'hospital',
                'kunci' => 'hospital.name',
                'nilai' => 'Rumah Sakit Harapan',
                'tipe_data' => 'string',
                'deskripsi' => 'Nama lengkap rumah sakit',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'hospital',
                'kunci' => 'hospital.code',
                'nilai' => 'A',
                'tipe_data' => 'enum',
                'deskripsi' => 'Kode jenis rumah sakit',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'hospital',
                'kunci' => 'hospital.type',
                'nilai' => 'A',
                'tipe_data' => 'enum',
                'deskripsi' => 'Jenis rumah sakit (A/B/C/D)',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'hospital',
                'kunci' => 'hospital.address',
                'nilai' => 'Jl. Raya No. 123, Jakarta',
                'tipe_data' => 'string',
                'deskripsi' => 'Alamat lengkap rumah sakit',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'hospital',
                'kunci' => 'hospital.phone',
                'nilai' => '081234567890',
                'tipe_data' => 'string',
                'deskripsi' => 'Nomor telepon rumah sakit',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'hospital',
                'kunci' => 'hospital.email',
                'nilai' => 'info@rs-harapan.com',
                'tipe_data' => 'string',
                'deskripsi' => 'Email rumah sakit',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'hospital',
                'kunci' => 'hospital.website',
                'nilai' => 'https://www.rs-harapan.com',
                'tipe_data' => 'string',
                'deskripsi' => 'Website rumah sakit',
                'is_sensitif' => false,
            ],

            // Aplikasi
            [
                'kategori' => 'app',
                'kunci' => 'app.timezone',
                'nilai' => 'Asia/Jakarta',
                'tipe_data' => 'enum',
                'deskripsi' => 'Timezone sistem',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'app',
                'kunci' => 'app.language',
                'nilai' => 'ID',
                'tipe_data' => 'enum',
                'deskripsi' => 'Bahasa default aplikasi',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'app',
                'kunci' => 'app.date_format',
                'nilai' => 'dd/mm/yyyy',
                'tipe_data' => 'enum',
                'deskripsi' => 'Format tanggal',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'app',
                'kunci' => 'app.currency',
                'nilai' => 'Rp.',
                'tipe_data' => 'enum',
                'deskripsi' => 'Simbol mata uang',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'app',
                'kunci' => 'app.session_timeout',
                'nilai' => '480',
                'tipe_data' => 'integer',
                'deskripsi' => 'Timeout sesi dalam menit',
                'is_sensitif' => false,
            ],

            // Integrasi (dengan BPJS dan SATUSEHAT)
            [
                'kategori' => 'integration',
                'kunci' => 'integration.bpjs.enabled',
                'nilai' => '1',
                'tipe_data' => 'boolean',
                'deskripsi' => 'Aktifkan integrasi BPJS',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'integration',
                'kunci' => 'integration.satusehat.enabled',
                'nilai' => '0',
                'tipe_data' => 'boolean',
                'deskripsi' => 'Aktifkan integrasi SATUSEHAT',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'integration',
                'kunci' => 'integration.api_rate_limit',
                'nilai' => '100',
                'tipe_data' => 'integer',
                'deskripsi' => 'Batas rate API (requests/menit)',
                'is_sensitif' => false,
            ],

            // Keamanan
            [
                'kategori' => 'security',
                'kunci' => 'security.password_min_length',
                'nilai' => '8',
                'tipe_data' => 'integer',
                'deskripsi' => 'Panjang minimal password',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'security',
                'kunci' => 'security.password_complexity',
                'nilai' => '1',
                'tipe_data' => 'boolean',
                'deskripsi' => 'Kompleksitas password (caps, numbers, symbols)',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'security',
                'kunci' => 'security.login_max_attempts',
                'nilai' => '5',
                'tipe_data' => 'integer',
                'deskripsi' => 'Maksimal percobaan login sebelum lockout',
                'is_sensitif' => false,
            ],

            // Notifikasi (email dan SMS)
            [
                'kategori' => 'notifications',
                'kunci' => 'notification.email.smtp_host',
                'nilai' => null,
                'tipe_data' => 'encrypted',
                'deskripsi' => 'SMTP Host untuk email',
                'is_sensitif' => true,
            ],
            [
                'kategori' => 'notifications',
                'kunci' => 'notification.email.smtp_port',
                'nilai' => '587',
                'tipe_data' => 'integer',
                'deskripsi' => 'SMTP Port',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'notifications',
                'kunci' => 'notification.email.username',
                'nilai' => null,
                'tipe_data' => 'encrypted',
                'deskripsi' => 'SMTP Username',
                'is_sensitif' => true,
            ],
            [
                'kategori' => 'notifications',
                'kunci' => 'notification.email.password',
                'nilai' => null,
                'tipe_data' => 'encrypted',
                'deskripsi' => 'SMTP Password',
                'is_sensitif' => true,
            ],
            [
                'kategori' => 'notifications',
                'kunci' => 'notification.sms.gateway',
                'nilai' => 'twilio',
                'tipe_data' => 'enum',
                'deskripsi' => 'Provider gateway SMS',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'notifications',
                'kunci' => 'notification.sms.api_key',
                'nilai' => null,
                'tipe_data' => 'encrypted',
                'deskripsi' => 'API Key gateway SMS',
                'is_sensitif' => true,
            ],

            // Backup & Maintenance
            [
                'kategori' => 'backup',
                'kunci' => 'backup.auto_schedule',
                'nilai' => '{"enabled": true, "frequency": "daily", "time": "02:00"}',
                'tipe_data' => 'json',
                'deskripsi' => 'Jadwal backup otomatis',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'backup',
                'kunci' => 'system.maintenance_mode',
                'nilai' => '0',
                'tipe_data' => 'boolean',
                'deskripsi' => 'Mode maintenance sistem',
                'is_sensitif' => false,
            ],
            [
                'kategori' => 'system',
                'kunci' => 'system.debug_mode',
                'nilai' => '0',
                'tipe_data' => 'boolean',
                'deskripsi' => 'Mode debug (WARNING: jangan aktifkan di production)',
                'is_sensitif' => false,
            ],
        ];

        foreach ($settings as $setting) {
            PengaturanSistem::create($setting);
        }
    }
}
