<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnosa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class Icd10Controller extends Controller
{
    /**
     * Get ICD-10 master data grouped by chapter
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Diagnosa::active();

            // Filter by chapter if provided
            if ($request->has('chapter') && $request->chapter) {
                $query->where('kategori', 'like', $request->chapter . '%');
            }

            $perPage = $request->get('per_page', 50);
            $icd10Data = $query->orderBy('kode_icd')
                              ->paginate($perPage);

            // Transform data to match expected format
            $transformedData = $icd10Data->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'code' => $item->kode_icd,
                    'name' => $item->nama_diagnosa,
                    'chapter' => $this->extractChapter($item->kode_icd),
                    'category' => $item->kategori ?? 'Unknown'
                ];
            });

            $icd10Data->setCollection($transformedData);

            return response()->json([
                'success' => true,
                'message' => 'ICD-10 master data berhasil diambil',
                'data' => $icd10Data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data ICD-10',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search ICD-10 by code or name (autocomplete)
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = Diagnosa::active();

            // Search by keyword
            if ($request->has('q') && $request->q) {
                $search = $request->q;
                $query->where(function ($q) use ($search) {
                    $q->where('kode_icd', 'like', "%{$search}%")
                      ->orWhere('nama_diagnosa', 'like', "%{$search}%");
                });
            }

            $results = $query->orderBy('kode_icd')
                            ->limit(50)
                            ->get(['id', 'kode_icd', 'nama_diagnosa', 'kategori']);

            // Transform data to match expected format
            $transformedData = $results->map(function ($item) {
                return [
                    'id' => $item->id,
                    'code' => $item->kode_icd,
                    'name' => $item->nama_diagnosa,
                    'chapter' => $this->extractChapter($item->kode_icd),
                    'category' => $item->kategori ?? 'Unknown'
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Pencarian ICD-10 berhasil',
                'data' => $transformedData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mencari ICD-10',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get most used diagnoses by doctor
     */
    public function mostUsed(Request $request): JsonResponse
    {
        try {
            $doctorId = $request->get('doctor_id', auth()->id());
            $limit = $request->get('limit', 20);

            // Get most used diagnoses from t_diagnosis_pasien table
            $query = \DB::table('t_diagnosis_pasien')
                ->join('m_diagnosa', 't_diagnosis_pasien.diagnosis_id', '=', 'm_diagnosa.id');

            // Filter by doctor if specified and authenticated
            if ($doctorId) {
                $query->where('t_diagnosis_pasien.dokter_id', $doctorId);
            }

            $mostUsed = $query->select(
                    'm_diagnosa.id',
                    'm_diagnosa.kode_icd',
                    'm_diagnosa.nama_diagnosa',
                    'm_diagnosa.kategori',
                    \DB::raw('COUNT(*) as usage_count')
                )
                ->groupBy('m_diagnosa.id', 'm_diagnosa.kode_icd', 'm_diagnosa.nama_diagnosa', 'm_diagnosa.kategori')
                ->orderBy('usage_count', 'desc')
                ->limit($limit)
                ->get();

            // Transform data to match expected format
            $transformedData = $mostUsed->map(function ($item) {
                return [
                    'id' => $item->id,
                    'code' => $item->kode_icd,
                    'name' => $item->nama_diagnosa,
                    'chapter' => $this->extractChapter($item->kode_icd),
                    'category' => $item->kategori ?? 'Unknown',
                    'usage_count' => $item->usage_count
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Most used diagnoses berhasil diambil',
                'data' => $transformedData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil most used diagnoses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extract chapter from ICD-10 code
     */
    private function extractChapter(string $code): string
    {
        // Extract first character for chapter
        $firstChar = strtoupper(substr($code, 0, 1));

        $chapters = [
            'A' => 'A00-B99',
            'B' => 'A00-B99',
            'C' => 'C00-D48',
            'D' => 'C00-D48',
            'E' => 'E00-E90',
            'F' => 'F00-F99',
            'G' => 'G00-G99',
            'H' => 'H00-H59',
            'I' => 'I00-I99',
            'J' => 'J00-J99',
            'K' => 'K00-K93',
            'L' => 'L00-L99',
            'M' => 'M00-M99',
            'N' => 'N00-N99',
            'O' => 'O00-O99',
            'P' => 'P00-P96',
            'Q' => 'Q00-Q99',
            'R' => 'R00-R99',
            'S' => 'S00-T98',
            'T' => 'S00-T98',
            'U' => 'U00-U99',
            'V' => 'V01-Y98',
            'W' => 'V01-Y98',
            'X' => 'V01-Y98',
            'Y' => 'V01-Y98',
            'Z' => 'Z00-Z99'
        ];

        return $chapters[$firstChar] ?? 'Unknown';
    }
}