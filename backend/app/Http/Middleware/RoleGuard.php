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

        // Extract role from URL path (e.g., /dashboard/admin -> admin)
        $path = $request->path();
        $segments = explode('/', $path);

        // Check if URL contains a role parameter (dashboard/[role] pattern)
        if (count($segments) >= 2 && $segments[0] === 'dashboard' && isset($segments[1])) {
            $urlRole = $segments[1];

            // Define valid roles
            $validRoles = ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs'];

            // Check if URL role is valid and matches user's role
            if (in_array($urlRole, $validRoles) && $urlRole !== $userRole) {
                // Redirect to user's correct dashboard
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'error' => 'Access denied',
                        'redirect' => "/dashboard/{$userRole}"
                    ], 403);
                }
                return redirect("/dashboard/{$userRole}");
            }
        }

        return $next($request);
    }
}
