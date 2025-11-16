<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ObatKeluar extends Model
{
    use HasFactory;

    protected $table = 't_obat_keluar';

    protected $fillable = [
        'resep_detail_id',
        'user_id',
        'tanggal_keluar',
        'jumlah_keluar',
        'harga_satuan',
        'subtotal',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_keluar' => 'datetime',
        'jumlah_keluar' => 'integer',
        'harga_satuan' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'status' => 'string',
    ];

    /**
     * Get the resep detail that owns the obat keluar.
     */
    public function resepDetail(): BelongsTo
    {
        return $this->belongsTo(ResepDetail::class, 'resep_detail_id');
    }

    /**
     * Get the user that created the obat keluar record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the medicine through resep detail.
     */
    public function obat()
    {
        return $this->resepDetail->obat();
    }

    /**
     * Get the registration through resep detail.
     */
    public function registrasi()
    {
        return $this->resepDetail->resep->registrasi();
    }

    /**
     * Calculate subtotal automatically when setting quantity.
     */
    protected static function booted()
    {
        static::saving(function ($obatKeluar) {
            if ($obatKeluar->jumlah_keluar && $obatKeluar->harga_satuan) {
                $obatKeluar->subtotal = $obatKeluar->jumlah_keluar * $obatKeluar->harga_satuan;
            }
        });
    }

    /**
     * Scope for pending distributions.
     */
    public function scopeMenunggu($query)
    {
        return $query->where('status', 'menunggu');
    }

    /**
     * Scope for distributed medicines.
     */
    public function scopeDikeluarkan($query)
    {
        return $query->where('status', 'dikeluarkan');
    }

    /**
     * Scope for completed distributions.
     */
    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }

    /**
     * Check if distribution can be edited.
     */
    public function canBeEdited(): bool
    {
        return in_array($this->status, ['menunggu', 'dikeluarkan']);
    }

    /**
     * Check if distribution is pending.
     */
    public function isMenunggu(): bool
    {
        return $this->status === 'menunggu';
    }

    /**
     * Check if distribution is distributed.
     */
    public function isDikeluarkan(): bool
    {
        return $this->status === 'dikeluarkan';
    }

    /**
     * Check if distribution is completed.
     */
    public function isSelesai(): bool
    {
        return $this->status === 'selesai';
    }
}
