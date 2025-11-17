<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Test database connection
    $auditCount = \App\Models\AuditLog::count();
    echo "Total audit logs: $auditCount\n";

    // Test statistics
    $stats = [
        'total_logs' => \App\Models\AuditLog::count(),
        'today_logs' => \App\Models\AuditLog::whereDate('created_at', today())->count(),
        'week_logs' => \App\Models\AuditLog::where('created_at', '>=', now()->startOfWeek())->count(),
        'month_logs' => \App\Models\AuditLog::where('created_at', '>=', now()->startOfMonth())->count(),
    ];

    echo "Statistics: " . json_encode($stats, JSON_PRETTY_PRINT) . "\n";

    // Test API controller directly
    $controller = new \App\Http\Controllers\Api\AuditController();
    $response = $controller->getStatistics();
    $content = $response->getContent();
    echo "API Response: $content\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}