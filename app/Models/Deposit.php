<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deposit extends Model
{
    protected $fillable = [
        'patient_id',
        'deposit_type',
        'balance',
        'status'
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(DepositTransaction::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWithBalance($query)
    {
        return $query->where('balance', '>', 0);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('deposit_type', $type);
    }

    // Methods
    public function calculateBalance(): float
    {
        $topUp = $this->transactions()->where('type', 'top_up')->sum('amount');
        $deduct = $this->transactions()->where('type', 'deduct')->sum('amount');
        $refund = $this->transactions()->where('type', 'refund')->sum('amount');

        return $topUp - $deduct - $refund;
    }

    public function updateBalance(): void
    {
        $this->balance = $this->calculateBalance();
        $this->save();
    }

    public function isLowBalance($threshold = 100000): bool
    {
        return $this->balance < $threshold;
    }
}
