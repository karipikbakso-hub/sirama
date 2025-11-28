<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resep extends Model
{
    use HasFactory;

    protected $table = 't_resep';

    protected $fillable = [
        'no_resep',
        'registrasi_id',
        'dokter_id',
        'tanggal_resep',
        'diagnosa',
        'instruksi',
        'status',
    ];

    protected $casts = [
        'tanggal_resep' => 'date',
    ];

    // Enum values
    const STATUS = [
        'draft' => 'Draft',
        'final' => 'Final',
        'dibuat' => 'Dibuat',
        'selesai' => 'Selesai',
    ];

    /**
     * Get the registration that owns the resep.
     */
    public function registrasi(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registrasi_id');
    }

    /**
     * Get the doctor that owns the resep.
     */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dokter_id');
    }

    /**
     * Get the resep details for the resep.
     */
    public function resepDetails(): HasMany
    {
        return $this->hasMany(ResepDetail::class, 'resep_id');
    }

    /**
     * Get the patient through registration.
     */
    public function pasien()
    {
        return $this->hasOneThrough(
            Patient::class,
            Registration::class,
            'id', // Foreign key on registrations table
            'id', // Foreign key on patients table
            'registrasi_id', // Local key on resep table
            'patient_id' // Local key on registrations table
        );
    }

    /**
     * Get the formatted status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS[$this->status] ?? $this->status;
    }

    /**
     * Calculate total price of the resep.
     */
    public function getTotalAttribute(): float
    {
        return $this->resepDetails->sum('subtotal');
    }

    /**
     * Scope to get resep by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get resep by doctor.
     */
    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('dokter_id', $doctorId);
    }

    /**
     * Scope to get resep by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_resep', [$startDate, $endDate]);
    }
}
