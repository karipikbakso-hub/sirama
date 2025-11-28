<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Medicine;
use App\Models\Registration;
use App\Models\Indonesian\Pasien;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PrescriptionController extends Controller
{
    /**
     * Store a newly created prescription.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'registration_id' => 'required|exists:registrations,id',
            'notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:m_obat,id',
            'items.*.dosage' => 'required|string|max:100',
            'items.*.frequency' => 'required|string|max:100',
            'items.*.duration' => 'required|string|max:50',
            'items.*.instruction' => 'nullable|string|max:255',
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

            // Get registration to validate doctor access
            $registration = Registration::with(['patient', 'pasien'])->findOrFail($request->registration_id);

            // Check if doctor has access to this registration
            if ($registration->doctor_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this registration'
                ], 403);
            }

            // Get patient data from m_pasien table
            $patient = $registration->pasien ?? Pasien::find($registration->patient_id);

            // Check for drug interactions and allergies
            $warnings = $this->checkDrugInteractions($request->items, $patient);

            $prescription = Prescription::create([
                'registration_id' => $request->registration_id,
                'doctor_id' => auth()->id(),
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Create prescription items
            foreach ($request->items as $itemData) {
                $medicine = Medicine::find($itemData['medicine_id']);

                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'medicine_id' => $itemData['medicine_id'],
                    'medicine_name' => $medicine->nama_obat,
                    'dosage' => $itemData['dosage'],
                    'frequency' => $itemData['frequency'],
                    'duration' => $itemData['duration'],
                    'instruction' => $itemData['instruction'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Prescription created successfully',
                'data' => $prescription->load(['items', 'doctor', 'registration.pasien']),
                'warnings' => $warnings
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

    /**
     * Show a specific prescription with items.
     */
    public function show(Prescription $prescription): JsonResponse
    {
        try {
            $data = $prescription->load(['items.medicine', 'doctor', 'registration.patient']);

            // Get patient data from m_pasien table
            $patient = $prescription->registration->patient ?? Pasien::find($prescription->registration->patient_id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $prescription->id,
                    'status' => $prescription->status,
                    'is_urgent' => $prescription->is_urgent,
                    'total_price' => $prescription->total_price,
                    'notes' => $prescription->notes,
                    'created_at' => $prescription->created_at,
                    'patient' => [
                        'id' => $patient->id,
                        'full_name' => $patient->nama_lengkap,
                        'medical_record_number' => $patient->no_rm,
                        'insurance_type' => $patient->jenis_asuransi ?? 'cash'
                    ],
                    'doctor' => [
                        'id' => $data->doctor->id,
                        'full_name' => $data->doctor->name
                    ],
                    'items' => $data->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'medicine_id' => $item->medicine_id,
                            'medicine_name' => $item->medicine_name,
                            'dosage' => $item->dosage,
                            'frequency' => $item->frequency,
                            'duration' => $item->duration,
                            'instruction' => $item->instruction,
                            'stock_available' => $item->medicine ? $item->medicine->stock : 0
                        ];
                    })
                ],
                'meta' => [
                    'timestamp' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prescriptions for a patient (legacy method).
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:m_pasien,id',
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
            $query = Prescription::with(['items', 'doctor', 'registration.pasien'])
                ->whereHas('registration', function ($q) use ($request) {
                    $q->where('patient_id', $request->patient_id);
                })
                ->orderBy('created_at', 'desc');

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
     * Get prescription history with extensive filters for audit trail.
     */
    public function getHistory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,validated,dispensed,completed,rejected',
            'insurance_type' => 'nullable|in:cash,bpjs,insurance',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'pharmacist_id' => 'nullable|exists:users,id',
            'doctor_id' => 'nullable|exists:users,id',
            'sort_by' => 'nullable|in:created_at,validated_at,dispensed_at,completed_at,patient_name,doctor_name,status',
            'sort_order' => 'nullable|in:asc,desc',
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
            $query = DB::table('prescriptions')
                ->join('t_registrasi', 'prescriptions.registration_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users as doctors', 'prescriptions.doctor_id', '=', 'doctors.id')
                ->leftJoin('users as pharmacists', 'prescriptions.pharmacist_id', '=', 'pharmacists.id')
                ->leftJoin('users as dispensers', 'prescriptions.dispensed_by', '=', 'dispensers.id')
                ->select([
                    'prescriptions.id',
                    'prescriptions.status',
                    'prescriptions.created_at',
                    'prescriptions.validated_at',
                    'prescriptions.dispensed_at',
                    'prescriptions.completed_at',
                    'prescriptions.total_price',
                    'prescriptions.payment_method',
                    'prescriptions.notes',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.jenis_asuransi as patient_insurance_type',
                    'doctors.name as doctor_name',
                    'pharmacists.name as pharmacist_name',
                    'dispensers.name as dispenser_name',
                    DB::raw('COUNT(prescription_items.id) as total_items')
                ])
                ->leftJoin('prescription_items', 'prescriptions.id', '=', 'prescription_items.prescription_id')
                ->groupBy([
                    'prescriptions.id',
                    'prescriptions.status',
                    'prescriptions.created_at',
                    'prescriptions.validated_at',
                    'prescriptions.dispensed_at',
                    'prescriptions.completed_at',
                    'prescriptions.total_price',
                    'prescriptions.payment_method',
                    'prescriptions.notes',
                    'm_pasien.nama_lengkap',
                    'm_pasien.no_rm',
                    'm_pasien.jenis_asuransi',
                    'doctors.name',
                    'pharmacists.name',
                    'dispensers.name'
                ]);

            // Search filter
            if ($request->search) {
                $search = strtolower($request->search);
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(m_pasien.nama_lengkap) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(m_pasien.no_rm) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(doctors.name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(pharmacists.name) LIKE ?', ["%{$search}%"]);
                });
            }

            // Status filter
            if ($request->status) {
                $query->where('prescriptions.status', $request->status);
            }

            // Insurance type filter
            if ($request->insurance_type) {
                $query->where('m_pasien.jenis_asuransi', $request->insurance_type);
            }

            // Date range filter
            if ($request->date_from) {
                $query->whereDate('prescriptions.created_at', '>=', $request->date_from);
            }
            if ($request->date_to) {
                $query->whereDate('prescriptions.created_at', '<=', $request->date_to);
            }

            // Pharmacist filter
            if ($request->pharmacist_id) {
                $query->where('prescriptions.pharmacist_id', $request->pharmacist_id);
            }

            // Doctor filter
            if ($request->doctor_id) {
                $query->where('prescriptions.doctor_id', $request->doctor_id);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'validated_at':
                    $query->orderBy('prescriptions.validated_at', $sortOrder);
                    break;
                case 'dispensed_at':
                    $query->orderBy('prescriptions.dispensed_at', $sortOrder);
                    break;
                case 'completed_at':
                    $query->orderBy('prescriptions.completed_at', $sortOrder);
                    break;
                case 'patient_name':
                    $query->orderBy('m_pasien.nama_lengkap', $sortOrder);
                    break;
                case 'doctor_name':
                    $query->orderBy('doctors.name', $sortOrder);
                    break;
                case 'status':
                    $query->orderBy('prescriptions.status', $sortOrder);
                    break;
                default:
                    $query->orderBy('prescriptions.created_at', $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 50);
            $page = $request->get('page', 1);

            $prescriptions = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $prescriptions->items(),
                'current_page' => $prescriptions->currentPage(),
                'per_page' => $prescriptions->perPage(),
                'total' => $prescriptions->total(),
                'last_page' => $prescriptions->lastPage(),
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'filters' => [
                        'search' => $request->search,
                        'status' => $request->status,
                        'insurance_type' => $request->insurance_type,
                        'date_from' => $request->date_from,
                        'date_to' => $request->date_to,
                        'sort_by' => $sortBy,
                        'sort_order' => $sortOrder
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prescription history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all prescriptions for pharmacist (apoteker) with search/filter.
     */
    public function listForApoteker(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,validated,dispensed,completed',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|in:created_at,patient_name,status',
            'sort_order' => 'nullable|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = DB::table('prescriptions')
                ->join('t_registrasi', 'prescriptions.registration_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->join('users', 'prescriptions.doctor_id', '=', 'users.id')
                ->select([
                    'prescriptions.id',
                    'prescriptions.status',
                    DB::raw('0 as is_urgent'), // Default false for now
                    DB::raw('0 as total_price'), // Default 0 for now
                    'prescriptions.created_at',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.jenis_asuransi as patient_insurance_type',
                    'users.name as doctor_name',
                ]);

            // Search filter
            if ($request->search) {
                $search = strtolower($request->search);
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(m_pasien.nama_lengkap) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(m_pasien.no_rm) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(users.name) LIKE ?', ["%{$search}%"]);
                });
            }

            // Status filter
            if ($request->status) {
                $query->where('prescriptions.status', $request->status);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            if ($sortBy === 'patient_name') {
                $query->orderBy('m_pasien.nama_lengkap', $sortOrder);
            } elseif ($sortBy === 'status') {
                $query->orderBy('prescriptions.status', $sortOrder);
            } else {
                $query->orderBy('prescriptions.created_at', $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $page = $request->get('page', 1);

            $prescriptions = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform data to match frontend expectations
            $transformedData = $prescriptions->items();
            $transformedPrescriptions = array_map(function ($prescription) {
                return [
                    'id' => $prescription->id,
                    'prescription_number' => 'RX-' . str_pad($prescription->id, 6, '0', STR_PAD_LEFT),
                    'status' => $prescription->status,
                    'created_at' => $prescription->created_at,
                    'patient' => [
                        'id' => $prescription->patient_id,
                        'nama_pasien' => $prescription->patient_name,
                        'no_rm' => $prescription->medical_record_number,
                    ],
                    'items' => [] // Will be populated if needed
                ];
            }, $transformedData);

            return response()->json([
                'success' => true,
                'data' => $transformedPrescriptions,
                'current_page' => $prescriptions->currentPage(),
                'per_page' => $prescriptions->perPage(),
                'total' => $prescriptions->total(),
                'last_page' => $prescriptions->lastPage(),
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'pagination' => [
                        'current_page' => $prescriptions->currentPage(),
                        'per_page' => $prescriptions->perPage(),
                        'total' => $prescriptions->total(),
                        'last_page' => $prescriptions->lastPage(),
                    ]
                ]
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
     * Get prescription items (obat-obat dalam resep).
     */
    public function items($id): JsonResponse
    {
        $validator = Validator::make(['id' => $id], [
            'id' => 'required|exists:prescriptions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $items = DB::table('prescription_items')
                ->leftJoin('m_obat', 'prescription_items.medicine_id', '=', 'm_obat.id')
                ->leftJoin('medicine_batches', function($join) {
                    $join->on('prescription_items.medicine_id', '=', 'medicine_batches.medicine_id')
                         ->whereRaw('medicine_batches.expired_date > NOW()')
                         ->where('medicine_batches.stock', '>', 0);
                })
                ->where('prescription_items.prescription_id', $id)
                ->select([
                    'prescription_items.id',
                    'prescription_items.medicine_id',
                    'prescription_items.medicine_name',
                    'prescription_items.dosage',
                    'prescription_items.frequency',
                    'prescription_items.duration',
                    'prescription_items.instruction',
                    DB::raw('COALESCE(SUM(medicine_batches.stock), 0) as stock_available'),
                ])
                ->groupBy([
                    'prescription_items.id',
                    'prescription_items.medicine_id',
                    'prescription_items.medicine_name',
                    'prescription_items.dosage',
                    'prescription_items.frequency',
                    'prescription_items.duration',
                    'prescription_items.instruction',
                ])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $items,
                'meta' => [
                    'timestamp' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prescription items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Print prescription as PDF.
     */
    public function print(Prescription $prescription): JsonResponse
    {
        try {
            // Check if doctor has access to this prescription
            if ($prescription->doctor_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this prescription'
                ], 403);
            }

            $data = $prescription->load(['items', 'doctor', 'registration.pasien']);

            // Get patient data from m_pasien table
            $patient = $data->registration->pasien ?? Pasien::find($data->registration->patient_id);

            // Format data for printing
            $printData = [
                'prescription_id' => $prescription->id,
                'created_at' => $prescription->created_at->format('d/m/Y H:i'),
                'status' => $prescription->status,
                'doctor' => [
                    'name' => $data->doctor->name,
                    'nip' => $data->doctor->nip ?? '',
                ],
                'patient' => [
                    'name' => $patient->nama_lengkap,
                    'mrn' => $patient->no_rm,
                    'date_of_birth' => $patient->tanggal_lahir?->format('d/m/Y'),
                    'gender' => $patient->jenis_kelamin,
                ],
                'notes' => $prescription->notes,
                'items' => $data->items->map(function ($item) {
                    return [
                        'medicine_name' => $item->medicine_name,
                        'dosage' => $item->dosage,
                        'frequency' => $item->frequency,
                        'duration' => $item->duration,
                        'instruction' => $item->instruction,
                    ];
                }),
            ];

            // TODO: Generate PDF using a library like DomPDF
            // For now, return JSON data that frontend can use to generate PDF

            return response()->json([
                'success' => true,
                'message' => 'Prescription data ready for printing',
                'data' => $printData,
                'pdf_ready' => false // Set to true when PDF generation is implemented
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to prepare prescription for printing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending prescriptions for validation by pharmacist.
     */
    public function pending(Request $request): JsonResponse
    {
        try {
            $query = Prescription::with(['items', 'doctor', 'registration.pasien'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'asc');

            $prescriptions = $query->paginate(
                $request->get('per_page', 20),
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
                'message' => 'Failed to retrieve pending prescriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prescription detail with patient and doctor info.
     */
    public function detail(Prescription $prescription): JsonResponse
    {
        try {
            $data = $prescription->load(['items.medicine', 'doctor', 'registration.pasien']);

            // Get patient data from m_pasien table
            $patient = $prescription->registration->pasien ?? Pasien::find($prescription->registration->patient_id);

            // Check for drug interactions and allergies
            $warnings = $this->checkDrugInteractions(
                $data->items->map(function ($item) {
                    return [
                        'medicine_id' => $item->medicine_id,
                        'dosage' => $item->dosage,
                        'frequency' => $item->frequency,
                        'duration' => $item->duration
                    ];
                })->toArray(),
                $patient
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'prescription' => $data,
                    'patient' => $patient,
                    'doctor' => $data->doctor,
                    'warnings' => $warnings
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prescription detail',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate and approve prescription.
     */
    public function validate(Request $request, Prescription $prescription): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'verification_notes' => 'nullable|string|max:1000',
            'edited_items' => 'nullable|array',
            'edited_items.*.id' => 'required|exists:prescription_items,id',
            'edited_items.*.dosage' => 'required|string|max:100',
            'edited_items.*.frequency' => 'required|string|max:100',
            'edited_items.*.duration' => 'required|string|max:50',
            'edited_items.*.instruction' => 'nullable|string|max:255',
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

            // Check if prescription is still pending
            if ($prescription->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Prescription is not in pending status'
                ], 400);
            }

            // Update prescription status
            $prescription->update([
                'status' => 'validated',
                'pharmacist_id' => auth()->id(),
                'verification_notes' => $request->verification_notes,
                'validated_at' => now(),
            ]);

            // Update edited items if provided
            if ($request->edited_items) {
                foreach ($request->edited_items as $editedItem) {
                    PrescriptionItem::where('id', $editedItem['id'])
                        ->where('prescription_id', $prescription->id)
                        ->update([
                            'dosage' => $editedItem['dosage'],
                            'frequency' => $editedItem['frequency'],
                            'duration' => $editedItem['duration'],
                            'instruction' => $editedItem['instruction'] ?? null,
                        ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Prescription validated successfully',
                'data' => $prescription->load(['items', 'doctor', 'registration.pasien'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to validate prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject prescription with reason.
     */
    public function reject(Request $request, Prescription $prescription): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:1000',
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

            // Check if prescription is still pending
            if ($prescription->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Prescription is not in pending status'
                ], 400);
            }

            // Update prescription status
            $prescription->update([
                'status' => 'rejected',
                'pharmacist_id' => auth()->id(),
                'verification_notes' => $request->rejection_reason,
                'verified_at' => now(),
            ]);

            DB::commit();

            // TODO: Send notification to doctor

            return response()->json([
                'success' => true,
                'message' => 'Prescription rejected successfully',
                'data' => $prescription->load(['items', 'doctor', 'registration.pasien'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get verified prescriptions ready for dispensing.
     */
    public function verified(Request $request): JsonResponse
    {
        try {
            $query = Prescription::with(['items.medicine', 'doctor', 'registration.pasien'])
                ->where('status', 'validated')
                ->whereNull('dispensed_at')
                ->orderBy('validated_at', 'asc');

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
                'message' => 'Failed to retrieve verified prescriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dispense prescription to patient.
     */
    public function dispense(Request $request, Prescription $prescription): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.prescription_item_id' => 'required|exists:prescription_items,id',
            'items.*.medicine_id' => 'required|exists:m_obat,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.batch_number' => 'required|string|max:100',
            'items.*.expired_date' => 'required|date|after:today',
            'total_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,bpjs,insurance',
            'edukasi_notes' => 'nullable|string|max:1000',
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

            // Check if prescription is verified and not yet dispensed
            if ($prescription->status !== 'verified') {
                return response()->json([
                    'success' => false,
                    'message' => 'Prescription is not in verified status'
                ], 400);
            }

            if ($prescription->dispensed_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prescription already dispensed'
                ], 400);
            }

            // Validate stock and batch for each item
            foreach ($request->items as $dispenseItem) {
                $medicine = Medicine::find($dispenseItem['medicine_id']);
                if (!$medicine) {
                    throw new \Exception("Medicine not found: {$dispenseItem['medicine_id']}");
                }

                // Check if stock is sufficient
                if ($medicine->stock < $dispenseItem['quantity']) {
                    throw new \Exception("Insufficient stock for {$medicine->nama_obat}. Available: {$medicine->stock}");
                }

                // TODO: Validate batch number and expired date
                // This would require a medicine batch tracking system
            }

            // Create dispensing records
            foreach ($request->items as $dispenseItem) {
                ObatKeluar::create([
                    'prescription_id' => $prescription->id,
                    'prescription_item_id' => $dispenseItem['prescription_item_id'],
                    'medicine_id' => $dispenseItem['medicine_id'],
                    'quantity_given' => $dispenseItem['quantity'],
                    'batch_number' => $dispenseItem['batch_number'],
                    'expired_date' => $dispenseItem['expired_date'],
                    'dispensed_at' => now(),
                    'pharmacist_id' => auth()->id(),
                ]);

                // Update medicine stock
                $medicine = Medicine::find($dispenseItem['medicine_id']);
                $medicine->decrement('stock', $dispenseItem['quantity']);
            }

            // Update prescription status
            $prescription->update([
                'status' => 'dispensed',
                'dispensed_at' => now(),
                'dispensed_by' => auth()->id(),
                'total_price' => $request->total_price,
                'payment_method' => $request->payment_method,
                'edukasi_notes' => $request->edukasi_notes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Prescription dispensed successfully',
                'data' => $prescription->load(['items', 'doctor', 'registration.pasien'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to dispense prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Print prescription label.
     */
    public function printLabel(Prescription $prescription): JsonResponse
    {
        try {
            // Check if prescription is dispensed
            if ($prescription->status !== 'dispensed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Prescription must be dispensed first'
                ], 400);
            }

            $data = $prescription->load(['items.medicine', 'doctor', 'registration.pasien', 'obatKeluar']);

            // Get patient data
            $patient = $prescription->registration->pasien ?? Pasien::find($prescription->registration->patient_id);

            // Format label data
            $labelData = [
                'prescription_id' => $prescription->id,
                'dispensed_at' => $prescription->dispensed_at->format('d/m/Y H:i'),
                'patient' => [
                    'name' => $patient->nama_lengkap,
                    'mrn' => $patient->no_rm,
                ],
                'items' => $data->items->map(function ($item) use ($data) {
                    $obatKeluar = $data->obatKeluar->where('prescription_item_id', $item->id)->first();

                    return [
                        'medicine_name' => $item->medicine_name,
                        'dosage' => $item->dosage,
                        'frequency' => $item->frequency,
                        'duration' => $item->duration,
                        'instruction' => $item->instruction,
                        'quantity_given' => $obatKeluar ? $obatKeluar->quantity_given : 0,
                        'batch_number' => $obatKeluar ? $obatKeluar->batch_number : '',
                        'expired_date' => $obatKeluar ? $obatKeluar->expired_date->format('d/m/Y') : '',
                    ];
                }),
            ];

            // TODO: Generate PDF label
            // For now, return JSON data for frontend PDF generation

            return response()->json([
                'success' => true,
                'message' => 'Label data ready for printing',
                'data' => $labelData,
                'pdf_ready' => false
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to prepare prescription label',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Print prescription receipt.
     */
    public function printReceipt(Prescription $prescription): JsonResponse
    {
        try {
            // Check if prescription is dispensed
            if ($prescription->status !== 'dispensed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Prescription must be dispensed first'
                ], 400);
            }

            $data = $prescription->load(['items.medicine', 'doctor', 'registration.pasien', 'obatKeluar']);

            // Get patient data
            $patient = $prescription->registration->pasien ?? Pasien::find($prescription->registration->patient_id);

            // Format receipt data
            $receiptData = [
                'prescription_id' => $prescription->id,
                'dispensed_at' => $prescription->dispensed_at->format('d/m/Y H:i'),
                'payment_method' => $prescription->payment_method,
                'total_price' => $prescription->total_price,
                'doctor' => [
                    'name' => $data->doctor->name,
                    'nip' => $data->doctor->nip ?? '',
                ],
                'patient' => [
                    'name' => $patient->nama_lengkap,
                    'mrn' => $patient->no_rm,
                    'insurance_type' => $patient->jenis_asuransi ?? 'cash',
                ],
                'items' => $data->items->map(function ($item) {
                    return [
                        'medicine_name' => $item->medicine_name,
                        'dosage' => $item->dosage,
                        'quantity' => $item->quantity ?? 1,
                        'price' => $item->price ?? 0,
                        'subtotal' => $item->subtotal ?? 0,
                    ];
                }),
                'pharmacist' => [
                    'name' => auth()->user()->name,
                    'license_number' => auth()->user()->license_number ?? '',
                ],
            ];

            // TODO: Generate PDF receipt
            // For now, return JSON data for frontend PDF generation

            return response()->json([
                'success' => true,
                'message' => 'Receipt data ready for printing',
                'data' => $receiptData,
                'pdf_ready' => false
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to prepare prescription receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prescription history with extensive filters for audit trail.
     */
    public function history(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,validated,dispensed,completed,rejected',
            'insurance_type' => 'nullable|in:cash,bpjs,insurance',
            'pharmacist_id' => 'nullable|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'sort_by' => 'nullable|in:created_at,validated_at,dispensed_at,completed_at,patient_name,doctor_name,status',
            'sort_order' => 'nullable|in:asc,desc',
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
            $query = DB::table('prescriptions')
                ->join('t_registrasi', 'prescriptions.registration_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users as doctors', 'prescriptions.doctor_id', '=', 'doctors.id')
                ->leftJoin('users as pharmacists', 'prescriptions.pharmacist_id', '=', 'pharmacists.id')
                ->leftJoin('users as dispensers', 'prescriptions.dispensed_by', '=', 'dispensers.id')
                ->select([
                    'prescriptions.id',
                    'prescriptions.status',
                    'prescriptions.created_at',
                    'prescriptions.validated_at',
                    'prescriptions.dispensed_at',
                    'prescriptions.completed_at',
                    'prescriptions.total_price',
                    'prescriptions.payment_method',
                    'prescriptions.notes',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.jenis_asuransi as insurance_type',
                    'doctors.name as doctor_name',
                    'pharmacists.name as pharmacist_name',
                    'dispensers.name as dispenser_name',
                    DB::raw('COUNT(prescription_items.id) as total_items'),
                ])
                ->leftJoin('prescription_items', 'prescriptions.id', '=', 'prescription_items.prescription_id')
                ->groupBy([
                    'prescriptions.id',
                    'prescriptions.status',
                    'prescriptions.created_at',
                    'prescriptions.validated_at',
                    'prescriptions.dispensed_at',
                    'prescriptions.completed_at',
                    'prescriptions.total_price',
                    'prescriptions.payment_method',
                    'prescriptions.notes',
                    'm_pasien.nama_lengkap',
                    'm_pasien.no_rm',
                    'm_pasien.jenis_asuransi',
                    'doctors.name',
                    'pharmacists.name',
                    'dispensers.name',
                ]);

            // Search filter
            if ($request->search) {
                $search = strtolower($request->search);
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(m_pasien.nama_lengkap) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(m_pasien.no_rm) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(doctors.name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(pharmacists.name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(dispensers.name) LIKE ?', ["%{$search}%"]);
                });
            }

            // Status filter
            if ($request->status) {
                $query->where('prescriptions.status', $request->status);
            }

            // Insurance type filter
            if ($request->insurance_type) {
                $query->where('m_pasien.jenis_asuransi', $request->insurance_type);
            }

            // Pharmacist filter
            if ($request->pharmacist_id) {
                $query->where('prescriptions.pharmacist_id', $request->pharmacist_id);
            }

            // Date range filter (default last 30 days)
            $dateFrom = $request->date_from ?: now()->subDays(30)->format('Y-m-d');
            $dateTo = $request->date_to ?: now()->format('Y-m-d');

            $query->whereDate('prescriptions.created_at', '>=', $dateFrom)
                  ->whereDate('prescriptions.created_at', '<=', $dateTo);

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'patient_name':
                    $query->orderBy('m_pasien.nama_lengkap', $sortOrder);
                    break;
                case 'doctor_name':
                    $query->orderBy('doctors.name', $sortOrder);
                    break;
                case 'status':
                    $query->orderBy('prescriptions.status', $sortOrder);
                    break;
                case 'validated_at':
                    $query->orderBy('prescriptions.validated_at', $sortOrder);
                    break;
                case 'dispensed_at':
                    $query->orderBy('prescriptions.dispensed_at', $sortOrder);
                    break;
                case 'completed_at':
                    $query->orderBy('prescriptions.completed_at', $sortOrder);
                    break;
                default:
                    $query->orderBy('prescriptions.created_at', $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 50);
            $page = $request->get('page', 1);

            $prescriptions = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform data for frontend
            $transformedData = $prescriptions->items();
            $transformedPrescriptions = array_map(function ($prescription) {
                return [
                    'id' => $prescription->id,
                    'prescription_number' => 'RX-' . str_pad($prescription->id, 6, '0', STR_PAD_LEFT),
                    'status' => $prescription->status,
                    'created_at' => $prescription->created_at,
                    'validated_at' => $prescription->validated_at,
                    'dispensed_at' => $prescription->dispensed_at,
                    'completed_at' => $prescription->completed_at,
                    'total_price' => $prescription->total_price,
                    'payment_method' => $prescription->payment_method,
                    'notes' => $prescription->notes,
                    'patient' => [
                        'name' => $prescription->patient_name,
                        'medical_record_number' => $prescription->medical_record_number,
                        'insurance_type' => $prescription->insurance_type,
                    ],
                    'doctor' => [
                        'name' => $prescription->doctor_name,
                    ],
                    'pharmacist' => [
                        'name' => $prescription->pharmacist_name,
                    ],
                    'dispenser' => [
                        'name' => $prescription->dispenser_name,
                    ],
                    'total_items' => $prescription->total_items,
                ];
            }, $transformedData);

            return response()->json([
                'success' => true,
                'data' => $transformedPrescriptions,
                'current_page' => $prescriptions->currentPage(),
                'per_page' => $prescriptions->perPage(),
                'total' => $prescriptions->total(),
                'last_page' => $prescriptions->lastPage(),
                'from' => $prescriptions->firstItem(),
                'to' => $prescriptions->lastItem(),
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'filters' => [
                        'search' => $request->search,
                        'status' => $request->status,
                        'insurance_type' => $request->insurance_type,
                        'pharmacist_id' => $request->pharmacist_id,
                        'date_from' => $dateFrom,
                        'date_to' => $dateTo,
                        'sort_by' => $sortBy,
                        'sort_order' => $sortOrder,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve prescription history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export prescription history to Excel.
     */
    public function exportHistory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,validated,dispensed,completed,rejected',
            'insurance_type' => 'nullable|in:cash,bpjs,insurance',
            'pharmacist_id' => 'nullable|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get filtered data (same logic as history method)
            $query = DB::table('prescriptions')
                ->join('t_registrasi', 'prescriptions.registration_id', '=', 't_registrasi.id')
                ->join('m_pasien', 't_registrasi.patient_id', '=', 'm_pasien.id')
                ->leftJoin('users as doctors', 'prescriptions.doctor_id', '=', 'doctors.id')
                ->leftJoin('users as pharmacists', 'prescriptions.pharmacist_id', '=', 'pharmacists.id')
                ->leftJoin('users as dispensers', 'prescriptions.dispensed_by', '=', 'dispensers.id')
                ->leftJoin('prescription_items', 'prescriptions.id', '=', 'prescription_items.prescription_id')
                ->select([
                    'prescriptions.id',
                    'prescriptions.status',
                    'prescriptions.created_at',
                    'prescriptions.validated_at',
                    'prescriptions.dispensed_at',
                    'prescriptions.completed_at',
                    'prescriptions.total_price',
                    'prescriptions.payment_method',
                    'm_pasien.nama_lengkap as patient_name',
                    'm_pasien.no_rm as medical_record_number',
                    'm_pasien.jenis_asuransi as insurance_type',
                    'doctors.name as doctor_name',
                    'pharmacists.name as pharmacist_name',
                    'dispensers.name as dispenser_name',
                    'prescription_items.medicine_name',
                    'prescription_items.dosage',
                    'prescription_items.frequency',
                    'prescription_items.duration',
                ]);

            // Apply same filters as history method
            if ($request->search) {
                $search = strtolower($request->search);
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(m_pasien.nama_lengkap) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(m_pasien.no_rm) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(doctors.name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(pharmacists.name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(dispensers.name) LIKE ?', ["%{$search}%"]);
                });
            }

            if ($request->status) {
                $query->where('prescriptions.status', $request->status);
            }

            if ($request->insurance_type) {
                $query->where('m_pasien.jenis_asuransi', $request->insurance_type);
            }

            if ($request->pharmacist_id) {
                $query->where('prescriptions.pharmacist_id', $request->pharmacist_id);
            }

            $dateFrom = $request->date_from ?: now()->subDays(30)->format('Y-m-d');
            $dateTo = $request->date_to ?: now()->format('Y-m-d');

            $query->whereDate('prescriptions.created_at', '>=', $dateFrom)
                  ->whereDate('prescriptions.created_at', '<=', $dateTo);

            $data = $query->orderBy('prescriptions.created_at', 'desc')->get();

            // Group by prescription for export
            $groupedData = $data->groupBy('id')->map(function ($items, $prescriptionId) {
                $first = $items->first();
                return [
                    'prescription_id' => $prescriptionId,
                    'prescription_number' => 'RX-' . str_pad($prescriptionId, 6, '0', STR_PAD_LEFT),
                    'status' => $first->status,
                    'created_at' => $first->created_at,
                    'validated_at' => $first->validated_at,
                    'dispensed_at' => $first->dispensed_at,
                    'completed_at' => $first->completed_at,
                    'patient_name' => $first->patient_name,
                    'medical_record_number' => $first->medical_record_number,
                    'insurance_type' => $first->insurance_type,
                    'doctor_name' => $first->doctor_name,
                    'pharmacist_name' => $first->pharmacist_name,
                    'dispenser_name' => $first->dispenser_name,
                    'total_price' => $first->total_price,
                    'payment_method' => $first->payment_method,
                    'medicines' => $items->map(function ($item) {
                        return [
                            'name' => $item->medicine_name,
                            'dosage' => $item->dosage,
                            'frequency' => $item->frequency,
                            'duration' => $item->duration,
                        ];
                    })->toArray(),
                ];
            })->values();

            // For now, return JSON data that frontend can use to generate Excel
            // TODO: Implement actual Excel export using Laravel Excel or similar

            return response()->json([
                'success' => true,
                'message' => 'Export data ready',
                'data' => $groupedData,
                'export_ready' => false, // Set to true when Excel generation is implemented
                'filename' => 'riwayat_resep_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export prescription history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check for drug interactions and allergies.
     */
    private function checkDrugInteractions(array $items, $patient): array
    {
        $warnings = [];

        // Get medicine details
        $medicineIds = collect($items)->pluck('medicine_id')->toArray();
        $medicines = Medicine::whereIn('id', $medicineIds)->get()->keyBy('id');

        // Check allergies
        $patientAllergies = $patient->alergi ? explode(',', $patient->alergi) : [];

        foreach ($items as $item) {
            $medicine = $medicines[$item['medicine_id']] ?? null;
            if (!$medicine) continue;

            // Check allergy warnings
            foreach ($patientAllergies as $allergy) {
                $allergy = trim(strtolower($allergy));
                if (str_contains(strtolower($medicine->nama_obat), $allergy) ||
                    str_contains(strtolower($medicine->nama_generik ?? ''), $allergy)) {
                    $warnings[] = [
                        'type' => 'allergy',
                        'severity' => 'high',
                        'message' => "Patient allergic to {$medicine->nama_obat}",
                        'medicine_id' => $medicine->id
                    ];
                }
            }
        }

        // Check drug-drug interactions
        if (count($medicineIds) > 1) {
            $interactions = MedicineInteraction::where(function($query) use ($medicineIds) {
                foreach ($medicineIds as $id1) {
                    foreach ($medicineIds as $id2) {
                        if ($id1 < $id2) {
                            $query->orWhere(function($q) use ($id1, $id2) {
                                $q->where('medicine1_id', $id1)->where('medicine2_id', $id2);
                            });
                        }
                    }
                }
            })->with(['medicine1', 'medicine2'])->get();

            foreach ($interactions as $interaction) {
                $warnings[] = [
                    'type' => 'interaction',
                    'severity' => $interaction->severity,
                    'message' => "Drug interaction: {$interaction->medicine1->nama_obat} + {$interaction->medicine2->nama_obat} - {$interaction->description}",
                    'medicine_id' => $interaction->medicine1_id,
                    'medicine2_id' => $interaction->medicine2_id,
                    'interaction' => [
                        'severity' => $interaction->severity,
                        'description' => $interaction->description,
                        'management' => $interaction->management,
                        'reference' => $interaction->reference
                    ]
                ];
            }
        }

        return $warnings;
    }

}
