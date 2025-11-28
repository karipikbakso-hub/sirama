<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'billing_id' => 'required|integer|exists:t_billing,id',
                'payments' => 'required|array|min:1',
                'payments.*.method' => 'required|in:cash,debit,credit,transfer,bpjs,deposit',
                'payments.*.amount' => 'required|numeric|min:0.01',
                'payments.*.reference_number' => 'nullable|string|max:100',
                'notes' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Get billing
            $billing = DB::table('t_billing')->where('id', $request->billing_id)->first();
            if (!$billing) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Billing not found'
                ], 404);
            }

            // Check if billing is already paid
            if ($billing->status === 'lunas') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Billing is already paid'
                ], 422);
            }

            // Calculate total payment
            $totalPayment = collect($request->payments)->sum('amount');

            // Check if payment is sufficient
            if ($totalPayment < $billing->total_bayar) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Total payment is less than billing amount'
                ], 422);
            }

            // Generate receipt number
            $receiptNumber = $this->generateReceiptNumber();

            // Create payment records
            $paymentRecords = [];
            foreach ($request->payments as $paymentData) {
                $paymentId = DB::table('t_pembayaran')->insertGetId([
                    'billing_id' => $billing->id,
                    'user_id' => auth()->id(),
                    'metode_bayar' => $paymentData['method'],
                    'jumlah_bayar' => $paymentData['amount'],
                    'no_referensi' => $paymentData['reference_number'] ?? null,
                    'tanggal_bayar' => now(),
                    'catatan' => $request->notes,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $paymentRecords[] = DB::table('t_pembayaran')->where('id', $paymentId)->first();
            }

            // Handle special payment methods
            $this->handleSpecialPayments($request->payments, $billing);

            // Update billing status to paid
            DB::table('t_billing')->where('id', $billing->id)->update([
                'status' => 'lunas',
                'updated_at' => now()
            ]);

            // Create receipt record for each payment
            $receiptRecords = [];
            foreach ($paymentRecords as $paymentRecord) {
                $receipt = Receipt::create([
                    'payment_id' => $paymentRecord->id,
                    'receipt_number' => $this->generateReceiptNumber(),
                    'status' => 'active',
                ]);
                $receiptRecords[] = $receipt;
            }

            DB::commit();

            // Calculate change
            $changeAmount = $totalPayment - $billing->total_bayar;

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'data' => [
                    'receipt_numbers' => collect($receiptRecords)->pluck('receipt_number')->toArray(),
                    'total_payment' => $totalPayment,
                    'billing_amount' => $billing->total_bayar,
                    'change_amount' => $changeAmount,
                    'payments' => $paymentRecords,
                    'receipts' => $receiptRecords
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateReceipt($billingId)
    {
        try {
            // Get billing with patient info
            $billing = DB::table('t_billing')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('patients', 't_registrasi.patient_id', '=', 'patients.id')
                ->leftJoin('users', 't_billing.user_id', '=', 'users.id')
                ->where('t_billing.id', $billingId)
                ->select(
                    't_billing.*',
                    'patients.name as patient_name',
                    'patients.medical_record_number',
                    'users.name as cashier_name'
                )
                ->first();

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing not found'
                ], 404);
            }

            // Get payments
            $payments = DB::table('t_pembayaran')
                ->where('billing_id', $billingId)
                ->orderBy('created_at', 'asc')
                ->get();

            // Generate receipt number
            $receiptNumber = $this->generateReceiptNumber();

            $data = [
                'billing' => $billing,
                'payments' => $payments,
                'receipt_number' => $receiptNumber,
                'hospital' => [
                    'name' => 'Rumah Sakit SIRAMA',
                    'address' => 'Jl. Kesehatan No. 123, Jakarta',
                    'phone' => '(021) 12345678'
                ]
            ];

            $pdf = Pdf::loadView('pdf.receipt', $data);

            return $pdf->download('receipt_' . $receiptNumber . '.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate receipt: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateReceiptNumber()
    {
        $date = now()->format('Ymd');
        $lastReceipt = DB::table('t_pembayaran')
            ->whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastReceipt) {
            // Extract sequence from last receipt if exists
            $sequence = intval(substr($lastReceipt->id, -4)) + 1;
        }

        return 'RCP-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    private function handleSpecialPayments($payments, $billing)
    {
        foreach ($payments as $payment) {
            switch ($payment['method']) {
                case 'bpjs':
                    // Handle BPJS payment - deduct from BPJS coverage
                    // This would integrate with BPJS system
                    break;

                case 'deposit':
                    // Handle deposit payment - deduct from patient deposit
                    $patientId = DB::table('t_registrasi')
                        ->where('id', $billing->registrasi_id)
                        ->value('patient_id');

                    // Assuming there's a deposits table
                    // DB::table('deposits')->where('patient_id', $patientId)->decrement('balance', $payment['amount']);
                    break;

                default:
                    // Handle other payment methods
                    break;
            }
        }
    }
}