<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MobileJknController;

// Public API routes - NO AUTHENTICATION REQUIRED
// These routes completely bypass all middleware including CSRF protection

Route::prefix('mobile-jkn')->group(function () {
    Route::get('statistics', [MobileJknController::class, 'statistics']);
    Route::post('register', [MobileJknController::class, 'register']);
    Route::post('verify-card', [MobileJknController::class, 'verifyCard']);
    Route::post('generate-qr', [MobileJknController::class, 'generateQR']);
    Route::get('activities', [MobileJknController::class, 'getActivities']);
    Route::get('features', [MobileJknController::class, 'getFeatures']);
    Route::patch('update-contact', [MobileJknController::class, 'updateContact']);
});
