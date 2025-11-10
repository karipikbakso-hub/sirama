<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Patient Management
            'view patients',
            'create patients',
            'edit patients',
            'delete patients',

            // Registration Management
            'view registrations',
            'create registrations',
            'edit registrations',
            'delete registrations',

            // Appointment Management
            'view appointments',
            'create appointments',
            'edit appointments',
            'delete appointments',

            // Queue Management
            'view queues',
            'manage queues',

            // Medical Records (EMR)
            'view emr',
            'create emr',
            'edit emr',

            // Prescriptions
            'view prescriptions',
            'create prescriptions',
            'edit prescriptions',
            'delete prescriptions',

            // Lab Orders
            'view lab orders',
            'create lab orders',
            'edit lab orders',

            // Radiology Orders
            'view radiology orders',
            'create radiology orders',
            'edit radiology orders',

            // Medicine Management
            'view medicines',
            'manage medicines',

            // Pharmacy Operations
            'dispense medicines',
            'manage inventory',

            // Billing & Payments
            'view bills',
            'create bills',
            'process payments',

            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // System Administration
            'view system logs',
            'manage system settings',
            'view reports',
            'manage roles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        $roles = [
            'pendaftaran' => [
                'view patients', 'create patients', 'edit patients',
                'view registrations', 'create registrations', 'edit registrations',
                'view appointments', 'create appointments', 'edit appointments',
                'view queues', 'manage queues',
            ],

            'dokter' => [
                'view patients',
                'view registrations', 'edit registrations',
                'view appointments', 'edit appointments',
                'view emr', 'create emr', 'edit emr',
                'view prescriptions', 'create prescriptions', 'edit prescriptions', 'delete prescriptions',
                'view lab orders', 'create lab orders', 'edit lab orders',
                'view radiology orders', 'create radiology orders', 'edit radiology orders',
            ],

            'perawat' => [
                'view patients',
                'view registrations', 'edit registrations',
                'view appointments', 'edit appointments',
                'view emr', 'create emr', 'edit emr',
                'view prescriptions',
                'view lab orders', 'create lab orders',
                'view radiology orders', 'create radiology orders',
            ],

            'apoteker' => [
                'view patients',
                'view prescriptions',
                'view medicines', 'manage medicines',
                'dispense medicines', 'manage inventory',
            ],

            'kasir' => [
                'view patients',
                'view registrations',
                'view bills', 'create bills', 'process payments',
            ],

            'admin' => [
                // All permissions
                'view patients', 'create patients', 'edit patients', 'delete patients',
                'view registrations', 'create registrations', 'edit registrations', 'delete registrations',
                'view appointments', 'create appointments', 'edit appointments', 'delete appointments',
                'view queues', 'manage queues',
                'view emr', 'create emr', 'edit emr',
                'view prescriptions', 'create prescriptions', 'edit prescriptions', 'delete prescriptions',
                'view lab orders', 'create lab orders', 'edit lab orders',
                'view radiology orders', 'create radiology orders', 'edit radiology orders',
                'view medicines', 'manage medicines',
                'dispense medicines', 'manage inventory',
                'view bills', 'create bills', 'process payments',
                'view users', 'create users', 'edit users', 'delete users',
                'view system logs', 'manage system settings', 'view reports', 'manage roles',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
