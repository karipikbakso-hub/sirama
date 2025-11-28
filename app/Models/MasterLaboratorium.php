<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterLaboratorium extends Model
{
    use HasFactory;

    protected $table = 'm_laboratorium';

    protected $fillable = [
        'nama_pemeriksaan',
        'kode_pemeriksaan',
        'kategori',
        'satuan',
        'nilai_normal',
        'harga',
        'aktif',
        'keterangan',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'aktif' => 'boolean',
    ];

    /**
     * Get active lab tests.
     */
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Get lab tests by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('kategori', $category);
    }

    /**
     * Search lab tests by name or code.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_pemeriksaan', 'like', "%{$search}%")
              ->orWhere('kode_pemeriksaan', 'like', "%{$search}%");
        });
    }
}
