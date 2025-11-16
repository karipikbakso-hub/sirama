<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Penjamin extends Model
{
    protected $table = 'm_penjamin';

    protected $fillable = [
        'kode_penjamin',
        'nama_penjamin',
        'jenis_penjamin',
        'alamat',
        'telepon',
        'email',
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
        return $this->hasMany(Registration::class, 'payment_method', 'nama_penjamin');
    }

    /**
     * Scope for active penjamin
     */
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Scope for searching penjamin
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_penjamin', 'like', "%{$search}%")
              ->orWhere('kode_penjamin', 'like', "%{$search}%");
        });
    }

    /**
     * Get penjamin by jenis
     */
    public function scopeByJenis($query, string $jenis)
    {
        return $query->where('jenis_penjamin', $jenis);
    }

    /**
     * Get BPJS penjamin
     */
    public function scopeBpjs($query)
    {
        return $query->where('jenis_penjamin', 'bpjs');
    }

    /**
     * Get Asuransi penjamin
     */
    public function scopeAsuransi($query)
    {
        return $query->where('jenis_penjamin', 'asuransi_swasta');
    }

    /**
     * Get Tunai penjamin (might not exist in table, but for compatibility)
     */
    public function scopeTunai($query)
    {
        return $query->where('nama_penjamin', 'like', '%tunai%');
    }
}
