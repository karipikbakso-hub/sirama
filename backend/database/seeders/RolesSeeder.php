<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesSeeder extends Seeder
{
    public function run()
    {
        // Buat roles
        Role::create(['name' => 'admin', 'guard_name' => 'api']);
        Role::create(['name' => 'dokter', 'guard_name' => 'api']);
        Role::create(['name' => 'perawat', 'guard_name' => 'api']);
        Role::create(['name' => 'pasien', 'guard_name' => 'api']);

        // Buat permissions
        Permission::create(['name' => 'view-patient', 'guard_name' => 'api']);
        Permission::create(['name' => 'edit-patient', 'guard_name' => 'api']);
        Permission::create(['name' => 'manage-staff', 'guard_name' => 'api']);

        // Assign role admin ke user id 1
        $user = User::find(1);
        if ($user) {
            $user->assignRole('admin');
        }
    }
}