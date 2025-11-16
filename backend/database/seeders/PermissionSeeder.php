<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            // User Management
            ['name' => 'view users', 'guard_name' => 'web'],
            ['name' => 'create users', 'guard_name' => 'web'],
            ['name' => 'edit users', 'guard_name' => 'web'],
            ['name' => 'delete users', 'guard_name' => 'web'],

            // Patient Management
            ['name' => 'view patients', 'guard_name' => 'web'],
            ['name' => 'create patients', 'guard_name' => 'web'],
            ['name' => 'edit patients', 'guard_name' => 'web'],
            ['name' => 'delete patients', 'guard_name' => 'web'],

            // Registration Management
            ['name' => 'view registrations', 'guard_name' => 'web'],
            ['name' => 'create registrations', 'guard_name' => 'web'],
            ['name' => 'edit registrations', 'guard_name' => 'web'],
            ['name' => 'delete registrations', 'guard_name' => 'web'],

            // Queue Management
            ['name' => 'view queues', 'guard_name' => 'web'],
            ['name' => 'manage queues', 'guard_name' => 'web'],

            // Medical Records
            ['name' => 'view medical records', 'guard_name' => 'web'],
            ['name' => 'create medical records', 'guard_name' => 'web'],
            ['name' => 'edit medical records', 'guard_name' => 'web'],

            // Prescriptions
            ['name' => 'view prescriptions', 'guard_name' => 'web'],
            ['name' => 'create prescriptions', 'guard_name' => 'web'],
            ['name' => 'edit prescriptions', 'guard_name' => 'web'],
            ['name' => 'validate prescriptions', 'guard_name' => 'web'],

            // Lab Orders
            ['name' => 'view lab orders', 'guard_name' => 'web'],
            ['name' => 'create lab orders', 'guard_name' => 'web'],
            ['name' => 'edit lab orders', 'guard_name' => 'web'],

            // Radiology Orders
            ['name' => 'view radiology orders', 'guard_name' => 'web'],
            ['name' => 'create radiology orders', 'guard_name' => 'web'],
            ['name' => 'edit radiology orders', 'guard_name' => 'web'],

            // Billing & Payments
            ['name' => 'view billing', 'guard_name' => 'web'],
            ['name' => 'create billing', 'guard_name' => 'web'],
            ['name' => 'process payments', 'guard_name' => 'web'],

            // Reports
            ['name' => 'view reports', 'guard_name' => 'web'],
            ['name' => 'generate reports', 'guard_name' => 'web'],

            // System Administration
            ['name' => 'manage system', 'guard_name' => 'web'],
            ['name' => 'view audit logs', 'guard_name' => 'web'],
            ['name' => 'manage backups', 'guard_name' => 'web'],
            ['name' => 'manage integrations', 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }
    }
}
