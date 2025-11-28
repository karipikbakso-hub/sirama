<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CpptEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CpptController extends Controller
{
    /**
     * Menampilkan daftar CPPT entries
     */
    public function index(Request $request)
    {
        try {
            $query = CpptEntry::with(['pasien', 'registrasi', 'user']);

            // Filter berdasarkan parameter
            if ($request->has('pasien_id')) {
                $query->where('pasien_id', $request->pasien_id);
            }

            if ($request->has('registrasi_id')) {
                $query->where('registrasi_id', $request->registrasi_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('shift')) {
                $query->where('shift', $request->shift);
            }

            if ($request->has('tanggal')) {
                $query->whereDate('tanggal_waktu', $request->tanggal);
            }

            // Urutkan berdasarkan tanggal terbaru
            $query->orderBy('tanggal_waktu', 'desc');

            $cpptEntries = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $cpptEntries,
                'message' => 'Daftar CPPT entries berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data CPPT',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan CPPT entry baru
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'pasien_id' => 'required|integer|exists:patients,id',
                'registrasi_id' => 'nullable|integer|exists:registrations,id',
                'tanggal_waktu' => 'required|date',
                'shift' => 'required|in:pagi,siang,malam',
                'subjektif' => 'nullable|string|max:2000',
                'objektif' => 'nullable|string|max:2000',
                'asesmen' => 'nullable|string|max:2000',
                'planning' => 'nullable|string|max:2000',
                'instruksi' => 'nullable|string|max:1000',
                'evaluasi' => 'nullable|string|max:1000',
                'status' => 'required|in:draft,final'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['user_id'] = Auth::id(); // Set user yang sedang login

            $cpptEntry = CpptEntry::create($data);

            return response()->json([
                'success' => true,
                'data' => $cpptEntry->load(['pasien', 'registrasi', 'user']),
                'message' => 'CPPT entry berhasil dibuat'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan detail CPPT entry
     */
    public function show($id)
    {
        try {
            $cpptEntry = CpptEntry::with(['pasien', 'registrasi', 'user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $cpptEntry,
                'message' => 'Detail CPPT entry berhasil diambil'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'CPPT entry tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil detail CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengupdate CPPT entry
     */
    public function update(Request $request, $id)
    {
        try {
            $cpptEntry = CpptEntry::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'pasien_id' => 'sometimes|integer|exists:patients,id',
                'registrasi_id' => 'nullable|integer|exists:registrations,id',
                'tanggal_waktu' => 'sometimes|date',
                'shift' => 'sometimes|in:pagi,siang,malam',
                'subjektif' => 'nullable|string|max:2000',
                'objektif' => 'nullable|string|max:2000',
                'asesmen' => 'nullable|string|max:2000',
                'planning' => 'nullable|string|max:2000',
                'instruksi' => 'nullable|string|max:1000',
                'evaluasi' => 'nullable|string|max:1000',
                'status' => 'sometimes|in:draft,final'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cpptEntry->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $cpptEntry->load(['pasien', 'registrasi', 'user']),
                'message' => 'CPPT entry berhasil diupdate'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'CPPT entry tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengupdate CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus CPPT entry
     */
    public function destroy($id)
    {
        try {
            $cpptEntry = CpptEntry::findOrFail($id);
            $cpptEntry->delete();

            return response()->json([
                'success' => true,
                'message' => 'CPPT entry berhasil dihapus'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'CPPT entry tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus CPPT entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan CPPT entries untuk pasien tertentu
     */
    public function getByPatient($patientId)
    {
        try {
            $cpptEntries = CpptEntry::with(['pasien', 'registrasi', 'user'])
                ->where('pasien_id', $patientId)
                ->orderBy('tanggal_waktu', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $cpptEntries,
                'message' => 'CPPT entries pasien berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil CPPT entries pasien',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan CPPT entries untuk registrasi tertentu
     */
    public function getByRegistration($registrationId)
    {
        try {
            $cpptEntries = CpptEntry::with(['pasien', 'registrasi', 'user'])
                ->where('registrasi_id', $registrationId)
                ->orderBy('tanggal_waktu', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $cpptEntries,
                'message' => 'CPPT entries registrasi berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil CPPT entries registrasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik CPPT
     */
    public function getStatistics(Request $request)
    {
        try {
            $query = CpptEntry::query();

            // Filter berdasarkan tanggal jika ada
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            $totalEntries = $query->count();
            $draftEntries = (clone $query)->where('status', 'draft')->count();
            $finalEntries = (clone $query)->where('status', 'final')->count();

            $shiftStats = (clone $query)->selectRaw('shift, COUNT(*) as count')
                ->groupBy('shift')
                ->get()
                ->pluck('count', 'shift');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'draft_entries' => $draftEntries,
                    'final_entries' => $finalEntries,
                    'shift_statistics' => $shiftStats
                ],
                'message' => 'Statistik CPPT berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik CPPT',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
