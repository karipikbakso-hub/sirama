<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if it doesn't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@sirama.com'],
            [
                'name' => 'Admin SIRAMA',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role
        $admin->assignRole('admin');

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@sirama.com');
        $this->command->info('Password: password');
    }
}
