<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterRadiologi extends Model
{
    protected $table = 'm_radiologi';

    protected $fillable = [
        'kode_radio',
        'nama_pemeriksaan',
        'deskripsi',
        'kategori',
        'tarif',
        'aktif',
    ];

    protected $casts = [
        'tarif' => 'decimal:2',
        'aktif' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope for active radiology examinations
     */
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Scope for radiology examinations by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('kategori', $category);
    }

    /**
     * Scope for searching radiology examinations
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_pemeriksaan', 'like', "%{$search}%")
              ->orWhere('kode_radio', 'like', "%{$search}%")
              ->orWhere('deskripsi', 'like', "%{$search}%");
        });
    }

    /**
     * Get related radiology orders
     */
    public function radiologiOrders()
    {
        return $this->hasMany(Radiologi::class, 'radio_id');
    }
}
