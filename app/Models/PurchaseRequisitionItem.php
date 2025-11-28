<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequisitionItem extends Model
{
    protected $table = 'purchase_requisition_items';

    protected $fillable = [
        'purchase_requisition_id',
        'medicine_id',
        'quantity_requested',
        'quantity_approved',
        'unit_price',
        'notes',
    ];

    protected $casts = [
        'quantity_requested' => 'integer',
        'quantity_approved' => 'integer',
        'unit_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship with purchase requisition
     */
    public function purchaseRequisition(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequisition::class);
    }

    /**
     * Relationship with medicine
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    /**
     * Get total price for this item
     */
    public function getTotalPriceAttribute(): float
    {
        return ($this->quantity_approved ?? $this->quantity_requested) * ($this->unit_price ?? 0);
    }

    /**
     * Check if item has been approved
     */
    public function isApproved(): bool
    {
        return !is_null($this->quantity_approved);
    }

    /**
     * Get approved quantity or requested quantity if not approved
     */
    public function getEffectiveQuantityAttribute(): int
    {
        return $this->quantity_approved ?? $this->quantity_requested;
    }
}
