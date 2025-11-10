<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'golongan_obat' => 'nullable|string|max:100',
            'aktif' => ['nullable', Rule::in([true, false, '1', '0'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Medicine::query();

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        if ($request->has('golongan_obat')) {
            $query->where('golongan_obat', 'like', '%' . $request->golongan_obat . '%');
        }

        if ($request->has('aktif')) {
            $query->where('aktif', $request->aktif);
        }

        // Order by nama_obat
        $query->orderBy('nama_obat', 'asc');

        $medicines = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nama_obat' => 'required|string|max:255',
            'nama_generik' => 'nullable|string|max:255',
            'golongan_obat' => 'nullable|string|max:100',
            'satuan' => 'nullable|string|max:50',
            'stok_minimum' => 'nullable|integer|min:0',
            'aktif' => ['nullable', Rule::in([true, false, '1', '0'])]
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

            $medicine = Medicine::create([
                'nama_obat' => $request->nama_obat,
                'nama_generik' => $request->nama_generik,
                'golongan_obat' => $request->golongan_obat,
                'satuan' => $request->satuan,
                'stok_minimum' => $request->stok_minimum ?? 0,
                'aktif' => $request->aktif ?? true
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Obat berhasil dibuat',
                'data' => $medicine
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified medicine.
     */
    public function show(Medicine $medicine): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $medicine
        ]);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, Medicine $medicine): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nama_obat' => 'sometimes|required|string|max:255',
            'nama_generik' => 'nullable|string|max:255',
            'golongan_obat' => 'nullable|string|max:100',
            'satuan' => 'nullable|string|max:50',
            'stok_minimum' => 'nullable|integer|min:0',
            'aktif' => ['sometimes', Rule::in([true, false, '1', '0'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicine->update($request->only([
                'nama_obat', 'nama_generik', 'golongan_obat', 'satuan', 'stok_minimum', 'aktif'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Obat berhasil diperbarui',
                'data' => $medicine
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified medicine.
     */
    public function destroy(Medicine $medicine): JsonResponse
    {
        try {
            $medicine->delete();

            return response()->json([
                'success' => true,
                'message' => 'Obat berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicine statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_medicines' => Medicine::count(),
            'active_medicines' => Medicine::where('aktif', true)->count(),
            'inactive_medicines' => Medicine::where('aktif', false)->count(),
            'low_stock' => Medicine::where('stok_minimum', '<=', 10)->count(),
            'by_category' => Medicine::selectRaw('golongan_obat, COUNT(*) as count')
                                  ->whereNotNull('golongan_obat')
                                  ->groupBy('golongan_obat')
                                  ->pluck('count', 'golongan_obat')
                                  ->toArray(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get low stock medicines.
     */
    public function lowStock(): JsonResponse
    {
        $medicines = Medicine::where('stok_minimum', '<=', 10)
                            ->where('aktif', true)
                            ->orderBy('stok_minimum', 'asc')
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }

    /**
     * Get medicines by category.
     */
    public function byCategory(string $category): JsonResponse
    {
        $medicines = Medicine::where('golongan_obat', $category)
                            ->where('aktif', true)
                            ->orderBy('nama_obat', 'asc')
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }
}
