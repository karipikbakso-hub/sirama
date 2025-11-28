<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Laboratorium extends Model
{
    use HasFactory;

    protected $table = 't_laboratorium';

    protected $fillable = [
        'registrasi_id',
        'lab_id',
        'dokter_id',
        'tanggal_permintaan',
        'tanggal_hasil',
        'hasil',
        'satuan',
        'nilai_normal',
        'status',
        'tarif',
        'catatan',
    ];

    protected $casts = [
        'tanggal_permintaan' => 'datetime',
        'tanggal_hasil' => 'datetime',
        'tarif' => 'decimal:2',
    ];

    // Enum values
    const STATUS = [
        'diminta' => 'Diminta',
        'proses' => 'Proses',
        'selesai' => 'Selesai',
        'batal' => 'Batal',
    ];

    const PRIORITAS = [
        'rutin' => 'Rutin',
        'cito' => 'Cito',
        'stat' => 'Stat',
    ];

    /**
     * Get the registration that owns the laboratorium.
     */
    public function registrasi(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registrasi_id');
    }

    /**
     * Get the lab test that owns the laboratorium.
     */
    public function labTest(): BelongsTo
    {
        return $this->belongsTo(MasterLaboratorium::class, 'lab_id');
    }

    /**
     * Get the doctor that owns the laboratorium.
     */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dokter_id');
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
            'registrasi_id', // Local key on laboratorium table
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
     * Check if result is abnormal.
     */
    public function getIsAbnormalAttribute(): bool
    {
        if (!$this->hasil || !$this->nilai_normal) {
            return false;
        }

        // Simple check for abnormal results
        // This can be enhanced with more sophisticated logic
        $hasil = floatval($this->hasil);
        $normalRange = $this->nilai_normal;

        // Parse normal range (e.g., "12-16" or "< 10")
        if (preg_match('/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/', $normalRange, $matches)) {
            $min = floatval($matches[1]);
            $max = floatval($matches[2]);
            return $hasil < $min || $hasil > $max;
        }

        return false;
    }

    /**
     * Get result status (normal/abnormal).
     */
    public function getResultStatusAttribute(): string
    {
        return $this->is_abnormal ? 'abnormal' : 'normal';
    }

    /**
     * Scope to get laboratorium by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get laboratorium by doctor.
     */
    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('dokter_id', $doctorId);
    }

    /**
     * Scope to get laboratorium by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_permintaan', [$startDate, $endDate]);
    }

    /**
     * Scope to get completed laboratorium with results.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'selesai')->whereNotNull('hasil');
    }
}
