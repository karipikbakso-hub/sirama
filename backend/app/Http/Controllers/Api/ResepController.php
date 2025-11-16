<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resep;
use App\Models\ResepDetail;
use App\Models\Medicine;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ResepController extends Controller
{
    /**
     * Generate unique prescription number.
     */
    private function generateNoResep(): string
    {
        $year = date('Y');
        $month = date('m');

        // Get the last prescription number for this month
        $lastResep = Resep::whereYear('created_at', $year)
                          ->whereMonth('created_at', $month)
                          ->orderBy('id', 'desc')
                          ->first();

        if ($lastResep) {
            // Extract the sequence number from the last prescription number
            $parts = explode('-', $lastResep->no_resep);
            if (count($parts) >= 3) {
                $sequence = intval(end($parts)) + 1;
            } else {
                $sequence = 1;
            }
        } else {
            $sequence = 1;
        }

        return sprintf('RS-%s-%s-%03d', $year, $month, $sequence);
    }

    /**
     * Display a listing of prescriptions.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Resep::with(['registrasi.pasien', 'dokter', 'resepDetails.obat']);

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
                $query->whereDate('tanggal_resep', '>=', $request->tanggal_mulai);
            }

            if ($request->has('tanggal_akhir') && $request->tanggal_akhir) {
                $query->whereDate('tanggal_resep', '<=', $request->tanggal_akhir);
            }

            // Search by patient name or prescription number
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('no_resep', 'like', "%{$search}%")
                      ->orWhereHas('registrasi.pasien', function ($patientQuery) use ($search) {
                          $patientQuery->where('name', 'like', "%{$search}%")
                                     ->orWhere('mrn', 'like', "%{$search}%");
                      });
                });
            }

            // Sort and paginate
            $perPage = $request->get('per_page', 15);
            $reseps = $query->orderBy('tanggal_resep', 'desc')
                           ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data resep berhasil diambil',
                'data' => $reseps
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data resep',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created prescription.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'registrasi_id' => 'required|exists:registrations,id',
                'diagnosa' => 'required|string|max:500',
                'instruksi' => 'nullable|string|max:1000',
                'tanggal_resep' => 'required|date',
                'status' => ['required', Rule::in(['draft', 'final', 'dibuat', 'selesai'])],
                'obat' => 'required|array|min:1',
                'obat.*.obat_id' => 'required|exists:medicines,id',
                'obat.*.jumlah' => 'required|integer|min:1',
                'obat.*.aturan_pakai' => 'required|string|max:100',
                'obat.*.hari' => 'required|integer|min:1',
                'obat.*.instruksi' => 'nullable|string|max:500',
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
                // Create prescription header
                $resepData = [
                    'no_resep' => $this->generateNoResep(),
                    'registrasi_id' => $request->registrasi_id,
                    'dokter_id' => auth()->id(),
                    'diagnosa' => $request->diagnosa,
                    'instruksi' => $request->instruksi,
                    'tanggal_resep' => $request->tanggal_resep,
                    'status' => $request->status,
                ];

                $resep = Resep::create($resepData);

                // Create prescription details
                foreach ($request->obat as $obatData) {
                    $medicine = Medicine::find($obatData['obat_id']);

                    ResepDetail::create([
                        'resep_id' => $resep->id,
                        'obat_id' => $obatData['obat_id'],
                        'jumlah' => $obatData['jumlah'],
                        'aturan_pakai' => $obatData['aturan_pakai'],
                        'hari' => $obatData['hari'],
                        'instruksi' => $obatData['instruksi'] ?? null,
                        'harga_satuan' => $medicine->harga_jual ?? 0,
                    ]);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Resep berhasil dibuat',
                    'data' => $resep->load(['registrasi.pasien', 'dokter', 'resepDetails.obat'])
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat resep',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified prescription.
     */
    public function show(Resep $resep): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Data resep berhasil diambil',
                'data' => $resep->load(['registrasi.pasien', 'dokter', 'resepDetails.obat'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data resep',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified prescription.
     */
    public function update(Request $request, Resep $resep): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'diagnosa' => 'sometimes|string|max:500',
                'instruksi' => 'nullable|string|max:1000',
                'tanggal_resep' => 'sometimes|date',
                'status' => ['sometimes', Rule::in(['draft', 'final', 'dibuat', 'selesai'])],
                'obat' => 'sometimes|array|min:1',
                'obat.*.obat_id' => 'required|exists:medicines,id',
                'obat.*.jumlah' => 'required|integer|min:1',
                'obat.*.aturan_pakai' => 'required|string|max:100',
                'obat.*.hari' => 'required|integer|min:1',
                'obat.*.instruksi' => 'nullable|string|max:500',
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
                // Update prescription header
                $resep->update($request->only(['diagnosa', 'instruksi', 'tanggal_resep', 'status']));

                // Update prescription details if provided
                if ($request->has('obat')) {
                    // Delete existing details
                    $resep->resepDetails()->delete();

                    // Create new details
                    foreach ($request->obat as $obatData) {
                        $medicine = Medicine::find($obatData['obat_id']);

                        ResepDetail::create([
                            'resep_id' => $resep->id,
                            'obat_id' => $obatData['obat_id'],
                            'jumlah' => $obatData['jumlah'],
                            'aturan_pakai' => $obatData['aturan_pakai'],
                            'hari' => $obatData['hari'],
                            'instruksi' => $obatData['instruksi'] ?? null,
                        'harga_satuan' => $medicine->harga_jual ?? 0,
                        ]);
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Resep berhasil diperbarui',
                    'data' => $resep->load(['registrasi.pasien', 'dokter', 'resepDetails.obat'])
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui resep',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified prescription.
     */
    public function destroy(Resep $resep): JsonResponse
    {
        try {
            // Only allow deletion of draft prescriptions
            if ($resep->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya resep dengan status draft yang dapat dihapus'
                ], 422);
            }

            $resep->delete();

            return response()->json([
                'success' => true,
                'message' => 'Resep berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus resep',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get master medicine data for dropdown.
     */
    public function getMasterMedicines(Request $request): JsonResponse
    {
        try {
            $query = Medicine::active(); // Only active medicines

            // Search by name
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where('nama_obat', 'like', "%{$search}%");
            }

            // Filter by category
            if ($request->has('category') && $request->category) {
                $query->where('golongan_obat', $request->category);
            }

            $medicines = $query->orderBy('nama_obat')
                              ->limit(50)
                              ->get(['id', 'nama_obat', 'harga_jual', 'satuan', 'golongan_obat']);

            return response()->json([
                'success' => true,
                'message' => 'Data master obat berhasil diambil',
                'data' => $medicines
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data master obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get prescription statistics.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total_reseps' => Resep::count(),
                'by_status' => Resep::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status'),
                'by_doctor' => Resep::selectRaw('dokter_id, COUNT(*) as count')
                    ->with('dokter:id,name')
                    ->groupBy('dokter_id')
                    ->orderBy('count', 'desc')
                    ->limit(5)
                    ->get(),
                'recent_reseps' => Resep::with(['registrasi.pasien', 'dokter'])
                    ->orderBy('tanggal_resep', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik resep berhasil diambil',
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
     * Print prescription.
     */
    public function print(Resep $resep): JsonResponse
    {
        try {
            $data = $resep->load(['registrasi.pasien', 'dokter', 'resepDetails.obat']);

            // Format data for printing
            $printData = [
                'no_resep' => $resep->no_resep,
                'tanggal' => $resep->tanggal_resep->format('d/m/Y'),
                'pasien' => [
                    'nama' => $data->registrasi->pasien->name,
                    'mrn' => $data->registrasi->pasien->mrn,
                    'umur' => $data->registrasi->pasien->birth_date ?
                        \Carbon\Carbon::parse($data->registrasi->pasien->birth_date)->age : null,
                ],
                'dokter' => $data->dokter->name,
                'diagnosa' => $resep->diagnosa,
                'instruksi' => $resep->instruksi,
                'obat' => $data->resepDetails->map(function ($detail) {
                    return [
                        'nama' => $detail->obat->name,
                        'jumlah' => $detail->jumlah,
                        'aturan_pakai' => $detail->aturan_pakai,
                        'hari' => $detail->hari,
                        'instruksi' => $detail->instruksi,
                    ];
                }),
                'total' => $resep->total,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Data resep untuk print berhasil diambil',
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
}
