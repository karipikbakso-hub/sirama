<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QueueSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_date',
        'service_type',
        'start_time',
        'end_time',
        'status',
        'total_expected_patients',
        'total_served_patients',
        'total_skipped_patients',
        'average_wait_time',
        'average_service_time',
        'satisfaction_score',
        'notes',
        'performance_metrics',
    ];

    protected $casts = [
        'session_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'total_expected_patients' => 'integer',
        'total_served_patients' => 'integer',
        'total_skipped_patients' => 'integer',
        'average_wait_time' => 'integer',
        'average_service_time' => 'integer',
        'satisfaction_score' => 'decimal:2',
        'performance_metrics' => 'array',
    ];

    // Relationships
    public function queueLogs(): HasMany
    {
        return $this->hasMany(QueueLog::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeToday($query)
    {
        return $query->where('session_date', today());
    }

    public function scopeByServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    // Helper methods
    public function getTotalPatientsAttribute()
    {
        return $this->total_served_patients + $this->total_skipped_patients;
    }

    public function getCompletionRateAttribute()
    {
        $total = $this->total_patients;
        return $total > 0 ? round(($this->total_served_patients / $total) * 100, 2) : 0;
    }

    public function startSession()
    {
        $this->update([
            'status' => 'active',
            'start_time' => now(),
        ]);
    }

    public function endSession()
    {
        $this->update([
            'status' => 'completed',
            'end_time' => now(),
        ]);
    }
}
