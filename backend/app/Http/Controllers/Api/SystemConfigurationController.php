<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use App\Models\SystemConfiguration;

class SystemConfigurationController extends Controller
{
    /**
     * Display a listing of configurations grouped by category.
     */
    public function index(Request $request)
    {
        $group = $request->query('group');

        if ($group) {
            $configurations = SystemConfiguration::getByGroup($group);
        } else {
            $configurations = SystemConfiguration::where('is_editable', true)
                ->orderBy('group')
                ->orderBy('label')
                ->get();
        }

        $grouped = $configurations->groupBy('group')->map(function ($groupConfigs) {
            return $groupConfigs->map(function ($config) {
                return [
                    'id' => $config->id,
                    'key' => $config->key,
                    'value' => $config->casted_value,
                    'type' => $config->type,
                    'group' => $config->group,
                    'label' => $config->label,
                    'description' => $config->description,
                    'options' => $config->options,
                    'requires_restart' => $config->requires_restart,
                    'updated_at' => $config->updated_at,
                ];
            });
        });

        return response()->json([
            'success' => true,
            'data' => $grouped
        ]);
    }

    /**
     * Get configuration groups.
     */
    public function getGroups()
    {
        $groups = [
            'hospital' => 'Informasi Rumah Sakit',
            'system' => 'Pengaturan Sistem',
            'security' => 'Keamanan',
            'notifications' => 'Notifikasi',
            'backup' => 'Backup & Recovery',
            'integration' => 'Integrasi',
        ];

        return response()->json([
            'success' => true,
            'data' => $groups
        ]);
    }

    /**
     * Update multiple configurations.
     */
    public function updateMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'configurations' => 'required|array',
            'configurations.*.key' => 'required|string|exists:system_configurations,key',
            'configurations.*.value' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updatedConfigs = [];
            $requiresRestart = false;

            foreach ($request->configurations as $configData) {
                $config = SystemConfiguration::where('key', $configData['key'])->first();

                if ($config && $config->is_editable) {
                    $oldValue = $config->casted_value;
                    $config->casted_value = $configData['value'];
                    $config->save();

                    // Clear cache for this config
                    Cache::forget("config.{$config->key}");

                    $updatedConfigs[] = [
                        'key' => $config->key,
                        'label' => $config->label,
                        'old_value' => $oldValue,
                        'new_value' => $config->casted_value,
                        'requires_restart' => $config->requires_restart,
                    ];

                    if ($config->requires_restart) {
                        $requiresRestart = true;
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Konfigurasi berhasil diperbarui',
                'data' => [
                    'updated' => $updatedConfigs,
                    'requires_restart' => $requiresRestart,
                    'restart_message' => $requiresRestart ?
                        'Beberapa perubahan memerlukan restart aplikasi untuk diterapkan.' :
                        null
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui konfigurasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update single configuration.
     */
    public function update(Request $request, $key)
    {
        $config = SystemConfiguration::where('key', $key)->firstOrFail();

        if (!$config->is_editable) {
            return response()->json([
                'success' => false,
                'message' => 'Konfigurasi ini tidak dapat diubah'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'value' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $oldValue = $config->casted_value;
            $config->casted_value = $request->value;
            $config->save();

            // Clear cache
            Cache::forget("config.{$key}");

            return response()->json([
                'success' => true,
                'message' => 'Konfigurasi berhasil diperbarui',
                'data' => [
                    'key' => $config->key,
                    'label' => $config->label,
                    'old_value' => $oldValue,
                    'new_value' => $config->casted_value,
                    'requires_restart' => $config->requires_restart,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui konfigurasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current configuration values (for .env sync).
     */
    public function getEnvValues()
    {
        $envValues = [
            'APP_NAME' => config('app.name'),
            'APP_ENV' => config('app.env'),
            'APP_DEBUG' => config('app.debug') ? 'true' : 'false',
            'APP_URL' => config('app.url'),
            'APP_TIMEZONE' => config('app.timezone'),
            'APP_LOCALE' => config('app.locale'),
            'DB_CONNECTION' => config('database.default'),
            'SESSION_LIFETIME' => config('session.lifetime'),
            'MAIL_MAILER' => config('mail.default'),
        ];

        return response()->json([
            'success' => true,
            'data' => $envValues
        ]);
    }

    /**
     * Reload system configuration (clear cache, etc).
     */
    public function reloadSystem(Request $request)
    {
        try {
            // Clear all configuration cache
            SystemConfiguration::clearCache();

            // Clear Laravel config cache
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');

            // Optional: Clear OPcache if available
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }

            return response()->json([
                'success' => true,
                'message' => 'Sistem berhasil di-reload',
                'data' => [
                    'cache_cleared' => true,
                    'opcache_reset' => function_exists('opcache_reset'),
                    'timestamp' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal reload sistem',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system information.
     */
    public function getSystemInfo()
    {
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'database_connection' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'session_driver' => config('session.driver'),
            'queue_driver' => config('queue.default'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale'),
            'debug_mode' => config('app.debug'),
            'maintenance_mode' => app()->isDownForMaintenance(),
            'last_reload' => now()->toISOString(),
        ];

        return response()->json([
            'success' => true,
            'data' => $systemInfo
        ]);
    }

    /**
     * Export configurations to JSON.
     */
    public function export()
    {
        $configurations = SystemConfiguration::all()->map(function ($config) {
            return [
                'key' => $config->key,
                'value' => $config->casted_value,
                'type' => $config->type,
                'group' => $config->group,
                'label' => $config->label,
                'description' => $config->description,
                'options' => $config->options,
                'is_editable' => $config->is_editable,
                'requires_restart' => $config->requires_restart,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $configurations,
            'exported_at' => now()->toISOString(),
            'version' => config('app.version', '1.0.0'),
        ]);
    }

    /**
     * Import configurations from JSON.
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'configurations' => 'required|array',
            'configurations.*.key' => 'required|string',
            'configurations.*.value' => 'required',
            'overwrite' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $imported = 0;
            $skipped = 0;
            $overwrite = $request->boolean('overwrite', false);

            foreach ($request->configurations as $configData) {
                $existing = SystemConfiguration::where('key', $configData['key'])->first();

                if ($existing && !$overwrite) {
                    $skipped++;
                    continue;
                }

                SystemConfiguration::updateOrCreate(
                    ['key' => $configData['key']],
                    [
                        'value' => $configData['value'],
                        'type' => $configData['type'] ?? 'string',
                        'group' => $configData['group'] ?? 'general',
                        'label' => $configData['label'] ?? $configData['key'],
                        'description' => $configData['description'] ?? null,
                        'options' => $configData['options'] ?? null,
                        'is_editable' => $configData['is_editable'] ?? true,
                        'requires_restart' => $configData['requires_restart'] ?? false,
                    ]
                );

                $imported++;
            }

            DB::commit();

            // Clear cache
            SystemConfiguration::clearCache();

            return response()->json([
                'success' => true,
                'message' => 'Konfigurasi berhasil diimpor',
                'data' => [
                    'imported' => $imported,
                    'skipped' => $skipped,
                    'total' => $imported + $skipped,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengimpor konfigurasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
