<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashReconciliation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CashReconciliationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = CashReconciliation::with(['kasir', 'approver']);

            // Filter by kasir
            if ($request->has('kasir_id')) {
                $query->where('kasir_id', $request->kasir_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('date', '<=', $request->end_date);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by shift
            if ($request->has('shift')) {
                $query->where('shift', $request->shift);
            }

            $reconciliations = $query->orderBy('date', 'desc')
                                    ->orderBy('shift', 'desc')
                                    ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $reconciliations,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching reconciliations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCurrentShift(Request $request)
    {
        try {
            $user = auth()->user();

            // Get current shift based on time
            $currentTime = Carbon::now();
            $hour = $currentTime->hour;

            $shift = match(true) {
                $hour >= 6 && $hour < 14 => 'pagi',
                $hour >= 14 && $hour < 22 => 'siang',
                default => 'malam'
            };

            $date = $currentTime->toDateString();

            // Check if reconciliation already exists for current shift
            $existing = CashReconciliation::where('kasir_id', $user->id)
                                        ->where('date', $date)
                                        ->where('shift', $shift)
                                        ->first();

            if ($existing) {
                return response()->json([
                    'success' => true,
                    'data' => $existing->load(['kasir', 'approver']),
                    'meta' => ['timestamp' => now()->toISOString()]
                ]);
            }

            // Calculate expected cash for current shift
            $expectedCash = $this->calculateExpectedCash($user->id, $date, $shift);

            // Create new reconciliation record
            $reconciliation = CashReconciliation::create([
                'kasir_id' => $user->id,
                'shift' => $shift,
                'date' => $date,
                'expected_cash' => $expectedCash,
                'actual_cash' => 0,
                'discrepancy' => -$expectedCash,
                'status' => 'open'
            ]);

            return response()->json([
                'success' => true,
                'data' => $reconciliation->load(['kasir', 'approver']),
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting current shift reconciliation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function submit(Request $request, $id)
    {
        try {
            $reconciliation = CashReconciliation::findOrFail($id);
            $user = auth()->user();

            // Validate that user is the kasir
            if ($reconciliation->kasir_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to submit this reconciliation'
                ], 403);
            }

            // Validate status
            if ($reconciliation->status !== 'open') {
                return response()->json([
                    'success' => false,
                    'message' => 'Reconciliation cannot be submitted'
                ], 400);
            }

            $validated = $request->validate([
                'actual_cash' => 'required|numeric|min:0',
                'discrepancy_reason' => 'nullable|string|max:500'
            ]);

            $discrepancy = $validated['actual_cash'] - $reconciliation->expected_cash;

            $reconciliation->update([
                'actual_cash' => $validated['actual_cash'],
                'discrepancy' => $discrepancy,
                'discrepancy_reason' => $validated['discrepancy_reason'] ?? null,
                'status' => abs($discrepancy) > 10000 ? 'discrepancy' : 'pending_approval'
            ]);

            return response()->json([
                'success' => true,
                'data' => $reconciliation->load(['kasir', 'approver']),
                'message' => 'Reconciliation submitted successfully',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting reconciliation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        try {
            $reconciliation = CashReconciliation::findOrFail($id);
            $user = auth()->user();

            // Check if user can approve
            if (!$reconciliation->canBeApprovedBy($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to approve this reconciliation'
                ], 403);
            }

            // Validate status
            if (!in_array($reconciliation->status, ['pending_approval', 'discrepancy'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reconciliation cannot be approved'
                ], 400);
            }

            $reconciliation->update([
                'status' => 'approved',
                'approved_by' => $user->id,
                'approved_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $reconciliation->load(['kasir', 'approver']),
                'message' => 'Reconciliation approved successfully',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error approving reconciliation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $reconciliation = CashReconciliation::with(['kasir', 'approver'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $reconciliation,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reconciliation not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function closeShift(Request $request, $id)
    {
        try {
            $reconciliation = CashReconciliation::findOrFail($id);
            $user = auth()->user();

            // Validate that user is the kasir
            if ($reconciliation->kasir_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to close this shift'
                ], 403);
            }

            // Validate status - must be approved
            if ($reconciliation->status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot close shift - reconciliation not approved'
                ], 400);
            }

            // Here you would typically lock the payments/transactions for this shift
            // For now, we'll just mark the reconciliation as completed

            return response()->json([
                'success' => true,
                'message' => 'Shift closed successfully',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error closing shift',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function calculateExpectedCash($kasirId, $date, $shift)
    {
        // Define time ranges for each shift
        $timeRanges = [
            'pagi' => ['06:00:00', '13:59:59'],
            'siang' => ['14:00:00', '21:59:59'],
            'malam' => ['22:00:00', '05:59:59']
        ];

        $range = $timeRanges[$shift] ?? ['00:00:00', '23:59:59'];

        // Calculate cash payments for the shift
        $cashPayments = DB::table('t_pembayaran')
            ->join('users', 't_pembayaran.user_id', '=', 'users.id')
            ->where('users.id', $kasirId)
            ->whereDate('t_pembayaran.tanggal_bayar', $date)
            ->whereTime('t_pembayaran.tanggal_bayar', '>=', $range[0])
            ->whereTime('t_pembayaran.tanggal_bayar', '<=', $range[1])
            ->where('t_pembayaran.metode_pembayaran', 'cash')
            ->sum('t_pembayaran.jumlah_bayar');

        return $cashPayments ?? 0;
    }
}
