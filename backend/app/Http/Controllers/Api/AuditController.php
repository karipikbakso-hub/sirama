<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AuditController extends Controller
{
    /**
     * Get audit logs with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = AuditLog::query();

            // Apply filters
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('action', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('user_name', 'like', "%{$search}%");
                });
            }

            if ($request->has('level') && $request->level !== 'all') {
                $query->where('level', $request->level);
            }

            if ($request->has('module') && $request->module !== 'all') {
                // Map module names back to resource types
                $moduleMap = [
                    'User Management' => 'user',
                    'Patient Management' => 'patient',
                    'Registration' => 'registration',
                    'Appointments' => 'appointment',
                    'Prescriptions' => 'prescription',
                    'Laboratory' => 'lab_order',
                    'Radiology' => 'radiology_order',
                    'Billing' => 'billing',
                    'Payments' => 'payment',
                    'System Configuration' => 'system_config',
                    'Role Management' => 'role',
                    'Permission Management' => 'permission',
                    'Audit System' => 'audit_log',
                    'API Integration' => 'api_log',
                    'System Backup' => 'backup',
                    'Reports' => 'report'
                ];

                $resourceType = $moduleMap[$request->module] ?? $request->module;
                $query->where('resource_type', $resourceType);
            }

            if ($request->has('user') && $request->user !== 'all') {
                $query->where('user_name', $request->user);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Order by latest first
            $query->orderBy('created_at', 'desc');

            $logs = $query->paginate($request->get('per_page', 20));

            // Transform data for frontend
            $transformedLogs = $logs->getCollection()->map(function($log) {
                return [
                    'id' => $log->id,
                    'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                    'action' => $log->action,
                    'user' => $log->user_name ?? 'System',
                    'details' => $log->description ?? '',
                    'ipAddress' => $log->ip_address ?? '',
                    'status' => $log->status,
                    'module' => $log->module,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
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
            $log = AuditLog::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $log->id,
                    'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                    'action' => $log->action,
                    'user' => $log->user_name ?? 'System',
                    'details' => $log->description ?? '',
                    'ipAddress' => $log->ip_address ?? '',
                    'status' => $log->status,
                    'module' => $log->module,
                    'level' => $log->level,
                    'resource_type' => $log->resource_type,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
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
            'days' => 'required|integer|min:1|max:365'
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
     * Get audit statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'total_logs' => AuditLog::count(),
                'today_logs' => AuditLog::whereDate('created_at', today())->count(),
                'week_logs' => AuditLog::where('created_at', '>=', now()->startOfWeek())->count(),
                'month_logs' => AuditLog::where('created_at', '>=', now()->startOfMonth())->count(),
                'by_level' => [
                    'info' => AuditLog::where('level', 'info')->count(),
                    'warning' => AuditLog::where('level', 'warning')->count(),
                    'error' => AuditLog::where('level', 'error')->count(),
                    'success' => AuditLog::where('level', 'success')->count()
                ],
                'by_module' => AuditLog::selectRaw('resource_type, COUNT(*) as count')
                    ->groupBy('resource_type')
                    ->get()
                    ->mapWithKeys(function($item) {
                        $moduleName = (new AuditLog(['resource_type' => $item->resource_type]))->module;
                        return [$moduleName => $item->count];
                    }),
                'recent_users' => AuditLog::select('user_name')
                    ->whereNotNull('user_name')
                    ->where('user_name', '!=', 'System')
                    ->distinct()
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->pluck('user_name')
                    ->toArray()
            ];

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
                ->map(function($log) {
                    return [
                        'value' => $log->resource_type,
                        'label' => $log->module
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
            'level' => 'nullable|string',
            'module' => 'nullable|string'
        ]);

        try {
            $query = AuditLog::query();

            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->level) {
                $query->where('level', $request->level);
            }

            if ($request->module) {
                $moduleMap = [
                    'User Management' => 'user',
                    'Patient Management' => 'patient',
                    'Registration' => 'registration',
                    'Appointments' => 'appointment',
                    'Prescriptions' => 'prescription',
                    'Laboratory' => 'lab_order',
                    'Radiology' => 'radiology_order',
                    'Billing' => 'billing',
                    'Payments' => 'payment',
                    'System Configuration' => 'system_config',
                    'Role Management' => 'role',
                    'Permission Management' => 'permission',
                    'Audit System' => 'audit_log',
                    'API Integration' => 'api_log',
                    'System Backup' => 'backup',
                    'Reports' => 'report'
                ];

                $resourceType = $moduleMap[$request->module] ?? $request->module;
                $query->where('resource_type', $resourceType);
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            if ($request->format === 'csv') {
                // Generate CSV content
                $csvContent = "ID,Timestamp,Action,User,Module,Level,Description,IP Address\n";

                foreach ($logs as $log) {
                    $csvContent .= sprintf(
                        "%d,%s,%s,%s,%s,%s,%s,%s\n",
                        $log->id,
                        $log->created_at->format('Y-m-d H:i:s'),
                        '"' . str_replace('"', '""', $log->action) . '"',
                        '"' . str_replace('"', '""', $log->user_name ?? 'System') . '"',
                        '"' . str_replace('"', '""', $log->module) . '"',
                        $log->level,
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
                return response()->json([
                    'success' => true,
                    'data' => [
                        'content' => base64_encode($logs->toJson(JSON_PRETTY_PRINT)),
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
}
