<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResepDetail extends Model
{
    use HasFactory;

    protected $table = 't_resep_detail';

    protected $fillable = [
        'resep_id',
        'obat_id',
        'jumlah',
        'aturan_pakai',
        'hari',
        'instruksi',
        'harga_satuan',
        'subtotal',
    ];

    protected $casts = [
        'harga_satuan' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'jumlah' => 'integer',
        'hari' => 'integer',
    ];

    /**
     * Get the resep that owns the resep detail.
     */
    public function resep(): BelongsTo
    {
        return $this->belongsTo(Resep::class, 'resep_id');
    }

    /**
     * Get the medicine that owns the resep detail.
     */
    public function obat(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'obat_id');
    }

    /**
     * Calculate subtotal automatically when setting quantity or unit price.
     */
    protected static function booted()
    {
        static::saving(function ($resepDetail) {
            if ($resepDetail->jumlah && $resepDetail->harga_satuan) {
                $resepDetail->subtotal = $resepDetail->jumlah * $resepDetail->harga_satuan;
            }
        });
    }

    /**
     * Get formatted aturan pakai with quantity and frequency.
     */
    public function getFormattedAturanPakaiAttribute(): string
    {
        $aturan = $this->aturan_pakai;
        if ($this->jumlah && $this->hari) {
            $aturan .= " ({$this->jumlah} tablet x {$this->hari} hari)";
        }
        return $aturan;
    }

    /**
     * Get the total quantity needed (quantity * days).
     */
    public function getTotalQuantityAttribute(): int
    {
        return $this->jumlah * $this->hari;
    }
}
