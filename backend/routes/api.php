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
use App\Http\Controllers\Api\LaboratoriumController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\Icd10DiagnosisController;
use App\Http\Controllers\Api\MobileJknController;
use App\Http\Controllers\Api\RolesController;
use App\Http\Controllers\Api\DashboardHomeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\ErrorMonitoringController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PendaftaranDashboardController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\PengaturanSistemController;
use App\Http\Controllers\Api\PatientRegistrationController;
use App\Http\Controllers\Api\DokterDashboardController;
use App\Http\Controllers\Api\DashboardDokterController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\JadwalPraktekController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\Icd10Controller;
use App\Http\Controllers\Api\DiagnosisControllerNew;
use App\Http\Controllers\Api\NursingDashboardController;
use App\Http\Controllers\Api\VitalSignsController;
use App\Http\Controllers\Api\NursingCpptController;
use App\Http\Controllers\Api\NursingQueueController;
use App\Http\Controllers\Api\TriaseController;
use App\Http\Controllers\Api\DistribusiObatController;
use App\Http\Controllers\Api\ApotekerDashboardController;
use App\Http\Controllers\Api\StockAdjustmentController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\PrescriptionHandoverController;
use App\Http\Controllers\Api\PurchaseRequisitionController;
use App\Http\Controllers\Api\KasirDashboardController;
use App\Http\Controllers\Api\AuditLogsController;
use App\Http\Controllers\Api\HasilSurveyController;
use App\Http\Controllers\Api\CpptController;
use App\Http\Controllers\Api\DoctorCpptController;
use App\Http\Controllers\Api\ExaminationController;
use App\Http\Controllers\Api\DepositController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\CpptNursingController;
use App\Http\Controllers\Api\DiagnosisController;
use App\Http\Controllers\Api\RadiologiController;
use App\Http\Controllers\Api\BORController;
use App\Http\Controllers\Api\LOSController;
use App\Http\Controllers\Api\PendapatanController;
use App\Http\Controllers\Api\DailyReportController;
use App\Http\Controllers\Api\ExecutiveDashboardController;
use App\Http\Controllers\Api\IndikatorKualitasController;
use App\Http\Controllers\Api\KPIController;
use App\Http\Controllers\Api\SatusehatController;
use App\Http\Controllers\Api\SystemConfigurationController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\ResepController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\PoliController;
use App\Http\Controllers\Api\HealthController;

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// Public routes (no authentication required)
Route::get('health', [HealthController::class, 'index']);
Route::get('appointments/statistics', [AppointmentController::class, 'statistics']);
Route::get('patients-search', [PatientController::class, 'search']); // Make patient search public for autocomplete

// TEMPORARY: Make medicines public for testing
Route::get('medicines-test', [MedicineController::class, 'index']);
Route::get('medicines-test/{medicine}/batches', [MedicineController::class, 'batches']);
Route::get('medicines-test/low-stock', [MedicineController::class, 'lowStock']);
Route::get('medicines-test/expiring-soon', [MedicineController::class, 'expiringSoon']);

// Medicine public routes for testing
Route::get('medicines/low-stock', [MedicineController::class, 'lowStock']);
Route::get('medicines/expiring-soon', [MedicineController::class, 'expiringSoon']);

// TEMPORARY: Test Apoteker Dashboard routes without auth
Route::get('test/dashboard/apoteker', [ApotekerDashboardController::class, 'index']);
Route::get('test/prescriptions/recent', [ApotekerDashboardController::class, 'recentOrders']);
Route::get('test/medicines/alerts', [ApotekerDashboardController::class, 'alerts']);
Route::get('test/reports/daily-usage', [ApotekerDashboardController::class, 'dailyUsage']);

// TEMPORARY: Test Purchase Requisition routes without auth
Route::get('test/purchase-requisitions', [App\Http\Controllers\Api\PurchaseRequisitionController::class, 'index']);
Route::post('test/purchase-requisitions', [App\Http\Controllers\Api\PurchaseRequisitionController::class, 'store']);
Route::get('test/medicines/need-reorder', [App\Http\Controllers\Api\PurchaseRequisitionController::class, 'getMedicinesNeedReorder']);
Route::post('test/purchase-requisitions/{purchaseRequisition}/submit', [App\Http\Controllers\Api\PurchaseRequisitionController::class, 'submit']);
Route::post('test/purchase-requisitions/{purchaseRequisition}/approve', [App\Http\Controllers\Api\PurchaseRequisitionController::class, 'approve']);
Route::post('test/purchase-requisitions/{purchaseRequisition}/reject', [App\Http\Controllers\Api\PurchaseRequisitionController::class, 'reject']);
Route::post('test/purchase-requisitions/{purchaseRequisition}/convert-to-po', [App\Http\Controllers\Api\PurchaseRequisitionController::class, 'convertToPo']);

// TEMPORARY: Public routes for testing apoteker order resep
Route::get('test/prescriptions/apoteker', [PrescriptionController::class, 'listForApoteker']);
Route::get('test/prescriptions/{id}/items', [PrescriptionController::class, 'items']);

// Patient Registration routes
Route::post('pendaftaran/pasien-baru', [PatientRegistrationController::class, 'store']);
Route::get('pendaftaran/check-nik', [PatientRegistrationController::class, 'checkNIK']);
Route::post('pendaftaran/validasi-bpjs', [PatientRegistrationController::class, 'validateBPJS']);
Route::get('pendaftaran/generate-mr-number', [PatientController::class, 'generateMrNumber']);

// Patient EMR routes - FOR TESTING: Remove permission middleware temporarily
Route::get('pendaftaran/pasien/search', [PatientController::class, 'search']);
Route::get('pendaftaran/pasien/list-all', [PatientController::class, 'listAllPatients']);
Route::middleware(['permission:view patients'])->group(function () {
    Route::get('pendaftaran/pasien/{patient}', [PatientController::class, 'show']);
    Route::get('pendaftaran/pasien/{patient}/riwayat-kunjungan', [PatientController::class, 'getVisitHistory']);
    Route::get('pendaftaran/pasien/{patient}/dokumen', [PatientController::class, 'getDocuments']);
});

Route::middleware(['permission:edit patients'])->group(function () {
    Route::put('pendaftaran/pasien/{patient}', [PatientController::class, 'updateBiodata']);
    Route::post('pendaftaran/pasien/{patient}/dokumen', [PatientController::class, 'uploadDocument']);
});

// Region data routes (public for form population)
use App\Http\Controllers\Api\RegionController;
Route::get('api/regions/provinces', [RegionController::class, 'getProvinces']);
Route::get('api/regions/cities/{provinceId}', [RegionController::class, 'getCities']);
Route::get('api/regions/districts/{cityId}', [RegionController::class, 'getDistricts']);
Route::get('api/regions/villages/{districtId}', [RegionController::class, 'getVillages']);

// Poli routes (public for registration form)
Route::get('polis', [PoliController::class, 'index']);
Route::get('polis/active', [PoliController::class, 'getActive']);

// Doctor routes (public for registration form)
Route::get('doctors/by-poli', [DoctorController::class, 'getByPoli']);

// Kasir Dashboard routes (without auth for now)
Route::get('dashboard/kasir', [KasirDashboardController::class, 'index']);
Route::get('payments/recent', [KasirDashboardController::class, 'recentPayments']);
Route::get('billings/alerts', [KasirDashboardController::class, 'billingAlerts']);
Route::get('dashboard/kasir/revenue-chart', [KasirDashboardController::class, 'revenueChart']);

// Deposit statistics route (public for dashboard)
Route::get('deposits/statistics', [DepositController::class, 'statistics']);

// Executive Dashboard routes (public for dashboard access)
Route::prefix('executive-dashboard')->group(function () {
    Route::get('kpi', [ExecutiveDashboardController::class, 'getKPIData']);
});

// New Admin Dashboard routes (according to requirements) - public access
Route::get('dashboard/admin', [DashboardController::class, 'adminDashboard']);
Route::get('audit-logs/recent', [AuditController::class, 'recent']);
Route::get('system/health', [DashboardController::class, 'systemHealthCheck']);

// HIGH PERFORMANCE: Combined audit logs endpoint
Route::get('audit-logs/initial-data', [AuditLogsController::class, 'initialData']);

// Backup Management routes - Admin only
Route::middleware(['permission:manage-backups'])->group(function () {
    Route::prefix('backups')->group(function () {
        // Backup histories
        Route::get('histories', [BackupController::class, 'getHistories']);
        Route::delete('{history}', [BackupController::class, 'deleteBackup']);
        Route::get('{history}/download', [BackupController::class, 'downloadBackup']);

        // Manual backup
        Route::post('manual', [BackupController::class, 'createManualBackup']);

        // Restore
        Route::post('{history}/restore', [BackupController::class, 'restoreBackup']);

        // Schedules
        Route::get('schedules', [BackupController::class, 'getSchedules']);
        Route::post('schedules', [BackupController::class, 'createSchedule']);
        Route::put('schedules/{schedule}', [BackupController::class, 'updateSchedule']);
        Route::delete('schedules/{schedule}', [BackupController::class, 'deleteSchedule']);

        // Statistics
        Route::get('statistics', [BackupController::class, 'getStatistics']);
    });
});


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
        Route::get('patients/{patient}/emr-readonly', [PatientController::class, 'getEmrReadonly']);
        Route::get('patients/find-by-nik', [PatientController::class, 'findByNik']);
        Route::get('patients-statistics', [PatientController::class, 'statistics']);
    });

    Route::middleware(['permission:create patients'])->post('patients', [PatientController::class, 'store']);
    Route::middleware(['permission:edit patients'])->put('patients/{patient}', [PatientController::class, 'update']);
    Route::middleware(['permission:delete patients'])->delete('patients/{patient}', [PatientController::class, 'destroy']);

    // Registration management routes - Pendaftaran & Admin
    // Temporarily remove permission middleware for testing
    // Route::middleware(['permission:view registrations'])->group(function () {
        Route::get('registrations/igd', [TriaseController::class, 'getUntriagedPatients']);
        Route::get('registrations', [RegistrationController::class, 'index']);
        Route::get('registrations/{registration}', [RegistrationController::class, 'show']);
        Route::get('registrations-statistics', [RegistrationController::class, 'statistics']);
        Route::get('queue-list', [RegistrationController::class, 'queueList']);
        Route::get('queue', [RegistrationController::class, 'queueList']);
    // });

    // Temporarily make registration routes public for testing
    Route::post('registrations', [RegistrationController::class, 'store']);
    Route::post('registrations/unified', [RegistrationController::class, 'storeUnified']);

    // Temporarily remove permission middleware for IGD registration to test
    Route::post('pendaftaran/registrasi-igd', [PatientRegistrationController::class, 'registrasiIGD']);
    Route::middleware(['permission:edit registrations'])->group(function () {
        Route::put('registrations/{registration}', [RegistrationController::class, 'update']);
        Route::patch('registrations/{registration}/status', [RegistrationController::class, 'updateStatus']);
    });
    Route::middleware(['permission:delete registrations'])->delete('registrations/{registration}', [RegistrationController::class, 'destroy']);
    Route::middleware(['permission:manage queues'])->post('queue/generate', [RegistrationController::class, 'generateQueue']);

    // SEP management routes
    Route::apiResource('seps', SepController::class);
    Route::get('seps/statistics', [SepController::class, 'statistics']);
    Route::post('seps/{sep}/validate', [SepController::class, 'validateSep']);
    Route::post('seps/bulk-validate', [SepController::class, 'bulkValidate']);
    Route::get('seps/bulk-progress/{jobId}', [SepController::class, 'bulkValidationProgress']);
    Route::get('seps/bulk-progress/{jobId}', [SepController::class, 'bulkValidationProgress']);
    Route::post('seps/{sep}/flag-suspicious', [SepController::class, 'flagSuspicious']);

    // Patient History routes
    Route::apiResource('patient-histories', PatientHistoryController::class);
    Route::get('patient-histories/patient/{patientId}', [PatientHistoryController::class, 'byPatient']);
    Route::get('patient-histories/statistics', [PatientHistoryController::class, 'statistics']);

    // Emergency Registration routes
    Route::apiResource('emergency-registrations', EmergencyRegistrationController::class);
    Route::get('emergency-registrations/active', [EmergencyRegistrationController::class, 'active']);
    Route::get('emergency-registrations/today', [EmergencyRegistrationController::class, 'today']);
    Route::get('emergency-registrations/statistics', [EmergencyRegistrationController::class, 'statistics']);

    // Queue Management routes - temporarily without permission middleware for testing
    Route::apiResource('queue-managements', QueueManagementController::class);
    Route::get('queue-managements/active', [QueueManagementController::class, 'active']);
    Route::get('queue-managements/today', [QueueManagementController::class, 'today']);
    Route::get('queue-managements/igd-aktif', [QueueManagementController::class, 'igdAktif']);
    Route::post('queue-managements/{queueManagement}/call-next', [QueueManagementController::class, 'callNext']);
    Route::post('queue-managements/{queueManagement}/skip', [QueueManagementController::class, 'skip']);

    // Nursing Queue Management routes - separate from existing registration queues
    Route::prefix('nursing')->group(function () {
        Route::get('queue-managements', [App\Http\Controllers\Api\NursingQueueController::class, 'index']);
        Route::post('queue-managements/call', [App\Http\Controllers\Api\NursingQueueController::class, 'call']);
        Route::post('queue-managements/skip', [App\Http\Controllers\Api\NursingQueueController::class, 'skip']);
        Route::get('queue-managements/stats', [App\Http\Controllers\Api\NursingQueueController::class, 'stats']);
        Route::get('queue-managements/display-board', [App\Http\Controllers\Api\NursingQueueController::class, 'displayBoard']);
        Route::patch('queue-managements/{id}/complete', [App\Http\Controllers\Api\NursingQueueController::class, 'complete']);
        Route::get('queue-managements/polyclinics', [App\Http\Controllers\Api\NursingQueueController::class, 'polyclinics']);
    });

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

    // Apoteker Dashboard routes - MUST BE BEFORE apiResource to avoid conflicts
    Route::get('dashboard/apoteker', [App\Http\Controllers\Api\ApotekerDashboardController::class, 'index']);
    Route::get('dashboard/apoteker/medicine-usage-chart', [App\Http\Controllers\Api\ApotekerDashboardController::class, 'getMedicineUsageChart']);
    Route::get('reports/top-medicines', [App\Http\Controllers\Api\ApotekerDashboardController::class, 'topMedicines']);
    Route::get('prescriptions/recent', [ApotekerDashboardController::class, 'recentOrders']);
    Route::get('medicines/alerts', [ApotekerDashboardController::class, 'alerts']);
    Route::get('reports/daily-usage', [ApotekerDashboardController::class, 'dailyUsage']);

    // Kasir Dashboard routes - MUST BE BEFORE apiResource to avoid conflicts
    Route::get('dashboard/kasir', [KasirDashboardController::class, 'index']);
    Route::get('payments/recent', [KasirDashboardController::class, 'recentPayments']);
    Route::get('billings/alerts', [KasirDashboardController::class, 'billingAlerts']);
    Route::get('dashboard/kasir/revenue-chart', [KasirDashboardController::class, 'revenueChart']);
    
    // Billing routes
    Route::get('billings', [BillingController::class, 'index']);
    Route::get('billings/{id}', [BillingController::class, 'show']);
    Route::get('billings/pending-payment', [BillingController::class, 'pendingPayment']);
    Route::post('billings/{id}/adjust-discount', [BillingController::class, 'adjustDiscount']);
    Route::get('billings/{id}/generate-invoice', [BillingController::class, 'generateInvoice']);
    Route::patch('billings/{id}/status', [BillingController::class, 'updateStatus']);

    // Payment routes
    Route::post('payments/process', [App\Http\Controllers\Api\PaymentController::class, 'processPayment']);
    Route::get('payments/{billingId}/generate-receipt', [App\Http\Controllers\Api\PaymentController::class, 'generateReceipt']);

    // Receipt routes
    Route::get('receipts', [ReceiptController::class, 'index']);
    Route::get('receipts/{id}', [ReceiptController::class, 'show']);
    Route::get('receipts/{id}/reprint', [ReceiptController::class, 'reprint']);
    Route::post('receipts/{id}/void', [ReceiptController::class, 'void']);
    Route::get('receipts/export', [ReceiptController::class, 'export']);

    // Deposit routes - temporarily moved outside middleware for testing
    Route::get('deposits', [DepositController::class, 'index']);
    Route::get('deposits/{id}', [DepositController::class, 'show']);
    Route::post('deposits/top-up', [DepositController::class, 'topUp']);
    Route::post('deposits/{id}/refund', [DepositController::class, 'refund']);
    Route::post('deposits/{id}/deduct', [DepositController::class, 'deduct']);

    // Cash Reconciliation routes
    Route::get('reconciliations', [CashReconciliationController::class, 'index']);
    Route::get('reconciliations/current-shift', [CashReconciliationController::class, 'getCurrentShift']);
    Route::get('reconciliations/{id}', [CashReconciliationController::class, 'show']);
    Route::post('reconciliations/{id}/submit', [CashReconciliationController::class, 'submit']);
    Route::post('reconciliations/{id}/approve', [CashReconciliationController::class, 'approve']);
    Route::post('reconciliations/{id}/close-shift', [CashReconciliationController::class, 'closeShift']);

    // Purchase Requisition routes - MUST BE BEFORE apiResource to avoid conflicts
    Route::get('medicines/need-reorder', [PurchaseRequisitionController::class, 'getMedicinesNeedReorder']);
    Route::get('purchase-requisitions', [PurchaseRequisitionController::class, 'index']);
    Route::post('purchase-requisitions', [PurchaseRequisitionController::class, 'store']);
    Route::get('purchase-requisitions/{purchaseRequisition}', [PurchaseRequisitionController::class, 'show']);
    Route::post('purchase-requisitions/{purchaseRequisition}/submit', [PurchaseRequisitionController::class, 'submit']);
    Route::post('purchase-requisitions/{purchaseRequisition}/approve', [PurchaseRequisitionController::class, 'approve']);
    Route::post('purchase-requisitions/{purchaseRequisition}/reject', [PurchaseRequisitionController::class, 'reject']);
    Route::post('purchase-requisitions/{purchaseRequisition}/convert-to-po', [PurchaseRequisitionController::class, 'convertToPo']);
    Route::delete('purchase-requisitions/{purchaseRequisition}', [PurchaseRequisitionController::class, 'destroy']);

    Route::apiResource('medicines', MedicineController::class);
    Route::get('medicines-statistics', [MedicineController::class, 'statistics']);
    Route::get('medicines/by-category/{category}', [MedicineController::class, 'byCategory']);
    Route::get('medicines/{medicine}/interactions', [MedicineController::class, 'interactions']);

    // Prescription routes - MUST BE BEFORE apiResource to avoid conflicts
    Route::get('prescriptions/recent', [ApotekerDashboardController::class, 'recentOrders']);
    Route::get('prescriptions/pending', [PrescriptionController::class, 'pending']);
    Route::get('prescriptions/verified', [PrescriptionController::class, 'verified']);
    Route::get('prescriptions/history', [PrescriptionController::class, 'history']);
    Route::get('prescriptions/export-history', [PrescriptionController::class, 'exportHistory']);

    // New routes for apoteker order resep
    Route::get('prescriptions/apoteker', [PrescriptionController::class, 'listForApoteker']);
    Route::get('prescriptions/list-for-apoteker', [PrescriptionController::class, 'listForApoteker']);
    Route::get('prescriptions/history', [PrescriptionController::class, 'getHistory']);
    Route::get('prescriptions/export-history', [PrescriptionController::class, 'exportHistory']);
    Route::get('prescriptions/{id}/items', [PrescriptionController::class, 'items']);

    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::get('prescriptions/{id}/print', [PrescriptionController::class, 'print']);

    // Prescription validation routes for pharmacists
    Route::get('prescriptions/{prescription}/detail', [PrescriptionController::class, 'detail']);
    Route::post('prescriptions/{prescription}/validate', [PrescriptionController::class, 'validate']);
    Route::post('prescriptions/{prescription}/reject', [PrescriptionController::class, 'reject']);

    // Prescription dispensing routes for pharmacists
    Route::post('prescriptions/{prescription}/dispense', [PrescriptionController::class, 'dispense']);
    Route::post('prescriptions/{prescription}/print-label', [PrescriptionController::class, 'printLabel']);
    Route::post('prescriptions/{prescription}/print-receipt', [PrescriptionController::class, 'printReceipt']);

    // Prescription handover routes for pharmacists
    Route::apiResource('prescription-handovers', PrescriptionHandoverController::class);
    Route::get('prescription-handovers/{handover}/receipt', [PrescriptionHandoverController::class, 'generateReceipt']);
    Route::get('prescription-handovers/education-checklist/template', [PrescriptionHandoverController::class, 'getEducationChecklist']);


    // Medicine batch routes for dispensing
    Route::get('medicines/{medicine}/batches', [MedicineController::class, 'batches']);

    // Medicine stock export routes
    Route::get('medicines/export/stock', [MedicineController::class, 'exportStock']);

    // Stock adjustment routes
    Route::post('stock-adjustments', [StockAdjustmentController::class, 'store']);

    // Stock movement routes
    Route::get('stock-movements', [StockMovementController::class, 'index']);
    Route::get('stock-movements/export', [StockMovementController::class, 'export']);

    // Prescription routes
    Route::post('prescriptions', [PrescriptionController::class, 'store']);
    Route::get('prescriptions', [PrescriptionController::class, 'index']);
    Route::get('prescriptions/{prescription}/print', [PrescriptionController::class, 'print']);

    Route::apiResource('icd10-diagnoses', Icd10DiagnosisController::class);
    Route::get('icd10-diagnoses-statistics', [Icd10DiagnosisController::class, 'statistics']);
    Route::get('icd10-diagnoses/most-used', [Icd10DiagnosisController::class, 'mostUsed']);
    Route::get('icd10-diagnoses/recently-used', [Icd10DiagnosisController::class, 'recentlyUsed']);
    Route::get('icd10-diagnoses/by-chapter/{chapter}', [Icd10DiagnosisController::class, 'byChapter']);

    // New ICD-10 endpoints for diagnosis page
    Route::get('icd10', [Icd10Controller::class, 'index']);
    Route::get('icd10/search', [Icd10Controller::class, 'search']);
    Route::get('icd10/most-used', [Icd10Controller::class, 'mostUsed']);

    // New Diagnosis endpoints for diagnosis page
    Route::get('diagnoses', [DiagnosisControllerNew::class, 'index']);
    Route::post('diagnoses', [DiagnosisControllerNew::class, 'store']);
    Route::delete('diagnoses/{id}', [DiagnosisControllerNew::class, 'destroy']);

    // Doctor Module routes
    Route::prefix('doctor')->group(function () {
        // EMR routes
        Route::get('emr/{patientId}', [DoctorModuleController::class, 'getPatientEmr']);
        Route::get('emr/{patientId}/export', [DoctorModuleController::class, 'exportPatientEmr']);

        // Legacy CPPT routes
        Route::get('cppt/{patientId}', [DoctorModuleController::class, 'getCpptEntries']);
        Route::post('cppt', [DoctorModuleController::class, 'createCpptEntry']);

        // New Doctor CPPT routes for encounter-based workflow
        Route::get('cppt/{registrationId}/entries', [App\Http\Controllers\Api\DoctorCpptController::class, 'getCpptEntries']);
        Route::post('cppt/{registrationId}/save', [App\Http\Controllers\Api\DoctorCpptController::class, 'saveCppt']);
        Route::post('cppt/{registrationId}/sign', [App\Http\Controllers\Api\DoctorCpptController::class, 'signCppt']);
        Route::get('cppt/search', [App\Http\Controllers\Api\DoctorCpptController::class, 'searchCppt']);
        Route::get('cppt/metrics/doctor/{doctorId}', [App\Http\Controllers\Api\DoctorCpptController::class, 'getCpptMetrics']);

        // Diagnosis routes
        Route::get('diagnoses', [DoctorModuleController::class, 'getIcd10Diagnoses']);

        // Prescription routes
        Route::get('prescriptions/{patientId}', [DoctorModuleController::class, 'getPrescriptions']);
        Route::post('prescriptions', [DoctorModuleController::class, 'createPrescription']);

        // Lab Order routes
            Route::get('lab-tests', [LaboratoriumController::class, 'getMasterLabTests']);
            Route::get('lab-orders/{patientId}', [DoctorModuleController::class, 'getLabOrders']);
            Route::post('lab-orders', [DoctorModuleController::class, 'createLabOrder']);

        // Radiology Order routes
        Route::get('radiology-exams', [DoctorModuleController::class, 'getRadiologyExams']);
        Route::get('radiology-orders/{patientId}', [DoctorModuleController::class, 'getRadiologyOrders']);
        Route::post('radiology-orders', [DoctorModuleController::class, 'createRadiologyOrder']);
    });

    // Prescription routes (new implementation)
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::get('prescriptions/{id}/print', [PrescriptionController::class, 'print']);

    // Medicine Distribution routes
    Route::get('prescriptions/pending', [DistribusiObatController::class, 'prescriptions']);
    Route::get('t-obat-keluar', [DistribusiObatController::class, 'index']);
    Route::post('t-obat-keluar', [DistribusiObatController::class, 'store']);
    Route::get('t-obat-keluar/{distribusi}', [DistribusiObatController::class, 'show']);
    Route::put('t-obat-keluar/{distribusi}', [DistribusiObatController::class, 'update']);
    Route::delete('t-obat-keluar/{distribusi}', [DistribusiObatController::class, 'destroy']);

    // Mobile JKN routes
    Route::prefix('pendaftaran/mobile-jkn')->group(function () {
        Route::get('config-status', [MobileJknController::class, 'getConfigurationStatus']);
        Route::post('sync', [MobileJknController::class, 'sync']);
        Route::get('list', [MobileJknController::class, 'list']);
        Route::post('{bookingId}/approve', [MobileJknController::class, 'approve']);
        Route::post('{bookingId}/reject', [MobileJknController::class, 'reject']);
        Route::post('{bookingId}/checkin', [MobileJknController::class, 'checkin']);
        Route::get('{bookingId}', [MobileJknController::class, 'show']);
    });

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

    // Admin Dashboard routes (legacy)
    Route::prefix('admin/dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('user-activity', [DashboardController::class, 'userActivity']);
        Route::get('system-health', [DashboardController::class, 'systemHealth']);
        Route::get('recent-activities', [DashboardController::class, 'recentActivities']);
        Route::get('alerts', [DashboardController::class, 'alerts']);
    });



    // Pendaftaran Dashboard routes
    Route::prefix('pendaftaran/dashboard')->group(function () {
        Route::get('stats', [PendaftaranDashboardController::class, 'stats']);
        Route::get('kunjungan-chart', [PendaftaranDashboardController::class, 'kunjunganChart']);
        Route::get('antrian-realtime', [PendaftaranDashboardController::class, 'antrianRealtime']);
        Route::get('pasien-hari-ini', [PendaftaranDashboardController::class, 'pasienHariIni']);
        Route::get('antrian/all', [PendaftaranDashboardController::class, 'all']);
    });

    // Dokter Dashboard routes
    Route::prefix('dokter/dashboard')->group(function () {
        Route::get('summary', [DokterDashboardController::class, 'summary']);
        Route::get('antrean', [DokterDashboardController::class, 'antrean']);
        Route::get('alerts', [DokterDashboardController::class, 'alerts']);
        Route::post('queue/call', [DokterDashboardController::class, 'callPatient']);
        Route::post('pemeriksaan/start', [DokterDashboardController::class, 'startExamination']);
    });

    // New Dashboard Dokter routes
    Route::get('dashboard/dokter', [DashboardDokterController::class, 'index']);
    Route::get('notifications/dokter', [NotificationController::class, 'dokter']);
    Route::get('jadwal-praktek', [JadwalPraktekController::class, 'index']);

    // Perawat Dashboard routes
    Route::prefix('dashboard/perawat')->group(function () {
        Route::get('/', [NursingDashboardController::class, 'getStats']);
        Route::get('/stats', [NursingDashboardController::class, 'getStats']);
        Route::get('/active-patients', [NursingDashboardController::class, 'getActivePatients']);
        Route::get('/pending-vitals', [NursingDashboardController::class, 'getPendingVitals']);
        Route::get('/notifications', [NursingDashboardController::class, 'getNotifications']);
    });

    // Nursing CPPT routes
    Route::prefix('nursing')->group(function () {
        Route::get('cppt-entries', [NursingCpptController::class, 'index']);
        Route::post('cppt-entries', [NursingCpptController::class, 'store']);
        Route::get('cppt-entries/{id}', [NursingCpptController::class, 'show']);
        Route::put('cppt-entries/{id}', [NursingCpptController::class, 'update']);
        Route::delete('cppt-entries/{id}', [NursingCpptController::class, 'destroy']);
        Route::get('cppt-entries/search', [NursingCpptController::class, 'search']);
        Route::get('diagnoses/search', [NursingCpptController::class, 'searchDiagnoses']);
        Route::get('interventions/search', [NursingCpptController::class, 'searchInterventions']);
    });

    // Vital signs monitoring endpoint
    Route::get('registrations/need-ttv', [RegistrationController::class, 'needTtv'])->withoutMiddleware(['web']);
    Route::get('vital-signs/{registrationId}/chart', [VitalSignsController::class, 'getChart']);

    // Vital signs CRUD
    Route::apiResource('vital-signs', VitalSignsController::class);

    // Triase routes
    Route::get('registrations/igd', [TriaseController::class, 'getUntriagedPatients']);
    Route::get('t-triase', [TriaseController::class, 'index']);
    Route::post('t-triase', [TriaseController::class, 'store']);
    Route::get('t-triase/{id}', [TriaseController::class, 'show']);
    Route::put('t-triase/{id}', [TriaseController::class, 'update']);
    Route::get('t-triase/dashboard', [TriaseController::class, 'getStatistics']);
    Route::get('t-triase/registration/{registrationId}', [TriaseController::class, 'getByRegistration']);


    // Legacy nursing routes - moved to dashboard/perawat prefix above

// Audit Logs Routes - Moved to earlier position to avoid conflicts
Route::prefix('audit-logs')->group(function () {
    Route::get('/', [AuditLogsController::class, 'index']);
    Route::get('/{id}', [AuditLogsController::class, 'show']);
    Route::delete('/cleanup', [AuditLogsController::class, 'cleanup']);
    Route::post('/export', [AuditLogsController::class, 'export']);
    Route::get('/statistics', [AuditLogsController::class, 'statistics']);
    Route::get('/users', [AuditLogsController::class, 'getUsers']);
    Route::get('/actions', [AuditLogsController::class, 'getActions']);
    Route::get('/resources', [AuditLogsController::class, 'getResources']);
});

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

// EXTRA: Admin Dashboard routes added outside the middleware group
Route::get('dashboard/admin', [DashboardController::class, 'adminDashboard']);
Route::get('audit-logs/recent', [AuditController::class, 'recent']);
Route::get('system/health', [DashboardController::class, 'systemHealthCheck']);

// TEMPORARY: Test audit logs without auth for debugging
Route::get('test/audit-logs/statistics', [AuditLogsController::class, 'statistics']);
Route::get('test/audit-logs', [AuditLogsController::class, 'index']);
