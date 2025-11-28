<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NursingMasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedNursingDiagnoses();
        $this->seedNursingInterventions();
    }

    private function seedNursingDiagnoses()
    {
        $diagnoses = [
            [
                'nanda_code' => '00001',
                'diagnosis_name' => 'Activity Intolerance',
                'definition' => 'Insufficient physiological or psychological energy to endure or complete required or desired daily activities',
                'domain' => 'activity_rest',
                'class' => 'activity_exercise',
                'defining_characteristics' => 'Verbal report of fatigue, abnormal heart rate response to activity',
                'related_factors' => 'Sedentary lifestyle, generalized weakness'
            ],
            [
                'nanda_code' => '00002',
                'diagnosis_name' => 'Ineffective Airway Clearance',
                'definition' => 'Inability to clear secretions or obstructions from the respiratory tract',
                'domain' => 'safety_protection',
                'class' => 'breathing_pattern',
                'defining_characteristics' => 'Dyspnea, abnormal breath sounds, cough',
                'related_factors' => 'Excessive secretions, airway obstruction'
            ],
            [
                'nanda_code' => '00003',
                'diagnosis_name' => 'Acute Pain',
                'definition' => 'Unpleasant sensory and emotional experience arising from actual or potential tissue damage',
                'domain' => 'comfort',
                'class' => 'pain',
                'defining_characteristics' => 'Self-report of pain, guarding behavior, facial grimace',
                'related_factors' => 'Tissue damage, surgical procedure'
            ],
            [
                'nanda_code' => '00004',
                'diagnosis_name' => 'Impaired Skin Integrity',
                'definition' => 'Altered epidermis and/or dermis',
                'domain' => 'safety_protection',
                'class' => 'tissue_integrity',
                'defining_characteristics' => 'Disruption of skin surface, destruction of skin layers',
                'related_factors' => 'Immobility, moisture, shear force'
            ],
            [
                'nanda_code' => '00005',
                'diagnosis_name' => 'Risk for Infection',
                'definition' => 'Increased susceptibility to pathogenic invasion',
                'domain' => 'safety_protection',
                'class' => 'infection',
                'defining_characteristics' => 'Not applicable (risk diagnosis)',
                'related_factors' => 'Inadequate primary defenses, invasive procedures'
            ],
            [
                'nanda_code' => '00006',
                'diagnosis_name' => 'Impaired Physical Mobility',
                'definition' => 'Limitation in independent, purposeful physical movement',
                'domain' => 'activity_rest',
                'class' => 'physical_mobility',
                'defining_characteristics' => 'Impaired ability to perform motor skills, limited range of motion',
                'related_factors' => 'Neuromuscular impairment, pain, musculoskeletal impairment'
            ],
            [
                'nanda_code' => '00007',
                'diagnosis_name' => 'Ineffective Breathing Pattern',
                'definition' => 'Inspiration and/or expiration that does not provide adequate ventilation',
                'domain' => 'safety_protection',
                'class' => 'breathing_pattern',
                'defining_characteristics' => 'Dyspnea, abnormal breathing rate, use of accessory muscles',
                'related_factors' => 'Neuromuscular impairment, pain, anxiety'
            ],
            [
                'nanda_code' => '00008',
                'diagnosis_name' => 'Imbalanced Nutrition: Less Than Body Requirements',
                'definition' => 'Intake of nutrients insufficient to meet metabolic needs',
                'domain' => 'nutrition',
                'class' => 'nutrition_imbalance',
                'defining_characteristics' => 'Weight loss, poor muscle tone, inadequate food intake',
                'related_factors' => 'Inability to ingest food, hypermetabolic states'
            ],
            [
                'nanda_code' => '00009',
                'diagnosis_name' => 'Anxiety',
                'definition' => 'Vague uneasy feeling of discomfort or dread',
                'domain' => 'coping_stress',
                'class' => 'coping',
                'defining_characteristics' => 'Apprehension, restlessness, increased tension',
                'related_factors' => 'Threat to self-concept, situational crises'
            ],
            [
                'nanda_code' => '00010',
                'diagnosis_name' => 'Disturbed Sleep Pattern',
                'definition' => 'Time-limited disruption of sleep',
                'domain' => 'activity_rest',
                'class' => 'sleep_rest',
                'defining_characteristics' => 'Difficulty falling asleep, fragmented sleep',
                'related_factors' => 'Environmental disturbances, pain, anxiety'
            ]
        ];

        DB::table('nursing_diagnoses')->insert($diagnoses);
        $this->command->info('Seeded ' . count($diagnoses) . ' nursing diagnoses');
    }

    private function seedNursingInterventions()
    {
        $interventions = [
            [
                'nic_code' => '0200',
                'intervention_name' => 'Airway Management',
                'definition' => 'Facilitation of patency of air passages',
                'domain' => 'physiological_basic',
                'class' => 'respiration',
                'activities' => '["Position patient to facilitate breathing","Monitor respiratory rate and depth","Auscultate breath sounds"]'
            ],
            [
                'nic_code' => '1400',
                'intervention_name' => 'Pain Management',
                'definition' => 'Alleviation of pain or reduction in pain to patient level of tolerance',
                'domain' => 'physiological_complex',
                'class' => 'pain_comfort',
                'activities' => '["Assess pain characteristics","Administer analgesics as prescribed","Monitor effectiveness of pain relief measures"]'
            ],
            [
                'nic_code' => '3590',
                'intervention_name' => 'Vital Signs Monitoring',
                'definition' => 'Collection and analysis of cardiovascular, respiratory, and body temperature data',
                'domain' => 'physiological_basic',
                'class' => 'circulation',
                'activities' => '["Monitor blood pressure","Assess heart rate and rhythm","Measure body temperature"]'
            ],
            [
                'nic_code' => '5240',
                'intervention_name' => 'Nutrition Management',
                'definition' => 'Assistance with or provision of a balanced dietary intake',
                'domain' => 'physiological_basic',
                'class' => 'nutrition',
                'activities' => '["Assess nutritional status","Provide nutritional supplements","Monitor intake and output"]'
            ],
            [
                'nic_code' => '6650',
                'intervention_name' => 'Infection Control',
                'definition' => 'Minimizing the acquisition and transmission of infectious agents',
                'domain' => 'safety',
                'class' => 'risk_management',
                'activities' => '["Perform hand hygiene","Use personal protective equipment","Isolate infected patients"]'
            ]
        ];

        DB::table('nursing_interventions')->insert($interventions);
        $this->command->info('Seeded ' . count($interventions) . ' nursing interventions');
    }
}
