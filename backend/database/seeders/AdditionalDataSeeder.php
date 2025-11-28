<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdditionalDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->seedSurveyResults();
        $this->seedBackupSchedules();
        $this->seedAuditLogs();
        $this->seedMedicineStock();
        $this->seedQueueData();
    }

    private function seedSurveyResults(): void
    {
        $surveys = [
            [
                'nama_responden' => 'Ahmad Rahman',
                'jenis_kelamin' => 'L',
                'umur' => 40,
                'pendidikan' => 'S1',
                'pekerjaan' => 'Pegawai Swasta',
                'jenis_layanan' => 'Rawat Jalan',
                'tanggal_kunjungan' => Carbon::now()->subDays(5),
                'keseluruhan_kepuasan' => 4,
                'kualitas_pelayanan_dokter' => 5,
                'kualitas_pelayanan_perawat' => 4,
                'kualitas_pelayanan_administrasi' => 4,
                'fasilitas_kamar_tunggu' => 3,
                'fasilitas_toilet' => 4,
                'fasilitas_parkir' => 3,
                'waktu_tunggu_pendaftaran' => 4,
                'waktu_tunggu_pemeriksaan' => 4,
                'waktu_tunggu_pembayaran' => 3,
                'kemudahan_mendapatkan_informasi' => 4,
                'keramahan_petugas' => 5,
                'kebersihan_rumah_sakit' => 4,
                'harga_layanan' => 4,
                'saran' => 'Perbaiki fasilitas parkir',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
            [
                'nama_responden' => 'Sari Dewi',
                'jenis_kelamin' => 'P',
                'umur' => 35,
                'pendidikan' => 'SMA',
                'pekerjaan' => 'Guru',
                'jenis_layanan' => 'Rawat Jalan',
                'tanggal_kunjungan' => Carbon::now()->subDays(3),
                'keseluruhan_kepuasan' => 5,
                'kualitas_pelayanan_dokter' => 5,
                'kualitas_pelayanan_perawat' => 5,
                'kualitas_pelayanan_administrasi' => 4,
                'fasilitas_kamar_tunggu' => 4,
                'fasilitas_toilet' => 4,
                'fasilitas_parkir' => 4,
                'waktu_tunggu_pendaftaran' => 5,
                'waktu_tunggu_pemeriksaan' => 4,
                'waktu_tunggu_pembayaran' => 4,
                'kemudahan_mendapatkan_informasi' => 5,
                'keramahan_petugas' => 5,
                'kebersihan_rumah_sakit' => 5,
                'harga_layanan' => 4,
                'saran' => 'Terus pertahankan pelayanan yang baik',
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'nama_responden' => 'Budi Santoso',
                'jenis_kelamin' => 'L',
                'umur' => 47,
                'pendidikan' => 'S1',
                'pekerjaan' => 'Wiraswasta',
                'jenis_layanan' => 'Rawat Jalan',
                'tanggal_kunjungan' => Carbon::now()->subDays(1),
                'keseluruhan_kepuasan' => 3,
                'kualitas_pelayanan_dokter' => 4,
                'kualitas_pelayanan_perawat' => 3,
                'kualitas_pelayanan_administrasi' => 2,
                'fasilitas_kamar_tunggu' => 3,
                'fasilitas_toilet' => 3,
                'fasilitas_parkir' => 2,
                'waktu_tunggu_pendaftaran' => 2,
                'waktu_tunggu_pemeriksaan' => 3,
                'waktu_tunggu_pembayaran' => 2,
                'kemudahan_mendapatkan_informasi' => 3,
                'keramahan_petugas' => 4,
                'kebersihan_rumah_sakit' => 3,
                'harga_layanan' => 3,
                'saran' => 'Perbaiki sistem antrian dan percepat pelayanan administrasi',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ];

        foreach ($surveys as $survey) {
            DB::table('t_hasil_survey')->insert($survey);
        }
    }

    private function seedBackupSchedules(): void
    {
        $backups = [
            [
                'nama_jadwal' => 'Backup Database Harian',
                'tipe_backup' => 'database',
                'frekuensi' => 'daily',
                'waktu_eksekusi' => '02:00',
                'hari_dalam_minggu' => null,
                'hari_dalam_bulan' => null,
                'retensi_hari' => 30,
                'status' => 'aktif',
                'path_tujuan' => '/backups/database/',
                'terakhir_eksekusi' => Carbon::now()->subDays(1),
                'status_terakhir' => 'berhasil',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_jadwal' => 'Backup File Mingguan',
                'tipe_backup' => 'files',
                'frekuensi' => 'weekly',
                'waktu_eksekusi' => '03:00',
                'hari_dalam_minggu' => 'sunday',
                'hari_dalam_bulan' => null,
                'retensi_hari' => 90,
                'status' => 'aktif',
                'path_tujuan' => '/backups/files/',
                'terakhir_eksekusi' => Carbon::now()->subDays(7),
                'status_terakhir' => 'berhasil',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($backups as $backup) {
            DB::table('t_jadwal_backup')->insert($backup);
        }

        // Add backup history
        $histories = [
            [
                'jadwal_backup_id' => 1,
                'nama_file' => 'backup_db_2025_11_24.sql',
                'ukuran_file' => 52428800, // 50MB
                'waktu_mulai' => Carbon::now()->subDays(1)->setTime(2, 0),
                'waktu_selesai' => Carbon::now()->subDays(1)->setTime(2, 15),
                'status' => 'berhasil',
                'path_file' => '/backups/database/backup_db_2025_11_24.sql',
                'catatan' => 'Backup database berhasil',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'jadwal_backup_id' => 2,
                'nama_file' => 'backup_files_2025_11_18.zip',
                'ukuran_file' => 1073741824, // 1GB
                'waktu_mulai' => Carbon::now()->subDays(7)->setTime(3, 0),
                'waktu_selesai' => Carbon::now()->subDays(7)->setTime(3, 45),
                'status' => 'berhasil',
                'path_file' => '/backups/files/backup_files_2025_11_18.zip',
                'catatan' => 'Backup file berhasil',
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
            ],
        ];

        foreach ($histories as $history) {
            DB::table('t_riwayat_backup')->insert($history);
        }
    }

    private function seedAuditLogs(): void
    {
        $logs = [
            [
                'user_id' => 1,
                'action' => 'login',
                'model_type' => 'App\\Models\\User',
                'model_id' => 1,
                'old_values' => null,
                'new_values' => null,
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(2),
            ],
            [
                'user_id' => 2,
                'action' => 'create',
                'model_type' => 'App\\Models\\Patient',
                'model_id' => 1,
                'old_values' => null,
                'new_values' => json_encode(['nama_pasien' => 'Ahmad Rahman', 'no_rm' => 'RM001']),
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(1),
            ],
            [
                'user_id' => 3,
                'action' => 'update',
                'model_type' => 'App\\Models\\Registration',
                'model_id' => 1,
                'old_values' => json_encode(['status' => 'menunggu']),
                'new_values' => json_encode(['status' => 'selesai']),
                'ip_address' => '192.168.1.102',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => now(),
            ],
        ];

        foreach ($logs as $log) {
            DB::table('audit_logs')->insert($log);
        }
    }

    private function seedMedicineStock(): void
    {
        // Add medicine batches
        $batches = [
            [
                'medicine_id' => 1, // Paracetamol
                'batch_number' => 'PAR001202511',
                'expiry_date' => Carbon::now()->addYears(2),
                'quantity' => 100,
                'unit_cost' => 2000,
                'supplier' => 'PT. Kimia Farma',
                'received_date' => Carbon::now()->subDays(30),
                'status' => 'active',
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(30),
            ],
            [
                'medicine_id' => 2, // Amoxicillin
                'batch_number' => 'AMX001202511',
                'expiry_date' => Carbon::now()->addYears(1),
                'quantity' => 50,
                'unit_cost' => 12000,
                'supplier' => 'PT. Indofarma',
                'received_date' => Carbon::now()->subDays(20),
                'status' => 'active',
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()->subDays(20),
            ],
        ];

        foreach ($batches as $batch) {
            DB::table('medicine_batches')->insert($batch);
        }

        // Add stock movements
        $movements = [
            [
                'medicine_batch_id' => 1,
                'movement_type' => 'in',
                'quantity' => 100,
                'reference_type' => 'purchase',
                'reference_id' => 1,
                'reason' => 'Pembelian rutin',
                'performed_by' => 4, // Apoteker
                'created_at' => Carbon::now()->subDays(30),
            ],
            [
                'medicine_batch_id' => 1,
                'movement_type' => 'out',
                'quantity' => 10,
                'reference_type' => 'prescription',
                'reference_id' => 1,
                'reason' => 'Dispensing resep',
                'performed_by' => 4,
                'created_at' => Carbon::now()->subDays(2),
            ],
        ];

        foreach ($movements as $movement) {
            DB::table('stock_movements')->insert($movement);
        }
    }

    private function seedQueueData(): void
    {
        // Add queue priorities
        $priorities = [
            [
                'name' => 'Normal',
                'description' => 'Pasien umum',
                'priority_level' => 1,
                'estimated_wait_time' => 30,
                'color_code' => '#10B981',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Urgent',
                'description' => 'Pasien prioritas tinggi',
                'priority_level' => 2,
                'estimated_wait_time' => 10,
                'color_code' => '#F59E0B',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Emergency',
                'description' => 'Pasien darurat',
                'priority_level' => 3,
                'estimated_wait_time' => 5,
                'color_code' => '#EF4444',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($priorities as $priority) {
            DB::table('queue_priorities')->insert($priority);
        }

        // Add service counters
        $counters = [
            [
                'name' => 'Loket 1',
                'service_type' => 'registration',
                'is_active' => true,
                'current_queue_number' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Loket 2',
                'service_type' => 'registration',
                'is_active' => true,
                'current_queue_number' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($counters as $counter) {
            DB::table('service_counters')->insert($counter);
        }

        // Add queue announcements
        $announcements = [
            [
                'title' => 'Pemberitahuan Sistem Antrian',
                'message' => 'Mohon kesediaan pasien untuk mempersiapkan kartu identitas dan BPJS saat pendaftaran',
                'priority' => 'normal',
                'is_active' => true,
                'start_date' => now(),
                'end_date' => Carbon::now()->addDays(30),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($announcements as $announcement) {
            DB::table('queue_announcements')->insert($announcement);
        }
    }
}