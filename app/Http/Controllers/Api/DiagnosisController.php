<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiagnosisPasien;
use App\Models\Diagnosa;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DiagnosisController extends Controller
{
    /**
     * Display a listing of patient diagnoses.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = DiagnosisPasien::with(['pasien', 'diagnosis', 'dokter', 'registrasi']);

            // Filter by patient
            if ($request->has('pasien_id') && $request->pasien_id) {
                $query->where('pasien_id', $request->pasien_id);
            }

            // Filter by doctor
            if ($request->has('dokter_id') && $request->dokter_id) {
                $query->where('dokter_id', $request->dokter_id);
            }

            // Filter by diagnosis type
            if ($request->has('tipe_diagnosis') && $request->tipe_diagnosis) {
                $query->where('tipe_diagnosis', $request->tipe_diagnosis);
            }

            // Filter by date range
            if ($request->has('tanggal_mulai') && $request->tanggal_mulai) {
                $query->whereDate('tanggal_diagnosis', '>=', $request->tanggal_mulai);
            }

            if ($request->has('tanggal_akhir') && $request->tanggal_akhir) {
                $query->whereDate('tanggal_diagnosis', '<=', $request->tanggal_akhir);
            }

            // Search by patient name or diagnosis name
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('pasien', function ($patientQuery) use ($search) {
                        $patientQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('mrn', 'like', "%{$search}%");
                    })
                    ->orWhereHas('diagnosis', function ($diagnosisQuery) use ($search) {
                        $diagnosisQuery->where('nama_diagnosa', 'like', "%{$search}%")
                                     ->orWhere('kode_icd', 'like', "%{$search}%");
                    });
                });
            }

            // Sort and paginate
            $perPage = $request->get('per_page', 15);
            $diagnoses = $query->orderBy('tanggal_diagnosis', 'desc')
                              ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data diagnosis pasien berhasil diambil',
                'data' => $diagnoses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created patient diagnosis.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'pasien_id' => 'required|exists:patients,id',
                'registrasi_id' => 'nullable|exists:registrations,id',
                'diagnosis_id' => 'required|exists:m_diagnosa,id',
                'tipe_diagnosis' => ['required', Rule::in(['utama', 'sekunder', 'komorbiditas'])],
                'kepastian' => ['required', Rule::in(['terkonfirmasi', 'presumtif', 'rule_out'])],
                'catatan' => 'nullable|string|max:1000',
                'tanggal_diagnosis' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['dokter_id'] = auth()->id(); // Set current user as doctor

            $diagnosis = DiagnosisPasien::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis pasien berhasil ditambahkan',
                'data' => $diagnosis->load(['pasien', 'diagnosis', 'dokter', 'registrasi'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified patient diagnosis.
     */
    public function show(DiagnosisPasien $diagnosis): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Data diagnosis berhasil diambil',
                'data' => $diagnosis->load(['pasien', 'diagnosis', 'dokter', 'registrasi'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified patient diagnosis.
     */
    public function update(Request $request, DiagnosisPasien $diagnosis): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'pasien_id' => 'sometimes|exists:patients,id',
                'registrasi_id' => 'nullable|exists:registrations,id',
                'diagnosis_id' => 'sometimes|exists:m_diagnosa,id',
                'tipe_diagnosis' => ['sometimes', Rule::in(['utama', 'sekunder', 'komorbiditas'])],
                'kepastian' => ['sometimes', Rule::in(['terkonfirmasi', 'presumtif', 'rule_out'])],
                'catatan' => 'nullable|string|max:1000',
                'tanggal_diagnosis' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $diagnosis->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis pasien berhasil diperbarui',
                'data' => $diagnosis->load(['pasien', 'diagnosis', 'dokter', 'registrasi'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified patient diagnosis.
     */
    public function destroy(DiagnosisPasien $diagnosis): JsonResponse
    {
        try {
            $diagnosis->delete();

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis pasien berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get master diagnosis data for dropdown.
     */
    public function getMasterDiagnoses(Request $request): JsonResponse
    {
        try {
            $query = Diagnosa::active(); // Only active diagnoses

            // Search by name or ICD code
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nama_diagnosa', 'like', "%{$search}%")
                      ->orWhere('kode_icd', 'like', "%{$search}%");
                });
            }

            // Filter by category
            if ($request->has('kategori') && $request->kategori) {
                $query->where('kategori', $request->kategori);
            }

            $diagnoses = $query->orderBy('nama_diagnosa')
                              ->limit(50)
                              ->get(['id', 'kode_icd', 'nama_diagnosa', 'kategori']);

            return response()->json([
                'success' => true,
                'message' => 'Data master diagnosis berhasil diambil',
                'data' => $diagnoses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data master diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get diagnosis statistics.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total_diagnoses' => DiagnosisPasien::count(),
                'by_type' => DiagnosisPasien::selectRaw('tipe_diagnosis, COUNT(*) as count')
                    ->groupBy('tipe_diagnosis')
                    ->pluck('count', 'tipe_diagnosis'),
                'by_certainty' => DiagnosisPasien::selectRaw('kepastian, COUNT(*) as count')
                    ->groupBy('kepastian')
                    ->pluck('count', 'kepastian'),
                'recent_diagnoses' => DiagnosisPasien::with(['pasien', 'diagnosis'])
                    ->orderBy('tanggal_diagnosis', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik diagnosis berhasil diambil',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
