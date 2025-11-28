<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleGuard
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            // For API requests, return JSON response
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            // For web requests, redirect to login
            return redirect('/login');
        }

        $user = Auth::user();
        $userRole = $user->getRoleNames()->first();

        // Define role permissions mapping
        $rolePermissions = [
            'admin' => ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'laboratorium', 'radiologi', 'manajemenrs'],
            'pendaftaran' => ['pendaftaran'],
            'dokter' => ['dokter'],
            'perawat' => ['perawat'],
            'apoteker' => ['apoteker'],
            'kasir' => ['kasir'],
            'laboratorium' => ['laboratorium'],
            'radiologi' => ['radiologi'],
            'manajemenrs' => ['manajemenrs'],
        ];

        // Get allowed roles for current user
        $allowedRoles = $rolePermissions[$userRole] ?? [$userRole];

        $path = $request->path();
        $segments = explode('/', $path);

        // Check dashboard access (web routes)
        if (count($segments) >= 2 && $segments[0] === 'dashboard' && isset($segments[1])) {
            $requestedRole = $segments[1];

            // Define valid roles
            $validRoles = ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'laboratorium', 'radiologi', 'manajemenrs'];

            // Check if requested role is valid and user has access
            if (in_array($requestedRole, $validRoles) && !in_array($requestedRole, $allowedRoles)) {
                // User doesn't have access to this role's dashboard
                $correctDashboard = "/dashboard/{$userRole}";
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'error' => 'Access denied',
                        'message' => 'You do not have permission to access this dashboard',
                        'redirect' => $correctDashboard
                    ], 403);
                }
                return redirect($correctDashboard);
            }
        }

        // Check API access (api routes)
        if ($request->is('api/*')) {
            // Check role-specific API endpoints
            $apiRolePatterns = [
                'api/pendaftaran/*' => ['admin', 'pendaftaran'],
                'api/dokter/*' => ['admin', 'dokter'],
                'api/perawat/*' => ['admin', 'perawat'],
                'api/apoteker/*' => ['admin', 'apoteker'],
                'api/kasir/*' => ['admin', 'kasir'],
                'api/laboratorium/*' => ['admin', 'laboratorium'],
                'api/radiologi/*' => ['admin', 'radiologi'],
                'api/manajemenrs/*' => ['admin', 'manajemenrs'],
                'api/dashboard/*' => $allowedRoles, // Dashboard APIs
            ];

            foreach ($apiRolePatterns as $pattern => $allowedRolesForPattern) {
                if ($request->is($pattern)) {
                    if (!in_array($userRole, $allowedRolesForPattern)) {
                        return response()->json([
                            'error' => 'Access denied',
                            'message' => 'You do not have permission to access this API endpoint'
                        ], 403);
                    }
                    break; // Found matching pattern, no need to check others
                }
            }
        }

        return $next($request);
    }
}
