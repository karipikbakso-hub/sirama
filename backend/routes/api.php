<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\SepController;
use App\Http\Controllers\Api\PatientHistoryController;
use App\Http\Controllers\Api\EmergencyRegistrationController;
use App\Http\Controllers\Api\QueueManagementController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\BpjsIntegrationController;
use App\Http\Controllers\Api\BpjsConfigurationController;
use App\Http\Controllers\Api\PatientCommunicationController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\Icd10DiagnosisController;
use App\Http\Controllers\Api\MobileJknController;

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// Public routes (no authentication required)
Route::get('appointments/statistics', [AppointmentController::class, 'statistics']);

// Authentication routes
Route::middleware('auth:sanctum')->get('/user', function () {
    $user = auth()->user();
    $role = $user->getRoleNames()->first() ?? 'user';

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $role, // ← pastikan sama
    ]);
});

// Protected API routes
Route::middleware('auth:sanctum')->group(function () {
    // Patient management routes
    Route::apiResource('patients', PatientController::class);
    Route::get('patients-search', [PatientController::class, 'search']);
    Route::get('patients/find-by-nik', [PatientController::class, 'findByNik']);
    Route::get('patients-statistics', [PatientController::class, 'statistics']);

    // Registration management routes
    Route::apiResource('registrations', RegistrationController::class);
    Route::patch('registrations/{registration}/status', [RegistrationController::class, 'updateStatus']);
    Route::post('queue/generate', [RegistrationController::class, 'generateQueue']);
    Route::get('registrations-statistics', [RegistrationController::class, 'statistics']);
    Route::get('queue-list', [RegistrationController::class, 'queueList']);

    // SEP management routes
    Route::apiResource('seps', SepController::class);
    Route::get('seps-statistics', [SepController::class, 'statistics']);

    // Patient History routes
    Route::apiResource('patient-histories', PatientHistoryController::class);
    Route::get('patient-histories/patient/{patientId}', [PatientHistoryController::class, 'byPatient']);
    Route::get('patient-histories/statistics', [PatientHistoryController::class, 'statistics']);

    // Emergency Registration routes
    Route::apiResource('emergency-registrations', EmergencyRegistrationController::class);
    Route::get('emergency-registrations/active', [EmergencyRegistrationController::class, 'active']);
    Route::get('emergency-registrations/today', [EmergencyRegistrationController::class, 'today']);
    Route::get('emergency-registrations/statistics', [EmergencyRegistrationController::class, 'statistics']);

    // Queue Management routes
    Route::apiResource('queue-managements', QueueManagementController::class);
    Route::get('queue-managements/active', [QueueManagementController::class, 'active']);
    Route::get('queue-managements/today', [QueueManagementController::class, 'today']);
    Route::post('queue-managements/{queueManagement}/call-next', [QueueManagementController::class, 'callNext']);
    Route::post('queue-managements/{queueManagement}/skip', [QueueManagementController::class, 'skip']);

    // Appointment routes
    Route::apiResource('appointments', AppointmentController::class);
    Route::get('appointments/today', [AppointmentController::class, 'today']);
    Route::get('appointments/upcoming', [AppointmentController::class, 'upcoming']);
    Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
    Route::post('appointments/{appointment}/confirm', [AppointmentController::class, 'confirm']);
    Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);

    // Referral routes
    Route::apiResource('referrals', ReferralController::class);
    Route::get('referrals/pending', [ReferralController::class, 'pending']);
    Route::get('referrals/emergency', [ReferralController::class, 'emergency']);
    Route::patch('referrals/{referral}/approve', [ReferralController::class, 'approve']);
    Route::patch('referrals/{referral}/reject', [ReferralController::class, 'reject']);
    Route::get('referrals/statistics', [ReferralController::class, 'statistics']);

    // BPJS Integration routes
    Route::apiResource('bpjs-integrations', BpjsIntegrationController::class);
    Route::get('bpjs-integrations/successful', [BpjsIntegrationController::class, 'successful']);
    Route::get('bpjs-integrations/failed', [BpjsIntegrationController::class, 'failed']);
    Route::get('bpjs-integrations/statistics', [BpjsIntegrationController::class, 'statistics']);

    // BPJS Configuration routes
    Route::apiResource('bpjs-configurations', BpjsConfigurationController::class);
    Route::get('bpjs-configurations/active', [BpjsConfigurationController::class, 'active']);

    // Patient Communication routes
    Route::apiResource('patient-communications', PatientCommunicationController::class);
    Route::get('patient-communications/sent', [PatientCommunicationController::class, 'sent']);
    Route::get('patient-communications/delivered', [PatientCommunicationController::class, 'delivered']);
    Route::get('patient-communications/statistics', [PatientCommunicationController::class, 'statistics']);

    // BPJS Integration routes
    Route::get('bpjs-integration', [BpjsIntegrationController::class, 'index']);
    Route::post('bpjs-integration/sync', [BpjsIntegrationController::class, 'sync']);
    Route::post('bpjs-integration/test-connection', [BpjsIntegrationController::class, 'testConnection']);
    Route::get('bpjs-integration/configuration', [BpjsIntegrationController::class, 'getConfiguration']);
    Route::post('bpjs-integration/configuration', [BpjsIntegrationController::class, 'updateConfiguration']);
    Route::get('bpjs-integration/logs', [BpjsIntegrationController::class, 'getLogs']);

    // Master Data routes
    Route::apiResource('doctors', DoctorController::class);
    Route::get('doctors-statistics', [DoctorController::class, 'statistics']);

    Route::apiResource('medicines', MedicineController::class);
    Route::get('medicines-statistics', [MedicineController::class, 'statistics']);
    Route::get('medicines/low-stock', [MedicineController::class, 'lowStock']);
    Route::get('medicines/by-category/{category}', [MedicineController::class, 'byCategory']);

    Route::apiResource('icd10-diagnoses', Icd10DiagnosisController::class);
    Route::get('icd10-diagnoses-statistics', [Icd10DiagnosisController::class, 'statistics']);
    Route::get('icd10-diagnoses/most-used', [Icd10DiagnosisController::class, 'mostUsed']);
    Route::get('icd10-diagnoses/recently-used', [Icd10DiagnosisController::class, 'recentlyUsed']);
    Route::get('icd10-diagnoses/by-chapter/{chapter}', [Icd10DiagnosisController::class, 'byChapter']);

    // Mobile JKN routes (temporarily without auth for testing)
    Route::get('mobile-jkn/statistics', [MobileJknController::class, 'statistics']);
    Route::post('mobile-jkn/register', [MobileJknController::class, 'register']);
    Route::post('mobile-jkn/verify-card', [MobileJknController::class, 'verifyCard']);
    Route::post('mobile-jkn/generate-qr', [MobileJknController::class, 'generateQR']);
    Route::get('mobile-jkn/activities', [MobileJknController::class, 'getActivities']);
    Route::get('mobile-jkn/features', [MobileJknController::class, 'getFeatures']);
    Route::patch('mobile-jkn/update-contact', [MobileJknController::class, 'updateContact']);
});

// Public Mobile JKN routes moved to web.php for testing (no CSRF)
