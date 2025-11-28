<?php

echo "=== TESTING ROLE-BASED ACCESS CONTROL ===\n";

// Load Laravel
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Test 1: Check if admin user exists
    $admin = \App\Models\User::where('username', 'admin')->first();
    if ($admin) {
        echo "✅ Admin user found: " . $admin->username . "\n";
        echo "   Role: " . $admin->getRoleNames()->first() . "\n";
    } else {
        echo "❌ Admin user not found\n";
    }

    // Test 2: Check if roles exist
    $roles = \Spatie\Permission\Models\Role::all();
    echo "✅ Available roles: " . $roles->pluck('name')->join(', ') . "\n";

    // Test 3: Check middleware exists
    $middlewareExists = class_exists('\App\Http\Middleware\RoleGuard');
    echo ($middlewareExists ? '✅' : '❌') . ' RoleGuard middleware exists' . "\n";

    // Test 4: Test middleware logic
    $middleware = new \App\Http\Middleware\RoleGuard();

    // Mock request for admin dashboard
    $request = new \Illuminate\Http\Request();
    $request->server->set('REQUEST_URI', '/dashboard/admin');
    $request->server->set('REQUEST_METHOD', 'GET');

    // Mock authenticated admin user
    if ($admin) {
        \Illuminate\Support\Facades\Auth::login($admin);
        echo "✅ Admin user authenticated for testing\n";

        // Test dashboard access
        $response = $middleware->handle($request, function($req) {
            return response('OK');
        });

        if ($response->getStatusCode() === 200) {
            echo "✅ Admin can access admin dashboard\n";
        } else {
            echo "❌ Admin blocked from admin dashboard\n";
        }
    }

    echo "\n=== TEST COMPLETE ===\n";

} catch (Exception $e) {
    echo '❌ Error: ' . $e->getMessage() . "\n";
    echo 'Stack trace: ' . $e->getTraceAsString() . "\n";
}