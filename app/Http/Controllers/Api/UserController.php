<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Format user data for API responses.
     */
    private function formatUserData(User $user)
    {
        $user->load('roles');
        $userRoles = $user->roles->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $this->getRoleLabel($role->name),
                'slug' => $role->name
            ];
        });

        return [
            'id' => (string) $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'fullName' => $user->name,
            'nip' => $user->nip,
            'phone' => $user->phone,
            'roles' => $userRoles,
            'status' => $user->is_active ? 'active' : 'inactive', // Map for table display
            'isActive' => $user->is_active,
            'lastLoginAt' => $user->last_login_at ? $user->last_login_at->toISOString() : null,
            'createdAt' => $user->created_at->toISOString(),
            'updatedAt' => $user->updated_at->toISOString(),
        ];
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        try {
            $query = User::with('roles'); // Load roles relationship

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('username', 'LIKE', "%{$search}%");
                });
            }

            // Role filter using Spatie relationship - MUST specify guard to match roles
            if ($request->has('role') && $request->role !== 'all') {
                Log::info('🔍 Role filter activated:', [
                    'requested_role' => $request->role,
                    'guard_name' => 'web'
                ]);

                $query->whereHas('roles', function($q) use ($request) {
                    $q->where('name', $request->role)
                      ->where('guard_name', 'web'); // Match roles guard with User model
                });
            }

            // Status filter using is_active column
            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'active') {
                    $query->where('is_active', true);
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Transform data for frontend
            $users->getCollection()->transform(function ($user) {
                $userRoles = $user->roles->map(function($role) {
                    return [
                        'id' => $role->id,
                        'name' => $this->getRoleLabel($role->name),
                        'slug' => $role->name
                    ];
                });

                return [
                    'id' => (string) $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'fullName' => $user->name, // Map name to fullName for frontend
                    'nip' => $user->nip,
                    'phone' => $user->phone,
                    'roles' => $userRoles,
                    'status' => $user->is_active ? 'active' : 'inactive', // Map for table display
                    'isActive' => $user->is_active,
                    'lastLoginAt' => $user->last_login_at ? $user->last_login_at->toISOString() : null,
                    'createdAt' => $user->created_at->toISOString(),
                    'updatedAt' => $user->updated_at->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $users->items(),
                    'meta' => [
                        'current_page' => $users->currentPage(),
                        'per_page' => $users->perPage(),
                        'total' => $users->total(),
                        'last_page' => $users->lastPage(),
                        'from' => $users->firstItem(),
                        'to' => $users->lastItem(),
                    ]
                ],
                'message' => 'Users retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:255|unique:users,username',
                'email' => 'required|string|email|max:255|unique:users,email',
                'fullName' => 'required|string|max:255', // Map from frontend fullName
                'password' => 'required|string|min:8',
                'password_confirmation' => 'required|string|same:password',
                'nip' => 'nullable|string|size:18',
                'phone' => 'nullable|string|regex:/^08\d{8,11}$/',
                'roleIds' => 'required|array|min:1',
                'roleIds.*' => 'exists:roles,id',
                'isActive' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $user = User::create([
                'username' => $request->username,
                'name' => $request->fullName, // Map fullName to name column
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nip' => $request->nip,
                'phone' => $request->phone,
                'is_active' => $request->isActive ?? true, // Default to active
                'email_verified_at' => now(), // Auto verify for admin created users
            ]);

            // Get role names from role IDs and assign using Spatie
            $roles = Role::whereIn('id', $request->roleIds)->get();
            $user->syncRoles($roles);

            // Log user creation
            $this->logUserAction('create', $user->id, 'User created', [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_roles' => $roles->pluck('name')->toArray()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $this->formatUserData($user),
                'message' => 'User created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->email_verified_at ? 'active' : 'inactive',
                    'last_login' => $user->last_login_at,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ],
                'message' => 'User retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:255|unique:users,username,' . $user->id,
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                'fullName' => 'required|string|max:255',
                'nip' => 'nullable|string|size:18',
                'phone' => 'nullable|string|regex:/^08\d{8,11}$/',
                'roleIds' => 'required|array|min:1',
                'roleIds.*' => 'exists:roles,id',
                'isActive' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $oldRoles = $user->roles->pluck('name')->toArray();
            $oldData = [
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
                'nip' => $user->nip,
                'phone' => $user->phone,
                'roles' => $oldRoles,
                'is_active' => $user->is_active
            ];

            $user->update([
                'username' => $request->username,
                'name' => $request->fullName,
                'email' => $request->email,
                'nip' => $request->nip,
                'phone' => $request->phone,
                // Keep existing is_active if not provided (don't change user status just by editing details)
                'is_active' => $request->has('isActive') ? $request->isActive : $user->is_active,
            ]);

            // Update roles using Spatie
            $roles = Role::whereIn('id', $request->roleIds)->get();
            $user->syncRoles($roles);

            $newRoles = $roles->pluck('name')->toArray();
            $newData = [
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
                'nip' => $user->nip,
                'phone' => $user->phone,
                'roles' => $newRoles,
                'is_active' => $user->is_active
            ];

            // Log user update
            $this->logUserAction('update', $user->id, 'User updated', [
                'old_data' => $oldData,
                'new_data' => $newData
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $this->formatUserData($user),
                'message' => 'User updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        try {
            Log::info('🗑️ Starting user deletion process:', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'auth_user_id' => auth()->id(),
                'is_deleting_own_account' => auth()->check() && auth()->id() === $user->id
            ]);

            // Prevent deletion of the current authenticated user
            if (auth()->check() && auth()->id() === $user->id) {
                Log::warning('⛔ Attempted to delete own account:', [
                    'user_id' => $user->id,
                    'user_name' => $user->name
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete your own account'
                ], 403);
            }

            Log::info('📊 Checking user relationships before deletion...');

            // Check if user has related records that might prevent deletion
            $hasRoles = $user->roles()->count();
            $hasModelHasRoles = DB::table('model_has_roles')->where('model_id', $user->id)->count();

            Log::info('📋 User relationship status:', [
                'has_roles' => $hasRoles,
                'model_has_roles_records' => $hasModelHasRoles,
                'user_id' => $user->id
            ]);

            DB::beginTransaction();
            Log::info('🔄 Transaction started for user deletion');

            $userData = [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'has_roles_relationships' => $hasRoles
            ];

            // Log user deletion
            $this->logUserAction('delete', $user->id, 'User deleted', $userData);

            try {
                Log::info('🎯 Attempting to delete user record');
                $deleteResult = $user->delete();
                Log::info('✅ User delete result:', ['result' => $deleteResult]);
            } catch (\Exception $deleteException) {
                Log::error('❌ User delete failed in transaction:', [
                    'error' => $deleteException->getMessage(),
                    'user_id' => $user->id
                ]);
                throw $deleteException;
            }

            Log::info('🔄 Committing transaction');
            DB::commit();
            Log::info('✅ Transaction committed successfully');

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('🚨 Error deleting user - ROLLING BACK:', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString()
            ]);

            DB::rollBack();

            Log::error('❌ Transaction rolled back due to error');

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        try {
            $validator = Validator::make($request->all(), [
                'password' => 'required|string|min:8',
                'password_confirmation' => 'required|string|same:password',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Prevent resetting password for inactive users
            if (!$user->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot reset password for inactive users'
                ], 422);
            }

            DB::beginTransaction();

            $user->update([
                'password' => Hash::make($request->password),
            ]);

            // Log password reset
            $this->logUserAction('password_reset', $user->id, 'Password reset', [
                'user_name' => $user->name,
                'user_email' => $user->email
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error resetting password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(Request $request, User $user)
    {
        try {
            // Prevent admin from deactivating themselves
            if (auth()->check() && auth()->id() === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot deactivate your own account'
                ], 403);
            }

            $newStatus = !$user->is_active;

            DB::beginTransaction();

            $user->update([
                'is_active' => $newStatus,
            ]);

            // Log status change
            $this->logUserAction($newStatus ? 'activate' : 'deactivate', $user->id,
                'User ' . ($newStatus ? 'activated' : 'deactivated'), [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'new_status' => $newStatus
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $this->formatUserData($user),
                'message' => 'User ' . ($newStatus ? 'activated' : 'deactivated') . ' successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error toggling user status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle user status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk actions for multiple users.
     */
    public function bulkAction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:activate,deactivate,delete',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $action = $request->action;
        $userIds = $request->user_ids;

        try {
            DB::beginTransaction();

            $users = User::whereIn('id', $userIds)->get();
            $processed = 0;
            $skipped = [];

            foreach ($users as $user) {
                // Skip current user for critical actions
                if (auth()->check() && auth()->id() == $user->id &&
                    in_array($action, ['deactivate', 'delete'])) {
                    $skipped[] = $user->name;
                    continue;
                }

                if ($action === 'activate' && !$user->is_active) {
                    $user->update(['is_active' => true]);
                    $processed++;
                } elseif ($action === 'deactivate' && $user->is_active) {
                    $user->update(['is_active' => false]);
                    $processed++;
                } elseif ($action === 'delete') {
                    $user->delete();
                    $processed++;
                }
            }

            // Log bulk action
            $this->logUserAction('bulk_' . $action, 0, "Bulk $action: $processed users processed",
                ['user_ids' => $userIds, 'processed' => $processed, 'skipped' => $skipped]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'processed' => $processed,
                    'skipped' => $skipped,
                    'total_requested' => count($userIds)
                ],
                'message' => "Bulk action completed: $processed users $action" . (count($skipped) > 0 ? ', ' . count($skipped) . ' skipped' : '')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error performing bulk action: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk action',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics.
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'role_distribution' => DB::table('model_has_roles')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->select('roles.name', DB::raw('count(*) as count'))
                    ->groupBy('roles.name')
                    ->get()
                    ->map(function($item) {
                        return [
                            'role' => $item->name,
                            'count' => $item->count,
                            'label' => $this->getRoleLabel($item->name)
                        ];
                    }),
                'recent_registrations' => User::where('created_at', '>=', now()->subDays(7))
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'User statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all available roles.
     */
    public function getRoles()
    {
        try {
            // Use 'web' guard to match User model guard_name
            $roles = Role::where('guard_name', 'web')
                ->orderBy('name')
                ->get()
                ->map(function($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'label' => $this->getRoleLabel($role->name),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $roles,
                'message' => 'Roles retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching roles: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get role label.
     */
    private function getRoleLabel($role)
    {
        $labels = [
            'admin' => 'Administrator',
            'dokter' => 'Dokter',
            'perawat' => 'Perawat',
            'kasir' => 'Kasir',
            'apoteker' => 'Apoteker',
            'pendaftaran' => 'Pendaftaran',
        ];

        return $labels[$role] ?? ucfirst($role);
    }

    /**
     * Log user action to audit logs.
     */
    private function logUserAction($action, $userId, $description, $data = [])
    {
        try {
            DB::table('audit_logs')->insert([
                'user_name' => auth()->user()->name ?? 'System',
                'action' => $action,
                'resource_type' => 'user',
                'description' => $description,
                'old_values' => json_encode($data['old_data'] ?? []),
                'new_values' => json_encode($data['new_data'] ?? $data),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Log to Laravel log if audit logging fails
            Log::warning('Failed to log user action: ' . $e->getMessage());
        }
    }
}
