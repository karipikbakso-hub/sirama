<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicineBatch extends Model
{
    protected $fillable = [
        'medicine_id',
        'batch_number',
        'expired_date',
        'stock',
        'purchase_price',
    ];

    protected $casts = [
        'expired_date' => 'date',
        'stock' => 'integer',
        'purchase_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the medicine that owns the batch.
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    /**
     * Scope for active batches (not expired and have stock).
     */
    public function scopeActive($query)
    {
        return $query->where('expired_date', '>', now())
                    ->where('stock', '>', 0);
    }

    /**
     * Scope for expired batches.
     */
    public function scopeExpired($query)
    {
        return $query->where('expired_date', '<=', now());
    }

    /**
     * Scope for expiring soon (within days).
     */
    public function scopeExpiringSoon($query, $days = 90)
    {
        return $query->where('expired_date', '<=', now()->addDays($days))
                    ->where('expired_date', '>=', now());
    }

    /**
     * Check if batch is expired.
     */
    public function isExpired(): bool
    {
        return $this->expired_date->isPast();
    }

    /**
     * Check if batch is expiring soon.
     */
    public function isExpiringSoon($days = 90): bool
    {
        return $this->expired_date->isFuture() &&
               $this->expired_date->diffInDays(now()) <= $days;
    }
}
