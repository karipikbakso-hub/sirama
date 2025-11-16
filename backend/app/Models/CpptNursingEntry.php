<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CpptNursingEntry extends Model
{
    protected $table = 'cppt_nursing_entries';

    protected $fillable = [
        'pasien_id',
        'registrasi_id',
        'user_id',
        'tanggal_waktu',
        'shift',
        'assessment',
        'diagnosis',
        'planning',
        'intervention',
        'evaluation',
        'status',
    ];

    protected $casts = [
        'tanggal_waktu' => 'datetime',
        'pasien_id' => 'integer',
        'registrasi_id' => 'integer',
        'user_id' => 'integer',
        'assessment' => 'array',
        'diagnosis' => 'array',
        'planning' => 'array',
        'intervention' => 'array',
        'evaluation' => 'array',
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

    // Relasi dengan user (perawat)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scope untuk filter berdasarkan status
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
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

    // Helper method untuk mendapatkan status text
    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'draft' => 'Draft',
            'active' => 'Aktif',
            'completed' => 'Selesai',
            'reviewed' => 'Ditinjau',
            default => $this->status
        };
    }

    // Helper method untuk mendapatkan shift text
    public function getShiftTextAttribute()
    {
        return match($this->shift) {
            'pagi' => 'Pagi (07:00-14:00)',
            'siang' => 'Siang (14:00-21:00)',
            'malam' => 'Malam (21:00-07:00)',
            default => $this->shift
        };
    }
}