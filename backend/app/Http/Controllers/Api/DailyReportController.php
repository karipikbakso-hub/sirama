<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class DailyReportController extends Controller
{
    /**
     * Get daily report data for a specific date
     */
    public function index(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $startDate = Carbon::parse($date)->startOfDay();
        $endDate = Carbon::parse($date)->endOfDay();

        // Get registrations for the date
        $registrations = Registration::with(['patient', 'doctor'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($registration) {
                return [
                    'id' => $registration->id,
                    'registration_number' => $registration->registration_number,
                    'patient_name' => $registration->patient?->name ?? 'Unknown',
                    'patient_mrn' => $registration->patient?->mrn ?? '-',
                    'service_unit' => $registration->service_unit ?? 'Umum',
                    'doctor_name' => $registration->doctor?->name ?? '-',
                    'registration_time' => $registration->created_at->format('Y-m-d H:i:s'),
                    'status' => $registration->status,
                    'payment_method' => $registration->payment_method ?? '-',
                    'referral_source' => $registration->referral_source ?? '-',
                    'notes' => $registration->notes,
                ];
            });

        // Calculate summary
        $summary = [
            'total_registrations' => $registrations->count(),
            'completed_registrations' => $registrations->where('status', 'completed')->count(),
            'pending_registrations' => $registrations->whereIn('status', ['registered', 'checked-in'])->count(),
            'cancelled_registrations' => $registrations->where('status', 'cancelled')->count(),
            'avg_wait_time' => $this->calculateAverageWaitTime($registrations),
            'avg_service_time' => $this->calculateAverageServiceTime($registrations),
            'peak_hour' => $this->calculatePeakHour($registrations),
            'peak_registrations' => $this->calculatePeakRegistrations($registrations),
        ];

        return response()->json([
            'summary' => $summary,
            'registrations' => $registrations,
            'date' => $date,
        ]);
    }

    /**
     * Export daily report to Excel
     */
    public function exportExcel(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));

        return Excel::download(new class($date) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithTitle {
            private $date;

            public function __construct($date)
            {
                $this->date = $date;
            }

            public function collection()
            {
                $startDate = Carbon::parse($this->date)->startOfDay();
                $endDate = Carbon::parse($this->date)->endOfDay();

                return Registration::with(['patient', 'doctor'])
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function ($registration) {
                        return [
                            'No. Registrasi' => $registration->registration_number,
                            'Nama Pasien' => $registration->patient?->name ?? 'Unknown',
                            'MRN' => $registration->patient?->mrn ?? '-',
                            'Unit Pelayanan' => $registration->service_unit ?? 'Umum',
                            'Dokter' => $registration->doctor?->name ?? '-',
                            'Waktu Registrasi' => $registration->created_at->format('H:i:s'),
                            'Status' => $this->formatStatus($registration->status),
                            'Metode Pembayaran' => $registration->payment_method ?? '-',
                            'Sumber Rujukan' => $registration->referral_source ?? '-',
                            'Catatan' => $registration->notes ?? '-',
                        ];
                    });
            }

            public function headings(): array
            {
                return [
                    'No. Registrasi',
                    'Nama Pasien',
                    'MRN',
                    'Unit Pelayanan',
                    'Dokter',
                    'Waktu Registrasi',
                    'Status',
                    'Metode Pembayaran',
                    'Sumber Rujukan',
                    'Catatan',
                ];
            }

            public function title(): string
            {
                return 'Laporan Harian ' . Carbon::parse($this->date)->format('d-m-Y');
            }

            private function formatStatus($status)
            {
                return match($status) {
                    'registered' => 'Terdaftar',
                    'checked-in' => 'Check-in',
                    'completed' => 'Selesai',
                    'cancelled' => 'Dibatalkan',
                    default => ucfirst($status),
                };
            }
        }, "laporan-harian-{$date}.xlsx");
    }

    /**
     * Export daily report to PDF
     */
    public function exportPDF(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $startDate = Carbon::parse($date)->startOfDay();
        $endDate = Carbon::parse($date)->endOfDay();

        $registrations = Registration::with(['patient', 'doctor'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'asc')
            ->get();

        $summary = [
            'total_registrations' => $registrations->count(),
            'completed_registrations' => $registrations->where('status', 'completed')->count(),
            'pending_registrations' => $registrations->whereIn('status', ['registered', 'checked-in'])->count(),
            'cancelled_registrations' => $registrations->where('status', 'cancelled')->count(),
            'date' => Carbon::parse($date)->format('d F Y'),
            'generated_at' => now()->format('d F Y H:i:s'),
        ];

        $pdf = Pdf::loadView('reports.daily-report', compact('registrations', 'summary'));

        return $pdf->download("laporan-harian-{$date}.pdf");
    }

    /**
     * Calculate average wait time
     */
    private function calculateAverageWaitTime($registrations)
    {
        $completedRegistrations = $registrations->where('status', 'completed');

        if ($completedRegistrations->isEmpty()) {
            return 0;
        }

        // Mock calculation - in real implementation, you'd calculate based on actual timestamps
        return rand(15, 45);
    }

    /**
     * Calculate average service time
     */
    private function calculateAverageServiceTime($registrations)
    {
        $completedRegistrations = $registrations->where('status', 'completed');

        if ($completedRegistrations->isEmpty()) {
            return 0;
        }

        // Mock calculation - in real implementation, you'd calculate based on actual timestamps
        return rand(20, 60);
    }

    /**
     * Calculate peak hour
     */
    private function calculatePeakHour($registrations)
    {
        if ($registrations->isEmpty()) {
            return 10; // Default peak hour
        }

        // Group by hour and find the hour with most registrations
        $hourlyCount = $registrations->groupBy(function ($registration) {
            return Carbon::parse($registration['registration_time'])->hour;
        })->map->count();

        return $hourlyCount->sortDesc()->keys()->first() ?? 10;
    }

    /**
     * Calculate peak registrations count
     */
    private function calculatePeakRegistrations($registrations)
    {
        if ($registrations->isEmpty()) {
            return 0;
        }

        $peakHour = $this->calculatePeakHour($registrations);

        return $registrations->filter(function ($registration) use ($peakHour) {
            return Carbon::parse($registration['registration_time'])->hour === $peakHour;
        })->count();
    }

    /**
     * Get detailed metrics for a date range
     */
    public function detailedMetrics(Request $request)
    {
        $startDate = $request->get('start_date', now()->subDays(7)->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));

        $data = Registration::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_registrations'),
                DB::raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed'),
                DB::raw('COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled'),
                DB::raw('COUNT(CASE WHEN status IN ("registered", "checked-in") THEN 1 END) as pending')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    /**
     * Get summary statistics for dashboard
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30d');

        switch ($period) {
            case '7d':
                $startDate = now()->subDays(7);
                break;
            case '30d':
                $startDate = now()->subDays(30);
                break;
            case '90d':
                $startDate = now()->subDays(90);
                break;
            default:
                $startDate = now()->subDays(30);
        }

        $stats = Registration::select(
                DB::raw('COUNT(*) as total_registrations'),
                DB::raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed_registrations'),
                DB::raw('COUNT(CASE WHEN status IN ("registered", "checked-in") THEN 1 END) as pending_registrations'),
                DB::raw('COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled_registrations'),
                DB::raw('AVG(CASE WHEN status = "completed" THEN TIMESTAMPDIFF(MINUTE, created_at, updated_at) END) as avg_service_time')
            )
            ->where('created_at', '>=', $startDate)
            ->first();

        return response()->json([
            'period' => $period,
            'total_registrations' => $stats->total_registrations ?? 0,
            'completed_registrations' => $stats->completed_registrations ?? 0,
            'pending_registrations' => $stats->pending_registrations ?? 0,
            'cancelled_registrations' => $stats->cancelled_registrations ?? 0,
            'completion_rate' => $stats->total_registrations > 0
                ? round(($stats->completed_registrations / $stats->total_registrations) * 100, 2)
                : 0,
            'avg_service_time' => round($stats->avg_service_time ?? 0, 1),
        ]);
    }
}
