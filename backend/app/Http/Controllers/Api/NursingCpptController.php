<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CpptNursingEntry;
use App\Models\NursingDiagnosis;
use App\Models\NursingIntervention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class NursingCpptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CpptNursingEntry::with(['pasien', 'registrasi', 'user'])
            ->where('user_id', auth()->id()); // Only show entries created by current nurse

        // Filter by registration_id if provided
        if ($request->has('registration_id')) {
            $query->where('registration_id', $request->registration_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $cpptEntries = $query->orderBy('tanggal_waktu', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $cpptEntries,
            'message' => 'Daftar CPPT nursing entries berhasil diambil'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'registration_id' => 'required|exists:registrations,id',
            'subjective' => 'required|string',
            'objective' => 'required|string',
            'assessment' => 'required|string',
            'plan' => 'required|string',
            'nursing_diagnosis' => 'required|array',
            'nursing_diagnosis.*' => 'exists:nursing_diagnoses,id',
            'interventions' => 'required|array',
            'interventions.*' => 'exists:nursing_interventions,id',
            'shift' => 'required|in:pagi,siang,malam',
            'is_handover' => 'boolean'
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

            $cpptEntry = CpptNursingEntry::create([
                'pasien_id' => $request->registration_id ? DB::table('registrations')->where('id', $request->registration_id)->value('patient_id') : null,
                'registration_id' => $request->registration_id,
                'user_id' => auth()->id(),
                'tanggal_waktu' => now(),
                'shift' => $request->shift,
                'assessment' => json_encode([
                    'subjective' => $request->subjective,
                    'objective' => $request->objective,
                    'assessment' => $request->assessment,
                    'plan' => $request->plan
                ]),
                'diagnosis' => json_encode($request->nursing_diagnosis),
                'planning' => json_encode($request->plan),
                'intervention' => json_encode($request->interventions),
                'evaluation' => json_encode([
                    'is_handover' => $request->is_handover ?? false,
                    'handover_notes' => $request->handover_notes ?? null
                ]),
                'status' => 'draft'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $cpptEntry->load(['pasien', 'registrasi', 'user']),
                'message' => 'CPPT nursing entry berhasil dibuat'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat CPPT nursing entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $cpptEntry = CpptNursingEntry::with(['pasien', 'registrasi', 'user'])
            ->where('user_id', auth()->id()) // Only allow access to own entries
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $cpptEntry,
            'message' => 'Detail CPPT nursing entry berhasil diambil'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $cpptEntry = CpptNursingEntry::where('user_id', auth()->id())
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'subjective' => 'sometimes|required|string',
            'objective' => 'sometimes|required|string',
            'assessment' => 'sometimes|required|string',
            'plan' => 'sometimes|required|string',
            'nursing_diagnosis' => 'sometimes|required|array',
            'nursing_diagnosis.*' => 'exists:nursing_diagnoses,id',
            'interventions' => 'sometimes|required|array',
            'interventions.*' => 'exists:nursing_interventions,id',
            'shift' => 'sometimes|required|in:pagi,siang,malam',
            'is_handover' => 'boolean',
            'status' => 'sometimes|in:draft,active,completed,reviewed'
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

            $assessment = json_decode($cpptEntry->assessment, true) ?? [];
            if ($request->has('subjective')) $assessment['subjective'] = $request->subjective;
            if ($request->has('objective')) $assessment['objective'] = $request->objective;
            if ($request->has('assessment')) $assessment['assessment'] = $request->assessment;
            if ($request->has('plan')) $assessment['plan'] = $request->plan;

            $evaluation = json_decode($cpptEntry->evaluation, true) ?? [];
            if ($request->has('is_handover')) $evaluation['is_handover'] = $request->is_handover;
            if ($request->has('handover_notes')) $evaluation['handover_notes'] = $request->handover_notes;

            $cpptEntry->update([
                'shift' => $request->shift ?? $cpptEntry->shift,
                'assessment' => json_encode($assessment),
                'diagnosis' => $request->nursing_diagnosis ? json_encode($request->nursing_diagnosis) : $cpptEntry->diagnosis,
                'planning' => $request->plan ? json_encode($request->plan) : $cpptEntry->planning,
                'intervention' => $request->interventions ? json_encode($request->interventions) : $cpptEntry->intervention,
                'evaluation' => json_encode($evaluation),
                'status' => $request->status ?? $cpptEntry->status
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $cpptEntry->load(['pasien', 'registrasi', 'user']),
                'message' => 'CPPT nursing entry berhasil diupdate'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate CPPT nursing entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $cpptEntry = CpptNursingEntry::where('user_id', auth()->id())
            ->findOrFail($id);

        $cpptEntry->delete();

        return response()->json([
            'success' => true,
            'message' => 'CPPT nursing entry berhasil dihapus'
        ]);
    }

    /**
     * Search CPPT entries
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $registrationId = $request->get('registration_id');

        $cpptEntries = CpptNursingEntry::with(['pasien', 'registrasi', 'user'])
            ->where('user_id', auth()->id())
            ->when($registrationId, function($q) use ($registrationId) {
                return $q->where('registration_id', $registrationId);
            })
            ->when($query, function($q) use ($query) {
                return $q->where(function($subQ) use ($query) {
                    $subQ->where('assessment', 'LIKE', "%{$query}%")
                         ->orWhere('diagnosis', 'LIKE', "%{$query}%")
                         ->orWhere('planning', 'LIKE', "%{$query}%")
                         ->orWhere('intervention', 'LIKE', "%{$query}%");
                });
            })
            ->orderBy('tanggal_waktu', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cpptEntries,
            'message' => 'Pencarian CPPT nursing entries berhasil'
        ]);
    }

    /**
     * Search nursing diagnoses
     */
    public function searchDiagnoses(Request $request)
    {
        $query = $request->get('q', '');

        $diagnoses = NursingDiagnosis::where('active', true)
            ->when($query, function($q) use ($query) {
                return $q->where('diagnosis_name', 'LIKE', "%{$query}%")
                        ->orWhere('definition', 'LIKE', "%{$query}%");
            })
            ->orderBy('diagnosis_name')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $diagnoses,
            'message' => 'Pencarian nursing diagnoses berhasil'
        ]);
    }

    /**
     * Search nursing interventions
     */
    public function searchInterventions(Request $request)
    {
        $query = $request->get('q', '');

        $interventions = NursingIntervention::where('active', true)
            ->when($query, function($q) use ($query) {
                return $q->where('intervention_name', 'LIKE', "%{$query}%")
                        ->orWhere('definition', 'LIKE', "%{$query}%");
            })
            ->orderBy('intervention_name')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $interventions,
            'message' => 'Pencarian nursing interventions berhasil'
        ]);
    }
}