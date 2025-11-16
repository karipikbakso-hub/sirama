<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AuditLog;
use Carbon\Carbon;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $auditLogs = [
            // Authentication logs
            [
                'user_name' => 'admin',
                'action' => 'User Login',
                'resource_type' => 'user',
                'description' => 'Successful login to admin dashboard',
                'level' => 'info',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subMinutes(5)
            ],
            [
                'user_name' => 'dr.smith',
                'action' => 'User Login',
                'resource_type' => 'user',
                'description' => 'Successful login to doctor dashboard',
                'level' => 'info',
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subMinutes(15)
            ],
            [
                'user_name' => 'nurse.jane',
                'action' => 'User Login',
                'resource_type' => 'user',
                'description' => 'Successful login to nurse dashboard',
                'level' => 'info',
                'ip_address' => '192.168.1.102',
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
                'created_at' => Carbon::now()->subMinutes(30)
            ],

            // Failed login attempts
            [
                'user_name' => null,
                'action' => 'Failed Login Attempt',
                'resource_type' => 'user',
                'description' => 'Multiple failed login attempts from IP address',
                'level' => 'warning',
                'ip_address' => '203.0.113.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(1)
            ],

            // Patient management logs
            [
                'user_name' => 'dr.smith',
                'action' => 'Patient Record Update',
                'resource_type' => 'patient',
                'description' => 'Updated patient record ID: 12345 - Diagnosis changed from Hypertension to Hypertension + Diabetes',
                'level' => 'info',
                'old_values' => ['diagnosis' => 'Hypertension'],
                'new_values' => ['diagnosis' => 'Hypertension + Diabetes'],
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(2)
            ],
            [
                'user_name' => 'admin',
                'action' => 'Patient Record Created',
                'resource_type' => 'patient',
                'description' => 'Created new patient record for John Doe (NIK: 1234567890123456)',
                'level' => 'info',
                'new_values' => ['name' => 'John Doe', 'nik' => '1234567890123456'],
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(3)
            ],

            // Registration logs
            [
                'user_name' => 'pendaftaran.staff',
                'action' => 'Patient Registration',
                'resource_type' => 'registration',
                'description' => 'Registered patient John Doe for General Consultation with Dr. Smith',
                'level' => 'info',
                'ip_address' => '192.168.1.103',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(4)
            ],

            // Prescription logs
            [
                'user_name' => 'dr.smith',
                'action' => 'Prescription Created',
                'resource_type' => 'prescription',
                'description' => 'Created prescription for patient John Doe - Amlodipine 5mg, Metformin 500mg',
                'level' => 'info',
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(5)
            ],

            // Lab order logs
            [
                'user_name' => 'dr.smith',
                'action' => 'Lab Order Created',
                'resource_type' => 'lab_order',
                'description' => 'Ordered Complete Blood Count and Lipid Profile for patient John Doe',
                'level' => 'info',
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(6)
            ],

            // Billing logs
            [
                'user_name' => 'kasir.staff',
                'action' => 'Payment Processed',
                'resource_type' => 'payment',
                'description' => 'Processed payment of Rp 150,000 for patient John Doe (Registration + Consultation)',
                'level' => 'info',
                'ip_address' => '192.168.1.104',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(7)
            ],

            // System configuration logs
            [
                'user_name' => 'admin',
                'action' => 'System Configuration Updated',
                'resource_type' => 'system_config',
                'description' => 'Updated system configuration: Changed session timeout from 30 to 60 minutes',
                'level' => 'warning',
                'old_values' => ['session_timeout' => 30],
                'new_values' => ['session_timeout' => 60],
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(8)
            ],

            // Role management logs
            [
                'user_name' => 'superadmin',
                'action' => 'Role Permissions Updated',
                'resource_type' => 'role',
                'description' => 'Updated permissions for role "kasir" - Added "view reports" permission',
                'level' => 'info',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(9)
            ],

            // API integration logs
            [
                'user_name' => 'admin',
                'action' => 'BPJS Integration Test',
                'resource_type' => 'api_log',
                'description' => 'Test connection to BPJS API - Status: Success (200 OK)',
                'level' => 'info',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(10)
            ],
            [
                'user_name' => 'admin',
                'action' => 'SATUSEHAT Integration Test',
                'resource_type' => 'api_log',
                'description' => 'Test connection to SATUSEHAT API - Status: Failed (401 Unauthorized)',
                'level' => 'error',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(11)
            ],

            // Backup logs
            [
                'user_name' => 'system',
                'action' => 'System Backup',
                'resource_type' => 'backup',
                'description' => 'Automated daily backup completed successfully - Size: 2.3 GB',
                'level' => 'info',
                'ip_address' => 'localhost',
                'user_agent' => 'System Cron Job',
                'created_at' => Carbon::now()->subHours(12)
            ],

            // Report generation logs
            [
                'user_name' => 'admin',
                'action' => 'Report Generated',
                'resource_type' => 'report',
                'description' => 'Generated monthly patient statistics report for November 2025',
                'level' => 'info',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(13)
            ],

            // Security events
            [
                'user_name' => 'admin',
                'action' => 'Security Alert',
                'resource_type' => 'user',
                'description' => 'Unusual login pattern detected - Multiple logins from different IP addresses',
                'level' => 'warning',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(14)
            ],

            // Audit system logs
            [
                'user_name' => 'admin',
                'action' => 'Audit Log Cleanup',
                'resource_type' => 'audit_log',
                'description' => 'Cleaned up 150 audit logs older than 90 days',
                'level' => 'info',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => Carbon::now()->subHours(15)
            ]
        ];

        foreach ($auditLogs as $logData) {
            AuditLog::create($logData);
        }

        $this->command->info('Audit logs seeded successfully!');
        $this->command->info('Created ' . count($auditLogs) . ' sample audit log entries.');
        $this->command->warn('Note: These are sample audit logs for demonstration purposes.');
    }
}
