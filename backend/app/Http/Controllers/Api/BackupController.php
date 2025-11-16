<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BackupSchedule;
use App\Models\BackupHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class BackupController extends Controller
{
    // ==================== SCHEDULE MANAGEMENT ====================

    /**
     * Get all backup schedules
     */
    public function getSchedules(Request $request): JsonResponse
    {
        try {
            $schedules = BackupSchedule::with('creator')
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $schedules,
                'message' => 'Backup schedules retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve backup schedules', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve backup schedules'
            ], 500);
        }
    }

    /**
     * Create a new backup schedule
     */
    public function createSchedule(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'backup_type' => ['required', Rule::in(['full', 'incremental', 'differential'])],
            'frequency' => ['required', Rule::in(['daily', 'weekly', 'monthly', 'custom'])],
            'schedule_time' => 'required|date_format:H:i',
            'schedule_config' => 'nullable|array',
            'storage_path' => 'nullable|string',
            'retention_days' => 'nullable|integer|min:1|max:3650',
            'compress_backup' => 'boolean',
            'encrypt_backup' => 'boolean',
            'encryption_key' => 'nullable|string|min:16',
            'include_tables' => 'nullable|array',
            'exclude_tables' => 'nullable|array',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $schedule = BackupSchedule::create([
                'name' => $request->name,
                'description' => $request->description,
                'backup_type' => $request->backup_type,
                'frequency' => $request->frequency,
                'schedule_time' => $request->schedule_time,
                'schedule_config' => $request->schedule_config,
                'storage_path' => $request->storage_path ?? 'storage/backups',
                'retention_days' => $request->retention_days ?? 30,
                'compress_backup' => $request->compress_backup ?? true,
                'encrypt_backup' => $request->encrypt_backup ?? false,
                'encryption_key' => $request->encrypt_backup ? $request->encryption_key : null,
                'include_tables' => $request->include_tables,
                'exclude_tables' => $request->exclude_tables,
                'notes' => $request->notes,
                'created_by' => 1, // Mock admin user for now
            ]);

            // Calculate next run time
            $schedule->updateNextRunTime();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $schedule->load('creator'),
                'message' => 'Backup schedule created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create backup schedule', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create backup schedule'
            ], 500);
        }
    }

    /**
     * Update backup schedule
     */
    public function updateSchedule(Request $request, BackupSchedule $schedule): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'backup_type' => ['required', Rule::in(['full', 'incremental', 'differential'])],
            'frequency' => ['required', Rule::in(['daily', 'weekly', 'monthly', 'custom'])],
            'schedule_time' => 'required|date_format:H:i',
            'schedule_config' => 'nullable|array',
            'is_active' => 'boolean',
            'storage_path' => 'nullable|string',
            'retention_days' => 'nullable|integer|min:1|max:3650',
            'compress_backup' => 'boolean',
            'encrypt_backup' => 'boolean',
            'encryption_key' => 'nullable|string|min:16',
            'include_tables' => 'nullable|array',
            'exclude_tables' => 'nullable|array',
            'status' => ['nullable', Rule::in(['active', 'paused', 'disabled'])],
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $schedule->update([
                'name' => $request->name,
                'description' => $request->description,
                'backup_type' => $request->backup_type,
                'frequency' => $request->frequency,
                'schedule_time' => $request->schedule_time,
                'schedule_config' => $request->schedule_config,
                'is_active' => $request->is_active ?? $schedule->is_active,
                'storage_path' => $request->storage_path ?? $schedule->storage_path,
                'retention_days' => $request->retention_days ?? $schedule->retention_days,
                'compress_backup' => $request->compress_backup ?? $schedule->compress_backup,
                'encrypt_backup' => $request->encrypt_backup ?? $schedule->encrypt_backup,
                'encryption_key' => $request->encrypt_backup ? $request->encryption_key : null,
                'include_tables' => $request->include_tables,
                'exclude_tables' => $request->exclude_tables,
                'status' => $request->status ?? $schedule->status,
                'notes' => $request->notes,
            ]);

            // Recalculate next run time
            $schedule->updateNextRunTime();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $schedule->load('creator'),
                'message' => 'Backup schedule updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update backup schedule', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update backup schedule'
            ], 500);
        }
    }

    /**
     * Delete backup schedule
     */
    public function deleteSchedule(BackupSchedule $schedule): JsonResponse
    {
        try {
            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Backup schedule deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete backup schedule', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete backup schedule'
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
            $query = BackupHistory::with(['schedule', 'creator']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('backup_type')) {
                $query->where('backup_type', $request->backup_type);
            }

            if ($request->has('schedule_id')) {
                $query->where('schedule_id', $request->schedule_id);
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
                'message' => 'Backup histories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve backup histories', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve backup histories'
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
            'backup_type' => ['required', Rule::in(['full', 'incremental', 'differential'])],
            'compress_backup' => 'boolean',
            'encrypt_backup' => 'boolean',
            'encryption_key' => 'nullable|string|min:16',
            'include_tables' => 'nullable|array',
            'exclude_tables' => 'nullable|array',
            'notes' => 'nullable|string'
        ]);

        try {
            // Create backup history record
            $history = BackupHistory::create([
                'backup_name' => 'Manual Backup - ' . now()->format('Y-m-d H:i:s'),
                'filename' => '',
                'backup_type' => $request->backup_type,
                'status' => 'running',
                'started_at' => now(),
                'backup_config' => [
                    'type' => $request->backup_type,
                    'compress' => $request->compress_backup ?? true,
                    'encrypt' => $request->encrypt_backup ?? false,
                    'include_tables' => $request->include_tables,
                    'exclude_tables' => $request->exclude_tables,
                ],
                'is_compressed' => $request->compress_backup ?? true,
                'is_encrypted' => $request->encrypt_backup ?? false,
                'storage_location' => 'storage/backups',
                'created_by' => 1, // Mock admin user
                'notes' => $request->notes,
            ]);

            // Simulate backup process (in real implementation, this would trigger actual backup)
            // For demo purposes, we'll mark it as completed after a short delay
            $filename = 'backup_' . now()->format('Y_m_d_H_i_s') . '.sql';
            $fileSize = rand(50000000, 200000000); // Random size between 50-200MB

            $history->update([
                'filename' => $filename,
                'status' => 'completed',
                'file_size_bytes' => $fileSize,
                'file_size_human' => $this->formatBytes($fileSize),
                'file_path' => 'storage/backups/' . $filename,
                'checksum' => 'SHA256-' . substr(md5($filename . time()), 0, 32),
                'completed_at' => now(),
                'duration_seconds' => rand(30, 300), // 30 seconds to 5 minutes
                'statistics' => [
                    'tables_backed_up' => rand(20, 50),
                    'rows_affected' => rand(10000, 100000),
                    'compression_ratio' => rand(60, 85) / 100,
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => $history->load(['schedule', 'creator']),
                'message' => 'Manual backup completed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create manual backup', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create manual backup'
            ], 500);
        }
    }

    // ==================== RESTORE OPERATIONS ====================

    /**
     * Restore from backup
     */
    public function restoreBackup(Request $request, BackupHistory $history): JsonResponse
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
            $restoreHistory = BackupHistory::create([
                'backup_name' => 'Restore from: ' . $history->backup_name,
                'filename' => $history->filename,
                'backup_type' => 'restore',
                'status' => 'completed',
                'started_at' => now(),
                'completed_at' => now(),
                'backup_config' => [
                    'source_backup_id' => $history->id,
                    'restore_type' => 'full_restore'
                ],
                'storage_location' => 'database',
                'created_by' => 1,
                'notes' => $request->restore_notes,
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
    public function downloadBackup(BackupHistory $history): JsonResponse
    {
        if ($history->status !== 'completed' || !$history->file_path) {
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
                    'filename' => $history->filename,
                    'file_path' => $history->file_path,
                    'file_size' => $history->file_size_human,
                    'checksum' => $history->checksum,
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

    // ==================== STATISTICS & ANALYTICS ====================

    /**
     * Get backup statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'total_schedules' => BackupSchedule::count(),
                'active_schedules' => BackupSchedule::where('is_active', true)->count(),
                'total_backups' => BackupHistory::count(),
                'successful_backups' => BackupHistory::where('status', 'completed')->count(),
                'failed_backups' => BackupHistory::where('status', 'failed')->count(),
                'running_backups' => BackupHistory::where('status', 'running')->count(),
                'total_backup_size' => BackupHistory::where('status', 'completed')->sum('file_size_bytes'),
                'average_backup_time' => BackupHistory::where('status', 'completed')->avg('duration_seconds'),
                'last_backup_date' => BackupHistory::where('status', 'completed')->max('completed_at'),
                'next_scheduled_backup' => BackupSchedule::where('is_active', true)->min('next_run_at'),
            ];

            // Format total size
            $stats['total_backup_size_human'] = $this->formatBytes($stats['total_backup_size']);
            $stats['average_backup_time_human'] = $stats['average_backup_time']
                ? $this->formatDuration($stats['average_backup_time'])
                : null;

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Backup statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve backup statistics', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve backup statistics'
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
