<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Triase extends Model
{
    use HasFactory;

    protected $table = 't_triase';

    protected $fillable = [
        'registration_id',
        'patient_id',
        'nurse_id',

        // Triase data
        'triage_level',
        'chief_complaint',
        'vital_signs',
        'priority',
        'estimated_wait_time',
        'notes',

        // Triase timestamp
        'triage_time',

        // Audit fields
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'vital_signs' => 'array',
        'triage_time' => 'datetime',
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

    public function scopeByLevel($query, $level)
    {
        return $query->where('triage_level', $level);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('triage_time', today());
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('triage_time', 'desc');
    }

    // Helper methods
    public function getTriageLevelInfo(): array
    {
        switch ($this->triage_level) {
            case 1:
                return [
                    'color' => 'red',
                    'text' => 'Level 1 - Resusitasi',
                    'description' => 'Kegawatan yang mengancam jiwa',
                    'wait_time' => 'Immediate'
                ];
            case 2:
                return [
                    'color' => 'orange',
                    'text' => 'Level 2 - Emergensi',
                    'description' => 'Kegawatan tinggi',
                    'wait_time' => '< 10 menit'
                ];
            case 3:
                return [
                    'color' => 'yellow',
                    'text' => 'Level 3 - Urgent',
                    'description' => 'Kegawatan sedang',
                    'wait_time' => '30-60 menit'
                ];
            case 4:
                return [
                    'color' => 'green',
                    'text' => 'Level 4 - Semi Urgent',
                    'description' => 'Kegawatan rendah',
                    'wait_time' => '2-4 jam'
                ];
            case 5:
                return [
                    'color' => 'blue',
                    'text' => 'Level 5 - Non Urgent',
                    'description' => 'Kegawatan minimal',
                    'wait_time' => '4-6 jam'
                ];
            default:
                return [
                    'color' => 'gray',
                    'text' => 'Unknown',
                    'description' => '',
                    'wait_time' => ''
                ];
        }
    }

    public function getPriorityColor(): string
    {
        switch ($this->priority) {
            case 'immediate':
                return 'red';
            case 'urgent':
                return 'orange';
            case 'standard':
                return 'yellow';
            case 'non_urgent':
                return 'blue';
            default:
                return 'gray';
        }
    }

    public function getVitalSignsSummary(): array
    {
        $vitals = $this->vital_signs ?? [];

        return [
            'blood_pressure' => $vitals['bloodPressure'] ?? '-',
            'heart_rate' => $vitals['heartRate'] ? $vitals['heartRate'] . ' bpm' : '-',
            'temperature' => $vitals['temperature'] ? $vitals['temperature'] . ' °C' : '-',
            'respiration_rate' => $vitals['respirationRate'] ? $vitals['respirationRate'] . '/min' : '-',
            'oxygen_saturation' => $vitals['oxygenSaturation'] ? $vitals['oxygenSaturation'] . ' %' : '-',
            'pain_scale' => $vitals['painScale'] ?? '-',
            'consciousness' => $vitals['consciousness'] ?? '-',
        ];
    }

    public function isEmergency(): bool
    {
        return $this->triage_level <= 2;
    }

    public function isUrgent(): bool
    {
        return $this->triage_level <= 3;
    }
}
