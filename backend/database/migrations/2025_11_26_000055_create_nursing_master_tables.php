<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Master Nursing Diagnoses (NANDA)
        Schema::create('nursing_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->string('nanda_code', 20)->unique();
            $table->string('diagnosis_name', 255);
            $table->text('definition')->nullable();
            $table->text('defining_characteristics')->nullable();
            $table->text('related_factors')->nullable();
            $table->enum('domain', [
                'health_promotion', 'nutrition', 'elimination', 'activity_rest',
                'perception_cognition', 'self_perception', 'role_relationships',
                'sexuality', 'coping_stress', 'life_principles', 'safety_protection', 'comfort', 'growth_development'
            ]);
            $table->enum('class', [
                'health_awareness', 'health_management', 'nutrition_imbalance', 'metabolic_imbalance',
                'bowel_incontinence', 'urinary_incontinence', 'skin_integrity', 'breathing_pattern',
                'gas_exchange', 'cardiac_output', 'tissue_perfusion', 'physical_mobility',
                'energy_field_disturbance', 'pain', 'comfort', 'sleep_rest', 'activity_exercise',
                'balance_coordination', 'sensory_perception', 'cognitive', 'communication',
                'self_concept', 'hopelessness', 'spiritual_distress', 'coping', 'post_trauma_responses',
                'neurobehavioral_stress', 'value_belief', 'dignity', 'health_maintenance',
                'infection', 'physical_injury', 'violence', 'environmental_hazards', 'defensive_processes',
                'thermoregulation', 'fluid_volume', 'electrolyte', 'acid_base', 'protection',
                'tissue_integrity', 'oral_mucous_membrane', 'dentition', 'swallowing', 'nursing_diagnosis',
                'breastfeeding', 'parenting', 'social_interaction', 'family_processes', 'role_performance',
                'sexual_dysfunction', 'reproductive', 'parent_infant_attachment', 'childbearing_process',
                'family_coping', 'community_coping', 'decisional_conflict', 'impaired_emancipated_decision_making',
                'readiness_enhanced_decision_making', 'moral_distress', 'spiritual_well_being',
                'compliance_behavior', 'willpower', 'risk_prone_health_behavior', 'ineffective_health_maintenance',
                'readiness_enhanced_health_management', 'family_health',
                'growth', 'development'
            ]);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['active', 'domain']);
            $table->index(['active', 'class']);
            $table->index('diagnosis_name');
        });

        // Master Nursing Interventions (NIC)
        Schema::create('nursing_interventions', function (Blueprint $table) {
            $table->id();
            $table->string('nic_code', 20)->unique();
            $table->string('intervention_name', 255);
            $table->text('definition')->nullable();
            $table->text('activities')->nullable(); // JSON array of activities
            $table->enum('domain', [
                'physiological_basic', 'physiological_complex', 'behavioral', 'safety',
                'family', 'health_system', 'community'
            ]);
            $table->enum('class', [
                'activity_exercise', 'elimination', 'immobility', 'neurological', 'nutrition',
                'respiration', 'skin_wound', 'tissue_integrity', 'circulation', 'endocrine',
                'fluid_electrolyte', 'neurologic', 'pain_comfort', 'pharmacological',
                'intravenous', 'perinatal', 'childbearing', 'postpartum', 'newborn_care',
                'attention', 'self_concept', 'sleep', 'emotion', 'communication', 'coping',
                'patient_education', 'impulse_control', 'electrolyte', 'drug_management',
                'nutrition_support', 'electrolyte_fluid', 'peripheral_vascular', 'hemodynamic',
                'gastrointestinal', 'acid_base', 'risk_management', 'postural', 'fall_prevention',
                'surveillance', 'health_screening', 'health_education', 'admission_transfer',
                'discharge_planning', 'documentation', 'information_management', 'referral',
                'case_management', 'collaboration', 'community_health', 'health_policy_monitoring'
            ]);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['active', 'domain']);
            $table->index(['active', 'class']);
            $table->index('intervention_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_interventions');
        Schema::dropIfExists('nursing_diagnoses');
    }
};

