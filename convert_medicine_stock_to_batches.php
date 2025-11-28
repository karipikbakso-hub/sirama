<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Contracts\Console\Kernel;
use App\Models\Medicine;
use App\Models\MedicineBatch;

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

echo "=== Converting Medicine Stock to Batches ===\n";

try {
    // Get all medicines that have old stock values
    $medicines = Medicine::where('stock', '>', 0)->get();

    echo "Found {$medicines->count()} medicines with old stock data\n\n";

    foreach ($medicines as $medicine) {
        echo "Processing: {$medicine->nama_obat} (ID: {$medicine->id})\n";
        echo "- Old stock field: {$medicine->stock}\n";

        // Check if medicine already has batches
        $existingBatches = MedicineBatch::where('medicine_id', $medicine->id)->get();

        if ($existingBatches->isNotEmpty()) {
            echo "- Has existing batches: " . $existingBatches->count() . "\n";
            $totalBatchStock = $existingBatches->sum('stock');
            echo "- Total batch stock: {$totalBatchStock}\n";

            // If batch stock differs from medicine stock, update
            if ($totalBatchStock != $medicine->stock) {
                echo "- STOCK MISMATCH! Batch total: {$totalBatchStock}, Medicine stock: {$medicine->stock}\n";
                // Keep the batch data as authoritative
                $medicine->stock = $totalBatchStock;
                $medicine->save();
                echo "- Updated medicine.stock to match batches: {$totalBatchStock}\n";
            } else {
                echo "- Stock matches, no action needed\n";
            }
        } else {
            // Create a default batch for the medicine with the old stock value
            echo "- No batches exist, creating default batch\n";

            $batchNumber = "AUTO-{$medicine->kode_obat}-" . date('Ymd');

            MedicineBatch::create([
                'medicine_id' => $medicine->id,
                'batch_number' => $batchNumber,
                'purchase_price' => $medicine->harga_jual ?? 0,
                'stock' => $medicine->stock,
                'expired_date' => now()->addYears(2), // Default 2 years expiration
            ]);

            echo "- Created batch '{$batchNumber}' with stock {$medicine->stock}\n";
        }

        echo "\n";
    }

    // Clear old stock fields (optional - can be done later)
    echo "All medicine stock data successfully migrated to batches!\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
