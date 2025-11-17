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
        $this->command->info('Creating realistic SIRAMA Hospital users...');

        // Admin users
        $admin1 = User::create([
            'username' => 'admin.sirama',
            'name' => 'Ahmad Rahman',
            'email' => 'admin@sirama.go.id',
            'password' => Hash::make('AdminSirama2024'),
            'nip' => '198501012010011001',
            'phone' => '081234567890',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $admin1->assignRole('admin');

        $admin2 = User::create([
            'username' => 'superadmin',
            'name' => 'Siti Nurhaliza',
            'email' => 'superadmin@sirama.go.id',
            'password' => Hash::make('SuperAdmin2024'),
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
            'email' => 'sumarno.dokter@sirama.go.id',
            'password' => Hash::make('DokterSumarno2024'),
            'nip' => '198008151995121001',
            'phone' => '081456789012',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $doctor1->assignRole('dokter');

        $doctor2 = User::create([
            'username' => 'dr.lia',
            'name' => 'Dr. Lia Kartika SpOG',
            'email' => 'lia.dokter@sirama.go.id',
            'password' => Hash::make('DokterLia2024'),
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
            'email' => 'ayu.perawat@sirama.go.id',
            'password' => Hash::make('PerawatAyu2024'),
            'nip' => '199012251998032002',
            'phone' => '081678901234',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $nurse1->assignRole('perawat');

        $nurse2 = User::create([
            'username' => 'perawat.budi',
            'name' => 'Budi Santoso',
            'email' => 'budi.perawat@sirama.go.id',
            'password' => Hash::make('PerawatBudi2024'),
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
            'email' => 'dewi.apoteker@sirama.go.id',
            'password' => Hash::make('ApotekerDewi2024'),
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
            'email' => 'rudi.kasir@sirama.go.id',
            'password' => Hash::make('KasirRudi2024'),
            'nip' => '199001152000062001',
            'phone' => '081901234567',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $kasir1->assignRole('kasir');

        $kasir2 = User::create([
            'username' => 'kasir.maya',
            'name' => 'Maya Sari',
            'email' => 'maya.kasir@sirama.go.id',
            'password' => Hash::make('KasirMaya2024'),
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
            'email' => 'yuni.pendaftaran@sirama.go.id',
            'password' => Hash::make('PendaftaranYuni2024'),
            'nip' => '199304152002102001',
            'phone' => '082123456789',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $pendaftaran1->assignRole('pendaftaran');

        $this->command->info('Created 10 realistic SIRAMA Hospital users:');
        $this->command->info('✅  2 Administrators (Ahmad Rahman, Siti Nurhaliza)');
        $this->command->info('✅  2 Doctors (Dr. Sumarno SpPD, Dr. Lia Kartika SpOG)');
        $this->command->info('✅  2 Nurses (Ayu Lestari, Budi Santoso)');
        $this->command->info('✅  1 Pharmacist (Dewi Sartika)');
        $this->command->info('✅  2 Cashiers (Rudi Hartono, Maya Sari - 1 inactive)');
        $this->command->info('✅  1 Registration Staff (Yuniarti Pratiwi)');

        $this->command->info('');
        $this->command->info('Login credentials for testing:');
        $this->command->info('Super Admin: superadmin@sirama.go.id / SuperAdmin2024');
        $this->command->info('Admin: admin@sirama.go.id / AdminSirama2024');
        $this->command->info('Doctor: sumarno.dokter@sirama.go.id / DokterSumarno2024');
        $this->command->info('Nurse: ayu.perawat@sirama.go.id / PerawatAyu2024');
        $this->command->info('Inactive user: maya.kasir@sirama.go.id / KasirMaya2024');
    }
}
