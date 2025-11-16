<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MobileJknController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Public API routes for Mobile JKN - Laravel 12 approach
Route::prefix('public')->group(function () {
    Route::get('mobile-jkn/statistics', [App\Http\Controllers\Api\MobileJknController::class, 'statistics']);
    Route::post('mobile-jkn/register', [App\Http\Controllers\Api\MobileJknController::class, 'register']);
    Route::post('mobile-jkn/verify-card', [App\Http\Controllers\Api\MobileJknController::class, 'verifyCard']);
    Route::post('mobile-jkn/generate-qr', [App\Http\Controllers\Api\MobileJknController::class, 'generateQR']);
    Route::get('mobile-jkn/activities', [App\Http\Controllers\Api\MobileJknController::class, 'getActivities']);
    Route::get('mobile-jkn/features', [App\Http\Controllers\Api\MobileJknController::class, 'getFeatures']);
    Route::patch('mobile-jkn/update-contact', [App\Http\Controllers\Api\MobileJknController::class, 'updateContact']);
})->withoutMiddleware([
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
]);

// Auth routes with /auth prefix for frontend consistency
Route::prefix('auth')->group(function () {
    require __DIR__.'/auth.php';
});
