<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MasterLaboratoriumSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $laboratoryTests = [
            // Hematologi
            [
                'nama_pemeriksaan' => 'Hemoglobin',
                'kode_lab' => 'HB',
                'kategori' => 'Hematologi',
                'satuan' => 'g/dL',
                'nilai_normal' => '12-16',
                'tarif' => 25000,
                'aktif' => true,
                'deskripsi' => 'Kadar hemoglobin dalam darah',
            ],
            [
                'nama_pemeriksaan' => 'Hematokrit',
                'kode_lab' => 'HCT',
                'kategori' => 'Hematologi',
                'satuan' => '%',
                'nilai_normal' => '36-46',
                'tarif' => 20000,
                'aktif' => true,
                'deskripsi' => 'Persentase volume sel darah merah',
            ],
            [
                'nama_pemeriksaan' => 'Leukosit',
                'kode_lab' => 'WBC',
                'kategori' => 'Hematologi',
                'satuan' => '/μL',
                'nilai_normal' => '4000-11000',
                'tarif' => 20000,
                'aktif' => true,
                'deskripsi' => 'Jumlah sel darah putih',
            ],
            [
                'nama_pemeriksaan' => 'Trombosit',
                'kode_lab' => 'PLT',
                'kategori' => 'Hematologi',
                'satuan' => '/μL',
                'nilai_normal' => '150000-450000',
                'tarif' => 25000,
                'aktif' => true,
                'deskripsi' => 'Jumlah trombosit',
            ],
            [
                'nama_pemeriksaan' => 'Eritrosit',
                'kode_lab' => 'RBC',
                'kategori' => 'Hematologi',
                'satuan' => 'x10^6/μL',
                'nilai_normal' => '4.2-5.4',
                'tarif' => 20000,
                'aktif' => true,
                'deskripsi' => 'Jumlah sel darah merah',
            ],

            // Kimia Klinik
            [
                'nama_pemeriksaan' => 'Glukosa Puasa',
                'kode_lab' => 'GLU',
                'kategori' => 'Kimia Klinik',
                'satuan' => 'mg/dL',
                'nilai_normal' => '70-100',
                'tarif' => 30000,
                'aktif' => true,
                'deskripsi' => 'Kadar glukosa darah puasa',
            ],
            [
                'nama_pemeriksaan' => 'Ureum',
                'kode_lab' => 'URE',
                'kategori' => 'Kimia Klinik',
                'satuan' => 'mg/dL',
                'nilai_normal' => '15-45',
                'tarif' => 25000,
                'aktif' => true,
                'deskripsi' => 'Kadar ureum dalam darah',
            ],
            [
                'nama_pemeriksaan' => 'Kreatinin',
                'kode_lab' => 'CRE',
                'kategori' => 'Kimia Klinik',
                'satuan' => 'mg/dL',
                'nilai_normal' => '0.6-1.2',
                'tarif' => 25000,
                'aktif' => true,
                'deskripsi' => 'Kadar kreatinin dalam darah',
            ],
            [
                'nama_pemeriksaan' => 'SGOT',
                'kode_lab' => 'SGOT',
                'kategori' => 'Kimia Klinik',
                'satuan' => 'U/L',
                'nilai_normal' => '5-40',
                'tarif' => 30000,
                'aktif' => true,
                'deskripsi' => 'Enzim SGOT',
            ],
            [
                'nama_pemeriksaan' => 'SGPT',
                'kode_lab' => 'SGPT',
                'kategori' => 'Kimia Klinik',
                'satuan' => 'U/L',
                'nilai_normal' => '7-56',
                'tarif' => 30000,
                'aktif' => true,
                'deskripsi' => 'Enzim SGPT',
            ],
            [
                'nama_pemeriksaan' => 'Kolesterol Total',
                'kode_lab' => 'CHOL',
                'kategori' => 'Kimia Klinik',
                'satuan' => 'mg/dL',
                'nilai_normal' => '< 200',
                'tarif' => 35000,
                'aktif' => true,
                'deskripsi' => 'Kadar kolesterol total',
            ],
            [
                'nama_pemeriksaan' => 'Trigliserida',
                'kode_lab' => 'TG',
                'kategori' => 'Kimia Klinik',
                'satuan' => 'mg/dL',
                'nilai_normal' => '< 150',
                'tarif' => 35000,
                'aktif' => true,
                'deskripsi' => 'Kadar trigliserida',
            ],

            // Urinalisis
            [
                'nama_pemeriksaan' => 'Urinalisis Lengkap',
                'kode_lab' => 'UA',
                'kategori' => 'Urinalisis',
                'satuan' => null,
                'nilai_normal' => 'Normal',
                'tarif' => 40000,
                'aktif' => true,
                'deskripsi' => 'Pemeriksaan urine lengkap',
            ],
            [
                'nama_pemeriksaan' => 'Protein Urine',
                'kode_lab' => 'PROT',
                'kategori' => 'Urinalisis',
                'satuan' => 'mg/dL',
                'nilai_normal' => 'Negatif',
                'tarif' => 20000,
                'aktif' => true,
                'deskripsi' => 'Kadar protein dalam urine',
            ],

            // Mikrobiologi
            [
                'nama_pemeriksaan' => 'Culture Urine',
                'kode_lab' => 'CULT',
                'kategori' => 'Mikrobiologi',
                'satuan' => null,
                'nilai_normal' => 'Negatif',
                'tarif' => 75000,
                'aktif' => true,
                'deskripsi' => 'Budidaya bakteri dari urine',
            ],
            [
                'nama_pemeriksaan' => 'Rapid Test Malaria',
                'kode_lab' => 'RDT',
                'kategori' => 'Mikrobiologi',
                'satuan' => null,
                'nilai_normal' => 'Negatif',
                'tarif' => 50000,
                'aktif' => true,
                'deskripsi' => 'Tes cepat malaria',
            ],

            // Serologi
            [
                'nama_pemeriksaan' => 'HBsAg',
                'kode_lab' => 'HBS',
                'kategori' => 'Serologi',
                'satuan' => null,
                'nilai_normal' => 'Negatif',
                'tarif' => 60000,
                'aktif' => true,
                'deskripsi' => 'Antigen permukaan Hepatitis B',
            ],
            [
                'nama_pemeriksaan' => 'Anti HCV',
                'kode_lab' => 'HCV',
                'kategori' => 'Serologi',
                'satuan' => null,
                'nilai_normal' => 'Negatif',
                'tarif' => 70000,
                'aktif' => true,
                'deskripsi' => 'Antibodi Hepatitis C',
            ],
            [
                'nama_pemeriksaan' => 'VDRL',
                'kode_lab' => 'VDRL',
                'kategori' => 'Serologi',
                'satuan' => null,
                'nilai_normal' => 'Non-Reaktif',
                'tarif' => 50000,
                'aktif' => true,
                'deskripsi' => 'Tes sifilis',
            ],

            // Hormon
            [
                'nama_pemeriksaan' => 'TSH',
                'kode_lab' => 'TSH',
                'kategori' => 'Hormon',
                'satuan' => 'mIU/L',
                'nilai_normal' => '0.27-4.2',
                'tarif' => 80000,
                'aktif' => true,
                'deskripsi' => 'Thyroid Stimulating Hormone',
            ],
            [
                'nama_pemeriksaan' => 'FT4',
                'kode_lab' => 'FT4',
                'kategori' => 'Hormon',
                'satuan' => 'ng/dL',
                'nilai_normal' => '0.93-1.7',
                'tarif' => 75000,
                'aktif' => true,
                'deskripsi' => 'Free T4',
            ],
            [
                'nama_pemeriksaan' => 'T3 Total',
                'kode_lab' => 'T3',
                'kategori' => 'Hormon',
                'satuan' => 'ng/mL',
                'nilai_normal' => '0.8-2.0',
                'tarif' => 70000,
                'aktif' => true,
                'deskripsi' => 'Triiodothyronine total',
            ],
        ];

        foreach ($laboratoryTests as $test) {
            DB::table('m_laboratorium')->updateOrInsert(
                ['kode_lab' => $test['kode_lab']],
                $test
            );
        }

        $this->command->info('Berhasil membuat ' . count($laboratoryTests) . ' data master pemeriksaan laboratorium');
    }
}
