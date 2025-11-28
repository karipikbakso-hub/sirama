<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pemeriksaan extends Model
{
    use HasFactory;

    protected $table = 't_pemeriksaan';

    protected $fillable = [
        'registration_id',
        'doctor_id',
        'patient_id',

        // Anamnesis (Riwayat)
        'keluhan_utama',
        'riwayat_penyakit_sekarang',
        'riwayat_penyakit_dahulu',
        'riwayat_penyakit_keluarga',
        'riwayat_alergi',
        'riwayat_pengobatan',

        // Pemeriksaan Fisik
        'tanda_vital',
        'keadaan_umum',
        'kesadaran',
        'kepala',
        'mata',
        'telinga',
        'hidung',
        'tenggorokan',
        'leher',
        'thorax',
        'jantung',
        'paru',
        'abdomen',
        'ekstremitas',
        'neurologi',
        'kulit',
        'lain_lain',

        // Diagnosis
        'diagnosis',
        'diagnosis_utama',
        'diagnosis_sekunder',
        'diagnosis_banding',

        // Planning/Treatment
        'tindakan',
        'terapi',
        'rencana_tindak_lanjut',
        'tanggal_kontrol',
        'instruksi_pasien',

        // Status
        'status',
        'tanggal_pemeriksaan',
        'catatan_dokter',

        // Audit fields
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tanggal_pemeriksaan' => 'datetime',
        'tanggal_kontrol' => 'date',
        'tanda_vital' => 'array',
        'diagnosis' => 'array',
        'tindakan' => 'array',
        'terapi' => 'array',
    ];

    // Relationships
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function lampiranPemeriksaan()
    {
        return $this->hasMany(LampiranPemeriksaan::class, 'pemeriksaan_id');
    }

    // Accessors & Mutators
    public function getTandaVitalAttribute($value)
    {
        return json_decode($value, true) ?? [
            'blood_pressure' => '',
            'heart_rate' => '',
            'temperature' => '',
            'respiration_rate' => '',
            'oxygen_saturation' => '',
            'weight' => '',
            'height' => '',
            'bmi' => ''
        ];
    }

    public function getDiagnosisAttribute($value)
    {
        return json_decode($value, true) ?? [];
    }

    public function getTindakanAttribute($value)
    {
        return json_decode($value, true) ?? [];
    }

    public function getTerapiAttribute($value)
    {
        return json_decode($value, true) ?? [];
    }

    // Scopes
    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeForRegistration($query, $registrationId)
    {
        return $query->where('registration_id', $registrationId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('tanggal_pemeriksaan', today());
    }

    // Helper methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function calculateBMI(): ?float
    {
        $vital = $this->tanda_vital;
        if (!empty($vital['weight']) && !empty($vital['height'])) {
            $weight = (float) $vital['weight'];
            $height = (float) $vital['height'] / 100; // convert cm to m
            return round($weight / ($height * $height), 1);
        }
        return null;
    }

    public function getFormattedVitalSigns(): array
    {
        $vital = $this->tanda_vital;
        return [
            'Tekanan Darah' => $vital['blood_pressure'] ?? '-',
            'Detak Jantung' => ($vital['heart_rate'] ?? '-') . ' bpm',
            'Suhu' => ($vital['temperature'] ?? '-') . ' °C',
            'Pernapasan' => ($vital['respiration_rate'] ?? '-') . ' /menit',
            'Saturasi Oksigen' => ($vital['oxygen_saturation'] ?? '-') . ' %',
            'Berat Badan' => ($vital['weight'] ?? '-') . ' kg',
            'Tinggi Badan' => ($vital['height'] ?? '-') . ' cm',
            'BMI' => $this->calculateBMI() ?? '-',
        ];
    }
}
