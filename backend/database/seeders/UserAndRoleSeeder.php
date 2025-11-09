<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserAndRoleSeeder extends Seeder
{
    public function run()
    {
        // 🎯 7 MAIN ROLES - KEMENKES STANDARDS
        $mainRoles = [
            'admin',           // 👨‍💼 Administrator/IT
            'pendaftaran',    // 📋 Registration
            'dokter',         // 👨‍⚕️ Doctor
            'perawat',        // 👩‍⚕️ Nurse
            'apoteker',       // 💊 Pharmacist
            'kasir',          // 💰 Cashier
            'manajemenrs'     // 🏢 Management
        ];

        // 🔮 5 FUTURE ROLES (Optional)
        $futureRoles = [
            'laboratorium',   // 🔬 Laboratory
            'radiologi',      // 📹 Radiology
            'rekammedis',    // 📄 Medical Records
            'housekeeping',  // 🧹 Housekeeping
            'security'       // 🔒 Security
        ];

        // Create all roles
        $allRoles = array_merge($mainRoles, $futureRoles);
        foreach ($allRoles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // 🎯 7 MAIN USERS - KEMENKES COMPLIANT
        $users = [
            // 👨‍💼 Administrator/IT
            ['name' => 'Administrator', 'email' => 'admin@sirama.com', 'role' => 'admin'],

            // 📋 Pendaftaran (Registration)
            ['name' => 'Staff Pendaftaran', 'email' => 'pendaftaran@sirama.com', 'role' => 'pendaftaran'],

            // 👨‍⚕️ Dokter (Doctor)
            ['name' => 'Dr. Ahmad Surya', 'email' => 'dokter@sirama.com', 'role' => 'dokter'],

            // 👩‍⚕️ Perawat (Nurse)
            ['name' => 'Perawat Sri', 'email' => 'perawat@sirama.com', 'role' => 'perawat'],

            // 💊 Apoteker (Pharmacist)
            ['name' => 'Apt. Maya Sari', 'email' => 'apoteker@sirama.com', 'role' => 'apoteker'],

            // 💰 Kasir (Cashier)
            ['name' => 'Staff Kasir', 'email' => 'kasir@sirama.com', 'role' => 'kasir'],

            // 🏢 Manajemen RS (Management)
            ['name' => 'Direktur RS', 'email' => 'manajemen@sirama.com', 'role' => 'manajemenrs'],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate([
                'email' => $data['email']
            ], [
                'name' => $data['name'],
                'password' => Hash::make('password'),
            ]);

            // Assign role (this will work even if role is already assigned)
            if (!$user->hasRole($data['role'])) {
                $user->assignRole($data['role']);
            }
        }
    }
}
