<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuditLogsController extends Controller
{
    /**
     * Get audit logs with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = AuditLog::query();

            // Apply filters
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('action') && $request->action) {
                $query->where('action', $request->action);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = trim($request->search);
                $query->where(function($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('resource', 'like', "%{$search}%")
                      ->orWhere('user_name', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');

            if (in_array($sortBy, ['created_at', 'user_name', 'action'])) {
                $query->orderBy($sortBy, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Pagination (50 items per page as per spec)
            $perPage = 50;
            $logs = $query->paginate($perPage);

            // Transform data for frontend
            $transformedLogs = $logs->getCollection()->map(function($log) {
                return [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'action' => $log->action,
                    'resource' => $log->resource,
                    'resource_id' => $log->resource_id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'payload' => $log->payload,
                    'created_at' => $log->created_at,
                    'timestamp_formatted' => $log->created_at->format('d/m/Y H:i:s') . ' WIB',
                    'user_name' => $log->user_name ?? 'System'
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $transformedLogs,
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching audit logs', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil audit logs'
            ], 500);
        }
    }

    /**
     * Get audit log details
     */
    public function show($id): JsonResponse
    {
        try {
            $log = AuditLog::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'action' => $log->action,
                    'resource' => $log->resource,
                    'resource_id' => $log->resource_id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'payload' => $log->payload,
                    'created_at' => $log->created_at,
                    'timestamp_formatted' => $log->created_at->format('d/m/Y H:i:s') . ' WIB',
                    'user_name' => $log->user_name ?? 'System'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Audit log tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Delete old audit logs
     */
    public function cleanup(Request $request): JsonResponse
    {
        $request->validate([
            'days' => 'required|integer|min=1|max=365'
        ]);

        try {
            $cutoffDate = Carbon::now()->subDays($request->days);
            $deletedCount = AuditLog::where('created_at', '<', $cutoffDate)->delete();

            // Log the cleanup action
            AuditLog::create([
                'user_name' => auth()->user()->name ?? 'System',
                'action' => 'Audit Log Cleanup',
                'resource' => 'audit_logs',
                'resource_id' => null,
                'description' => "Deleted {$deletedCount} audit logs older than {$request->days} days",
                'level' => 'info',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'payload' => json_encode(['days' => $request->days, 'deleted_count' => $deletedCount])
            ]);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menghapus {$deletedCount} audit logs yang lebih lama dari {$request->days} hari",
                'data' => [
                    'deleted_count' => $deletedCount
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting old audit logs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus audit logs lama'
            ], 500);
        }
    }

    /**
     * Export audit logs
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'format' => 'required|in:excel,pdf',
            'user_id' => 'nullable|integer',
            'action' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date'
        ]);

        try {
            $query = AuditLog::query();

            // Apply filters
            if ($request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->action) {
                $query->where('action', $request->action);
            }

            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            $format = $request->input('format');
            if ($format === 'excel') {
                // Generate CSV content (Excel compatible)
                $csvContent = "ID,Timestamp,User,Action,Resource,Resource ID,IP Address\n";

                foreach ($logs as $log) {
                    $csvContent .= sprintf(
                        "%d,%s,%s,%s,%s,%s,%s\n",
                        $log->id,
                        $log->created_at->format('Y-m-d H:i:s'),
                        '"' . str_replace('"', '""', $log->user_name ?? 'System') . '"',
                        '"' . str_replace('"', '""', $log->action) . '"',
                        '"' . str_replace('"', '""', $log->resource ?? '') . '"',
                        $log->resource_id ?? '',
                        $log->ip_address ?? ''
                    );
                }

                return response()->json([
                    'success' => true,
                    'data' => [
                        'content' => base64_encode($csvContent),
                        'filename' => 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.csv',
                        'mime_type' => 'text/csv'
                    ]
                ]);
            } else {
                // For PDF, we'll return JSON and let frontend handle PDF generation
                // This is a simplified approach - in production you'd use a PDF library
                $exportData = $logs->map(function($log) {
                    return [
                        'id' => $log->id,
                        'timestamp' => $log->created_at->format('d/m/Y H:i:s') . ' WIB',
                        'user' => $log->user_name ?? 'System',
                        'action' => $log->action,
                        'resource' => $log->resource,
                        'resource_id' => $log->resource_id,
                        'ip_address' => $log->ip_address,
                        'payload' => $log->payload
                    ];
                });

                return response()->json([
                    'success' => true,
                    'data' => [
                        'content' => base64_encode($exportData->toJson(JSON_PRETTY_PRINT)),
                        'filename' => 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.json',
                        'mime_type' => 'application/json'
                    ]
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error exporting audit logs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor audit logs'
            ], 500);
        }
    }

    /**
     * Get combined initial data for audit logs page (HIGH PERFORMANCE)
     */
    public function initialData(Request $request): JsonResponse
    {
        try {
            // Get all data in parallel for maximum performance
            $logs = $this->getLogsData($request);
            $stats = $this->getStatsData();
            $filters = $this->getFiltersData();

            return response()->json([
                'success' => true,
                'data' => [
                    'logs' => $logs,
                    'stats' => $stats,
                    'filters' => $filters
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting audit logs initial data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data audit logs'
            ], 500);
        }
    }

    /**
     * Get optimized logs data
     */
    private function getLogsData(Request $request)
    {
        $query = AuditLog::query();

        // Apply filters
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search functionality - optimized
        if ($request->has('search') && $request->search) {
            $search = trim($request->search);
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('resource', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "{$search}%"); // Prefix search for better performance
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        if (in_array($sortBy, ['created_at', 'user_name', 'action'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Pagination (50 items per page as per spec)
        $perPage = 50;
        $logs = $query->paginate($perPage);

        // Transform data efficiently
        $transformedLogs = $logs->getCollection()->map(function($log) {
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'action' => $log->action,
                'resource' => $log->resource,
                'resource_id' => $log->resource_id,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'payload' => $log->payload,
                'created_at' => $log->created_at,
                'timestamp_formatted' => $log->created_at->format('d/m/Y H:i:s') . ' WIB',
                'user_name' => $log->user_name ?? 'System'
            ];
        });

        return [
            'data' => $transformedLogs,
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'per_page' => $logs->perPage(),
            'total' => $logs->total()
        ];
    }

    /**
     * Get optimized stats data with single query
     */
    private function getStatsData()
    {
        $cacheKey = 'audit_logs_stats_optimized';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Single optimized query for all stats
        $statsQuery = DB::select("
            SELECT
                COUNT(*) as total_logs,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_logs,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as week_logs,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) as month_logs
            FROM audit_logs
        ")[0];

        // Get action stats
        $actionStats = DB::select("
            SELECT action, COUNT(*) as count
            FROM audit_logs
            GROUP BY action
            ORDER BY count DESC
            LIMIT 10
        ");

        // Get resource stats
        $resourceStats = DB::select("
            SELECT resource, COUNT(*) as count
            FROM audit_logs
            WHERE resource IS NOT NULL
            GROUP BY resource
            ORDER BY count DESC
            LIMIT 10
        ");

        // Get recent users
        $recentUsers = DB::select("
            SELECT DISTINCT user_name
            FROM audit_logs
            WHERE user_name IS NOT NULL AND user_name != 'System'
            ORDER BY created_at DESC
            LIMIT 10
        ");

        $stats = [
            'total_logs' => (int) $statsQuery->total_logs,
            'today_logs' => (int) $statsQuery->today_logs,
            'week_logs' => (int) $statsQuery->week_logs,
            'month_logs' => (int) $statsQuery->month_logs,
            'by_action' => collect($actionStats)->mapWithKeys(fn($item) => [ucfirst($item->action) => (int)$item->count])->toArray(),
            'by_resource' => collect($resourceStats)->mapWithKeys(fn($item) => [ucfirst($item->resource) => (int)$item->count])->toArray(),
            'recent_users' => collect($recentUsers)->pluck('user_name')->values()->toArray()
        ];

        Cache::put($cacheKey, $stats, now()->addMinutes(5));
        return $stats;
    }

    /**
     * Get cached filters data
     */
    private function getFiltersData()
    {
        $cacheKey = 'audit_logs_filters';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $filters = [
            'users' => DB::select("
                SELECT DISTINCT user_id, user_name
                FROM audit_logs
                WHERE user_name IS NOT NULL AND user_name != 'System'
                ORDER BY user_name
            "),
            'actions' => DB::select("
                SELECT DISTINCT action
                FROM audit_logs
                ORDER BY action
            "),
            'resources' => DB::select("
                SELECT DISTINCT resource
                FROM audit_logs
                WHERE resource IS NOT NULL
                ORDER BY resource
            ")
        ];

        // Transform data
        $filters['users'] = collect($filters['users'])->map(fn($user) => [
            'value' => (int)$user->user_id,
            'label' => $user->user_name
        ])->toArray();

        $filters['actions'] = collect($filters['actions'])->map(fn($action) => [
            'value' => $action->action,
            'label' => ucfirst($action->action)
        ])->toArray();

        $filters['resources'] = collect($filters['resources'])->map(fn($resource) => [
            'value' => $resource->resource,
            'label' => ucfirst($resource->resource)
        ])->toArray();

        Cache::put($cacheKey, $filters, now()->addMinutes(10)); // Cache longer for filters
        return $filters;
    }

    /**
     * Get audit statistics (legacy - kept for compatibility)
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->getStatsData();

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting audit logs statistics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik audit logs'
            ], 500);
        }
    }

    /**
     * Get unique users for filter dropdown
     */
    public function getUsers(): JsonResponse
    {
        try {
            $users = AuditLog::select('user_id', 'user_name')
                ->whereNotNull('user_name')
                ->where('user_name', '!=', 'System')
                ->distinct()
                ->orderBy('user_name')
                ->get()
                ->map(function($item) {
                    return [
                        'value' => $item->user_id,
                        'label' => $item->user_name
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar user'
            ], 500);
        }
    }

    /**
     * Get unique actions for filter dropdown
     */
    public function getActions(): JsonResponse
    {
        try {
            $actions = AuditLog::select('action')
                ->distinct()
                ->orderBy('action')
                ->get()
                ->pluck('action')
                ->map(function($action) {
                    return [
                        'value' => $action,
                        'label' => ucfirst($action)
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $actions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar action'
            ], 500);
        }
    }

    /**
     * Get unique resources for filter dropdown
     */
    public function getResources(): JsonResponse
    {
        try {
            $resources = AuditLog::select('resource')
                ->whereNotNull('resource')
                ->distinct()
                ->orderBy('resource')
                ->get()
                ->pluck('resource')
                ->map(function($resource) {
                    return [
                        'value' => $resource,
                        'label' => ucfirst($resource)
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $resources
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar resource'
            ], 500);
        }
    }

}