<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Clear any existing authentication
            Auth::logout();

            // Clear session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Authenticate user
            $request->authenticate();

            // Regenerate session for security
            $request->session()->regenerate();

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'message' => 'Authentication failed',
                    'error' => 'User not found'
                ], 401);
            }

            // IMPORTANT: FORCE FROM SPATIE ONLY - ignore any legacy 'role' column
            $role = $user->getRoleNames()->first() ?? 'user'; // Primary role (first one)
            $roles = $user->getRoleNames()->unique()->toArray(); // All unique roles array
            $permissions = $user->getAllPermissions()->pluck('name')->toArray();

            // Update last login tracking
            $user->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ]);

            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $role,
                'ip' => $request->ip(),
            ]);

            // Issue SANCTUM token for API authentication
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $role,
                        'roles' => $roles,
                        'permissions' => $permissions,
                    ],
                    'token' => $token,
                ],
                'message' => 'Login successful'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'email' => $request->email,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 401);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        try {
            $user = Auth::user();

            if ($user) {
                Log::info('User logged out', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }

            // Logout from web guard
            Auth::guard('web')->logout();

            // Invalidate and regenerate session completely
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Logged out successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Logout failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
