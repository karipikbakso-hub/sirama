<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Indonesian\Pasien as Patient;
use App\Models\CatatanCppt;
use App\Models\ResepObat;
use App\Models\PesananLab;
use App\Models\PesananRadiologi;
use App\Models\Icd10Diagnosis;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class DoctorModuleController extends Controller
{
    // ==================== EMR (Electronic Medical Records) ====================

    /**
     * Get patient EMR data - Complete EMR with all medical records
     */
    public function getPatientEmr($patientId): JsonResponse
    {
        try {
            // Load patient with basic info and allergies
            $patient = Patient::with([
                'registrasi' => function($query) {
                    $query->with([
                        'cppt' => function($cpptQuery) {
                            $cpptQuery->orderBy('created_at', 'desc');
                        },
                        'diagnoses' => function($diagQuery) {
                            $diagQuery->orderBy('created_at', 'desc');
                        }
                    ])->orderBy('created_at', 'desc');
                }
            ])->findOrFail($patientId);

            // Transform patient data to match requirements
            $patientData = [
                'id' => $patient->id,
                'medical_record_number' => $patient->no_rm,
                'full_name' => $patient->nama_lengkap,
                'date_of_birth' => $patient->tanggal_lahir ? $patient->tanggal_lahir->format('Y-m-d') : null,
                'gender' => $patient->jenis_kelamin,
                'allergies' => $patient->alergi ?? null,
                'chronic_diseases' => $patient->penyakit_kronis ?? null,
                'phone' => $patient->telepon,
                'address' => $patient->alamat,
                'bpjs_number' => $patient->no_bpjs,
                'nik' => $patient->nik
            ];

            // Get registrations with CPPT and diagnoses
            $registrations = $patient->registrasi->map(function($registration) {
                return [
                    'id' => $registration->id,
                    'registration_date' => $registration->registration_date?->format('Y-m-d H:i:s') ?? $registration->created_at->format('Y-m-d H:i:s'),
                    'complaint' => $registration->keluhan_utama ?? '',
                    'diagnosis' => $registration->diagnosa ?? '',
                    'doctor_name' => $registration->doctor?->name ?? 'Dokter Tidak Diketahui',
                    'cppt' => $registration->cppt->map(function($cppt) {
                        return [
                            'id' => $cppt->id,
                            'subjective' => $cppt->subjective ?? '',
                            'objective' => $cppt->objective ?? '',
                            'assessment' => $cppt->assessment ?? '',
                            'plan' => $cppt->plan ?? '',
                            'created_at' => $cppt->created_at->format('Y-m-d H:i:s'),
                            'created_by' => $cppt->created_by_user?->name ?? 'Sistem'
                        ];
                    }),
                    'diagnoses' => $registration->diagnoses->map(function($diag) {
                        return [
                            'id' => $diag->id,
                            'icd10_code' => $diag->icd10_code ?? '',
                            'icd10_name' => $diag->icd10_name ?? '',
                            'diagnosis_type' => $diag->diagnosis_type ?? 'primary',
                            'created_at' => $diag->created_at->format('Y-m-d H:i:s')
                        ];
                    })
                ];
            });

            // Get prescriptions with items
            $prescriptions = $patient->registrasi->flatMap(function($registration) {
                return $registration->prescriptions ?? collect();
            })->map(function($prescription) {
                return [
                    'id' => $prescription->id,
                    'registration_id' => $prescription->registration_id,
                    'prescription_date' => $prescription->tanggal_resep?->format('Y-m-d H:i:s') ?? $prescription->created_at->format('Y-m-d H:i:s'),
                    'doctor_name' => $prescription->dokter?->name ?? 'Dokter Tidak Diketahui',
                    'diagnosis' => $prescription->diagnosa ?? '',
                    'status' => $prescription->status ?? 'aktif',
                    'items' => $prescription->items?->map(function($item) {
                        return [
                            'medicine_name' => $item->nama_obat ?? $item->medicine_name ?? '',
                            'dosage' => $item->dosis ?? $item->dosage ?? '',
                            'frequency' => $item->frekuensi ?? $item->frequency ?? '',
                            'duration' => $item->durasi ?? $item->duration ?? '',
                            'instructions' => $item->instruksi ?? ''
                        ];
                    }) ?? []
                ];
            });

            // Get lab orders
            $labOrders = $patient->registrasi->flatMap(function($registration) {
                return $registration->laboratorium ?? collect();
            })->map(function($labOrder) {
                return [
                    'id' => $labOrder->id,
                    'registration_id' => $labOrder->registration_id,
                    'test_name' => $labOrder->nama_pemeriksaan ?? $labOrder->test_name ?? '',
                    'result' => $labOrder->hasil ?? $labOrder->result ?? '',
                    'ordered_date' => $labOrder->tanggal_pesanan?->format('Y-m-d H:i:s') ?? $labOrder->created_at->format('Y-m-d H:i:s'),
                    'doctor_name' => $labOrder->dokter?->name ?? 'Dokter Tidak Diketahui',
                    'status' => $labOrder->status_pesanan ?? 'menunggu'
                ];
            });

            // Get radiology orders
            $radiologyOrders = $patient->registrasi->flatMap(function($registration) {
                return $registration->radiologi ?? collect();
            })->map(function($radOrder) {
                return [
                    'id' => $radOrder->id,
                    'registration_id' => $radOrder->registration_id,
                    'exam_name' => $radOrder->nama_pemeriksaan ?? $radOrder->exam_name ?? '',
                    'result' => $radOrder->hasil ?? $radOrder->result ?? '',
                    'ordered_date' => $radOrder->tanggal_pesanan?->format('Y-m-d H:i:s') ?? $radOrder->created_at->format('Y-m-d H:i:s'),
                    'doctor_name' => $radOrder->dokter?->name ?? 'Dokter Tidak Diketahui',
                    'status' => $radOrder->status_pesanan ?? 'menunggu'
                ];
            });

            return response()->json([
                'patient' => $patientData,
                'registrations' => $registrations,
                'prescriptions' => $prescriptions,
                'lab_orders' => $labOrders,
                'radiology_orders' => $radiologyOrders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve patient EMR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== CPPT (SOAP Documentation) ====================

    /**
     * Get CPPT entries for a patient
     */
    public function getCpptEntries(Request $request, $patientId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = CatatanCppt::with(['dokter', 'pembuat'])
                ->untukPasien($patientId)
                ->orderBy('tanggal_waktu', 'desc');

            $cpptEntries = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $cpptEntries
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve CPPT entries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new CPPT entry
     */
    public function createCpptEntry(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_pasien' => 'required|exists:patients,id',
            'id_dokter' => 'required|exists:m_dokter,id',
            'subjective' => 'nullable|string',
            'objective' => 'nullable|string',
            'assessment' => 'nullable|string',
            'plan' => 'nullable|string',
            'instruksi' => 'nullable|string',
            'evaluasi' => 'nullable|string',
            'jenis_profesi' => 'nullable|in:dokter,perawat,bidan,ahli_gizi,fisioterapis'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $cppt = CatatanCppt::create([
                'id_pasien' => $request->id_pasien,
                'id_dokter' => $request->id_dokter,
                'tanggal_waktu' => now(),
                'subjective' => $request->subjective,
                'objective' => $request->objective,
                'assessment' => $request->assessment,
                'plan' => $request->plan,
                'instruksi' => $request->instruksi,
                'evaluasi' => $request->evaluasi,
                'jenis_profesi' => $request->jenis_profesi ?? 'dokter',
                'created_by' => Auth::id(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'CPPT entry created successfully',
                'data' => $cppt->load(['dokter', 'pembuat'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== DIAGNOSIS MANAGEMENT ====================

    /**
     * Get ICD-10 diagnoses
     */
    public function getIcd10Diagnoses(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = Icd10Diagnosis::query();

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $diagnoses = $query->paginate(
                $request->get('per_page', 20),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $diagnoses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve diagnoses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== PRESCRIPTION MANAGEMENT ====================

    /**
     * Get prescriptions for a patient
     */
    public function getPrescriptions(Request $request, $patientId): JsonResponse
    {
        try {
            $query = ResepObat::with(['dokter', 'pembuat'])
                ->untukPasien($patientId)
                ->orderBy('tanggal_resep', 'desc');

            $prescriptions = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            return response()->json([
                'success' => true,
                'data' => $prescriptions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prescriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new prescription
     */
    public function createPrescription(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_pasien' => 'required|exists:patients,id',
            'id_dokter' => 'required|exists:m_dokter,id',
            'diagnosa' => 'required|string|max:500',
            'catatan' => 'nullable|string|max:1000',
            'obat' => 'required|array|min:1',
            'obat.*.id_obat' => 'required|exists:m_obat,id',
            'obat.*.dosis' => 'required|string|max:100',
            'obat.*.frekuensi' => 'required|string|max:100',
            'obat.*.durasi' => 'required|string|max:50',
            'obat.*.instruksi' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $prescription = ResepObat::create([
                'id_pasien' => $request->id_pasien,
                'id_dokter' => $request->id_dokter,
                'tanggal_resep' => now(),
                'diagnosa' => $request->diagnosa,
                'status' => 'aktif',
                'catatan' => $request->catatan,
                'created_by' => Auth::id(),
            ]);

            // Here you would typically create prescription details
            // For now, we'll just return the prescription

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Prescription created successfully',
                'data' => $prescription->load(['dokter', 'pembuat'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== LAB ORDERS ====================

    /**
     * Get lab orders for a patient
     */
    public function getLabOrders(Request $request, $patientId): JsonResponse
    {
        try {
            // Get patient info from m_pasien table
            $patient = \App\Models\Indonesian\Pasien::findOrFail($patientId);

            $query = PesananLab::with(['dokter', 'pembuat', 'laboratorium'])
                ->where('id_pasien', $patientId)
                ->orderBy('tanggal_pesanan', 'desc');

            $labOrders = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            // Transform data to match frontend expectations
            $transformedOrders = $labOrders->getCollection()->map(function($order) use ($patient) {
                return [
                    'id' => $order->id,
                    'registration_id' => null, // Not used with m_pasien
                    'test_name' => $order->laboratorium->nama_pemeriksaan ?? '',
                    'result' => $order->hasil ?? '',
                    'ordered_date' => $order->tanggal_pesanan?->format('Y-m-d H:i:s'),
                    'doctor_name' => $order->dokter?->name ?? 'Dokter Tidak Diketahui',
                    'status' => $order->status_pesanan,
                    'category' => $order->laboratorium->kategori ?? '',
                    'price' => $order->laboratorium->harga ?? 0,
                    'patient' => [
                        'id' => $patient->id,
                        'name' => $patient->nama_lengkap,
                        'mrn' => $patient->no_rm,
                        'insurance_type' => $this->mapInsuranceType($patient->jenis_asuransi)
                    ]
                ];
            });

            $labOrders->setCollection($transformedOrders);

            return response()->json([
                'success' => true,
                'data' => $labOrders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve lab orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create lab order with multiple tests
     */
    public function createLabOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:m_pasien,id',
            'test_ids' => 'required|array|min:1',
            'test_ids.*' => 'required|exists:m_laboratorium,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $patientId = $request->patient_id;
            $labOrders = [];
            $orderDate = now();

            // Create lab orders for each selected test
            foreach ($request->test_ids as $testId) {
                $labOrder = PesananLab::create([
                    'id_pasien' => $patientId,
                    'id_dokter' => Auth::id(),
                    'id_laboratorium' => $testId,
                    'tanggal_pesanan' => $orderDate,
                    'urgensi' => 'rutin', // Default urgency
                    'status_pesanan' => 'menunggu',
                    'diagnosa_klinis' => $request->notes ?? '',
                    'catatan' => $request->notes,
                    'created_by' => Auth::id(),
                ]);

                $labOrders[] = $labOrder;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lab orders created successfully',
                'data' => $labOrders
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== RADIOLOGY ORDERS ====================

    /**
     * Get radiology exams grouped by modality
     */
    public function getRadiologyExams(Request $request): JsonResponse
    {
        try {
            $query = \App\Models\MasterRadiologi::where('aktif', true);

            // Filter by modality if provided
            if ($request->has('modality') && !empty($request->modality)) {
                $modality = $request->modality;
                // Map frontend modality names to database categories
                $modalityMapping = [
                    'xray' => 'xray',
                    'ct' => 'ct',
                    'mri' => 'mri',
                    'usg' => 'ultrasound',
                    'mammography' => 'mammography'
                ];

                if (isset($modalityMapping[$modality])) {
                    $query->where('kategori', $modalityMapping[$modality]);
                }
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nama_pemeriksaan', 'like', "%{$search}%")
                      ->orWhere('deskripsi', 'like', "%{$search}%");
                });
            }

            $exams = $query->orderBy('kategori')->orderBy('nama_pemeriksaan')->get();

            // Group by modality for frontend
            $groupedExams = [];
            foreach ($exams as $exam) {
                $modality = $this->mapCategoryToModality($exam->kategori);
                if (!isset($groupedExams[$modality])) {
                    $groupedExams[$modality] = [
                        'modality' => $modality,
                        'modality_name' => $this->getModalityDisplayName($modality),
                        'exams' => []
                    ];
                }

                $groupedExams[$modality]['exams'][] = [
                    'id' => $exam->id,
                    'exam_name' => $exam->nama_pemeriksaan,
                    'description' => $exam->deskripsi,
                    'price' => $exam->tarif,
                    'category' => $exam->kategori
                ];
            }

            // Convert to array and sort by modality order
            $result = array_values($groupedExams);
            usort($result, function($a, $b) {
                $order = ['xray' => 1, 'ct' => 2, 'mri' => 3, 'usg' => 4, 'mammography' => 5];
                return ($order[$a['modality']] ?? 99) - ($order[$b['modality']] ?? 99);
            });

            return response()->json([
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve radiology exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get radiology orders for a patient
     */
    public function getRadiologyOrders(Request $request, $patientId): JsonResponse
    {
        try {
            $query = PesananRadiologi::with(['dokter', 'pembuat', 'radiologi'])
                ->where('id_pasien', $patientId)
                ->orderBy('tanggal_pesanan', 'desc');

            $radiologyOrders = $query->paginate(
                $request->get('per_page', 10),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            // Transform data to match frontend expectations
            $transformedOrders = $radiologyOrders->getCollection()->map(function($order) {
                return [
                    'id' => $order->id,
                    'registration_id' => $order->id_registrasi,
                    'exam_name' => $order->radiologi->nama_pemeriksaan ?? '',
                    'exam_id' => $order->id_radiologi,
                    'result' => $order->hasil ?? '',
                    'ordered_date' => $order->tanggal_pesanan?->format('Y-m-d H:i:s'),
                    'doctor_name' => $order->dokter?->name ?? 'Dokter Tidak Diketahui',
                    'status' => $order->status_pesanan,
                    'urgency' => $order->urgensi,
                    'clinical_indication' => $order->diagnosa_klinis,
                    'notes' => $order->catatan,
                    'modality' => $this->mapCategoryToModality($order->radiologi->kategori ?? ''),
                    'price' => $order->radiologi->tarif ?? 0,
                    'is_urgent' => $order->urgensi === 'cito',
                ];
            });

            $radiologyOrders->setCollection($transformedOrders);

            return response()->json([
                'success' => true,
                'data' => $radiologyOrders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve radiology orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create radiology order with multiple exams
     */
    public function createRadiologyOrder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'registration_id' => 'required|exists:t_registrasi,id',
            'exam_ids' => 'required|array|min:1',
            'exam_ids.*' => 'required|exists:m_radiologi,id',
            'clinical_indication' => 'required|string|max:500',
            'is_urgent' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get registration to get patient and doctor info
            $registration = \App\Models\Registration::with(['patient', 'doctor'])->findOrFail($request->registration_id);

            $radiologyOrders = [];
            $orderDate = now();
            $urgency = $request->is_urgent ? 'cito' : 'rutin';

            // Create radiology orders for each selected exam
            foreach ($request->exam_ids as $examId) {
                $radiologyOrder = PesananRadiologi::create([
                    'id_pasien' => $registration->patient_id,
                    'id_dokter' => $registration->doctor_id,
                    'id_radiologi' => $examId,
                    'id_registrasi' => $request->registration_id,
                    'tanggal_pesanan' => $orderDate,
                    'urgensi' => $urgency,
                    'status_pesanan' => 'menunggu',
                    'diagnosa_klinis' => $request->clinical_indication,
                    'catatan' => $request->notes,
                    'created_by' => Auth::id(),
                ]);

                $radiologyOrders[] = $radiologyOrder;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Radiology orders created successfully',
                'data' => $radiologyOrders
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create radiology orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export patient EMR as PDF
     */
    public function exportPatientEmr($patientId)
    {
        try {
            // Get EMR data first
            $emrData = $this->getPatientEmr($patientId);

            if ($emrData->getStatusCode() !== 200) {
                return $emrData; // Return error response
            }

            $data = json_decode($emrData->getContent(), true);

            // Generate PDF using a library like tcpdf, dompdf, or wkhtmltopdf
            // For now, return JSON with note that PDF generation will be implemented

            // In a real implementation, you would:
            // 1. Use a PDF library (e.g., Barryvdh\DomPDF)
            // 2. Create HTML template with EMR data
            // 3. Generate and return PDF file

            return response()->json([
                'message' => 'PDF export functionality will be implemented with a PDF library (e.g., DomPDF)',
                'data' => $data,
                'export_ready' => false
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export EMR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Get latest vital signs for a patient
     */
    private function getLatestVitalSigns($patientId)
    {
        // This would typically come from a vital signs table
        // For now, return mock data
        return [
            'blood_pressure' => '120/80 mmHg',
            'heart_rate' => '72 bpm',
            'temperature' => '36.5°C',
            'respiratory_rate' => '16/min',
            'oxygen_saturation' => '98%',
            'recorded_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get current medications for a patient
     */
    private function getCurrentMedications($patientId)
    {
        return ResepObat::with(['dokter'])
            ->untukPasien($patientId)
            ->aktif()
            ->orderBy('tanggal_resep', 'desc')
            ->get();
    }

    /**
     * Map insurance type from m_pasien to frontend format
     */
    private function mapInsuranceType($jenisAsuransi)
    {
        $mapping = [
            'BPJS' => 'bpjs',
            'Asuransi Swasta' => 'cash',
            'Perusahaan' => 'cash',
            'Umum' => 'cash'
        ];

        return $mapping[$jenisAsuransi] ?? 'cash';
    }

    /**
     * Map database category to frontend modality
     */
    private function mapCategoryToModality($category)
    {
        $mapping = [
            'xray' => 'xray',
            'ct' => 'ct',
            'mri' => 'mri',
            'ultrasound' => 'usg',
            'mammography' => 'mammography',
            'dental' => 'dental'
        ];

        return $mapping[$category] ?? $category;
    }

    /**
     * Get display name for modality
     */
    private function getModalityDisplayName($modality)
    {
        $names = [
            'xray' => 'X-Ray',
            'ct' => 'CT Scan',
            'mri' => 'MRI',
            'usg' => 'USG',
            'mammography' => 'Mammography',
            'dental' => 'Dental X-Ray'
        ];

        return $names[$modality] ?? ucfirst($modality);
    }
}
