<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Icd10Diagnosis;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class Icd10DiagnosisController extends Controller
{
    /**
     * Display a listing of ICD-10 diagnoses with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'chapter' => 'nullable|string|max:100',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Icd10Diagnosis::query();

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        if ($request->has('chapter')) {
            $query->where('kategori', 'like', '%' . $request->chapter . '%');
        }

        if ($request->has('status')) {
            $query->where('aktif', $request->status === 'active' ? 1 : 0);
        }

        // Order by kode_icd
        $query->orderBy('kode_icd', 'asc');

        $diagnoses = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $diagnoses
        ]);
    }

    /**
     * Store a newly created ICD-10 diagnosis.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:10|unique:m_diagnosa,kode_icd',
            'description' => 'required|string|max:500',
            'chapter' => 'nullable|string|max:100',
            'status' => ['nullable', Rule::in(['active', 'inactive'])]
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

            $diagnosis = Icd10Diagnosis::create([
                'kode_icd' => $request->code,
                'nama_diagnosa' => $request->description,
                'kategori' => $request->chapter,
                'aktif' => ($request->status ?? 'active') === 'active' ? 1 : 0
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'ICD-10 diagnosis created successfully',
                'data' => $diagnosis
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create ICD-10 diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified ICD-10 diagnosis.
     */
    public function show(Icd10Diagnosis $icd10Diagnosis): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $icd10Diagnosis
        ]);
    }

    /**
     * Update the specified ICD-10 diagnosis.
     */
    public function update(Request $request, Icd10Diagnosis $icd10Diagnosis): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => ['sometimes', 'required', 'string', 'max:10', Rule::unique('m_diagnosa')->ignore($icd10Diagnosis->id)],
            'description' => 'sometimes|required|string|max:500',
            'chapter' => 'nullable|string|max:100',
            'status' => ['sometimes', Rule::in(['active', 'inactive'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = [
                'kode_icd' => $request->code,
                'nama_diagnosa' => $request->description,
                'kategori' => $request->chapter,
            ];

            if ($request->has('status')) {
                $updateData['aktif'] = $request->status === 'active' ? 1 : 0;
            }

            $icd10Diagnosis->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'ICD-10 diagnosis updated successfully',
                'data' => $icd10Diagnosis
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ICD-10 diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified ICD-10 diagnosis.
     */
    public function destroy(Icd10Diagnosis $icd10Diagnosis): JsonResponse
    {
        try {
            $icd10Diagnosis->delete();

            return response()->json([
                'success' => true,
                'message' => 'ICD-10 diagnosis deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ICD-10 diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ICD-10 diagnosis statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_icd10' => Icd10Diagnosis::count(),
            'active_icd10' => Icd10Diagnosis::where('aktif', 1)->count(),
            'inactive_icd10' => Icd10Diagnosis::where('aktif', 0)->count(),
            'by_chapter' => Icd10Diagnosis::selectRaw('kategori, COUNT(*) as count')
                                  ->whereNotNull('kategori')
                                  ->groupBy('kategori')
                                  ->pluck('count', 'kategori')
                                  ->toArray(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get most used ICD-10 diagnoses.
     */
    public function mostUsed(): JsonResponse
    {
        // This would typically join with patient_histories or registrations
        // For now, return active diagnoses ordered by kode_icd
        $diagnoses = Icd10Diagnosis::where('aktif', 1)
                                  ->orderBy('kode_icd', 'asc')
                                  ->limit(20)
                                  ->get();

        return response()->json([
            'success' => true,
            'data' => $diagnoses
        ]);
    }

    /**
     * Get recently used ICD-10 diagnoses.
     */
    public function recentlyUsed(): JsonResponse
    {
        // This would typically check recent usage in patient_histories
        // For now, return recently created diagnoses
        $diagnoses = Icd10Diagnosis::where('aktif', 1)
                                  ->orderBy('created_at', 'desc')
                                  ->limit(20)
                                  ->get();

        return response()->json([
            'success' => true,
            'data' => $diagnoses
        ]);
    }

    /**
     * Get ICD-10 diagnoses by chapter.
     */
    public function byChapter(string $chapter): JsonResponse
    {
        $diagnoses = Icd10Diagnosis::where('kategori', $chapter)
                                  ->where('aktif', 1)
                                  ->orderBy('kode_icd', 'asc')
                                  ->get();

        return response()->json([
            'success' => true,
            'data' => $diagnoses
        ]);
    }
}
