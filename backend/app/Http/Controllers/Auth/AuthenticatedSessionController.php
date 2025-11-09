<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): \Illuminate\Http\JsonResponse
    {
        // Ensure no existing authentication interferes
        Auth::logout();

        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();

        // ✅ Ambil role dari Spatie Permission
        $role = $user->getRoleNames()->first() ?? 'user';

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        // Logout current user
        Auth::guard('web')->logout();

        // Invalidate and regenerate session completely
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $request->session()->regenerate();

        // Clear any cached authentication data
        $request->session()->forget('login_web_' . sha1('Illuminate\Auth\SessionGuard'));

        return response()->noContent();
    }
}
