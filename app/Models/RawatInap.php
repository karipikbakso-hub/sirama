<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RawatInap extends Model
{
    use HasFactory;

    protected $table = 't_rawat_inap';

    protected $fillable = [
        'no_rawat_inap',
        'patient_id',
        'registration_id',
        'ruangan_id',
        'dokter_id',
        'tanggal_masuk',
        'tanggal_keluar',
        'status',
        'diagnosa_masuk',
        'diagnosa_keluar',
        'catatan',
        'biaya_per_hari',
    ];

    protected $casts = [
        'tanggal_masuk' => 'datetime',
        'tanggal_keluar' => 'datetime',
        'biaya_per_hari' => 'decimal:2',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }

    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'dokter_id');
    }

    // Scopes
    public function scopeAktif($query)
    {
        return $query->where('status', 'dirawat');
    }

    public function scopeByRuangan($query, $ruanganId)
    {
        return $query->where('ruangan_id', $ruanganId);
    }

    // Accessors
    public function getDurasiAttribute()
    {
        if ($this->tanggal_keluar) {
            return $this->tanggal_masuk->diffInDays($this->tanggal_keluar);
        }
        return $this->tanggal_masuk->diffInDays(now());
    }

    public function getTotalBiayaAttribute()
    {
        if ($this->biaya_per_hari && $this->durasi > 0) {
            return $this->biaya_per_hari * $this->durasi;
        }
        return 0;
    }
}
