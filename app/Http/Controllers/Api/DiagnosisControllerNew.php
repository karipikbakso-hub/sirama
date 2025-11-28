<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiagnosisPasien;
use App\Models\Diagnosa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DiagnosisControllerNew extends Controller
{
    /**
     * Get diagnoses for a specific registration
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $registrationId = $request->get('registration_id');

            if (!$registrationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parameter registration_id diperlukan'
                ], 400);
            }

            $diagnoses = DiagnosisPasien::with(['diagnosis', 'dokter'])
                ->where('registrasi_id', $registrationId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Transform to match expected format
            $transformedData = $diagnoses->map(function ($diagnosis) {
                return [
                    'id' => $diagnosis->id,
                    'registration_id' => $diagnosis->registrasi_id,
                    'icd10_code' => $diagnosis->diagnosis->kode_icd ?? '',
                    'icd10_name' => $diagnosis->diagnosis->nama_diagnosa ?? '',
                    'diagnosis_type' => $this->mapDiagnosisType($diagnosis->tipe_diagnosis),
                    'created_at' => $diagnosis->created_at
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data diagnosis berhasil diambil',
                'data' => $transformedData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new diagnosis
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'registration_id' => 'required|exists:registrations,id',
                'icd10_code' => 'required|string|max:10',
                'icd10_name' => 'required|string|max:255',
                'diagnosis_type' => ['required', Rule::in(['primary', 'secondary'])]
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Find or create diagnosis in m_diagnosa table
            $diagnosa = Diagnosa::firstOrCreate(
                ['kode_icd' => $request->icd10_code],
                [
                    'nama_diagnosa' => $request->icd10_name,
                    'kategori' => $this->extractCategory($request->icd10_code),
                    'status' => 'aktif'
                ]
            );

            // Check if primary diagnosis already exists for this registration
            if ($request->diagnosis_type === 'primary') {
                $existingPrimary = DiagnosisPasien::where('registrasi_id', $request->registration_id)
                    ->where('tipe_diagnosis', 'utama')
                    ->exists();

                if ($existingPrimary) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Diagnosis primer sudah ada untuk registrasi ini'
                    ], 422);
                }
            }

            // Get patient_id from registration
            $registration = \App\Models\Registration::findOrFail($request->registration_id);

            // Create diagnosis record
            $diagnosis = DiagnosisPasien::create([
                'pasien_id' => $registration->patient_id,
                'registrasi_id' => $request->registration_id,
                'diagnosis_id' => $diagnosa->id,
                'dokter_id' => auth()->id(),
                'tipe_diagnosis' => $this->mapToInternalType($request->diagnosis_type),
                'kepastian' => 'terkonfirmasi'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis berhasil ditambahkan',
                'data' => [
                    'id' => $diagnosis->id,
                    'registration_id' => $diagnosis->registrasi_id,
                    'icd10_code' => $diagnosa->kode_icd,
                    'icd10_name' => $diagnosa->nama_diagnosa,
                    'diagnosis_type' => $request->diagnosis_type,
                    'created_at' => $diagnosis->created_at
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a diagnosis
     */
    public function destroy($id): JsonResponse
    {
        try {
            $diagnosis = DiagnosisPasien::findOrFail($id);
            $diagnosis->delete();

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus diagnosis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Map diagnosis type from API format to internal format
     */
    private function mapToInternalType(string $apiType): string
    {
        return $apiType === 'primary' ? 'utama' : 'sekunder';
    }

    /**
     * Map diagnosis type from internal format to API format
     */
    private function mapDiagnosisType(string $internalType): string
    {
        return $internalType === 'utama' ? 'primary' : 'secondary';
    }

    /**
     * Extract category from ICD-10 code
     */
    private function extractCategory(string $code): string
    {
        $firstChar = strtoupper(substr($code, 0, 1));

        $categories = [
            'A' => 'Infectious and parasitic diseases',
            'B' => 'Infectious and parasitic diseases',
            'C' => 'Neoplasms',
            'D' => 'Neoplasms',
            'E' => 'Endocrine, nutritional and metabolic diseases',
            'F' => 'Mental and behavioural disorders',
            'G' => 'Diseases of the nervous system',
            'H' => 'Diseases of the eye and adnexa',
            'I' => 'Diseases of the circulatory system',
            'J' => 'Diseases of the respiratory system',
            'K' => 'Diseases of the digestive system',
            'L' => 'Diseases of the skin and subcutaneous tissue',
            'M' => 'Diseases of the musculoskeletal system',
            'N' => 'Diseases of the genitourinary system',
            'O' => 'Pregnancy, childbirth and the puerperium',
            'P' => 'Certain conditions originating in the perinatal period',
            'Q' => 'Congenital malformations, deformations and chromosomal abnormalities',
            'R' => 'Symptoms, signs and abnormal clinical findings',
            'S' => 'Injury, poisoning and certain other consequences',
            'T' => 'Injury, poisoning and certain other consequences',
            'U' => 'Codes for special purposes',
            'V' => 'External causes of morbidity and mortality',
            'W' => 'External causes of morbidity and mortality',
            'X' => 'External causes of morbidity and mortality',
            'Y' => 'External causes of morbidity and mortality',
            'Z' => 'Factors influencing health status and contact with health services'
        ];

        return $categories[$firstChar] ?? 'Unknown';
    }
}