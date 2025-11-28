<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositTransaction extends Model
{
    protected $fillable = [
        'deposit_id',
        'type',
        'amount',
        'payment_method',
        'reference_id',
        'created_by',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function deposit(): BelongsTo
    {
        return $this->belongsTo(Deposit::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getFormattedAmountAttribute(): string
    {
        $prefix = in_array($this->type, ['top_up', 'refund']) ? '+' : '-';
        return $prefix . 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'top_up' => 'Top Up',
            'deduct' => 'Penggunaan',
            'refund' => 'Refund',
            default => $this->type
        };
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return match($this->payment_method) {
            'tunai' => 'Tunai',
            'transfer' => 'Transfer',
            'kartu_kredit' => 'Kartu Kredit',
            'kartu_debit' => 'Kartu Debit',
            'e_wallet' => 'E-Wallet',
            'bpjs' => 'BPJS',
            default => $this->payment_method ?? 'N/A'
        };
    }
}
