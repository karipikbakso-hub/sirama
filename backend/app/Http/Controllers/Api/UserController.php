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

class UserController extends Controller
{
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
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Role filter using Spatie relationship
            if ($request->has('role') && $request->role !== 'all') {
                $query->whereHas('roles', function($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }

            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                if ($request->status === 'active') {
                    $query->whereNotNull('email_verified_at');
                } elseif ($request->status === 'inactive') {
                    $query->whereNull('email_verified_at');
                }
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Transform data for frontend
            $users->getCollection()->transform(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->roles->first()?->name ?? 'No Role',
                    'status' => $user->email_verified_at ? 'active' : 'inactive',
                    'last_login' => $user->last_login_at,
                    'created_at' => $user->created_at->format('Y-m-d'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $users,
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
            // Validate role exists in database
            $roleNames = Role::where('guard_name', 'web')->pluck('name')->toArray();
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role' => 'required|string|in:' . implode(',', $roleNames),
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
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(), // Auto verify for admin created users
            ]);

            // Assign role using Spatie
            $user->assignRole($request->role);

            // Log user creation
            $this->logUserAction('create', $user->id, 'User created', [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_role' => $request->role
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $request->role,
                    'status' => 'active',
                    'created_at' => $user->created_at->format('Y-m-d'),
                ],
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
            // Validate role exists in database
            $roleNames = Role::where('guard_name', 'web')->pluck('name')->toArray();
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                'role' => 'required|string|in:' . implode(',', $roleNames),
                'status' => 'sometimes|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $oldRole = $user->roles->first()?->name ?? 'No Role';
            $oldData = [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $oldRole,
                'status' => $user->email_verified_at ? 'active' : 'inactive'
            ];

            $user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            // Update role using Spatie
            if ($request->role !== $oldRole) {
                $user->syncRoles([$request->role]);
            }

            // Handle status update
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $user->email_verified_at = now();
                } else {
                    $user->email_verified_at = null;
                }
                $user->save();
            }

            $newRole = $user->roles->first()?->name ?? 'No Role';
            $newData = [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $newRole,
                'status' => $user->email_verified_at ? 'active' : 'inactive'
            ];

            // Log user update
            $this->logUserAction('update', $user->id, 'User updated', [
                'old_data' => $oldData,
                'new_data' => $newData
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $newRole,
                    'status' => $user->email_verified_at ? 'active' : 'inactive',
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ],
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
            // Prevent deletion of the current authenticated user
            if (auth()->check() && auth()->id() === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete your own account'
                ], 403);
            }

            DB::beginTransaction();

            $userData = [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_role' => $user->role
            ];

            // Log user deletion
            $this->logUserAction('delete', $user->id, 'User deleted', $userData);

            $user->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting user: ' . $e->getMessage());
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
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
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
     * Get user statistics.
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::whereNotNull('email_verified_at')->count(),
                'inactive_users' => User::whereNull('email_verified_at')->count(),
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
