<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KasirDashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $stats = [
                'total_pembayaran_hari_ini' => $this->getTotalPembayaranHariIni(),
                'billing_pending' => $this->getBillingPending(),
                'tagihan_lunas' => $this->getTagihanLunas(),
                'deposit_aktif' => $this->getDepositAktif(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'meta' => [
                    'timestamp' => now()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function recentPayments(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);

            $payments = DB::table('t_pembayaran')
                ->join('t_billing', 't_pembayaran.billing_id', '=', 't_billing.id')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('patients', 't_registrasi.patient_id', '=', 'patients.id')
                ->join('users', 't_pembayaran.user_id', '=', 'users.id')
                ->select(
                    't_pembayaran.*',
                    't_billing.no_invoice',
                    'patients.name as patient_name',
                    'patients.mrn as medical_record_number',
                    'users.name as cashier_name',
                    't_pembayaran.created_at as payment_date'
                )
                ->orderBy('t_pembayaran.created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching recent payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function billingAlerts(Request $request)
    {
        try {
            // Tagihan overdue (lebih dari 30 hari belum lunas)
            $overdue = DB::table('t_billing')
                ->join('t_registrasi', 't_billing.registrasi_id', '=', 't_registrasi.id')
                ->join('patients', 't_registrasi.patient_id', '=', 'patients.id')
                ->where('t_billing.status', '!=', 'lunas')
                ->where('t_billing.created_at', '<', Carbon::now()->subDays(30))
                ->select(
                    't_billing.id',
                    't_billing.no_invoice',
                    't_billing.total_tagihan',
                    't_billing.created_at',
                    'patients.name as patient_name',
                    'patients.mrn as medical_record_number'
                )
                ->get();

            // Deposit yang hampir habis (kurang dari 100000)
            // Note: Untuk sementara return empty array karena belum ada tabel deposit
            $lowDeposit = collect([]);

            return response()->json([
                'success' => true,
                'data' => [
                    'overdue_billings' => $overdue,
                    'low_deposits' => $lowDeposit
                ],
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching billing alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function revenueChart(Request $request)
    {
        try {
            $days = $request->get('days', 7);

            $data = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();

                $revenue = DB::table('t_pembayaran')
                    ->whereDate('tanggal_bayar', $date)
                    ->sum('jumlah_bayar');

                $data[] = [
                    'date' => Carbon::parse($date)->format('d/m'),
                    'revenue' => (float) $revenue
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching revenue chart data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getTotalPembayaranHariIni()
    {
        // Debug: Log the query
        $today = Carbon::today()->toDateString();
        \Log::info('Kasir Dashboard Debug', [
            'today' => $today,
            'carbon_today' => Carbon::today(),
            'query' => 'SELECT SUM(jumlah_bayar) FROM t_pembayaran WHERE DATE(tanggal_bayar) = ?',
            'param' => $today
        ]);

        $result = DB::table('t_pembayaran')
            ->whereDate('tanggal_bayar', Carbon::today())
            ->sum('jumlah_bayar') ?? 0;

        \Log::info('Kasir Dashboard Result', ['result' => $result]);

        return $result;
    }

    private function getBillingPending()
    {
        return DB::table('t_billing')
            ->where('status', '!=', 'lunas')
            ->count();
    }

    private function getTagihanLunas()
    {
        return DB::table('t_billing')
            ->where('status', 'lunas')
            ->count();
    }

    private function getDepositAktif()
    {
        // Untuk sementara return 0 karena belum ada tabel deposit
        // TODO: Implement ketika tabel deposit sudah ada
        return 0;
    }
}