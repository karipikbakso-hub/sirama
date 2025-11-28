<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SatusehatSyncLog extends Model
{
    protected $table = 'satusehat_sync_logs';

    protected $fillable = [
        'patient_id',
        'resource_type',
        'resource_id',
        'local_resource_id',
        'sync_status',
        'sync_attempted_at',
        'sync_completed_at',
        'error_message',
        'fhir_data',
        'request_payload',
        'response_data',
        'retry_count',
        'next_retry_at',
        'sync_batch_id',
        'notes'
    ];

    protected $casts = [
        'sync_attempted_at' => 'datetime',
        'sync_completed_at' => 'datetime',
        'next_retry_at' => 'datetime',
        'fhir_data' => 'array',
        'request_payload' => 'array',
        'response_data' => 'array',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('sync_status', 'pending');
    }

    public function scopeSuccessful($query)
    {
        return $query->where('sync_status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('sync_status', 'failed');
    }

    public function scopeByResourceType($query, $type)
    {
        return $query->where('resource_type', $type);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeReadyForRetry($query)
    {
        return $query->where('sync_status', 'failed')
                    ->where('next_retry_at', '<=', now())
                    ->where('retry_count', '<', 3); // Max 3 retries
    }

    // Accessors
    public function getIsSuccessfulAttribute()
    {
        return $this->sync_status === 'success';
    }

    public function getIsFailedAttribute()
    {
        return $this->sync_status === 'failed';
    }

    public function getCanRetryAttribute()
    {
        return $this->sync_status === 'failed' &&
               $this->retry_count < 3 &&
               (!$this->next_retry_at || $this->next_retry_at->isPast());
    }

    // Methods
    public function markAsSuccessful($resourceId = null, $fhirData = null)
    {
        $this->update([
            'sync_status' => 'success',
            'resource_id' => $resourceId,
            'sync_completed_at' => now(),
            'fhir_data' => $fhirData,
            'error_message' => null,
        ]);
    }

    public function markAsFailed($errorMessage, $responseData = null)
    {
        $this->update([
            'sync_status' => 'failed',
            'sync_attempted_at' => now(),
            'error_message' => $errorMessage,
            'response_data' => $responseData,
            'retry_count' => $this->retry_count + 1,
            'next_retry_at' => $this->calculateNextRetryTime(),
        ]);
    }

    private function calculateNextRetryTime()
    {
        // Exponential backoff: 5min, 30min, 2hours
        $delays = [5, 30, 120]; // minutes
        $retryCount = min($this->retry_count, count($delays) - 1);

        return now()->addMinutes($delays[$retryCount]);
    }
}
