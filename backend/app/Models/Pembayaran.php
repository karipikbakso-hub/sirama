<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pembayaran extends Model
{
    use HasFactory;

    protected $table = 't_pembayaran';

    protected $fillable = [
        'billing_id',
        'user_id',
        'tanggal_bayar',
        'jumlah_bayar',
        'metode_bayar',
        'no_referensi',
        'catatan',
    ];

    protected $casts = [
        'tanggal_bayar' => 'datetime',
        'jumlah_bayar' => 'decimal:2',
    ];

    // Relationships
    public function billing()
    {
        return $this->belongsTo(Billing::class, 'billing_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
