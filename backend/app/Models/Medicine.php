<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
