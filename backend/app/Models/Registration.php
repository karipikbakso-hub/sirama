<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'registration_no',
        'service_unit',
        'doctor_id',
        'arrival_type',
        'referral_source',
        'payment_method',
        'insurance_number',
        'queue_number',
        'status',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Generate unique registration number
     */
    public static function generateRegistrationNo(): string
    {
        $date = date('Ymd');
        $lastRegistration = self::where('registration_no', 'like', "REG-{$date}-%")
                               ->orderBy('id', 'desc')
                               ->first();

        if ($lastRegistration) {
            $lastNumber = (int) substr($lastRegistration->registration_no, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf("REG-%s-%03d", $date, $newNumber);
    }

    /**
     * Generate queue number based on service unit
     */
    public static function generateQueueNumber(string $serviceUnit): string
    {
        $prefix = match($serviceUnit) {
            'IGD', 'UGD' => 'UGD',
            'Poli Penyakit Dalam' => 'PD',
            'Poli Anak' => 'AK',
            'Poli Kandungan' => 'KN',
            'Poli Bedah' => 'BD',
            'Rawat Inap' => 'RI',
            default => 'PL'
        };

        $today = date('Y-m-d');
        $lastQueue = self::where('queue_number', 'like', "{$prefix}-%")
                        ->whereDate('created_at', $today)
                        ->orderBy('id', 'desc')
                        ->first();

        if ($lastQueue) {
            $lastNumber = (int) substr($lastQueue->queue_number, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf("%s-%03d", $prefix, $newNumber);
    }

    /**
     * Relationship with patient
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Relationship with doctor
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Relationship with creator
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship with medical records
     */
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    /**
     * Scope for today's registrations
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope for pending registrations
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['registered', 'checked-in']);
    }

    /**
     * Scope for completed registrations
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for cancelled registrations
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Check if registration can be updated
     */
    public function canBeUpdated(): bool
    {
        return !in_array($this->status, ['completed', 'cancelled']);
    }

    /**
     * Get status color for UI
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'registered' => 'blue',
            'checked-in' => 'green',
            'completed' => 'purple',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get status text in Indonesian
     */
    public function getStatusText(): string
    {
        return match($this->status) {
            'registered' => 'Terdaftar',
            'checked-in' => 'Check-in',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => $this->status
        };
    }
}
