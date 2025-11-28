<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AuditLog;
use App\Models\User;
use Carbon\Carbon;

class AuditLogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users for testing
        $users = User::take(5)->get();

        $actions = ['login', 'logout', 'create', 'update', 'delete', 'view'];
        $resources = ['users', 'patients', 'prescriptions', 'billings', 'appointments', 'laboratory'];

        // Create sample audit logs
        for ($i = 0; $i < 50; $i++) {
            $user = $users->random();
            $action = $actions[array_rand($actions)];
            $resource = $resources[array_rand($resources)];

            AuditLog::create([
                'user_id' => $user->id,
                'user_name' => $user->name,
                'action' => $action,
                'resource' => $resource,
                'resource_id' => rand(1, 100),
                'ip_address' => '192.168.1.' . rand(1, 255),
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'payload' => json_encode([
                    'old_values' => ['status' => 'active'],
                    'new_values' => ['status' => 'inactive'],
                    'changes' => ['status' => 'Status changed from active to inactive']
                ]),
                'created_at' => Carbon::now()->subDays(rand(0, 30))
            ]);
        }

        // Create some system logs
        for ($i = 0; $i < 10; $i++) {
            AuditLog::create([
                'user_id' => null,
                'user_name' => 'System',
                'action' => 'system',
                'resource' => 'backup',
                'resource_id' => null,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'System Cron',
                'payload' => json_encode(['type' => 'automated_backup', 'status' => 'completed']),
                'created_at' => Carbon::now()->subHours(rand(1, 24))
            ]);
        }
    }
}