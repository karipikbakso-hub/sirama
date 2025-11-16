<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Diagnosa extends Model
{
    use HasFactory;

    protected $table = 'm_diagnosa';

    protected $fillable = [
        'kode_icd',
        'nama_diagnosa',
        'deskripsi',
        'kategori',
        'aktif',
    ];

    protected $casts = [
        'aktif' => 'boolean',
    ];

    // Enum values
    const KATEGORI = [
        'penyakit' => 'Penyakit',
        'cedera' => 'Cedera',
        'gejala' => 'Gejala',
        'faktor_eksternal' => 'Faktor Eksternal',
    ];

    /**
     * Get the patient diagnoses for this diagnosis.
     */
    public function diagnosisPasien(): HasMany
    {
        return $this->hasMany(DiagnosisPasien::class, 'diagnosis_id');
    }

    /**
     * Scope to get only active diagnoses.
     */
    public function scopeActive($query)
    {
        return $query->where('aktif', true);
    }

    /**
     * Get the formatted category label.
     */
    public function getKategoriLabelAttribute(): string
    {
        return self::KATEGORI[$this->kategori] ?? $this->kategori;
    }

    /**
     * Get the full diagnosis display name with ICD code.
     */
    public function getFullNameAttribute(): string
    {
        return $this->kode_icd ? "{$this->kode_icd} - {$this->nama_diagnosa}" : $this->nama_diagnosa;
    }
}
