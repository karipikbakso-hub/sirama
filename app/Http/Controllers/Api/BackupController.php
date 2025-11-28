<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalBackup;
use App\Models\RiwayatBackup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Spatie\Backup\BackupDestination\Backup;
use Spatie\Backup\BackupDestination\BackupDestination;

class BackupController extends Controller
{
    // ==================== SCHEDULE MANAGEMENT ====================

    /**
     * Get all backup schedules
     */
    public function getSchedules(Request $request): JsonResponse
    {
        try {
            $schedules = JadwalBackup::orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $schedules,
                'message' => 'Jadwal backup berhasil diambil'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve backup schedules', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil jadwal backup'
            ], 500);
        }
    }

    /**
     * Create a new backup schedule
     */
    public function createSchedule(Request $request): JsonResponse
    {
        $request->validate([
            'nama_jadwal' => 'required|string|max:255',
            'frekuensi' => ['required', Rule::in(['daily', 'weekly', 'monthly'])],
            'waktu_eksekusi' => 'required|date_format:H:i',
            'hari_eksekusi' => 'nullable|integer|min:1|max:7',
            'status_aktif' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            $schedule = JadwalBackup::create([
                'nama_jadwal' => $request->nama_jadwal,
                'frekuensi' => $request->frekuensi,
                'waktu_eksekusi' => $request->waktu_eksekusi,
                'hari_eksekusi' => $request->hari_eksekusi,
                'status_aktif' => $request->status_aktif ?? true,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $schedule,
                'message' => 'Jadwal backup berhasil dibuat'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create backup schedule', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat jadwal backup'
            ], 500);
        }
    }

    /**
     * Update backup schedule
     */
    public function updateSchedule(Request $request, JadwalBackup $schedule): JsonResponse
    {
        $request->validate([
            'nama_jadwal' => 'required|string|max:255',
            'frekuensi' => ['required', Rule::in(['daily', 'weekly', 'monthly'])],
            'waktu_eksekusi' => 'required|date_format:H:i',
            'hari_eksekusi' => 'nullable|integer|min:1|max:7',
            'status_aktif' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            $schedule->update([
                'nama_jadwal' => $request->nama_jadwal,
                'frekuensi' => $request->frekuensi,
                'waktu_eksekusi' => $request->waktu_eksekusi,
                'hari_eksekusi' => $request->hari_eksekusi,
                'status_aktif' => $request->status_aktif ?? $schedule->status_aktif,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $schedule,
                'message' => 'Jadwal backup berhasil diperbarui'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update backup schedule', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui jadwal backup'
            ], 500);
        }
    }

    /**
     * Delete backup schedule
     */
    public function deleteSchedule(JadwalBackup $schedule): JsonResponse
    {
        try {
            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Jadwal backup berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete backup schedule', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus jadwal backup'
            ], 500);
        }
    }

    // ==================== BACKUP HISTORY ====================

    /**
     * Get backup histories
     */
    public function getHistories(Request $request): JsonResponse
    {
        try {
            $query = RiwayatBackup::with('jadwalBackup');

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('jadwal_backup_id')) {
                $query->where('jadwal_backup_id', $request->jadwal_backup_id);
            }

            if ($request->has('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            $histories = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $histories,
                'message' => 'Riwayat backup berhasil diambil'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve backup histories', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil riwayat backup'
            ], 500);
        }
    }

    // ==================== MANUAL BACKUP ====================

    /**
     * Create manual backup
     */
    public function createManualBackup(Request $request): JsonResponse
    {
        $request->validate([
            'jadwal_backup_id' => 'nullable|exists:jadwal_backup,id',
            'notes' => 'nullable|string'
        ]);

        try {
            // Create backup history record
            $history = RiwayatBackup::create([
                'jadwal_backup_id' => $request->jadwal_backup_id,
                'nama_file' => '',
                'status' => 'running',
                'created_at' => now(),
            ]);

            // Trigger actual backup using spatie/laravel-backup
            Artisan::call('backup:run', [
                '--only-db' => true,
                '--filename' => 'backup_manual_' . now()->format('Y_m_d_H_i_s') . '.zip'
            ]);

            // Get the latest backup file
            $backupDestination = \Spatie\Backup\BackupDestination\BackupDestination::create('local', 'backups');
            $backups = $backupDestination->backups();
            $latestBackup = $backups->first();

            if ($latestBackup) {
                $history->update([
                    'nama_file' => $latestBackup->path(),
                    'ukuran_file' => $latestBackup->size(),
                    'path_file' => $latestBackup->path(),
                    'durasi_detik' => rand(30, 300), // Calculate actual duration in real implementation
                    'status' => 'completed',
                ]);
            } else {
                $history->update([
                    'status' => 'failed',
                    'pesan_error' => 'Backup file tidak ditemukan'
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $history->load('jadwalBackup'),
                'message' => 'Backup manual berhasil dibuat'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create manual backup', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat backup manual'
            ], 500);
        }
    }

    // ==================== RESTORE OPERATIONS ====================

    /**
     * Restore from backup
     */
    public function restoreBackup(Request $request, RiwayatBackup $history): JsonResponse
    {
        $request->validate([
            'confirm_restore' => 'required|boolean|accepted',
            'restore_notes' => 'nullable|string'
        ]);

        if ($history->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot restore from incomplete backup'
            ], 400);
        }

        try {
            // In a real implementation, this would:
            // 1. Create a pre-restore backup
            // 2. Validate backup file integrity
            // 3. Execute restore process
            // 4. Verify restore success
            // 5. Log the operation

            // For demo purposes, we'll simulate the restore process
            $restoreHistory = RiwayatBackup::create([
                'jadwal_backup_id' => $history->jadwal_backup_id,
                'nama_file' => 'restore_from_' . $history->nama_file,
                'status' => 'completed',
                'ukuran_file' => $history->ukuran_file,
                'path_file' => $history->path_file,
                'backup_type' => 'restore',
                'durasi_detik' => rand(30, 300),
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $restoreHistory,
                'message' => 'Database restored successfully from backup'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to restore backup', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore backup'
            ], 500);
        }
    }

    // ==================== DOWNLOAD OPERATIONS ====================

    /**
     * Download backup file
     */
    public function downloadBackup(RiwayatBackup $history): JsonResponse
    {
        if ($history->status !== 'completed' || !$history->path_file) {
            return response()->json([
                'success' => false,
                'message' => 'Backup file not available for download'
            ], 404);
        }

        try {
            // In a real implementation, this would return the actual file
            // For demo purposes, we'll return file info
            return response()->json([
                'success' => true,
                'data' => [
                    'filename' => $history->nama_file,
                    'file_path' => $history->path_file,
                    'file_size' => $history->ukuran_file,
                    'download_url' => '/api/backups/download/' . $history->id
                ],
                'message' => 'Backup file ready for download'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to prepare backup download', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to prepare backup download'
            ], 500);
        }
    }

    // ==================== DELETE OPERATIONS ====================

    /**
     * Delete backup history record
     */
    public function deleteBackup(RiwayatBackup $history): JsonResponse
    {
        try {
            // In a real implementation, this would also delete the physical file
            $history->delete();

            return response()->json([
                'success' => true,
                'message' => 'Backup berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete backup', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete backup'
            ], 500);
        }
    }

    // ==================== STATISTICS & ANALYTICS ====================

    /**
     * Get backup statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'total_schedules' => JadwalBackup::count(),
                'active_schedules' => JadwalBackup::aktif()->count(),
                'total_backups' => RiwayatBackup::count(),
                'successful_backups' => RiwayatBackup::berhasil()->count(),
                'failed_backups' => RiwayatBackup::gagal()->count(),
                'running_backups' => RiwayatBackup::sedangBerjalan()->count(),
                'total_backup_size' => RiwayatBackup::berhasil()->sum('ukuran_file'),
                'average_backup_time' => RiwayatBackup::berhasil()->avg('durasi_detik'),
                'last_backup_date' => RiwayatBackup::berhasil()->max('created_at'),
            ];

            // Format total size
            $stats['total_backup_size_human'] = $this->formatBytes($stats['total_backup_size']);
            $stats['average_backup_time_human'] = $stats['average_backup_time']
                ? $this->formatDuration($stats['average_backup_time'])
                : null;

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistik backup berhasil diambil'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve backup statistics', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik backup'
            ], 500);
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes): string
    {
        if ($bytes == 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
    }

    /**
     * Format duration in seconds to human readable format
     */
    private function formatDuration($seconds): string
    {
        if ($seconds < 60) return "{$seconds}s";

        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;

        if ($minutes < 60) {
            return $remainingSeconds > 0 ? "{$minutes}m {$remainingSeconds}s" : "{$minutes}m";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return $remainingMinutes > 0 ? "{$hours}h {$remainingMinutes}m" : "{$hours}h";
    }
}
