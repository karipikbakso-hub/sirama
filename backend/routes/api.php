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
use App\Http\Controllers\Api\DoctorModuleController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\Icd10DiagnosisController;
use App\Http\Controllers\Api\MobileJknController;
use App\Http\Controllers\Api\RolesController;
use App\Http\Controllers\Api\DashboardHomeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\ErrorMonitoringController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\PengaturanSistemController;

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// Public routes (no authentication required)
Route::get('appointments/statistics', [AppointmentController::class, 'statistics']);
Route::get('patients-search', [PatientController::class, 'search']); // Make patient search public for autocomplete

// Protected API routes
Route::middleware(['web'])->group(function () {
    // Authentication routes
    Route::middleware(['auth:sanctum'])->get('/user', function () {
        $user = auth()->user();

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    });

    // Patient management routes - Pendaftaran & Admin
    Route::middleware(['permission:view patients'])->group(function () {
        Route::get('patients', [PatientController::class, 'index']);
        Route::get('patients/{patient}', [PatientController::class, 'show']);
        Route::get('patients/find-by-nik', [PatientController::class, 'findByNik']);
        Route::get('patients-statistics', [PatientController::class, 'statistics']);
    });

    Route::middleware(['permission:create patients'])->post('patients', [PatientController::class, 'store']);
    Route::middleware(['permission:edit patients'])->put('patients/{patient}', [PatientController::class, 'update']);
    Route::middleware(['permission:delete patients'])->delete('patients/{patient}', [PatientController::class, 'destroy']);

    // Registration management routes - Pendaftaran & Admin
    Route::middleware(['permission:view registrations'])->group(function () {
        Route::get('registrations', [RegistrationController::class, 'index']);
        Route::get('registrations/{registration}', [RegistrationController::class, 'show']);
        Route::get('registrations-statistics', [RegistrationController::class, 'statistics']);
        Route::get('queue-list', [RegistrationController::class, 'queueList']);
        Route::get('queue', [RegistrationController::class, 'queueList']);
    });

    Route::middleware(['permission:create registrations'])->post('registrations', [RegistrationController::class, 'store']);
    Route::middleware(['permission:edit registrations'])->group(function () {
        Route::put('registrations/{registration}', [RegistrationController::class, 'update']);
        Route::patch('registrations/{registration}/status', [RegistrationController::class, 'updateStatus']);
    });
    Route::middleware(['permission:delete registrations'])->delete('registrations/{registration}', [RegistrationController::class, 'destroy']);
    Route::middleware(['permission:manage queues'])->post('queue/generate', [RegistrationController::class, 'generateQueue']);

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

    // API Integration routes for admin panel
    Route::middleware(['permission:manage-integrations'])->group(function () {
        Route::get('integrations/configurations', [App\Http\Controllers\Api\IntegrationController::class, 'getConfigurations']);
        Route::put('integrations/bpjs', [App\Http\Controllers\Api\IntegrationController::class, 'updateBpjsConfiguration']);
        Route::put('integrations/satusehat', [App\Http\Controllers\Api\IntegrationController::class, 'updateSatusehatConfiguration']);
        Route::post('integrations/bpjs/test-connection', [App\Http\Controllers\Api\IntegrationController::class, 'testBpjsConnection']);
        Route::post('integrations/satusehat/test-connection', [App\Http\Controllers\Api\IntegrationController::class, 'testSatusehatConnection']);
        Route::post('integrations/bpjs/rotate-key', [App\Http\Controllers\Api\IntegrationController::class, 'rotateBpjsKey']);
        Route::post('integrations/satusehat/rotate-key', [App\Http\Controllers\Api\IntegrationController::class, 'rotateSatusehatKey']);
        Route::get('integrations/logs', [App\Http\Controllers\Api\IntegrationController::class, 'getLogs']);
        Route::get('integrations/statistics', [App\Http\Controllers\Api\IntegrationController::class, 'getStatistics']);
    });

    // Legacy BPJS Integration routes
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

    // Doctor Module routes
    Route::prefix('doctor')->group(function () {
        // EMR routes
        Route::get('emr/{patientId}', [DoctorModuleController::class, 'getPatientEmr']);

        // CPPT routes
        Route::get('cppt/{patientId}', [DoctorModuleController::class, 'getCpptEntries']);
        Route::post('cppt', [DoctorModuleController::class, 'createCpptEntry']);

        // Diagnosis routes
        Route::get('diagnoses', [DoctorModuleController::class, 'getIcd10Diagnoses']);

        // Prescription routes
        Route::get('prescriptions/{patientId}', [DoctorModuleController::class, 'getPrescriptions']);
        Route::post('prescriptions', [DoctorModuleController::class, 'createPrescription']);

        // Lab Order routes
        Route::get('lab-orders/{patientId}', [DoctorModuleController::class, 'getLabOrders']);
        Route::post('lab-orders', [DoctorModuleController::class, 'createLabOrder']);

        // Radiology Order routes
        Route::get('radiology-orders/{patientId}', [DoctorModuleController::class, 'getRadiologyOrders']);
        Route::post('radiology-orders', [DoctorModuleController::class, 'createRadiologyOrder']);
    });

    // Mobile JKN routes (temporarily without auth for testing)
    Route::get('mobile-jkn/statistics', [MobileJknController::class, 'statistics']);
    Route::post('mobile-jkn/register', [MobileJknController::class, 'register']);
    Route::post('mobile-jkn/verify-card', [MobileJknController::class, 'verifyCard']);
    Route::post('mobile-jkn/generate-qr', [MobileJknController::class, 'generateQR']);
    Route::get('mobile-jkn/activities', [MobileJknController::class, 'getActivities']);
    Route::get('mobile-jkn/features', [MobileJknController::class, 'getFeatures']);
    Route::patch('mobile-jkn/update-contact', [MobileJknController::class, 'updateContact']);

    // Roles and Permissions routes
    Route::get('roles', [RolesController::class, 'index']);
    Route::get('permissions', [RolesController::class, 'getPermissions']);
    Route::get('role-permissions', [RolesController::class, 'index']);
    Route::post('role-permissions', [RolesController::class, 'store']);
    Route::get('role-permissions/{id}', [RolesController::class, 'show']);
    Route::put('role-permissions/{id}', [RolesController::class, 'update']);
    Route::delete('role-permissions/{id}', [RolesController::class, 'destroy']);
    Route::put('role-permissions/{id}/permissions', [RolesController::class, 'updatePermissions']);
    Route::post('role-permissions/{id}/clone', [RolesController::class, 'clone']);
    Route::get('role-permissions/{id}/users', [RolesController::class, 'getUsers']);

    // User management routes (SIRAMA Admin) - TEMP: Remove middleware for testing
    // Route::middleware(['permission:manage-users'])->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);

        // Special user operations
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

        // Bulk operations
        Route::post('users/bulk-action', [UserController::class, 'bulkAction']);
    // });

    // User read-only routes (for other roles) - TEMP: Remove middleware for testing
    // Route::middleware(['permission:view-users'])->group(function () {
    //     Route::get('users', [UserController::class, 'index']);
    //     Route::get('users/{user}', [UserController::class, 'show']);
    // });

    // Public user routes
    Route::get('user/roles', [UserController::class, 'getRoles']);
    Route::get('users/statistics', [UserController::class, 'statistics']);
    Route::get('users-statistics', [UserController::class, 'statistics']); // Alternative route format

    // Dashboard Home routes
    Route::get('dashboard/home', [DashboardHomeController::class, 'index']);

    // Audit Logs routes - Admin only
    // Route::middleware(['permission:view audit logs'])->group(function () {
        Route::get('audit/logs', [AuditController::class, 'index']);
        Route::get('audit/logs/{id}', [AuditController::class, 'show']);
        Route::get('audit/statistics', [AuditController::class, 'getStatistics']);
        Route::get('audit/users', [AuditController::class, 'getUsers']);
        Route::get('audit/modules', [AuditController::class, 'getModules']);
    // });

    // Route::middleware(['permission:manage system'])->group(function () {
        Route::delete('audit/logs/cleanup', [AuditController::class, 'deleteOldLogs']);
        Route::get('audit/export', [AuditController::class, 'export']);
    // });

    // Error Monitoring routes - Admin only
    // Route::middleware(['permission:manage system'])->group(function () {
        // System Logs routes
        Route::get('error-monitoring/system-logs', [ErrorMonitoringController::class, 'getSystemLogs']);
        Route::get('error-monitoring/system-logs/{log}', [ErrorMonitoringController::class, 'getSystemLog']);
        Route::put('error-monitoring/system-logs/{log}/resolve', [ErrorMonitoringController::class, 'resolveSystemLog']);
        Route::post('error-monitoring/system-logs/bulk-resolve', [ErrorMonitoringController::class, 'bulkResolveSystemLogs']);
        Route::delete('error-monitoring/system-logs/cleanup', [ErrorMonitoringController::class, 'cleanupSystemLogs']);
        Route::get('error-monitoring/system-logs/export', [ErrorMonitoringController::class, 'exportSystemLogs']);

        // Failed Jobs routes
        Route::get('error-monitoring/failed-jobs', [ErrorMonitoringController::class, 'getFailedJobs']);
        Route::post('error-monitoring/failed-jobs/{jobId}/retry', [ErrorMonitoringController::class, 'retryFailedJob']);
        Route::delete('error-monitoring/failed-jobs/{jobId}', [ErrorMonitoringController::class, 'deleteFailedJob']);
        Route::post('error-monitoring/failed-jobs/bulk-delete', [ErrorMonitoringController::class, 'bulkDeleteFailedJobs']);
        Route::delete('error-monitoring/failed-jobs/clear', [ErrorMonitoringController::class, 'clearFailedJobs']);

        // Statistics route
        Route::get('error-monitoring/statistics', [ErrorMonitoringController::class, 'getStatistics']);
    // });

    // Backup & Recovery routes - Admin only
    Route::middleware(['permission:manage-backups'])->group(function () {
        // Schedule management
        Route::get('backups/schedules', [BackupController::class, 'getSchedules']);
        Route::post('backups/schedules', [BackupController::class, 'createSchedule']);
        Route::put('backups/schedules/{schedule}', [BackupController::class, 'updateSchedule']);
        Route::delete('backups/schedules/{schedule}', [BackupController::class, 'deleteSchedule']);

        // Manual backup
        Route::post('backups/manual', [BackupController::class, 'createManualBackup']);

        // History and statistics
        Route::get('backups/histories', [BackupController::class, 'getHistories']);
        Route::get('backups/statistics', [BackupController::class, 'getStatistics']);

        // Restore operations
        Route::post('backups/restore/{history}', [BackupController::class, 'restoreBackup']);

        // Download operations
        Route::get('backups/download/{history}', [BackupController::class, 'downloadBackup']);
        Route::delete('backups/{history}', [BackupController::class, 'deleteBackup']);
    });

    // System Configuration routes - Admin only
    // Route::middleware(['permission:manage system'])->group(function () {
        // Main configuration endpoints
        Route::get('system-configurations', [PengaturanSistemController::class, 'index']);
        Route::get('system-configurations/groups', [PengaturanSistemController::class, 'getKategori']);
        Route::get('system-configurations/groups/{kategori}', [PengaturanSistemController::class, 'getByKategori']);
        Route::put('system-configurations', [PengaturanSistemController::class, 'updateMultiple']);

        // System management
        Route::get('system-configurations/info', [PengaturanSistemController::class, 'getSystemInfo']);
        Route::post('system-configurations/reload', [PengaturanSistemController::class, 'reloadSystem']);

        // History and rollback
        Route::get('system-configurations/history', [PengaturanSistemController::class, 'getHistory']);
        Route::post('system-configurations/rollback/{historyId}', [PengaturanSistemController::class, 'rollback']);

        // Import/Export
        Route::get('system-configurations/export', [PengaturanSistemController::class, 'export']);
        Route::post('system-configurations/import', [PengaturanSistemController::class, 'import']);

        // Super admin only endpoints
        Route::get('system-configurations/env', [PengaturanSistemController::class, 'getEnvValues']);
        Route::put('system-configurations/env', [PengaturanSistemController::class, 'updateEnv']);
    // });
});

// Public Mobile JKN routes moved to web.php for testing (no CSRF)

Route::get('/patients', function () { return response()->json(['ok' => true]); })->middleware('permission:view-patient');
Route::post('/patients', function () { return response()->json(['ok' => true]); })->middleware('permission:edit-patient');
Route::get('/admin/dashboard', function () { return response()->json(['ok' => true]); })->middleware('role:admin');

// Test routes for middleware
Route::get('/admin/test', function () {
    return response()->json(['message' => 'Access granted for admin']);
})->middleware('role:admin');

Route::get('/patient/test', function () {
    return response()->json(['message' => 'Access granted for view-patient']);
})->middleware('permission:view-patient');

Route::get('/doctor/test', function () {
    return response()->json(['message' => 'Access granted for dokter']);
})->middleware('role:dokter');
