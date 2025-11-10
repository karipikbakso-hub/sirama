<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Patient extends Model implements HasMedia
{
    use InteractsWithMedia;

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

    /**
     * Define media collections for patient files
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('medical-records')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
            ->singleFile(); // One profile picture

        $this->addMediaCollection('x-rays')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/dicom'])
            ->acceptsFileExtensions(['jpg', 'jpeg', 'png', 'dcm']);

        $this->addMediaCollection('lab-results')
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);

        $this->addMediaCollection('prescriptions')
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);
    }
}
