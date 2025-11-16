<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ObatKeluar;
use App\Models\ResepDetail;
use App\Models\Resep;
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
                'resepDetail.resep.registrasi.patient',
                'resepDetail.obat',
                'user'
            ]);

            // Apply filters
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->whereHas('resepDetail.resep.registrasi.patient', function($q) use ($search) {
                    $q->where('nama', 'like', '%' . $search . '%')
                      ->orWhere('no_rm', 'like', '%' . $search . '%');
                })->orWhereHas('resepDetail.obat', function($q) use ($search) {
                    $q->where('nama_obat', 'like', '%' . $search . '%');
                });
            }

            if ($request->has('tanggal_dari')) {
                $query->whereDate('tanggal_keluar', '>=', $request->tanggal_dari);
            }

            if ($request->has('tanggal_sampai')) {
                $query->whereDate('tanggal_keluar', '<=', $request->tanggal_sampai);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Order by date
            $query->orderBy('tanggal_keluar', 'desc')
                  ->orderBy('created_at', 'desc');

            $distribusi = $query->paginate(
                $request->get('per_page', 15),
                ['*'],
                'page',
                $request->get('page', 1)
            );

            $data = $distribusi->map(function ($item) {
                // Check if all relationships exist
                if (!$item->resepDetail || !$item->resepDetail->resep ||
                    !$item->resepDetail->resep->registrasi ||
                    !$item->resepDetail->resep->registrasi->patient ||
                    !$item->resepDetail->obat || !$item->user) {
                    return null; // Skip this item
                }

                return [
                    'id' => $item->id,
                    'resep_detail_id' => $item->resep_detail_id,
                    'tanggal_keluar' => $item->tanggal_keluar->format('Y-m-d H:i:s'),
                    'jumlah_keluar' => $item->jumlah_keluar,
                    'harga_satuan' => $item->harga_satuan,
                    'subtotal' => $item->subtotal,
                    'status' => $item->status,
                    'catatan' => $item->catatan,
                    'resep' => [
                        'id' => $item->resepDetail->resep->id,
                        'no_resep' => $item->resepDetail->resep->no_resep,
                        'tanggal_resep' => $item->resepDetail->resep->tanggal_resep->format('Y-m-d'),
                    ],
                    'patient' => [
                        'id' => $item->resepDetail->resep->registrasi->patient->id,
                        'nama' => $item->resepDetail->resep->registrasi->patient->nama,
                        'no_rm' => $item->resepDetail->resep->registrasi->patient->no_rm,
                    ],
                    'obat' => [
                        'id' => $item->resepDetail->obat->id,
                        'nama_obat' => $item->resepDetail->obat->nama_obat,
                        'nama_generik' => $item->resepDetail->obat->nama_generik,
                    ],
                    'aturan_pakai' => $item->resepDetail->aturan_pakai,
                    'user' => [
                        'id' => $item->user->id,
                        'name' => $item->user->name,
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
            // Get resep detail that haven't been fully distributed yet
            $resepDetail = ResepDetail::with([
                'resep.registrasi.patient',
                'resep.dokter',
                'obat'
            ])
            ->whereHas('resep', function($q) {
                $q->whereIn('status', ['final', 'dibuat']);
            })
            ->whereDoesntHave('obatKeluar', function($q) {
                $q->where('status', 'selesai');
            })
            ->orWhereHas('obatKeluar', function($q) {
                $q->where('status', '!=', 'selesai');
            })
            ->orderBy('created_at', 'desc')
            ->get();

            $data = $resepDetail->map(function ($detail) {
                $totalDistributed = $detail->obatKeluar()
                    ->where('status', 'selesai')
                    ->sum('jumlah_keluar');
                $remaining = $detail->jumlah * ($detail->hari ?: 1) - $totalDistributed;

                return [
                    'id' => $detail->id,
                    'resep_id' => $detail->resep_id,
                    'obat_id' => $detail->obat_id,
                    'resep' => [
                        'id' => $detail->resep->id,
                        'no_resep' => $detail->resep->no_resep,
                        'tanggal_resep' => $detail->resep->tanggal_resep->format('Y-m-d'),
                        'status' => $detail->resep->status,
                    ],
                    'patient' => [
                        'id' => $detail->resep->registrasi->patient->id,
                        'nama' => $detail->resep->registrasi->patient->nama,
                        'no_rm' => $detail->resep->registrasi->patient->no_rm,
                        'usia' => $detail->resep->registrasi->patient->usia,
                        'jenis_kelamin' => $detail->resep->registrasi->patient->jenis_kelamin,
                    ],
                    'dokter' => [
                        'id' => $detail->resep->dokter->id ?? null,
                        'name' => $detail->resep->dokter->name ?? null,
                    ],
                    'obat' => [
                        'id' => $detail->obat->id,
                        'nama_obat' => $detail->obat->nama_obat,
                        'nama_generik' => $detail->obat->nama_generik,
                        'satuan' => $detail->obat->satuan,
                    ],
                    'jumlah' => $detail->jumlah,
                    'hari' => $detail->hari,
                    'total_quantity' => $detail->jumlah * ($detail->hari ?: 1),
                    'aturan_pakai' => $detail->aturan_pakai,
                    'instruksi' => $detail->instruksi,
                    'harga_satuan' => $detail->harga_satuan,
                    'subtotal' => $detail->subtotal,
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
            'resep_detail_id' => 'required|exists:t_resep_detail,id',
            'jumlah_keluar' => 'required|integer|min:1',
            'harga_satuan' => 'required|numeric|min:0',
            'tanggal_keluar' => 'nullable|date',
            'catatan' => 'nullable|string|max:500',
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

            $resepDetail = ResepDetail::findOrFail($request->resep_detail_id);

            // Check available quantity
            $totalDistributed = $resepDetail->obatKeluar()
                ->where('status', 'selesai')
                ->sum('jumlah_keluar');
            $maxQuantity = $resepDetail->jumlah * ($resepDetail->hari ?: 1);

            if ($totalDistributed + $request->jumlah_keluar > $maxQuantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah distribusi melebihi jumlah yang diresepkan'
                ], 400);
            }

            $distribusi = ObatKeluar::create([
                'resep_detail_id' => $request->resep_detail_id,
                'user_id' => Auth::id(),
                'tanggal_keluar' => $request->tanggal_keluar ?? now(),
                'jumlah_keluar' => $request->jumlah_keluar,
                'harga_satuan' => $request->harga_satuan,
                'status' => 'dikeluarkan',
                'catatan' => $request->catatan,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribusi obat berhasil dicatat',
                'data' => $distribusi->load([
                    'resepDetail.resep.registrasi.patient',
                    'resepDetail.obat',
                    'user'
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
                'resepDetail.resep.registrasi.patient',
                'resepDetail.resep.dokter',
                'resepDetail.obat',
                'user'
            ]);

            $data = [
                'id' => $distribusi->id,
                'resep_detail_id' => $distribusi->resep_detail_id,
                'tanggal_keluar' => $distribusi->tanggal_keluar->format('Y-m-d H:i:s'),
                'jumlah_keluar' => $distribusi->jumlah_keluar,
                'harga_satuan' => $distribusi->harga_satuan,
                'subtotal' => $distribusi->subtotal,
                'status' => $distribusi->status,
                'catatan' => $distribusi->catatan,
                'resep' => [
                    'id' => $distribusi->resepDetail->resep->id,
                    'no_resep' => $distribusi->resepDetail->resep->no_resep,
                    'tanggal_resep' => $distribusi->resepDetail->resep->tanggal_resep->format('Y-m-d'),
                    'diagnosa' => $distribusi->resepDetail->resep->diagnosa,
                    'instruksi' => $distribusi->resepDetail->resep->instruksi,
                ],
                'patient' => [
                    'id' => $distribusi->resepDetail->resep->registrasi->patient->id,
                    'nama' => $distribusi->resepDetail->resep->registrasi->patient->nama,
                    'no_rm' => $distribusi->resepDetail->resep->registrasi->patient->no_rm,
                    'usia' => $distribusi->resepDetail->resep->registrasi->patient->usia,
                    'jenis_kelamin' => $distribusi->resepDetail->resep->registrasi->patient->jenis_kelamin,
                ],
                'dokter' => [
                    'id' => $distribusi->resepDetail->resep->dokter->id ?? null,
                    'name' => $distribusi->resepDetail->resep->dokter->name ?? null,
                ],
                'obat' => [
                    'id' => $distribusi->resepDetail->obat->id,
                    'nama_obat' => $distribusi->resepDetail->obat->nama_obat,
                    'nama_generik' => $distribusi->resepDetail->obat->nama_generik,
                    'satuan' => $distribusi->resepDetail->obat->satuan,
                ],
                'aturan_pakai' => $distribusi->resepDetail->aturan_pakai,
                'instruksi' => $distribusi->resepDetail->instruksi,
                'user' => [
                    'id' => $distribusi->user->id,
                    'name' => $distribusi->user->name,
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
            'status' => ['required', 'in:menunggu,dikeluarkan,selesai'],
            'catatan' => 'nullable|string|max:500',
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
                'status' => $request->status,
                'catatan' => $request->catatan,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status distribusi berhasil diperbarui',
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
