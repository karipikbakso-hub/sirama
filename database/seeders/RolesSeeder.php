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
        // Buat roles jika belum ada dengan guard 'web'
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $dokterRole = Role::firstOrCreate(['name' => 'dokter', 'guard_name' => 'web']);
        $perawatRole = Role::firstOrCreate(['name' => 'perawat', 'guard_name' => 'web']);
        $kasirRole = Role::firstOrCreate(['name' => 'kasir', 'guard_name' => 'web']);
        $apotekerRole = Role::firstOrCreate(['name' => 'apoteker', 'guard_name' => 'web']);
        $pendaftaranRole = Role::firstOrCreate(['name' => 'pendaftaran', 'guard_name' => 'web']);
        $manajemenrsRole = Role::firstOrCreate(['name' => 'manajemenrs', 'guard_name' => 'web']);
        $pasienRole = Role::firstOrCreate(['name' => 'pasien', 'guard_name' => 'web']);

        // Comprehensive permissions list with categories
        $permissions = [

            // User Management
            ['name' => 'view-users', 'group' => 'User Management', 'label' => 'Lihat Pengguna'],
            ['name' => 'create-users', 'group' => 'User Management', 'label' => 'Buat Pengguna'],
            ['name' => 'edit-users', 'group' => 'User Management', 'label' => 'Edit Pengguna'],
            ['name' => 'delete-users', 'group' => 'User Management', 'label' => 'Hapus Pengguna'],

            // Patient Management
            ['name' => 'view-patients', 'group' => 'Patient Management', 'label' => 'Lihat Pasien'],
            ['name' => 'create-patients', 'group' => 'Patient Management', 'label' => 'Buat Pasien'],
            ['name' => 'edit-patients', 'group' => 'Patient Management', 'label' => 'Edit Pasien'],
            ['name' => 'delete-patients', 'group' => 'Patient Management', 'label' => 'Hapus Pasien'],

            // Medical Records
            ['name' => 'view-cppt', 'group' => 'Medical Records', 'label' => 'Lihat CPPT'],
            ['name' => 'create-cppt', 'group' => 'Medical Records', 'label' => 'Buat CPPT'],
            ['name' => 'edit-cppt', 'group' => 'Medical Records', 'label' => 'Edit CPPT'],
            ['name' => 'delete-cppt', 'group' => 'Medical Records', 'label' => 'Hapus CPPT'],

            // Billing
            ['name' => 'view-invoices', 'group' => 'Billing', 'label' => 'Lihat Invoice'],
            ['name' => 'create-invoices', 'group' => 'Billing', 'label' => 'Buat Invoice'],
            ['name' => 'edit-invoices', 'group' => 'Billing', 'label' => 'Edit Invoice'],
            ['name' => 'delete-invoices', 'group' => 'Billing', 'label' => 'Hapus Invoice'],
            ['name' => 'view-payments', 'group' => 'Billing', 'label' => 'Lihat Pembayaran'],
            ['name' => 'create-payments', 'group' => 'Billing', 'label' => 'Buat Pembayaran'],
            ['name' => 'edit-payments', 'group' => 'Billing', 'label' => 'Edit Pembayaran'],
            ['name' => 'delete-payments', 'group' => 'Billing', 'label' => 'Hapus Pembayaran'],
            ['name' => 'process-refunds', 'group' => 'Billing', 'label' => 'Proses Refund'],

            // Reports
            ['name' => 'view-reports', 'group' => 'Reports', 'label' => 'Lihat Laporan'],
            ['name' => 'export-reports', 'group' => 'Reports', 'label' => 'Export Laporan'],
            ['name' => 'generate-reports', 'group' => 'Reports', 'label' => 'Hasilkan Laporan'],

            // System
            ['name' => 'manage-system', 'group' => 'System', 'label' => 'Kelola Sistem'],
            ['name' => 'manage-integrations', 'group' => 'System', 'label' => 'Kelola Integrasi'],
            ['name' => 'manage-backups', 'group' => 'System', 'label' => 'Kelola Backup'],

            // Queue Management
            ['name' => 'manage-queues', 'group' => 'Queue Management', 'label' => 'Kelola Antrian'],
            ['name' => 'view-queue-stats', 'group' => 'Queue Management', 'label' => 'Lihat Statistik Antrian'],

            // Laboratory
            ['name' => 'order-lab', 'group' => 'Laboratory', 'label' => 'Order Laboratorium'],
            ['name' => 'view-lab-results', 'group' => 'Laboratory', 'label' => 'Lihat Hasil Lab'],

            // Radiology
            ['name' => 'order-radiology', 'group' => 'Radiology', 'label' => 'Order Radiologi'],
            ['name' => 'view-radiology-results', 'group' => 'Radiology', 'label' => 'Lihat Hasil Radiologi'],

            // Appointments
            ['name' => 'view-appointments', 'group' => 'Appointments', 'label' => 'Lihat Janji Temu'],
            ['name' => 'create-appointments', 'group' => 'Appointments', 'label' => 'Buat Janji Temu'],
            ['name' => 'edit-appointments', 'group' => 'Appointments', 'label' => 'Edit Janji Temu'],
            ['name' => 'delete-appointments', 'group' => 'Appointments', 'label' => 'Hapus Janji Temu'],

            // Referrals
            ['name' => 'view-referrals', 'group' => 'Referrals', 'label' => 'Lihat Rujukan'],
            ['name' => 'create-referrals', 'group' => 'Referrals', 'label' => 'Buat Rujukan'],
            ['name' => 'edit-referrals', 'group' => 'Referrals', 'label' => 'Edit Rujukan'],
            ['name' => 'approve-referrals', 'group' => 'Referrals', 'label' => 'Approve Rujukan'],

            // Emergency
            ['name' => 'view-emergency-registrations', 'group' => 'Emergency', 'label' => 'Lihat Registrasi Emergency'],
            ['name' => 'create-emergency-registrations', 'group' => 'Emergency', 'label' => 'Buat Registrasi Emergency'],

            // Pharmacy
            ['name' => 'view-medicines', 'group' => 'Pharmacy', 'label' => 'Lihat Obat'],
            ['name' => 'manage-medicines', 'group' => 'Pharmacy', 'label' => 'Kelola Obat'],
            ['name' => 'create-prescriptions', 'group' => 'Pharmacy', 'label' => 'Buat Resep'],
            ['name' => 'view-prescriptions', 'group' => 'Pharmacy', 'label' => 'Lihat Resep'],

            // Administrative
            ['name' => 'manage-roles', 'group' => 'Administrative', 'label' => 'Kelola Peran'],
            ['name' => 'view-audit-logs', 'group' => 'Administrative', 'label' => 'Lihat Audit Log'],
            ['name' => 'manage-settings', 'group' => 'Administrative', 'label' => 'Kelola Setting'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission['name'],
                'guard_name' => 'web'
            ], [
                'name' => $permission['name'],
                'guard_name' => 'web',
                // Note: Additional fields can be added to permissions table if needed
            ]);
        }

        // Assign comprehensive permissions to admin
        $adminPermissions = [
            'view-users', 'create-users', 'edit-users', 'delete-users',
            'view-patients', 'create-patients', 'edit-patients', 'delete-patients',
            'view-cppt', 'create-cppt', 'edit-cppt', 'delete-cppt',
            'view-invoices', 'create-invoices', 'edit-invoices', 'delete-invoices',
            'view-payments', 'create-payments', 'edit-payments', 'delete-payments', 'process-refunds',
            'view-reports', 'export-reports', 'generate-reports',
            'manage-system', 'manage-integrations', 'manage-backups',
            'manage-queues', 'view-queue-stats',
            'order-lab', 'view-lab-results',
            'order-radiology', 'view-radiology-results',
            'view-appointments', 'create-appointments', 'edit-appointments', 'delete-appointments',
            'view-referrals', 'create-referrals', 'edit-referrals', 'approve-referrals',
            'view-emergency-registrations', 'create-emergency-registrations',
            'view-medicines', 'manage-medicines', 'create-prescriptions', 'view-prescriptions',
            'manage-roles', 'view-audit-logs', 'manage-settings'
        ];

        $adminRole->givePermissionTo($adminPermissions);

        // Assign basic permissions to other roles
        $pendaftaranRole->givePermissionTo([
            'view-patients', 'create-patients', 'edit-patients',
            'view-appointments', 'create-appointments', 'edit-appointments',
            'manage-queues', 'view-queue-stats'
        ]);

        $dokterRole->givePermissionTo([
            'view-patients',
            'view-cppt', 'create-cppt', 'edit-cppt',
            'create-prescriptions', 'view-prescriptions',
            'order-lab', 'view-lab-results',
            'order-radiology', 'view-radiology-results',
            'view-appointments'
        ]);

        $perawatRole->givePermissionTo([
            'view-patients',
            'view-cppt', 'create-cppt', 'edit-cppt',
            'view-prescriptions',
            'view-lab-results', 'view-radiology-results'
        ]);

        $kasirRole->givePermissionTo([
            'view-invoices', 'create-invoices', 'edit-invoices',
            'view-payments', 'create-payments', 'edit-payments', 'process-refunds',
            'view-reports'
        ]);

        $apotekerRole->givePermissionTo([
            'view-prescriptions', 'view-medicines', 'manage-medicines',
            'view-reports'
        ]);

        $manajemenrsRole->givePermissionTo([
            'view-reports', 'export-reports', 'generate-reports',
            'view-users', 'view-patients',
            'manage-settings'
        ]);

        // Assign role admin ke user id 1
        $user = User::find(1);
        if ($user) {
            $user->assignRole('admin');
        }
    }
}
