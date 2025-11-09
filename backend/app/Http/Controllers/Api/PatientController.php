<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PatientController extends Controller
{
    /**
     * Display a listing of patients with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'deceased'])],
            'registration_date_from' => 'nullable|date',
            'registration_date_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Patient::query();

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('registration_date_from')) {
            $query->whereDate('created_at', '>=', $request->registration_date_from);
        }

        if ($request->has('registration_date_to')) {
            $query->whereDate('created_at', '<=', $request->registration_date_to);
        }

        // Order by creation date (newest first)
        $query->orderBy('created_at', 'desc');

        $patients = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

    /**
     * Store a newly created patient.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|size:16|unique:patients,nik',
            'birth_date' => 'required|date|before:today',
            'gender' => ['required', Rule::in(['L', 'P'])],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:20',
            'bpjs_number' => 'nullable|string|max:20|unique:patients,bpjs_number',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'deceased'])]
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

            $patient = Patient::create([
                'mrn' => Patient::generateMRN(),
                'name' => $request->name,
                'nik' => $request->nik,
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'phone' => $request->phone,
                'address' => $request->address,
                'emergency_contact' => $request->emergency_contact,
                'bpjs_number' => $request->bpjs_number,
                'status' => $request->status ?? 'active'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Patient created successfully',
                'data' => $patient
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified patient.
     */
    public function show(Patient $patient): JsonResponse
    {
        // Load relationships
        $patient->load([
            'registrations' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'registrations.doctor:id,name',
            'registrations.creator:id,name'
        ]);

        return response()->json([
            'success' => true,
            'data' => $patient
        ]);
    }

    /**
     * Update the specified patient.
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'nik' => ['sometimes', 'nullable', 'string', 'size:16', Rule::unique('patients')->ignore($patient->id)],
            'birth_date' => 'sometimes|required|date|before:today',
            'gender' => ['sometimes', 'required', Rule::in(['L', 'P'])],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:20',
            'bpjs_number' => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('patients')->ignore($patient->id)],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'deceased'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $patient->update($request->only([
                'name', 'nik', 'birth_date', 'gender', 'phone',
                'address', 'emergency_contact', 'bpjs_number', 'status'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Patient updated successfully',
                'data' => $patient
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified patient.
     */
    public function destroy(Patient $patient): JsonResponse
    {
        // Check if patient has active registrations
        if ($patient->registrations()->whereIn('status', ['registered', 'checked-in'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete patient with active registrations'
            ], 422);
        }

        try {
            $patient->delete();

            return response()->json([
                'success' => true,
                'message' => 'Patient deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search patients by name, MRN, or NIK.
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $patients = Patient::search($request->q)
                          ->active()
                          ->limit($request->get('limit', 10))
                          ->get(['id', 'mrn', 'name', 'nik', 'birth_date', 'gender', 'phone']);

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

    /**
     * Find patient by NIK.
     */
    public function findByNik(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $patient = Patient::where('nik', $request->nik)
                         ->where('status', 'active')
                         ->first();

        if ($patient) {
            return response()->json([
                'success' => true,
                'message' => 'Patient found',
                'data' => $patient
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found with this NIK'
            ], 404);
        }
    }

    /**
     * Get patient statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_patients' => Patient::count(),
            'active_patients' => Patient::where('status', 'active')->count(),
            'inactive_patients' => Patient::where('status', 'inactive')->count(),
            'deceased_patients' => Patient::where('status', 'deceased')->count(),
            'new_this_month' => Patient::whereMonth('created_at', date('m'))
                                      ->whereYear('created_at', date('Y'))
                                      ->count(),
            'male_patients' => Patient::where('gender', 'L')->count(),
            'female_patients' => Patient::where('gender', 'P')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
