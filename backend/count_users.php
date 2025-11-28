<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    Illuminate\Foundation\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    Illuminate\Foundation\Exceptions\Handler::class
);

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $count = DB::table('users')->count();
    echo "Total users: " . $count . "\n";

    $users = DB::table('users')->select('id', 'name', 'email')->get();
    foreach ($users as $user) {
        echo "ID: {$user->id} - {$user->name} ({$user->email})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
