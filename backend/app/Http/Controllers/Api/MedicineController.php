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
            'category' => 'nullable|string|max:100',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
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

        if ($request->has('category')) {
            $query->where('category', 'like', '%' . $request->category . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Order by name
        $query->orderBy('name', 'asc');

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
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:50',
            'stock_quantity' => 'nullable|integer|min:0',
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

            $medicine = Medicine::create([
                'name' => $request->name,
                'generic_name' => $request->generic_name,
                'category' => $request->category,
                'unit' => $request->unit,
                'stock_quantity' => $request->stock_quantity ?? 0,
                'status' => $request->status ?? 'active'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Medicine created successfully',
                'data' => $medicine
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create medicine',
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
            'name' => 'sometimes|required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:50',
            'stock_quantity' => 'nullable|integer|min:0',
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
            $medicine->update($request->only([
                'name', 'generic_name', 'category', 'unit', 'stock_quantity', 'status'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Medicine updated successfully',
                'data' => $medicine
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update medicine',
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
                'message' => 'Medicine deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete medicine',
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
            'active_medicines' => Medicine::where('status', 'active')->count(),
            'inactive_medicines' => Medicine::where('status', 'inactive')->count(),
            'low_stock' => Medicine::where('stock_quantity', '<=', 10)->count(),
            'by_category' => Medicine::selectRaw('category, COUNT(*) as count')
                                  ->whereNotNull('category')
                                  ->groupBy('category')
                                  ->pluck('count', 'category')
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
        $medicines = Medicine::where('stock_quantity', '<=', 10)
                            ->where('status', 'active')
                            ->orderBy('stock_quantity', 'asc')
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
        $medicines = Medicine::where('category', $category)
                            ->where('status', 'active')
                            ->orderBy('name', 'asc')
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }
}
