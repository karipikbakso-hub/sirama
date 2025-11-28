<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Billing extends Model
{
    use HasFactory;

    protected $table = 't_billing';

    protected $fillable = [
        'no_invoice',
        'registrasi_id',
        'user_id',
        'tanggal_billing',
        'total_tagihan',
        'diskon',
        'total_bayar',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_billing' => 'datetime',
        'total_tagihan' => 'decimal:2',
        'diskon' => 'decimal:2',
        'total_bayar' => 'decimal:2',
    ];

    // Relationships
    public function registrasi()
    {
        return $this->belongsTo(Registration::class, 'registrasi_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'billing_id');
    }
}
