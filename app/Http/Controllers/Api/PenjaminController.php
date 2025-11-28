<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penjamin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PenjaminController extends Controller
{
    /**
     * Display a listing of penjamin.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'jenis_penjamin' => 'nullable|string|in:bpjs,asuransi_swasta,perusahaan,pemerintah,perorangan',
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

        $query = Penjamin::query();

        // Apply filters
        if ($request->has('jenis_penjamin')) {
            $query->where('jenis_penjamin', $request->jenis_penjamin);
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
        $query->orderBy('nama_penjamin', 'asc');

        $penjamins = $query->paginate(
            $request->get('per_page', 50),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $penjamins
        ]);
    }

    /**
     * Get all active penjamin for dropdowns.
     */
    public function getActive(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'jenis_penjamin' => 'nullable|string|in:bpjs,asuransi_swasta,perusahaan,pemerintah,perorangan',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Penjamin::active();

        if ($request->has('jenis_penjamin')) {
            $query->where('jenis_penjamin', $request->jenis_penjamin);
        }

        $penjamins = $query->orderBy('nama_penjamin', 'asc')
                           ->get(['id', 'kode_penjamin', 'nama_penjamin', 'jenis_penjamin']);

        return response()->json([
            'success' => true,
            'data' => $penjamins
        ]);
    }

    /**
     * Get payment methods for registration (BPJS, Asuransi, Tunai).
     */
    public function getPaymentMethods(): JsonResponse
    {
        // Get BPJS penjamins
        $bpjs = Penjamin::active()->bpjs()->get(['id', 'nama_penjamin', 'jenis_penjamin']);

        // Get Asuransi penjamins
        $asuransi = Penjamin::active()->asuransi()->get(['id', 'nama_penjamin', 'jenis_penjamin']);

        // Add Tunai as default option
        $tunai = collect([
            (object)['id' => null, 'nama_penjamin' => 'Tunai', 'jenis_penjamin' => 'tunai']
        ]);

        $paymentMethods = [
            'bpjs' => $bpjs,
            'asuransi' => $asuransi,
            'tunai' => $tunai
        ];

        return response()->json([
            'success' => true,
            'data' => $paymentMethods
        ]);
    }

    /**
     * Display the specified penjamin.
     */
    public function show(Penjamin $penjamin): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $penjamin
        ]);
    }
}
