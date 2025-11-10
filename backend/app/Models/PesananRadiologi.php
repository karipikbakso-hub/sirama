<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PesananRadiologi extends Model
{
    protected $table = 't_pesanan_radiologi';

    protected $fillable = [
        'id_pasien',
        'id_dokter',
        'id_radiologi',
        'tanggal_pesanan',
        'urgensi',
        'status_pesanan',
        'diagnosa_klinis',
        'catatan',
        'hasil',
        'tanggal_hasil',
        'created_by',
    ];

    protected $casts = [
        'tanggal_pesanan' => 'datetime',
        'tanggal_hasil' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship with Patient
     */
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'id_pasien');
    }

    /**
     * Relationship with Doctor
     */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'id_dokter');
    }

    /**
     * Relationship with User (creator)
     */
    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for radiology orders by patient
     */
    public function scopeUntukPasien($query, $patientId)
    {
        return $query->where('id_pasien', $patientId);
    }

    /**
     * Scope for radiology orders by doctor
     */
    public function scopeOlehDokter($query, $doctorId)
    {
        return $query->where('id_dokter', $doctorId);
    }

    /**
     * Scope for radiology orders by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status_pesanan', $status);
    }

    /**
     * Scope for radiology orders by urgency
     */
    public function scopeUrgensi($query, $urgensi)
    {
        return $query->where('urgensi', $urgensi);
    }

    /**
     * Scope for radiology orders by date range
     */
    public function scopeTanggalAntara($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_pesanan', [$startDate, $endDate]);
    }

    /**
     * Scope for searching radiology orders
     */
    public function scopeCari($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->whereHas('pasien', function ($patientQuery) use ($search) {
                $patientQuery->where('nama', 'like', "%{$search}%")
                           ->orWhere('mrn', 'like', "%{$search}%");
            })
            ->orWhere('diagnosa_klinis', 'like', "%{$search}%")
            ->orWhere('catatan', 'like', "%{$search}%");
        });
    }
}
