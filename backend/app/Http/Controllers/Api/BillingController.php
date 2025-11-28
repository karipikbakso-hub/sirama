<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\BillingItem;
use App\Models\Registration;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('t_billing')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_billing.user_id', '=', 'users.id')
                ->select(
                    't_billing.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'users.name as cashier_name',
                    't_registrasi.tanggal_registrasi'
                );

            // Search
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('m_pasien.nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('m_pasien.no_rm', 'like', "%{$search}%")
                      ->orWhere('t_billing.no_invoice', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status') && !empty($request->status)) {
                $status = $request->status;
                // Map frontend status to database status
                $statusMap = [
                    'draft' => 'draft',
                    'pending' => 'final',
                    'partial_paid' => 'lunas', // Assuming partial payment is still marked as lunas
                    'paid' => 'lunas',
                    'cancelled' => 'batal'
                ];
                if (isset($statusMap[$status])) {
                    $query->where('t_billing.status', $statusMap[$status]);
                }
            }

            // Filter by date range
            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->whereDate('t_billing.tanggal_billing', '>=', $request->start_date);
            }
            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->whereDate('t_billing.tanggal_billing', '<=', $request->end_date);
            }

            // Filter by insurance type
            if ($request->has('insurance_type') && !empty($request->insurance_type)) {
                $query->join('m_penjamin', 't_registrasi.penjamin_id', '=', 'm_penjamin.id')
                      ->where('m_penjamin.nama_penjamin', 'like', "%{$request->insurance_type}%");
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $billings = $query->orderBy('t_billing.created_at', 'desc')
                              ->paginate($perPage);

            // Transform status for frontend
            $billings->getCollection()->transform(function($billing) {
                $billing->status = $this->mapStatusToFrontend($billing->status);
                return $billing;
            });

            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Billings retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $billing = DB::table('t_billing')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_billing.user_id', '=', 'users.id')
                ->leftJoin('m_poli', 't_registrasi.poli_id', '=', 'm_poli.id')
                ->leftJoin('m_penjamin', 't_registrasi.penjamin_id', '=', 'm_penjamin.id')
                ->where('t_billing.id', $id)
                ->select(
                    't_billing.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.tanggal_lahir as date_of_birth',
                    'm_pasien.alamat as address',
                    'users.name as cashier_name',
                    'm_poli.nama_poli',
                    'm_penjamin.nama_penjamin as insurance_type',
                    't_registrasi.tanggal_registrasi',
                    't_registrasi.jenis_kunjungan'
                )
                ->first();

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing not found'
                ], 404);
            }

            // Get billing items breakdown
            $billingItems = $this->getBillingItemsBreakdown($billing->registrasi_id);

            // Transform status
            $billing->status = $this->mapStatusToFrontend($billing->status);

            return response()->json([
                'success' => true,
                'data' => [
                    'billing' => $billing,
                    'items' => $billingItems
                ],
                'message' => 'Billing details retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing details: ' . $e->getMessage()
            ], 500);
        }
    }

    public function adjustDiscount(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'discount_type' => 'required|in:percentage,nominal',
                'discount_value' => 'required|numeric|min:0',
                'reason' => 'required|string|max:255',
                'approved_by' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billing = DB::table('t_billing')->where('id', $id)->first();
            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing not found'
                ], 404);
            }

            // Calculate discount
            $discountAmount = 0;
            if ($request->discount_type === 'percentage') {
                $discountAmount = ($billing->total_tagihan * $request->discount_value) / 100;
                // Check max discount limit (example: 50%)
                if ($request->discount_value > 50) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Discount percentage cannot exceed 50%'
                    ], 422);
                }
            } else {
                $discountAmount = $request->discount_value;
                // Check max discount amount (example: 50% of total)
                $maxDiscount = $billing->total_tagihan * 0.5;
                if ($discountAmount > $maxDiscount) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Discount amount cannot exceed 50% of total billing'
                    ], 422);
                }
            }

            $newTotal = $billing->total_tagihan - $discountAmount;

            // Update billing
            DB::table('t_billing')->where('id', $id)->update([
                'diskon' => $discountAmount,
                'total_bayar' => $newTotal,
                'catatan' => ($billing->catatan ? $billing->catatan . "\n" : "") .
                           "Discount adjusted: {$request->discount_value} " .
                           "({$request->discount_type}) - Reason: {$request->reason} - " .
                           "Approved by: {$request->approved_by}",
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Discount adjusted successfully',
                'data' => [
                    'old_total' => $billing->total_tagihan,
                    'discount_amount' => $discountAmount,
                    'new_total' => $newTotal
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to adjust discount: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateInvoice($id)
    {
        try {
            $billing = DB::table('t_billing')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_billing.user_id', '=', 'users.id')
                ->leftJoin('m_poli', 't_registrasi.poli_id', '=', 'm_poli.id')
                ->leftJoin('m_penjamin', 't_registrasi.penjamin_id', '=', 'm_penjamin.id')
                ->where('t_billing.id', $id)
                ->select(
                    't_billing.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.tanggal_lahir as date_of_birth',
                    'm_pasien.alamat as address',
                    'users.name as cashier_name',
                    'm_poli.nama_poli',
                    'm_penjamin.nama_penjamin as insurance_type',
                    't_registrasi.tanggal_registrasi'
                )
                ->first();

            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing not found'
                ], 404);
            }

            $billingItems = $this->getBillingItemsBreakdown($billing->registrasi_id);

            $data = [
                'billing' => $billing,
                'items' => $billingItems,
                'hospital' => [
                    'name' => 'Rumah Sakit SIRAMA',
                    'address' => 'Jl. Kesehatan No. 123, Jakarta',
                    'phone' => '(021) 12345678',
                    'email' => 'info@sirama-hospital.com'
                ]
            ];

            $pdf = Pdf::loadView('pdf.invoice', $data);

            return $pdf->download('invoice_' . $billing->no_invoice . '.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:draft,pending,partial_paid,paid,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $billing = DB::table('t_billing')->where('id', $id)->first();
            if (!$billing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Billing not found'
                ], 404);
            }

            // Map frontend status to database status
            $statusMap = [
                'draft' => 'draft',
                'pending' => 'final',
                'partial_paid' => 'lunas', // Assuming partial payment is still marked as lunas
                'paid' => 'lunas',
                'cancelled' => 'batal'
            ];

            $newStatus = $statusMap[$request->status];

            DB::table('t_billing')->where('id', $id)->update([
                'status' => $newStatus,
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Billing status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update billing status: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getBillingItemsBreakdown($registrationId)
    {
        $items = [];

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

        // Procedures/Treatments
        $procedures = DB::table('t_tindakan')
            ->join('m_tindakan', 't_tindakan.tindakan_master_id', '=', 'm_tindakan.id')
            ->where('t_tindakan.pemeriksaan_id', function($query) use ($registrationId) {
                $query->select('id')
                      ->from('t_pemeriksaan')
                      ->where('registrasi_id', $registrationId)
                      ->limit(1);
            })
            ->select(
                'm_tindakan.nama_tindakan as description',
                't_tindakan.jumlah as quantity',
                't_tindakan.tarif_satuan as unit_price',
                't_tindakan.subtotal as total'
            )
            ->get();

        foreach ($procedures as $item) {
            $items[] = [
                'type' => 'procedure',
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total' => $item->total
            ];
        }

        return $items;
    }


    public function pendingPayment(Request $request)
    {
        try {
            $query = DB::table('t_billing')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users', 't_billing.user_id', '=', 'users.id')
                ->where('t_billing.status', '!=', 'lunas') // Only pending billings
                ->select(
                    't_billing.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'users.name as cashier_name',
                    't_registrasi.tanggal_registrasi'
                );

            // Search
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('m_pasien.nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('m_pasien.no_rm', 'like', "%{$search}%")
                      ->orWhere('t_billing.no_invoice', 'like', "%{$search}%");
                });
            }

            // Filter by insurance type
            if ($request->has('insurance_type') && !empty($request->insurance_type)) {
                $query->join('m_penjamin', 't_registrasi.penjamin_id', '=', 'm_penjamin.id')
                      ->where('m_penjamin.nama_penjamin', 'like', "%{$request->insurance_type}%");
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $billings = $query->orderBy('t_billing.created_at', 'desc')
                              ->paginate($perPage);

            // Transform status for frontend
            $billings->getCollection()->transform(function($billing) {
                $billing->status = $this->mapStatusToFrontend($billing->status);
                return $billing;
            });

            return response()->json([
                'success' => true,
                'data' => $billings,
                'message' => 'Pending billings retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending billings: ' . $e->getMessage()
            ], 500);
        }
    }

    private function mapStatusToFrontend($dbStatus)
    {
        $statusMap = [
            'draft' => 'draft',
            'final' => 'pending',
            'lunas' => 'paid', // This could be either partial_paid or paid depending on payment amount
            'batal' => 'cancelled'
        ];

        return $statusMap[$dbStatus] ?? $dbStatus;
    }
}