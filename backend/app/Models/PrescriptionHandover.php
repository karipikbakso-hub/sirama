<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescriptionHandover extends Model
{
    protected $fillable = [
        'prescription_id',
        'receiver_name',
        'receiver_relation',
        'handover_at',
        'pharmacist_id',
        'education_checklist',
        'digital_signature',
        'notes',
    ];

    protected $casts = [
        'handover_at' => 'datetime',
        'education_checklist' => 'array',
    ];

    /**
     * Get the prescription that was handed over.
     */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    /**
     * Get the pharmacist who performed the handover.
     */
    public function pharmacist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pharmacist_id');
    }

    /**
     * Get the patient through the prescription.
     */
    public function patient()
    {
        return $this->hasOneThrough(
            Patient::class,
            Prescription::class,
            'id', // Foreign key on prescriptions table
            'id', // Foreign key on patients table
            'prescription_id', // Local key on prescription_handovers table
            'patient_id' // Local key on prescriptions table
        );
    }
}
