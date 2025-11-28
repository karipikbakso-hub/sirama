<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Icd10Diagnosis extends Model
{
    protected $table = 'm_diagnosa';

    protected $fillable = [
        'kode_icd',
        'nama_diagnosa',
        'deskripsi',
        'kategori',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('kategori', $category);
    }

    /**
     * Scope for searching ICD-10 diagnoses
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('kode_icd', 'like', "%{$search}%")
              ->orWhere('nama_diagnosa', 'like', "%{$search}%");
        });
    }
}
