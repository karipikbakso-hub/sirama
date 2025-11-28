<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class PurchaseRequisition extends Model
{
    protected $table = 'purchase_requisitions';

    protected $fillable = [
        'pr_number',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
        'notes',
        'total_items',
        'total_quantity',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'total_items' => 'integer',
        'total_quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship with user who created the PR
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship with user who approved the PR
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Relationship with PR items
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseRequisitionItem::class);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by creator
     */
    public function scopeByCreator($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Generate PR number
     */
    public static function generatePrNumber(): string
    {
        $date = Carbon::now()->format('Ymd');
        $lastPr = self::where('pr_number', 'like', "PR-{$date}%")
                     ->orderBy('pr_number', 'desc')
                     ->first();

        if ($lastPr) {
            $lastNumber = (int) substr($lastPr->pr_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "PR-{$date}-{$newNumber}";
    }

    /**
     * Check if PR can be submitted for approval
     */
    public function canBeSubmitted(): bool
    {
        return $this->status === 'draft' && $this->items()->count() > 0;
    }

    /**
     * Check if PR can be approved
     */
    public function canBeApproved(): bool
    {
        return $this->status === 'pending_approval';
    }

    /**
     * Check if PR can be converted to PO
     */
    public function canBeConvertedToPo(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Submit PR for approval
     */
    public function submitForApproval(): bool
    {
        if (!$this->canBeSubmitted()) {
            return false;
        }

        $this->update([
            'status' => 'pending_approval',
            'total_items' => $this->items()->count(),
            'total_quantity' => $this->items()->sum('quantity_requested'),
        ]);

        return true;
    }

    /**
     * Approve PR
     */
    public function approve($approverId): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_at' => now(),
        ]);

        return true;
    }

    /**
     * Reject PR
     */
    public function reject($approverId): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'approved_by' => $approverId,
            'approved_at' => now(),
        ]);

        return true;
    }

    /**
     * Convert to PO
     */
    public function convertToPo(): bool
    {
        if (!$this->canBeConvertedToPo()) {
            return false;
        }

        $this->update(['status' => 'converted_to_po']);

        return true;
    }

    /**
     * Get status badge color
     */
    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'draft' => 'gray',
            'pending_approval' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'converted_to_po' => 'blue',
            default => 'gray',
        };
    }
}
