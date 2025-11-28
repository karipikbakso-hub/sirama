<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class StockMovementController extends Controller
{
    /**
      * Display a listing of stock movements with filtering and pagination.
      */
     public function index(Request $request): JsonResponse
     {
         $validator = Validator::make($request->all(), [
             'medicine_id' => 'nullable|exists:m_obat,id',
             'batch_id' => 'nullable|exists:medicine_batches,id',
             'type' => 'nullable|string|in:in,out,adjustment,expired,damaged',
             'date_from' => 'nullable|date',
             'date_to' => 'nullable|date',
             'per_page' => 'nullable|integer|min:1|max:100',
         ]);

         if ($validator->fails()) {
             return response()->json([
                 'success' => false,
                 'message' => 'Validation error',
                 'errors' => $validator->errors()
             ], 422);
         }

         $query = StockMovement::with(['medicine', 'batch']);

         // Apply filters
         if ($request->has('medicine_id') && !empty($request->medicine_id)) {
             $query->where('medicine_id', $request->medicine_id);
         }

         if ($request->has('batch_id') && !empty($request->batch_id)) {
             $query->where('batch_id', $request->batch_id);
         }

         if ($request->has('type') && !empty($request->type)) {
             $query->where('type', $request->type);
         }

         if ($request->has('date_from') && !empty($request->date_from)) {
             $query->where('created_at', '>=', $request->date_from . ' 00:00:00');
         }

         if ($request->has('date_to') && !empty($request->date_to)) {
             $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
         }

         // Order by creation date (most recent first)
         $query->orderBy('created_at', 'desc');

         $movements = $query->paginate(
             $request->get('per_page', 50), // Changed to 50 as per requirement
             ['*'],
             'page',
             $request->get('page', 1)
         );

         return response()->json([
             'success' => true,
             'data' => $movements
         ]);
     }

     /**
      * Export stock movements to Excel (CSV format).
      */
     public function export(Request $request): JsonResponse
     {
         $validator = Validator::make($request->all(), [
             'medicine_id' => 'nullable|exists:m_obat,id',
             'batch_id' => 'nullable|exists:medicine_batches,id',
             'type' => 'nullable|string|in:in,out,adjustment,expired,damaged',
             'date_from' => 'nullable|date',
             'date_to' => 'nullable|date',
         ]);

         if ($validator->fails()) {
             return response()->json([
                 'success' => false,
                 'message' => 'Validation error',
                 'errors' => $validator->errors()
             ], 422);
         }

         try {
             $query = StockMovement::with(['medicine', 'batch']);

             // Apply same filters as index
             if ($request->has('medicine_id') && !empty($request->medicine_id)) {
                 $query->where('medicine_id', $request->medicine_id);
             }

             if ($request->has('batch_id') && !empty($request->batch_id)) {
                 $query->where('batch_id', $request->batch_id);
             }

             if ($request->has('type') && !empty($request->type)) {
                 $query->where('type', $request->type);
             }

             if ($request->has('date_from') && !empty($request->date_from)) {
                 $query->where('created_at', '>=', $request->date_from . ' 00:00:00');
             }

             if ($request->has('date_to') && !empty($request->date_to)) {
                 $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
             }

             $movements = $query->orderBy('created_at', 'desc')->get();

             // Generate CSV content
             $csvContent = "Tanggal,Nama Obat,Tipe Pergerakan,Jumlah,Satuan,Referensi,Batch Number\n";

             foreach ($movements as $movement) {
                 $typeLabels = [
                     'in' => 'Penerimaan',
                     'out' => 'Pengeluaran',
                     'adjustment' => 'Penyesuaian',
                     'expired' => 'Kadaluarsa',
                     'damaged' => 'Rusak'
                 ];

                 $reference = '';
                 if ($movement->reference_type === 'prescription') {
                     $reference = 'Resep #' . $movement->reference_id;
                 } elseif ($movement->reference_type === 'adjustment') {
                     $reference = 'Penyesuaian #' . $movement->reference_id;
                 }

                 $csvContent .= sprintf(
                     "\"%s\",\"%s\",\"%s\",\"%d\",\"%s\",\"%s\",\"%s\"\n",
                     $movement->created_at->format('d/m/Y H:i'),
                     str_replace('"', '""', $movement->medicine->nama_obat ?? ''),
                     $typeLabels[$movement->type] ?? $movement->type,
                     $movement->quantity,
                     $movement->medicine->satuan ?? '',
                     $reference,
                     $movement->batch->batch_number ?? ''
                 );
             }

             // Encode as base64 for frontend download
             $encodedContent = base64_encode($csvContent);
             $filename = 'mutasi_stok_' . now()->format('Y-m-d_H-i-s') . '.csv';

             return response()->json([
                 'success' => true,
                 'data' => [
                     'content' => $encodedContent,
                     'filename' => $filename,
                     'mime_type' => 'text/csv',
                     'size' => strlen($csvContent)
                 ],
                 'message' => 'Stock movements export generated successfully'
             ]);

         } catch (\Exception $e) {
             return response()->json([
                 'success' => false,
                 'message' => 'Failed to generate stock movements export',
                 'error' => $e->getMessage()
             ], 500);
         }
     }
}
