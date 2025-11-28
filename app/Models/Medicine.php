<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\MedicineBatch;
use App\Models\StockAdjustment;
use App\Models\StockMovement;

class Medicine extends Model
{
    protected $table = 'm_obat';

    protected $fillable = [
        'kode_obat',
        'nama_obat',
        'nama_generik',
        'indikasi',
        'kontraindikasi',
        'bentuk_sediaan',
        'kekuatan',
        'satuan',
        'golongan_obat',
        'harga_jual',
        'stok_minimum',
        'stok_maksimum',
        'aktif',
    ];

    protected $casts = [
        'harga_jual' => 'decimal:2',
        'stok_minimum' => 'integer',
        'stok_maksimum' => 'integer',
        'aktif' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['current_stock'];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('golongan_obat', $category);
    }

    /**
     * Scope for searching medicines
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_obat', 'like', "%{$search}%")
              ->orWhere('nama_generik', 'like', "%{$search}%")
              ->orWhere('kode_obat', 'like', "%{$search}%");
        });
    }

    /**
     * Relationship with medicine batches
     */
    public function batches()
    {
        return $this->hasMany(MedicineBatch::class, 'medicine_id');
    }

    /**
     * Relationship with stock adjustments
     */
    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class, 'medicine_id');
    }

    /**
     * Relationship with stock movements
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'medicine_id');
    }

    /**
     * Get current stock accessor
     * Calculate current stock from medicine batches
     */
    public function getCurrentStockAttribute()
    {
        // Calculate current stock from active medicine batches
        return $this->batches()
            ->where('expired_date', '>', now())
            ->sum('stock');
    }
}
