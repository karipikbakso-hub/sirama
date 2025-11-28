<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'counter_number',
        'counter_name',
        'service_type',
        'location',
        'status',
        'current_user_id',
        'current_registration_id',
        'last_activity',
        'total_served_today',
        'average_service_time',
        'is_priority_counter',
        'supported_priorities',
        'notes',
    ];

    protected $casts = [
        'last_activity' => 'datetime',
        'total_served_today' => 'integer',
        'average_service_time' => 'integer',
        'is_priority_counter' => 'boolean',
        'supported_priorities' => 'array',
    ];

    // Relationships
    public function currentUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_user_id');
    }

    public function currentRegistration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'current_registration_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    public function scopePriorityCounters($query)
    {
        return $query->where('is_priority_counter', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'active')
                    ->whereNull('current_registration_id');
    }

    // Helper methods
    public function isAvailable()
    {
        return $this->status === 'active' && !$this->current_registration_id;
    }

    public function isBusy()
    {
        return $this->status === 'active' && $this->current_registration_id;
    }

    public function canHandlePriority($priorityCode)
    {
        if (!$this->supported_priorities) {
            return true; // If no specific priorities set, can handle all
        }

        return in_array($priorityCode, $this->supported_priorities);
    }

    public function assignPatient(Registration $registration, User $user = null)
    {
        $this->update([
            'current_registration_id' => $registration->id,
            'current_user_id' => $user?->id,
            'last_activity' => now(),
        ]);

        return $this;
    }

    public function releasePatient()
    {
        $this->update([
            'current_registration_id' => null,
            'current_user_id' => null,
            'last_activity' => now(),
            'total_served_today' => $this->total_served_today + 1,
        ]);

        return $this;
    }

    public function getStatusBadgeClass()
    {
        $classes = [
            'active' => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'inactive' => 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            'maintenance' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'offline' => 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        ];

        return $classes[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    public function getStatusText()
    {
        $texts = [
            'active' => 'Aktif',
            'inactive' => 'Tidak Aktif',
            'maintenance' => 'Maintenance',
            'offline' => 'Offline',
        ];

        return $texts[$this->status] ?? $this->status;
    }

    public function getUtilizationRate()
    {
        // This would need to be calculated based on operational hours
        // For now, return a simple calculation
        $totalPossibleMinutes = 8 * 60; // 8 hours
        $usedMinutes = $this->total_served_today * $this->average_service_time;

        return $totalPossibleMinutes > 0
            ? min(100, round(($usedMinutes / $totalPossibleMinutes) * 100, 1))
            : 0;
    }

    // Static methods
    public static function getAvailableCounters($serviceType = null, $priorityCode = null)
    {
        $query = static::available();

        if ($serviceType) {
            $query->where('service_type', $serviceType);
        }

        if ($priorityCode) {
            $query->where(function ($q) use ($priorityCode) {
                $q->whereNull('supported_priorities')
                  ->orWhereJsonContains('supported_priorities', $priorityCode);
            });
        }

        return $query->get();
    }

    public static function findBestCounter(Registration $registration)
    {
        // Find available counters that can handle this registration's priority
        $availableCounters = static::getAvailableCounters(
            $registration->service_unit,
            $registration->priority ?? 'normal'
        );

        if ($availableCounters->isEmpty()) {
            return null;
        }

        // Prefer priority counters for high-priority patients
        $priorityCounters = $availableCounters->filter->is_priority_counter;

        if ($registration->priority !== 'normal' && $priorityCounters->isNotEmpty()) {
            return $priorityCounters->first();
        }

        // Otherwise, return the first available counter
        return $availableCounters->first();
    }
}
