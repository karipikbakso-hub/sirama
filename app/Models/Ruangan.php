<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ruangan extends Model
{
    use HasFactory;

    protected $table = 'm_ruangan';

    protected $fillable = [
        'kode_ruangan',
        'nama_ruangan',
        'jenis_ruangan',
        'kapasitas',
        'tarif_per_hari',
        'status',
        'fasilitas',
    ];

    protected $casts = [
        'kapasitas' => 'integer',
        'tarif_per_hari' => 'decimal:2',
    ];

    // Relationships
    public function rawatInaps(): HasMany
    {
        return $this->hasMany(RawatInap::class, 'ruangan_id');
    }

    // Scopes
    public function scopeAktif($query)
    {
        return $query->where('status', 'tersedia');
    }

    public function scopeRawatInap($query)
    {
        return $query->where('jenis_ruangan', 'rawat_inap');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Accessors
    public function getOkupansiAttribute()
    {
        return $this->rawatInaps()->aktif()->count();
    }

    public function getTingkatOkupansiAttribute()
    {
        if ($this->kapasitas > 0) {
            return round(($this->okupansi / $this->kapasitas) * 100, 2);
        }
        return 0;
    }

    public function getStatusOkupansiAttribute()
    {
        $persentase = $this->tingkat_okupansi;

        if ($persentase >= 90) {
            return 'penuh';
        } elseif ($persentase >= 70) {
            return 'hampir_penuh';
        } elseif ($persentase >= 30) {
            return 'sedang';
        } else {
            return 'kosong';
        }
    }
}
