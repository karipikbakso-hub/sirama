<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Poli extends Model
{
    protected $table = 'm_poli';

    protected $fillable = [
        'kode_poli',
        'nama_poli',
        'deskripsi',
        'jenis_poli',
        'aktif'
    ];

    protected $casts = [
        'aktif' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relationship with registrations
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'service_unit', 'nama_poli');
    }

    /**
     * Scope for active poli
     */
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Scope for searching poli
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_poli', 'like', "%{$search}%")
              ->orWhere('kode_poli', 'like', "%{$search}%");
        });
    }

    /**
     * Get poli by jenis
     */
    public function scopeByJenis($query, string $jenis)
    {
        return $query->where('jenis_poli', $jenis);
    }
}
