<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Validation\Rule;
use Illuminate\Queue\FailedJobProviderInterface;

class ErrorMonitoringController extends Controller
{
    // ==================== SYSTEM LOGS ====================

    /**
     * Get system logs with filtering and pagination
     */
    public function getSystemLogs(Request $request): JsonResponse
    {
        try {
            $query = SystemLog::with(['user', 'resolver']);

            // Apply filters
            if ($request->has('level') && $request->level !== 'all') {
                $query->where('level', $request->level);
            }

            if ($request->has('channel') && $request->channel !== 'all') {
                $query->where('channel', $request->channel);
            }

            if ($request->has('resolved') && $request->resolved !== 'all') {
                $query->where('resolved', $request->resolved === 'true');
            }

            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('date_from')) {
                $query->where('logged_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('logged_at', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('message', 'like', "%{$search}%")
                      ->orWhere('file', 'like', "%{$search}%")
                      ->orWhere('class', 'like', "%{$search}%")
                      ->orWhere('function', 'like', "%{$search}%");
                });
            }

            $logs = $query->orderBy('logged_at', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $logs,
                'message' => 'System logs retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve system logs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve system logs'
            ], 500);
        }
    }

    /**
     * Get a specific system log
     */
    public function getSystemLog(SystemLog $log): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $log->load(['user', 'resolver']),
                'message' => 'System log retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve system log', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve system log'
            ], 500);
        }
    }

    /**
     * Mark a system log as resolved
     */
    public function resolveSystemLog(Request $request, SystemLog $log): JsonResponse
    {
        $request->validate([
            'resolution_notes' => 'nullable|string|max:1000'
        ]);

        try {
            $log->markAsResolved(
                auth()->id(),
                $request->resolution_notes
            );

            return response()->json([
                'success' => true,
                'data' => $log->load('resolver'),
                'message' => 'System log marked as resolved'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to resolve system log', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve system log'
            ], 500);
        }
    }

    /**
     * Bulk resolve system logs
     */
    public function bulkResolveSystemLogs(Request $request): JsonResponse
    {
        $request->validate([
            'log_ids' => 'required|array',
            'log_ids.*' => 'integer|exists:system_logs,id',
            'resolution_notes' => 'nullable|string|max:1000'
        ]);

        try {
            DB::beginTransaction();

            SystemLog::whereIn('id', $request->log_ids)
                ->update([
                    'resolved' => true,
                    'resolved_at' => now(),
                    'resolved_by' => auth()->id(),
                    'resolution_notes' => $request->resolution_notes,
                    'updated_at' => now()
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($request->log_ids) . ' system logs marked as resolved'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk resolve system logs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk resolve system logs'
            ], 500);
        }
    }

    /**
     * Delete old system logs
     */
    public function cleanupSystemLogs(Request $request): JsonResponse
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:365',
            'resolved_only' => 'boolean'
        ]);

        try {
            $query = SystemLog::where('logged_at', '<', now()->subDays($request->days));

            if ($request->resolved_only) {
                $query->where('resolved', true);
            }

            $deletedCount = $query->delete();

            return response()->json([
                'success' => true,
                'data' => ['deleted_count' => $deletedCount],
                'message' => "{$deletedCount} system logs deleted successfully"
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cleanup system logs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to cleanup system logs'
            ], 500);
        }
    }

    /**
     * Export system logs
     */
    public function exportSystemLogs(Request $request): JsonResponse
    {
        $request->validate([
            'format' => ['required', Rule::in(['json', 'csv', 'txt'])],
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'level' => 'nullable|string',
            'resolved' => 'nullable|boolean'
        ]);

        try {
            $query = SystemLog::query();

            if ($request->date_from) {
                $query->where('logged_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->where('logged_at', '<=', $request->date_to);
            }

            if ($request->level) {
                $query->where('level', $request->level);
            }

            if ($request->has('resolved')) {
                $query->where('resolved', $request->resolved);
            }

            $logs = $query->orderBy('logged_at', 'desc')->get();

            $filename = 'system_logs_' . now()->format('Y_m_d_H_i_s');

            switch ($request->format) {
                case 'json':
                    $content = $logs->toJson(JSON_PRETTY_PRINT);
                    $filename .= '.json';
                    break;

                case 'csv':
                    $content = $this->convertToCsv($logs);
                    $filename .= '.csv';
                    break;

                case 'txt':
                    $content = $this->convertToTxt($logs);
                    $filename .= '.txt';
                    break;
            }

            Storage::put("exports/{$filename}", $content);

            return response()->json([
                'success' => true,
                'data' => [
                    'filename' => $filename,
                    'download_url' => "/api/error-monitoring/download/{$filename}"
                ],
                'message' => 'System logs exported successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to export system logs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to export system logs'
            ], 500);
        }
    }

    // ==================== FAILED JOBS ====================

    /**
     * Get failed jobs
     */
    public function getFailedJobs(Request $request): JsonResponse
    {
        try {
            $failedJobs = DB::table('failed_jobs')
                ->orderBy('failed_at', 'desc')
                ->paginate(20);

            // Decode payload for each job
            $jobs = $failedJobs->getCollection()->map(function ($job) {
                $payload = json_decode($job->payload, true);
                return [
                    'id' => $job->id,
                    'uuid' => $job->uuid,
                    'connection' => $job->connection,
                    'queue' => $job->queue,
                    'payload' => $payload,
                    'exception' => $job->exception,
                    'failed_at' => $job->failed_at,
                    'job_class' => $payload['displayName'] ?? 'Unknown',
                    'job_data' => $payload['data'] ?? [],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $jobs,
                    'current_page' => $failedJobs->currentPage(),
                    'last_page' => $failedJobs->lastPage(),
                    'per_page' => $failedJobs->perPage(),
                    'total' => $failedJobs->total(),
                ],
                'message' => 'Failed jobs retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve failed jobs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve failed jobs'
            ], 500);
        }
    }

    /**
     * Retry a failed job
     */
    public function retryFailedJob(Request $request, $jobId): JsonResponse
    {
        try {
            $failedJob = DB::table('failed_jobs')->where('id', $jobId)->first();

            if (!$failedJob) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed job not found'
                ], 404);
            }

            // Move job back to queue
            DB::table('jobs')->insert([
                'queue' => $failedJob->queue,
                'payload' => $failedJob->payload,
                'attempts' => 0,
                'reserved_at' => null,
                'available_at' => now()->timestamp,
                'created_at' => now()->timestamp,
            ]);

            // Remove from failed jobs
            DB::table('failed_jobs')->where('id', $jobId)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Failed job queued for retry'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retry failed job', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retry failed job'
            ], 500);
        }
    }

    /**
     * Delete a failed job
     */
    public function deleteFailedJob($jobId): JsonResponse
    {
        try {
            $deleted = DB::table('failed_jobs')->where('id', $jobId)->delete();

            if ($deleted === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed job not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Failed job deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete failed job', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete failed job'
            ], 500);
        }
    }

    /**
     * Bulk delete failed jobs
     */
    public function bulkDeleteFailedJobs(Request $request): JsonResponse
    {
        $request->validate([
            'job_ids' => 'required|array',
            'job_ids.*' => 'integer'
        ]);

        try {
            $deletedCount = DB::table('failed_jobs')
                ->whereIn('id', $request->job_ids)
                ->delete();

            return response()->json([
                'success' => true,
                'data' => ['deleted_count' => $deletedCount],
                'message' => "{$deletedCount} failed jobs deleted successfully"
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to bulk delete failed jobs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk delete failed jobs'
            ], 500);
        }
    }

    /**
     * Clear all failed jobs
     */
    public function clearFailedJobs(): JsonResponse
    {
        try {
            $deletedCount = DB::table('failed_jobs')->delete();

            return response()->json([
                'success' => true,
                'data' => ['deleted_count' => $deletedCount],
                'message' => "All {$deletedCount} failed jobs cleared successfully"
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to clear failed jobs', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear failed jobs'
            ], 500);
        }
    }

    // ==================== STATISTICS & ANALYTICS ====================

    /**
     * Get error monitoring statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'system_logs' => [
                    'total' => SystemLog::count(),
                    'today' => SystemLog::today()->count(),
                    'unresolved' => SystemLog::unresolved()->count(),
                    'by_level' => [
                        'emergency' => SystemLog::byLevel('emergency')->count(),
                        'alert' => SystemLog::byLevel('alert')->count(),
                        'critical' => SystemLog::byLevel('critical')->count(),
                        'error' => SystemLog::byLevel('error')->count(),
                        'warning' => SystemLog::byLevel('warning')->count(),
                        'notice' => SystemLog::byLevel('notice')->count(),
                        'info' => SystemLog::byLevel('info')->count(),
                        'debug' => SystemLog::byLevel('debug')->count(),
                    ]
                ],
                'failed_jobs' => [
                    'total' => DB::table('failed_jobs')->count(),
                    'today' => DB::table('failed_jobs')->whereDate('failed_at', today())->count(),
                    'by_queue' => DB::table('failed_jobs')
                        ->select('queue', DB::raw('count(*) as count'))
                        ->groupBy('queue')
                        ->get()
                        ->pluck('count', 'queue')
                        ->toArray()
                ],
                'recent_activity' => [
                    'latest_logs' => SystemLog::with('user')->latest('logged_at')->limit(5)->get(),
                    'latest_failed_jobs' => DB::table('failed_jobs')->latest('failed_at')->limit(5)->get()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Error monitoring statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve error monitoring statistics', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve error monitoring statistics'
            ], 500);
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Convert logs to CSV format
     */
    private function convertToCsv($logs): string
    {
        $csv = "ID,Level,Message,Channel,File,Line,User,IP,Logged At,Resolved\n";

        foreach ($logs as $log) {
            $csv .= sprintf(
                "%d,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $log->id,
                $log->level,
                '"' . str_replace('"', '""', $log->message) . '"',
                $log->channel,
                $log->file ?? '',
                $log->line ?? '',
                $log->user->name ?? '',
                $log->ip_address ?? '',
                $log->logged_at,
                $log->resolved ? 'Yes' : 'No'
            );
        }

        return $csv;
    }

    /**
     * Convert logs to TXT format
     */
    private function convertToTxt($logs): string
    {
        $txt = "SYSTEM LOGS EXPORT\n";
        $txt .= "Generated: " . now()->toDateTimeString() . "\n";
        $txt .= str_repeat("=", 80) . "\n\n";

        foreach ($logs as $log) {
            $txt .= sprintf(
                "[%s] %s: %s\nChannel: %s\nFile: %s:%s\nUser: %s\nIP: %s\nResolved: %s\n\n",
                $log->logged_at,
                strtoupper($log->level),
                $log->message,
                $log->channel,
                $log->file ?? 'N/A',
                $log->line ?? 'N/A',
                $log->user->name ?? 'N/A',
                $log->ip_address ?? 'N/A',
                $log->resolved ? 'Yes' : 'No'
            );
        }

        return $txt;
    }
}
