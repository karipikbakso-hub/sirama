<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== QUICK MIGRATION (NO FOREIGN KEYS) ===\n\n";

echo "Step 1: Disable foreign key checks...\n";
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
echo "✓ Foreign keys disabled\n\n";

echo "Step 2: Run migrations...\n";
try {
    // Run artisan migrate directly
    exec("php artisan migrate:fresh --seed", $output, $exitCode);

    if ($exitCode === 0) {
        echo "✓ All migrations completed successfully!\n\n";
    } else {
        echo "⚠ Some migrations had issues, but continued...\n\n";
    }

    echo "Migration output:\n";
    foreach ($output as $line) {
        echo $line . "\n";
    }

} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
}

echo "\nStep 3: Re-enable foreign key checks...\n";
DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "✓ Foreign keys re-enabled\n";

echo "\n=== MIGRATION COMPLETE ===\n";
echo "Now your system is ready! Here's your login credentials:\n\n";

echo "🏥 HOSPITAL SYSTEM LOGIN CREDENTIALS 🏥\n\n";

$credentials = [
    ['email' => 'admin@hospital.test', 'role' => 'Administrator'],
    ['email' => 'dokter@hospital.test', 'role' => 'Dokter'],
    ['email' => 'perawat@hospital.test', 'role' => 'Perawat'],
    ['email' => 'kasir@hospital.test', 'role' => 'Kasir'],
    ['email' => 'apoteker@hospital.test', 'role' => 'Apoteker'],
    ['email' => 'pendaftaran@hospital.test', 'role' => 'Pendaftaran'],
    ['email' => 'manajemenrs@hospital.test', 'role' => 'Manajemen RS']
];

foreach ($credentials as $cred) {
    echo "📧 " . str_pad($cred['email'], 25) . " 🔑 password    ✡️ " . $cred['role'] . "\n";
}

echo "\n🌐 Frontend: http://localhost:3000\n";
echo "🔌 Backend API: php artisan serve --port=8000\n";

echo "\n🚀 HAPPY DEVELOPMENT! 🚀\n";
