<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Sep extends Model
{
    protected $fillable = [
        'patient_id',
        'registration_id',
        'sep_number',
        'bpjs_number',
        'service_type',
        'diagnosis',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'status' => 'string',
        'service_type' => 'string',
    ];

    /**
     * Generate unique SEP number
     */
    public static function generateSepNumber(): string
    {
        do {
            $number = 'SEP' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('sep_number', $number)->exists());

        return $number;
    }

    /**
     * Get the patient that owns the SEP
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the registration that owns the SEP
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    /**
     * Get the user who created the SEP
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if SEP can be updated
     */
    public function canBeUpdated(): bool
    {
        return $this->status !== 'rejected';
    }

    /**
     * Check if SEP can be deleted
     */
    public function canBeDeleted(): bool
    {
        return $this->status === 'rejected';
    }
}
