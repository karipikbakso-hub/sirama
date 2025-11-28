<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyRegistration extends Model
{
    protected $fillable = [
        'patient_id',
        'emergency_type',
        'severity',
        'arrival_time',
        'triage_level',
        'symptoms',
        'vital_signs',
        'status',
        'initial_diagnosis',
        'treatment_given',
        'room_assigned',
        'doctor_assigned',
        'nurse_assigned',
        'discharge_time',
        'discharge_notes',
    ];

    protected $casts = [
        'arrival_time' => 'datetime',
        'vital_signs' => 'array',
        'discharge_time' => 'datetime',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctorAssigned(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_assigned');
    }

    public function nurseAssigned(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nurse_assigned');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['menunggu', 'dalam_perawatan']);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByTriageLevel($query, $level)
    {
        return $query->where('triage_level', $level);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('arrival_time', today());
    }
}
