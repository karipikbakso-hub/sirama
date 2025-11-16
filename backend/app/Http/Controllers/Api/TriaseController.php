<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Triase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class TriaseController extends Controller
{
    /**
     * Menampilkan daftar triase
     */
    public function index(Request $request)
    {
        try {
            $query = Triase::with(['patient', 'registration', 'nurse']);

            // Filter berdasarkan parameter
            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('registration_id')) {
                $query->where('registration_id', $request->registration_id);
            }

            if ($request->has('nurse_id')) {
                $query->where('nurse_id', $request->nurse_id);
            }

            if ($request->has('triage_level')) {
                $query->where('triage_level', $request->triage_level);
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('triage_time', [$request->start_date, $request->end_date]);
            }

            // Urutkan berdasarkan waktu triase terbaru
            $query->latest('triage_time');

            $triases = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $triases,
                'message' => 'Daftar triase berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data triase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan triase baru
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'registration_id' => 'required|integer|exists:registrations,id',
                'patient_id' => 'required|integer|exists:patients,id',
                'chief_complaint' => 'required|string|max:1000',
                'vital_signs' => 'required|array',
                'vital_signs.bloodPressure' => 'nullable|string|max:20',
                'vital_signs.heartRate' => 'nullable|integer|min:30|max:250',
                'vital_signs.temperature' => 'nullable|numeric|min:30|max:45',
                'vital_signs.respirationRate' => 'nullable|integer|min:5|max:60',
                'vital_signs.oxygenSaturation' => 'nullable|integer|min:50|max:100',
                'vital_signs.painScale' => 'nullable|integer|min:0|max:10',
                'vital_signs.consciousness' => 'nullable|string|max:50',
                'priority' => 'required|in:immediate,urgent,standard,non_urgent',
                'estimated_wait_time' => 'required|string|max:50',
                'notes' => 'nullable|string|max:1000',
                'triage_time' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['nurse_id'] = Auth::id();
            $data['created_by'] = Auth::id();

            // Hitung level triase berdasarkan vital signs dan keluhan
            $data['triage_level'] = $this->calculateTriageLevel($data['vital_signs'], $data['chief_complaint']);

            // Set triage_time jika tidak disediakan
            if (!isset($data['triage_time'])) {
                $data['triage_time'] = now();
            }

            $triase = Triase::create($data);

            return response()->json([
                'success' => true,
                'data' => $triase->load(['patient', 'registration', 'nurse']),
                'message' => 'Triase berhasil disimpan'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan triase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan detail triase
     */
    public function show($id)
    {
        try {
            $triase = Triase::with(['patient', 'registration', 'nurse'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $triase,
                'message' => 'Detail triase berhasil diambil'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Triase tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil detail triase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengupdate triase
     */
    public function update(Request $request, $id)
    {
        try {
            $triase = Triase::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'chief_complaint' => 'sometimes|required|string|max:1000',
                'vital_signs' => 'sometimes|required|array',
                'vital_signs.bloodPressure' => 'nullable|string|max:20',
                'vital_signs.heartRate' => 'nullable|integer|min:30|max:250',
                'vital_signs.temperature' => 'nullable|numeric|min:30|max:45',
                'vital_signs.respirationRate' => 'nullable|integer|min:5|max:60',
                'vital_signs.oxygenSaturation' => 'nullable|integer|min:50|max:100',
                'vital_signs.painScale' => 'nullable|integer|min:0|max:10',
                'vital_signs.consciousness' => 'nullable|string|max:50',
                'priority' => 'sometimes|required|in:immediate,urgent,standard,non_urgent',
                'estimated_wait_time' => 'sometimes|required|string|max:50',
                'notes' => 'sometimes|nullable|string|max:1000',
                'triage_time' => 'sometimes|nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['updated_by'] = Auth::id();

            // Hitung ulang level triase jika ada perubahan
            if ($this->hasTriageChanges($data)) {
                $currentData = array_merge($triase->toArray(), $data);
                $data['triage_level'] = $this->calculateTriageLevel(
                    $currentData['vital_signs'] ?? $triase->vital_signs,
                    $currentData['chief_complaint'] ?? $triase->chief_complaint
                );
            }

            $triase->update($data);

            return response()->json([
                'success' => true,
                'data' => $triase->load(['patient', 'registration', 'nurse']),
                'message' => 'Triase berhasil diupdate'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Triase tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengupdate triase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus triase
     */
    public function destroy($id)
    {
        try {
            $triase = Triase::findOrFail($id);
            $triase->delete();

            return response()->json([
                'success' => true,
                'message' => 'Triase berhasil dihapus'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Triase tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus triase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan triase untuk pasien tertentu
     */
    public function getByPatient($patientId)
    {
        try {
            $triases = Triase::with(['patient', 'registration', 'nurse'])
                ->where('patient_id', $patientId)
                ->latest('triage_time')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $triases,
                'message' => 'Triase pasien berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil triase pasien',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan triase untuk registrasi tertentu
     */
    public function getByRegistration($registrationId)
    {
        try {
            $triases = Triase::with(['patient', 'registration', 'nurse'])
                ->where('registration_id', $registrationId)
                ->latest('triage_time')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $triases,
                'message' => 'Triase registrasi berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil triase registrasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan triase terbaru untuk pasien
     */
    public function getLatestByPatient($patientId)
    {
        try {
            $triase = Triase::with(['patient', 'registration', 'nurse'])
                ->where('patient_id', $patientId)
                ->latest('triage_time')
                ->first();

            if (!$triase) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data triase untuk pasien ini'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $triase,
                'message' => 'Triase terbaru pasien berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil triase terbaru pasien',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan pasien yang belum ditriase (untuk IGD)
     */
    public function getUntriagedPatients(Request $request)
    {
        try {
            // Ambil dari emergency registrations yang belum ada di triase
            $untriagedPatients = \App\Models\EmergencyRegistration::with(['patient', 'registration'])
                ->whereDoesntHave('triages') // Menggunakan relationship yang sudah didefinisikan
                ->where('status', 'waiting') // Hanya yang masih waiting
                ->latest('created_at')
                ->get()
                ->map(function ($emergencyReg) {
                    return [
                        'id' => $emergencyReg->registration_id, // Frontend expects this as registration_id for selection
                        'patient_id' => $emergencyReg->patient_id,
                        'registration_id' => $emergencyReg->registration_id,
                        'name' => $emergencyReg->patient->name ?? 'Unknown',
                        'medical_record_number' => $emergencyReg->patient->mrn ?? 'Unknown',
                        'age' => $emergencyReg->patient->birth_date ?
                            \Carbon\Carbon::parse($emergencyReg->patient->birth_date)->age : 0,
                        'gender' => $emergencyReg->patient->gender ?? 'male',
                        'arrival_time' => $emergencyReg->created_at,
                        'chief_complaint' => $emergencyReg->keluhan_utama ?? $emergencyReg->chief_complaint ?? '',
                        'status' => 'waiting'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $untriagedPatients,
                'message' => 'Pasien yang belum ditriase berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil pasien yang belum ditriase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik triase
     */
    public function getStatistics(Request $request)
    {
        try {
            $query = Triase::query();

            // Filter berdasarkan tanggal jika ada
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('triage_time', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            $totalEntries = $query->count();
            $level1Count = (clone $query)->where('triage_level', 1)->count();
            $level2Count = (clone $query)->where('triage_level', 2)->count();
            $level3Count = (clone $query)->where('triage_level', 3)->count();
            $level4Count = (clone $query)->where('triage_level', 4)->count();
            $level5Count = (clone $query)->where('triage_level', 5)->count();

            $levelStats = [
                'level_1' => $level1Count,
                'level_2' => $level2Count,
                'level_3' => $level3Count,
                'level_4' => $level4Count,
                'level_5' => $level5Count
            ];

            $priorityStats = [
                'immediate' => (clone $query)->where('priority', 'immediate')->count(),
                'urgent' => (clone $query)->where('priority', 'urgent')->count(),
                'standard' => (clone $query)->where('priority', 'standard')->count(),
                'non_urgent' => (clone $query)->where('priority', 'non_urgent')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'level_statistics' => $levelStats,
                    'priority_statistics' => $priorityStats
                ],
                'message' => 'Statistik triase berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik triase',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghitung level triase berdasarkan vital signs dan keluhan
     */
    private function calculateTriageLevel(array $vitals, string $complaint): int
    {
        // Level 1: Immediate - Life threatening
        if (
            (isset($vitals['respirationRate']) && ($vitals['respirationRate'] > 30 || $vitals['respirationRate'] < 8)) ||
            (isset($vitals['oxygenSaturation']) && $vitals['oxygenSaturation'] < 90) ||
            (isset($vitals['heartRate']) && ($vitals['heartRate'] > 130 || $vitals['heartRate'] < 40)) ||
            (isset($vitals['bloodPressure']) && $this->isBloodPressureCritical($vitals['bloodPressure'])) ||
            (isset($vitals['painScale']) && $vitals['painScale'] >= 9) ||
            $this->hasCriticalSymptoms($complaint)
        ) {
            return 1;
        }

        // Level 2: Urgent - High priority
        if (
            (isset($vitals['respirationRate']) && $vitals['respirationRate'] > 25) ||
            (isset($vitals['oxygenSaturation']) && $vitals['oxygenSaturation'] < 93) ||
            (isset($vitals['heartRate']) && $vitals['heartRate'] > 110) ||
            (isset($vitals['temperature']) && $vitals['temperature'] > 39) ||
            (isset($vitals['painScale']) && $vitals['painScale'] >= 7) ||
            $this->hasUrgentSymptoms($complaint)
        ) {
            return 2;
        }

        // Level 3: Standard - Moderate priority
        if (
            (isset($vitals['temperature']) && $vitals['temperature'] > 38.5) ||
            (isset($vitals['painScale']) && $vitals['painScale'] >= 5) ||
            $this->hasModerateSymptoms($complaint)
        ) {
            return 3;
        }

        // Level 4: Low priority
        if (
            (isset($vitals['painScale']) && $vitals['painScale'] >= 3) ||
            $this->hasMildSymptoms($complaint)
        ) {
            return 4;
        }

        // Level 5: Minimal priority
        return 5;
    }

    /**
     * Mengecek apakah tekanan darah kritis
     */
    private function isBloodPressureCritical(string $bloodPressure): bool
    {
        // Parse blood pressure format "120/80"
        $parts = explode('/', $bloodPressure);
        if (count($parts) !== 2) return false;

        $systolic = (int) trim($parts[0]);
        $diastolic = (int) trim($parts[1]);

        return $systolic > 200 || $systolic < 80 || $diastolic > 120 || $diastolic < 50;
    }

    /**
     * Mengecek gejala kritis
     */
    private function hasCriticalSymptoms(string $complaint): bool
    {
        $criticalKeywords = [
            'sesak napas hebat', 'nyeri dada hebat', 'tidak sadar', 'kejang',
            'pendarahan hebat', 'trauma kepala', 'patah tulang terbuka'
        ];

        $complaint = strtolower($complaint);
        foreach ($criticalKeywords as $keyword) {
            if (str_contains($complaint, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mengecek gejala urgent
     */
    private function hasUrgentSymptoms(string $complaint): bool
    {
        $urgentKeywords = [
            'pendarahan', 'demam tinggi', 'muntah darah', 'bab berdarah',
            'nyeri perut hebat', 'trauma', 'luka bakar'
        ];

        $complaint = strtolower($complaint);
        foreach ($urgentKeywords as $keyword) {
            if (str_contains($complaint, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mengecek gejala moderate
     */
    private function hasModerateSymptoms(string $complaint): bool
    {
        $moderateKeywords = [
            'demam', 'batuk berdahak', 'nyeri sedang', 'mual muntah',
            'diare', 'alergi'
        ];

        $complaint = strtolower($complaint);
        foreach ($moderateKeywords as $keyword) {
            if (str_contains($complaint, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mengecek gejala mild
     */
    private function hasMildSymptoms(string $complaint): bool
    {
        $mildKeywords = [
            'cedera', 'sakit kepala', 'pilek', 'batuk', 'nyeri ringan'
        ];

        $complaint = strtolower($complaint);
        foreach ($mildKeywords as $keyword) {
            if (str_contains($complaint, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Mengecek apakah ada perubahan pada data triase
     */
    private function hasTriageChanges(array $data): bool
    {
        $triageFields = [
            'chief_complaint',
            'vital_signs',
            'priority',
            'estimated_wait_time'
        ];

        foreach ($triageFields as $field) {
            if (array_key_exists($field, $data)) {
                return true;
            }
        }

        return false;
    }
}
