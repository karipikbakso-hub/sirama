<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AuditController extends Controller
{
    /**
     * Get audit logs with pagination and filtering (max 100 per page, date range limit)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = AuditLog::query();

            // Enforce date range limit (max 30 days for performance)
            if ($request->has('date_from') && $request->has('date_to')) {
                $dateFrom = Carbon::parse($request->date_from);
                $dateTo = Carbon::parse($request->date_to);
                $daysDiff = $dateFrom->diffInDays($dateTo);

                if ($daysDiff > 30) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Date range cannot exceed 30 days for performance reasons'
                    ], 400);
                }

                $query->whereDate('created_at', '>=', $dateFrom)
                      ->whereDate('created_at', '<=', $dateTo);
            } elseif ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            } elseif ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Apply filters
            if ($request->has('search') && $request->search) {
                $search = trim($request->search);
                $query->where(function($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('user_name', 'like', "%{$search}%");
                });
            }

            if ($request->has('module') && $request->module !== 'all') {
                $query->where('resource_type', $request->module);
            }

            if ($request->has('user') && $request->user !== 'all') {
                $query->where('user_name', $request->user);
            }

            if ($request->has('ip_address') && $request->ip_address) {
                $query->where('ip_address', 'like', "%{$request->ip_address}%");
            }

            // Order by latest first (use index)
            $query->orderBy('created_at', 'desc');

            // Pagination (max 100 per page for performance)
            $perPage = min($request->get('per_page', 20), 100);
            $logs = $query->paginate($perPage);

            // Transform data for frontend
            $transformedLogs = $logs->getCollection()->map(function($log) {
                return [
                    'id' => $log->id,
                    'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                    'action' => $log->action,
                    'user' => $log->getUserName(),
                    'details' => $log->description ?? '',
                    'ipAddress' => $log->ip_address ?? '',
                    'status' => $log->status, // This uses the getStatusAttribute from model
                    'module' => $log->getModuleName(),
                    'old_values' => $this->maskSensitiveData($log->old_values),
                    'new_values' => $this->maskSensitiveData($log->new_values),
                    'user_agent' => $log->user_agent
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
            $log = AuditLog::with('user:id,name')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                    'action' => $log->action,
                    'user' => $log->getUserName(),
                    'details' => $log->description ?? '',
                    'ipAddress' => $log->ip_address ?? '',
                    'status' => $log->status,
                    'module' => $log->getModuleName(),
                    'old_values' => $this->maskSensitiveData($log->old_values),
                    'new_values' => $this->maskSensitiveData($log->new_values),
                    'user_agent' => $log->user_agent,
                    'created_at' => $log->created_at,
                    'updated_at' => $log->updated_at
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
    public function deleteOldLogs(Request $request): JsonResponse
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
                'resource_type' => 'audit_log',
                'description' => "Deleted {$deletedCount} audit logs older than {$request->days} days",
                'level' => 'info',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
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
     * Get audit statistics (cached in Redis if available)
     */
    public function getStatistics(): JsonResponse
    {
        try {
            // Use cache if available
            $cacheKey = 'audit_stats';

            if (Cache::has($cacheKey)) {
                $stats = Cache::get($cacheKey);
            } else {
                $stats = [
                    'total_logs' => AuditLog::count(),
                    'today_logs' => AuditLog::whereDate('created_at', today())->count(),
                    'week_logs' => AuditLog::where('created_at', '>=', now()->startOfWeek())->count(),
                    'month_logs' => AuditLog::where('created_at', '>=', now()->startOfMonth())->count(),
                    'by_level' => AuditLog::selectRaw('level, COUNT(*) as count')
                        ->groupBy('level')
                        ->orderBy('count', 'desc')
                        ->limit(10)
                        ->get()
                        ->mapWithKeys(function($item) {
                            return [ucfirst($item->level) => $item->count];
                        }),
                    'by_module' => AuditLog::selectRaw('resource_type, COUNT(*) as count')
                        ->groupBy('resource_type')
                        ->orderBy('count', 'desc')
                        ->get()
                        ->mapWithKeys(function($item) {
                            $moduleLabel = AuditLog::getModuleLabel($item->resource_type);
                            return [$moduleLabel => $item->count];
                        }),
                    'recent_users' => AuditLog::select('user_name')
                        ->whereNotNull('user_name')
                        ->where('user_name', '!=', 'System')
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->unique('user_name')
                        ->take(10)
                        ->pluck('user_name')
                        ->values()
                        ->toArray()
                ];

                Cache::put($cacheKey, $stats, now()->addMinutes(5)); // Cache for 5 minutes
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting audit statistics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik audit'
            ], 500);
        }
    }

    /**
     * Get unique users for filter dropdown
     */
    public function getUsers(): JsonResponse
    {
        try {
            $users = AuditLog::select('user_name')
                ->whereNotNull('user_name')
                ->where('user_name', '!=', 'System')
                ->distinct()
                ->orderBy('user_name')
                ->get()
                ->pluck('user_name')
                ->toArray();

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
     * Get unique modules for filter dropdown
     */
    public function getModules(): JsonResponse
    {
        try {
            $modules = AuditLog::select('resource_type')
                ->distinct()
                ->orderBy('resource_type')
                ->get()
                ->map(function($item) {
                    $resourceType = $item->resource_type;
                    return [
                        'value' => $resourceType,
                        'label' => AuditLog::getModuleLabel($resourceType)
                    ];
                })
                ->unique('label')
                ->values();

            return response()->json([
                'success' => true,
                'data' => $modules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar modul'
            ], 500);
        }
    }

    /**
     * Export audit logs
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'format' => 'required|in:csv,json',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'module' => 'nullable|string'
        ]);

        try {
            $format = $request->input('format');
            $query = AuditLog::query();

            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->module) {
                $query->where('resource_type', $request->module);
            }

            // Enforce max 30 days for export
            if ($request->date_from && $request->date_to) {
                $dateFrom = Carbon::parse($request->date_from);
                $dateTo = Carbon::parse($request->date_to);
                if ($dateFrom->diffInDays($dateTo) > 30) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Export limited to maximum 30 days range'
                    ], 400);
                }
            } elseif (!$request->date_from && !$request->date_to) {
                // Default to last 30 days if no date range
                $query->where('created_at', '>=', now()->subDays(30));
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            if ($format === 'csv') {
                // Generate CSV content
                $csvContent = "ID,Timestamp,Action,User,Module,Status,Description,IP Address\n";

                foreach ($logs as $log) {
                    $csvContent .= sprintf(
                        "%d,%s,%s,%s,%s,%s,%s,%s\n",
                        $log->id,
                        $log->created_at->format('Y-m-d H:i:s'),
                        '"' . str_replace('"', '""', $log->action) . '"',
                        '"' . str_replace('"', '""', $log->getUserName()) . '"',
                        '"' . str_replace('"', '""', $log->getModuleName()) . '"',
                        $log->status,
                        '"' . str_replace('"', '""', $log->description ?? '') . '"',
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
                // Return JSON
                $exportData = $logs->map(function($log) {
                    return [
                        'id' => $log->id,
                        'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                        'action' => $log->action,
                        'user' => $log->getUserName(),
                        'module' => $log->getModuleName(),
                        'status' => $log->status,
                        'description' => $log->description,
                        'ip_address' => $log->ip_address,
                        'old_values' => $this->maskSensitiveData($log->old_values),
                        'new_values' => $this->maskSensitiveData($log->new_values),
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
     * Get recent audit logs (last 10 entries) for dashboard
     */
    public function recent(): JsonResponse
    {
        try {
            $activities = AuditLog::orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($log) {
                    // Map action to icon
                    $icon = $this->actionToIcon($log->action);

                    return [
                        'id' => $log->id,
                        'user' => $log->user_name ?: 'System',
                        'action' => $this->formatAction($log->action, $log->resource_type),
                        'timestamp' => $log->created_at->toISOString(),
                        'icon' => $icon
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching recent audit logs', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent audit logs',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mask sensitive data in audit logs
     */
    private function maskSensitiveData($data)
    {
        if (!$data) return $data;

        if (is_array($data)) {
            $masked = [];
            foreach ($data as $key => $value) {
                // Mask sensitive fields
                if (in_array(strtolower($key), ['password', 'token', 'secret', 'key', 'api_key', 'access_token'])) {
                    $masked[$key] = '***MASKED***';
                } else {
                    $masked[$key] = is_array($value) ? $this->maskSensitiveData($value) : $value;
                }
            }
            return $masked;
        }

        return $data;
    }

    /**
     * Map action to icon
     */
    private function actionToIcon(string $action): string
    {
        $actionLower = strtolower($action);

        if (in_array($actionLower, ['login', 'create', 'insert'])) {
            return 'login';
        }

        if (in_array($actionLower, ['logout', 'delete', 'remove'])) {
            return 'logout';
        }

        if (in_array($actionLower, ['update', 'edit', 'modify'])) {
            return 'edit';
        }

        if (in_array($actionLower, ['view', 'read', 'access'])) {
            return 'view';
        }

        return 'activity';
    }

    /**
     * Format action description
     */
    private function formatAction(string $action, ?string $resourceType): string
    {
        $resource = $resourceType ? ucfirst(str_replace('_', ' ', $resourceType)) : 'System';
        return ucfirst(strtolower($action)) . ' ' . $resource;
    }
}
