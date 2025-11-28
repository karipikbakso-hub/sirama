<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    protected $fillable = [
        'patient_id',
        'from_hospital',
        'to_hospital',
        'referral_reason',
        'urgency_level',
        'status',
        'doctor_id',
        'specialty',
        'medical_summary',
        'diagnostic_results',
        'treatment_history',
        'approval_notes',
        'approved_at',
        'approved_by',
        'rejection_reason',
        'completed_at',
        'completion_notes',
        'attachments',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'attachments' => 'array',
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

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'menunggu');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'disetujui');
    }

    public function scopeByUrgency($query, $level)
    {
        return $query->where('urgency_level', $level);
    }

    public function scopeEmergency($query)
    {
        return $query->where('urgency_level', 'darurat');
    }

    public function scopeByHospital($query, $fromHospital = null, $toHospital = null)
    {
        $query->when($fromHospital, fn($q) => $q->where('from_hospital', $fromHospital))
              ->when($toHospital, fn($q) => $q->where('to_hospital', $toHospital));
        return $query;
    }

    // Accessors
    public function getIsEmergencyAttribute()
    {
        return in_array($this->urgency_level, ['darurat', 'urgent']);
    }

    public function getIsCompletedAttribute()
    {
        return $this->status === 'selesai';
    }
}
