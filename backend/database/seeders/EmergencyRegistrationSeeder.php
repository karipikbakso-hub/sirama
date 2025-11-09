<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EmergencyRegistration;

class EmergencyRegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $emergencies = [
            [
                'patient_id' => 1,
                'emergency_type' => 'Serangan jantung',
                'severity' => 'kritis',
                'arrival_time' => '2025-01-15 22:30:00',
                'triage_level' => 'level_2',
                'symptoms' => 'Nyeri dada hebat, sesak napas',
                'vital_signs' => json_encode([
                    'blood_pressure' => '160/100',
                    'heart_rate' => 110,
                    'temperature' => 37.2,
                    'respiratory_rate' => 28,
                    'spo2' => 92,
                    'consciousness' => 'Alert'
                ]),
                'status' => 'stabil',
                'initial_diagnosis' => 'Suspect Acute Coronary Syndrome',
                'treatment_given' => 'O2 nasal kanul 2L/menit, Nitroglycerin SL, ECG, IV line',
                'room_assigned' => 'ICCU-01',
                'doctor_assigned' => 1,
                'nurse_assigned' => 1,
                'discharge_time' => '2025-01-16 06:00:00',
                'discharge_notes' => 'Stable, transferred to cardiology ward',
            ],
            [
                'patient_id' => 2,
                'emergency_type' => 'Pneumonia berat',
                'severity' => 'kritis',
                'arrival_time' => '2025-01-18 14:15:00',
                'triage_level' => 'level_1',
                'symptoms' => 'Sesak napas berat, batuk darah',
                'vital_signs' => json_encode([
                    'blood_pressure' => '90/60',
                    'heart_rate' => 130,
                    'temperature' => 39.5,
                    'respiratory_rate' => 35,
                    'spo2' => 85,
                    'consciousness' => 'Confused'
                ]),
                'status' => 'dalam_perawatan',
                'initial_diagnosis' => 'Severe Pneumonia with Sepsis',
                'treatment_given' => 'Intubasi, ventilator, antibiotics IV, vasopressors',
                'room_assigned' => 'ICU-02',
                'doctor_assigned' => 1,
                'nurse_assigned' => 1,
            ],
            [
                'patient_id' => 3,
                'emergency_type' => 'Kejang demam',
                'severity' => 'darurat',
                'arrival_time' => '2025-01-20 19:45:00',
                'triage_level' => 'level_3',
                'symptoms' => 'Demam tinggi, kejang',
                'vital_signs' => json_encode([
                    'blood_pressure' => '100/70',
                    'heart_rate' => 140,
                    'temperature' => 40.2,
                    'respiratory_rate' => 30,
                    'spo2' => 95,
                    'consciousness' => 'Post-ictal'
                ]),
                'status' => 'menunggu',
                'initial_diagnosis' => 'Febrile Seizure',
                'treatment_given' => 'Paracetamol IV, Diazepam rektal, cooling blanket',
                'room_assigned' => 'PICU-01',
                'doctor_assigned' => 1,
                'nurse_assigned' => 1,
                'discharge_time' => '2025-01-21 14:00:00',
                'discharge_notes' => 'Discharged home, stable',
            ],
            [
                'patient_id' => 4,
                'emergency_type' => 'Hipoglikemia',
                'severity' => 'darurat',
                'arrival_time' => '2025-01-22 23:10:00',
                'triage_level' => 'level_2',
                'symptoms' => 'Pingsan, gula darah rendah',
                'vital_signs' => json_encode([
                    'blood_pressure' => '110/75',
                    'heart_rate' => 95,
                    'temperature' => 36.8,
                    'respiratory_rate' => 18,
                    'spo2' => 98,
                    'consciousness' => 'Drowsy'
                ]),
                'status' => 'menunggu',
                'initial_diagnosis' => 'Hypoglycemia',
                'treatment_given' => 'Glukosa 50% IV, monitoring gula darah',
                'room_assigned' => 'Emergency-01',
                'doctor_assigned' => 1,
                'nurse_assigned' => 1,
                'discharge_time' => '2025-01-23 02:30:00',
                'discharge_notes' => 'Discharged home with education',
            ],
            [
                'patient_id' => 5,
                'emergency_type' => 'Nyeri dada',
                'severity' => 'urgent',
                'arrival_time' => '2025-01-25 16:20:00',
                'triage_level' => 'level_3',
                'symptoms' => 'Nyeri dada, mual, berkeringat',
                'vital_signs' => json_encode([
                    'blood_pressure' => '140/90',
                    'heart_rate' => 105,
                    'temperature' => 37.0,
                    'respiratory_rate' => 22,
                    'spo2' => 96,
                    'consciousness' => 'Alert'
                ]),
                'status' => 'menunggu',
                'initial_diagnosis' => 'Unstable Angina',
                'treatment_given' => 'Aspirin, Nitroglycerin, ECG, cardiac enzymes',
                'room_assigned' => 'Cardiology-01',
                'doctor_assigned' => 1,
                'nurse_assigned' => 1,
                'discharge_time' => '2025-01-26 10:00:00',
                'discharge_notes' => 'Stable, scheduled for angiography',
            ],
        ];

        foreach ($emergencies as $emergency) {
            EmergencyRegistration::create($emergency);
        }
    }
}
