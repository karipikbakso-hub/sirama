<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResepObat extends Model
{
    protected $table = 't_resep_obat';

    protected $fillable = [
        'id_pasien',
        'id_dokter',
        'tanggal_resep',
        'diagnosa',
        'status',
        'catatan',
        'created_by',
    ];

    protected $casts = [
        'tanggal_resep' => 'date',
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
     * Scope for active prescriptions
     */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope for prescriptions by doctor
     */
    public function scopeOlehDokter($query, $doctorId)
    {
        return $query->where('id_dokter', $doctorId);
    }

    /**
     * Scope for prescriptions by patient
     */
    public function scopeUntukPasien($query, $patientId)
    {
        return $query->where('id_pasien', $patientId);
    }

    /**
     * Scope for prescriptions by date range
     */
    public function scopeTanggalAntara($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_resep', [$startDate, $endDate]);
    }

    /**
     * Scope for searching prescriptions
     */
    public function scopeCari($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->whereHas('pasien', function ($patientQuery) use ($search) {
                $patientQuery->where('nama', 'like', "%{$search}%")
                           ->orWhere('mrn', 'like', "%{$search}%");
            })
            ->orWhereHas('dokter', function ($doctorQuery) use ($search) {
                $doctorQuery->where('nama_dokter', 'like', "%{$search}%");
            })
            ->orWhere('diagnosa', 'like', "%{$search}%");
        });
    }
}
