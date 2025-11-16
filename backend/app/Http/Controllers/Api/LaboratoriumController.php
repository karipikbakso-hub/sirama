<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Laboratorium;
use App\Models\MasterLaboratorium;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class LaboratoriumController extends Controller
{
    /**
     * Display a listing of laboratory orders.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Laboratorium::with(['registrasi.pasien', 'labTest', 'dokter']);

            // Filter by doctor (current user if not specified)
            $doctorId = $request->get('dokter_id', auth()->id());
            if ($doctorId) {
                $query->where('dokter_id', $doctorId);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('tanggal_mulai') && $request->tanggal_mulai) {
                $query->whereDate('tanggal_permintaan', '>=', $request->tanggal_mulai);
            }

            if ($request->has('tanggal_akhir') && $request->tanggal_akhir) {
                $query->whereDate('tanggal_permintaan', '<=', $request->tanggal_akhir);
            }

            // Search by patient name or MRN
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('registrasi.pasien', function ($patientQuery) use ($search) {
                        $patientQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('mrn', 'like', "%{$search}%");
                    })
                    ->orWhereHas('labTest', function ($labQuery) use ($search) {
                        $labQuery->where('nama_pemeriksaan', 'like', "%{$search}%")
                                ->orWhere('kode_pemeriksaan', 'like', "%{$search}%");
                    });
                });
            }

            // Sort and paginate
            $perPage = $request->get('per_page', 15);
            $laboratoriums = $query->orderBy('tanggal_permintaan', 'desc')
                                 ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data order laboratorium berhasil diambil',
                'data' => $laboratoriums
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data order laboratorium',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created laboratory order.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'registrasi_id' => 'required|exists:registrations,id',
                'lab_tests' => 'required|array|min:1',
                'lab_tests.*.lab_id' => 'required|exists:m_laboratorium,id',
                'prioritas' => ['required', Rule::in(['rutin', 'cito', 'stat'])],
                'diagnosa_klinis' => 'required|string|max:500',
                'indikasi' => 'nullable|string|max:500',
                'catatan' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                $laboratoriumOrders = [];

                // Create laboratory orders for each selected test
                foreach ($request->lab_tests as $labTest) {
                    $masterLab = MasterLaboratorium::find($labTest['lab_id']);

                    $laboratorium = Laboratorium::create([
                        'registrasi_id' => $request->registrasi_id,
                        'lab_id' => $labTest['lab_id'],
                        'dokter_id' => auth()->id(),
                        'tanggal_permintaan' => now(),
                        'status' => 'diminta',
                        'satuan' => $masterLab->satuan ?? null,
                        'nilai_normal' => $masterLab->nilai_normal ?? null,
                        'tarif' => $masterLab->harga ?? 0,
                        'catatan' => $request->catatan,
                    ]);

                    $laboratoriumOrders[] = $laboratorium;
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Order laboratorium berhasil dibuat',
                    'data' => $laboratoriumOrders
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat order laboratorium',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified laboratory order.
     */
    public function show(Laboratorium $laboratorium): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Data order laboratorium berhasil diambil',
                'data' => $laboratorium->load(['registrasi.pasien', 'labTest', 'dokter'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data order laboratorium',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified laboratory order.
     */
    public function update(Request $request, Laboratorium $laboratorium): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => ['sometimes', Rule::in(['diminta', 'proses', 'selesai', 'batal'])],
                'hasil' => 'nullable|string|max:50',
                'tanggal_hasil' => 'nullable|date',
                'catatan' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $laboratorium->update($request->only(['status', 'hasil', 'tanggal_hasil', 'catatan']));

            return response()->json([
                'success' => true,
                'message' => 'Order laboratorium berhasil diperbarui',
                'data' => $laboratorium->load(['registrasi.pasien', 'labTest', 'dokter'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui order laboratorium',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified laboratory order.
     */
    public function destroy(Laboratorium $laboratorium): JsonResponse
    {
        try {
            // Only allow deletion of pending orders
            if ($laboratorium->status !== 'diminta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya order dengan status diminta yang dapat dihapus'
                ], 422);
            }

            $laboratorium->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order laboratorium berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus order laboratorium',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get master laboratory tests for dropdown.
     */
    public function getMasterLabTests(Request $request): JsonResponse
    {
        try {
            $query = MasterLaboratorium::active(); // Only active tests

            // Search by name or code
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nama_pemeriksaan', 'like', "%{$search}%")
                      ->orWhere('kode_pemeriksaan', 'like', "%{$search}%");
                });
            }

            // Filter by category
            if ($request->has('kategori') && $request->kategori) {
                $query->where('kategori', $request->kategori);
            }

            $labTests = $query->orderBy('nama_pemeriksaan')
                             ->limit(50)
                             ->get(['id', 'nama_pemeriksaan', 'kode_pemeriksaan', 'kategori', 'satuan', 'nilai_normal', 'harga']);

            return response()->json([
                'success' => true,
                'message' => 'Data master pemeriksaan laboratorium berhasil diambil',
                'data' => $labTests
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data master pemeriksaan laboratorium',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get laboratory order statistics.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total_orders' => Laboratorium::count(),
                'by_status' => Laboratorium::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status'),
                'by_doctor' => Laboratorium::selectRaw('dokter_id, COUNT(*) as count')
                    ->with('dokter:id,name')
                    ->groupBy('dokter_id')
                    ->orderBy('count', 'desc')
                    ->limit(5)
                    ->get(),
                'completed_today' => Laboratorium::whereDate('tanggal_hasil', today())
                    ->where('status', 'selesai')
                    ->count(),
                'pending_orders' => Laboratorium::whereIn('status', ['diminta', 'proses'])
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik order laboratorium berhasil diambil',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Print laboratory results.
     */
    public function printResults(Laboratorium $laboratorium): JsonResponse
    {
        try {
            if ($laboratorium->status !== 'selesai' || !$laboratorium->hasil) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hasil laboratorium belum tersedia'
                ], 422);
            }

            $data = $laboratorium->load(['registrasi.pasien', 'labTest', 'dokter']);

            // Format data for printing
            $printData = [
                'no_order' => $laboratorium->id,
                'tanggal_permintaan' => $laboratorium->tanggal_permintaan->format('d/m/Y H:i'),
                'tanggal_hasil' => $laboratorium->tanggal_hasil?->format('d/m/Y H:i'),
                'pasien' => [
                    'nama' => $data->registrasi->pasien->name,
                    'mrn' => $data->registrasi->pasien->mrn,
                    'umur' => $data->registrasi->pasien->birth_date ?
                        \Carbon\Carbon::parse($data->registrasi->pasien->birth_date)->age : null,
                ],
                'dokter' => $data->dokter->name,
                'pemeriksaan' => [
                    'nama' => $data->labTest->nama_pemeriksaan,
                    'kode' => $data->labTest->kode_pemeriksaan,
                    'kategori' => $data->labTest->kategori,
                ],
                'hasil' => [
                    'nilai' => $laboratorium->hasil,
                    'satuan' => $laboratorium->satuan,
                    'nilai_normal' => $laboratorium->nilai_normal,
                    'status' => $laboratorium->result_status,
                    'is_abnormal' => $laboratorium->is_abnormal,
                ],
                'catatan' => $laboratorium->catatan,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Data hasil laboratorium untuk print berhasil diambil',
                'data' => $printData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mempersiapkan data print',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update laboratory orders (for lab technician).
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'orders' => 'required|array',
                'orders.*.id' => 'required|exists:t_laboratorium,id',
                'orders.*.hasil' => 'nullable|string|max:50',
                'orders.*.status' => ['required', Rule::in(['diminta', 'proses', 'selesai', 'batal'])],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                foreach ($request->orders as $orderData) {
                    $laboratorium = Laboratorium::find($orderData['id']);

                    $updateData = [
                        'status' => $orderData['status'],
                    ];

                    if (isset($orderData['hasil'])) {
                        $updateData['hasil'] = $orderData['hasil'];
                        $updateData['tanggal_hasil'] = now();
                    }

                    $laboratorium->update($updateData);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Order laboratorium berhasil diperbarui secara bulk'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui order laboratorium',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
