<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueManagement extends Model
{
    protected $table = 'queue_managements';

    protected $fillable = [
        'doctor_id',
        'service_type',
        'current_number',
        'last_called_number',
        'estimated_wait_time',
        'status',
        'working_hours_start',
        'working_hours_end',
        'max_queue_per_hour',
        'average_consultation_time',
        'queue_date',
        'total_served_today',
        'total_skipped_today',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'date' => 'date',
        'statistics' => 'array',
        'auto_call' => 'boolean',
        'skip_on_no_show' => 'boolean',
    ];

    // Relationships
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByService($query, $serviceName)
    {
        return $query->where('service_name', $serviceName);
    }

    public function scopeToday($query)
    {
        return $query->where('date', today());
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }

    // Accessors & Mutators
    public function getNextNumberAttribute()
    {
        return $this->current_number + 1;
    }

    public function getIsFullAttribute()
    {
        return $this->current_number >= $this->capacity;
    }

    public function getRemainingCapacityAttribute()
    {
        return max(0, $this->capacity - $this->current_number);
    }
}
