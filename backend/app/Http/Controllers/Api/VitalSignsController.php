<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TandaVital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class VitalSignsController extends Controller
{
    /**
     * Menampilkan daftar tanda vital
     */
    public function index(Request $request)
    {
        try {
            $query = TandaVital::with(['patient', 'registration', 'nurse']);

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

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('measured_at', [$request->start_date, $request->end_date]);
            }

            // Urutkan berdasarkan waktu pengukuran terbaru
            $query->latest('measured_at');

            $vitalSigns = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $vitalSigns,
                'message' => 'Daftar tanda vital berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data tanda vital',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan tanda vital baru
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'registration_id' => 'required|integer|exists:registrations,id',
                'patient_id' => 'required|integer|exists:patients,id',
                'blood_pressure_systolic' => 'nullable|integer|min:50|max:300',
                'blood_pressure_diastolic' => 'nullable|integer|min:30|max:200',
                'heart_rate' => 'nullable|integer|min:30|max:250',
                'temperature' => 'nullable|numeric|min:30|max:45',
                'respiration_rate' => 'nullable|integer|min:5|max:60',
                'oxygen_saturation' => 'nullable|integer|min:50|max:100',
                'weight' => 'nullable|numeric|min:0|max:500',
                'height' => 'nullable|numeric|min:30|max:250',
                'notes' => 'nullable|string|max:1000',
                'measured_at' => 'nullable|date'
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

            // Set measured_at jika tidak disediakan
            if (!isset($data['measured_at'])) {
                $data['measured_at'] = now();
            }

            // Hitung status berdasarkan nilai vital
            $data['status'] = $this->determineStatus($data);

            $vitalSign = TandaVital::create($data);

            return response()->json([
                'success' => true,
                'data' => $vitalSign->load(['patient', 'registration', 'nurse']),
                'message' => 'Tanda vital berhasil disimpan'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan tanda vital',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan detail tanda vital
     */
    public function show($id)
    {
        try {
            $vitalSign = TandaVital::with(['patient', 'registration', 'nurse'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $vitalSign,
                'message' => 'Detail tanda vital berhasil diambil'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tanda vital tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil detail tanda vital',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengupdate tanda vital
     */
    public function update(Request $request, $id)
    {
        try {
            $vitalSign = TandaVital::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'blood_pressure_systolic' => 'sometimes|nullable|integer|min:50|max:300',
                'blood_pressure_diastolic' => 'sometimes|nullable|integer|min:30|max:200',
                'heart_rate' => 'sometimes|nullable|integer|min:30|max:250',
                'temperature' => 'sometimes|nullable|numeric|min:30|max:45',
                'respiration_rate' => 'sometimes|nullable|integer|min:5|max:60',
                'oxygen_saturation' => 'sometimes|nullable|integer|min:50|max:100',
                'weight' => 'sometimes|nullable|numeric|min:0|max:500',
                'height' => 'sometimes|nullable|numeric|min:30|max:250',
                'notes' => 'sometimes|nullable|string|max:1000',
                'measured_at' => 'sometimes|nullable|date'
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

            // Hitung ulang status jika ada perubahan nilai vital
            if ($this->hasVitalSignChanges($data)) {
                $currentData = array_merge($vitalSign->toArray(), $data);
                $data['status'] = $this->determineStatus($currentData);
            }

            $vitalSign->update($data);

            return response()->json([
                'success' => true,
                'data' => $vitalSign->load(['patient', 'registration', 'nurse']),
                'message' => 'Tanda vital berhasil diupdate'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tanda vital tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengupdate tanda vital',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus tanda vital
     */
    public function destroy($id)
    {
        try {
            $vitalSign = TandaVital::findOrFail($id);
            $vitalSign->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tanda vital berhasil dihapus'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tanda vital tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus tanda vital',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan tanda vital untuk pasien tertentu
     */
    public function getByPatient($patientId)
    {
        try {
            $vitalSigns = TandaVital::with(['patient', 'registration', 'nurse'])
                ->where('patient_id', $patientId)
                ->latest('measured_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $vitalSigns,
                'message' => 'Tanda vital pasien berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil tanda vital pasien',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan tanda vital untuk registrasi tertentu
     */
    public function getByRegistration($registrationId)
    {
        try {
            $vitalSigns = TandaVital::with(['patient', 'registration', 'nurse'])
                ->where('registration_id', $registrationId)
                ->latest('measured_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $vitalSigns,
                'message' => 'Tanda vital registrasi berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil tanda vital registrasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan tanda vital terbaru untuk pasien
     */
    public function getLatestByPatient($patientId)
    {
        try {
            $vitalSign = TandaVital::with(['patient', 'registration', 'nurse'])
                ->where('patient_id', $patientId)
                ->latest('measured_at')
                ->first();

            if (!$vitalSign) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data tanda vital untuk pasien ini'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $vitalSign,
                'message' => 'Tanda vital terbaru pasien berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil tanda vital terbaru pasien',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik tanda vital
     */
    public function getStatistics(Request $request)
    {
        try {
            $query = TandaVital::query();

            // Filter berdasarkan tanggal jika ada
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('measured_at', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            $totalEntries = $query->count();
            $normalEntries = (clone $query)->where('status', 'normal')->count();
            $warningEntries = (clone $query)->where('status', 'warning')->count();
            $criticalEntries = (clone $query)->where('status', 'critical')->count();

            $statusStats = [
                'normal' => $normalEntries,
                'warning' => $warningEntries,
                'critical' => $criticalEntries
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'status_statistics' => $statusStats
                ],
                'message' => 'Statistik tanda vital berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik tanda vital',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menentukan status berdasarkan nilai tanda vital
     */
    private function determineStatus(array $data): string
    {
        // Cek kondisi kritis
        if (
            (isset($data['blood_pressure_systolic']) && ($data['blood_pressure_systolic'] > 180 || $data['blood_pressure_systolic'] < 90)) ||
            (isset($data['blood_pressure_diastolic']) && ($data['blood_pressure_diastolic'] > 120 || $data['blood_pressure_diastolic'] < 60)) ||
            (isset($data['heart_rate']) && ($data['heart_rate'] > 120 || $data['heart_rate'] < 50)) ||
            (isset($data['temperature']) && ($data['temperature'] > 39 || $data['temperature'] < 35)) ||
            (isset($data['respiration_rate']) && ($data['respiration_rate'] > 30 || $data['respiration_rate'] < 8)) ||
            (isset($data['oxygen_saturation']) && $data['oxygen_saturation'] < 90)
        ) {
            return 'critical';
        }

        // Cek kondisi perhatian
        if (
            (isset($data['blood_pressure_systolic']) && ($data['blood_pressure_systolic'] > 160 || $data['blood_pressure_systolic'] < 100)) ||
            (isset($data['blood_pressure_diastolic']) && ($data['blood_pressure_diastolic'] > 100 || $data['blood_pressure_diastolic'] < 70)) ||
            (isset($data['heart_rate']) && ($data['heart_rate'] > 100 || $data['heart_rate'] < 60)) ||
            (isset($data['temperature']) && ($data['temperature'] > 38 || $data['temperature'] < 36)) ||
            (isset($data['respiration_rate']) && ($data['respiration_rate'] > 20 || $data['respiration_rate'] < 12)) ||
            (isset($data['oxygen_saturation']) && $data['oxygen_saturation'] < 95)
        ) {
            return 'warning';
        }

        return 'normal';
    }

    /**
     * Mengecek apakah ada perubahan pada nilai tanda vital
     */
    private function hasVitalSignChanges(array $data): bool
    {
        $vitalFields = [
            'blood_pressure_systolic',
            'blood_pressure_diastolic',
            'heart_rate',
            'temperature',
            'respiration_rate',
            'oxygen_saturation',
            'weight',
            'height'
        ];

        foreach ($vitalFields as $field) {
            if (array_key_exists($field, $data)) {
                return true;
            }
        }

        return false;
    }
}
