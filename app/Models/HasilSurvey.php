<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HasilSurvey extends Model
{
    protected $table = 't_hasil_survey';

    protected $fillable = [
        'patient_id',
        'registration_id',
        'jenis_layanan',
        'tanggal_survey',
        'ratings',
        'nilai_rata_rata',
        'komentar',
        'kelompok_usia',
        'jenis_kelamin',
        'disarankan',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tanggal_survey' => 'date',
        'ratings' => 'array',
        'nilai_rata_rata' => 'decimal:2',
        'disarankan' => 'boolean',
        'patient_id' => 'integer',
        'registration_id' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    // Relasi dengan pasien
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    // Relasi dengan registrasi
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'registration_id');
    }

    // Relasi dengan user yang membuat survey (audit trail)
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes untuk filtering
    public function scopeJenisLayanan($query, $jenisLayanan)
    {
        return $query->where('jenis_layanan', $jenisLayanan);
    }

    public function scopeTanggal($query, $tanggal)
    {
        return $query->whereDate('tanggal_survey', $tanggal);
    }

    public function scopeRangeTanggal($query, $startDate, $endDate = null)
    {
        if ($endDate) {
            return $query->whereBetween('tanggal_survey', [$startDate, $endDate]);
        }
        return $query->whereDate('tanggal_survey', '>=', $startDate);
    }

    public function scopeKelompokUsia($query, $kelompokUsia)
    {
        return $query->where('kelompok_usia', $kelompokUsia);
    }

    public function scopeJenisKelamin($query, $jenisKelamin)
    {
        return $query->where('jenis_kelamin', $jenisKelamin);
    }

    public function scopeNilaiRating($query, $minRating, $maxRating = null)
    {
        if ($maxRating) {
            return $query->whereBetween('nilai_rata_rata', [$minRating, $maxRating]);
        }
        return $query->where('nilai_rata_rata', '>=', $minRating);
    }

    public function scopeDisarankan($query, $disarankan = true)
    {
        return $query->where('disarankan', $disarankan);
    }

    // Helper methods
    public function calculateAverageRating(): float
    {
        if (!isset($this->ratings) || !is_array($this->ratings)) {
            return 0.00;
        }

        $ratings = array_filter(array_values($this->ratings), 'is_numeric');

        if (empty($ratings)) {
            return 0.00;
        }

        return round(array_sum($ratings) / count($ratings), 2);
    }

    public function getRatingLabelAttribute(): string
    {
        $rating = $this->nilai_rata_rata ?? $this->calculateAverageRating();

        if ($rating >= 4.5) return 'Sangat Baik';
        if ($rating >= 4.0) return 'Baik';
        if ($rating >= 3.5) return 'Cukup';
        if ($rating >= 3.0) return 'Kurang';
        return 'Perlu Ditingkatkan';
    }
}
