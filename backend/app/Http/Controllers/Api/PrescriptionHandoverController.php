<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\PrescriptionHandover;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class PrescriptionHandoverController extends Controller
{
    /**
     * Display a listing of prescription handovers.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prescription_id' => 'nullable|integer|exists:prescriptions,id',
            'pharmacist_id' => 'nullable|integer|exists:users,id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = PrescriptionHandover::with(['prescription.patient', 'pharmacist']);

        if ($request->has('prescription_id')) {
            $query->where('prescription_id', $request->prescription_id);
        }

        if ($request->has('pharmacist_id')) {
            $query->where('pharmacist_id', $request->pharmacist_id);
        }

        $handovers = $query->orderBy('handover_at', 'desc')
                           ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $handovers
        ]);
    }

    /**
     * Store a newly created prescription handover.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prescription_id' => 'required|integer|exists:prescriptions,id',
            'receiver_name' => 'required|string|max:255',
            'receiver_relation' => 'required|in:pasien,suami,istri,anak,orangtua,lainnya',
            'education_checklist' => 'nullable|array',
            'education_checklist.*' => 'string',
            'digital_signature' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
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

            // Check if prescription exists and is in dispensed status
            $prescription = Prescription::findOrFail($request->prescription_id);
            if ($prescription->status !== 'dispensed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Prescription must be in dispensed status to create handover'
                ], 422);
            }

            // Check if handover already exists
            $existingHandover = PrescriptionHandover::where('prescription_id', $request->prescription_id)->first();
            if ($existingHandover) {
                return response()->json([
                    'success' => false,
                    'message' => 'Handover already exists for this prescription'
                ], 422);
            }

            // Create handover
            $handover = PrescriptionHandover::create([
                'prescription_id' => $request->prescription_id,
                'receiver_name' => $request->receiver_name,
                'receiver_relation' => $request->receiver_relation,
                'handover_at' => now(),
                'pharmacist_id' => Auth::id(),
                'education_checklist' => $request->education_checklist,
                'digital_signature' => $request->digital_signature,
                'notes' => $request->notes,
            ]);

            // Update prescription status to completed
            $prescription->update(['status' => 'completed']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Prescription handover created successfully',
                'data' => $handover->load(['prescription.patient', 'pharmacist'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create prescription handover',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified prescription handover.
     */
    public function show(PrescriptionHandover $handover): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $handover->load(['prescription.patient', 'prescription.items.medicine', 'pharmacist'])
        ]);
    }

    /**
     * Generate PDF receipt for prescription handover.
     */
    public function generateReceipt(PrescriptionHandover $handover): \Illuminate\Http\Response
    {
        try {
            $handover->load(['prescription.patient', 'prescription.items.medicine', 'pharmacist']);

            $pdf = Pdf::loadView('pdf.prescription-handover-receipt', [
                'handover' => $handover,
                'prescription' => $handover->prescription,
                'patient' => $handover->prescription->patient,
                'items' => $handover->prescription->items,
                'pharmacist' => $handover->pharmacist,
            ]);

            return $pdf->download('receipt-' . $handover->id . '.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get education checklist template.
     */
    public function getEducationChecklist(): JsonResponse
    {
        $checklist = [
            'medication_purpose' => 'Penjelasan tujuan penggunaan obat',
            'dosage_instructions' => 'Penjelasan cara penggunaan dan dosis',
            'frequency_timing' => 'Penjelasan frekuensi dan waktu penggunaan',
            'duration_treatment' => 'Penjelasan lama penggunaan obat',
            'storage_instructions' => 'Penjelasan cara penyimpanan obat',
            'side_effects' => 'Penjelasan efek samping yang mungkin terjadi',
            'drug_interactions' => 'Penjelasan interaksi dengan obat lain',
            'missed_dose_instructions' => 'Penjelasan jika lupa minum obat',
            'follow_up_instructions' => 'Penjelasan kontrol kembali ke dokter',
            'emergency_contact' => 'Penjelasan kontak darurat',
        ];

        return response()->json([
            'success' => true,
            'data' => $checklist
        ]);
    }
}
