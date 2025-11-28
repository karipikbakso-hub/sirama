ao<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DashboardTestSeeder extends Seeder
{
    public function run(): void
    {
        // Create test admin user
        $adminId = DB::table('users')->insertGetId([
            'name' => 'Administrator',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create test doctor
        $doctorId = DB::table('users')->insertGetId([
            'name' => 'Dr. Ahmad Rahman',
            'email' => 'dokter@test.com',
            'password' => Hash::make('password'),
            'role' => 'dokter',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create test patients
        $patients = [];
        for ($i = 1; $i <= 10; $i++) {
            $patients[] = [
                'id' => $i,
                'name' => 'Pasien Test ' . $i,
                'nik' => '123456789012345' . $i,
                'birth_date' => Carbon::now()->subYears(rand(20, 60))->format('Y-m-d'),
                'gender' => rand(0, 1) ? 'L' : 'P',
                'phone' => '0812345678' . $i,
                'address' => 'Jl. Test No. ' . $i,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert patients (adjust table name if needed)
        try {
            DB::table('patients')->insert($patients);
        } catch (\Exception $e) {
            // If patients table doesn't exist, skip
            $this->command->warn('Patients table not found, skipping patient creation');
        }

        // Create test registrations for today
        $registrations = [];
        $today = Carbon::today();

        for ($i = 1; $i <= 5; $i++) {
            $registrations[] = [
                'id' => $i,
                'patient_id' => $i,
                'doctor_id' => $doctorId,
                'registration_number' => 'REG-' . $today->format('Ymd') . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'registration_date' => $today,
                'status' => 'waiting',
                'complaint' => 'Keluhan test ' . $i,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        try {
            DB::table('registrations')->insert($registrations);
        } catch (\Exception $e) {
            $this->command->warn('Registrations table not found, skipping registration creation');
        }

        // Create queue entries
        $queues = [];
        for ($i = 1; $i <= 5; $i++) {
            $queues[] = [
                'id' => $i,
                'queue_number' => 'A' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'patient_id' => $i,
                'registration_id' => $i,
                'service_unit' => 'Poli Umum',
                'poli_id' => 1,
                'status' => $i <= 2 ? 'waiting' : ($i <= 3 ? 'in_progress' : 'completed'),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        try {
            DB::table('queue_managements')->insert($queues);
        } catch (\Exception $e) {
            $this->command->warn('Queue managements table not found, skipping queue creation');
        }

        // Create test audit logs for today's admin dashboard
        $auditLogs = [
            [
                'user_name' => 'Administrator',
                'user_id' => $adminId,
                'action' => 'login',
                'resource_type' => 'user',
                'description' => 'Administrator berhasil masuk sistem',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Test Browser',
                'level' => 'info',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_name' => 'Administrator',
                'user_id' => $adminId,
                'action' => 'create',
                'resource_type' => 'user',
                'description' => 'Administrator membuat pengguna baru',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Test Browser',
                'level' => 'info',
                'created_at' => now()->subMinutes(30),
                'updated_at' => now()->subMinutes(30),
            ],
            [
                'user_name' => 'Administrator',
                'user_id' => $adminId,
                'action' => 'create',
                'resource_type' => 'patient',
                'description' => 'Administrator membuat data pasien baru',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Test Browser',
                'level' => 'info',
                'created_at' => now()->subMinutes(25),
                'updated_at' => now()->subMinutes(25),
            ],
            [
                'user_name' => 'user1',
                'user_id' => null,
                'action' => 'login',
                'resource_type' => 'user',
                'description' => 'User1 berhasil masuk sistem',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Test Browser',
                'level' => 'info',
                'created_at' => now()->subMinutes(20),
                'updated_at' => now()->subMinutes(20),
            ],
            [
                'user_name' => 'user2',
                'user_id' => null,
                'action' => 'login',
                'resource_type' => 'user',
                'description' => 'User2 berhasil masuk sistem',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Test Browser',
                'level' => 'info',
                'created_at' => now()->subMinutes(15),
                'updated_at' => now()->subMinutes(15),
            ],
        ];

        try {
            DB::table('audit_logs')->insert($auditLogs);
        } catch (\Exception $e) {
            $this->command->warn('Audit logs table not found, skipping audit log creation');
        }

        // Create test API logs for today's admin dashboard
        $apiLogs = [
            [
                'method' => 'GET',
                'endpoint' => '/api/dashboard/admin',
                'status_code' => 200,
                'response_time' => 150,
                'user_agent' => 'Test Browser',
                'ip_address' => '127.0.0.1',
                'is_success' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'method' => 'GET',
                'endpoint' => '/api/audit-logs/recent',
                'status_code' => 200,
                'response_time' => 80,
                'user_agent' => 'Test Browser',
                'ip_address' => '127.0.0.1',
                'is_success' => true,
                'created_at' => now()->subMinutes(5),
                'updated_at' => now()->subMinutes(5),
            ],
            [
                'method' => 'GET',
                'endpoint' => '/api/system/health',
                'status_code' => 200,
                'response_time' => 120,
                'user_agent' => 'Test Browser',
                'ip_address' => '127.0.0.1',
                'is_success' => true,
                'created_at' => now()->subMinutes(10),
                'updated_at' => now()->subMinutes(10),
            ],
            [
                'method' => 'POST',
                'endpoint' => '/api/patient',
                'status_code' => 201,
                'response_time' => 200,
                'user_agent' => 'Test Browser',
                'ip_address' => '127.0.0.1',
                'is_success' => true,
                'created_at' => now()->subMinutes(15),
                'updated_at' => now()->subMinutes(15),
            ],
            [
                'method' => 'PUT',
                'endpoint' => '/api/user/profile',
                'status_code' => 200,
                'response_time' => 180,
                'user_agent' => 'Test Browser',
                'ip_address' => '127.0.0.1',
                'is_success' => true,
                'created_at' => now()->subMinutes(20),
                'updated_at' => now()->subMinutes(20),
            ],
        ];

        try {
            DB::table('api_logs')->insert($apiLogs);
        } catch (\Exception $e) {
            $this->command->warn('API logs table not found, skipping API log creation');
        }

        $this->command->info('Dashboard test data created successfully!');
        $this->command->info('Admin: admin@test.com / password');
        $this->command->info('Doctor: dokter@test.com / password');
        $this->command->info('Created 10 test patients, 5 registrations, 5 queue entries, 5 audit logs, and 5 API logs');
    }
}
