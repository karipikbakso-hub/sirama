<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Registration;
use App\Models\Sep;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SepController extends Controller
{
    /**
     * Display a listing of SEPs with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'rejected'])],
            'service_type' => ['nullable', Rule::in(['Rawat Jalan', 'Rawat Inap', 'Rawat Darurat', 'Prosedur'])],
            'patient_id' => 'nullable|integer|exists:patients,id',
            'search' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Sep::with(['patient:id,mrn,name', 'registration:id,registration_no', 'creator:id,name']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('service_type')) {
            $query->where('service_type', $request->service_type);
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

        // Order by creation date (newest first)
        $query->orderBy('created_at', 'desc');

        $seps = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

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
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            DB::commit();

            // Load relationships for response
            $sep->load(['patient:id,mrn,name', 'registration:id,registration_no', 'creator:id,name']);

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
     * Display the specified SEP.
     */
    public function show(Sep $sep): JsonResponse
    {
        $sep->load([
            'patient:id,mrn,name,nik,birth_date,gender,phone,address,bpjs_number',
            'registration:id,registration_no,service_unit,doctor_id,arrival_type,payment_method',
            'registration.doctor:id,name',
            'creator:id,name'
        ]);

        return response()->json([
            'success' => true,
            'data' => $sep
        ]);
    }

    /**
     * Update the specified SEP.
     */
    public function update(Request $request, Sep $sep): JsonResponse
    {
        // Check if SEP can be updated
        if (!$sep->canBeUpdated()) {
            return response()->json([
                'success' => false,
                'message' => 'SEP cannot be updated'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'bpjs_number' => 'sometimes|required|string|size:16|regex:/^[0-9]+$/',
            'service_type' => ['sometimes', 'required', Rule::in(['Rawat Jalan', 'Rawat Inap', 'Rawat Darurat', 'Prosedur'])],
            'diagnosis' => 'sometimes|required|string|max:255',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'rejected'])],
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
            $sep->update($request->only([
                'bpjs_number', 'service_type', 'diagnosis', 'status', 'notes'
            ]));

            // Load relationships for response
            $sep->load(['patient:id,mrn,name', 'registration:id,registration_no', 'creator:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'SEP updated successfully',
                'data' => $sep
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update SEP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified SEP.
     */
    public function destroy(Sep $sep): JsonResponse
    {
        // Only allow deletion of rejected SEPs
        if (!$sep->canBeDeleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Only rejected SEPs can be deleted'
            ], 422);
        }

        try {
            $sep->delete();

            return response()->json([
                'success' => true,
                'message' => 'SEP deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete SEP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SEP statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $date = $request->get('date', today());

        $stats = [
            'total_seps' => Sep::whereDate('created_at', $date)->count(),
            'active' => Sep::whereDate('created_at', $date)->where('status', 'active')->count(),
            'inactive' => Sep::whereDate('created_at', $date)->where('status', 'inactive')->count(),
            'rejected' => Sep::whereDate('created_at', $date)->where('status', 'rejected')->count(),
            'by_service_type' => Sep::whereDate('created_at', $date)
                ->selectRaw('service_type, COUNT(*) as count')
                ->groupBy('service_type')
                ->pluck('count', 'service_type')
                ->toArray(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
