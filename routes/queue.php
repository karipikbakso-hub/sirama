<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegistrationController;

// QUEUE MANAGEMENT ENDPOINTS - COMPLETELY SEPARATE FROM API ROUTES
// These bypass ALL middleware including Sanctum, web, auth, etc.

Route::get('/queue-list', function() {
    return app(RegistrationController::class)->queueList(request());
});

Route::get('/queue', function() {
    return app(RegistrationController::class)->queueList(request());
});

Route::get('/queue/stats', function() {
    return app(RegistrationController::class)->getQueueStats(request());
});

Route::get('/queue/health', function() {
    return app(RegistrationController::class)->getQueueHealth(request());
});

Route::get('/health/database', function() {
    return app(RegistrationController::class)->checkDatabaseHealth(request());
});
