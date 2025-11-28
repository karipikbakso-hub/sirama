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
        'registration_id',
        'prescription_item_id',
        'medicine_id',
        'quantity_given',
        'given_at',
        'nurse_id',
        'notes',
    ];

    protected $casts = [
        'given_at' => 'datetime',
        'quantity_given' => 'integer',
    ];

    /**
     * Get the registration that owns the obat keluar.
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }

    /**
     * Get the prescription item that owns the obat keluar.
     */
    public function prescriptionItem(): BelongsTo
    {
        return $this->belongsTo(PrescriptionItem::class, 'prescription_item_id');
    }

    /**
     * Get the medicine that owns the obat keluar.
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    /**
     * Get the nurse that created the obat keluar record.
     */
    public function nurse(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nurse_id');
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
