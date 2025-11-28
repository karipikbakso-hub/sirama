<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ObatKeluar;
use App\Models\PrescriptionItem;
use App\Models\Prescription;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class DistribusiObatController extends Controller
{
    /**
     * Get list of medicine distributions with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'tanggal_dari' => 'nullable|date',
            'tanggal_sampai' => 'nullable|date',
            'status' => ['nullable', 'in:menunggu,dikeluarkan,selesai'],
            'user_id' => 'nullable|exists:users,id',
            'registration_id' => 'nullable|exists:t_registrasi,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $query = ObatKeluar::with([
                'prescriptionItem.prescription.registration.patient',
                'prescriptionItem.medicine',
                'nurse'
            ]);

            // Apply filters
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->whereHas('prescriptionItem.prescription.registration.patient', function($q) use ($search) {
                    $q->where('full_name', 'like', '%' . $search . '%')
                      ->orWhere('medical_record_number', 'like', '%' . $search . '%');
                })->orWhereHas('prescriptionItem.medicine', function($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                });
            }

            if ($request->has('tanggal_dari')) {
                $query->whereDate('given_at', '>=', $request->tanggal_dari);
            }

            if ($request->has('tanggal_sampai')) {
                $query->whereDate('given_at', '<=', $request->tanggal_sampai);
            }

            if ($request->has('nurse_id')) {
                $query->where('nurse_id', $request->nurse_id);
            }

            if ($request->has('registration_id')) {
                $query->where('registration_id', $request->registration_id);
            }

            // Order by date
            $query->orderBy('given_at', 'desc')
                  ->orderBy('created_at', 'desc');

            $distribusi = $query->paginate(
                $request->get('per_page', 15),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            $data = $distribusi->map(function ($item) {
                // Check if all relationships exist
                if (!$item->prescriptionItem || !$item->prescriptionItem->prescription ||
                    !$item->prescriptionItem->prescription->registration ||
                    !$item->prescriptionItem->prescription->registration->patient ||
                    !$item->prescriptionItem->medicine || !$item->nurse) {
                    return null; // Skip this item
                }

                return [
                    'id' => $item->id,
                    'prescription_item_id' => $item->prescription_item_id,
                    'given_at' => $item->given_at->format('Y-m-d H:i:s'),
                    'quantity_given' => $item->quantity_given,
                    'notes' => $item->notes,
                    'resep' => [
                        'id' => $item->prescriptionItem->prescription->id,
                        'no_resep' => 'RX-' . $item->prescriptionItem->prescription->id,
                        'tanggal_resep' => $item->prescriptionItem->prescription->created_at->format('Y-m-d'),
                    ],
                    'patient' => [
                        'id' => $item->prescriptionItem->prescription->registration->patient->id,
                        'nama' => $item->prescriptionItem->prescription->registration->patient->full_name,
                        'no_rm' => $item->prescriptionItem->prescription->registration->patient->medical_record_number,
                    ],
                    'obat' => [
                        'id' => $item->prescriptionItem->medicine->id,
                        'nama_obat' => $item->prescriptionItem->medicine_name,
                        'nama_generik' => $item->prescriptionItem->medicine->name,
                    ],
                    'aturan_pakai' => $item->prescriptionItem->instruction,
                    'user' => [
                        'id' => $item->nurse->id,
                        'name' => $item->nurse->name,
                    ],
                    'created_at' => $item->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $item->updated_at->format('Y-m-d H:i:s'),
                ];
            })->filter(function ($item) {
                return $item !== null; // Remove null items
            })->values();

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => $distribusi->currentPage(),
                    'last_page' => $distribusi->lastPage(),
                    'per_page' => $distribusi->perPage(),
                    'total' => $distribusi->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data distribusi obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prescriptions ready for distribution
     */
    public function prescriptions(Request $request): JsonResponse
    {
        try {
            // Get prescription items that haven't been fully distributed yet
            $prescriptionItems = PrescriptionItem::with([
                'prescription.registration.patient',
                'prescription.doctor',
                'medicine'
            ])
            ->whereHas('prescription', function($q) {
                $q->whereIn('status', ['approved', 'final']);
            })
            ->whereDoesntHave('obatKeluar', function($q) {
                $q->where('status', 'selesai');
            })
            ->orWhereHas('obatKeluar', function($q) {
                $q->where('status', '!=', 'selesai');
            })
            ->orderBy('created_at', 'desc')
            ->get();

            $data = $prescriptionItems->map(function ($item) {
                $totalDistributed = $item->obatKeluar()
                    ->where('status', 'selesai')
                    ->sum('quantity_given');
                $remaining = $item->dosage ? 1 : 0; // Simplified - assuming 1 unit per prescription item

                return [
                    'id' => $item->id,
                    'prescription_id' => $item->prescription_id,
                    'medicine_id' => $item->medicine_id,
                    'resep' => [
                        'id' => $item->prescription->id,
                        'no_resep' => 'RX-' . $item->prescription->id,
                        'tanggal_resep' => $item->prescription->created_at->format('Y-m-d'),
                        'status' => $item->prescription->status,
                    ],
                    'patient' => [
                        'id' => $item->prescription->registration->patient->id,
                        'nama' => $item->prescription->registration->patient->full_name,
                        'no_rm' => $item->prescription->registration->patient->medical_record_number,
                        'usia' => 25, // Placeholder
                        'jenis_kelamin' => 'L', // Placeholder
                    ],
                    'dokter' => [
                        'id' => $item->prescription->doctor->id ?? null,
                        'name' => $item->prescription->doctor->name ?? null,
                    ],
                    'obat' => [
                        'id' => $item->medicine->id,
                        'nama_obat' => $item->medicine_name,
                        'nama_generik' => $item->medicine->name,
                        'satuan' => $item->medicine->unit,
                    ],
                    'jumlah' => 1, // Placeholder
                    'hari' => 1, // Placeholder
                    'total_quantity' => 1, // Placeholder
                    'aturan_pakai' => $item->instruction,
                    'instruksi' => $item->instruction,
                    'harga_satuan' => 0, // Placeholder
                    'subtotal' => 0, // Placeholder
                    'distributed_quantity' => $totalDistributed,
                    'remaining_quantity' => $remaining,
                    'is_ready' => $remaining > 0,
                ];
            })->filter(function ($item) {
                return $item['is_ready'];
            })->values();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data resep obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Record medicine distribution (create obat_keluar entry)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prescription_item_id' => 'required|exists:prescription_items,id',
            'quantity_given' => 'required|integer|min:1',
            'given_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
            // 5 benar validation
            'registration_id' => 'required|exists:t_registrasi,id',
            'medicine_id' => 'required|exists:medicines,id',
            'dosage' => 'required|string|max:255',
            'time' => 'required|string|max:255',
            'route' => 'required|string|max:255',
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

            $prescriptionItem = PrescriptionItem::with(['prescription.registration.patient', 'medicine'])->findOrFail($request->prescription_item_id);

            // 5 benar validation
            if ($prescriptionItem->prescription->registration_id != $request->registration_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registrasi tidak sesuai dengan resep'
                ], 400);
            }

            if ($prescriptionItem->medicine_id != $request->medicine_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Obat tidak sesuai dengan resep'
                ], 400);
            }

            // Check dosage match prescription
            if ($prescriptionItem->instruction != $request->dosage) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dosis tidak sesuai dengan resep'
                ], 400);
            }

            // Check available quantity (simplified - assuming 1 unit per prescription item)
            $totalDistributed = $prescriptionItem->obatKeluar()
                ->where('status', 'selesai')
                ->sum('quantity_given');

            if ($totalDistributed + $request->quantity_given > 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah distribusi melebihi jumlah yang diresepkan'
                ], 400);
            }

            // Check medicine stock
            $medicine = $prescriptionItem->medicine;
            if ($medicine->stock < $request->quantity_given) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok obat tidak mencukupi'
                ], 400);
            }

            $distribusi = ObatKeluar::create([
                'registration_id' => $request->registration_id,
                'prescription_item_id' => $request->prescription_item_id,
                'medicine_id' => $request->medicine_id,
                'quantity_given' => $request->quantity_given,
                'given_at' => $request->given_at ?? now(),
                'nurse_id' => Auth::id(),
                'notes' => $request->notes,
            ]);

            // Update medicine stock
            $medicine->decrement('stock', $request->quantity_given);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribusi obat berhasil dicatat',
                'data' => $distribusi->load([
                    'prescriptionItem.prescription.registration.patient',
                    'prescriptionItem.medicine',
                    'nurse'
                ])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat distribusi obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show specific distribution
     */
    public function show(ObatKeluar $distribusi): JsonResponse
    {
        try {
            $distribusi->load([
                'prescriptionItem.prescription.registration.patient',
                'prescriptionItem.prescription.doctor',
                'prescriptionItem.medicine',
                'nurse'
            ]);

            $data = [
                'id' => $distribusi->id,
                'prescription_item_id' => $distribusi->prescription_item_id,
                'given_at' => $distribusi->given_at->format('Y-m-d H:i:s'),
                'quantity_given' => $distribusi->quantity_given,
                'notes' => $distribusi->notes,
                'resep' => [
                    'id' => $distribusi->prescriptionItem->prescription->id,
                    'no_resep' => 'RX-' . $distribusi->prescriptionItem->prescription->id,
                    'tanggal_resep' => $distribusi->prescriptionItem->prescription->created_at->format('Y-m-d'),
                    'status' => $distribusi->prescriptionItem->prescription->status,
                ],
                'patient' => [
                    'id' => $distribusi->prescriptionItem->prescription->registration->patient->id,
                    'nama' => $distribusi->prescriptionItem->prescription->registration->patient->full_name,
                    'no_rm' => $distribusi->prescriptionItem->prescription->registration->patient->medical_record_number,
                    'usia' => 25, // Placeholder
                    'jenis_kelamin' => 'L', // Placeholder
                ],
                'dokter' => [
                    'id' => $distribusi->prescriptionItem->prescription->doctor->id ?? null,
                    'name' => $distribusi->prescriptionItem->prescription->doctor->name ?? null,
                ],
                'obat' => [
                    'id' => $distribusi->prescriptionItem->medicine->id,
                    'nama_obat' => $distribusi->prescriptionItem->medicine_name,
                    'nama_generik' => $distribusi->prescriptionItem->medicine->name,
                    'satuan' => $distribusi->prescriptionItem->medicine->unit,
                ],
                'aturan_pakai' => $distribusi->prescriptionItem->instruction,
                'instruksi' => $distribusi->prescriptionItem->instruction,
                'user' => [
                    'id' => $distribusi->nurse->id,
                    'name' => $distribusi->nurse->name,
                ],
                'created_at' => $distribusi->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $distribusi->updated_at->format('Y-m-d H:i:s'),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail distribusi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update distribution status
     */
    public function update(Request $request, ObatKeluar $distribusi): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $distribusi->update([
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Catatan distribusi berhasil diperbarui',
                'data' => $distribusi
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui distribusi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete/cancel distribution
     */
    public function destroy(ObatKeluar $distribusi): JsonResponse
    {
        try {
            if ($distribusi->status === 'selesai') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus distribusi yang sudah selesai'
                ], 400);
            }

            $distribusi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Distribusi berhasil dibatalkan'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan distribusi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get distribution statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $tanggalDari = $request->get('tanggal_dari', now()->startOfMonth()->format('Y-m-d'));
            $tanggalSampai = $request->get('tanggal_sampai', now()->endOfMonth()->format('Y-m-d'));

            $stats = [
                'total_distribusi' => ObatKeluar::whereBetween('tanggal_keluar', [$tanggalDari, $tanggalSampai])->count(),
                'distribusi_menunggu' => ObatKeluar::whereBetween('tanggal_keluar', [$tanggalDari, $tanggalSampai])->where('status', 'menunggu')->count(),
                'distribusi_dikeluarkan' => ObatKeluar::whereBetween('tanggal_keluar', [$tanggalDari, $tanggalSampai])->where('status', 'dikeluarkan')->count(),
                'distribusi_selesai' => ObatKeluar::whereBetween('tanggal_keluar', [$tanggalDari, $tanggalSampai])->where('status', 'selesai')->count(),
                'total_quantity' => ObatKeluar::whereBetween('tanggal_keluar', [$tanggalDari, $tanggalSampai])->where('status', 'selesai')->sum('jumlah_keluar'),
                'total_value' => ObatKeluar::whereBetween('tanggal_keluar', [$tanggalDari, $tanggalSampai])->where('status', 'selesai')->sum('subtotal'),
                'top_distribution_users' => ObatKeluar::with('user')
                    ->whereBetween('tanggal_keluar', [$tanggalDari, $tanggalSampai])
                    ->where('status', 'selesai')
                    ->selectRaw('user_id, COUNT(*) as count, SUM(jumlah_keluar) as quantity, SUM(subtotal) as value')
                    ->groupBy('user_id')
                    ->orderBy('count', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'user' => $item->user,
                            'count' => $item->count,
                            'quantity' => $item->quantity,
                            'value' => $item->value,
                        ];
                    }),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik distribusi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
