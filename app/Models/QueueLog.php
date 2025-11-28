<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id',
        'queue_number',
        'action_type',
        'previous_status',
        'new_status',
        'performed_by',
        'service_unit',
        'wait_time_minutes',
        'service_time_minutes',
        'notes',
        'metadata',
        'action_timestamp',
    ];

    protected $casts = [
        'wait_time_minutes' => 'integer',
        'service_time_minutes' => 'integer',
        'metadata' => 'array',
        'action_timestamp' => 'datetime',
    ];

    // Relationships
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function queueSession(): BelongsTo
    {
        return $this->belongsTo(QueueSession::class);
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('action_timestamp', today());
    }

    public function scopeByActionType($query, $actionType)
    {
        return $query->where('action_type', $actionType);
    }

    public function scopeByServiceUnit($query, $serviceUnit)
    {
        return $query->where('service_unit', $serviceUnit);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('performed_by', $userId);
    }

    // Helper methods
    public static function logAction($registrationId, $actionType, $previousStatus = null, $newStatus = null, $performedBy = null, $metadata = [])
    {
        $registration = Registration::find($registrationId);

        if (!$registration) {
            return null;
        }

        return static::create([
            'registration_id' => $registrationId,
            'queue_number' => $registration->queue_number,
            'action_type' => $actionType,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'performed_by' => $performedBy,
            'service_unit' => $registration->service_unit,
            'metadata' => $metadata,
            'action_timestamp' => now(),
        ]);
    }

    public function getActionDescriptionAttribute()
    {
        $descriptions = [
            'called' => 'Dipanggil',
            'skipped' => 'Dilewati',
            'completed' => 'Diselesaikan',
            'reordered' => 'Diurutkan ulang',
            'recalled' => 'Dipanggil ulang',
        ];

        return $descriptions[$this->action_type] ?? ucfirst($this->action_type);
    }

    public function getStatusChangeDescriptionAttribute()
    {
        if ($this->previous_status && $this->new_status) {
            return "{$this->previous_status} → {$this->new_status}";
        }

        return $this->new_status ?? 'N/A';
    }
}
