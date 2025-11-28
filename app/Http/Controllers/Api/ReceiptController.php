<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('receipts')
                ->join('t_pembayaran', 'receipts.payment_id', '=', 't_pembayaran.id')
                ->join('t_billing', 't_pembayaran.billing_id', '=', 't_billing.id')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_pembayaran.user_id', '=', 'users.id')
                ->select(
                    'receipts.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'users.name as cashier_name',
                    't_pembayaran.jumlah_bayar as payment_amount',
                    't_pembayaran.metode_bayar as payment_method',
                    't_pembayaran.tanggal_bayar as payment_date',
                    't_billing.no_invoice'
                );

            // Search
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('m_pasien.nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('m_pasien.no_rm', 'like', "%{$search}%")
                      ->orWhere('receipts.receipt_number', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status') && !empty($request->status)) {
                $query->where('receipts.status', $request->status);
            }

            // Filter by payment method
            if ($request->has('payment_method') && !empty($request->payment_method)) {
                $query->where('t_pembayaran.metode_bayar', $request->payment_method);
            }

            // Filter by date range
            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->whereDate('t_pembayaran.tanggal_bayar', '>=', $request->start_date);
            }
            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->whereDate('t_pembayaran.tanggal_bayar', '<=', $request->end_date);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $receipts = $query->orderBy('receipts.created_at', 'desc')
                              ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $receipts,
                'message' => 'Receipts retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve receipts: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $receipt = DB::table('receipts')
                ->join('t_pembayaran', 'receipts.payment_id', '=', 't_pembayaran.id')
                ->join('t_billing', 't_pembayaran.billing_id', '=', 't_billing.id')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_pembayaran.user_id', '=', 'users.id')
                ->leftJoin('m_poli', 't_registrasi.poli_id', '=', 'm_poli.id')
                ->leftJoin('m_penjamin', 't_registrasi.penjamin_id', '=', 'm_penjamin.id')
                ->where('receipts.id', $id)
                ->select(
                    'receipts.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.tanggal_lahir as date_of_birth',
                    'm_pasien.alamat as address',
                    'users.name as cashier_name',
                    'm_poli.nama_poli',
                    'm_penjamin.nama_penjamin as insurance_type',
                    't_registrasi.tanggal_registrasi',
                    't_registrasi.jenis_kunjungan',
                    't_pembayaran.jumlah_bayar as payment_amount',
                    't_pembayaran.metode_bayar as payment_method',
                    't_pembayaran.no_referensi as reference_number',
                    't_pembayaran.tanggal_bayar as payment_date',
                    't_billing.no_invoice',
                    't_billing.total_tagihan as billing_amount'
                )
                ->first();

            if (!$receipt) {
                return response()->json([
                    'success' => false,
                    'message' => 'Receipt not found'
                ], 404);
            }

            // Get billing items breakdown
            $billingItems = $this->getBillingItemsBreakdown($receipt->registrasi_id ?? $receipt->billing_id);

            return response()->json([
                'success' => true,
                'data' => [
                    'receipt' => $receipt,
                    'items' => $billingItems
                ],
                'message' => 'Receipt details retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve receipt details: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reprint($id)
    {
        try {
            $receipt = DB::table('receipts')
                ->join('t_pembayaran', 'receipts.payment_id', '=', 't_pembayaran.id')
                ->join('t_billing', 't_pembayaran.billing_id', '=', 't_billing.id')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_pembayaran.user_id', '=', 'users.id')
                ->leftJoin('m_poli', 't_registrasi.poli_id', '=', 'm_poli.id')
                ->leftJoin('m_penjamin', 't_registrasi.penjamin_id', '=', 'm_penjamin.id')
                ->where('receipts.id', $id)
                ->select(
                    'receipts.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.tanggal_lahir as date_of_birth',
                    'm_pasien.alamat as address',
                    'users.name as cashier_name',
                    'm_poli.nama_poli',
                    'm_penjamin.nama_penjamin as insurance_type',
                    't_registrasi.tanggal_registrasi',
                    't_pembayaran.jumlah_bayar as payment_amount',
                    't_pembayaran.metode_bayar as payment_method',
                    't_pembayaran.no_referensi as reference_number',
                    't_pembayaran.tanggal_bayar as payment_date',
                    't_billing.no_invoice',
                    't_billing.total_tagihan as billing_amount'
                )
                ->first();

            if (!$receipt) {
                return response()->json([
                    'success' => false,
                    'message' => 'Receipt not found'
                ], 404);
            }

            $billingItems = $this->getBillingItemsBreakdown($receipt->registrasi_id ?? $receipt->billing_id);

            $data = [
                'receipt' => $receipt,
                'items' => $billingItems,
                'is_reprint' => true, // Flag for watermark
                'hospital' => [
                    'name' => 'Rumah Sakit SIRAMA',
                    'address' => 'Jl. Kesehatan No. 123, Jakarta',
                    'phone' => '(021) 12345678',
                    'email' => 'info@sirama-hospital.com'
                ]
            ];

            $pdf = Pdf::loadView('pdf.receipt', $data);

            return $pdf->download('receipt_' . $receipt->receipt_number . '_reprint.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reprint receipt: ' . $e->getMessage()
            ], 500);
        }
    }

    public function void(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $receipt = Receipt::find($id);
            if (!$receipt) {
                return response()->json([
                    'success' => false,
                    'message' => 'Receipt not found'
                ], 404);
            }

            if ($receipt->status === 'voided') {
                return response()->json([
                    'success' => false,
                    'message' => 'Receipt is already voided'
                ], 422);
            }

            $receipt->update([
                'status' => 'voided',
                'voided_at' => now(),
                'void_reason' => $request->reason,
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Receipt voided successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to void receipt: ' . $e->getMessage()
            ], 500);
        }
    }

    public function export(Request $request)
    {
        try {
            // Similar query as index but without pagination
            $query = DB::table('receipts')
                ->join('t_pembayaran', 'receipts.payment_id', '=', 't_pembayaran.id')
                ->join('t_billing', 't_pembayaran.billing_id', '=', 't_billing.id')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_pembayaran.user_id', '=', 'users.id')
                ->select(
                    'receipts.receipt_number',
                    'receipts.status',
                    'receipts.created_at',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    't_pembayaran.jumlah_bayar as payment_amount',
                    't_pembayaran.metode_bayar as payment_method',
                    'users.name as cashier_name',
                    't_billing.no_invoice'
                );

            // Apply same filters as index
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('m_pasien.nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('m_pasien.no_rm', 'like', "%{$search}%")
                      ->orWhere('receipts.receipt_number', 'like', "%{$search}%");
                });
            }

            if ($request->has('status') && !empty($request->status)) {
                $query->where('receipts.status', $request->status);
            }

            if ($request->has('payment_method') && !empty($request->payment_method)) {
                $query->where('t_pembayaran.metode_bayar', $request->payment_method);
            }

            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->whereDate('t_pembayaran.tanggal_bayar', '>=', $request->start_date);
            }
            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->whereDate('t_pembayaran.tanggal_bayar', '<=', $request->end_date);
            }

            $receipts = $query->orderBy('receipts.created_at', 'desc')->get();

            // Convert to Excel format (simplified - in real implementation you'd use Laravel Excel)
            $filename = 'receipts_' . now()->format('Y-m-d_H-i-s') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ];

            $callback = function() use ($receipts) {
                $file = fopen('php://output', 'w');

                // CSV headers
                fputcsv($file, [
                    'No. Kwitansi',
                    'Status',
                    'Tanggal',
                    'Nama Pasien',
                    'No. RM',
                    'Jumlah Bayar',
                    'Metode Bayar',
                    'Kasir',
                    'No. Invoice'
                ]);

                // CSV data
                foreach ($receipts as $receipt) {
                    fputcsv($file, [
                        $receipt->receipt_number,
                        $receipt->status,
                        $receipt->created_at,
                        $receipt->patient_name,
                        $receipt->medical_record_number,
                        $receipt->payment_amount,
                        $receipt->payment_method,
                        $receipt->cashier_name,
                        $receipt->no_invoice
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export receipts: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getBillingItemsBreakdown($registrationId)
    {
        $items = [];

        // Get billing from registration
        $billing = DB::table('t_billing')->where('registrasi_id', $registrationId)->first();
        if (!$billing) return $items;

        // Consultation fee from registration
        $registration = DB::table('t_registrasi')->where('id', $registrationId)->first();
        if ($registration && $registration->biaya_registrasi > 0) {
            $items[] = [
                'type' => 'consultation',
                'description' => 'Biaya Konsultasi',
                'quantity' => 1,
                'unit_price' => $registration->biaya_registrasi,
                'total' => $registration->biaya_registrasi
            ];
        }

        // Medicine from prescriptions
        $prescriptionItems = DB::table('prescription_items')
            ->join('prescriptions', 'prescription_items.prescription_id', '=', 'prescriptions.id')
            ->join('m_obat', 'prescription_items.medicine_id', '=', 'm_obat.id')
            ->where('prescriptions.registration_id', $registrationId)
            ->select(
                'm_obat.nama_obat as description',
                'prescription_items.quantity',
                'prescription_items.price_per_unit as unit_price',
                DB::raw('(prescription_items.quantity * prescription_items.price_per_unit) as total')
            )
            ->get();

        foreach ($prescriptionItems as $item) {
            $items[] = [
                'type' => 'medicine',
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total' => $item->total
            ];
        }

        // Lab tests
        $labOrders = DB::table('t_laboratorium')
            ->join('m_laboratorium', 't_laboratorium.lab_id', '=', 'm_laboratorium.id')
            ->where('t_laboratorium.registrasi_id', $registrationId)
            ->where('t_laboratorium.status', 'selesai')
            ->select(
                'm_laboratorium.nama_pemeriksaan as description',
                't_laboratorium.tarif as unit_price'
            )
            ->get();

        foreach ($labOrders as $item) {
            $items[] = [
                'type' => 'lab',
                'description' => $item->description,
                'quantity' => 1,
                'unit_price' => $item->unit_price,
                'total' => $item->unit_price
            ];
        }

        // Radiology
        $radiologyOrders = DB::table('t_radiologi')
            ->join('m_radiologi', 't_radiologi.radio_id', '=', 'm_radiologi.id')
            ->where('t_radiologi.registrasi_id', $registrationId)
            ->where('t_radiologi.status', 'selesai')
            ->select(
                'm_radiologi.nama_pemeriksaan as description',
                't_radiologi.tarif as unit_price'
            )
            ->get();

        foreach ($radiologyOrders as $item) {
            $items[] = [
                'type' => 'radiology',
                'description' => $item->description,
                'quantity' => 1,
                'unit_price' => $item->unit_price,
                'total' => $item->unit_price
            ];
        }

        return $items;
    }
}
