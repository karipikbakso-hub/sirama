<?php

// Simple test for roles count by guard
require_once 'vendor/autoload.php';

use Spatie\Permission\Models\Role;

echo "🔍 Checking roles by guard:\n";
echo "Web guard roles: " . Role::where('guard_name', 'web')->count() . "\n";
echo "API guard roles: " . Role::where('guard_name', 'api')->count() . "\n";

echo "\n📋 Web roles names: " . Role::where('guard_name', 'web')->pluck('name')->implode(', ') . "\n";
echo "📋 API roles names: " . Role::where('guard_name', 'api')->pluck('name')->implode(', ') . "\n";

require_once __DIR__.'/bootstrap/app.php';

echo "=== ROLES IN DATABASE ===\n";
$roles = \Spatie\Permission\Models\Role::all();
echo "Roles count: " . $roles->count() . "\n";
foreach($roles as $role) {
    echo "- {$role->name} (guard: {$role->guard_name})\n";
}

echo "\n=== PERMISSIONS IN DATABASE ===\n";
$permissions = \Spatie\Permission\Models\Permission::all();
echo "Permissions count: " . $permissions->count() . "\n";
foreach($permissions as $perm) {
    echo "- {$perm->name} (guard: {$perm->guard_name})\n";
}

echo "\n=== USERS COUNT ===\n";
$usersCount = \App\Models\User::count();
echo "Total users: {$usersCount}\n";

echo "\n=== SPATIE CONFIGURATION ===\n";
$guards = config('auth.guards');
if (isset($guards['api'])) {
    echo "✅ API guard exists\n";
    echo "Driver: {$guards['api']['driver']}\n";
    echo "Provider: {$guards['api']['provider']}\n";
} else {
    echo "❌ API guard NOT found!\n";
}

$models = [
    'roles' => 'model_has_roles',
    'permissions' => 'model_has_permissions'
];

echo "\n=== TABLE CHECKS ===\n";
try {
    $pdo = \DB::connection()->getPdo();
    foreach ($models as $name => $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Table {$table} exists\n";
        } else {
            echo "❌ Table {$table} MISSING!\n";
        }
    }
} catch (\Exception $e) {
    echo "❌ Database connection error: " . $e->getMessage() . "\n";
}
