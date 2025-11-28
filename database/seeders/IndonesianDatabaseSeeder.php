<?php

namespace Database\Seeders;

use App\Models\Indonesian\Pasien;
use App\Models\Indonesian\Dokter;
use App\Models\Indonesian\Obat;
use App\Models\Indonesian\Ruangan;
use App\Models\Indonesian\DiagnosisICD10;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IndonesianDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Memulai seeding database Indonesia...');

        // 1. Seed Master Data - Pasien
        $this->command->info('👥 Seeding data pasien...');
        $patients = [
            [
                'nomor_rm' => Pasien::generateMRN(),
                'nama_lengkap' => 'Ahmad Surya',
                'nik' => '3171234567890001',
                'tanggal_lahir' => '1990-05-15',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'nomor_telepon' => '081234567890',
                'nomor_bpjs' => '0001234567890',
                'kontak_darurat' => '081234567891',
                'golongan_darah' => 'O+',
                'status' => 'aktif'
            ],
            [
                'nomor_rm' => Pasien::generateMRN(),
                'nama_lengkap' => 'Siti Aminah',
                'nik' => '3171234567890002',
                'tanggal_lahir' => '1985-08-20',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Thamrin No. 456, Jakarta Pusat',
                'nomor_telepon' => '081234567892',
                'nomor_bpjs' => '0001234567891',
                'kontak_darurat' => '081234567893',
                'golongan_darah' => 'A+',
                'status' => 'aktif'
            ],
            [
                'nomor_rm' => Pasien::generateMRN(),
                'nama_lengkap' => 'Budi Santoso',
                'nik' => '3171234567890003',
                'tanggal_lahir' => '1978-12-10',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Gatot Subroto No. 789, Jakarta Selatan',
                'nomor_telepon' => '081234567894',
                'nomor_bpjs' => '0001234567892',
                'kontak_darurat' => '081234567895',
                'golongan_darah' => 'B+',
                'status' => 'aktif'
            ]
        ];

        foreach ($patients as $patient) {
            DB::table('m_pasien')->insert(array_merge($patient, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 2. Seed Master Data - Dokter
        $this->command->info('👨‍⚕️ Seeding data dokter...');
        $doctors = [
            [
                'nama_lengkap' => 'Dr. Hendra Wijaya, Sp.PD',
                'spesialisasi' => 'Penyakit Dalam',
                'nomor_str' => 'STR1234567890123',
                'nomor_telepon' => '081234567896',
                'email' => 'hendra.wijaya@rs-sirama.com',
                'jadwal_praktik' => json_encode([
                    ['day' => 'monday', 'start_time' => '08:00', 'end_time' => '14:00'],
                    ['day' => 'wednesday', 'start_time' => '08:00', 'end_time' => '14:00'],
                    ['day' => 'friday', 'start_time' => '08:00', 'end_time' => '14:00']
                ]),
                'status' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Dr. Maya Sari, Sp.OG',
                'spesialisasi' => 'Obstetri & Ginekologi',
                'nomor_str' => 'STR1234567890124',
                'nomor_telepon' => '081234567897',
                'email' => 'maya.sari@rs-sirama.com',
                'jadwal_praktik' => json_encode([
                    ['day' => 'tuesday', 'start_time' => '09:00', 'end_time' => '15:00'],
                    ['day' => 'thursday', 'start_time' => '09:00', 'end_time' => '15:00'],
                    ['day' => 'saturday', 'start_time' => '09:00', 'end_time' => '12:00']
                ]),
                'status' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Dr. Rudi Hartono, Sp.A',
                'spesialisasi' => 'Anak',
                'nomor_str' => 'STR1234567890125',
                'nomor_telepon' => '081234567898',
                'email' => 'rudi.hartono@rs-sirama.com',
                'jadwal_praktik' => json_encode([
                    ['day' => 'monday', 'start_time' => '14:00', 'end_time' => '20:00'],
                    ['day' => 'tuesday', 'start_time' => '14:00', 'end_time' => '20:00'],
                    ['day' => 'wednesday', 'start_time' => '14:00', 'end_time' => '20:00']
                ]),
                'status' => 'aktif'
            ]
        ];

        foreach ($doctors as $doctor) {
            DB::table('m_dokter')->insert(array_merge($doctor, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 3. Seed Master Data - Obat
        $this->command->info('💊 Seeding data obat...');
        $medicines = [
            [
                'nama_obat' => 'Paracetamol',
                'nama_generik' => 'Paracetamol',
                'kode_obat' => 'OBT001',
                'indikasi' => 'Penurun demam dan pereda nyeri ringan',
                'kontraindikasi' => 'Hipersensitivitas terhadap paracetamol',
                'efek_samping' => 'Mual, muntah, ruam kulit',
                'dosis' => '500mg',
                'bentuk_obat' => 'Tablet',
                'satuan' => 'tablet',
                'stok_minimum' => 50,
                'stok_maksimum' => 500,
                'harga_jual' => 2500.00,
                'harga_beli' => 2000.00,
                'tanggal_kadaluarsa' => '2026-12-31',
                'status' => 'aktif'
            ],
            [
                'nama_obat' => 'Amoxicillin',
                'nama_generik' => 'Amoxicillin Trihydrate',
                'kode_obat' => 'OBT002',
                'indikasi' => 'Infeksi bakteri ringan sampai sedang',
                'kontraindikasi' => 'Alergi penisilin',
                'efek_samping' => 'Diare, mual, ruam kulit',
                'dosis' => '500mg',
                'bentuk_obat' => 'Kapsul',
                'satuan' => 'kapsul',
                'stok_minimum' => 30,
                'stok_maksimum' => 300,
                'harga_jual' => 1500.00,
                'harga_beli' => 1200.00,
                'tanggal_kadaluarsa' => '2026-08-15',
                'status' => 'aktif'
            ],
            [
                'nama_obat' => 'Omeprazole',
                'nama_generik' => 'Omeprazole',
                'kode_obat' => 'OBT003',
                'indikasi' => 'Maag, GERD, tukak lambung',
                'kontraindikasi' => 'Hipersensitivitas terhadap PPI',
                'efek_samping' => 'Sakit kepala, diare, konstipasi',
                'dosis' => '20mg',
                'bentuk_obat' => 'Kapsul',
                'satuan' => 'kapsul',
                'stok_minimum' => 20,
                'stok_maksimum' => 200,
                'harga_jual' => 5000.00,
                'harga_beli' => 4000.00,
                'tanggal_kadaluarsa' => '2026-06-30',
                'status' => 'aktif'
            ]
        ];

        foreach ($medicines as $medicine) {
            DB::table('m_obat')->insert(array_merge($medicine, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 4. Seed Master Data - Ruangan
        $this->command->info('🏥 Seeding data ruangan...');
        $rooms = [
            [
                'nama_ruangan' => 'Poli Umum A',
                'kode_ruangan' => 'POL001',
                'jenis_ruangan' => 'Poliklinik',
                'kapasitas' => 1,
                'status' => 'aktif',
                'fasilitas' => json_encode(['Meja pemeriksaan', 'Stetoskop', 'Termometer', 'Timbangan'])
            ],
            [
                'nama_ruangan' => 'Ruang Rawat Inap 101',
                'kode_ruangan' => 'RRI101',
                'jenis_ruangan' => 'Rawat Inap',
                'kapasitas' => 1,
                'status' => 'aktif',
                'fasilitas' => json_encode(['Tempat tidur', 'Lemari', 'Kamar mandi', 'TV', 'AC'])
            ],
            [
                'nama_ruangan' => 'IGD Utama',
                'kode_ruangan' => 'IGD001',
                'jenis_ruangan' => 'IGD',
                'kapasitas' => 10,
                'status' => 'aktif',
                'fasilitas' => json_encode(['Brankar', 'Defibrilator', 'Ventilator', 'Monitor vital'])
            ]
        ];

        foreach ($rooms as $room) {
            DB::table('m_ruangan')->insert(array_merge($room, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 5. Seed Master Data - Diagnosis ICD-10
        $this->command->info('📋 Seeding diagnosis ICD-10...');
        $diagnoses = [
            [
                'kode_icd10' => 'J00',
                'nama_diagnosis' => 'Rinitis akut (common cold)',
                'deskripsi' => 'Infeksi virus pada saluran pernapasan atas',
                'kategori' => 'Penyakit Sistem Pernapasan',
                'status' => 'aktif'
            ],
            [
                'kode_icd10' => 'J01',
                'nama_diagnosis' => 'Sinusitis akut',
                'deskripsi' => 'Peradangan pada sinus paranasal',
                'kategori' => 'Penyakit Sistem Pernapasan',
                'status' => 'aktif'
            ],
            [
                'kode_icd10' => 'K29',
                'nama_diagnosis' => 'Gastritis',
                'deskripsi' => 'Peradangan pada mukosa lambung',
                'kategori' => 'Penyakit Sistem Pencernaan',
                'status' => 'aktif'
            ]
        ];

        foreach ($diagnoses as $diagnosis) {
            DB::table('m_diagnosis_icd10')->insert(array_merge($diagnosis, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 6. Seed Sample Registrasi
        $this->command->info('📝 Seeding sample registrasi...');
        $registrations = [
            [
                'nomor_registrasi' => 'REG' . date('Ymd') . '001',
                'pasien_id' => 1,
                'dokter_id' => 1,
                'ruangan_id' => 1,
                'tanggal_registrasi' => now(),
                'jenis_registrasi' => 'rawat_jalan',
                'status_registrasi' => 'selesai',
                'keluhan_utama' => 'Demam dan batuk',
                'riwayat_penyakit' => 'Tidak ada riwayat penyakit kronis',
                'cara_bayar' => 'bpjs',
                'biaya_pendaftaran' => 25000.00
            ],
            [
                'nomor_registrasi' => 'REG' . date('Ymd') . '002',
                'pasien_id' => 2,
                'dokter_id' => 2,
                'ruangan_id' => 1,
                'tanggal_registrasi' => now()->subDays(1),
                'jenis_registrasi' => 'rawat_jalan',
                'status_registrasi' => 'selesai',
                'keluhan_utama' => 'Nyeri perut bagian bawah',
                'riwayat_penyakit' => 'Riwayat menstruasi tidak teratur',
                'cara_bayar' => 'umum',
                'biaya_pendaftaran' => 50000.00
            ]
        ];

        foreach ($registrations as $registration) {
            DB::table('t_registrasi_pasien')->insert(array_merge($registration, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        // 7. Seed Sample Antrian
        $this->command->info('⏰ Seeding sample antrian...');
        $queues = [
            [
                'nomor_antrian' => 'A001',
                'registrasi_id' => 1,
                'dokter_id' => 1,
                'tanggal_antrian' => now()->format('Y-m-d'),
                'urutan' => 1,
                'status' => 'selesai',
                'estimasi_menit' => 30,
                'catatan' => 'Pemeriksaan selesai, diberikan resep paracetamol'
            ],
            [
                'nomor_antrian' => 'A002',
                'registrasi_id' => 2,
                'dokter_id' => 2,
                'tanggal_antrian' => now()->subDays(1)->format('Y-m-d'),
                'urutan' => 1,
                'status' => 'selesai',
                'estimasi_menit' => 45,
                'catatan' => 'USG perut dilakukan, hasil normal'
            ]
        ];

        foreach ($queues as $queue) {
            DB::table('t_antrian')->insert(array_merge($queue, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        $this->command->info('✅ Database Indonesia berhasil di-seed!');
        $this->command->info('📊 Total data yang dibuat:');
        $this->command->info('   👥 Pasien: ' . count($patients));
        $this->command->info('   👨‍⚕️ Dokter: ' . count($doctors));
        $this->command->info('   💊 Obat: ' . count($medicines));
        $this->command->info('   🏥 Ruangan: ' . count($rooms));
        $this->command->info('   📋 Diagnosis: ' . count($diagnoses));
        $this->command->info('   📝 Registrasi: ' . count($registrations));
        $this->command->info('   ⏰ Antrian: ' . count($queues));
    }
}
