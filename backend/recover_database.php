<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "=== DATABASE RECOVERY SCRIPT ===\n\n";

echo "Step 1: Running migrations...\n";
try {
    // Run migrations one by one to avoid conflicts
    $migrations = [
        '0001_01_01_000000_create_users_table',
        '0001_01_01_000001_create_cache_table',
        '0001_01_01_000002_create_jobs_table',
        '2025_01_18_021700_create_pengaturan_sistem_table',
        '2025_01_18_021701_create_riwayat_pengaturan_table',
        '2025_11_06_191428_create_personal_access_tokens_table',
        '2025_11_07_035017_create_permission_tables',
        '2025_11_07_043300_add_role_to_users_table',
        '2025_11_07_054429_remove_role_from_users_table',
        '2025_11_11_000001_create_m_pasien_table',
        '2025_11_07_203805_create_master_tables',
        '2025_11_07_210905_create_transaction_tables',
        '2025_11_08_080224_create_seps_table',
        '2025_11_08_095411_create_patient_histories_table',
        '2025_11_08_095454_create_emergency_registrations_table',
        '2025_11_08_095537_create_queue_managements_table',
        '2025_11_08_095615_create_appointments_table',
        '2025_11_08_095700_create_referrals_table',
        '2025_11_08_095742_create_bpjs_integrations_table',
        '2025_11_08_095819_create_bpjs_configurations_table',
        '2025_11_08_100136_create_patient_communications_table',
        '2025_11_09_014617_create_prescriptions_table',
        '2025_11_09_015844_create_t_resep_obat_table',
        '2025_11_09_015909_create_t_pesanan_lab_table',
        '2025_11_09_015932_create_t_pesanan_radiologi_table',
        '2025_11_09_015955_create_t_catatan_cppt_table',
        '2025_11_09_020222_migrate_master_data_to_indonesian_tables',
        '2025_11_09_022515_add_role_column_back_to_users_table',
        '2025_11_09_071829_create_catatan_cppts_table',
        '2025_11_09_071837_create_pesanan_labs_table',
        '2025_11_09_071850_create_pesanan_radiologis_table',
        '2025_11_09_195149_create_permission_tables',
        '2025_11_10_203931_update_patient_histories_table_structure',
        '2025_11_11_033352_tambah_kolom_lengkap_pendaftaran_igd_ke_tabel_emergency_registrations',
        '2025_11_11_041430_fix_doctor_foreign_key_in_registrations_table',
        '2025_11_11_185545_add_login_tracking_to_users_table',
        '2025_11_12_080158_create_audit_logs_table',
        '2025_11_12_080216_create_onehealth_config_table',
        '2025_11_12_090000_create_system_configurations_table',
        '2025_11_12_105506_create_api_logs_table',
        '2025_11_12_130321_create_backup_schedules_table',
        '2025_11_12_130332_create_backup_histories_table',
        '2025_11_12_131920_create_system_logs_table',
        '2025_11_12_185242_add_registration_id_to_emergency_registrations_table',
        '2025_11_13_035758_add_queue_order_to_registrations_table',
        '2025_11_13_040000_create_queue_sessions_table',
        '2025_11_13_040100_create_queue_logs_table',
        '2025_11_13_040200_create_queue_priorities_table',
        '2025_11_13_040300_create_service_counters_table',
        '2025_11_13_040400_create_queue_announcements_table',
        '2025_11_13_062857_add_priority_id_to_registrations_table',
        '2025_11_13_074619_create_sep_verifications_table',
        '2025_11_13_080237_create_mobile_jkn_appointments_table',
        '2025_11_13_081048_add_response_time_ms_to_mobile_jkn_appointments_table',
        '2025_11_13_082151_create_satusehat_sync_logs_table',
        '2025_11_13_200200_create_system_alerts_table',
        '2025_11_13_200234_create_login_attempts_table',
        '2025_11_13_200258_create_performance_metrics_table',
        '2025_11_13_210419_create_cppt_entries_table',
        '2025_11_14_030000_create_t_pemeriksaan_table',
        '2025_11_14_050000_create_t_diagnosis_pasien_table',
        '2025_11_14_054238_add_diagnosa_klinis_and_urgensi_to_t_radiologi_table',
        '2025_11_14_060511_fix_radiology_foreign_key_to_registrations_table',
        '2025_11_14_062541_add_kode_pemeriksaan_to_m_laboratorium_table',
        '2025_11_14_062713_rename_tarif_to_harga_in_m_laboratorium_table',
        '2025_11_14_070940_fix_laboratorium_foreign_key_to_registrations_table',
        '2025_11_14_080000_create_t_penugasan_dokter_table',
        '2025_11_14_081000_create_t_lampiran_pemeriksaan_table',
        '2025_11_14_111459_add_user_id_to_m_dokter_table',
        '2025_11_14_122253_add_doctor_id_to_t_pemeriksaan_table',
        '2025_11_14_161834_create_tanda_vital_table',
        '2025_11_14_170000_create_cppt_nursing_entries_table',
        '2025_11_14_171300_create_t_triase_table',
        '2025_11_15_054005_create_hasil_survey_table',
        '2025_11_17_070841_add_columns_to_users_table',
        '2025_11_17_114141_add_soft_deletes_to_users_table',
        '2025_11_17_153533_add_indexes_to_audit_logs_table',
        '2025_11_17_190004_create_jadwal_backup_table',
        '2025_11_17_190011_create_riwayat_backup_table',
        '2025_11_18_040319_add_additional_fields_to_patients_table',
        '2025_11_19_125952_create_bulk_validation_jobs_table',
        '2025_11_19_130000_create_mobile_jkn_bookings_table',
        '2025_11_19_134046_add_satusehat_ihs_number_to_m_pasien_table',
        '2025_11_21_073645_add_columns_to_prescriptions_table',
        '2025_11_21_073712_create_prescription_items_table',
        '2025_11_21_112007_add_pain_scale_and_consciousness_to_t_tanda_vital_table',
        '2025_11_21_151344_create_nursing_master_tables',
        '2025_11_21_190558_add_triase_fields_to_t_triase_table',
        '2025_11_23_085649_create_medicine_batches_table',
        '2025_11_23_085711_create_stock_adjustments_table',
        '2025_11_23_085728_create_stock_movements_table',
        '2025_11_23_143300_create_nursing_queues_table',
    ];

    foreach ($migrations as $migration) {
        try {
            $exitCode = 0;
            $output = [];
            exec("php artisan migrate --path=database/migrations/{$migration}.php", $output, $exitCode);
            if ($exitCode === 0) {
                echo "✓ {$migration}\n";
            } else {
                echo "✗ {$migration} - failed\n";
            }
        } catch (Exception $e) {
            echo "✗ {$migration} - error: " . $e->getMessage() . "\n";
        }
    }
} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
}

echo "\nStep 2: Seeding roles...\n";
try {
    exec("php artisan db:seed --class=RolesSeeder", $output, $exitCode);
    if ($exitCode === 0) {
        echo "✓ Roles seeded\n";
    } else {
        echo "✗ Roles seeding failed\n";
    }
} catch (Exception $e) {
    echo "Roles seeding error: " . $e->getMessage() . "\n";
}

echo "\nStep 3: Seeding users...\n";
try {
    exec("php artisan db:seed --class=UsersSeeder", $output, $exitCode);
    if ($exitCode === 0) {
        echo "✓ Users seeded\n";
    } else {
        echo "✗ Users seeding failed\n";
    }
} catch (Exception $e) {
    echo "Users seeding error: " . $e->getMessage() . "\n";
}

echo "\nStep 4: Seeding other data...\n";
$seeders = ['PasienSeeder', 'MedicineSeeder', 'DashboardTestSeeder'];

foreach ($seeders as $seeder) {
    try {
        exec("php artisan db:seed --class={$seeder}", $output, $exitCode);
        if ($exitCode === 0) {
            echo "✓ {$seeder}\n";
        } else {
            echo "✗ {$seeder} failed\n";
        }
    } catch (Exception $e) {
        echo "Seeder error: " . $e->getMessage() . "\n";
    }
}

echo "\nStep 5: Adding test prescription data...\n";
try {
    // Add test patients if needed
    if (DB::table('m_pasien')->count() == 0) {
        DB::table('m_pasien')->insert([
            ['nama_lengkap' => 'Ahmad Surya', 'no_rm' => 'MR-TEST-001', 'jenis_kelamin' => 'L', 'tanggal_lahir' => '1990-05-15', 'alamat' => 'Jl. Test 1', 'jenis_penjamin' => 'bpjs', 'created_at' => now(), 'updated_at' => now()],
            ['nama_lengkap' => 'Siti Aminah', 'no_rm' => 'MR-TEST-002', 'jenis_kelamin' => 'P', 'tanggal_lahir' => '1985-08-20', 'alamat' => 'Jl. Test 2', 'jenis_penjamin' => 'umum', 'created_at' => now(), 'updated_at' => now()],
        ]);
        echo "✓ Added test patients\n";
    }

    // Add users for all roles if needed
    $roles = ['admin', 'dokter', 'perawat', 'kasir', 'apoteker', 'pendaftaran', 'manajemenrs'];

    foreach ($roles as $role) {
        if (DB::table('users')->where('email', "{$role}@hospital.test")->count() == 0) {
            $userData = [
                'name' => ucfirst($role) . ' ' . ucfirst(substr($role, 0, 1)) . '. Test',
                'email' => "{$role}@hospital.test",
                'password' => Hash::make('password'),
                'role' => $role,
                'nip' => strtoupper(substr($role, 0, 3)) . '001',
                'phone' => '08123456789',
                'is_active' => 1,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Special handling for different roles
            switch ($role) {
                case 'admin':
                    $userData['name'] = 'Administrator';
                    $userData['nip'] = 'ADM001';
                    break;
                case 'dokter':
                    $userData['name'] = 'Dr. Test Rahman';
                    $userData['nip'] = 'DR001';
                    break;
                case 'perawat':
                    $userData['name'] = 'Ns. Test Aminah';
                    $userData['nip'] = 'NS001';
                    break;
                case 'kasir':
                    $userData['name'] = 'Kasir Test Sari';
                    $userData['nip'] = 'KSR001';
                    break;
                case 'apoteker':
                    $userData['name'] = 'Apt. Test Budi';
                    $userData['nip'] = 'APT001';
                    break;
                case 'pendaftaran':
                    $userData['name'] = 'Pendaftaran Test Wati';
                    $userData['nip'] = 'PDF001';
                    break;
                case 'manajemenrs':
                    $userData['name'] = 'Manajemen RS Test Joko';
                    $userData['nip'] = 'MGR001';
                    break;
            }

            $userId = DB::table('users')->insertGetId($userData);

            // Assign role using Spatie
            try {
                $user = \App\Models\User::find($userId);
                if ($user) {
                    $user->assignRole($role);
                }
            } catch (Exception $e) {
                echo "Warning: Could not assign role {$role} to user: " . $e->getMessage() . "\n";
            }

            echo "✓ Added {$role} user\n";
        }
    }

    // Add test medicines if needed
    if (DB::table('m_obat')->count() == 0) {
        DB::table('m_obat')->insert([
            ['nama_obat' => 'Paracetamol 500mg', 'nama_generik' => 'Paracetamol', 'stock' => 100, 'harga' => 1000, 'created_at' => now(), 'updated_at' => now()],
            ['nama_obat' => 'Amoxicillin 500mg', 'nama_generik' => 'Amoxicillin', 'stock' => 50, 'harga' => 2500, 'created_at' => now(), 'updated_at' => now()],
        ]);
        echo "✓ Added test medicines\n";
    }

    // Add registrations if needed
    $patients = DB::table('m_pasien')->get();
    $doctors = DB::table('users')->where('role', 'dokter')->get();

    if ($patients->count() > 0 && $doctors->count() > 0) {
        foreach ($patients as $patient) {
            if (!DB::table('t_registrasi')->where('patient_id', $patient->id)->exists()) {
                DB::table('t_registrasi')->insert([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctors->first()->id,
                    'poli_id' => 1,
                    'penjamin_id' => 1,
                    'no_registrasi' => 'REG-TEST-' . $patient->id,
                    'tanggal_registrasi' => now()->format('Y-m-d'),
                    'jam_registrasi' => now()->format('H:i:s'),
                    'status' => 'menunggu',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        echo "✓ Added registrations\n";
    }

    // Add test prescriptions
    $registrations = DB::table('t_registrasi')->get();
    $medicines = DB::table('m_obat')->get();

    if ($registrations->count() > 0 && $medicines->count() > 0 && DB::table('prescriptions')->count() == 0) {
        for ($i = 0; $i < 5; $i++) {
            $registration = $registrations->random();
            $doctor = $doctors->random();
            $status = ['pending', 'validated', 'dispensed', 'completed'][array_rand(['pending', 'validated', 'dispensed', 'completed'])];

            $prescriptionId = DB::table('prescriptions')->insertGetId([
                'registration_id' => $registration->id,
                'doctor_id' => $doctor->id,
                'status' => $status,
                'is_urgent' => rand(1, 10) <= 2,
                'total_price' => 0,
                'notes' => 'Test prescription ' . ($i + 1),
                'created_at' => now()->subDays(rand(0, 7)),
                'updated_at' => now(),
            ]);

            // Add prescription items
            $selectedMedicines = $medicines->random(min(2, $medicines->count()));
            $totalPrice = 0;

            foreach ($selectedMedicines as $medicine) {
                $quantity = rand(5, 20);
                $subtotal = $quantity * $medicine->harga;
                $totalPrice += $subtotal;

                DB::table('prescription_items')->insert([
                    'prescription_id' => $prescriptionId,
                    'medicine_id' => $medicine->id,
                    'medicine_name' => $medicine->nama_obat,
                    'dosage' => '500mg',
                    'frequency' => '3x sehari',
                    'duration' => '5 hari',
                    'quantity' => $quantity,
                    'price' => $medicine->harga,
                    'subtotal' => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('prescriptions')->where('id', $prescriptionId)->update(['total_price' => $totalPrice]);
        }
        echo "✓ Added test prescriptions\n";
    }

} catch (Exception $e) {
    echo "Test data error: " . $e->getMessage() . "\n";
}

echo "\n=== RECOVERY COMPLETE ===\n";
echo "Database telah direcover. Silakan test halaman Order Resep:\n";
echo "http://localhost:3000/dashboard/apoteker/order-resep\n\n";

echo "=== LOGIN CREDENTIALS (Password: password) ===\n";
echo "Admin:       admin@hospital.test\n";
echo "Dokter:      dokter@hospital.test\n";
echo "Perawat:     perawat@hospital.test\n";
echo "Kasir:       kasir@hospital.test\n";
echo "Apoteker:    apoteker@hospital.test\n";
echo "Pendaftaran: pendaftaran@hospital.test\n";
echo "ManajemenRS: manajemenrs@hospital.test\n\n";

echo "=== TEST ORDER RESEP PAGE ===\n";
echo "1. Login sebagai apoteker\n";
echo "2. Buka: http://localhost:3000/dashboard/apoteker/order-resep\n";
echo "3. Test search, filter, pagination, detail modal\n\n";
