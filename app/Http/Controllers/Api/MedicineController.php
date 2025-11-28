<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\MedicineBatch;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'golongan_obat' => 'nullable|string|max:100',
            'aktif' => ['nullable', Rule::in([true, false, '1', '0'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Medicine::query();

        // Apply filters
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        if ($request->has('golongan_obat')) {
            $query->where('golongan_obat', 'like', '%' . $request->golongan_obat . '%');
        }

        if ($request->has('aktif')) {
            $query->where('aktif', $request->aktif);
        }

        // Order by nama_obat
        $query->orderBy('nama_obat', 'asc');

        $medicines = $query->paginate(
            $request->get('per_page', 15),
            ['*'],
            'page',
            $request->get('page', 1)
        );

        // Transform medicines to include current_stock calculated from batches
        $transformedMedicines = $medicines->getCollection()->map(function ($medicine) {
            // Calculate total current stock from all active batches
            // Note: SUM() already handles negative values correctly, no need for WHERE stock > 0
            $currentStock = MedicineBatch::where('medicine_id', $medicine->id)
                ->where('expired_date', '>', now())
                ->sum(\DB::raw('GREATEST(stock, 0)')); // Ensure no negative values from SUM

            $medicineArray = $medicine->toArray();
            // Remove old 'stock' field to avoid confusion - we now use 'current_stock'
            unset($medicineArray['stock']);

            return array_merge($medicineArray, [
                'current_stock' => $currentStock
            ]);
        });

        // Replace the collection with transformed data
        $medicines->setCollection(collect($transformedMedicines));

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode_obat' => 'required|string|max:20|unique:m_obat,kode_obat',
            'nama_obat' => 'required|string|max:150',
            'nama_generik' => 'nullable|string|max:150',
            'indikasi' => 'nullable|string',
            'kontraindikasi' => 'nullable|string',
            'bentuk_sediaan' => 'required|string|max:50',
            'kekuatan' => 'nullable|string|max:50',
            'satuan' => 'required|string|max:20',
            'golongan_obat' => ['required', Rule::in(['bebas', 'bebas_terbatas', 'keras', 'narkotika', 'psikotropika'])],
            'harga_jual' => 'required|numeric|min:0',
            'stok_minimum' => 'required|integer|min:0',
            'stok_maksimum' => 'required|integer|min:0',
            'aktif' => ['nullable', Rule::in([true, false, '1', '0'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $medicine = Medicine::create([
                'kode_obat' => $request->kode_obat,
                'nama_obat' => $request->nama_obat,
                'nama_generik' => $request->nama_generik,
                'indikasi' => $request->indikasi,
                'kontraindikasi' => $request->kontraindikasi,
                'bentuk_sediaan' => $request->bentuk_sediaan,
                'kekuatan' => $request->kekuatan,
                'satuan' => $request->satuan,
                'golongan_obat' => $request->golongan_obat,
                'harga_jual' => $request->harga_jual,
                'stok_minimum' => $request->stok_minimum,
                'stok_maksimum' => $request->stok_maksimum,
                'aktif' => $request->aktif ?? true
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Obat berhasil dibuat',
                'data' => $medicine
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified medicine.
     */
    public function show(Medicine $medicine): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $medicine
        ]);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, Medicine $medicine): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode_obat' => 'sometimes|required|string|max:20|unique:m_obat,kode_obat,' . $medicine->id,
            'nama_obat' => 'sometimes|required|string|max:150',
            'nama_generik' => 'nullable|string|max:150',
            'indikasi' => 'nullable|string',
            'kontraindikasi' => 'nullable|string',
            'bentuk_sediaan' => 'sometimes|required|string|max:50',
            'kekuatan' => 'nullable|string|max:50',
            'satuan' => 'sometimes|required|string|max:20',
            'golongan_obat' => ['sometimes|required', Rule::in(['bebas', 'bebas_terbatas', 'keras', 'narkotika', 'psikotropika'])],
            'harga_jual' => 'sometimes|required|numeric|min:0',
            'stok_minimum' => 'sometimes|required|integer|min:0',
            'stok_maksimum' => 'sometimes|required|integer|min:0',
            'aktif' => ['sometimes', Rule::in([true, false, '1', '0'])]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicine->update($request->only([
                'kode_obat', 'nama_obat', 'nama_generik', 'indikasi', 'kontraindikasi',
                'bentuk_sediaan', 'kekuatan', 'satuan', 'golongan_obat', 'harga_jual',
                'stok_minimum', 'stok_maksimum', 'aktif'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Obat berhasil diperbarui',
                'data' => $medicine
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified medicine.
     */
    public function destroy(Medicine $medicine): JsonResponse
    {
        try {
            $medicine->delete();

            return response()->json([
                'success' => true,
                'message' => 'Obat berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus obat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicine statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $totalMedicines = Medicine::count();
            $activeMedicines = Medicine::where('aktif', true)->count();
            $inactiveMedicines = Medicine::where('aktif', false)->count();

            // Count medicines with low stock (total stock from batches <= 10)
            $lowStockMedicines = Medicine::whereHas('batches', function ($query) {
                $query->havingRaw('SUM(GREATEST(stock, 0)) <= 10')
                      ->havingRaw('SUM(GREATEST(stock, 0)) > 0');
            })->count();

            // Count medicines with batches expiring soon (within 90 days)
            $expiringSoonMedicines = Medicine::whereHas('batches', function ($query) {
                $query->where('expired_date', '<=', now()->addDays(90))
                      ->where('expired_date', '>=', now())
                      ->where('stock', '>', 0);
            })->count();

            // Count total batches
            $totalBatches = MedicineBatch::count();

            // Get medicines by category
            $byCategory = Medicine::selectRaw('golongan_obat, COUNT(*) as count')
                                  ->whereNotNull('golongan_obat')
                                  ->where('aktif', true)
                                  ->groupBy('golongan_obat')
                                  ->pluck('count', 'golongan_obat')
                                  ->toArray();

            // Get stock distribution
            $totalStockValue = MedicineBatch::sum(\DB::raw('stock * purchase_price'));

            $stats = [
                'total_medicines' => $totalMedicines,
                'active_medicines' => $activeMedicines,
                'inactive_medicines' => $inactiveMedicines,
                'total_batches' => $totalBatches,
                'low_stock_medicines' => $lowStockMedicines,
                'expiring_soon_medicines' => $expiringSoonMedicines,
                'total_stock_value' => $totalStockValue,
                'by_category' => $byCategory,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve medicine statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock medicines.
     */
    public function lowStock(Request $request): JsonResponse
    {
        $threshold = (int) $request->get('threshold', 10);

        try {
            // Get medicines with total stock from batches below threshold
            $medicines = Medicine::with(['batches' => function ($query) {
                $query->orderBy('expired_date', 'asc');
            }])
            ->whereHas('batches', function ($query) use ($threshold) {
                $query->havingRaw('SUM(stock) <= ?', [$threshold])
                      ->havingRaw('SUM(stock) > 0');
            })
            ->where('aktif', true)
            ->orderBy('nama_obat', 'asc')
            ->get();

            // Transform data to include stock information
            $result = $medicines->map(function ($medicine) use ($threshold) {
                $totalStock = $medicine->batches->sum('stock');

                return [
                    'id' => $medicine->id,
                    'kode_obat' => $medicine->kode_obat,
                    'nama_obat' => $medicine->nama_obat,
                    'nama_generik' => $medicine->nama_generik,
                    'golongan_obat' => $medicine->golongan_obat,
                    'satuan' => $medicine->satuan,
                    'total_stock' => $totalStock,
                    'threshold' => $threshold,
                    'status' => $totalStock <= 0 ? 'out_of_stock' : 'low_stock',
                    'batches_count' => $medicine->batches->count(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => "Found {$result->count()} medicines with stock below {$threshold} units"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve low stock medicines',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicines expiring soon.
     */
    public function expiringSoon(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 90);

        try {
            // Get medicines with batches that will expire soon
            $medicines = Medicine::with(['batches' => function ($query) use ($days) {
                $query->where('expired_date', '<=', now()->addDays($days))
                      ->where('expired_date', '>=', now())
                      ->where('stock', '>', 0)
                      ->orderBy('expired_date', 'asc');
            }])
            ->whereHas('batches', function ($query) use ($days) {
                $query->where('expired_date', '<=', now()->addDays($days))
                      ->where('expired_date', '>=', now())
                      ->where('stock', '>', 0);
            })
            ->where('aktif', true)
            ->orderBy('nama_obat', 'asc')
            ->get();

            // Transform data to include expiring batch information
            $result = $medicines->map(function ($medicine) {
                $expiringBatches = $medicine->batches->map(function ($batch) {
                    return [
                        'batch_number' => $batch->batch_number,
                        'expired_date' => $batch->expired_date->format('Y-m-d'),
                        'stock' => $batch->stock,
                        'days_until_expiry' => now()->diffInDays($batch->expired_date, false),
                    ];
                });

                return [
                    'id' => $medicine->id,
                    'kode_obat' => $medicine->kode_obat,
                    'nama_obat' => $medicine->nama_obat,
                    'nama_generik' => $medicine->nama_generik,
                    'golongan_obat' => $medicine->golongan_obat,
                    'satuan' => $medicine->satuan,
                    'expiring_batches' => $expiringBatches,
                    'total_expiring_stock' => $expiringBatches->sum('stock'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => "Found {$result->count()} medicines with batches expiring within {$days} days"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve expiring medicines',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicines by category.
     */
    public function byCategory(string $category): JsonResponse
    {
        $medicines = Medicine::where('golongan_obat', $category)
                            ->where('aktif', true)
                            ->orderBy('nama_obat', 'asc')
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }

    /**
     * Get medicine batches for dispensing (FEFO - First Expired First Out).
     */
    public function batches(Medicine $medicine): JsonResponse
    {
        try {
            // Get batches for this medicine, ordered by expiration date (FEFO)
            $batches = MedicineBatch::where('medicine_id', $medicine->id)
                ->where('stock', '>', 0)
                ->where('expired_date', '>', now())
                ->orderBy('expired_date', 'asc') // FEFO - First Expired First Out
                ->get();

            // Calculate total stock from all batches
            $totalStock = $batches->sum('stock');

            // Transform batch data for frontend
            $batchData = $batches->map(function ($batch) {
                return [
                    'batch_number' => $batch->batch_number,
                    'expired_date' => $batch->expired_date->format('Y-m-d'),
                    'stock' => $batch->stock,
                    'unit_price' => $batch->purchase_price ?? 0,
                ];
            });

            // If no batches exist, return empty array (don't create mock data)
            // This ensures data integrity - only real batch data is shown

            return response()->json([
                'success' => true,
                'data' => [
                    'medicine' => [
                        'id' => $medicine->id,
                        'name' => $medicine->nama_obat,
                        'total_stock' => $totalStock,
                    ],
                    'batches' => $batchData,
                    'strategy' => 'FEFO (First Expired First Out)',
                    'total_batches' => $batches->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve medicine batches',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicine interactions and contraindications.
     */
    public function interactions(Medicine $medicine): JsonResponse
    {
        try {
            // For now, return basic structure. In a real system, this would query
            // a drug interaction database or use external APIs
            $interactions = [
                'interactions' => $medicine->interactions ? json_decode($medicine->interactions, true) : [],
                'contraindications' => $medicine->contraindications ? json_decode($medicine->contraindications, true) : [],
            ];

            // If no stored interactions, provide basic warnings based on medicine type
            if (empty($interactions['interactions']) && empty($interactions['contraindications'])) {
                $interactions = $this->getBasicInteractions($medicine);
            }

            return response()->json([
                'success' => true,
                'data' => $interactions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve medicine interactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export medicine stock list as Excel (CSV format).
     */
    public function exportStock(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'format' => 'nullable|in:csv,excel',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get all medicines with stock information
            $medicines = Medicine::with(['batches' => function ($query) {
                $query->orderBy('expired_date', 'asc');
            }])
            ->where('aktif', true)
            ->orderBy('nama_obat', 'asc')
            ->get();

            // Generate CSV content
            $csvContent = "Kode Obat,Nama Obat,Nama Generik,Golongan,Satuan,Stok Total,Reorder Point,Harga Jual,Tanggal Expired Pertama,Tanggal Expired Terakhir,Status Stok\n";

            foreach ($medicines as $medicine) {
                $totalStock = $medicine->batches->sum('stock');
                $reorderPoint = $medicine->stok_minimum ?? 10;

                // Determine status
                if ($totalStock === 0) {
                    $status = 'Habis';
                } elseif ($totalStock <= $reorderPoint) {
                    $status = 'Menipis';
                } else {
                    $status = 'Tersedia';
                }

                // Get expiry dates
                $firstExpiry = $medicine->batches->where('stock', '>', 0)->first()?->expired_date?->format('d/m/Y') ?? '-';
                $lastExpiry = $medicine->batches->where('stock', '>', 0)->last()?->expired_date?->format('d/m/Y') ?? '-';

                // Format golongan obat
                $golonganLabels = [
                    'bebas' => 'Obat Bebas',
                    'bebas_terbatas' => 'Obat Bebas Terbatas',
                    'keras' => 'Obat Keras',
                    'narkotika' => 'Narkotika',
                    'psikotropika' => 'Psikotropika'
                ];
                $golongan = $golonganLabels[$medicine->golongan_obat] ?? $medicine->golongan_obat;

                // Add row to CSV
                $csvContent .= sprintf(
                    "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%d\",\"%d\",\"%d\",\"%s\",\"%s\",\"%s\"\n",
                    $medicine->kode_obat,
                    str_replace('"', '""', $medicine->nama_obat),
                    str_replace('"', '""', $medicine->nama_generik ?? ''),
                    $golongan,
                    $medicine->satuan,
                    $totalStock,
                    $reorderPoint,
                    $medicine->harga_jual ?? 0,
                    $firstExpiry,
                    $lastExpiry,
                    $status
                );
            }

            // Encode as base64 for frontend download
            $encodedContent = base64_encode($csvContent);
            $filename = 'laporan_stok_obat_' . now()->format('Y-m-d_H-i-s') . '.csv';

            return response()->json([
                'success' => true,
                'data' => [
                    'content' => $encodedContent,
                    'filename' => $filename,
                    'mime_type' => 'text/csv',
                    'size' => strlen($csvContent)
                ],
                'message' => 'Stock export generated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate stock export',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get basic interactions based on medicine name and category.
     * This is a simplified implementation for demonstration.
     */
    private function getBasicInteractions(Medicine $medicine): array
    {
        $interactions = [];
        $contraindications = [];

        $name = strtolower($medicine->nama_obat);
        $generic = strtolower($medicine->nama_generik ?? '');

        // Basic interaction rules (simplified)
        if (str_contains($name, 'aspirin') || str_contains($generic, 'acetylsalicylic acid')) {
            $interactions[] = [
                'medicine' => 'Warfarin',
                'severity' => 'major',
                'description' => 'Increased risk of bleeding'
            ];
            $interactions[] = [
                'medicine' => 'Ibuprofen',
                'severity' => 'moderate',
                'description' => 'Reduced effectiveness of aspirin'
            ];
        }

        if (str_contains($name, 'warfarin') || str_contains($generic, 'warfarin')) {
            $interactions[] = [
                'medicine' => 'Aspirin',
                'severity' => 'major',
                'description' => 'Increased risk of bleeding'
            ];
            $contraindications[] = [
                'condition' => 'Pregnancy',
                'severity' => 'major',
                'description' => 'Risk of fetal harm'
            ];
        }

        if (str_contains($name, 'digoxin') || str_contains($generic, 'digoxin')) {
            $interactions[] = [
                'medicine' => 'Amiodarone',
                'severity' => 'major',
                'description' => 'Increased digoxin levels'
            ];
        }

        // Add contraindications for common conditions
        if (str_contains($name, 'nsaid') || str_contains($name, 'ibuprofen') || str_contains($name, 'diclofenac')) {
            $contraindications[] = [
                'condition' => 'Peptic ulcer',
                'severity' => 'major',
                'description' => 'May worsen ulcers'
            ];
            $contraindications[] = [
                'condition' => 'Severe kidney disease',
                'severity' => 'major',
                'description' => 'May cause kidney damage'
            ];
        }

        return [
            'interactions' => $interactions,
            'contraindications' => $contraindications
        ];
    }
}
