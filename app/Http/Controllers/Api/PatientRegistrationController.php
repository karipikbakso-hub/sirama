<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Indonesian\Pasien;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class PatientRegistrationController extends Controller
{
    private array $alergiOptions = ['Obat', 'Makanan', 'Lainnya'];
    private array $penyakitOptions = ['Hipertensi', 'Diabetes', 'Jantung', 'Asma', 'Kolesterol', 'Stroke', 'Kanker'];

    /**
     * Register new patient
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'nik' => 'required|string|size:16|regex:/^\d+$/|unique:m_pasien,nik',
                'no_bpjs' => 'nullable|string|size:13|regex:/^\d+$/unique:m_pasien,no_bpjs',
                'nama_lengkap' => 'required|string|min:3|max:255',
                'tanggal_lahir' => 'required|date|before:today',
                'jenis_kelamin' => 'required|in:L,P',
                'golongan_darah' => 'nullable|in:A,B,AB,O',
                'rhesus' => 'nullable|in:+,-',
                'alamat' => 'required|string|min:10|max:500',
                'provinsi' => 'required|string|max:100',
                'kota' => 'required|string|max:100',
                'kecamatan' => 'required|string|max:100',
                'kelurahan' => 'required|string|max:100',
                'rt' => 'nullable|string|max:3',
                'rw' => 'nullable|string|max:3',
                'kode_pos' => 'nullable|string|regex:/^\d{5}$/',
                'telepon' => 'required|string|regex:/^08\d{8,12}$/',
                'telepon_alternatif' => 'nullable|string|regex:/^08\d{8,12}$/',
                'email' => 'nullable|email|max:255',
                'pekerjaan' => 'nullable|string|max:100',
                'status_pernikahan' => 'nullable|string|max:50',
                'agama' => 'nullable|string|max:50',
                'nama_penanggung_jawab' => 'required|string|min:3|max:255',
                'hubungan_penanggung_jawab' => 'nullable|string|max:50',
                'telepon_penanggung_jawab' => 'required|string|regex:/^[0-9+\-\s()]+$|min:10',
                'kontak_darurat' => 'nullable|string|min:3|max:255',
                'jenis_asuransi' => 'required|in:BPJS,Asuransi Swasta,Perusahaan,Umum',
                'kelas_bpjs' => 'nullable|in:1,2,3|required_if:jenis_asuransi,BPJS',
                'provider_asuransi' => 'nullable|string|max:255',
                'nomor_asuransi' => 'nullable|string|max:50',
                'alergi' => 'nullable|array',
                'alergi.*' => 'string|in:' . implode(',', $this->alergiOptions),
                'penyakit_kronis' => 'nullable|array',
                'penyakit_kronis.*' => 'string|in:' . implode(',', $this->penyakitOptions),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Additional validation for insurance
            $data = $validator->validated();
            if ($data['jenis_asuransi'] === 'BPJS' && empty($data['no_bpjs'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No BPJS required for BPJS insurance type'
                ], 422);
            }

            if (in_array($data['jenis_asuransi'], ['Asuransi Swasta', 'Perusahaan'])) {
                if (empty($data['provider_asuransi']) || empty($data['nomor_asuransi'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Provider and policy number required for private insurance'
                    ], 422);
                }
            }

            DB::beginTransaction();

            // Generate MR number
            $no_rm = $this->generateMRNumber();

            // Create patient
            $pasien = Pasien::create([
                'no_rm' => $no_rm,
                'nama_lengkap' => $data['nama_lengkap'],
                'nik' => $data['nik'],
                'tanggal_lahir' => $data['tanggal_lahir'],
                'jenis_kelamin' => $data['jenis_kelamin'],
                'golongan_darah' => $data['golongan_darah'] ?? null,
                'rhesus' => $data['rhesus'] ?? null,
                'alamat' => $data['alamat'],
                'provinsi' => $data['provinsi'],
                'kota' => $data['kota'],
                'kecamatan' => $data['kecamatan'],
                'kelurahan' => $data['kelurahan'],
                'rt' => $data['rt'] ?? null,
                'rw' => $data['rw'] ?? null,
                'kode_pos' => $data['kode_pos'] ?? null,
                'telepon' => $data['telepon'],
                'telepon_alternatif' => $data['telepon_alternatif'] ?? null,
                'email' => $data['email'] ?? null,
                'pekerjaan' => $data['pekerjaan'] ?? null,
                'status_pernikahan' => $data['status_pernikahan'] ?? null,
                'agama' => $data['agama'] ?? null,
                'nama_penanggung_jawab' => $data['nama_penanggung_jawab'],
                'hubungan_penanggung_jawab' => $data['hubungan_penanggung_jawab'] ?? null,
                'telepon_penanggung_jawab' => $data['telepon_penanggung_jawab'],
                'kontak_darurat' => $data['kontak_darurat'] ?? null,
                'jenis_asuransi' => $data['jenis_asuransi'],
                'kelas_bpjs' => $data['kelas_bpjs'] ?? null,
                'provider_asuransi' => $data['provider_asuransi'] ?? null,
                'nomor_asuransi' => $data['nomor_asuransi'] ?? null,
                'no_bpjs' => $data['no_bpjs'] ?? null,
                'alergi' => $data['alergi'] ?? null,
                'penyakit_kronis' => $data['penyakit_kronis'] ?? null,
                'status_aktif' => 'aktif',
                'created_by' => $request->user()->id ?? 1
            ]);

            // Generate QR code
            $qrCodePath = $this->generateQRCode($pasien);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'pasien' => $pasien,
                    'qr_code' => $qrCodePath,
                    'no_rm' => $no_rm
                ],
                'message' => 'Patient registered successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Patient registration error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to register patient: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if NIK exists
     */
    public function checkNIK(Request $request): JsonResponse
    {
        $nik = $request->query('nik');

        if (!$nik || strlen($nik) !== 16 || !preg_match('/^\d+$/', $nik)) {
            return response()->json([
                'exists' => false,
                'message' => 'Invalid NIK format'
            ]);
        }

        $pasien = Pasien::where('nik', $nik)->first();

        return response()->json([
            'exists' => $pasien !== null,
            'pasien' => $pasien ? [
                'id' => $pasien->id,
                'no_rm' => $pasien->no_rm,
                'nama_lengkap' => $pasien->nama_lengkap
            ] : null
        ]);
    }

    /**
     * Validate BPJS number
     */
    public function validateBPJS(Request $request): JsonResponse
    {
        try {
            $no_bpjs = $request->input('no_bpjs');

            if (!$no_bpjs || strlen($no_bpjs) !== 13 || !preg_match('/^\d+$/', $no_bpjs)) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Invalid BPJS number format'
                ]);
            }

            // TODO: Integrate with actual BPJS VClaim API
            // For now, return mock validation
            $isValid = strlen($no_bpjs) === 13;

            return response()->json([
                'valid' => $isValid,
                'data' => $isValid ? [
                    'nama' => 'NAMA PASIEN BPJS',
                    'tgl_lahir' => '1990-01-01',
                    'no_kartu' => $no_bpjs
                ] : null,
                'message' => $isValid ? 'BPJS number valid' : 'BPJS number not found'
            ]);

        } catch (\Exception $e) {
            Log::error('BPJS validation error: ' . $e->getMessage());

            return response()->json([
                'valid' => false,
                'message' => 'BPJS validation service unavailable'
            ], 500);
        }
    }

    /**
     * Get provinces
     */
    public function getProvinces(): JsonResponse
    {
        // Mock Indonesian provinces data
        $provinces = [
            ['id' => '11', 'nama' => 'ACEH'],
            ['id' => '12', 'nama' => 'SUMATERA UTARA'],
            ['id' => '13', 'nama' => 'SUMATERA BARAT'],
            // Add more provinces as needed
            ['id' => '31', 'nama' => 'DKI JAKARTA'],
            ['id' => '32', 'nama' => 'JAWA BARAT'],
        ];

        return response()->json([
            'success' => true,
            'data' => $provinces
        ]);
    }

    /**
     * Get cities by province
     */
    public function getCities(Request $request): JsonResponse
    {
        $provinceId = $request->query('provinsi_id');

        // Mock cities data
        $cities = [
            ['id' => $provinceId . '01', 'nama' => 'KOTA ADMINISTRASI JAKARTA PUSAT'],
            ['id' => $provinceId . '02', 'nama' => 'KOTA ADMINISTRASI JAKARTA UTARA'],
            // Add more based on province
        ];

        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }

    /**
     * Get districts by city
     */
    public function getDistricts(Request $request): JsonResponse
    {
        $cityId = $request->query('kota_id');

        // Mock districts data
        $districts = [
            ['id' => $cityId . '01', 'nama' => 'TANAH ABANG'],
            ['id' => $cityId . '02', 'nama' => 'MENTENG'],
            // Add more based on city
        ];

        return response()->json([
            'success' => true,
            'data' => $districts
        ]);
    }

    /**
     * Emergency IGD Registration
     */
    public function registrasiIGD(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $validator = Validator::make($request->all(), [
                'patient_type' => 'required|in:new,existing',
                // New patient fields
                'nama_lengkap' => 'required_if:patient_type,new|string|min:2|max:255',
                'nik' => 'nullable|string|size:16|regex:/^\d+$/',
                'tanggal_lahir' => 'required_if:patient_type,new|date|before:today',
                'jenis_kelamin' => 'required_if:patient_type,new|in:L,P',
                'telepon' => 'required_if:patient_type,new|string|regex:/^08\d{8,12}$/',
                // Existing patient field
                'selected_patient_id' => 'required_if:patient_type,existing|exists:m_pasien,id',
                // Emergency fields
                'triage_level' => 'required|in:merah,kuning,hijau,hitam',
                'keluhan_utama' => 'required|string|min:10|max:1000',
                'cara_masuk' => 'required|in:datang_sendiri,ambulans_118,rujukan_puskesmas,rujukan_rs_lain',
                'penjamin' => 'required|in:bpjs,umum,asuransi_swasta'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $user = $request->user();

            // Handle patient data
            if ($data['patient_type'] === 'new') {
                // Create new emergency patient record
                $no_rm = 'TEMP-' . date('Ymd') . '-' . rand(1000, 9999);

                $patient = Pasien::create([
                    'no_rm' => $no_rm,
                    'nama_lengkap' => $data['nama_lengkap'],
                    'nik' => $data['nik'] ?? null,
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'jenis_kelamin' => $data['jenis_kelamin'],
                    'telepon' => $data['telepon'],
                    'jenis_asuransi' => $data['penjamin'] === 'bpjs' ? 'BPJS' : ($data['penjamin'] === 'asuransi_swasta' ? 'Asuransi Swasta' : 'Umum'),
                    'status_aktif' => 'aktif',
                    'created_by' => $user->id ?? 1,
                ]);

                $patientId = $patient->id;
                Log::info('Created emergency patient: ' . $patient->nama_lengkap . ' (RM: ' . $no_rm . ')');
            } else {
                // Use existing patient
                $patient = Pasien::find($data['selected_patient_id']);
                if (!$patient) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Patient not found'
                    ], 404);
                }
                $patientId = $patient->id;
            }

            // Create emergency registration record
            $emergencyRegistration = \App\Models\EmergencyRegistration::create([
                'patient_id' => $patientId,
                'triage_level' => $data['triage_level'],
                'keluhan_utama' => $data['keluhan_utama'],
                'cara_masuk' => $data['cara_masuk'],
                'penjamin' => $data['penjamin'],
                'status' => 'waiting',
                'registered_by' => $user->id ?? 1,
                'arrival_type' => 'emergency'
            ]);

            // Generate queue number based on triage priority
            $queueNumber = $this->generateIGDQueueNumber($data['triage_level']);

            // Create queue management record
            $queue = \App\Models\QueueManagement::create([
                'service_type' => 'igd',
                'current_number' => $queueNumber,
                'status' => 'active',
                'priority' => $this->getTriagePriority($data['triage_level']),
                'estimated_wait_time' => $this->calculateEstimatedTime($data['triage_level']),
                'registration_id' => $emergencyRegistration->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // TODO: Send notification to doctor jaga IGD
            // This would integrate with notification system

            DB::commit();

            Log::info('Emergency IGD registration completed: Patient ' . $patient->nama_lengkap .
                      ' - Queue: ' . $queueNumber . ' - Triage: ' . $data['triage_level']);

            return response()->json([
                'success' => true,
                'data' => [
                    'patient' => [
                        'id' => $patient->id,
                        'nama_lengkap' => $patient->nama_lengkap,
                        'no_rm' => $patient->no_rm ?? 'TEMP',
                    ],
                    'queue_number' => $queueNumber,
                    'estimated_time' => $queue->estimated_wait_time,
                    'triage_level' => $data['triage_level'],
                ],
                'message' => 'Emergency IGD registration successful'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('IGD Emergency registration failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to register emergency patient: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get villages by district
     */
    public function getVillages(Request $request): JsonResponse
    {
        $districtId = $request->query('kecamatan_id');

        // Mock villages data
        $villages = [
            ['id' => $districtId . '01', 'nama' => 'KEBON KACANG'],
            ['id' => $districtId . '02', 'nama' => 'PETAMBURAN'],
            // Add more based on district
        ];

        return response()->json([
            'success' => true,
            'data' => $villages
        ]);
    }

    /**
     * Generate unique Medical Record Number
     */
    private function generateMRNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $day = date('d');

        $lastPatient = Pasien::where('no_rm', 'like', "MR-{$year}{$month}{$day}-%")
                            ->orderBy('id', 'desc')
                            ->first();

        if ($lastPatient) {
            preg_match('/MR-\d{8}-(\d{4})$/', $lastPatient->no_rm, $matches);
            $lastNumber = (int) $matches[1];
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf("MR-%s%s%s-%04d", $year, $month, $day, $newNumber);
    }

    /**
     * Generate QR code for patient MR number
     */
    private function generateQRCode(Pasien $pasien): string
    {
        try {
            $qrCodeData = json_encode([
                'no_rm' => $pasien->no_rm,
                'nama' => $pasien->nama_lengkap,
                'nik' => $pasien->nik,
                'tanggal_lahir' => $pasien->tanggal_lahir->format('Y-m-d')
            ]);

            $qrCode = QrCode::format('png')
                          ->size(200)
                          ->generate($qrCodeData);

            $fileName = "qr_{$pasien->no_rm}.png";
            $path = "qr-codes/{$fileName}";

            Storage::disk('public')->put($path, $qrCode);

            return Storage::disk('public')->url($path);

        } catch (\Exception $e) {
            Log::error('QR code generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate IGD queue number based on triage level
     */
    private function generateIGDQueueNumber(string $triageLevel): string
    {
        $prefix = 'IGD';
        $date = date('Ymd');

        // Get last queue number for today
        $lastQueue = \App\Models\QueueManagement::where('service_type', 'igd')
            ->whereDate('created_at', today())
            ->where('current_number', 'like', "{$prefix}-{$date}-%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastQueue) {
            preg_match('/IGD-\d{8}-(\d{3})$/', $lastQueue->current_number, $matches);
            $lastNumber = (int) $matches[1];
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf("IGD-%s-%03d", $date, $newNumber);
    }

    /**
     * Get triage priority value
     */
    private function getTriagePriority(string $triageLevel): int
    {
        return match($triageLevel) {
            'merah' => 1,   // Highest priority - immediate
            'kuning' => 2,  // Urgent
            'hijau' => 3,   // Non-urgent
            'hitam' => 4,   // DOA - lowest priority but special handling
            default => 3
        };
    }

    /**
     * Calculate estimated wait time based on triage level
     */
    private function calculateEstimatedTime(string $triageLevel): int
    {
        return match($triageLevel) {
            'merah' => 1,   // Immediate attention
            'kuning' => 15, // 15 minutes
            'hijau' => 60,  // 1 hour
            'hitam' => 0,   // No wait time - DOA
            default => 30   // 30 minutes default
        };
    }
}
