<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CpptNursingEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CpptNursingController extends Controller
{
    /**
     * Menampilkan daftar CPPT nursing entries
     */
    public function index(Request $request)
    {
        try {
            $query = CpptNursingEntry::with(['pasien', 'registrasi', 'user']);

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
                'message' => 'Daftar CPPT nursing entries berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data CPPT nursing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan CPPT nursing entry baru
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'pasien_id' => 'required|integer|exists:patients,id',
                'registrasi_id' => 'nullable|integer|exists:registrations,id',
                'tanggal_waktu' => 'required|date',
                'shift' => 'required|in:pagi,siang,malam',
                'assessment' => 'nullable|array',
                'diagnosis' => 'nullable|array',
                'planning' => 'nullable|array',
                'intervention' => 'nullable|array',
                'evaluation' => 'nullable|array',
                'status' => 'required|in:draft,active,completed,reviewed'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            // For development/testing, use default user_id if not authenticated
            $data['user_id'] = Auth::id() ?? 1; // Set user yang sedang login atau default user untuk testing

            $cpptEntry = CpptNursingEntry::create($data);

            return response()->json([
                'success' => true,
                'data' => $cpptEntry->load(['pasien', 'registrasi', 'user']),
                'message' => 'CPPT nursing entry berhasil dibuat'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan CPPT nursing entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menampilkan detail CPPT nursing entry
     */
    public function show($id)
    {
        try {
            $cpptEntry = CpptNursingEntry::with(['pasien', 'registrasi', 'user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $cpptEntry,
                'message' => 'Detail CPPT nursing entry berhasil diambil'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'CPPT nursing entry tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil detail CPPT nursing entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengupdate CPPT nursing entry
     */
    public function update(Request $request, $id)
    {
        try {
            $cpptEntry = CpptNursingEntry::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'pasien_id' => 'sometimes|integer|exists:patients,id',
                'registrasi_id' => 'nullable|integer|exists:registrations,id',
                'tanggal_waktu' => 'sometimes|date',
                'shift' => 'sometimes|in:pagi,siang,malam',
                'assessment' => 'nullable|array',
                'diagnosis' => 'nullable|array',
                'planning' => 'nullable|array',
                'intervention' => 'nullable|array',
                'evaluation' => 'nullable|array',
                'status' => 'sometimes|in:draft,active,completed,reviewed'
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
                'message' => 'CPPT nursing entry berhasil diupdate'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'CPPT nursing entry tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengupdate CPPT nursing entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus CPPT nursing entry
     */
    public function destroy($id)
    {
        try {
            $cpptEntry = CpptNursingEntry::findOrFail($id);
            $cpptEntry->delete();

            return response()->json([
                'success' => true,
                'message' => 'CPPT nursing entry berhasil dihapus'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'CPPT nursing entry tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus CPPT nursing entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan CPPT nursing entries untuk pasien tertentu
     */
    public function getByPatient($patientId)
    {
        try {
            $cpptEntries = CpptNursingEntry::with(['pasien', 'registrasi', 'user'])
                ->where('pasien_id', $patientId)
                ->orderBy('tanggal_waktu', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $cpptEntries,
                'message' => 'CPPT nursing entries pasien berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil CPPT nursing entries pasien',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan CPPT nursing entries untuk registrasi tertentu
     */
    public function getByRegistration($registrationId)
    {
        try {
            $cpptEntries = CpptNursingEntry::with(['pasien', 'registrasi', 'user'])
                ->where('registrasi_id', $registrationId)
                ->orderBy('tanggal_waktu', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $cpptEntries,
                'message' => 'CPPT nursing entries registrasi berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil CPPT nursing entries registrasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik CPPT nursing
     */
    public function getStatistics(Request $request)
    {
        try {
            $query = CpptNursingEntry::query();

            // Filter berdasarkan tanggal jika ada
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            $totalEntries = $query->count();
            $draftEntries = (clone $query)->where('status', 'draft')->count();
            $activeEntries = (clone $query)->where('status', 'active')->count();
            $completedEntries = (clone $query)->where('status', 'completed')->count();
            $reviewedEntries = (clone $query)->where('status', 'reviewed')->count();

            $shiftStats = (clone $query)->selectRaw('shift, COUNT(*) as count')
                ->groupBy('shift')
                ->get()
                ->pluck('count', 'shift');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_entries' => $totalEntries,
                    'draft_entries' => $draftEntries,
                    'active_entries' => $activeEntries,
                    'completed_entries' => $completedEntries,
                    'reviewed_entries' => $reviewedEntries,
                    'shift_statistics' => $shiftStats
                ],
                'message' => 'Statistik CPPT nursing berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik CPPT nursing',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}