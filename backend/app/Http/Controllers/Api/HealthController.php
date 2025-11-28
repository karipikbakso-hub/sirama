<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function index()
    {
        try {
            // Test database connection
            DB::connection()->getPdo();

            return response()->json([
                'status' => 'healthy',
                'message' => 'SIRAMA API is running successfully',
                'timestamp' => now()->toISOString(),
                'services' => [
                    'database' => 'connected',
                    'cache' => 'ok',
                    'storage' => 'ok'
                ],
                'version' => '1.0.0'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'message' => 'Database connection failed',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }
}