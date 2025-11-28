<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Poli;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PoliController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Poli::query();

        // Filter active polis only
        if ($request->has('active_only') && $request->boolean('active_only')) {
            $query->where('aktif', true);
        }

        $polis = $query->orderBy('nama_poli')->get();

        return response()->json([
            'success' => true,
            'data' => $polis
        ]);
    }

    /**
     * Get active polis for registration form.
     */
    public function getActive(): JsonResponse
    {
        $polis = Poli::where('aktif', true)
            ->orderBy('nama_poli')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $polis
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Poli $poli): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $poli
        ]);
    }
}
