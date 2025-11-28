<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Indonesian\Pasien as Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PatientController extends Controller
{
    /**
     * Display a listing of patients with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'deceased'])],
            'registration_date_from' => 'nullable|date',
            'registration_date_to' => 'nullable|date',
            'with_latest_cppt' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Patient::query();

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('registration_date_from')) {
            $query->whereDate('created_at', '>=', $request->registration_date_from);
        }

        if ($request->has('registration_date_to')) {
            $query->whereDate('created_at', '<=', $request->registration_date_to);
        }

        // Order by creation date (newest first)
        $query->orderBy('created_at', 'desc');

        $patients = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        // If with_latest_cppt is true, add latest CPPT entry for each patient
        if ($request->boolean('with_latest_cppt')) {
            $patients->getCollection()->transform(function ($patient) {
                // Get latest CPPT entry for this patient
                $latestCppt = DB::table('cppt_nursing_entries')
                    ->where('pasien_id', $patient->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($latestCppt) {
                    $patient->last_cppt = [
                        'id' => $latestCppt->id,
                        'date' => $latestCppt->tanggal_waktu ? date('Y-m-d', strtotime($latestCppt->tanggal_waktu)) : null,
                        'time' => $latestCppt->tanggal_waktu ? date('H:i', strtotime($latestCppt->tanggal_waktu)) : null,
                        'nurse_id' => $latestCppt->user_id,
                        'shift' => $latestCppt->shift,
                        'assessment' => json_decode($latestCppt->assessment, true) ?? [],
                        'diagnosis' => json_decode($latestCppt->diagnosis, true) ?? [],
                        'planning' => json_decode($latestCppt->planning, true) ?? [],
                        'intervention' => json_decode($latestCppt->intervention, true) ?? [],
                        'evaluation' => json_decode($latestCppt->evaluation, true) ?? [],
                        'status' => $latestCppt->status,
                    ];
                }

                return $patient;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

    /**
     * Store a newly created patient.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|size:16|unique:patients,nik',
            'birth_date' => 'required|date|before:today',
            'gender' => ['required', Rule::in(['L', 'P'])],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:20',
            'bpjs_number' => 'nullable|string|max:20|unique:patients,bpjs_number',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'deceased'])]
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

            $patient = Patient::create([
                'mrn' => Patient::generateMRN(),
                'name' => $request->name,
                'nik' => $request->nik,
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'phone' => $request->phone,
                'address' => $request->address,
                'emergency_contact' => $request->emergency_contact,
                'bpjs_number' => $request->bpjs_number,
                'status' => $request->status ?? 'active'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Patient created successfully',
                'data' => $patient
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Display the specified patient.
     */
    public function show(Patient $patient): JsonResponse
    {
        // Load relationships
        $patient->load([
            'registrations' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'registrations.doctor:id,name',
            'registrations.creator:id,name'
        ]);

        return response()->json([
            'success' => true,
            'data' => $patient
        ]);
    }

    /**
     * Update the specified patient.
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'nik' => ['sometimes', 'nullable', 'string', 'size:16', Rule::unique('patients')->ignore($patient->id)],
            'birth_date' => 'sometimes|required|date|before:today',
            'gender' => ['sometimes', 'required', Rule::in(['L', 'P'])],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:20',
            'bpjs_number' => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('patients')->ignore($patient->id)],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'deceased'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $patient->update($request->only([
                'name', 'nik', 'birth_date', 'gender', 'phone',
                'address', 'emergency_contact', 'bpjs_number', 'status'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Patient updated successfully',
                'data' => $patient
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified patient.
     */
    public function destroy(Patient $patient): JsonResponse
    {
        // Check if patient has active registrations
        if ($patient->registrations()->whereIn('status', ['registered', 'checked-in'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete patient with active registrations'
            ], 422);
        }

        try {
            $patient->delete();

            return response()->json([
                'success' => true,
                'message' => 'Patient deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search patients for registration.
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $searchTerm = $request->q;

            $patients = Patient::where(function ($query) use ($searchTerm) {
                $query->where('nama_lengkap', 'LIKE', "%{$searchTerm}%")
                       ->orWhere('no_rm', 'LIKE', "%{$searchTerm}%")
                       ->orWhere('nik', 'LIKE', "%{$searchTerm}%")
                       ->orWhere('no_bpjs', 'LIKE', "%{$searchTerm}%");
            })
            ->where('status_aktif', 1)
            ->limit(10)
            ->get(['id', 'nama_lengkap', 'no_rm', 'nik', 'no_bpjs', 'tanggal_lahir', 'jenis_kelamin', 'telepon', 'jenis_asuransi']);

            return response()->json([
                'success' => true,
                'data' => $patients
            ]);

        } catch (\Exception $e) {
            \Log::error('Patient search error', [
                'query' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find patient by NIK.
     */
    public function findByNik(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $patient = Patient::where('nik', $request->nik)
                         ->where('status', 'active')
                         ->first();

        if ($patient) {
            return response()->json([
                'success' => true,
                'message' => 'Patient found',
                'data' => $patient
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found with this NIK'
            ], 404);
        }
    }

    /**
     * Get patient statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_patients' => Patient::count(),
            'active_patients' => Patient::where('status', 'active')->count(),
            'inactive_patients' => Patient::where('status', 'inactive')->count(),
            'deceased_patients' => Patient::where('status', 'deceased')->count(),
            'new_this_month' => Patient::whereMonth('created_at', date('m'))
                                      ->whereYear('created_at', date('Y'))
                                      ->count(),
            'male_patients' => Patient::where('gender', 'L')->count(),
            'female_patients' => Patient::where('gender', 'P')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get patient visit history for EMR.
     */
    public function getVisitHistory(Patient $patient): JsonResponse
    {
        $visits = $patient->registrations()
            ->with(['doctor:id,name', 'poli:id,nama_poli'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($registration) {
                return [
                    'id' => $registration->id,
                    'tanggal' => $registration->created_at->format('Y-m-d'),
                    'poli' => $registration->poli?->nama_poli ?? 'Umum',
                    'dokter' => $registration->doctor?->name ?? 'Dokter',
                    'diagnosa' => $registration->diagnosa ?? 'Belum ada diagnosa',
                    'status' => $this->mapRegistrationStatus($registration->status),
                    'cppt' => [] // TODO: Add CPPT entries when available
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $visits
        ]);
    }

    /**
     * Get patient documents.
     */
    public function getDocuments(Patient $patient): JsonResponse
    {
        // TODO: Implement document model and storage
        $documents = [
            // Mock data - replace with actual document model
        ];

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Update patient biodata (limited fields for pendaftaran role).
     */
    public function updateBiodata(Request $request, Patient $patient): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'alamat' => 'sometimes|nullable|string|max:500',
            'telepon' => 'sometimes|nullable|string|max:20',
            'alergi' => 'sometimes|nullable|string|max:255',
            'penyakit_kronis' => 'sometimes|nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $patient->update($request->only([
                'alamat', 'telepon', 'alergi', 'penyakit_kronis'
            ]));

            // Log audit
            \App\Models\AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'update',
                'model_type' => 'Patient',
                'model_id' => $patient->id,
                'old_values' => [],
                'new_values' => $request->only(['alamat', 'telepon', 'alergi', 'penyakit_kronis']),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Biodata pasien berhasil diperbarui',
                'data' => $patient
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui biodata pasien',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload patient document.
     */
    public function uploadDocument(Request $request, Patient $patient): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'type' => 'required|string|in:KTP,BPJS,Lainnya',
            'name' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $filename = time() . '_' . $patient->id . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('patient-documents', $filename, 'public');

            // TODO: Create document record in database
            // Document::create([
            //     'patient_id' => $patient->id,
            //     'name' => $request->name,
            //     'filename' => $filename,
            //     'path' => $path,
            //     'type' => $request->type,
            //     'uploaded_by' => auth()->id(),
            // ]);

            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil diupload',
                'data' => [
                    'name' => $request->name,
                    'type' => $request->type,
                    'path' => $path,
                    'uploaded_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal upload dokumen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all patients with pagination and filters for EMR page.
     */
    public function listAllPatients(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'search' => 'nullable|string|max:255',
            'insurance_status' => 'nullable|string|in:BPJS,Umum,Swasta',
            'status' => 'nullable|string|in:active,inactive',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Patient::query();

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'LIKE', "%{$search}%")
                  ->orWhere('no_rm', 'LIKE', "%{$search}%")
                  ->orWhere('nik', 'LIKE', "%{$search}%")
                  ->orWhere('no_bpjs', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('insurance_status')) {
            $query->where('jenis_asuransi', $request->insurance_status);
        }

        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('status_aktif', 1);
            } else {
                $query->where('status_aktif', 0);
            }
        }

        if ($request->has('created_from')) {
            $query->whereDate('created_at', '>=', $request->created_from);
        }

        if ($request->has('created_to')) {
            $query->whereDate('created_at', '<=', $request->created_to);
        }

        // Order by latest first for recent patients
        $query->orderBy('created_at', 'desc');

        $patients = $query->paginate(
            $request->get('per_page', 20),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        // Transform to match frontend Patient interface
        $transformedPatients = $patients->through(function ($patient) {
            return [
                'id' => $patient->id,
                'mrn' => $patient->no_rm,
                'name' => $patient->nama_lengkap,
                'nik' => $patient->nik,
                'birth_date' => $patient->tanggal_lahir,
                'gender' => $patient->jenis_kelamin,
                'phone' => $patient->telepon,
                'address' => $patient->alamat,
                'insurance_status' => $patient->jenis_asuransi,
                'bpjs_number' => $patient->no_bpjs,
                'status' => $patient->status_aktif ? 'active' : 'inactive',
                'created_at' => $patient->created_at,
                'updated_at' => $patient->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedPatients
        ]);
    }

    /**
     * Get EMR read-only data for nursing staff
     */
    public function getEmrReadonly(Patient $patient): JsonResponse
    {
        try {
            // Get patient basic info
            $patientData = [
                'id' => $patient->id,
                'mrn' => $patient->no_rm,
                'name' => $patient->nama_lengkap,
                'nik' => $patient->nik,
                'birth_date' => $patient->tanggal_lahir,
                'gender' => $patient->jenis_kelamin,
                'phone' => $patient->telepon,
                'address' => $patient->alamat,
                'insurance_status' => $patient->jenis_asuransi,
                'bpjs_number' => $patient->no_bpjs,
                'allergies' => $patient->alergi,
                'chronic_diseases' => $patient->penyakit_kronis,
                'status' => $patient->status_aktif ? 'active' : 'inactive',
            ];

            // Get registrations with related data
            $registrations = $patient->registrations()
                ->with(['doctor:id,name', 'poli:id,nama_poli'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($registration) {
                    return [
                        'id' => $registration->id,
                        'registration_date' => $registration->created_at->format('Y-m-d'),
                        'complaint' => $registration->keluhan,
                        'doctor' => $registration->doctor?->name ?? 'Dokter',
                        'poli' => $registration->poli?->nama_poli ?? 'Umum',
                        'status' => $this->mapRegistrationStatus($registration->status),
                    ];
                });

            // Get examinations (t_pemeriksaan)
            $examinations = \DB::table('t_pemeriksaan')
                ->where('patient_id', $patient->id)
                ->orderBy('tanggal_pemeriksaan', 'desc')
                ->get()
                ->map(function ($exam) {
                    return [
                        'id' => $exam->id,
                        'registration_id' => $exam->registration_id,
                        'doctor_id' => $exam->doctor_id,
                        'diagnosis' => $exam->diagnosa,
                        'therapy' => $exam->terapi,
                        'anamnesis' => $exam->anamnesis,
                        'physical_exam' => $exam->pemeriksaan_fisik,
                        'vital_signs' => [
                            'weight' => $exam->berat_badan,
                            'height' => $exam->tinggi_badan,
                            'blood_pressure_systolic' => $exam->tekanan_darah_sistolik,
                            'blood_pressure_diastolic' => $exam->tekanan_darah_diastolik,
                            'temperature' => $exam->suhu_badan,
                            'pulse' => $exam->denyut_nadi,
                        ],
                        'created_at' => $exam->tanggal_pemeriksaan,
                    ];
                });

            // Get CPPT entries
            $cpptEntries = \DB::table('cppt_entries')
                ->where('patient_id', $patient->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($cppt) {
                    return [
                        'id' => $cppt->id,
                        'registration_id' => $cppt->registration_id,
                        'entry_type' => $cppt->entry_type,
                        'subjective' => $cppt->subjective,
                        'objective' => $cppt->objective,
                        'assessment' => $cppt->assessment,
                        'plan' => $cppt->plan,
                        'created_by' => $cppt->created_by,
                        'created_at' => $cppt->created_at,
                    ];
                });

            // Get prescriptions
            $prescriptions = \DB::table('prescriptions')
                ->join('prescription_items', 'prescriptions.id', '=', 'prescription_items.prescription_id')
                ->where('prescriptions.patient_id', $patient->id)
                ->select([
                    'prescriptions.id',
                    'prescriptions.registration_id',
                    'prescription_items.medicine_name',
                    'prescription_items.dosage',
                    'prescription_items.frequency',
                    'prescriptions.created_at'
                ])
                ->orderBy('prescriptions.created_at', 'desc')
                ->get()
                ->groupBy('id')
                ->map(function ($group) {
                    $first = $group->first();
                    return [
                        'id' => $first->id,
                        'registration_id' => $first->registration_id,
                        'items' => $group->map(function ($item) {
                            return [
                                'medicine_name' => $item->medicine_name,
                                'dosage' => $item->dosage,
                                'frequency' => $item->frequency,
                            ];
                        })->toArray(),
                        'created_at' => $first->created_at,
                    ];
                })->values();

            // Get lab orders
            $labOrders = \DB::table('t_pesanan_lab')
                ->where('patient_id', $patient->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($lab) {
                    return [
                        'id' => $lab->id,
                        'registration_id' => $lab->registration_id,
                        'test_name' => $lab->nama_pemeriksaan,
                        'result' => $lab->hasil,
                        'status' => $lab->status,
                        'created_at' => $lab->created_at,
                    ];
                });

            // Get radiology orders
            $radiologyOrders = \DB::table('t_pesanan_radiologi')
                ->where('patient_id', $patient->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($rad) {
                    return [
                        'id' => $rad->id,
                        'registration_id' => $rad->registration_id,
                        'exam_name' => $rad->nama_pemeriksaan,
                        'result_url' => $rad->hasil_url,
                        'status' => $rad->status,
                        'created_at' => $rad->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'patient' => $patientData,
                    'registrations' => $registrations,
                    't_pemeriksaan' => $examinations,
                    'cppt_entries' => $cpptEntries,
                    'prescriptions' => $prescriptions,
                    'lab_orders' => $labOrders,
                    'radiology_orders' => $radiologyOrders,
                ],
                'message' => 'EMR data retrieved successfully for nursing staff'
            ]);

        } catch (\Exception $e) {
            \Log::error('EMR read-only error', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve EMR data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate MR Number for new patient.
     */
    public function generateMrNumber(): JsonResponse
    {
        try {
            $mrNumber = Patient::generateMRN();

            return response()->json([
                'success' => true,
                'data' => [
                    'mr_number' => $mrNumber
                ],
                'message' => 'MR Number generated successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Generate MR Number error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate MR Number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Map registration status to EMR status.
     */
    private function mapRegistrationStatus(string $status): string
    {
        $statusMap = [
            'registered' => 'Dalam Antrian',
            'checked-in' => 'Check-in',
            'in-consultation' => 'Dalam Konsultasi',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'no-show' => 'Tidak Hadir'
        ];

        return $statusMap[$status] ?? $status;
    }
}
