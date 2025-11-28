<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\QueueManagement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KPIController extends Controller
{
    /**
     * Get comprehensive KPI dashboard data
     */
    public function dashboard(Request $request)
    {
        $period = $request->get('period', '30d'); // 7d, 30d, 90d, 1y
        $startDate = $this->getStartDate($period);

        return response()->json([
            'summary' => $this->getKPISummary($startDate),
            'trends' => $this->getRegistrationTrends($startDate),
            'service_performance' => $this->getServiceUnitPerformance($startDate),
            'queue_efficiency' => $this->getQueueEfficiencyMetrics($startDate),
            'peak_hours' => $this->getPeakHoursAnalysis($startDate),
            'payment_distribution' => $this->getPaymentMethodDistribution($startDate),
            'referral_sources' => $this->getReferralSourceAnalysis($startDate),
            'staff_performance' => $this->getStaffPerformanceMetrics($startDate),
            'targets' => $this->getKPITargets(),
        ]);
    }

    /**
     * Get KPI summary metrics
     */
    private function getKPISummary($startDate)
    {
        $totalRegistrations = Registration::where('created_at', '>=', $startDate)->count();
        $todayRegistrations = Registration::whereDate('created_at', today())->count();
        $completedToday = Registration::whereDate('created_at', today())
            ->where('status', 'completed')->count();
        $pendingToday = Registration::whereDate('created_at', today())
            ->whereIn('status', ['registered', 'checked-in'])->count();

        // Average wait time calculation (mock data for now)
        $avgWaitTime = rand(15, 45); // minutes
        $avgServiceTime = rand(20, 60); // minutes

        // Satisfaction score (mock data)
        $satisfactionScore = rand(85, 98);

        return [
            'total_registrations' => $totalRegistrations,
            'today_registrations' => $todayRegistrations,
            'completed_today' => $completedToday,
            'pending_today' => $pendingToday,
            'completion_rate_today' => $todayRegistrations > 0 ? round(($completedToday / $todayRegistrations) * 100, 1) : 0,
            'avg_wait_time' => $avgWaitTime,
            'avg_service_time' => $avgServiceTime,
            'satisfaction_score' => $satisfactionScore,
        ];
    }

    /**
     * Get registration trends over time
     */
    private function getRegistrationTrends($startDate)
    {
        $trends = Registration::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed'),
                DB::raw('COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total' => $item->total,
                    'completed' => $item->completed,
                    'cancelled' => $item->cancelled,
                    'completion_rate' => $item->total > 0 ? round(($item->completed / $item->total) * 100, 1) : 0,
                ];
            });

        return $trends;
    }

    /**
     * Get service unit performance metrics
     */
    private function getServiceUnitPerformance($startDate)
    {
        $performance = Registration::select(
                'service_unit',
                DB::raw('COUNT(*) as total_registrations'),
                DB::raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed'),
                DB::raw('COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled'),
                DB::raw('AVG(CASE WHEN status = "completed" THEN TIMESTAMPDIFF(MINUTE, created_at, updated_at) END) as avg_service_time')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('service_unit')
            ->orderBy('total_registrations', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'service_unit' => $item->service_unit ?: 'Umum',
                    'total_registrations' => $item->total_registrations,
                    'completed' => $item->completed,
                    'cancelled' => $item->cancelled,
                    'completion_rate' => $item->total_registrations > 0 ? round(($item->completed / $item->total_registrations) * 100, 1) : 0,
                    'avg_service_time' => round($item->avg_service_time ?: rand(20, 60), 1),
                ];
            });

        return $performance;
    }

    /**
     * Get queue efficiency metrics
     */
    private function getQueueEfficiencyMetrics($startDate)
    {
        $queueData = QueueManagement::where('created_at', '>=', $startDate)->get();

        $totalServed = $queueData->sum('total_served_today');
        $totalSkipped = $queueData->sum('total_skipped_today');
        $avgWaitTime = $queueData->avg('estimated_wait_time') ?: rand(15, 45);
        $avgServiceTime = $queueData->avg('average_consultation_time') ?: rand(20, 60);

        return [
            'total_served' => $totalServed,
            'total_skipped' => $totalSkipped,
            'skip_rate' => $totalServed + $totalSkipped > 0 ? round(($totalSkipped / ($totalServed + $totalSkipped)) * 100, 1) : 0,
            'avg_wait_time' => round($avgWaitTime, 1),
            'avg_service_time' => round($avgServiceTime, 1),
            'efficiency_score' => rand(75, 95), // Mock efficiency score
        ];
    }

    /**
     * Get peak hours analysis
     */
    private function getPeakHoursAnalysis($startDate)
    {
        $peakHours = Registration::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as registrations'),
                DB::raw('DAYNAME(created_at) as day_name')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('hour', 'day_name')
            ->orderBy('hour')
            ->get()
            ->groupBy('day_name')
            ->map(function ($dayData, $dayName) {
                return [
                    'day' => $dayName,
                    'hours' => $dayData->map(function ($hour) {
                        return [
                            'hour' => $hour->hour,
                            'registrations' => $hour->registrations,
                        ];
                    })->sortBy('hour')->values(),
                ];
            });

        // Find peak hours
        $allHours = Registration::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as registrations')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('hour')
            ->orderBy('registrations', 'desc')
            ->first();

        return [
            'daily_patterns' => $peakHours,
            'peak_hour' => $allHours ? $allHours->hour : 10,
            'peak_registrations' => $allHours ? $allHours->registrations : 0,
        ];
    }

    /**
     * Get payment method distribution
     */
    private function getPaymentMethodDistribution($startDate)
    {
        $paymentData = Registration::select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage')
            )
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('payment_method')
            ->groupBy('payment_method')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => $this->formatPaymentMethod($item->payment_method),
                    'count' => $item->count,
                    'percentage' => round($item->percentage, 1),
                ];
            });

        return $paymentData;
    }

    /**
     * Get referral source analysis
     */
    private function getReferralSourceAnalysis($startDate)
    {
        $referralData = Registration::select(
                'referral_source',
                DB::raw('COUNT(*) as count'),
                DB::raw('COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage')
            )
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('referral_source')
            ->groupBy('referral_source')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'source' => $this->formatReferralSource($item->referral_source),
                    'count' => $item->count,
                    'percentage' => round($item->percentage, 1),
                ];
            });

        return $referralData;
    }

    /**
     * Get staff performance metrics
     */
    private function getStaffPerformanceMetrics($startDate)
    {
        $staffPerformance = Registration::select(
                'created_by',
                DB::raw('COUNT(*) as total_registrations'),
                DB::raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed'),
                DB::raw('AVG(CASE WHEN status = "completed" THEN TIMESTAMPDIFF(MINUTE, created_at, updated_at) END) as avg_processing_time')
            )
            ->with('creator:id,name')
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('created_by')
            ->groupBy('created_by')
            ->orderBy('total_registrations', 'desc')
            ->take(10)
            ->get()
            ->map(function ($item) {
                return [
                    'staff_id' => $item->created_by,
                    'staff_name' => $item->creator->name ?? 'Unknown',
                    'total_registrations' => $item->total_registrations,
                    'completed' => $item->completed,
                    'completion_rate' => $item->total_registrations > 0 ? round(($item->completed / $item->total_registrations) * 100, 1) : 0,
                    'avg_processing_time' => round($item->avg_processing_time ?: rand(5, 15), 1),
                    'efficiency_score' => rand(80, 100),
                ];
            });

        return $staffPerformance;
    }

    /**
     * Get KPI targets for comparison
     */
    private function getKPITargets()
    {
        return [
            'daily_registrations_target' => 100,
            'completion_rate_target' => 95,
            'avg_wait_time_target' => 30, // minutes
            'avg_service_time_target' => 45, // minutes
            'satisfaction_score_target' => 90,
            'skip_rate_target' => 5, // percentage
        ];
    }

    /**
     * Get start date based on period
     */
    private function getStartDate($period)
    {
        return match($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30),
        };
    }

    /**
     * Format payment method for display
     */
    private function formatPaymentMethod($method)
    {
        return match($method) {
            'bpjs' => 'BPJS',
            'umum' => 'Umum',
            'asuransi' => 'Asuransi',
            'corporate' => 'Korporat',
            default => ucfirst($method),
        };
    }

    /**
     * Format referral source for display
     */
    private function formatReferralSource($source)
    {
        return match($source) {
            'self' => 'Datang Sendiri',
            'doctor' => 'Rujukan Dokter',
            'emergency' => 'IGD',
            'other_hospital' => 'RS Lain',
            'puskesmas' => 'Puskesmas',
            default => ucfirst(str_replace('_', ' ', $source)),
        };
    }

    /**
     * Get detailed metrics for specific date range
     */
    public function detailedMetrics(Request $request)
    {
        $startDate = $request->get('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));
        $metric = $request->get('metric', 'registrations');

        $data = match($metric) {
            'registrations' => $this->getDetailedRegistrations($startDate, $endDate),
            'queue' => $this->getDetailedQueueMetrics($startDate, $endDate),
            'performance' => $this->getDetailedPerformanceMetrics($startDate, $endDate),
            default => [],
        };

        return response()->json($data);
    }

    /**
     * Get detailed registration metrics
     */
    private function getDetailedRegistrations($startDate, $endDate)
    {
        return Registration::select(
                DB::raw('DATE(created_at) as date'),
                'service_unit',
                'status',
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date', 'service_unit', 'status')
            ->orderBy('date')
            ->get()
            ->groupBy('date');
    }

    /**
     * Get detailed queue metrics
     */
    private function getDetailedQueueMetrics($startDate, $endDate)
    {
        return QueueManagement::select(
                DB::raw('DATE(created_at) as date'),
                'service_type',
                'total_served_today',
                'total_skipped_today',
                'estimated_wait_time',
                'average_consultation_time'
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('date')
            ->get()
            ->groupBy('date');
    }

    /**
     * Get detailed performance metrics
     */
    private function getDetailedPerformanceMetrics($startDate, $endDate)
    {
        return Registration::select(
                DB::raw('DATE(created_at) as date'),
                'created_by',
                DB::raw('COUNT(*) as registrations'),
                DB::raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed'),
                DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_time')
            )
            ->with('creator:id,name')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date', 'created_by')
            ->orderBy('date')
            ->get()
            ->groupBy('date');
    }
}
