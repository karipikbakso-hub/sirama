<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengaturanSistem;
use App\Models\RiwayatPengaturan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PengaturanSistemController extends Controller
{
    /**
     * Get all settings grouped by category
     */
    public function index(Request $request): JsonResponse
    {
        $kategori = $request->query('kategori');

        if ($kategori) {
            $pengaturan = PengaturanSistem::getByKategori($kategori);
        } else {
            $pengaturan = collect(PengaturanSistem::getKategori())->mapWithKeys(function ($kat) {
                return [$kat => PengaturanSistem::getByKategori($kat)];
            });
        }

        // Hide sensitive values for non-super admin
        $user = Auth::user();
        if (!$this->isSuperAdmin($user)) {
            $pengaturan = $this->maskSensitiveValues($pengaturan);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pengaturan
        ]);
    }

    /**
     * Get settings by group/category
     */
    public function getByKategori($kategori): JsonResponse
    {
        $pengaturan = PengaturanSistem::getByKategori($kategori);

        // Mask sensitive values
        $user = Auth::user();
        if (!$this->isSuperAdmin($user)) {
            $pengaturan = $this->maskSensitiveValues($pengaturan);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pengaturan
        ]);
    }

    /**
     * Get groups/categories
     */
    public function getKategori(): JsonResponse
    {
        $kategori = PengaturanSistem::getKategori();

        // Map to labels
        $kategoriDenganLabel = array_map(function ($kat) {
            return [
                'key' => $kat,
                'label' => $this->getKategoriLabel($kat)
            ];
        }, $kategori);

        return response()->json([
            'status' => 'success',
            'data' => $kategoriDenganLabel
        ]);
    }

    /**
     * Update multiple settings
     */
    public function updateMultiple(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pengaturan' => 'required|array',
            'pengaturan.*.kunci' => 'required|string',
            'pengaturan.*.nilai' => 'nullable'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->get('pengaturan');
        $user = Auth::user();

        // Validate sensitive changes
        foreach ($data as $item) {
            $setting = PengaturanSistem::where('kunci', $item['kunci'])->first();
            if ($setting && $setting->is_sensitif && !$this->isSuperAdmin($user)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized to modify sensitive settings'
                ], 403);
            }
        }

        $updated = [];
        foreach ($data as $item) {
            try {
                PengaturanSistem::setByKunci($item['kunci'], $item['nilai']);
                $updated[] = $item['kunci'];
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Failed to update {$item['kunci']}: " . $e->getMessage()
                ], 500);
            }
        }

        // Check if restart required
        $restartRequired = collect($data)->contains(function ($item) {
            $setting = PengaturanSistem::where('kunci', $item['kunci'])->first();
            return $setting && $setting->requires_restart ?? false;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
            'data' => [
                'updated_keys' => $updated,
                'restart_required' => $restartRequired,
                'count' => count($updated)
            ]
        ]);
    }

    /**
     * Get system information
     */
    public function getSystemInfo(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
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
                'last_reload' => Cache::get('system_last_reload', null)
            ]
        ]);
    }

    /**
     * Get .env values (super admin only)
     */
    public function getEnvValues(): JsonResponse
    {
        $user = Auth::user();
        if (!$this->isSuperAdmin($user)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to environment variables'
            ], 403);
        }

        try {
            $envContent = file_get_contents(base_path('.env'));
            $envLines = explode("\n", $envContent);
            $envData = [];

            foreach ($envLines as $line) {
                $line = trim($line);
                if ($line && !str_starts_with($line, '#')) {
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $key = trim($parts[0]);
                        $value = trim($parts[1]);
                        // Mask sensitive values
                        $envData[$key] = $this->isEnvKeySensitive($key) ? '******' : $value;
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'data' => $envData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to read .env file'
            ], 500);
        }
    }

    /**
     * Reload system configuration and cache
     */
    public function reloadSystem(): JsonResponse
    {
        try {
            // Clear config cache
            Artisan::call('config:clear');
            Artisan::call('config:cache');

            // Clear application cache
            Cache::flush();

            // Clear route cache
            Artisan::call('route:clear');
            Artisan::call('route:cache');

            // Clear view cache
            Artisan::call('view:clear');
            Artisan::call('view:cache');

            // Update last reload timestamp
            $now = now()->toISOString();
            Cache::put('system_last_reload', $now, 86400); // 24 hours

            return response()->json([
                'status' => 'success',
                'message' => 'System configuration reloaded successfully',
                'data' => [
                    'reload_time' => $now
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reload system: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get history/audit trail for settings
     */
    public function getHistory(Request $request): JsonResponse
    {
        $query = RiwayatPengaturan::with(['pengaturanSistem', 'user'])
            ->terbaru();

        if ($request->has('kunci')) {
            $setting = PengaturanSistem::where('kunci', $request->kunci)->first();
            if ($setting) {
                $query->byPengaturan($setting->id);
            }
        }

        if ($request->has('user_id')) {
            $query->byUser($request->user_id);
        }

        $perPage = $request->get('per_page', 50);
        $history = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $history
        ]);
    }

    /**
     * Rollback to previous setting value
     */
    public function rollback($historyId): JsonResponse
    {
        $history = RiwayatPengaturan::findOrFail($historyId);
        $setting = $history->pengaturanSistem;

        $user = Auth::user();
        if (!$this->isSuperAdmin($user) && $setting->is_sensitif) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to rollback sensitive settings'
            ], 403);
        }

        try {
            // Create new history entry for rollback
            RiwayatPengaturan::create([
                'pengaturan_sistem_id' => $setting->id,
                'nilai_lama' => $setting->nilai,
                'nilai_baru' => $history->nilai_lama,
                'diubah_oleh' => auth()->id(),
            ]);

            // Update setting
            $setting->nilai = $history->nilai_lama;
            $setting->save();

            // Clear cache
            Cache::forget("pengaturan:{$setting->kunci}");
            Cache::forget("pengaturan:kategori:{$setting->kategori}");

            return response()->json([
                'status' => 'success',
                'message' => 'Setting rolled back successfully',
                'data' => $setting
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to rollback: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export settings to JSON
     */
    public function export(Request $request): JsonResponse
    {
        $kategori = $request->query('kategori');

        if ($kategori) {
            $pengaturan = PengaturanSistem::getByKategori($kategori);
        } else {
            $pengaturan = PengaturanSistem::all();
        }

        $exportData = [
            'exported_at' => now()->toISOString(),
            'total_settings' => $pengaturan->count(),
            'categories' => $pengaturan->pluck('kategori')->unique()->values(),
            'settings' => $pengaturan->map(function ($setting) {
                return [
                    'kategori' => $setting->kategori,
                    'kunci' => $setting->kunci,
                    'nilai' => $setting->nilai_decrypted,
                    'tipe_data' => $setting->tipe_data,
                    'deskripsi' => $setting->deskripsi,
                    'is_sensitif' => $setting->is_sensitif
                ];
            })
        ];

        return response()->json([
            'status' => 'success',
            'data' => $exportData
        ]);
    }

    /**
     * Import settings from JSON
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'data' => 'required|array',
            'data.settings' => 'required|array',
            'overwrite' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $importData = $request->get('data');
        $overwrite = $request->get('overwrite', false);
        $user = Auth::user();

        try {
            $imported = 0;
            $skipped = 0;

            foreach ($importData['settings'] as $settingData) {
                $existing = PengaturanSistem::where('kunci', $settingData['kunci'])->first();

                if ($existing && !$overwrite) {
                    $skipped++;
                    continue;
                }

                if ($existing && $existing->is_sensitif && !$this->isSuperAdmin($user)) {
                    $skipped++;
                    continue;
                }

                PengaturanSistem::updateOrCreate(
                    ['kunci' => $settingData['kunci']],
                    [
                        'kategori' => $settingData['kategori'],
                        'nilai' => $settingData['nilai'],
                        'tipe_data' => $settingData['tipe_data'],
                        'deskripsi' => $settingData['deskripsi'],
                        'is_sensitif' => $settingData['is_sensitif'] ?? false,
                    ]
                );

                $imported++;
            }

            // Clear cache
            PengaturanSistem::clearCache();

            return response()->json([
                'status' => 'success',
                'message' => 'Settings imported successfully',
                'data' => [
                    'imported' => $imported,
                    'skipped' => $skipped
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update .env file (super admin only)
     */
    public function updateEnv(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$this->isSuperAdmin($user)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to environment configuration'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'env_content' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid password confirmation'
            ], 403);
        }

        try {
            // Backup current .env
            $backupPath = base_path('.env.backup.' . date('YmdHis'));
            if (file_exists(base_path('.env'))) {
                copy(base_path('.env'), $backupPath);
            }

            // Validate .env content
            $this->validateEnvContent($request->env_content);

            // Write new .env
            file_put_contents(base_path('.env'), $request->env_content);

            // Reload configuration
            Artisan::call('config:cache');

            return response()->json([
                'status' => 'success',
                'message' => '.env file updated successfully. Server restart required.',
                'data' => [
                    'backup_created' => basename($backupPath),
                    'restart_required' => true
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update .env: ' . $e->getMessage()
            ], 500);
        }
    }

    // Private helper methods

    private function isSuperAdmin($user): bool
    {
        return $user && $user->hasRole('super_admin');
    }

    private function maskSensitiveValues($data)
    {
        if ($data instanceof \Illuminate\Support\Collection) {
            return $data->map(function ($setting) {
                if (isset($setting->is_sensitif) && $setting->is_sensitif) {
                    $setting->nilai = '******';
                    $setting->nilai_cast = '******';
                }
                return $setting;
            });
        }

        if (is_array($data)) {
            foreach ($data as $kategori => $settings) {
                if (is_array($settings)) {
                    foreach ($settings as $setting) {
                        if (isset($setting['is_sensitif']) && $setting['is_sensitif']) {
                            $setting['nilai'] = '******';
                            $setting['nilai_cast'] = '******';
                        }
                    }
                }
            }
        }

        return $data;
    }

    private function getKategoriLabel($kategori): string
    {
        return match ($kategori) {
            'hospital' => 'Informasi Rumah Sakit',
            'app' => 'Aplikasi',
            'integration' => 'Integrasi',
            'security' => 'Keamanan',
            'notifications' => 'Notifikasi',
            'backup' => 'Backup & Maintenance',
            'system' => 'Sistem',
            default => ucfirst($kategori)
        };
    }

    private function isEnvKeySensitive($key): bool
    {
        $sensitiveKeys = [
            'APP_KEY', 'DB_PASSWORD', 'SMTP_PASSWORD', 'MAIL_PASSWORD',
            'AWS_SECRET', 'STRIPE_SECRET', 'JWT_SECRET', 'API_SECRET'
        ];

        foreach ($sensitiveKeys as $sensitive) {
            if (str_contains(strtoupper($key), $sensitive)) {
                return true;
            }
        }

        return false;
    }

    private function validateEnvContent($content): void
    {
        $lines = explode("\n", $content);
        $parsed = [];

        foreach ($lines as $lineNumber => $line) {
            $line = trim($line);

            // Skip empty lines and comments
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }

            // Check for valid key=value format
            if (!str_contains($line, '=')) {
                throw new \Exception("Invalid .env format at line " . ($lineNumber + 1) . ": {$line}");
            }

            $parts = explode('=', $line, 2);
            $key = trim($parts[0]);
            $value = trim($parts[1]);

            // Validate key format
            if (!preg_match('/^[A-Z][A-Z0-9_]*$/', $key)) {
                throw new \Exception("Invalid key format at line " . ($lineNumber + 1) . ": {$key}");
            }

            // Check for duplicate keys
            if (isset($parsed[$key])) {
                throw new \Exception("Duplicate key '{$key}' at line " . ($lineNumber + 1));
            }

            $parsed[$key] = true;
        }
    }
}
