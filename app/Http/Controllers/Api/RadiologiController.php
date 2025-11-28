<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Radiologi;
use App\Models\MasterRadiologi;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RadiologiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $radiologyOrders = Radiologi::with(['registrasi.pasien', 'master_radiologi', 'dokter'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Data order radiologi berhasil diambil',
                'data' => $radiologyOrders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data order radiologi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'registrasi_id' => 'required|integer',
                'radio_id' => 'required|integer',
                'diagnosa_klinis' => 'required|string|max:500',
                'urgensi' => 'required|in:rutin,urgent,stat',
                'catatan' => 'nullable|string|max:255',
                'tanggal_permintaan' => 'required|date',
                'status' => 'required|in:diminta,proses,selesai,batal',
                'dokter_id' => 'required|integer',
            ]);

            // Manual validation for foreign keys
            if ($validator->passes()) {
                // Debug logging
                \Log::info('Validating registration_id: ' . $request->registrasi_id);

                $registration = Registration::find($request->registrasi_id);
                \Log::info('Registration found: ', ['registration' => $registration]);

                if (!$registration) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors' => ['registrasi_id' => ['Registration not found']]
                    ], 422);
                }

                $radiologyExam = MasterRadiologi::find($request->radio_id);
                if (!$radiologyExam) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors' => ['radio_id' => ['Radiology examination not found']]
                    ], 422);
                }

                $doctor = \DB::table('m_dokter')->find($request->dokter_id);
                if (!$doctor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors' => ['dokter_id' => ['Doctor not found']]
                    ], 422);
                }
            }

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the tariff from master_radiologi
            $masterRadiologi = MasterRadiologi::findOrFail($request->radio_id);
            $tarif = $masterRadiologi->tarif;

            $radiologyOrder = Radiologi::create([
                'registrasi_id' => $request->registrasi_id,
                'radio_id' => $request->radio_id,
                'dokter_id' => $request->dokter_id,
                'tanggal_permintaan' => $request->tanggal_permintaan,
                'diagnosa_klinis' => $request->diagnosa_klinis,
                'urgensi' => $request->urgensi,
                'status' => $request->status,
                'tarif' => $tarif,
                'catatan' => $request->catatan,
            ]);

            // Load relationships for response
            $radiologyOrder->load(['registrasi.pasien', 'master_radiologi', 'dokter']);

            return response()->json([
                'success' => true,
                'message' => 'Order radiologi berhasil dibuat',
                'data' => $radiologyOrder
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat order radiologi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Radiologi $radiologi)
    {
        try {
            $radiologi->load(['registrasi.pasien', 'master_radiologi', 'dokter']);

            return response()->json([
                'success' => true,
                'message' => 'Data order radiologi berhasil diambil',
                'data' => $radiologi
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data order radiologi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Radiologi $radiologi)
    {
        try {
            $validator = Validator::make($request->all(), [
                'diagnosa_klinis' => 'sometimes|required|string|max:500',
                'urgensi' => 'sometimes|required|in:rutin,urgent,stat',
                'catatan' => 'nullable|string|max:255',
                'status' => 'sometimes|required|in:diminta,proses,selesai,batal',
                'hasil' => 'nullable|string',
                'kesan' => 'nullable|string',
                'tanggal_hasil' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $radiologi->update($request->only([
                'diagnosa_klinis',
                'urgensi',
                'catatan',
                'status',
                'hasil',
                'kesan',
                'tanggal_hasil'
            ]));

            $radiologi->load(['registrasi.pasien', 'master_radiologi', 'dokter']);

            return response()->json([
                'success' => true,
                'message' => 'Order radiologi berhasil diperbarui',
                'data' => $radiologi
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui order radiologi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Radiologi $radiologi)
    {
        try {
            $radiologi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order radiologi berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus order radiologi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for radiology orders
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'total_orders' => Radiologi::count(),
                'by_status' => Radiologi::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'by_doctor' => Radiologi::with('dokter')
                    ->selectRaw('dokter_id, COUNT(*) as count')
                    ->groupBy('dokter_id')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'doctor_name' => $item->dokter->name ?? 'Unknown',
                            'count' => $item->count
                        ];
                    }),
                'completed_today' => Radiologi::where('status', 'selesai')
                    ->whereDate('updated_at', today())
                    ->count(),
                'pending_orders' => Radiologi::whereIn('status', ['diminta', 'proses'])->count(),
                'by_urgency' => Radiologi::selectRaw('urgensi, COUNT(*) as count')
                    ->groupBy('urgensi')
                    ->pluck('count', 'urgensi')
                    ->toArray()
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik order radiologi berhasil diambil',
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
     * Print radiology order results
     */
    public function printResults(Radiologi $radiologi)
    {
        try {
            $radiologi->load(['registrasi.pasien', 'master_radiologi', 'dokter']);

            // Here you would typically generate a PDF or format the data for printing
            // For now, we'll just return the formatted data

            return response()->json([
                'success' => true,
                'message' => 'Data hasil radiologi untuk print berhasil diambil',
                'data' => $radiologi
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data untuk print',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
