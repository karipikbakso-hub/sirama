<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CpptEntry extends Model
{
    protected $table = 'cppt_entries';

    protected $fillable = [
        'pasien_id',
        'registrasi_id',
        'user_id',
        'tanggal_waktu',
        'shift',
        'subjektif',
        'objektif',
        'asesmen',
        'planning',
        'instruksi',
        'evaluasi',
        'status',
    ];

    protected $casts = [
        'tanggal_waktu' => 'datetime',
        'pasien_id' => 'integer',
        'registrasi_id' => 'integer',
        'user_id' => 'integer',
    ];

    // Relasi dengan pasien
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    // Relasi dengan registrasi
    public function registrasi(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registrasi_id');
    }

    // Relasi dengan user (dokter/perawat)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scope untuk filter berdasarkan status
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeFinal($query)
    {
        return $query->where('status', 'final');
    }

    // Scope untuk filter berdasarkan shift
    public function scopeShift($query, $shift)
    {
        return $query->where('shift', $shift);
    }

    // Scope untuk filter berdasarkan tanggal
    public function scopeTanggal($query, $tanggal)
    {
        return $query->whereDate('tanggal_waktu', $tanggal);
    }

    // Scope untuk filter berdasarkan pasien
    public function scopeUntukPasien($query, $pasienId)
    {
        return $query->where('pasien_id', $pasienId);
    }

    // Scope untuk filter berdasarkan user
    public function scopeOlehUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
