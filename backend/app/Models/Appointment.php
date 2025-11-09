<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'created_by',
        'appointment_date',
        'appointment_time',
        'service_type',
        'status',
        'notes',
        'reminder_sent',
        'reminder_sent_at',
        'reminder_channel',
        'cancellation_reason',
        'cancelled_at',
        'completed_at',
        'follow_up_notes',
        'consultation_fee',
        'is_paid',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'reminder_sent' => 'boolean',
        'reminder_sent_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'consultation_fee' => 'decimal:2',
        'is_paid' => 'boolean',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    // Scopes
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeToday($query)
    {
        return $query->where('appointment_date', today());
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('appointment_date', $date);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    // Accessors
    public function getIsUpcomingAttribute()
    {
        return $this->appointment_date->isFuture() || ($this->appointment_date->isToday() && $this->appointment_time->isFuture());
    }

    public function getIsPastAttribute()
    {
        return $this->appointment_date->isPast() || ($this->appointment_date->isToday() && $this->appointment_time->isPast());
    }
}
