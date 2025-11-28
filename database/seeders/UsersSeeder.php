<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles exist first
        $this->command->info('Creating SIRAMA Hospital users with role-based emails...');

        // Admin users
        $admin1 = User::create([
            'username' => 'admin.sirama',
            'name' => 'Ahmad Rahman',
            'email' => 'admin@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '198501012010011001',
            'phone' => '081234567890',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $admin1->assignRole('admin');

        $admin2 = User::create([
            'username' => 'superadmin',
            'name' => 'Siti Nurhaliza',
            'email' => 'superadmin@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '198302152010012001',
            'phone' => '081345678901',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $admin2->assignRole('admin');

        // Doctors
        $doctor1 = User::create([
            'username' => 'dr.sumarno',
            'name' => 'Dr. Sumarno SpPD',
            'email' => 'dokter@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '198008151995121001',
            'phone' => '081456789012',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $doctor1->assignRole('dokter');

        $doctor2 = User::create([
            'username' => 'dr.lia',
            'name' => 'Dr. Lia Kartika SpOG',
            'email' => 'spog@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '198105201997022001',
            'phone' => '081567890123',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $doctor2->assignRole('dokter');

        // Nurses
        $nurse1 = User::create([
            'username' => 'perawat.ayu',
            'name' => 'Ayu Lestari',
            'email' => 'perawat@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '199012251998032002',
            'phone' => '081678901234',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $nurse1->assignRole('perawat');

        $nurse2 = User::create([
            'username' => 'perawat.budi',
            'name' => 'Budi Santoso',
            'email' => 'perawat2@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '198803121999051001',
            'phone' => '081789012345',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $nurse2->assignRole('perawat');

        // Pharmacists
        $apoteker1 = User::create([
            'username' => 'apt.dewi',
            'name' => 'Dewi Sartika',
            'email' => 'apoteker@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '198709101996081002',
            'phone' => '081890123456',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $apoteker1->assignRole('apoteker');

        // Cashiers
        $kasir1 = User::create([
            'username' => 'kasir.rudi',
            'name' => 'Rudi Hartono',
            'email' => 'kasir@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '199001152000062001',
            'phone' => '081901234567',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $kasir1->assignRole('kasir');

        $kasir2 = User::create([
            'username' => 'kasir.maya',
            'name' => 'Maya Sari',
            'email' => 'kasir2@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '199203202001092002',
            'phone' => '082012345678',
            'is_active' => false, // One inactive user
            'email_verified_at' => now(),
        ]);
        $kasir2->assignRole('kasir');

        // Registration staff
        $pendaftaran1 = User::create([
            'username' => 'daftar.yuni',
            'name' => 'Yuniarti Pratiwi',
            'email' => 'pendaftaran@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '199304152002102001',
            'phone' => '082123456789',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $pendaftaran1->assignRole('pendaftaran');

        // Additional roles for management
        $manajemen1 = User::create([
            'username' => 'mana.hendro',
            'name' => 'Dr. Hendro Wibowo',
            'email' => 'manajemenrs@sirama.com',
            'password' => Hash::make('password'),
            'nip' => '199004152001102001',
            'phone' => '082123456790',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $manajemen1->assignRole('manajemenrs');

        $this->command->info('Created 10 SIRAMA Hospital users with role-based emails:');
        $this->command->info('✅  2 Administrators (Ahmad Rahman, Siti Nurhaliza)');
        $this->command->info('✅  2 Doctors (Dr. Sumarno SpPD, Dr. Lia Kartika SpOG)');
        $this->command->info('✅  2 Nurses (Ayu Lestari, Budi Santoso)');
        $this->command->info('✅  1 Pharmacist (Dewi Sartika)');
        $this->command->info('✅  2 Cashiers (Rudi Hartono, Maya Sari - 1 inactive)');
        $this->command->info('✅  1 Registration Staff (Yuniarti Pratiwi)');
        $this->command->info('✅  1 Management Staff (Dr. Hendro Wibowo)');

        $this->command->info('');
        $this->command->info('Login credentials - Password: password (for all users)');
        $this->command->info('Admin: admin@sirama.com');
        $this->command->info('SuperAdmin: superadmin@sirama.com');
        $this->command->info('Dokter: dokter@sirama.com');
        $this->command->info('Perawat: perawat@sirama.com');
        $this->command->info('Apoteker: apoteker@sirama.com');
        $this->command->info('Kasir: kasir@sirama.com');
        $this->command->info('Pendaftaran: pendaftaran@sirama.com');
        $this->command->info('Manajemen RS: manajemenrs@sirama.com');
    }
}
