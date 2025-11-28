<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Indonesian\Pasien;

class PasienSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Base patient data without foreign key constraints for testing
        $basePatientData = [
            'status_aktif' => 'aktif'
        ];

        $patients = [
            [
                'nama_lengkap' => 'Ahmad Surya Wijaya',
                'nik' => '3171020101900001',
                'tanggal_lahir' => '1990-01-01',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Sudirman No.123',
                'telepon' => '081234567890',
                'kontak_darurat' => 'Siti Nurhaliza',
                'telepon_darurat' => '081234567891',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000001',
            ],
            [
                'nama_lengkap' => 'Siti Nurhaliza Putri',
                'nik' => '3172012505800002',
                'tanggal_lahir' => '1980-05-25',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Thamrin No.45',
                'telepon' => '081234567891',
                'kontak_darurat' => 'Ahmad Surya',
                'telepon_darurat' => '081234567890',
                'jenis_asuransi' => 'Umum',
            ],
            [
                'nama_lengkap' => 'Budi Santoso Rahman',
                'nik' => '3173011503750003',
                'tanggal_lahir' => '1975-03-15',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Gatot Subroto No.67',
                'telepon' => '081234567892',
                'kontak_darurat' => 'Ani Santoso',
                'telepon_darurat' => '081234567893',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000002',
            ],
            [
                'nama_lengkap' => 'Maya Sari Dewi',
                'nik' => '3174012004850004',
                'tanggal_lahir' => '1985-04-20',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Senayan No.89',
                'telepon' => '081234567894',
                'kontak_darurat' => 'Surya Dewi',
                'telepon_darurat' => '081234567895',
                'jenis_asuransi' => 'Asuransi Swasta',
                'provider_asuransi' => 'Prudential',
                'nomor_asuransi' => 'ASW00001',
            ],
            [
                'nama_lengkap' => 'Rudi Hartono Kusuma',
                'nik' => '3175101005700005',
                'tanggal_lahir' => '1970-10-10',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Casablanca No.156',
                'telepon' => '081234567896',
                'kontak_darurat' => 'Susi Hartono',
                'telepon_darurat' => '081234567897',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000003',
            ],
            [
                'nama_lengkap' => 'Amelia Rizki Kartika',
                'nik' => '3176102206950006',
                'tanggal_lahir' => '1995-02-22',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Pahlawan No.78',
                'telepon' => '081234567898',
                'kontak_darurat' => 'Riski Amelia',
                'telepon_darurat' => '081234567899',
                'jenis_asuransi' => 'Umum',
            ],
            [
                'nama_lengkap' => 'Dedi Setiawan Pratama',
                'nik' => '3177100501800007',
                'tanggal_lahir' => '1980-05-05',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Sunter No.234',
                'telepon' => '081234567800',
                'kontak_darurat' => 'Setia Dedi',
                'telepon_darurat' => '081234567801',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000004',
            ],
            [
                'nama_lengkap' => 'Linda Rachmawati Sari',
                'nik' => '3178101509900008',
                'tanggal_lahir' => '1990-10-15',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Kelapa Gading No.456',
                'telepon' => '081234567802',
                'kontak_darurat' => 'Rachma Linda',
                'telepon_darurat' => '081234567803',
                'jenis_asuransi' => 'Asuransi Swasta',
                'provider_asuransi' => 'Manulife',
                'nomor_asuransi' => 'ASW00002',
            ],
            [
                'nama_lengkap' => 'Hendra Gunawan Saputra',
                'nik' => '3179202103950009',
                'tanggal_lahir' => '1995-03-21',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Bekasi No.789',
                'telepon' => '081234567804',
                'kontak_darurat' => 'Gunawan Hendra',
                'telepon_darurat' => '081234567805',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000005',
            ],
            [
                'nama_lengkap' => 'Fitri Nuraini Putri',
                'nik' => '3173010401100010',
                'tanggal_lahir' => '2010-04-04',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Cilandak No.987',
                'telepon' => '081234567806',
                'kontak_darurat' => 'Nur Ain Fitri',
                'telepon_darurat' => '081234567807',
                'jenis_asuransi' => 'Umum',
            ],
            [
                'nama_lengkap' => 'Agus Salim Rahman',
                'nik' => '3174011508650011',
                'tanggal_lahir' => '1965-08-15',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Permata No.654',
                'telepon' => '081234567808',
                'kontak_darurat' => 'Salim Agus',
                'telepon_darurat' => '081234567809',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000006',
            ],
            [
                'nama_lengkap' => 'Dewi Kusuma Wardani',
                'nik' => '3175012207750012',
                'tanggal_lahir' => '1975-07-22',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Pluit No.321',
                'telepon' => '081234567810',
                'kontak_darurat' => 'Kusuma Dewi',
                'telepon_darurat' => '081234567811',
                'jenis_asuransi' => 'Asuransi Swasta',
                'provider_asuransi' => 'Allianz',
                'nomor_asuransi' => 'ASW00003',
            ],
            [
                'nama_lengkap' => 'Bayu Prabowo Nugroho',
                'nik' => '3176011701850013',
                'tanggal_lahir' => '1985-01-17',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Palmerah No.147',
                'telepon' => '081234567812',
                'kontak_darurat' => 'Prabowo Bayu',
                'telepon_darurat' => '081234567813',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000007',
            ],
            [
                'nama_lengkap' => 'Rina Handayani Susilo',
                'nik' => '3177010306900014',
                'tanggal_lahir' => '1990-06-03',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Kramat No.258',
                'telepon' => '081234567814',
                'kontak_darurat' => 'Handaya Rina',
                'telepon_darurat' => '081234567815',
                'jenis_asuransi' => 'Umum',
            ],
            [
                'nama_lengkap' => 'Joko Widodo Santoso',
                'nik' => '3178011102700015',
                'tanggal_lahir' => '1970-11-01',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Rawamangun No.369',
                'telepon' => '081234567816',
                'kontak_darurat' => 'Widodo Joko',
                'telepon_darurat' => '081234567817',
                'jenis_asuransi' => 'BPJS',
                'no_bpjs' => '000000000008',
            ]
        ];

        foreach ($patients as $patient) {
            $mrn = Pasien::generateMRN();
            $patientData = array_merge($patient, $basePatientData, ['no_rm' => $mrn]);
            Pasien::create($patientData);
        }
    }
}
