<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MobileJknAppointment extends Model
{
    protected $fillable = [
        'patient_id',
        'bpjs_number',
        'booking_code',
        'source',
        'appointment_date',
        'appointment_time',
        'doctor_name',
        'poli_name',
        'status',
        'jkn_data',
        'sync_status',
        'synced_at',
        'last_sync_attempt',
        'sync_error',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'jkn_data' => 'array',
        'synced_at' => 'datetime',
        'last_sync_attempt' => 'datetime',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    // Scopes
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByBpjsNumber($query, $bpjsNumber)
    {
        return $query->where('bpjs_number', $bpjsNumber);
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('appointment_date', $date);
    }

    public function scopeToday($query)
    {
        return $query->where('appointment_date', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('appointment_date', '>=', today())
                    ->where('status', 'scheduled');
    }

    public function scopeFromJkn($query)
    {
        return $query->where('source', 'jkn');
    }

    public function scopeSyncPending($query)
    {
        return $query->where('sync_status', 'pending');
    }

    public function scopeSyncSuccess($query)
    {
        return $query->where('sync_status', 'success');
    }

    public function scopeSyncFailed($query)
    {
        return $query->where('sync_status', 'failed');
    }

    // Accessors
    public function getIsUpcomingAttribute()
    {
        return $this->appointment_date->isFuture() ||
               ($this->appointment_date->isToday() && $this->appointment_time->isFuture());
    }

    public function getIsPastAttribute()
    {
        return $this->appointment_date->isPast() ||
               ($this->appointment_date->isToday() && $this->appointment_time->isPast());
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red',
            'no_show' => 'gray',
            default => 'gray'
        };
    }

    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'scheduled' => 'Terjadwal',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'no_show' => 'Tidak Hadir',
            default => $this->status
        };
    }

    // Methods
    public function markAsSynced()
    {
        $this->update([
            'sync_status' => 'success',
            'synced_at' => now(),
            'last_sync_attempt' => now(),
            'sync_error' => null,
        ]);
    }

    public function markAsFailed($error = null)
    {
        $this->update([
            'sync_status' => 'failed',
            'last_sync_attempt' => now(),
            'sync_error' => $error,
        ]);
    }

    public function updateFromJknData(array $jknData)
    {
        $this->update([
            'jkn_data' => $jknData,
            'status' => $this->mapJknStatus($jknData['status'] ?? null),
            'doctor_name' => $jknData['doctor_name'] ?? $this->doctor_name,
            'poli_name' => $jknData['poli_name'] ?? $this->poli_name,
            'appointment_time' => $jknData['appointment_time'] ?? $this->appointment_time,
        ]);
    }

    private function mapJknStatus($jknStatus)
    {
        return match($jknStatus) {
            'scheduled', 'active' => 'scheduled',
            'completed', 'done' => 'completed',
            'cancelled', 'canceled' => 'cancelled',
            'no_show', 'absent' => 'no_show',
            default => $this->status
        };
    }
}
