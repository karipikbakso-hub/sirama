<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    protected $table = 'm_dokter';

    protected $fillable = [
        'nip',
        'nama_dokter',
        'spesialisasi',
        'no_str',
        'no_sip',
        'telepon',
        'alamat',
        'status'
    ];

    protected $casts = [
        'schedule' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relationship with registrations
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'doctor_id');
    }

    /**
     * Scope for active doctors
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for searching doctors
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_dokter', 'like', "%{$search}%")
              ->orWhere('spesialisasi', 'like', "%{$search}%")
              ->orWhere('nip', 'like', "%{$search}%");
        });
    }
}
