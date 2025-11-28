<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesController extends Controller
{
    /**
     * Get all roles with permissions data
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get()
            ->map(function($role) {
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
            'data' => $roles,
            'message' => 'Roles retrieved successfully'
        ]);
    }

    /**
     * Create a new role
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,NULL,id,guard_name,web',
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
                $role->givePermissionTo($request->permissions);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $this->getRoleLabel($role->name),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                ],
                'message' => 'Role created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get role details
     */
    public function show($id)
    {
        $role = Role::with('permissions')
            ->where('guard_name', 'web')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $this->getRoleLabel($role->name),
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'permission_count' => $role->permissions->count(),
                'user_count' => $role->users()->count(),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ],
            'message' => 'Role retrieved successfully'
        ]);
    }

    /**
     * Update role
     */
    public function update(Request $request, $id)
    {
        $role = Role::where('guard_name', 'web')->findOrFail($id);

        // Prevent editing core roles name
        $coreRoles = ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs'];

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:roles,name,' . $id . ',id,guard_name,web',
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
                'data' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $this->getRoleLabel($role->name),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                ],
                'message' => 'Role updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete role
     */
    public function destroy($id)
    {
        $role = Role::where('guard_name', 'web')->findOrFail($id);

        // Prevent deletion of core roles
        $coreRoles = ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs'];
        if (in_array($role->name, $coreRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete core system roles'
            ], 403);
        }

        // Check if role has users
        $userCount = $role->users()->count();
        if ($userCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete role. {$userCount} user(s) are assigned to this role."
            ], 409);
        }

        try {
            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update role permissions
     */
    public function updatePermissions(Request $request, $id)
    {
        $role = Role::where('guard_name', 'web')->findOrFail($id);

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
                'data' => [
                    'id' => $role->id,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permission_count' => $role->permissions->count(),
                ],
                'message' => 'Permissions updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clone role with permissions
     */
    public function clone(Request $request, $id)
    {
        $originalRole = Role::where('guard_name', 'web')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,NULL,id,guard_name,web',
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

            $newRole = Role::create([
                'name' => $request->name,
                'guard_name' => 'web'
            ]);

            // Copy permissions from original role
            $newRole->givePermissionTo($originalRole->permissions->pluck('name')->toArray());

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $newRole->id,
                    'name' => $newRole->name,
                    'label' => $this->getRoleLabel($newRole->name),
                    'permissions' => $newRole->permissions->pluck('name')->toArray(),
                    'permission_count' => $newRole->permissions->count(),
                ],
                'message' => 'Role cloned successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to clone role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users assigned to a role
     */
    public function getUsers($id)
    {
        $role = Role::where('guard_name', 'web')->findOrFail($id);

        $users = $role->users()
            ->select('id', 'name', 'email', 'created_at')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $this->getRoleLabel($role->name),
                ],
                'users' => $users,
                'user_count' => $users->count(),
            ],
            'message' => 'Users retrieved successfully'
        ]);
    }

    /**
     * Get all permissions grouped by category
     */
    public function getPermissions()
    {
        $permissions = Permission::where('guard_name', 'web')
            ->orderBy('name')
            ->get()
            ->groupBy(function($permission) {
                return $this->getPermissionGroup($permission->name);
            })
            ->map(function($group) {
                return $group->map(function($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'label' => $this->getPermissionLabel($permission->name),
                        'group' => $this->getPermissionGroup($permission->name),
                    ];
                })->values(); // Ensure indexed array
            });

        return response()->json([
            'success' => true,
            'data' => $permissions,
            'message' => 'Permissions retrieved successfully'
        ]);
    }

    /**
     * Get permission group
     */
    private function getPermissionGroup($permissionName)
    {
        $groups = [
            // User Management
            'view-users' => 'User Management', 'create-users' => 'User Management',
            'edit-users' => 'User Management', 'delete-users' => 'User Management',

            // Patient Management
            'view-patients' => 'Patient Management', 'create-patients' => 'Patient Management',
            'edit-patients' => 'Patient Management', 'delete-patients' => 'Patient Management',

            // Medical Records
            'view-cppt' => 'Medical Records', 'create-cppt' => 'Medical Records',
            'edit-cppt' => 'Medical Records', 'delete-cppt' => 'Medical Records',

            // Billing
            'view-invoices' => 'Billing', 'create-invoices' => 'Billing', 'edit-invoices' => 'Billing',
            'delete-invoices' => 'Billing', 'view-payments' => 'Billing', 'create-payments' => 'Billing',
            'edit-payments' => 'Billing', 'delete-payments' => 'Billing', 'process-refunds' => 'Billing',

            // Reports
            'view-reports' => 'Reports', 'export-reports' => 'Reports', 'generate-reports' => 'Reports',

            // System
            'manage-system' => 'System', 'manage-integrations' => 'System', 'manage-backups' => 'System',

            // Queue Management
            'manage-queues' => 'Queue Management', 'view-queue-stats' => 'Queue Management',

            // Laboratory
            'order-lab' => 'Laboratory', 'view-lab-results' => 'Laboratory',

            // Radiology
            'order-radiology' => 'Radiology', 'view-radiology-results' => 'Radiology',

            // Appointments
            'view-appointments' => 'Appointments', 'create-appointments' => 'Appointments',
            'edit-appointments' => 'Appointments', 'delete-appointments' => 'Appointments',

            // Referrals
            'view-referrals' => 'Referrals', 'create-referrals' => 'Referrals',
            'edit-referrals' => 'Referrals', 'approve-referrals' => 'Referrals',

            // Emergency
            'view-emergency-registrations' => 'Emergency', 'create-emergency-registrations' => 'Emergency',

            // Pharmacy
            'view-medicines' => 'Pharmacy', 'manage-medicines' => 'Pharmacy',
            'create-prescriptions' => 'Pharmacy', 'view-prescriptions' => 'Pharmacy',

            // Administrative
            'manage-roles' => 'Administrative', 'view-audit-logs' => 'Administrative',
            'manage-settings' => 'Administrative',
        ];

        return $groups[$permissionName] ?? 'Other';
    }

    /**
     * Get permission label
     */
    private function getPermissionLabel($permissionName)
    {
        $labels = [
            // User Management
            'view-users' => 'Lihat Pengguna', 'create-users' => 'Buat Pengguna',
            'edit-users' => 'Edit Pengguna', 'delete-users' => 'Hapus Pengguna',

            // Patient Management
            'view-patients' => 'Lihat Pasien', 'create-patients' => 'Buat Pasien',
            'edit-patients' => 'Edit Pasien', 'delete-patients' => 'Hapus Pasien',

            // Medical Records
            'view-cppt' => 'Lihat CPPT', 'create-cppt' => 'Buat CPPT',
            'edit-cppt' => 'Edit CPPT', 'delete-cppt' => 'Hapus CPPT',

            // Billing
            'view-invoices' => 'Lihat Invoice', 'create-invoices' => 'Buat Invoice',
            'edit-invoices' => 'Edit Invoice', 'delete-invoices' => 'Hapus Invoice',
            'view-payments' => 'Lihat Pembayaran', 'create-payments' => 'Buat Pembayaran',
            'edit-payments' => 'Edit Pembayaran', 'delete-payments' => 'Hapus Pembayaran',
            'process-refunds' => 'Proses Refund',

            // Reports
            'view-reports' => 'Lihat Laporan', 'export-reports' => 'Export Laporan',
            'generate-reports' => 'Hasilkan Laporan',

            // System
            'manage-system' => 'Kelola Sistem', 'manage-integrations' => 'Kelola Integrasi',
            'manage-backups' => 'Kelola Backup',

            // Queue Management
            'manage-queues' => 'Kelola Antrian', 'view-queue-stats' => 'Lihat Statistik Antrian',

            // Laboratory
            'order-lab' => 'Order Laboratorium', 'view-lab-results' => 'Lihat Hasil Lab',

            // Radiology
            'order-radiology' => 'Order Radiologi', 'view-radiology-results' => 'Lihat Hasil Radiologi',

            // Appointments
            'view-appointments' => 'Lihat Janji Temu', 'create-appointments' => 'Buat Janji Temu',
            'edit-appointments' => 'Edit Janji Temu', 'delete-appointments' => 'Hapus Janji Temu',

            // Referrals
            'view-referrals' => 'Lihat Rujukan', 'create-referrals' => 'Buat Rujukan',
            'edit-referrals' => 'Edit Rujukan', 'approve-referrals' => 'Approve Rujukan',

            // Emergency
            'view-emergency-registrations' => 'Lihat Registrasi Emergency',
            'create-emergency-registrations' => 'Buat Registrasi Emergency',

            // Pharmacy
            'view-medicines' => 'Lihat Obat', 'manage-medicines' => 'Kelola Obat',
            'create-prescriptions' => 'Buat Resep', 'view-prescriptions' => 'Lihat Resep',

            // Administrative
            'manage-roles' => 'Kelola Peran', 'view-audit-logs' => 'Lihat Audit Log',
            'manage-settings' => 'Kelola Setting',
        ];

        return $labels[$permissionName] ?? ucwords(str_replace('-', ' ', $permissionName));
    }

    /**
     * Get role label.
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
            'pasien' => 'Pasien',
        ];

        return $labels[$roleName] ?? ucfirst($roleName);
    }
}
