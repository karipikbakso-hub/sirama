<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Indonesian\Pasien;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = [
            [
                'nama_lengkap' => 'Ahmad Surya Wijaya',
                'nik' => '3171020101900001',
                'tanggal_lahir' => '1990-01-01',
                'jenis_kelamin' => 'L',
                'telepon' => '081234567890',
                'alamat' => 'Jl. Sudirman No.123',
                'kontak_darurat' => 'Siti Nurhaliza',
                'telepon_darurat' => '081234567891',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000001',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Siti Nurhaliza Putri',
                'nik' => '3172012505800002',
                'tanggal_lahir' => '1980-05-25',
                'jenis_kelamin' => 'P',
                'telepon' => '081234567891',
                'alamat' => 'Jl. Thamrin No.45',
                'kontak_darurat' => 'Ahmad Surya',
                'telepon_darurat' => '081234567890',
                'jenis_asuransi' => 'Umum',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Budi Santoso Rahman',
                'nik' => '3173011503750003',
                'tanggal_lahir' => '1975-03-15',
                'jenis_kelamin' => 'L',
                'telepon' => '081234567892',
                'alamat' => 'Jl. Gatot Subroto No.67',
                'kontak_darurat' => 'Ani Santoso',
                'telepon_darurat' => '081234567893',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000002',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Maya Sari Dewi',
                'nik' => '3174012004850004',
                'tanggal_lahir' => '1985-04-20',
                'jenis_kelamin' => 'P',
                'telepon' => '081234567894',
                'alamat' => 'Jl. Senayan No.89',
                'kontak_darurat' => 'Surya Dewi',
                'telepon_darurat' => '081234567895',
                'jenis_asuransi' => 'Asuransi Swasta',
                'provider_asuransi' => 'Prudential',
                'nomor_asuransi' => 'ASW00001',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Rudi Hartono Kusuma',
                'nik' => '3175101005700005',
                'tanggal_lahir' => '1970-10-10',
                'jenis_kelamin' => 'L',
                'telepon' => '081234567896',
                'alamat' => 'Jl. Casablanca No.156',
                'kontak_darurat' => 'Susi Hartono',
                'telepon_darurat' => '081234567897',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000003',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Amelia Rizki Kartika',
                'nik' => '3176102206950006',
                'tanggal_lahir' => '1995-02-22',
                'jenis_kelamin' => 'P',
                'telepon' => '081234567898',
                'alamat' => 'Jl. Pahlawan No.78',
                'kontak_darurat' => 'Riski Amelia',
                'telepon_darurat' => '081234567899',
                'jenis_asuransi' => 'Umum',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Dedi Setiawan Pratama',
                'nik' => '3177100501800007',
                'tanggal_lahir' => '1980-05-05',
                'jenis_kelamin' => 'L',
                'telepon' => '081234567800',
                'alamat' => 'Jl. Sunter No.234',
                'kontak_darurat' => 'Setia Dedi',
                'telepon_darurat' => '081234567801',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000004',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Linda Rachmawati Sari',
                'nik' => '3178101509900008',
                'tanggal_lahir' => '1990-10-15',
                'jenis_kelamin' => 'P',
                'telepon' => '081234567802',
                'alamat' => 'Jl. Kelapa Gading No.456',
                'kontak_darurat' => 'Rachma Linda',
                'telepon_darurat' => '081234567803',
                'jenis_asuransi' => 'Asuransi Swasta',
                'provider_asuransi' => 'Manulife',
                'nomor_asuransi' => 'ASW00002',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Hendra Gunawan Saputra',
                'nik' => '3179202103950009',
                'tanggal_lahir' => '1995-03-21',
                'jenis_kelamin' => 'L',
                'telepon' => '081234567804',
                'alamat' => 'Jl. Bekasi No.789',
                'kontak_darurat' => 'Gunawan Hendra',
                'telepon_darurat' => '081234567805',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000005',
                'status_aktif' => 'aktif'
            ],
            [
                'nama_lengkap' => 'Fitri Nuraini Putri',
                'nik' => '3173010401100010',
                'tanggal_lahir' => '2010-04-04',
                'jenis_kelamin' => 'P',
                'telepon' => '081234567806',
                'alamat' => 'Jl. Cilandak No.987',
                'kontak_darurat' => 'Nur Ain Fitri',
                'telepon_darurat' => '081234567807',
                'jenis_asuransi' => 'Umum',
                'status_aktif' => 'aktif'
            ]
        ];

        foreach ($patients as $patient) {
            $noRm = 'RM' . date('Y') . str_pad(Pasien::count() + 1, 4, '0', STR_PAD_LEFT);
            $patientData = array_merge($patient, ['no_rm' => $noRm]);
            Pasien::create($patientData);
        }
    }
}
