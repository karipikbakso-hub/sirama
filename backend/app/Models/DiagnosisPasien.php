<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiagnosisPasien extends Model
{
    use HasFactory;

    protected $table = 't_diagnosis_pasien';

    protected $fillable = [
        'pasien_id',
        'registrasi_id',
        'diagnosis_id',
        'dokter_id',
        'tipe_diagnosis',
        'kepastian',
        'catatan',
        'tanggal_diagnosis',
    ];

    protected $casts = [
        'tanggal_diagnosis' => 'datetime',
    ];

    // Enum values
    const TIPE_DIAGNOSIS = [
        'utama' => 'Utama',
        'sekunder' => 'Sekunder',
        'komorbiditas' => 'Komorbiditas',
    ];

    const KEPASTIAN = [
        'terkonfirmasi' => 'Terkonfirmasi',
        'presumtif' => 'Presumtif',
        'rule_out' => 'Rule Out',
    ];

    /**
     * Get the patient that owns the diagnosis.
     */
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    /**
     * Get the registration that owns the diagnosis.
     */
    public function registrasi(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registrasi_id');
    }

    /**
     * Get the diagnosis master data.
     */
    public function diagnosis(): BelongsTo
    {
        return $this->belongsTo(Diagnosa::class, 'diagnosis_id');
    }

    /**
     * Get the doctor that created the diagnosis.
     */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dokter_id');
    }

    /**
     * Get the formatted diagnosis type label.
     */
    public function getTipeDiagnosisLabelAttribute(): string
    {
        return self::TIPE_DIAGNOSIS[$this->tipe_diagnosis] ?? $this->tipe_diagnosis;
    }

    /**
     * Get the formatted certainty label.
     */
    public function getKepastianLabelAttribute(): string
    {
        return self::KEPASTIAN[$this->kepastian] ?? $this->kepastian;
    }
}
