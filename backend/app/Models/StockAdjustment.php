<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustment extends Model
{
    protected $fillable = [
        'medicine_id',
        'batch_id',
        'type',
        'quantity',
        'reason',
        'adjusted_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the medicine that owns the adjustment.
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    /**
     * Get the batch that owns the adjustment.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id');
    }

    /**
     * Get the user who made the adjustment.
     */
    public function adjustedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    /**
     * Scope for adjustments by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for adjustments by medicine.
     */
    public function scopeByMedicine($query, int $medicineId)
    {
        return $query->where('medicine_id', $medicineId);
    }

    /**
     * Scope for adjustments by user.
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('adjusted_by', $userId);
    }

    /**
     * Get adjustment type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'in' => 'Pemasukan',
            'out' => 'Pengeluaran',
            'adjustment' => 'Penyesuaian',
            'expired' => 'Kadaluarsa',
            'damaged' => 'Rusak',
            default => $this->type
        };
    }

    /**
     * Check if adjustment increases stock.
     */
    public function increasesStock(): bool
    {
        return in_array($this->type, ['in', 'adjustment']) && $this->quantity > 0;
    }

    /**
     * Check if adjustment decreases stock.
     */
    public function decreasesStock(): bool
    {
        return in_array($this->type, ['out', 'expired', 'damaged']) || ($this->type === 'adjustment' && $this->quantity < 0);
    }
}
