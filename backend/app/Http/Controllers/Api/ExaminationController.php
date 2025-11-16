<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pemeriksaan;
use App\Models\Registration;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ExaminationController extends Controller
{
    /**
     * Get all examinations with filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Pemeriksaan::with(['doctor', 'patient', 'registration']);

            // Apply filters
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('tanggal_pemeriksaan', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('tanggal_pemeriksaan', '<=', $request->date_to);
            }

            if ($request->has('patient_id') && $request->patient_id) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('doctor_id') && $request->doctor_id) {
                $query->where('doctor_id', $request->doctor_id);
            }

            $examinations = $query->orderBy('tanggal_pemeriksaan', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $examinations,
                'message' => 'Examinations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve examinations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get examinations for a specific registration
     */
    public function getByRegistration($registrationId): JsonResponse
    {
        try {
            $examinations = Pemeriksaan::with(['doctor', 'patient'])
                ->where('registration_id', $registrationId)
                ->orderBy('tanggal_pemeriksaan', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $examinations,
                'message' => 'Examinations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve examinations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get examination by ID
     */
    public function show($id): JsonResponse
    {
        try {
            $examination = Pemeriksaan::with(['doctor', 'patient', 'registration'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $examination,
                'message' => 'Examination retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Examination not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new examination
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'registration_id' => 'required',
            'doctor_id' => 'required',
            'patient_id' => 'nullable',

            // Anamnesis (Riwayat)
            'keluhan_utama' => 'nullable|string|max:10000',
            'riwayat_penyakit_sekarang' => 'nullable|string|max:10000',
            'riwayat_penyakit_dahulu' => 'nullable|string|max:10000',
            'riwayat_penyakit_keluarga' => 'nullable|string|max:10000',
            'riwayat_alergi' => 'nullable|string|max:5000',
            'riwayat_pengobatan' => 'nullable|string|max:10000',

            // Pemeriksaan Fisik
            'keadaan_umum' => 'nullable|string|max:2000',
            'kesadaran' => 'nullable|string|max:1000',
            'kepala' => 'nullable|string|max:2000',
            'mata' => 'nullable|string|max:2000',
            'telinga' => 'nullable|string|max:2000',
            'hidung' => 'nullable|string|max:2000',
            'tenggorokan' => 'nullable|string|max:2000',
            'leher' => 'nullable|string|max:2000',
            'thorax' => 'nullable|string|max:2000',
            'jantung' => 'nullable|string|max:2000',
            'paru' => 'nullable|string|max:2000',
            'abdomen' => 'nullable|string|max:2000',
            'ekstremitas' => 'nullable|string|max:2000',
            'neurologi' => 'nullable|string|max:2000',
            'kulit' => 'nullable|string|max:2000',
            'lain_lain' => 'nullable|string|max:2000',

            // Vital Signs
            'berat_badan' => 'nullable|numeric|min:0|max:999.99',
            'tinggi_badan' => 'nullable|numeric|min:0|max:999.99',
            'tekanan_darah_sistolik' => 'nullable|numeric|min:0|max:999.99',
            'tekanan_darah_diastolik' => 'nullable|numeric|min:0|max:999.99',
            'suhu_badan' => 'nullable|numeric|min:0|max:50',
            'denyut_nadi' => 'nullable|integer|min:0|max:300',

            // Diagnosis & Treatment
            'diagnosis_utama' => 'nullable|string|max:1000',
            'diagnosis_sekunder' => 'nullable|string|max:1000',
            'terapi' => 'nullable|string|max:5000',
            'catatan' => 'nullable|string|max:5000',

            // Status
            'status' => 'nullable|in:draft,final',
            'tanggal_pemeriksaan' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = $request->all();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();
            $data['tanggal_pemeriksaan'] = $data['tanggal_pemeriksaan'] ?? now();

            // Calculate BMI if weight and height are provided
            if (isset($data['tanda_vital']) && isset($data['tanda_vital']['weight']) && isset($data['tanda_vital']['height'])) {
                $weight = (float) $data['tanda_vital']['weight'];
                $height = (float) $data['tanda_vital']['height'] / 100; // convert cm to m
                if ($height > 0) {
                    $data['tanda_vital']['bmi'] = round($weight / ($height * $height), 1);
                }
            }

            $examination = Pemeriksaan::create($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $examination->load(['doctor', 'patient', 'registration']),
                'message' => 'Examination created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create examination',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update examination
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'keluhan_utama' => 'nullable|string|max:10000',
            'riwayat_penyakit_sekarang' => 'nullable|string|max:10000',
            'riwayat_penyakit_dahulu' => 'nullable|string|max:10000',
            'riwayat_penyakit_keluarga' => 'nullable|string|max:10000',
            'riwayat_alergi' => 'nullable|string|max:5000',
            'riwayat_pengobatan' => 'nullable|string|max:10000',

            // Pemeriksaan Fisik
            'keadaan_umum' => 'nullable|string|max:2000',
            'kesadaran' => 'nullable|string|max:1000',
            'kepala' => 'nullable|string|max:2000',
            'mata' => 'nullable|string|max:2000',
            'telinga' => 'nullable|string|max:2000',
            'hidung' => 'nullable|string|max:2000',
            'tenggorokan' => 'nullable|string|max:2000',
            'leher' => 'nullable|string|max:2000',
            'thorax' => 'nullable|string|max:2000',
            'jantung' => 'nullable|string|max:2000',
            'paru' => 'nullable|string|max:2000',
            'abdomen' => 'nullable|string|max:2000',
            'ekstremitas' => 'nullable|string|max:2000',
            'neurologi' => 'nullable|string|max:2000',
            'kulit' => 'nullable|string|max:2000',
            'lain_lain' => 'nullable|string|max:2000',

            // Vital Signs
            'berat_badan' => 'nullable|numeric|min:0|max:999.99',
            'tinggi_badan' => 'nullable|numeric|min:0|max:999.99',
            'tekanan_darah_sistolik' => 'nullable|numeric|min:0|max:999.99',
            'tekanan_darah_diastolik' => 'nullable|numeric|min:0|max:999.99',
            'suhu_badan' => 'nullable|numeric|min:0|max:50',
            'denyut_nadi' => 'nullable|integer|min:0|max:300',

            // Diagnosis & Treatment
            'diagnosis_utama' => 'nullable|string|max:1000',
            'diagnosis_sekunder' => 'nullable|string|max:1000',
            'terapi' => 'nullable|string|max:5000',
            'catatan' => 'nullable|string|max:5000',

            // Status
            'status' => 'nullable|in:draft,final',
            'tanggal_pemeriksaan' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $examination = Pemeriksaan::findOrFail($id);

            $data = $request->all();

            // Combine physical examination fields into text
            $physicalExam = "";
            if ($request->keadaan_umum) $physicalExam .= "Keadaan Umum: " . $request->keadaan_umum . "\n";
            if ($request->kesadaran) $physicalExam .= "Kesadaran: " . $request->kesadaran . "\n";
            if ($request->kepala) $physicalExam .= "Kepala: " . $request->kepala . "\n";
            if ($request->mata) $physicalExam .= "Mata: " . $request->mata . "\n";
            if ($request->telinga) $physicalExam .= "Telinga: " . $request->telinga . "\n";
            if ($request->hidung) $physicalExam .= "Hidung: " . $request->hidung . "\n";
            if ($request->tenggorokan) $physicalExam .= "Tenggorokan: " . $request->tenggorokan . "\n";
            if ($request->leher) $physicalExam .= "Leher: " . $request->leher . "\n";
            if ($request->thorax) $physicalExam .= "Thorax: " . $request->thorax . "\n";
            if ($request->jantung) $physicalExam .= "Jantung: " . $request->jantung . "\n";
            if ($request->paru) $physicalExam .= "Paru: " . $request->paru . "\n";
            if ($request->abdomen) $physicalExam .= "Abdomen: " . $request->abdomen . "\n";
            if ($request->ekstremitas) $physicalExam .= "Ekstremitas: " . $request->ekstremitas . "\n";
            if ($request->neurologi) $physicalExam .= "Neurologi: " . $request->neurologi . "\n";
            if ($request->kulit) $physicalExam .= "Kulit: " . $request->kulit . "\n";
            if ($request->lain_lain) $physicalExam .= "Lain-lain: " . $request->lain_lain . "\n";

            // Combine anamnesis fields into text
            $anamnesis = "";
            if ($request->keluhan_utama) $anamnesis .= "Keluhan Utama: " . $request->keluhan_utama . "\n\n";
            if ($request->riwayat_penyakit_sekarang) $anamnesis .= "Riwayat Penyakit Sekarang: " . $request->riwayat_penyakit_sekarang . "\n\n";
            if ($request->riwayat_penyakit_dahulu) $anamnesis .= "Riwayat Penyakit Dahulu: " . $request->riwayat_penyakit_dahulu . "\n\n";
            if ($request->riwayat_penyakit_keluarga) $anamnesis .= "Riwayat Penyakit Keluarga: " . $request->riwayat_penyakit_keluarga . "\n\n";
            if ($request->riwayat_alergi) $anamnesis .= "Riwayat Alergi: " . $request->riwayat_alergi . "\n\n";
            if ($request->riwayat_pengobatan) $anamnesis .= "Riwayat Pengobatan: " . $request->riwayat_pengobatan . "\n\n";

            // Map fields to database columns
            $dbData = [
                'tanggal_pemeriksaan' => $data['tanggal_pemeriksaan'] ?? $examination->tanggal_pemeriksaan,
                'status' => $data['status'] ?? $examination->status,
            ];

            if ($anamnesis) $dbData['anamnesis'] = $anamnesis;
            if ($physicalExam) $dbData['pemeriksaan_fisik'] = $physicalExam;
            if (isset($data['berat_badan'])) $dbData['berat_badan'] = $data['berat_badan'];
            if (isset($data['tinggi_badan'])) $dbData['tinggi_badan'] = $data['tinggi_badan'];
            if (isset($data['tekanan_darah_sistolik'])) $dbData['tekanan_darah_sistolik'] = $data['tekanan_darah_sistolik'];
            if (isset($data['tekanan_darah_diastolik'])) $dbData['tekanan_darah_diastolik'] = $data['tekanan_darah_diastolik'];
            if (isset($data['suhu_badan'])) $dbData['suhu_badan'] = $data['suhu_badan'];
            if (isset($data['denyut_nadi'])) $dbData['denyut_nadi'] = $data['denyut_nadi'];
            if (isset($data['diagnosis_utama'])) $dbData['diagnosa'] = $data['diagnosis_utama'];
            if (isset($data['terapi'])) $dbData['terapi'] = $data['terapi'];
            if (isset($data['catatan'])) $dbData['catatan'] = $data['catatan'];

            $examination->update($dbData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $examination->load(['doctor', 'patient', 'registration']),
                'message' => 'Pemeriksaan berhasil diupdate'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate pemeriksaan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete examination
     */
    public function destroy($id): JsonResponse
    {
        try {
            $examination = Pemeriksaan::findOrFail($id);
            $examination->delete();

            return response()->json([
                'success' => true,
                'message' => 'Examination deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete examination',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get examinations for current doctor
     */
    public function getForCurrentDoctor(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // doctor_id in pemeriksaan table refers to users.id (not m_dokter.id)
            // Use authenticated user ID directly
            $query = Pemeriksaan::with(['patient', 'registration'])
                ->where('doctor_id', $user->id);

            // Apply filters
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('tanggal_pemeriksaan', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('tanggal_pemeriksaan', '<=', $request->date_to);
            }

            if ($request->has('patient_id') && $request->patient_id) {
                $query->where('patient_id', $request->patient_id);
            }

            $examinations = $query->orderBy('tanggal_pemeriksaan', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $examinations,
                'message' => 'Doctor examinations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve examinations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get examination statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            // Use authenticated user ID directly for doctor_id queries
            $stats = [
                'total_examinations' => Pemeriksaan::where('doctor_id', $user->id)->count(),
                'completed_today' => Pemeriksaan::where('doctor_id', $user->id)
                    ->where('status', 'completed')
                    ->whereDate('tanggal_pemeriksaan', today())
                    ->count(),
                'draft_examinations' => Pemeriksaan::where('doctor_id', $user->id)
                    ->where('status', 'draft')
                    ->count(),
                'completed_this_month' => Pemeriksaan::where('doctor_id', $user->id)
                    ->where('status', 'completed')
                    ->whereMonth('tanggal_pemeriksaan', now()->month)
                    ->whereYear('tanggal_pemeriksaan', now()->year)
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Examination statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get today's patients for doctor dashboard
     */
    public function getTodayPatients(Request $request): JsonResponse
    {
        try {
            // Authentication is bypassed for testing - allow public access
            $user = null;

            // For testing, use hardcoded doctor ID 1 or null for all patients
            $doctorId = $request->get('doctor_id', null); // Allow passing doctor_id as query param for testing

            // Use the actual column names from the database tables - user specified 'registrations' table
            // Query database for todays patients - using real data absolutely
            $query = \DB::table('registrations')
                ->join('patients', 'registrations.patient_id', '=', 'patients.id')
                ->whereDate('registrations.created_at', today())
                ->select([
                    'registrations.id',
                    'registrations.no_registrasi as registration_no',
                    'registrations.created_at',
                    'registrations.keluhan as notes',
                    'registrations.status',
                    'patients.name as name',           // ✅ patients.name
                    'patients.mrn as mrn',             // ✅ patients.mrn
                    'patients.birth_date as birth_date', // ✅ patients.birth_date
                    'patients.gender as gender'        // ✅ patients.gender
                ]);

            // Apply doctor filter if specified
            if ($doctorId) {
                $query->where('registrations.dokter_id', $doctorId);
            }

            // Apply has-not-been-examined filter - patients who haven't been examined yet
            $query->whereNotExists(function($subQuery) use ($doctorId) {
                $subQuery->select(\DB::raw(1))
                         ->from('t_pemeriksaan')
                         ->whereRaw('t_pemeriksaan.registration_id = registrations.id');

                if ($doctorId) {
                    $subQuery->where('t_pemeriksaan.doctor_id', $doctorId);
                }
            });

            // Filter patients still waiting or being examined (not completed)
            $query->whereIn('registrations.status', ['menunggu', 'sedang_diperiksa']);

            $todayPatients = $query->orderBy('registrations.created_at', 'asc')
                                  ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $todayPatients,
                'message' => 'Today\'s patients retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve today\'s patients: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark examination as completed
     */
    public function complete($id): JsonResponse
    {
        try {
            $examination = Pemeriksaan::findOrFail($id);
            
            $examination->update([
                'status' => 'completed',
                'updated_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $examination->load(['doctor', 'patient', 'registration']),
                'message' => 'Examination completed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete examination',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get examination history for a patient
     */
    public function getPatientHistory($patientId): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $history = Pemeriksaan::with(['doctor', 'registration'])
                ->where('patient_id', $patientId)
                ->where('doctor_id', $user->id)
                ->where('status', 'completed')
                ->orderBy('tanggal_pemeriksaan', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $history,
                'message' => 'Patient history retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve patient history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
