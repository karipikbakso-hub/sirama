<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'mrn',
        'name',
        'nik',
        'birth_date',
        'gender',
        'phone',
        'address',
        'emergency_contact',
        'bpjs_number',
        'status'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Generate unique MRN (Medical Record Number)
     */
    public static function generateMRN(): string
    {
        $year = date('Y');
        $lastPatient = self::where('mrn', 'like', "MR-{$year}-%")
                          ->orderBy('id', 'desc')
                          ->first();

        if ($lastPatient) {
            $lastNumber = (int) substr($lastPatient->mrn, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf("MR-%s-%03d", $year, $newNumber);
    }

    /**
     * Get patient's age
     */
    public function getAgeAttribute(): int
    {
        return $this->birth_date->age;
    }

    /**
     * Get patient's full address
     */
    public function getFullAddressAttribute(): string
    {
        return $this->address ?? 'Alamat tidak tercatat';
    }

    /**
     * Relationship with registrations
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * Relationship with medical records
     */
    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    /**
     * Scope for active patients
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for searching patients
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('mrn', 'like', "%{$search}%")
              ->orWhere('nik', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }
}
