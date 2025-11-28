<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\DepositTransaction;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DepositController extends Controller
{
    /**
     * Get list of active deposits
     */
    public function index(Request $request): JsonResponse
    {
        $query = Deposit::with(['patient'])
            ->active()
            ->withBalance();

        // Search by patient name or medical record number
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('nama_pasien', 'like', "%{$search}%")
                  ->orWhere('no_rm', 'like', "%{$search}%");
            });
        }

        // Filter by deposit type
        if ($request->has('deposit_type') && !empty($request->deposit_type)) {
            $query->where('deposit_type', $request->deposit_type);
        }

        // Filter low balance deposits
        if ($request->has('low_balance') && $request->low_balance) {
            $query->where('balance', '<', 100000); // Default threshold
        }

        $deposits = $query->orderBy('updated_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $deposits,
            'message' => 'Data deposit berhasil diambil'
        ]);
    }

    /**
     * Get deposit detail with transactions
     */
    public function show($id): JsonResponse
    {
        $deposit = Deposit::with(['patient', 'transactions' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $deposit,
            'message' => 'Detail deposit berhasil diambil'
        ]);
    }

    /**
     * Top-up deposit
     */
    public function topUp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:m_pasien,id',
            'deposit_type' => 'required|in:rawat_inap,rawat_jalan',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:tunai,transfer,kartu_kredit,kartu_debit,e_wallet,bpjs',
            'reference_id' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:255'
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

            // Find or create deposit
            $deposit = Deposit::firstOrCreate(
                [
                    'patient_id' => $request->patient_id,
                    'deposit_type' => $request->deposit_type,
                    'status' => 'active'
                ],
                ['balance' => 0]
            );

            // Create transaction
            $transaction = DepositTransaction::create([
                'deposit_id' => $deposit->id,
                'type' => 'top_up',
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'reference_id' => $request->reference_id,
                'created_by' => auth()->id(),
                'notes' => $request->notes
            ]);

            // Update balance
            $deposit->updateBalance();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'deposit' => $deposit->load('patient'),
                    'transaction' => $transaction
                ],
                'message' => 'Top-up deposit berhasil'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan top-up deposit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refund deposit
     */
    public function refund(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
            'approved_by' => 'required|string|max:100'
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

            $deposit = Deposit::findOrFail($id);

            // Check if deposit has sufficient balance
            if ($deposit->balance < $request->amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo deposit tidak mencukupi'
                ], 400);
            }

            // Create refund transaction
            $transaction = DepositTransaction::create([
                'deposit_id' => $deposit->id,
                'type' => 'refund',
                'amount' => $request->amount,
                'payment_method' => 'tunai', // Refund typically in cash
                'created_by' => auth()->id(),
                'notes' => "Refund: {$request->reason}. Disetujui oleh: {$request->approved_by}"
            ]);

            // Update balance
            $deposit->updateBalance();

            // If balance becomes zero, mark as refunded
            if ($deposit->balance <= 0) {
                $deposit->update(['status' => 'refunded']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'deposit' => $deposit->load('patient'),
                    'transaction' => $transaction
                ],
                'message' => 'Refund deposit berhasil'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan refund deposit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deduct deposit (used by billing system)
     */
    public function deduct(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'reference_id' => 'required|string|max:50', // billing_id
            'description' => 'required|string|max:255'
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

            $deposit = Deposit::findOrFail($id);

            // Check if deposit has sufficient balance
            if ($deposit->balance < $request->amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo deposit tidak mencukupi'
                ], 400);
            }

            // Create deduct transaction
            $transaction = DepositTransaction::create([
                'deposit_id' => $deposit->id,
                'type' => 'deduct',
                'amount' => $request->amount,
                'reference_id' => $request->reference_id,
                'created_by' => auth()->id(),
                'notes' => $request->description
            ]);

            // Update balance
            $deposit->updateBalance();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'deposit' => $deposit->load('patient'),
                    'transaction' => $transaction
                ],
                'message' => 'Penggunaan deposit berhasil'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menggunakan deposit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get deposit statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_active_deposits' => Deposit::active()->count(),
            'total_balance' => Deposit::active()->sum('balance'),
            'low_balance_count' => Deposit::active()->where('balance', '<', 100000)->count(),
            'rawat_inap_count' => Deposit::active()->where('deposit_type', 'rawat_inap')->count(),
            'rawat_jalan_count' => Deposit::active()->where('deposit_type', 'rawat_jalan')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Statistik deposit berhasil diambil'
        ]);
    }

}
