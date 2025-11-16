<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HasilSurvey;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Response;

class HasilSurveyController extends Controller
{
    /**
     * Display a listing of survey results with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'tanggal_from' => 'nullable|date',
            'tanggal_to' => 'nullable|date',
            'jenis_layanan' => 'nullable|string|max:255',
            'kelompok_usia' => 'nullable|string|max:255',
            'jenis_kelamin' => ['nullable', Rule::in(['L', 'P'])],
            'rating_min' => 'nullable|numeric|min:1|max:5',
            'rating_max' => 'nullable|numeric|min:1|max:5',
            'disarankan' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = HasilSurvey::query()
            ->with(['patient:id,mrn,name', 'registration:id,registration_date,poli']);

        // Apply filters
        if ($request->has('tanggal_from') || $request->has('tanggal_to')) {
            $query->RangeTanggal($request->tanggal_from, $request->tanggal_to);
        }

        if ($request->has('jenis_layanan')) {
            $query->JenisLayanan($request->jenis_layanan);
        }

        if ($request->has('kelompok_usia')) {
            $query->KelompokUsia($request->kelompok_usia);
        }

        if ($request->has('jenis_kelamin')) {
            $query->JenisKelamin($request->jenis_kelamin);
        }

        if ($request->has('rating_min') || $request->has('rating_max')) {
            $query->NilaiRating($request->rating_min, $request->rating_max);
        }

        if ($request->has('disarankan')) {
            $query->Disarankan($request->disarankan);
        }

        // Order by survey date (newest first)
        $query->orderBy('tanggal_survey', 'desc');

        $surveys = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        return response()->json([
            'success' => true,
            'data' => $surveys
        ]);
    }

    /**
     * Display the specified survey result.
     */
    public function show(HasilSurvey $hasilSurvey): JsonResponse
    {
        $hasilSurvey->load(['patient:id,mrn,name,birth_date', 'registration:id,registration_date,poli']);

        return response()->json([
            'success' => true,
            'data' => $hasilSurvey
        ]);
    }

    /**
     * Get survey statistics for dashboard and charts.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->subMonths(6)->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->format('Y-m-d'));

        // Overall statistics
        $totalSurveys = HasilSurvey::whereBetween('tanggal_survey', [$startDate, $endDate])->count();
        $averageRating = HasilSurvey::whereBetween('tanggal_survey', [$startDate, $endDate])
            ->selectRaw('AVG(nilai_rata_rata) as avg_rating')
            ->value('avg_rating') ?? 0;

        $recommendedCount = HasilSurvey::whereBetween('tanggal_survey', [$startDate, $endDate])
            ->where('disarankan', true)
            ->count();

        $recommendationRate = $totalSurveys > 0 ? round(($recommendedCount / $totalSurveys) * 100, 2) : 0;

        // Service type distribution
        $serviceStats = HasilSurvey::whereBetween('tanggal_survey', [$startDate, $endDate])
            ->selectRaw('jenis_layanan, AVG(nilai_rata_rata) as avg_rating, COUNT(*) as count')
            ->groupBy('jenis_layanan')
            ->get();

        // Rating distribution
        $ratingDistribution = HasilSurvey::whereBetween('tanggal_survey', [$startDate, $endDate])
            ->selectRaw('nilai_rata_rata, COUNT(*) as count')
            ->groupBy('nilai_rata_rata')
            ->get()
            ->pluck('count', 'nilai_rata_rata')
            ->toArray();

        // Monthly trend
        $monthlyTrend = DB::table('t_hasil_survey')
            ->selectRaw("DATE_FORMAT(tanggal_survey, '%Y-%m') as month, AVG(nilai_rata_rata) as avg_rating, COUNT(*) as count")
            ->whereBetween('tanggal_survey', [$startDate, $endDate])
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Age group distribution
        $ageGroupStats = HasilSurvey::whereBetween('tanggal_survey', [$startDate, $endDate])
            ->selectRaw('kelompok_usia, AVG(nilai_rata_rata) as avg_rating, COUNT(*) as count')
            ->groupBy('kelompok_usia')
            ->get();

        // Gender distribution
        $genderStats = HasilSurvey::whereBetween('tanggal_survey', [$startDate, $endDate])
            ->selectRaw('jenis_kelamin, AVG(nilai_rata_rata) as avg_rating, COUNT(*) as count')
            ->groupBy('jenis_kelamin')
            ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_surveys' => $totalSurveys,
                    'average_rating' => round($averageRating, 2),
                    'recommendation_rate' => $recommendationRate,
                    'service_stats' => $serviceStats,
                    'rating_distribution' => $ratingDistribution,
                    'monthly_trend' => $monthlyTrend,
                    'age_group_stats' => $ageGroupStats,
                    'gender_stats' => $genderStats,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving survey statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export survey results to CSV.
     */
    public function export(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal_from' => 'nullable|date',
            'tanggal_to' => 'nullable|date',
            'jenis_layanan' => 'nullable|string|max:255',
            'kelompok_usia' => 'nullable|string|max:255',
            'jenis_kelamin' => ['nullable', Rule::in(['L', 'P'])],
            'rating_min' => 'nullable|numeric|min:1|max:5',
            'rating_max' => 'nullable|numeric|min:1|max:5',
            'disarankan' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = HasilSurvey::query()
            ->with(['patient:id,mrn,name,birth_date', 'registration:id,registration_date']);

        // Apply same filters as index method
        if ($request->has('tanggal_from') || $request->has('tanggal_to')) {
            $query->RangeTanggal($request->tanggal_from, $request->tanggal_to);
        }

        if ($request->has('jenis_layanan')) {
            $query->JenisLayanan($request->jenis_layanan);
        }

        if ($request->has('kelompok_usia')) {
            $query->KelompokUsia($request->kelompok_usia);
        }

        if ($request->has('jenis_kelamin')) {
            $query->JenisKelamin($request->jenis_kelamin);
        }

        if ($request->has('rating_min') || $request->has('rating_max')) {
            $query->NilaiRating($request->rating_min, $request->rating_max);
        }

        if ($request->has('disarankan')) {
            $query->Disarankan($request->disarankan);
        }

        $surveys = $query->orderBy('tanggal_survey', 'desc')->get();

        // CSV headers
        $csvHeaders = [
            'ID',
            'Tanggal Survey',
            'MRN Pasien',
            'Nama Pasien',
            'Jenis Layanan',
            'Nilai Rata-rata',
            'Komentar',
            'Kelompok Usia',
            'Jenis Kelamin',
            'Disarankan'
        ];

        // CSV content
        $csvData = [$csvHeaders];

        foreach ($surveys as $survey) {
            $csvData[] = [
                $survey->id,
                $survey->tanggal_survey->format('Y-m-d'),
                $survey->patient?->mrn ?? '',
                $survey->patient?->name ?? '',
                $survey->jenis_layanan,
                $survey->nilai_rata_rata,
                $survey->komentar,
                $survey->kelompok_usia,
                $survey->jenis_kelamin,
                $survey->disarankan ? 'Ya' : 'Tidak'
            ];
        }

        // Create CSV content
        $csvContent = '';
        foreach ($csvData as $row) {
            $csvContent .= implode(',', array_map(function($field) {
                return '"' . str_replace('"', '""', $field ?? '') . '"';
            }, $row)) . "\n";
        }

        $filename = 'hasil-survey-' . now()->format('Y-m-d-H-i-s') . '.csv';

        return Response::make($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
