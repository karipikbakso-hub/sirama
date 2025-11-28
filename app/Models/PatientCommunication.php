<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientCommunication extends Model
{
    protected $fillable = [
        'patient_id',
        'communication_type',
        'channel',
        'message_content',
        'status',
        'sent_at',
        'delivered_at',
        'read_at',
        'delivery_confirmation',
        'message_id',
        'cost',
        'metadata',
        'error_message',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'cost' => 'decimal:4',
        'metadata' => 'array',
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    // Scopes
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('communication_type', $type);
    }
}
