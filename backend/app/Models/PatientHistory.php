<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientHistory extends Model
{
    protected $fillable = [
        'patient_id',
        'visit_date',
        'diagnosis',
        'doctor_id',
        'department',
        'treatment',
        'notes',
        'status',
        'vital_signs',
        'weight',
        'height',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'vital_signs' => 'array',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'selesai');
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('visit_date', [$startDate, $endDate]);
    }
}
