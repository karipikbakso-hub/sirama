<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PatientHistory;

class PatientHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $histories = [
            [
                'patient_id' => 1,
                'doctor_id' => 1,
                'visit_date' => '2025-01-15',
                'department' => 'Poli Penyakit Dalam',
                'diagnosis' => 'Hipertensi Grade 1',
                'treatment' => 'Pemberian obat antihipertensi, anjuran diet rendah garam',
                'notes' => 'Pasien responsif terhadap pengobatan, tekanan darah terkendali',
                'status' => 'selesai',
                'vital_signs' => json_encode([
                    'blood_pressure' => '140/90',
                    'heart_rate' => 78,
                    'temperature' => 36.8
                ]),
                'weight' => 75.5,
                'height' => 170,
            ],
            [
                'patient_id' => 2,
                'doctor_id' => 1,
                'visit_date' => '2025-01-18',
                'department' => 'Poli Kandungan',
                'diagnosis' => 'Kehamilan trimester pertama',
                'treatment' => 'Pemeriksaan rutin kehamilan, USG, pemberian vitamin prenatal',
                'notes' => 'Kehamilan normal, perkembangan janin baik',
                'status' => 'selesai',
                'vital_signs' => json_encode([
                    'blood_pressure' => '110/70',
                    'heart_rate' => 82,
                    'temperature' => 36.5
                ]),
                'weight' => 58.2,
                'height' => 160,
            ],
            [
                'patient_id' => 3,
                'doctor_id' => 1,
                'visit_date' => '2025-01-20',
                'department' => 'Poli Anak',
                'diagnosis' => 'Infeksi saluran pernapasan atas',
                'treatment' => 'Pemberian antipiretik, antihistamin, istirahat cukup',
                'notes' => 'Anak demam tinggi, batuk pilek, respons baik terhadap pengobatan',
                'status' => 'selesai',
                'vital_signs' => json_encode([
                    'blood_pressure' => '95/60',
                    'heart_rate' => 110,
                    'temperature' => 38.5
                ]),
                'weight' => 18.5,
                'height' => 95,
            ],
            [
                'patient_id' => 4,
                'doctor_id' => 1,
                'visit_date' => '2025-01-22',
                'department' => 'Poli Penyakit Dalam',
                'diagnosis' => 'Diabetes melitus tipe 2',
                'treatment' => 'Diet diabet, olahraga teratur, pengobatan oral',
                'notes' => 'Pasien baru didiagnosis, perlu edukasi intensif tentang diabetes',
                'status' => 'selesai',
                'vital_signs' => json_encode([
                    'blood_pressure' => '130/85',
                    'heart_rate' => 76,
                    'temperature' => 36.7
                ]),
                'weight' => 82.3,
                'height' => 165,
            ],
            [
                'patient_id' => 5,
                'doctor_id' => 1,
                'visit_date' => '2025-01-25',
                'department' => 'Poli Jantung',
                'diagnosis' => 'Angina pektoris stabil',
                'treatment' => 'Pemberian antiangina, modifikasi faktor risiko',
                'notes' => 'Nyeri dada berkurang dengan pengobatan, saran angiografi',
                'status' => 'selesai',
                'vital_signs' => json_encode([
                    'blood_pressure' => '125/80',
                    'heart_rate' => 72,
                    'temperature' => 36.6
                ]),
                'weight' => 78.5,
                'height' => 175,
            ],
            [
                'patient_id' => 1,
                'doctor_id' => 1,
                'visit_date' => '2025-01-28',
                'department' => 'Poli Kulit',
                'diagnosis' => 'Dermatitis atopik',
                'treatment' => 'Krim kortikosteroid topikal, antihistamin oral',
                'notes' => 'Kulit kering dan gatal, perbaikan dengan pengobatan',
                'status' => 'selesai',
                'vital_signs' => json_encode([
                    'blood_pressure' => '120/80',
                    'heart_rate' => 75,
                    'temperature' => 36.8
                ]),
                'weight' => 75.5,
                'height' => 170,
            ],
            [
                'patient_id' => 2,
                'doctor_id' => 1,
                'visit_date' => '2025-01-30',
                'department' => 'IGD',
                'diagnosis' => 'Pneumonia lobaris',
                'treatment' => 'Antibiotik intravena, oksigen, cairan infus',
                'notes' => 'Pasien datang dengan sesak napas berat, demam tinggi',
                'status' => 'dalam_perawatan',
                'vital_signs' => json_encode([
                    'blood_pressure' => '100/60',
                    'heart_rate' => 110,
                    'temperature' => 39.2
                ]),
                'weight' => 58.2,
                'height' => 160,
            ],
            [
                'patient_id' => 3,
                'doctor_id' => 1,
                'visit_date' => '2025-02-02',
                'department' => 'Poli Anak',
                'diagnosis' => 'Pneumonia membaik',
                'treatment' => 'Lanjutan antibiotik oral, fisioterapi pernapasan',
                'notes' => 'Kondisi membaik, saturasi naik, masih batuk berdahak',
                'status' => 'selesai',
                'vital_signs' => json_encode([
                    'blood_pressure' => '110/70',
                    'heart_rate' => 85,
                    'temperature' => 37.0
                ]),
                'weight' => 18.5,
                'height' => 95,
            ],
        ];

        foreach ($histories as $history) {
            PatientHistory::create($history);
        }
    }
}
