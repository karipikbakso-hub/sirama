<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TandaVital extends Model
{
    use HasFactory;

    protected $table = 't_tanda_vital';

    protected $fillable = [
        'registration_id',
        'patient_id',
        'nurse_id',

        // Tanda Vital
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'heart_rate',
        'temperature',
        'respiration_rate',
        'oxygen_saturation',

        // Antropometri
        'weight',
        'height',
        'bmi',

        // Status dan Catatan
        'status',
        'notes',

        // Timestamp pengukuran
        'measured_at',

        // Audit fields
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'measured_at' => 'datetime',
        'temperature' => 'decimal:1',
        'weight' => 'decimal:1',
        'height' => 'decimal:1',
        'bmi' => 'decimal:1',
    ];

    // Relationships
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function nurse(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nurse_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeForRegistration($query, $registrationId)
    {
        return $query->where('registration_id', $registrationId);
    }

    public function scopeForNurse($query, $nurseId)
    {
        return $query->where('nurse_id', $nurseId);
    }

    public function scopeNormal($query)
    {
        return $query->where('status', 'normal');
    }

    public function scopeWarning($query)
    {
        return $query->where('status', 'warning');
    }

    public function scopeCritical($query)
    {
        return $query->where('status', 'critical');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('measured_at', today());
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('measured_at', 'desc');
    }

    // Helper methods
    public function isNormal(): bool
    {
        return $this->status === 'normal';
    }

    public function isWarning(): bool
    {
        return $this->status === 'warning';
    }

    public function isCritical(): bool
    {
        return $this->status === 'critical';
    }

    public function calculateBMI(): ?float
    {
        if ($this->weight && $this->height) {
            $heightInMeters = $this->height / 100;
            return round($this->weight / ($heightInMeters * $heightInMeters), 1);
        }
        return null;
    }

    public function getFormattedBloodPressure(): string
    {
        if ($this->blood_pressure_systolic && $this->blood_pressure_diastolic) {
            return $this->blood_pressure_systolic . '/' . $this->blood_pressure_diastolic;
        }
        return '-';
    }

    public function getStatusColor(): string
    {
        switch ($this->status) {
            case 'normal':
                return 'green';
            case 'warning':
                return 'yellow';
            case 'critical':
                return 'red';
            default:
                return 'gray';
        }
    }

    public function getVitalSignsSummary(): array
    {
        return [
            'blood_pressure' => $this->getFormattedBloodPressure(),
            'heart_rate' => $this->heart_rate ? $this->heart_rate . ' bpm' : '-',
            'temperature' => $this->temperature ? $this->temperature . ' °C' : '-',
            'respiration_rate' => $this->respiration_rate ? $this->respiration_rate . '/min' : '-',
            'oxygen_saturation' => $this->oxygen_saturation ? $this->oxygen_saturation . ' %' : '-',
            'weight' => $this->weight ? $this->weight . ' kg' : '-',
            'height' => $this->height ? $this->height . ' cm' : '-',
            'bmi' => $this->calculateBMI() ?? '-',
        ];
    }

    // Boot method to auto-calculate BMI
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->weight && $model->height) {
                $model->bmi = $model->calculateBMI();
            }
        });
    }
}
