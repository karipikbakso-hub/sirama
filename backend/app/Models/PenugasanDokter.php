<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenugasanDokter extends Model
{
    use HasFactory;

    protected $table = 't_penugasan_dokter';

    protected $fillable = [
        'user_id',
        'poli_id',
        'tanggal_penugasan',
        'waktu_mulai',
        'waktu_selesai',
        'jenis_shift',
        'aktif',
        'catatan',
    ];

    protected $casts = [
        'tanggal_penugasan' => 'date',
        'waktu_mulai' => 'datetime:H:i',
        'waktu_selesai' => 'datetime:H:i',
        'aktif' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    // Scopes
    public function scopeAktif($query)
    {
        return $query->where('aktif', true);
    }

    public function scopeUntukTanggal($query, $tanggal)
    {
        return $query->where('tanggal_penugasan', $tanggal);
    }

    public function scopeUntukShift($query, $shift)
    {
        return $query->where('jenis_shift', $shift);
    }

    public function scopeDokter($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePoli($query, $poliId)
    {
        return $query->where('poli_id', $poliId);
    }

    // Helper methods
    public function isShiftAktif(): bool
    {
        return $this->aktif && $this->tanggal_penugasan->isSameDay(now());
    }

    public function getDurasiJamAttribute(): float
    {
        $start = strtotime($this->waktu_mulai->format('H:i:s'));
        $end = strtotime($this->waktu_selesai->format('H:i:s'));

        // Handle overnight shifts
        if ($end < $start) {
            $end += 24 * 3600; // Add 24 hours
        }

        return round(($end - $start) / 3600, 1);
    }

    public function isWithinWorkingHours(): bool
    {
        $now = now();
        $currentTime = $now->format('H:i');

        if (!$this->tanggal_penugasan->isSameDay($now)) {
            return false;
        }

        $startTime = $this->waktu_mulai->format('H:i');
        $endTime = $this->waktu_selesai->format('H:i');

        return $currentTime >= $startTime && $currentTime <= $endTime;
    }
}
