<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComprehensiveMasterDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->seedPoli();
        $this->seedDokter();
        $this->seedObat();
        $this->seedLaboratorium();
        $this->seedRadiologi();
        $this->seedIcd10();
        $this->seedRolesAndPermissions();
        $this->seedPengaturanSistem();
    }

    private function seedPoli(): void
    {
        $polis = [
            [
                'nama_poli' => 'Poli Umum',
                'kode_poli' => 'UMUM',
                'deskripsi' => 'Pelayanan kesehatan umum untuk semua kalangan',
                'jenis_poli' => 'umum',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_poli' => 'Poli Anak',
                'kode_poli' => 'ANAK',
                'deskripsi' => 'Pelayanan kesehatan khusus untuk anak-anak',
                'jenis_poli' => 'spesialis',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_poli' => 'Poli Penyakit Dalam',
                'kode_poli' => 'DALAM',
                'deskripsi' => 'Pelayanan kesehatan untuk penyakit dalam',
                'jenis_poli' => 'spesialis',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_poli' => 'Poli Jantung',
                'kode_poli' => 'JANTUNG',
                'deskripsi' => 'Pelayanan kesehatan jantung dan pembuluh darah',
                'jenis_poli' => 'spesialis',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_poli' => 'Poli Kandungan',
                'kode_poli' => 'KANDUNGAN',
                'deskripsi' => 'Pelayanan kesehatan kandungan dan kebidanan',
                'jenis_poli' => 'spesialis',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_poli' => 'Poli Mata',
                'kode_poli' => 'MATA',
                'deskripsi' => 'Pelayanan kesehatan mata',
                'jenis_poli' => 'spesialis',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_poli' => 'Poli THT',
                'kode_poli' => 'THT',
                'deskripsi' => 'Pelayanan kesehatan telinga, hidung, dan tenggorokan',
                'jenis_poli' => 'spesialis',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_poli' => 'Poli Kulit dan Kelamin',
                'kode_poli' => 'KULIT',
                'deskripsi' => 'Pelayanan kesehatan kulit dan kelamin',
                'jenis_poli' => 'spesialis',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($polis as $poli) {
            DB::table('m_poli')->updateOrInsert(
                ['kode_poli' => $poli['kode_poli']],
                $poli
            );
        }
    }

    private function seedDokter(): void
    {
        $dokters = [
            [
                'nama_dokter' => 'Dr. Ahmad Santoso, Sp.PD',
                'nip' => 'D001',
                'no_sip' => 'SIP001',
                'spesialisasi' => 'Penyakit Dalam',
                'no_str' => 'STR001',
                'telepon' => '081234567890',
                'alamat' => 'Jl. Sudirman No. 1',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_dokter' => 'Dr. Siti Nurhaliza, Sp.A',
                'nip' => 'D002',
                'no_sip' => 'SIP002',
                'spesialisasi' => 'Anak',
                'no_str' => 'STR002',
                'telepon' => '081234567891',
                'alamat' => 'Jl. Thamrin No. 2',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_dokter' => 'Dr. Budi Hartono, Sp.JP',
                'nip' => 'D003',
                'no_sip' => 'SIP003',
                'spesialisasi' => 'Jantung',
                'no_str' => 'STR003',
                'telepon' => '081234567892',
                'alamat' => 'Jl. Gatot Subroto No. 3',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_dokter' => 'Dr. Maya Sari, Sp.OG',
                'nip' => 'D004',
                'no_sip' => 'SIP004',
                'spesialisasi' => 'Kandungan',
                'no_str' => 'STR004',
                'telepon' => '081234567893',
                'alamat' => 'Jl. Sudirman No. 4',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_dokter' => 'Dr. Rudi Setiawan',
                'nip' => 'D005',
                'no_sip' => 'SIP005',
                'spesialisasi' => 'Umum',
                'no_str' => 'STR005',
                'telepon' => '081234567894',
                'alamat' => 'Jl. Thamrin No. 5',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($dokters as $dokter) {
            DB::table('m_dokter')->updateOrInsert(
                ['no_sip' => $dokter['no_sip']],
                $dokter
            );
        }
    }

    private function seedObat(): void
    {
        $obats = [
            [
                'nama_obat' => 'Paracetamol 500mg',
                'kode_obat' => 'PAR001',
                'nama_generik' => 'Paracetamol',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '500mg',
                'satuan' => 'Tablet',
                'golongan_obat' => 'bebas',
                'harga_jual' => 2500,
                'stok_minimum' => 50,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_obat' => 'Amoxicillin 500mg',
                'kode_obat' => 'AMX001',
                'nama_generik' => 'Amoxicillin',
                'bentuk_sediaan' => 'Kapsul',
                'kekuatan' => '500mg',
                'satuan' => 'Kapsul',
                'golongan_obat' => 'keras',
                'harga_jual' => 15000,
                'stok_minimum' => 30,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_obat' => 'Ibuprofen 400mg',
                'kode_obat' => 'IBU001',
                'nama_generik' => 'Ibuprofen',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '400mg',
                'satuan' => 'Tablet',
                'golongan_obat' => 'bebas_terbatas',
                'harga_jual' => 3500,
                'stok_minimum' => 40,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_obat' => 'Omeprazole 20mg',
                'kode_obat' => 'OME001',
                'nama_generik' => 'Omeprazole',
                'bentuk_sediaan' => 'Kapsul',
                'kekuatan' => '20mg',
                'satuan' => 'Kapsul',
                'golongan_obat' => 'keras',
                'harga_jual' => 12000,
                'stok_minimum' => 25,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_obat' => 'Vitamin C 500mg',
                'kode_obat' => 'VIT001',
                'nama_generik' => 'Ascorbic Acid',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '500mg',
                'satuan' => 'Tablet',
                'golongan_obat' => 'bebas',
                'harga_jual' => 8000,
                'stok_minimum' => 60,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_obat' => 'Cetirizine 10mg',
                'kode_obat' => 'CET001',
                'nama_generik' => 'Cetirizine',
                'bentuk_sediaan' => 'Tablet',
                'kekuatan' => '10mg',
                'satuan' => 'Tablet',
                'golongan_obat' => 'bebas',
                'harga_jual' => 4500,
                'stok_minimum' => 35,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_obat' => 'Salbutamol Inhaler',
                'kode_obat' => 'SAL001',
                'nama_generik' => 'Salbutamol',
                'bentuk_sediaan' => 'Inhaler',
                'kekuatan' => '100mcg/dosis',
                'satuan' => 'Unit',
                'golongan_obat' => 'keras',
                'harga_jual' => 85000,
                'stok_minimum' => 10,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_obat' => 'Insulin Regular',
                'kode_obat' => 'INS001',
                'nama_generik' => 'Insulin Human',
                'bentuk_sediaan' => 'Injeksi',
                'kekuatan' => '100IU/mL',
                'satuan' => 'Vial',
                'golongan_obat' => 'keras',
                'harga_jual' => 125000,
                'stok_minimum' => 5,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($obats as $obat) {
            DB::table('m_obat')->updateOrInsert(
                ['kode_obat' => $obat['kode_obat']],
                $obat
            );
        }
    }

    private function seedLaboratorium(): void
    {
        $labItems = [
            [
                'nama_pemeriksaan' => 'Hemoglobin (Hb)',
                'kode_lab' => 'LAB001',
                'kode_pemeriksaan' => 'LAB001',
                'kategori' => 'Hematologi',
                'harga' => 45000,
                'nilai_normal' => '12-16 g/dL (Pria), 11-15 g/dL (Wanita)',
                'satuan' => 'g/dL',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_pemeriksaan' => 'Glukosa Darah Puasa',
                'kode_lab' => 'LAB002',
                'kode_pemeriksaan' => 'LAB002',
                'kategori' => 'Kimia Klinik',
                'harga' => 35000,
                'nilai_normal' => '70-100 mg/dL',
                'satuan' => 'mg/dL',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_pemeriksaan' => 'Kolesterol Total',
                'kode_lab' => 'LAB003',
                'kode_pemeriksaan' => 'LAB003',
                'kategori' => 'Kimia Klinik',
                'harga' => 55000,
                'nilai_normal' => '< 200 mg/dL',
                'satuan' => 'mg/dL',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_pemeriksaan' => 'Urinalisis Lengkap',
                'kode_lab' => 'LAB004',
                'kode_pemeriksaan' => 'LAB004',
                'kategori' => 'Urinalisis',
                'harga' => 75000,
                'nilai_normal' => 'Normal',
                'satuan' => '-',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_pemeriksaan' => 'Tes Kehamilan',
                'kode_lab' => 'LAB005',
                'kode_pemeriksaan' => 'LAB005',
                'kategori' => 'Endokrinologi',
                'harga' => 25000,
                'nilai_normal' => 'Negatif',
                'satuan' => '-',
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($labItems as $item) {
            DB::table('m_laboratorium')->updateOrInsert(
                ['kode_lab' => $item['kode_lab']],
                $item
            );
        }
    }

    private function seedRadiologi(): void
    {
        $radItems = [
            [
                'nama_pemeriksaan' => 'Foto Thorax PA',
                'kode_radio' => 'RAD001',
                'kategori' => 'Thorax',
                'tarif' => 125000,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_pemeriksaan' => 'USG Abdomen',
                'kode_radio' => 'RAD002',
                'kategori' => 'Ultrasonografi',
                'tarif' => 200000,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_pemeriksaan' => 'CT Scan Kepala',
                'kode_radio' => 'RAD003',
                'kategori' => 'CT Scan',
                'tarif' => 750000,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_pemeriksaan' => 'MRI Lutut',
                'kode_radio' => 'RAD004',
                'kategori' => 'MRI',
                'tarif' => 850000,
                'aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($radItems as $item) {
            DB::table('m_radiologi')->updateOrInsert(
                ['kode_radio' => $item['kode_radio']],
                $item
            );
        }
    }

    private function seedIcd10(): void
    {
        $diagnoses = [
            [
                'kode_icd' => 'J00',
                'nama_diagnosis' => 'Common cold',
                'kategori' => 'Respiratory infections',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_icd' => 'J01',
                'nama_diagnosis' => 'Acute sinusitis',
                'kategori' => 'Respiratory infections',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_icd' => 'I10',
                'nama_diagnosis' => 'Essential hypertension',
                'kategori' => 'Hypertensive diseases',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_icd' => 'E11',
                'nama_diagnosis' => 'Type 2 diabetes mellitus',
                'kategori' => 'Diabetes mellitus',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_icd' => 'M54.5',
                'nama_diagnosis' => 'Low back pain',
                'kategori' => 'Dorsopathies',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_icd' => 'K29',
                'nama_diagnosis' => 'Gastritis',
                'kategori' => 'Diseases of esophagus, stomach and duodenum',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($diagnoses as $diagnosis) {
            DB::table('m_icd10')->updateOrInsert(
                ['kode_icd' => $diagnosis['kode_icd']],
                $diagnosis
            );
        }
    }

    private function seedRolesAndPermissions(): void
    {
        $roles = [
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'pendaftaran', 'guard_name' => 'web'],
            ['name' => 'dokter', 'guard_name' => 'web'],
            ['name' => 'perawat', 'guard_name' => 'web'],
            ['name' => 'apoteker', 'guard_name' => 'web'],
            ['name' => 'kasir', 'guard_name' => 'web'],
            ['name' => 'laboratorium', 'guard_name' => 'web'],
            ['name' => 'radiologi', 'guard_name' => 'web'],
            ['name' => 'manajemen_rs', 'guard_name' => 'web'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['name' => $role['name'], 'guard_name' => $role['guard_name']],
                $role
            );
        }

        $permissions = [
            // User management
            ['name' => 'view users', 'guard_name' => 'web'],
            ['name' => 'create users', 'guard_name' => 'web'],
            ['name' => 'edit users', 'guard_name' => 'web'],
            ['name' => 'delete users', 'guard_name' => 'web'],

            // Patient management
            ['name' => 'view patients', 'guard_name' => 'web'],
            ['name' => 'create patients', 'guard_name' => 'web'],
            ['name' => 'edit patients', 'guard_name' => 'web'],

            // Registration management
            ['name' => 'view registrations', 'guard_name' => 'web'],
            ['name' => 'create registrations', 'guard_name' => 'web'],
            ['name' => 'edit registrations', 'guard_name' => 'web'],

            // Medical records
            ['name' => 'view medical records', 'guard_name' => 'web'],
            ['name' => 'create medical records', 'guard_name' => 'web'],
            ['name' => 'edit medical records', 'guard_name' => 'web'],

            // Pharmacy
            ['name' => 'view prescriptions', 'guard_name' => 'web'],
            ['name' => 'create prescriptions', 'guard_name' => 'web'],
            ['name' => 'dispense medicines', 'guard_name' => 'web'],

            // Billing
            ['name' => 'view billing', 'guard_name' => 'web'],
            ['name' => 'create billing', 'guard_name' => 'web'],
            ['name' => 'process payments', 'guard_name' => 'web'],

            // Reports
            ['name' => 'view reports', 'guard_name' => 'web'],
            ['name' => 'generate reports', 'guard_name' => 'web'],

            // System settings
            ['name' => 'manage settings', 'guard_name' => 'web'],
            ['name' => 'manage backups', 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $permission['name'], 'guard_name' => $permission['guard_name']],
                $permission
            );
        }
    }

    private function seedPengaturanSistem(): void
    {
        $settings = [
            [
                'kunci' => 'nama_rumah_sakit',
                'nilai' => 'Rumah Sakit Sirama',
                'tipe_data' => 'string',
                'kategori' => 'umum',
                'deskripsi' => 'Nama resmi rumah sakit',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kunci' => 'alamat_rumah_sakit',
                'nilai' => 'Jl. Kesehatan No. 123, Jakarta Pusat',
                'tipe_data' => 'string',
                'kategori' => 'umum',
                'deskripsi' => 'Alamat lengkap rumah sakit',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kunci' => 'telepon_rumah_sakit',
                'nilai' => '(021) 12345678',
                'tipe_data' => 'string',
                'kategori' => 'umum',
                'deskripsi' => 'Nomor telepon rumah sakit',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kunci' => 'email_rumah_sakit',
                'nilai' => 'info@sirama.com',
                'tipe_data' => 'string',
                'kategori' => 'umum',
                'deskripsi' => 'Email resmi rumah sakit',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kunci' => 'maksimal_antrian_per_hari',
                'nilai' => '100',
                'tipe_data' => 'integer',
                'kategori' => 'antrian',
                'deskripsi' => 'Maksimal antrian per hari per poli',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kunci' => 'waktu_praktek_mulai',
                'nilai' => '08:00',
                'tipe_data' => 'string',
                'kategori' => 'jadwal',
                'deskripsi' => 'Waktu mulai praktek dokter',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kunci' => 'waktu_praktek_selesai',
                'nilai' => '16:00',
                'tipe_data' => 'string',
                'kategori' => 'jadwal',
                'deskripsi' => 'Waktu selesai praktek dokter',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('pengaturan_sistem')->updateOrInsert(
                ['kunci' => $setting['kunci']],
                $setting
            );
        }
    }
}