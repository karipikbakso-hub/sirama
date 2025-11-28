<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MobileJknBooking extends Model
{
    protected $table = 'mobile_jkn_bookings';

    protected $fillable = [
        'kode_booking',
        'no_kartu',
        'nik_pasien',
        'tanggal_periksa',
        'jam_praktek',
        'kode_dokter',
        'nama_dokter',
        'kode_poli',
        'nama_poli',
        'jenis_kunjungan',
        'no_rujukan',
        'estimasi_dilayani',
        'status',
        'reason_rejected',
        'jkn_data',
        'synced_at',
    ];

    protected $casts = [
        'tanggal_periksa' => 'date',
        'jam_praktek' => 'datetime:H:i',
        'estimasi_dilayani' => 'datetime:H:i',
        'jkn_data' => 'array',
        'synced_at' => 'datetime',
    ];

    /**
     * Relationship with patient
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'nik_pasien', 'nik');
    }

    /**
     * Scope for pending bookings
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved bookings
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for completed bookings
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for cancelled bookings
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope for rejected bookings
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope by BPJS card number
     */
    public function scopeByBpjsNumber($query, $bpjsNumber)
    {
        return $query->where('no_kartu', $bpjsNumber);
    }

    /**
     * Scope by date
     */
    public function scopeByDate($query, $date)
    {
        return $query->where('tanggal_periksa', $date);
    }

    /**
     * Scope for today's bookings
     */
    public function scopeToday($query)
    {
        return $query->where('tanggal_periksa', today());
    }

    /**
     * Scope for upcoming bookings
     */
    public function scopeUpcoming($query)
    {
        return $query->where('tanggal_periksa', '>=', today())
                    ->whereIn('status', ['pending', 'approved']);
    }

    /**
     * Scope for synced bookings
     */
    public function scopeSynced($query)
    {
        return $query->whereNotNull('synced_at');
    }

    /**
     * Check if booking is upcoming
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->tanggal_periksa->isFuture() ||
               ($this->tanggal_periksa->isToday() && $this->jam_praktek->isFuture());
    }

    /**
     * Check if booking is past
     */
    public function getIsPastAttribute(): bool
    {
        return $this->tanggal_periksa->isPast() ||
               ($this->tanggal_periksa->isToday() && $this->jam_praktek->isPast());
    }

    /**
     * Get status color for badges
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'completed' => 'blue',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get status text
     */
    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => $this->status
        };
    }

    /**
     * Mark booking as synced
     */
    public function markAsSynced()
    {
        $this->update([
            'synced_at' => now(),
        ]);
    }

    /**
     * Update from JKN data
     */
    public function updateFromJknData(array $jknData)
    {
        $this->update([
            'jkn_data' => $jknData,
            'nama_dokter' => $jknData['nama_dokter'] ?? $this->nama_dokter,
            'nama_poli' => $jknData['nama_poli'] ?? $this->nama_poli,
            'jam_praktek' => $jknData['jam_praktek'] ?? $this->jam_praktek,
        ]);
    }

    /**
     * Get display name for patient
     */
    public function getPatientNameAttribute(): string
    {
        return $this->patient?->name ?? 'Unknown Patient';
    }
}
