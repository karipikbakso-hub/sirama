<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Registration;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RegistrationController extends Controller
{
    /**
     * Display a listing of registrations with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'date' => 'nullable|date',
            'status' => ['nullable', Rule::in(['registered', 'checked-in', 'completed', 'cancelled'])],
            'service_unit' => 'nullable|string|max:100',
            'patient_id' => 'nullable|integer|exists:patients,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Registration::with(['patient:id,mrn,name', 'doctor:id,name', 'creator:id,name']);

        // Apply filters
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('service_unit')) {
            $query->where('service_unit', 'like', '%' . $request->service_unit . '%');
        }

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Order by creation date (newest first)
        $query->orderBy('created_at', 'desc');

        $registrations = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    /**
     * Store a newly created registration.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|integer|exists:patients,id',
            'service_unit' => 'required|string|max:100',
            'doctor_id' => 'nullable|integer|exists:m_dokter,id',
            'arrival_type' => ['required', Rule::in(['mandiri', 'rujukan', 'igd'])],
            'referral_source' => 'nullable|string|max:255',
            'payment_method' => ['required', Rule::in(['tunai', 'bpjs', 'asuransi'])],
            'insurance_number' => 'nullable|string|max:50',
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

            // Generate registration number and queue number
            $registrationNo = Registration::generateRegistrationNo();
            $queueNumber = Registration::generateQueueNumber($request->service_unit);

            $registration = Registration::create([
                'patient_id' => $request->patient_id,
                'registration_no' => $registrationNo,
                'service_unit' => $request->service_unit,
                'doctor_id' => $request->doctor_id,
                'arrival_type' => $request->arrival_type,
                'referral_source' => $request->referral_source,
                'payment_method' => $request->payment_method,
                'insurance_number' => $request->insurance_number,
                'queue_number' => $queueNumber,
                'status' => 'registered',
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            DB::commit();

            // Load relationships for response
            $registration->load(['patient:id,mrn,name', 'doctor:id,name', 'creator:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Registration created successfully',
                'data' => $registration
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create registration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified registration.
     */
    public function show(Registration $registration): JsonResponse
    {
        $registration->load([
            'patient:id,mrn,name,nik,birth_date,gender,phone,address',
            'doctor:id,nama_dokter as name',
            'creator:id,name'
        ]);

        return response()->json([
            'success' => true,
            'data' => $registration
        ]);
    }

    /**
     * Update the specified registration.
     */
    public function update(Request $request, Registration $registration): JsonResponse
    {
        // Check if registration can be updated
        if (!$registration->canBeUpdated()) {
            return response()->json([
                'success' => false,
                'message' => 'Registration cannot be updated'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'service_unit' => 'sometimes|required|string|max:100',
            'doctor_id' => 'nullable|integer|exists:m_dokter,id',
            'arrival_type' => ['sometimes', 'required', Rule::in(['mandiri', 'rujukan', 'igd'])],
            'referral_source' => 'nullable|string|max:255',
            'payment_method' => ['sometimes', 'required', Rule::in(['tunai', 'bpjs', 'asuransi'])],
            'insurance_number' => 'nullable|string|max:50',
            'status' => ['sometimes', Rule::in(['registered', 'checked-in', 'completed', 'cancelled'])],
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
            // If service unit is being changed, regenerate queue number
            $updateData = $request->only([
                'service_unit', 'doctor_id', 'arrival_type', 'referral_source',
                'payment_method', 'insurance_number', 'status', 'notes'
            ]);

            if ($request->has('service_unit') && $request->service_unit !== $registration->service_unit) {
                $updateData['queue_number'] = Registration::generateQueueNumber($request->service_unit);
            }

            $registration->update($updateData);

            // Load relationships for response
            $registration->load(['patient:id,mrn,name', 'doctor:id,nama_dokter as name', 'creator:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Registration updated successfully',
                'data' => $registration
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update registration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update registration status.
     */
    public function updateStatus(Request $request, Registration $registration): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in(['registered', 'checked-in', 'completed', 'cancelled'])],
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
            $registration->update([
                'status' => $request->status,
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registration status updated successfully',
                'data' => $registration
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update registration status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified registration.
     */
    public function destroy(Registration $registration): JsonResponse
    {
        // Only allow deletion of cancelled registrations
        if ($registration->status !== 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Only cancelled registrations can be deleted'
            ], 422);
        }

        try {
            $registration->delete();

            return response()->json([
                'success' => true,
                'message' => 'Registration deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete registration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate queue number for a registration.
     */
    public function generateQueue(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'registration_id' => 'required|integer|exists:registrations,id',
            'service_unit' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $registration = Registration::findOrFail($request->registration_id);
            $queueNumber = Registration::generateQueueNumber($request->service_unit);

            $registration->update(['queue_number' => $queueNumber]);

            return response()->json([
                'success' => true,
                'message' => 'Queue number generated successfully',
                'data' => [
                    'registration_id' => $registration->id,
                    'queue_number' => $queueNumber
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate queue number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get registration statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $date = $request->get('date', date('Y-m-d'));

        $stats = [
            'total_registrations' => Registration::whereDate('created_at', $date)->count(),
            'registered' => Registration::whereDate('created_at', $date)->where('status', 'registered')->count(),
            'checked_in' => Registration::whereDate('created_at', $date)->where('status', 'checked-in')->count(),
            'completed' => Registration::whereDate('created_at', $date)->where('status', 'completed')->count(),
            'cancelled' => Registration::whereDate('created_at', $date)->where('status', 'cancelled')->count(),
            'by_payment_method' => [
                'tunai' => Registration::whereDate('created_at', $date)->where('payment_method', 'tunai')->count(),
                'bpjs' => Registration::whereDate('created_at', $date)->where('payment_method', 'bpjs')->count(),
                'asuransi' => Registration::whereDate('created_at', $date)->where('payment_method', 'asuransi')->count(),
            ],
            'by_service_unit' => Registration::whereDate('created_at', $date)
                ->selectRaw('service_unit, COUNT(*) as count')
                ->groupBy('service_unit')
                ->pluck('count', 'service_unit')
                ->toArray(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get queue list with pagination and filtering.
     */
    public function queueList(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'service_unit' => 'nullable|string|max:100',
            'status' => ['nullable', Rule::in(['registered', 'checked-in', 'completed', 'cancelled'])],
            'search' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Registration::with(['patient:id,mrn,name'])
                            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('service_unit')) {
            $query->where('service_unit', $request->service_unit);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('queue_number', 'like', '%' . $search . '%')
                  ->orWhereHas('patient', function ($patientQuery) use ($search) {
                      $patientQuery->where('name', 'like', '%' . $search . '%')
                                   ->orWhere('mrn', 'like', '%' . $search . '%');
                  });
            });
        }

        $queues = $query->paginate(
            $request->get('per_page', 10),
            ['id', 'patient_id', 'queue_number', 'service_unit', 'status', 'created_at'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $queues
        ]);
    }
}
