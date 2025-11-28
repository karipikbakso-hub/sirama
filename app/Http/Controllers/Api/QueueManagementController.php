<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\QueueManagement;
use Carbon\Carbon;

class QueueManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $queues = QueueManagement::with(['registration.patient'])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $queues
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queues',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get active queue items
     */
    public function active(): JsonResponse
    {
        try {
            $activeQueues = QueueManagement::with(['registration.patient'])
                ->where('status', 'active')
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $activeQueues
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active queues',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get today's queues
     */
    public function today(): JsonResponse
    {
        try {
            $today = today();

            $queues = QueueManagement::with(['registration.patient'])
                ->whereDate('created_at', $today)
                ->orderBy('status', 'asc')
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $queues
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch today\'s queues',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get active IGD queues with triage filtering
     */
    public function igdAktif(): JsonResponse
    {
        try {
            $today = today();

            // For now, return empty data to avoid relationship errors
            // We can add more logic later when we have proper data
            $emergencyQueues = [];

            return response()->json([
                'success' => true,
                'data' => $emergencyQueues,
                'debug' => [
                    'date_check' => $today->toDateString(),
                    'message' => 'Endpoint working - returning empty data for now'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch IGD active queues',
                'error' => config('app.debug') ? $e->getMessage() : null,
                'debug' => true
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
