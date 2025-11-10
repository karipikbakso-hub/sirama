<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\CatatanCppt;
use App\Models\ResepObat;
use App\Models\PesananLab;
use App\Models\PesananRadiologi;
use App\Models\Icd10Diagnosis;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class DoctorModuleController extends Controller
{
    // ==================== EMR (Electronic Medical Records) ====================

    /**
     * Get patient EMR data
     */
    public function getPatientEmr($patientId): JsonResponse
    {
        try {
            $patient = Patient::with([
                'registrations' => function($query) {
                    $query->latest()->first();
                },
                'patientHistories' => function($query) {
                    $query->orderBy('tanggal_kunjungan', 'desc');
                }
            ])->findOrFail($patientId);

            return response()->json([
                'success' => true,
                'data' => [
                    'patient' => $patient,
                    'vital_signs' => $this->getLatestVitalSigns($patientId),
                    'medical_history' => $patient->patientHistories,
                    'current_medications' => $this->getCurrentMedications($patientId),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve patient EMR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== CPPT (SOAP Documentation) ====================

    /**
     * Get CPPT entries for a patient
     */
    public function getCpptEntries(Request $request, $patientId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = CatatanCppt::with(['dokter', 'pembuat'])
                ->untukPasien($patientId)
                ->orderBy('tanggal_waktu', 'desc');

            $cpptEntries = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $cpptEntries
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve CPPT entries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new CPPT entry
     */
    public function createCpptEntry(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_pasien' => 'required|exists:patients,id',
            'id_dokter' => 'required|exists:m_dokter,id',
            'subjective' => 'nullable|string',
            'objective' => 'nullable|string',
            'assessment' => 'nullable|string',
            'plan' => 'nullable|string',
            'instruksi' => 'nullable|string',
            'evaluasi' => 'nullable|string',
            'jenis_profesi' => 'nullable|in:dokter,perawat,bidan,ahli_gizi,fisioterapis'
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

            $cppt = CatatanCppt::create([
                'id_pasien' => $request->id_pasien,
                'id_dokter' => $request->id_dokter,
                'tanggal_waktu' => now(),
                'subjective' => $request->subjective,
                'objective' => $request->objective,
                'assessment' => $request->assessment,
                'plan' => $request->plan,
                'instruksi' => $request->instruksi,
                'evaluasi' => $request->evaluasi,
                'jenis_profesi' => $request->jenis_profesi ?? 'dokter',
                'created_by' => Auth::id(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'CPPT entry created successfully',
                'data' => $cppt->load(['dokter', 'pembuat'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== DIAGNOSIS MANAGEMENT ====================

    /**
     * Get ICD-10 diagnoses
     */
    public function getIcd10Diagnoses(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
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

        try {
            $query = Icd10Diagnosis::query();

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $diagnoses = $query->paginate(
                $request->get('per_page', 20),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $diagnoses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve diagnoses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== PRESCRIPTION MANAGEMENT ====================

    /**
     * Get prescriptions for a patient
     */
    public function getPrescriptions(Request $request, $patientId): JsonResponse
    {
        try {
            $query = ResepObat::with(['dokter', 'pembuat'])
                ->untukPasien($patientId)
                ->orderBy('tanggal_resep', 'desc');

            $prescriptions = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $prescriptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prescriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new prescription
     */
    public function createPrescription(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_pasien' => 'required|exists:patients,id',
            'id_dokter' => 'required|exists:m_dokter,id',
            'diagnosa' => 'required|string|max:500',
            'catatan' => 'nullable|string|max:1000',
            'obat' => 'required|array|min:1',
            'obat.*.id_obat' => 'required|exists:m_obat,id',
            'obat.*.dosis' => 'required|string|max:100',
            'obat.*.frekuensi' => 'required|string|max:100',
            'obat.*.durasi' => 'required|string|max:50',
            'obat.*.instruksi' => 'nullable|string|max:255',
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

            $prescription = ResepObat::create([
                'id_pasien' => $request->id_pasien,
                'id_dokter' => $request->id_dokter,
                'tanggal_resep' => now(),
                'diagnosa' => $request->diagnosa,
                'status' => 'aktif',
                'catatan' => $request->catatan,
                'created_by' => Auth::id(),
            ]);

            // Here you would typically create prescription details
            // For now, we'll just return the prescription

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Prescription created successfully',
                'data' => $prescription->load(['dokter', 'pembuat'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== LAB ORDERS ====================

    /**
     * Get lab orders for a patient
     */
    public function getLabOrders(Request $request, $patientId): JsonResponse
    {
        try {
            $query = PesananLab::with(['dokter', 'pembuat'])
                ->untukPasien($patientId)
                ->orderBy('tanggal_pesanan', 'desc');

            $labOrders = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $labOrders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve lab orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create lab order
     */
    public function createLabOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_pasien' => 'required|exists:patients,id',
            'id_dokter' => 'required|exists:m_dokter,id',
            'diagnosa_klinis' => 'required|string|max:500',
            'urgensi' => 'required|in:rutin,cito,stat',
            'catatan' => 'nullable|string|max:1000',
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

            $labOrder = PesananLab::create([
                'id_pasien' => $request->id_pasien,
                'id_dokter' => $request->id_dokter,
                'id_laboratorium' => 1, // Default lab, you might want to make this configurable
                'tanggal_pesanan' => now(),
                'urgensi' => $request->urgensi,
                'status_pesanan' => 'menunggu',
                'diagnosa_klinis' => $request->diagnosa_klinis,
                'catatan' => $request->catatan,
                'created_by' => Auth::id(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lab order created successfully',
                'data' => $labOrder->load(['dokter', 'pembuat'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== RADIOLOGY ORDERS ====================

    /**
     * Get radiology orders for a patient
     */
    public function getRadiologyOrders(Request $request, $patientId): JsonResponse
    {
        try {
            $query = PesananRadiologi::with(['dokter', 'pembuat'])
                ->untukPasien($patientId)
                ->orderBy('tanggal_pesanan', 'desc');

            $radiologyOrders = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $radiologyOrders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve radiology orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create radiology order
     */
    public function createRadiologyOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_pasien' => 'required|exists:patients,id',
            'id_dokter' => 'required|exists:m_dokter,id',
            'diagnosa_klinis' => 'required|string|max:500',
            'urgensi' => 'required|in:rutin,cito,stat',
            'catatan' => 'nullable|string|max:1000',
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

            $radiologyOrder = PesananRadiologi::create([
                'id_pasien' => $request->id_pasien,
                'id_dokter' => $request->id_dokter,
                'id_radiologi' => 1, // Default radiology, you might want to make this configurable
                'tanggal_pesanan' => now(),
                'urgensi' => $request->urgensi,
                'status_pesanan' => 'menunggu',
                'diagnosa_klinis' => $request->diagnosa_klinis,
                'catatan' => $request->catatan,
                'created_by' => Auth::id(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Radiology order created successfully',
                'data' => $radiologyOrder->load(['dokter', 'pembuat'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create radiology order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get latest vital signs for a patient
     */
    private function getLatestVitalSigns($patientId)
    {
        // This would typically come from a vital signs table
        // For now, return mock data
        return [
            'blood_pressure' => '120/80 mmHg',
            'heart_rate' => '72 bpm',
            'temperature' => '36.5°C',
            'respiratory_rate' => '16/min',
            'oxygen_saturation' => '98%',
            'recorded_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get current medications for a patient
     */
    private function getCurrentMedications($patientId)
    {
        return ResepObat::with(['dokter'])
            ->untukPasien($patientId)
            ->aktif()
            ->orderBy('tanggal_resep', 'desc')
            ->get();
    }
}
