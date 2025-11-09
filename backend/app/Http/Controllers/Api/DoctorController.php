<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DoctorController extends Controller
{
    /**
     * Display a listing of doctors with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'specialty' => 'nullable|string|max:100',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'retired'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Doctor::query();

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        if ($request->has('specialty')) {
            $query->where('specialty', 'like', '%' . $request->specialty . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Order by name
        $query->orderBy('name', 'asc');

        $doctors = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $doctors
        ]);
    }

    /**
     * Store a newly created doctor.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'specialty' => 'required|string|max:100',
            'license_number' => 'required|string|max:50|unique:doctors,license_number',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'schedule' => 'nullable|json',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'retired'])]
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

            $doctor = Doctor::create([
                'name' => $request->name,
                'specialty' => $request->specialty,
                'license_number' => $request->license_number,
                'phone' => $request->phone,
                'email' => $request->email,
                'schedule' => $request->schedule,
                'status' => $request->status ?? 'active'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Doctor created successfully',
                'data' => $doctor
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified doctor.
     */
    public function show(Doctor $doctor): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $doctor
        ]);
    }

    /**
     * Update the specified doctor.
     */
    public function update(Request $request, Doctor $doctor): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'specialty' => 'sometimes|required|string|max:100',
            'license_number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('doctors')->ignore($doctor->id)],
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'schedule' => 'nullable|json',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'retired'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $doctor->update($request->only([
                'name', 'specialty', 'license_number', 'phone', 'email', 'schedule', 'status'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Doctor updated successfully',
                'data' => $doctor
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified doctor.
     */
    public function destroy(Doctor $doctor): JsonResponse
    {
        // Check if doctor has active registrations
        if ($doctor->registrations()->whereIn('status', ['registered', 'checked-in'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete doctor with active registrations'
            ], 422);
        }

        try {
            $doctor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Doctor deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get doctor statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_doctors' => Doctor::count(),
            'active_doctors' => Doctor::where('status', 'active')->count(),
            'inactive_doctors' => Doctor::where('status', 'inactive')->count(),
            'retired_doctors' => Doctor::where('status', 'retired')->count(),
            'by_specialty' => Doctor::selectRaw('specialty, COUNT(*) as count')
                                  ->groupBy('specialty')
                                  ->pluck('count', 'specialty')
                                  ->toArray(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
