<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingQueue extends Model
{
    protected $table = 'nursing_queues';

    protected $fillable = [
        'poli_id',
        'registration_id',
        'queue_number',
        'queue_date',
        'status',
        'called_at',
        'served_at'
    ];

    protected $casts = [
        'queue_date' => 'date',
        'called_at' => 'datetime',
        'served_at' => 'datetime'
    ];

    // Relationships
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }

    public function patient()
    {
        return $this->hasOneThrough(
            Patient::class,
            Registration::class,
            'id', // Foreign key on registrations table
            'id', // Foreign key on patients table
            'registration_id', // Local key on nursing_queues table
            'patient_id' // Local key on registrations table
        );
    }

    // Scopes
    public function scopeByPoliAndDate($query, $poliId, $date)
    {
        return $query->where('poli_id', $poliId)->where('queue_date', $date);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    // Helper methods
    public function getQueueLetter()
    {
        // Extract letter from queue number (e.g., "A-001" -> "A")
        return explode('-', $this->queue_number)[0] ?? 'A';
    }

    public function getQueueNumber()
    {
        // Extract number from queue number (e.g., "A-001" -> "001")
        return explode('-', $this->queue_number)[1] ?? '001';
    }
}
