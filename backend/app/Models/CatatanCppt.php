<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatatanCppt extends Model
{
    protected $table = 't_catatan_cppt';

    protected $fillable = [
        'id_pasien',
        'id_dokter',
        'tanggal_waktu',
        'subjective',
        'objective',
        'assessment',
        'plan',
        'instruksi',
        'evaluasi',
        'jenis_profesi',
        'created_by',
    ];

    protected $casts = [
        'tanggal_waktu' => 'datetime',
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
     * Scope for CPPT entries by patient
     */
    public function scopeUntukPasien($query, $patientId)
    {
        return $query->where('id_pasien', $patientId);
    }

    /**
     * Scope for CPPT entries by doctor
     */
    public function scopeOlehDokter($query, $doctorId)
    {
        return $query->where('id_dokter', $doctorId);
    }

    /**
     * Scope for CPPT entries by profession type
     */
    public function scopeJenisProfesi($query, $jenisProfesi)
    {
        return $query->where('jenis_profesi', $jenisProfesi);
    }

    /**
     * Scope for CPPT entries by date range
     */
    public function scopeTanggalAntara($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_waktu', [$startDate, $endDate]);
    }

    /**
     * Scope for searching CPPT entries
     */
    public function scopeCari($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->whereHas('pasien', function ($patientQuery) use ($search) {
                $patientQuery->where('nama', 'like', "%{$search}%")
                           ->orWhere('mrn', 'like', "%{$search}%");
            })
            ->orWhere('subjective', 'like', "%{$search}%")
            ->orWhere('objective', 'like', "%{$search}%")
            ->orWhere('assessment', 'like', "%{$search}%")
            ->orWhere('plan', 'like', "%{$search}%");
        });
    }
}
