<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BpjsIntegration extends Model
{
    protected $fillable = [
        'service_type',
        'request_data',
        'response_data',
        'status',
        'response_time_ms',
        'patient_id',
        'bpjs_number',
        'endpoint',
        'error_message',
        'request_id',
        'processed_at',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'processed_at' => 'datetime',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->whereIn('status', ['error', 'timeout']);
    }

    public function scopeByService($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }
}
