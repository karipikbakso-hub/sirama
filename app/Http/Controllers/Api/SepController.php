<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Registration;
use App\Models\Sep;
use App\Models\Doctor;
use App\Models\Poli;
use App\Models\User;
use App\Models\BpjsIntegration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Http;

class SepController extends Controller
{
    /**
     * Display a listing of SEPs with pagination and advanced filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'rejected', 'expired'])],
            'validation_status' => ['nullable', Rule::in(['valid', 'invalid', 'not_checked'])],
            'service_type' => ['nullable', Rule::in(['Rawat Jalan', 'Rawat Inap', 'Rawat Darurat', 'Prosedur'])],
            'poli_id' => 'nullable|integer|exists:poli,id',
            'doctor_id' => 'nullable|integer|exists:doctors,id',
            'patient_id' => 'nullable|integer|exists:patients,id',
            'search' => 'nullable|string|max:255',
            'sort_by' => ['nullable', Rule::in(['created_at', 'expiry_date', 'validated_at'])],
            'sort_direction' => ['nullable', Rule::in(['asc', 'desc'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Sep::with(['patient:id,mrn,name', 'registration:id,registration_no', 'creator:id,name', 'dpjp:id,name', 'poli:id,name']);

        // Date range filter
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply filters
        if ($request->has('status')) {
            if ($request->status === 'expired') {
                $query->where('expiry_date', '<=', now());
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('validation_status')) {
            $query->where('validation_status', $request->validation_status);
        }

        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
        }

        if ($request->has('poli_id')) {
            $query->where('poli_id', $request->poli_id);
        }

        if ($request->has('doctor_id')) {
            $query->where('dpjp_id', $request->doctor_id);
        }

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sep_number', 'like', '%' . $search . '%')
                  ->orWhere('bpjs_number', 'like', '%' . $search . '%')
                  ->orWhere('diagnosis', 'like', '%' . $search . '%')
                  ->orWhereHas('patient', function ($patientQuery) use ($search) {
                      $patientQuery->where('name', 'like', '%' . $search . '%')
                                   ->orWhere('mrn', 'like', '%' . $search . '%');
                  });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $seps = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        // Process SEPs to add validation badges and expiry info
        $seps->getCollection()->transform(function ($sep) {
            $sep->validation_badge = $sep->getValidationBadge();
            $sep->is_expired = $sep->isExpired();
            $sep->is_suspicious = $sep->isSuspicious();
            return $sep;
        });

        return response()->json([
            'success' => true,
            'data' => $seps
        ]);
    }

    /**
     * Store a newly created SEP.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|integer|exists:patients,id',
            'registration_id' => 'required|integer|exists:registrations,id',
            'bpjs_number' => 'required|string|size:16|regex:/^[0-9]+$/',
            'service_type' => ['required', Rule::in(['Rawat Jalan', 'Rawat Inap', 'Rawat Darurat', 'Prosedur'])],
            'diagnosis' => 'required|string|max:255',
            'dpjp_id' => 'nullable|integer|exists:doctors,id',
            'poli_id' => 'nullable|integer|exists:poli,id',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check if patient exists and is active
            $patient = Patient::findOrFail($request->patient_id);
            if ($patient->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient is not active'
                ], 422);
            }

            // Check if registration exists and is valid
            $registration = Registration::findOrFail($request->registration_id);
            if (!in_array($registration->status, ['registered', 'checked-in', 'completed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration is not valid for SEP creation'
                ], 422);
            }

            // Check if SEP already exists for this registration
            $existingSep = Sep::where('registration_id', $request->registration_id)->first();
            if ($existingSep) {
                return response()->json([
                    'success' => false,
                    'message' => 'SEP already exists for this registration'
                ], 422);
            }

            // Generate SEP number
            $sepNumber = Sep::generateSepNumber();

            $sep = Sep::create([
                'patient_id' => $request->patient_id,
                'registration_id' => $request->registration_id,
                'sep_number' => $sepNumber,
                'bpjs_number' => $request->bpjs_number,
                'service_type' => $request->service_type,
                'diagnosis' => $request->diagnosis,
                'status' => 'active',
                'validation_status' => 'not_checked',
                'dpjp_id' => $request->dpjp_id,
                'poli_id' => $request->poli_id,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // Set expiry date
            $sep->calculateExpiryDate();
            $sep->save();

            DB::commit();

            // Load relationships for response
            $sep->load(['patient:id,mrn,name', 'registration:id,registration_no', 'creator:id,name', 'dpjp:id,name', 'poli:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'SEP created successfully',
                'data' => $sep
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create SEP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate SEP with BPJS API
     */
    public function validateSep(Request $request, $sepId): JsonResponse
    {
        $sep = Sep::findOrFail($sepId);

        try {
            // Log the validation attempt
            $logData = [
                'service_type' => 'SEP_VALIDATION',
                'request_data' => ['sep_number' => $sep->sep_number, 'bpjs_number' => $sep->bpjs_number],
                'status' => 'processing',
                'patient_id' => $sep->patient_id,
                'bpjs_number' => $sep->bpjs_number,
                'endpoint' => 'sep/validation',
            ];

            $log = BpjsIntegration::create($logData);

            // Simulate BPJS API call (replace with actual API integration)
            $validationResult = $this->simulateBpjsValidation($sep);

            // Update log with result
            $log->update([
                'response_data' => $validationResult,
                'status' => $validationResult['valid'] ? 'success' : 'error',
                'response_time_ms' => rand(100, 500), // Simulate response time
                'error_message' => $validationResult['valid'] ? null : $validationResult['message'],
                'processed_at' => now(),
            ]);

            // Update SEP validation status
            $sep->update([
                'validation_status' => $validationResult['valid'] ? 'valid' : 'invalid',
                'validated_at' => now(),
                'validation_response' => $validationResult,
                'flagged_reason' => $validationResult['message'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'SEP validation completed',
                'data' => [
                    'sep' => $sep->load(['patient:id,name', 'dpjp:id,name']),
                    'validation_result' => $validationResult,
                ]
            ]);

        } catch (\Exception $e) {
            if (isset($log)) {
                $log->update([
                    'status' => 'error',
                    'error_message' => $e->getMessage(),
                    'processed_at' => now(),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk validate SEPs with batch processing
     */
    public function bulkValidate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sep_ids' => 'required|array|min:1|max:500',
            'sep_ids.*' => 'integer|exists:seps,id',
            'batch_size' => 'nullable|integer|min:10|max:50',
            'force_revalidate' => 'nullable|boolean',
            'background_job' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $sepIds = $request->sep_ids;
        $batchSize = $request->get('batch_size', 25);
        $forceRevalidate = $request->get('force_revalidate', false);
        $backgroundJob = $request->get('background_job', count($sepIds) > 100);

        // Create bulk validation job record
        $job = BulkValidationJob::create([
            'total_seps' => count($sepIds),
            'batch_size' => $batchSize,
            'status' => $backgroundJob ? 'queued' : 'processing',
            'initiated_by' => auth()->id(),
            'force_revalidate' => $forceRevalidate
        ]);

        if ($backgroundJob) {
            // Dispatch to queue for large jobs
            \App\Jobs\ProcessSepBulkValidation::dispatch($job, $sepIds)
                ->onQueue('bulk-validation');

            return response()->json([
                'success' => true,
                'message' => 'Bulk validation queued for background processing',
                'data' => [
                    'job_id' => $job->id,
                    'status' => 'queued',
                    'estimated_completion' => now()->addMinutes(ceil(count($sepIds) / $batchSize) * 2),
                    'progress_url' => route('api.seps.bulk-progress', $job->id)
                ]
            ]);
        }

        // Process synchronously for smaller batches
        try {
            $results = $this->processBulkValidation($job, $sepIds, $forceRevalidate);

            return response()->json([
                'success' => true,
                'message' => 'Bulk validation completed',
                'data' => [
                    'job_id' => $job->id,
                    'results' => $results,
                    'summary' => [
                        'total_processed' => count($results),
                        'successful' => count(array_filter($results, fn($r) => $r['success'])),
                        'failed' => count(array_filter($results, fn($r) => !$r['success'])),
                        'processing_time_seconds' => now()->diffInSeconds($job->created_at)
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            $job->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Bulk validation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bulk validation job progress
     */
    public function bulkValidationProgress(Request $request, $jobId): JsonResponse
    {
        $job = BulkValidationJob::findOrFail($jobId);

        return response()->json([
            'success' => true,
            'data' => [
                'job_id' => $job->id,
                'status' => $job->status,
                'progress_percentage' => $job->progress_percentage,
                'processed_seps' => $job->processed_seps,
                'total_seps' => $job->total_seps,
                'successful_validations' => $job->successful_validations,
                'failed_validations' => $job->failed_validations,
                'started_at' => $job->created_at,
                'completed_at' => $job->completed_at,
                'estimated_completion' => $job->estimated_completion,
                'error_message' => $job->error_message
            ]
        ]);
    }

    /**
     * Process bulk validation synchronously
     */
    private function processBulkValidation(BulkValidationJob $job, array $sepIds, bool $forceRevalidate = false): array
    {
        $results = [];
        $batches = array_chunk($sepIds, $job->batch_size);
        $totalProcessed = 0;
        $delayBetweenRequests = config('bpjs.validation_delay_ms', 200); // milliseconds

        foreach ($batches as $batchIndex => $batch) {
            $job->update([
                'current_batch' => $batchIndex + 1,
                'total_batches' => count($batches)
            ]);

            foreach ($batch as $sepId) {
                try {
                    $sep = Sep::findOrFail($sepId);

                    // Skip if already validated and not forcing revalidation
                    if (!$forceRevalidate && $sep->validation_status !== 'not_checked') {
                        $results[] = [
                            'sep_id' => $sepId,
                            'success' => true,
                            'skipped' => true,
                            'message' => 'Already validated, skipped'
                        ];
                        continue;
                    }

                    // Perform validation
                    $validationResult = $this->performSingleValidation($sep);

                    // Update SEP
                    $sep->update([
                        'validation_status' => $validationResult['status'],
                        'validated_at' => now(),
                        'validation_response' => $validationResult,
                        'flagged_reason' => $validationResult['issues'] ?? null,
                    ]);

                    // Log validation
                    BpjsIntegration::create([
                        'service_type' => 'SEP_BULK_VALIDATION',
                        'request_data' => ['sep_number' => $sep->sep_number],
                        'response_data' => $validationResult,
                        'status' => $validationResult['status'] === 'valid' ? 'success' : 'error',
                        'patient_id' => $sep->patient_id,
                        'bpjs_number' => $sep->bpjs_number,
                        'endpoint' => 'bulk-validation',
                        'processed_at' => now(),
                    ]);

                    $results[] = [
                        'sep_id' => $sepId,
                        'success' => true,
                        'status' => $validationResult['status'],
                        'issues' => $validationResult['issues'] ?? []
                    ];

                } catch (\Exception $e) {
                    $results[] = [
                        'sep_id' => $sepId,
                        'success' => false,
                        'error' => $e->getMessage()
                    ];
                }

                $totalProcessed++;
                $job->update([
                    'processed_seps' => $totalProcessed,
                    'progress_percentage' => round(($totalProcessed / $job->total_seps) * 100, 2)
                ]);

                // Rate limiting delay
                if ($delayBetweenRequests > 0) {
                    usleep($delayBetweenRequests * 1000);
                }
            }

            // Delay between batches
            sleep(2);
        }

        // Update job completion
        $successful = count(array_filter($results, fn($r) => $r['success'] && !isset($r['skipped'])));
        $job->update([
            'status' => 'completed',
            'completed_at' => now(),
            'successful_validations' => $successful,
            'failed_validations' => count($results) - $successful,
            'progress_percentage' => 100
        ]);

        return $results;
    }

    /**
     * Perform single SEP validation
     */
    private function performSingleValidation(Sep $sep): array
    {
        $issues = [];

        // Pre-flight local validation
        $localValidation = $this->validateLocalRules($sep);
        if (!$localValidation['valid']) {
            $issues = array_merge($issues, $localValidation['issues']);
        }

        // BPJS API validation
        $bpjsValidation = $this->validateBpjsApi($sep);
        if (!$bpjsValidation['valid']) {
            $issues = array_merge($issues, $bpjsValidation['issues']);
        }

        // Determine final status
        $status = 'invalid';
        if (empty($issues)) {
            $status = 'valid';
        } elseif (count($issues) === 1 && str_contains($issues[0], 'BPJS API')) {
            $status = 'expired'; // Temporary status for API issues
        }

        return [
            'status' => $status,
            'issues' => $issues,
            'local_validation_passed' => $localValidation['valid'],
            'bpjs_validation_passed' => $bpjsValidation['valid'],
            'validated_at' => now()->toISOString(),
            'processing_time_ms' => rand(150, 800) // Simulate processing time
        ];
    }

    /**
     * Validate local business rules
     */
    private function validateLocalRules(Sep $sep): array
    {
        $issues = [];

        // Validate SEP number format
        if (!preg_match('/^SEP\d{12}$/', $sep->sep_number)) {
            $issues[] = 'Invalid SEP number format';
        }

        // Validate BPJS number
        if (!preg_match('/^\d{16}$/', $sep->bpjs_number)) {
            $issues[] = 'Invalid BPJS number format';
        }

        // Validate expiry
        if ($sep->isExpired()) {
            $issues[] = 'SEP has expired';
        }

        // Validate diagnosis exists in ICD-10
        if (empty($sep->diagnosis)) {
            $issues[] = 'Diagnosis is required';
        }

        return [
            'valid' => empty($issues),
            'issues' => $issues
        ];
    }

    /**
     * Validate with BPJS API
     */
    private function validateBpjsApi(Sep $sep): array
    {
        try {
            // Simulate BPJS API call (replace with actual implementation)
            $isValid = rand(0, 10) > 3; // 70% success rate for testing

            if ($isValid) {
                return [
                    'valid' => true,
                    'bpjs_data' => [
                        'nama_peserta' => $sep->patient->name ?? 'N/A',
                        'no_bpjs' => $sep->bpjs_number,
                        'status_peserta' => 'Aktif',
                        'faskes_tk1' => 'RSUD Sirama',
                        'validated_at' => now()->toISOString()
                    ]
                ];
            } else {
                $errors = [
                    'Nomor BPJS tidak ditemukan',
                    'Status peserta tidak aktif',
                    'Limit kunjungan habis',
                    'SEP sudah expired'
                ];

                return [
                    'valid' => false,
                    'issues' => [$errors[array_rand($errors)]],
                    'api_error' => 'BPJS validation failed'
                ];
            }

        } catch (\Exception $e) {
            return [
                'valid' => false,
                'issues' => ['BPJS API Error: ' . $e->getMessage()],
                'api_error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get SEP statistics for dashboard
     */
    public function statistics(Request $request): JsonResponse
    {
        $date = $request->get('date', today());
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = Sep::query();

        if ($dateFrom && $dateTo) {
            $query->whereDate('created_at', '>=', $dateFrom)
                  ->whereDate('created_at', '<=', $dateTo);
        } else {
            $query->whereDate('created_at', $date);
        }

        $stats = [
            'total_seps' => (clone $query)->count(),
            'valid' => (clone $query)->where('validation_status', 'valid')->count(),
            'invalid' => (clone $query)->where('validation_status', 'invalid')->count(),
            'not_checked' => (clone $query)->where('validation_status', 'not_checked')->count(),
            'expired_soon' => (clone $query)->where('expiry_date', '<=', now()->addDays(3))
                                              ->where('expiry_date', '>', now())->count(),
            'suspicious' => (clone $query)->get()->filter(function ($sep) {
                return $sep->isSuspicious();
            })->count(),
            'by_service_type' => (clone $query)->selectRaw('service_type, COUNT(*) as count')
                                                ->groupBy('service_type')
                                                ->pluck('count', 'service_type')
                                                ->toArray(),
            'by_poli' => (clone $query)->selectRaw('poli_id, COUNT(*) as count')
                                       ->whereNotNull('poli_id')
                                       ->groupBy('poli_id')
                                       ->with('poli:id,name')
                                       ->get()
                                       ->map(function ($item) {
                                           return [
                                               'poli_name' => $item->poli->name ?? 'Unknown',
                                               'count' => $item->count
                                           ];
                                       }),
        ];

        $stats['validation_rate'] = $stats['total_seps'] > 0
            ? round(($stats['valid'] / ($stats['total_seps'] - $stats['not_checked'])) * 100, 1)
            : 0;

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Flag suspicious SEP
     */
    public function flagSuspicious(Request $request, $sepId): JsonResponse
    {
        $validator = Validator::make($request->all() + ['sep_id' => $sepId], [
            'sep_id' => 'required|integer|exists:seps,id',
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $sep = Sep::findOrFail($sepId);

        $sep->update([
            'validation_status' => 'invalid',
            'flagged_reason' => $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'SEP flagged as suspicious',
            'data' => $sep
        ]);
    }

    /**
     * Simulate BPJS API validation (replace with actual API integration)
     */
    private function simulateBpjsValidation($sep): array
    {
        // Simulate API response with random validation results
        $isValid = rand(0, 10) > 2; // 80% success rate

        if ($isValid) {
            return [
                'valid' => true,
                'message' => 'SEP valid sesuai data BPJS',
                'bpjs_data' => [
                    'nama_peserta' => $sep->patient->name,
                    'no_bpjs' => $sep->bpjs_number,
                    'status_peserta' => 'Aktif',
                    'faskes_tk1' => 'RSUD Sirama',
                ]
            ];
        } else {
            $errors = [
                'Nomor BPJS tidak ditemukan',
                'Status peserta tidak aktif',
                'Limit kunjungan habis',
                'Diagnosa tidak sesuai ketentuan'
            ];

            return [
                'valid' => false,
                'message' => $errors[array_rand($errors)],
            ];
        }
    }

    // ... existing code for show, update, destroy methods (keeping them for compatibility)
}
