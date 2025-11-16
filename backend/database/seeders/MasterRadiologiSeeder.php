<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MasterRadiologi;

class MasterRadiologiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $radiologyExams = [
            // X-Ray Examinations
            [
                'kode_radio' => 'XRAY001',
                'nama_pemeriksaan' => 'X-Ray Thorax PA',
                'deskripsi' => 'Pemeriksaan X-Ray dada posisi posterior-anterior',
                'kategori' => 'xray',
                'tarif' => 150000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'XRAY002',
                'nama_pemeriksaan' => 'X-Ray Thorax Lateral',
                'deskripsi' => 'Pemeriksaan X-Ray dada posisi lateral',
                'kategori' => 'xray',
                'tarif' => 120000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'XRAY003',
                'nama_pemeriksaan' => 'X-Ray Abdomen',
                'deskripsi' => 'Pemeriksaan X-Ray abdomen',
                'kategori' => 'xray',
                'tarif' => 100000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'XRAY004',
                'nama_pemeriksaan' => 'X-Ray Extremitas Atas',
                'deskripsi' => 'Pemeriksaan X-Ray lengan dan tangan',
                'kategori' => 'xray',
                'tarif' => 80000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'XRAY005',
                'nama_pemeriksaan' => 'X-Ray Extremitas Bawah',
                'deskripsi' => 'Pemeriksaan X-Ray kaki dan tungkai',
                'kategori' => 'xray',
                'tarif' => 90000,
                'aktif' => true,
            ],

            // CT Scan Examinations
            [
                'kode_radio' => 'CT001',
                'nama_pemeriksaan' => 'CT Scan Brain',
                'deskripsi' => 'Pemeriksaan CT Scan otak tanpa kontras',
                'kategori' => 'ct',
                'tarif' => 800000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'CT002',
                'nama_pemeriksaan' => 'CT Scan Brain with Contrast',
                'deskripsi' => 'Pemeriksaan CT Scan otak dengan kontras',
                'kategori' => 'ct',
                'tarif' => 1200000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'CT003',
                'nama_pemeriksaan' => 'CT Scan Abdomen',
                'deskripsi' => 'Pemeriksaan CT Scan abdomen',
                'kategori' => 'ct',
                'tarif' => 900000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'CT004',
                'nama_pemeriksaan' => 'CT Scan Thorax',
                'deskripsi' => 'Pemeriksaan CT Scan dada',
                'kategori' => 'ct',
                'tarif' => 850000,
                'aktif' => true,
            ],

            // MRI Examinations
            [
                'kode_radio' => 'MRI001',
                'nama_pemeriksaan' => 'MRI Brain',
                'deskripsi' => 'Pemeriksaan MRI otak',
                'kategori' => 'mri',
                'tarif' => 1500000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'MRI002',
                'nama_pemeriksaan' => 'MRI Lumbar Spine',
                'deskripsi' => 'Pemeriksaan MRI tulang belakang lumbar',
                'kategori' => 'mri',
                'tarif' => 1200000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'MRI003',
                'nama_pemeriksaan' => 'MRI Cervical Spine',
                'deskripsi' => 'Pemeriksaan MRI tulang belakang servikal',
                'kategori' => 'mri',
                'tarif' => 1200000,
                'aktif' => true,
            ],

            // Ultrasound Examinations
            [
                'kode_radio' => 'USG001',
                'nama_pemeriksaan' => 'USG Abdomen',
                'deskripsi' => 'Pemeriksaan USG abdomen',
                'kategori' => 'ultrasound',
                'tarif' => 200000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'USG002',
                'nama_pemeriksaan' => 'USG Obstetri',
                'deskripsi' => 'Pemeriksaan USG kehamilan',
                'kategori' => 'ultrasound',
                'tarif' => 250000,
                'aktif' => true,
            ],
            [
                'kode_radio' => 'USG003',
                'nama_pemeriksaan' => 'USG Thyroid',
                'deskripsi' => 'Pemeriksaan USG kelenjar tiroid',
                'kategori' => 'ultrasound',
                'tarif' => 150000,
                'aktif' => true,
            ],

            // Mammography
            [
                'kode_radio' => 'MAM001',
                'nama_pemeriksaan' => 'Mammografi Bilateral',
                'deskripsi' => 'Pemeriksaan mammografi kedua payudara',
                'kategori' => 'mammography',
                'tarif' => 300000,
                'aktif' => true,
            ],

            // Dental X-Ray
            [
                'kode_radio' => 'DENT001',
                'nama_pemeriksaan' => 'Panoramic Dental X-Ray',
                'deskripsi' => 'Pemeriksaan X-Ray gigi panoramic',
                'kategori' => 'dental',
                'tarif' => 100000,
                'aktif' => true,
            ],
        ];

        foreach ($radiologyExams as $exam) {
            MasterRadiologi::create($exam);
        }

        $this->command->info('Master radiologi data seeded successfully!');
    }
}
