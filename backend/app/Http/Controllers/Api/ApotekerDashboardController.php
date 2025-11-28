<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ApotekerDashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $stats = [
                'order_masuk' => $this->getOrderMasuk(),
                'validasi_pending' => $this->getValidasiPending(),
                'stok_menipis' => $this->getStokMenipis(),
                'expired_soon' => $this->getExpiredSoon(),
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

    private function getOrderMasuk()
    {
        return DB::table('prescriptions')
            ->whereDate('created_at', Carbon::today())
            ->count();
    }

    private function getValidasiPending()
    {
        return DB::table('prescriptions')
            ->where('status', 'pending')
            ->count();
    }

    private function getStokMenipis()
    {
        return DB::table('m_obat')
            ->whereRaw('stok_minimum > 0') // Using stok_minimum as reorder_point
            ->count();
    }

    private function getExpiredSoon()
    {
        return DB::table('medicine_batches')
            ->where('expired_date', '<=', Carbon::now()->addDays(30))
            ->where('expired_date', '>=', Carbon::today())
            ->count();
    }

    public function recentOrders(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);

            $orders = DB::table('prescriptions')
                ->join('t_registrasi', 'prescriptions.registration_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->join('users', 'prescriptions.doctor_id', '=', 'users.id')
                ->select(
                    'prescriptions.*',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'users.name as doctor_name'
                )
                ->orderBy('prescriptions.created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $orders,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching recent orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function alerts(Request $request)
    {
        try {
            // Stok menipis - using medicine_batches for stock info
            $lowStock = DB::table('m_obat')
                ->join('medicine_batches', 'm_obat.id', '=', 'medicine_batches.medicine_id')
                ->whereRaw('medicine_batches.stock < m_obat.stok_minimum')
                ->select('m_obat.id', 'm_obat.nama_obat as name', 'medicine_batches.stock', 'm_obat.stok_minimum as reorder_point')
                ->get();

            // Expired soon
            $expiring = DB::table('medicine_batches')
                ->join('m_obat', 'medicine_batches.medicine_id', '=', 'm_obat.id')
                ->where('medicine_batches.expired_date', '<=', Carbon::now()->addDays(30))
                ->where('medicine_batches.expired_date', '>=', Carbon::today())
                ->select('m_obat.id', 'm_obat.nama_obat as name', 'medicine_batches.expired_date', 'medicine_batches.stock')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'low_stock' => $lowStock,
                    'expiring' => $expiring
                ],
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function dailyUsage(Request $request)
    {
        try {
            $days = $request->get('days', 7);

            $usage = DB::table('stock_movements')
                ->where('type', 'out')
                ->where('created_at', '>=', Carbon::now()->subDays($days))
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(quantity) as total_quantity')
                )
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $usage,
                'meta' => ['timestamp' => now()->toISOString()]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching daily usage',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMedicineUsageChart(Request $request)
    {
        try {
            $days = $request->get('days', 7);

            $data = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();

                $usage = DB::table('prescription_items')
                    ->join('prescriptions', 'prescription_items.prescription_id', '=', 'prescriptions.id')
                    ->where('prescriptions.status', 'completed')
                    ->whereDate('prescriptions.updated_at', $date)
                    ->selectRaw('SUM(prescription_items.quantity) as total_quantity')
                    ->first()->total_quantity ?? 0;

                $data[] = [
                    'date' => Carbon::parse($date)->format('d/m'),
                    'quantity' => (int) $usage
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching chart data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function topMedicines(Request $request)
    {
        try {
            $period = $request->get('period', 30); // days
            $limit = $request->get('limit', 20);
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            // Calculate date range
            if ($startDate && $endDate) {
                $currentStart = Carbon::parse($startDate);
                $currentEnd = Carbon::parse($endDate);
            } else {
                $currentEnd = Carbon::now();
                $currentStart = Carbon::now()->subDays($period);
            }

            $previousStart = $currentStart->copy()->subDays($currentEnd->diffInDays($currentStart) + 1);
            $previousEnd = $currentStart->copy()->subDay();

            // Get current period data from prescription items (fallback to dispensed data if available)
            $currentData = DB::table('prescription_items')
                ->join('prescriptions', 'prescription_items.prescription_id', '=', 'prescriptions.id')
                ->join('m_obat', 'prescription_items.medicine_id', '=', 'm_obat.id')
                ->where('prescriptions.status', 'completed')
                ->whereBetween('prescriptions.completed_at', [$currentStart, $currentEnd])
                ->select(
                    'm_obat.id',
                    'm_obat.nama_obat as name',
                    'm_obat.golongan_obat as category',
                    DB::raw('COUNT(prescription_items.id) as total_quantity'),
                    DB::raw('COUNT(DISTINCT prescriptions.id) as frequency')
                )
                ->groupBy('m_obat.id', 'm_obat.nama_obat', 'm_obat.golongan_obat')
                ->orderBy('total_quantity', 'desc')
                ->limit($limit)
                ->get();

            // Get previous period data for trend calculation
            $previousData = DB::table('prescription_items')
                ->join('prescriptions', 'prescription_items.prescription_id', '=', 'prescriptions.id')
                ->where('prescriptions.status', 'completed')
                ->whereBetween('prescriptions.completed_at', [$previousStart, $previousEnd])
                ->select(
                    'prescription_items.medicine_id',
                    DB::raw('COUNT(prescription_items.id) as total_quantity')
                )
                ->groupBy('prescription_items.medicine_id')
                ->pluck('total_quantity', 'medicine_id');

            // Calculate trends and format response
            $medicines = $currentData->map(function ($medicine) use ($previousData) {
                $previousQuantity = $previousData->get($medicine->id, 0);
                $currentQuantity = $medicine->total_quantity;

                $trend = 'stable';
                $trendPercentage = 0;

                if ($previousQuantity > 0) {
                    $change = (($currentQuantity - $previousQuantity) / $previousQuantity) * 100;
                    $trendPercentage = round($change, 1);

                    if ($change > 5) {
                        $trend = 'up';
                    } elseif ($change < -5) {
                        $trend = 'down';
                    }
                } elseif ($currentQuantity > 0) {
                    $trend = 'up';
                    $trendPercentage = 100;
                }

                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'category' => $medicine->kategori ?? 'Umum',
                    'total_quantity' => (int) $medicine->total_quantity,
                    'frequency' => (int) $medicine->frequency,
                    'trend' => $trend,
                    'trend_percentage' => $trendPercentage,
                    'previous_quantity' => (int) $previousQuantity
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'medicines' => $medicines,
                    'period' => [
                        'start_date' => $currentStart->toDateString(),
                        'end_date' => $currentEnd->toDateString(),
                        'days' => $currentStart->diffInDays($currentEnd) + 1
                    ],
                    'previous_period' => [
                        'start_date' => $previousStart->toDateString(),
                        'end_date' => $previousEnd->toDateString()
                    ]
                ],
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'total' => $medicines->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching top medicines data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}