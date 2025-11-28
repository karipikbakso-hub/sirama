<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => ['nullable', Rule::in(['pending', 'confirmed', 'cancelled', 'completed'])],
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Appointment::with(['patient', 'doctor'])
            ->select('appointments.*');

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function($q) use ($request) {
                $q->whereHas('patient', function($patientQuery) use ($request) {
                    $patientQuery->where('name', 'like', '%' . $request->search . '%')
                               ->orWhere('patient_id', 'like', '%' . $request->search . '%');
                })
                ->orWhereHas('doctor', function($doctorQuery) use ($request) {
                    $doctorQuery->where('name', 'like', '%' . $request->search . '%');
                });
            });
        }

        if ($request->has('status')) {
            $query->where('appointments.status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('appointment_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('appointment_date', '<=', $request->date_to);
        }

        // Order by appointment date and time
        $query->orderBy('appointment_date', 'desc')
              ->orderBy('appointment_time', 'desc');

        $appointments = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date|after:today',
            'appointment_time' => 'required|date_format:H:i',
            'service_type' => 'nullable|string|max:100',
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

            $appointment = Appointment::create([
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'service_type' => $request->service_type ?? 'Konsultasi Rutin',
                'notes' => $request->notes,
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Appointment created successfully',
                'data' => $appointment->load(['patient', 'doctor'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified appointment.
     */
    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $appointment->load(['patient', 'doctor'])
        ]);
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'appointment_date' => 'sometimes|required|date',
            'appointment_time' => 'sometimes|required|date_format:H:i',
            'service_type' => 'sometimes|string|max:100',
            'notes' => 'nullable|string|max:500',
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'cancelled', 'completed'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $appointment->update($request->only([
                'appointment_date', 'appointment_time', 'service_type', 'notes', 'status'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Appointment updated successfully',
                'data' => $appointment->load(['patient', 'doctor'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified appointment.
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        try {
            $appointment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Appointment deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointment statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_appointments' => Appointment::count(),
            'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'cancelled_appointments' => Appointment::where('status', 'cancelled')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'today_appointments' => Appointment::whereDate('appointment_date', today())->count(),
            'this_month_appointments' => Appointment::whereMonth('appointment_date', now()->month)
                                                   ->whereYear('appointment_date', now()->year)->count(),
            'confirmation_rate' => Appointment::count() > 0 ?
                round((Appointment::where('status', 'confirmed')->count() / Appointment::count()) * 100, 2) : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Confirm an appointment.
     */
    public function confirm(Appointment $appointment): JsonResponse
    {
        try {
            $appointment->update(['status' => 'confirmed']);

            return response()->json([
                'success' => true,
                'message' => 'Appointment confirmed successfully',
                'data' => $appointment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel an appointment.
     */
    public function cancel(Appointment $appointment): JsonResponse
    {
        try {
            $appointment->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'message' => 'Appointment cancelled successfully',
                'data' => $appointment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
