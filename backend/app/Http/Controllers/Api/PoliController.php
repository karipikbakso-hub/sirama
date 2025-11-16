<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Poli;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PoliController extends Controller
{
    /**
     * Display a listing of poli.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'jenis_poli' => 'nullable|string|in:umum,spesialis,penunjang,gawat_darurat',
            'aktif' => 'nullable|boolean',
            'search' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Poli::query();

        // Apply filters
        if ($request->has('jenis_poli')) {
            $query->where('jenis_poli', $request->jenis_poli);
        }

        if ($request->has('aktif')) {
            $query->where('aktif', $request->aktif);
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        // Default to active only
        if (!$request->has('aktif')) {
            $query->active();
        }

        // Order by name
        $query->orderBy('nama_poli', 'asc');

        $polis = $query->paginate(
            $request->get('per_page', 50),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $polis
        ]);
    }

    /**
     * Get all active poli for dropdowns.
     */
    public function getActive(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'jenis_poli' => 'nullable|string|in:umum,spesialis,penunjang,gawat_darurat',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Poli::active();

        if ($request->has('jenis_poli')) {
            $query->where('jenis_poli', $request->jenis_poli);
        }

        $polis = $query->orderBy('nama_poli', 'asc')
                       ->get(['id', 'kode_poli', 'nama_poli', 'jenis_poli']);

        return response()->json([
            'success' => true,
            'data' => $polis
        ]);
    }

    /**
     * Display the specified poli.
     */
    public function show(Poli $poli): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $poli
        ]);
    }
}
