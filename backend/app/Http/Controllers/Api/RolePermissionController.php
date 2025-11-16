<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    /**
     * Display a listing of roles with their permissions.
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->where('guard_name', 'web')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $this->getRoleLabel($role->name),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:roles,name,NULL,id,guard_name,web|max:255',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $role = Role::create([
                'name' => $request->name,
                'guard_name' => 'web'
            ]);

            if ($request->has('permissions') && is_array($request->permissions)) {
                $role->syncPermissions($request->permissions);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role berhasil dibuat',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $this->getRoleLabel($role->name),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified role with permissions.
     */
    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $this->getRoleLabel($role->name),
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'permission_count' => $role->permissions->count(),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ]
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|unique:roles,name,' . $id . ',id,guard_name,web|max:255',
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            if ($request->has('name')) {
                $role->name = $request->name;
                $role->save();
            }

            if ($request->has('permissions')) {
                $role->syncPermissions($request->permissions);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role berhasil diperbarui',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $this->getRoleLabel($role->name),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        // Prevent deletion of core roles
        $coreRoles = ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs'];
        if (in_array($role->name, $coreRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Role core tidak dapat dihapus'
            ], 403);
        }

        try {
            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all available permissions.
     */
    public function getPermissions()
    {
        $permissions = Permission::where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'label' => $this->getPermissionLabel($permission->name),
                    'group' => $this->getPermissionGroup($permission->name),
                ];
            })
            ->groupBy('group');

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }

    /**
     * Update role permissions.
     */
    public function updatePermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $role->syncPermissions($request->permissions);

            return response()->json([
                'success' => true,
                'message' => 'Permissions berhasil diperbarui',
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get role label mapping.
     */
    private function getRoleLabel($roleName)
    {
        $labels = [
            'admin' => 'Administrator',
            'pendaftaran' => 'Pendaftaran',
            'dokter' => 'Dokter',
            'perawat' => 'Perawat',
            'apoteker' => 'Apoteker',
            'kasir' => 'Kasir',
            'manajemenrs' => 'Manajemen RS',
            'laboratorium' => 'Laboratorium',
            'radiologi' => 'Radiologi',
            'rekammedis' => 'Rekam Medis',
            'housekeeping' => 'Housekeeping',
            'security' => 'Security'
        ];

        return $labels[$roleName] ?? ucfirst($roleName);
    }

    /**
     * Get permission label mapping.
     */
    private function getPermissionLabel($permissionName)
    {
        $labels = [
            // User management
            'view users' => 'Lihat Pengguna',
            'create users' => 'Buat Pengguna',
            'edit users' => 'Edit Pengguna',
            'delete users' => 'Hapus Pengguna',

            // Patient management
            'view patients' => 'Lihat Pasien',
            'create patients' => 'Buat Pasien',
            'edit patients' => 'Edit Pasien',
            'delete patients' => 'Hapus Pasien',

            // Registration management
            'view registrations' => 'Lihat Pendaftaran',
            'create registrations' => 'Buat Pendaftaran',
            'edit registrations' => 'Edit Pendaftaran',
            'delete registrations' => 'Hapus Pendaftaran',

            // Queue management
            'view queues' => 'Lihat Antrian',
            'manage queues' => 'Kelola Antrian',

            // Medical records
            'view medical records' => 'Lihat Rekam Medis',
            'create medical records' => 'Buat Rekam Medis',
            'edit medical records' => 'Edit Rekam Medis',

            // Prescriptions
            'view prescriptions' => 'Lihat Resep',
            'create prescriptions' => 'Buat Resep',
            'edit prescriptions' => 'Edit Resep',
            'validate prescriptions' => 'Validasi Resep',

            // Lab orders
            'view lab orders' => 'Lihat Order Lab',
            'create lab orders' => 'Buat Order Lab',
            'edit lab orders' => 'Edit Order Lab',

            // Radiology orders
            'view radiology orders' => 'Lihat Order Radiologi',
            'create radiology orders' => 'Buat Order Radiologi',
            'edit radiology orders' => 'Edit Order Radiologi',

            // Billing & payments
            'view billing' => 'Lihat Billing',
            'create billing' => 'Buat Billing',
            'process payments' => 'Proses Pembayaran',

            // Reports
            'view reports' => 'Lihat Laporan',
            'generate reports' => 'Generate Laporan',

            // System administration
            'manage system' => 'Kelola Sistem',
            'view audit logs' => 'Lihat Audit Logs',
            'manage backups' => 'Kelola Backup',
            'manage integrations' => 'Kelola Integrasi',
        ];

        return $labels[$permissionName] ?? ucfirst(str_replace(['_', '-'], ' ', $permissionName));
    }

    /**
     * Get permission group mapping.
     */
    private function getPermissionGroup($permissionName)
    {
        $groups = [
            // User Management
            'view users' => 'Manajemen Pengguna',
            'create users' => 'Manajemen Pengguna',
            'edit users' => 'Manajemen Pengguna',
            'delete users' => 'Manajemen Pengguna',

            // Patient Management
            'view patients' => 'Manajemen Pasien',
            'create patients' => 'Manajemen Pasien',
            'edit patients' => 'Manajemen Pasien',
            'delete patients' => 'Manajemen Pasien',

            // Registration Management
            'view registrations' => 'Manajemen Pendaftaran',
            'create registrations' => 'Manajemen Pendaftaran',
            'edit registrations' => 'Manajemen Pendaftaran',
            'delete registrations' => 'Manajemen Pendaftaran',

            // Queue Management
            'view queues' => 'Manajemen Antrian',
            'manage queues' => 'Manajemen Antrian',

            // Medical Records
            'view medical records' => 'Rekam Medis',
            'create medical records' => 'Rekam Medis',
            'edit medical records' => 'Rekam Medis',

            // Prescriptions
            'view prescriptions' => 'Manajemen Resep',
            'create prescriptions' => 'Manajemen Resep',
            'edit prescriptions' => 'Manajemen Resep',
            'validate prescriptions' => 'Manajemen Resep',

            // Lab Orders
            'view lab orders' => 'Order Laboratorium',
            'create lab orders' => 'Order Laboratorium',
            'edit lab orders' => 'Order Laboratorium',

            // Radiology Orders
            'view radiology orders' => 'Order Radiologi',
            'create radiology orders' => 'Order Radiologi',
            'edit radiology orders' => 'Order Radiologi',

            // Billing & Payments
            'view billing' => 'Billing & Pembayaran',
            'create billing' => 'Billing & Pembayaran',
            'process payments' => 'Billing & Pembayaran',

            // Reports
            'view reports' => 'Laporan',
            'generate reports' => 'Laporan',

            // System Administration
            'manage system' => 'Administrasi Sistem',
            'view audit logs' => 'Administrasi Sistem',
            'manage backups' => 'Administrasi Sistem',
            'manage integrations' => 'Administrasi Sistem',
        ];

        return $groups[$permissionName] ?? 'Lainnya';
    }
}
