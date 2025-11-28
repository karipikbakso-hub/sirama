<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'medicine_id',
        'batch_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reference_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the medicine that owns the movement.
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    /**
     * Get the batch that owns the movement.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id');
    }

    /**
     * Scope for movements by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for movements by medicine.
     */
    public function scopeByMedicine($query, int $medicineId)
    {
        return $query->where('medicine_id', $medicineId);
    }

    /**
     * Scope for movements by date range.
     */
    public function scopeByDateRange($query, string $from, string $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }

    /**
     * Scope for movements by reference.
     */
    public function scopeByReference($query, string $referenceType, int $referenceId)
    {
        return $query->where('reference_type', $referenceType)
                    ->where('reference_id', $referenceId);
    }

    /**
     * Get movement type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'in' => 'Masuk',
            'out' => 'Keluar',
            'adjustment' => 'Penyesuaian',
            'expired' => 'Kadaluarsa',
            'damaged' => 'Rusak',
            default => $this->type
        };
    }

    /**
     * Check if movement increases stock.
     */
    public function increasesStock(): bool
    {
        return in_array($this->type, ['in', 'adjustment']) && $this->quantity > 0;
    }

    /**
     * Check if movement decreases stock.
     */
    public function decreasesStock(): bool
    {
        return in_array($this->type, ['out', 'expired', 'damaged']) ||
               ($this->type === 'adjustment' && $this->quantity < 0);
    }

    /**
     * Get the absolute quantity (always positive).
     */
    public function getAbsoluteQuantityAttribute(): int
    {
        return abs($this->quantity);
    }

    /**
     * Get the signed quantity (positive for increase, negative for decrease).
     */
    public function getSignedQuantityAttribute(): int
    {
        if ($this->increasesStock()) {
            return $this->quantity;
        } elseif ($this->decreasesStock()) {
            return -$this->absolute_quantity;
        }
        return 0;
    }
}
