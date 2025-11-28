<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseRequisition;
use App\Models\PurchaseRequisitionItem;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PurchaseRequisitionController extends Controller
{
    /**
     * Get list of purchase requisitions
     */
    public function index(Request $request)
    {
        try {
            $query = PurchaseRequisition::with(['creator', 'approver', 'items.medicine']);

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by creator (for non-admin users)
            $user = auth()->user();
            if ($user && !$user->hasRole('admin') && !$user->hasRole('kepala_farmasi')) {
                $query->where('created_by', $user->id);
            }

            $purchaseRequisitions = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $purchaseRequisitions,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching purchase requisitions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicines that need reorder (low stock)
     */
    public function getMedicinesNeedReorder(Request $request)
    {
        try {
            // Get medicines with their current stock calculated from batches
            $medicines = Medicine::active()
                ->select('m_obat.*')
                ->selectRaw('(SELECT COALESCE(SUM(stock), 0) FROM medicine_batches WHERE medicine_batches.medicine_id = m_obat.id AND medicine_batches.expired_date > ?) as current_stock', [now()])
                ->with(['batches' => function($query) {
                    $query->where('expired_date', '>', now())
                           ->orderBy('expired_date', 'asc');
                }])
                ->get()
                ->filter(function($medicine) {
                    return $medicine->current_stock < ($medicine->stok_minimum ?? 0);
                })
                ->map(function($medicine) {
                    $currentStock = $medicine->current_stock ?? 0;
                    $reorderPoint = $medicine->stok_minimum ?? 0;
                    $suggestedQuantity = max(0, ($reorderPoint - $currentStock) * 2);

                    return [
                        'id' => $medicine->id,
                        'name' => $medicine->nama_obat,
                        'generic_name' => $medicine->nama_generik,
                        'current_stock' => $currentStock,
                        'reorder_point' => $reorderPoint,
                        'suggested_quantity' => $suggestedQuantity,
                        'unit' => $medicine->satuan,
                        'batches' => $medicine->batches->map(function($batch) {
                            return [
                                'id' => $batch->id,
                                'batch_number' => $batch->batch_number,
                                'stock' => $batch->stock,
                                'expired_date' => $batch->expired_date,
                            ];
                        })
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $medicines,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching medicines that need reorder',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new purchase requisition
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'notes' => 'nullable|string|max:1000',
                'items' => 'required|array|min:1',
                'items.*.medicine_id' => 'required|exists:m_obat,id',
                'items.*.quantity_requested' => 'required|integer|min:1',
                'items.*.notes' => 'nullable|string|max:500',
            ]);

            DB::beginTransaction();

            $user = auth()->user();
            $pr = PurchaseRequisition::create([
                'pr_number' => PurchaseRequisition::generatePrNumber(),
                'status' => 'draft',
                'created_by' => $user ? $user->id : null,
                'notes' => $request->notes,
                'total_items' => count($request->items),
                'total_quantity' => collect($request->items)->sum('quantity_requested'),
            ]);

            foreach ($request->items as $itemData) {
                PurchaseRequisitionItem::create([
                    'purchase_requisition_id' => $pr->id,
                    'medicine_id' => $itemData['medicine_id'],
                    'quantity_requested' => $itemData['quantity_requested'],
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pr->load(['creator', 'items.medicine']),
                'message' => 'Purchase requisition created successfully',
                'meta' => ['timestamp' => now()->toISOString()]
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating purchase requisition',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific purchase requisition
     */
    public function show(PurchaseRequisition $purchaseRequisition)
    {
        try {
            $user = auth()->user();
            // Check permissions
            if ($user && !$user->hasRole(['admin', 'kepala_farmasi']) &&
                $purchaseRequisition->created_by !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $purchaseRequisition->load(['creator', 'approver', 'items.medicine']);

            return response()->json([
                'success' => true,
                'data' => $purchaseRequisition,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching purchase requisition',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit PR for approval
     */
    public function submit(PurchaseRequisition $purchaseRequisition)
    {
        try {
            $user = auth()->user();
            // Check permissions
            if ($user && $purchaseRequisition->created_by !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            if (!$purchaseRequisition->submitForApproval()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot submit purchase requisition for approval'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $purchaseRequisition->load(['creator', 'items.medicine']),
                'message' => 'Purchase requisition submitted for approval',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting purchase requisition',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve PR
     */
    public function approve(Request $request, PurchaseRequisition $purchaseRequisition)
    {
        try {
            $user = auth()->user();
            // Check permissions - only kepala_farmasi can approve
            if (!$user || !$user->hasRole('kepala_farmasi')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - Only Kepala Farmasi can approve purchase requisitions'
                ], 403);
            }

            $request->validate([
                'approved_quantities' => 'required|array',
                'approved_quantities.*.item_id' => 'required|exists:purchase_requisition_items,id',
                'approved_quantities.*.quantity_approved' => 'required|integer|min:0',
                'approved_quantities.*.unit_price' => 'nullable|numeric|min:0',
            ]);

            DB::beginTransaction();

            // Update approved quantities
            foreach ($request->approved_quantities as $approval) {
                $item = PurchaseRequisitionItem::find($approval['item_id']);
                if ($item && $item->purchase_requisition_id === $purchaseRequisition->id) {
                    $item->update([
                        'quantity_approved' => $approval['quantity_approved'],
                        'unit_price' => $approval['unit_price'] ?? null,
                    ]);
                }
            }

            // Approve the PR
            if (!$purchaseRequisition->approve($user->id)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot approve purchase requisition'
                ], 400);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $purchaseRequisition->load(['creator', 'approver', 'items.medicine']),
                'message' => 'Purchase requisition approved successfully',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error approving purchase requisition',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject PR
     */
    public function reject(Request $request, PurchaseRequisition $purchaseRequisition)
    {
        try {
            $user = auth()->user();
            // Check permissions - only kepala_farmasi can reject
            if (!$user || !$user->hasRole('kepala_farmasi')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - Only Kepala Farmasi can reject purchase requisitions'
                ], 403);
            }

            $request->validate([
                'rejection_reason' => 'required|string|max:1000',
            ]);

            if (!$purchaseRequisition->reject(auth()->id())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot reject purchase requisition'
                ], 400);
            }

            // Update notes with rejection reason
            $purchaseRequisition->update([
                'notes' => ($purchaseRequisition->notes ? $purchaseRequisition->notes . "\n\n" : '') .
                           "Rejected by " . $user->name . " on " . now()->format('Y-m-d H:i:s') .
                           "\nReason: " . $request->rejection_reason
            ]);

            return response()->json([
                'success' => true,
                'data' => $purchaseRequisition->load(['creator', 'approver', 'items.medicine']),
                'message' => 'Purchase requisition rejected',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting purchase requisition',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convert approved PR to PO
     */
    public function convertToPo(PurchaseRequisition $purchaseRequisition)
    {
        try {
            // Check permissions - only approved PRs can be converted
            if ($purchaseRequisition->status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only approved purchase requisitions can be converted to PO'
                ], 400);
            }

            if (!$purchaseRequisition->convertToPo()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot convert purchase requisition to PO'
                ], 400);
            }

            // Here you would typically create a Purchase Order record
            // For now, we'll just mark it as converted

            return response()->json([
                'success' => true,
                'data' => $purchaseRequisition->load(['creator', 'approver', 'items.medicine']),
                'message' => 'Purchase requisition converted to PO successfully',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error converting purchase requisition to PO',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete PR (only draft status)
     */
    public function destroy(PurchaseRequisition $purchaseRequisition)
    {
        try {
            $user = auth()->user();
            // Check permissions
            if ($user && $purchaseRequisition->created_by !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Only draft PRs can be deleted
            if ($purchaseRequisition->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft purchase requisitions can be deleted'
                ], 400);
            }

            $purchaseRequisition->delete();

            return response()->json([
                'success' => true,
                'message' => 'Purchase requisition deleted successfully',
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting purchase requisition',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
