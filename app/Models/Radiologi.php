<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Radiologi extends Model
{
    protected $table = 't_radiologi';

    protected $fillable = [
        'registrasi_id',
        'radio_id',
        'dokter_id',
        'tanggal_permintaan',
        'tanggal_hasil',
        'hasil',
        'kesan',
        'status',
        'tarif',
        'catatan',
        'diagnosa_klinis',
        'urgensi',
    ];

    protected $casts = [
        'tanggal_permintaan' => 'datetime',
        'tanggal_hasil' => 'datetime',
        'tarif' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship with Registration
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registrasi_id');
    }

    /**
     * Alias for backward compatibility
     */
    public function registrasi(): BelongsTo
    {
        return $this->registration();
    }

    /**
     * Relationship with Master Radiologi
     */
    public function masterRadiologi(): BelongsTo
    {
        return $this->belongsTo(MasterRadiologi::class, 'radio_id');
    }

    /**
     * Alias for backward compatibility
     */
    public function master_radiologi(): BelongsTo
    {
        return $this->masterRadiologi();
    }

    /**
     * Relationship with Doctor
     */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'dokter_id');
    }

    /**
     * Scope for radiology orders by patient
     */
    public function scopeUntukPasien($query, $patientId)
    {
        return $query->whereHas('registrasi', function ($q) use ($patientId) {
            $q->where('patient_id', $patientId);
        });
    }

    /**
     * Scope for radiology orders by doctor
     */
    public function scopeOlehDokter($query, $doctorId)
    {
        return $query->where('dokter_id', $doctorId);
    }

    /**
     * Scope for radiology orders by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for radiology orders by date range
     */
    public function scopeTanggalAntara($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_permintaan', [$startDate, $endDate]);
    }

    /**
     * Scope for searching radiology orders
     */
    public function scopeCari($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->whereHas('registrasi.pasien', function ($patientQuery) use ($search) {
                $patientQuery->where('nama', 'like', "%{$search}%")
                           ->orWhere('mrn', 'like', "%{$search}%");
            })
            ->orWhereHas('masterRadiologi', function ($radioQuery) use ($search) {
                $radioQuery->where('nama_pemeriksaan', 'like', "%{$search}%");
            })
            ->orWhere('hasil', 'like', "%{$search}%")
            ->orWhere('kesan', 'like', "%{$search}%")
            ->orWhere('catatan', 'like', "%{$search}%");
        });
    }
}
