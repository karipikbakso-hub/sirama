<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StockAdjustmentController extends Controller
{
    /**
     * Store a new stock adjustment.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'medicine_id' => 'required|exists:m_obat,id',
            'batch_id' => 'nullable|exists:medicine_batches,id',
            'type' => ['required', Rule::in(['in', 'out', 'adjustment', 'expired', 'damaged'])],
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
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

            $medicine = Medicine::findOrFail($request->medicine_id);
            $batch = $request->batch_id ? MedicineBatch::findOrFail($request->batch_id) : null;

            // Validate batch belongs to medicine if provided
            if ($batch && $batch->medicine_id !== $medicine->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batch does not belong to the specified medicine'
                ], 422);
            }

            // Create stock adjustment
            $adjustment = StockAdjustment::create([
                'medicine_id' => $request->medicine_id,
                'batch_id' => $request->batch_id,
                'type' => $request->type,
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'adjusted_by' => auth()->id() ?? 1, // Temporary: use user ID 1 if not authenticated
            ]);

            // Update stock based on adjustment type
            $this->updateStock($medicine, $batch, $request->type, $request->quantity);

            // Create stock movement log
            StockMovement::create([
                'medicine_id' => $request->medicine_id,
                'batch_id' => $request->batch_id,
                'type' => $request->type,
                'quantity' => $this->getSignedQuantity($request->type, $request->quantity),
                'reference_type' => 'stock_adjustment',
                'reference_id' => $adjustment->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock adjustment created successfully',
                'data' => $adjustment->load(['medicine', 'batch', 'adjustedBy'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create stock adjustment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock based on adjustment type.
     * Uses batch-level stock management for accurate tracking.
     */
    private function updateStock(Medicine $medicine, ?MedicineBatch $batch, string $type, int $quantity): void
    {
        $stockChange = $this->getStockChange($type, $quantity);

        // For adjustments without specific batch, use FEFO for outgoing, or first available batch for incoming
        if (!$batch) {
            if (in_array($type, ['out', 'expired', 'damaged'])) {
                // Use FEFO for outgoing adjustments
                $batch = $this->getFefoBatch($medicine);
            } elseif (in_array($type, ['in', 'adjustment'])) {
                // For incoming adjustments, use the first available batch or create logic
                // For positive adjustments, we need to choose a batch
                if ($stockChange > 0) {
                    $batch = $this->getFefoBatch($medicine) ?? MedicineBatch::where('medicine_id', $medicine->id)
                        ->where('expired_date', '>', now())
                        ->first();
                } else {
                    // For negative adjustments without batch, use FEFO
                    $batch = $this->getFefoBatch($medicine);
                }
            }
        }

        if ($batch) {
            // Update batch stock - ensure stock doesn't go negative for outgoing
            if ($stockChange < 0) {
                $newStock = max(0, $batch->stock + $stockChange); // Prevent negative stock
                $actualChange = $newStock - $batch->stock;
            } else {
                $newStock = $batch->stock + $stockChange;
                $actualChange = $stockChange;
            }

            $batch->increment('stock', $actualChange);

            // Log if we had to adjust due to negative stock prevention
            if ($actualChange !== $stockChange) {
                \Log::warning("Stock adjustment limited to prevent negative stock", [
                    'medicine_id' => $medicine->id,
                    'batch_id' => $batch->id,
                    'requested_change' => $stockChange,
                    'actual_change' => $actualChange
                ]);
            }
        } else {
            // If no batch found for adjustment, log error
            \Log::error("No suitable batch found for stock adjustment", [
                'medicine_id' => $medicine->id,
                'type' => $type,
                'quantity' => $quantity,
                'stock_change' => $stockChange
            ]);
        }

        // NOTE: We no longer update medicine.stock field to avoid duplication
        // Stock is calculated on-demand from batch sums in MedicineController
    }

    /**
     * Get batch using FEFO (First Expired First Out) for outgoing adjustments.
     */
    private function getFefoBatch(Medicine $medicine): ?MedicineBatch
    {
        return MedicineBatch::where('medicine_id', $medicine->id)
            ->where('expired_date', '>', now())
            ->where('stock', '>', 0)
            ->orderBy('expired_date', 'asc') // FEFO - closest expiry first
            ->first();
    }

    /**
     * Get stock change based on adjustment type.
     */
    private function getStockChange(string $type, int $quantity): int
    {
        return match($type) {
            'in', 'adjustment' => $quantity, // Positive for increase
            'out', 'expired', 'damaged' => -$quantity, // Negative for decrease
            default => 0
        };
    }

    /**
     * Get signed quantity for stock movement.
     */
    private function getSignedQuantity(string $type, int $quantity): int
    {
        $stockChange = $this->getStockChange($type, $quantity);
        return $stockChange;
    }
}
