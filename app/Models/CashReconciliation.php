<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashReconciliation extends Model
{
    protected $fillable = [
        'kasir_id',
        'shift',
        'date',
        'expected_cash',
        'actual_cash',
        'discrepancy',
        'discrepancy_reason',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'date' => 'date',
        'expected_cash' => 'decimal:2',
        'actual_cash' => 'decimal:2',
        'discrepancy' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function kasir(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kasir_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeByKasir($query, $kasirId)
    {
        return $query->where('kasir_id', $kasirId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeByShift($query, $shift)
    {
        return $query->where('shift', $shift);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Accessors
    public function getShiftLabelAttribute(): string
    {
        return match($this->shift) {
            'pagi' => 'Pagi',
            'siang' => 'Siang',
            'malam' => 'Malam',
            default => $this->shift
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'open' => 'Terbuka',
            'pending_approval' => 'Menunggu Persetujuan',
            'approved' => 'Disetujui',
            'discrepancy' => 'Ada Selisih',
            default => $this->status
        };
    }

    // Methods
    public function calculateDiscrepancy(): float
    {
        return $this->actual_cash - $this->expected_cash;
    }

    public function isDiscrepancySignificant(): bool
    {
        return abs($this->discrepancy) > 10000; // Tolerance Rp 10.000
    }

    public function canBeApprovedBy(User $user): bool
    {
        // Check if user has supervisor or admin role
        return $user->hasRole(['supervisor', 'admin', 'kepala_kasir']);
    }
}
