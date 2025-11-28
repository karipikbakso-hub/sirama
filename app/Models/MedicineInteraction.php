<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicineInteraction extends Model
{
    use HasFactory;

    protected $table = 'medicine_interactions';

    protected $fillable = [
        'medicine1_id',
        'medicine2_id',
        'severity',
        'description',
        'management',
        'reference'
    ];

    protected $casts = [
        'severity' => 'string',
    ];

    /**
     * Get the first medicine in the interaction.
     */
    public function medicine1(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine1_id');
    }

    /**
     * Get the second medicine in the interaction.
     */
    public function medicine2(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine2_id');
    }

    /**
     * Scope for interactions involving a specific medicine.
     */
    public function scopeInvolving($query, $medicineId)
    {
        return $query->where(function($q) use ($medicineId) {
            $q->where('medicine1_id', $medicineId)
              ->orWhere('medicine2_id', $medicineId);
        });
    }

    /**
     * Scope for specific severity level.
     */
    public function scopeSeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Get formatted severity color.
     */
    public function getSeverityColorAttribute()
    {
        return match($this->severity) {
            'major' => 'red',
            'moderate' => 'orange',
            'minor' => 'yellow',
            default => 'yellow'
        };
    }
}
