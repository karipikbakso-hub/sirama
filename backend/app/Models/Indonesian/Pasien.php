<?php

namespace App\Models\Indonesian;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Pasien extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'm_pasien';

    protected $fillable = [
        'nomor_rm',
        'nama_lengkap',
        'nik',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat',
        'nomor_telepon',
        'nomor_bpjs',
        'kontak_darurat',
        'golongan_darah',
        'status'
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Generate unique MRN (Medical Record Number)
     */
    public static function generateMRN(): string
    {
        $year = date('Y');
        $lastPatient = self::where('nomor_rm', 'like', "MR-{$year}-%")
                          ->orderBy('id', 'desc')
                          ->first();

        if ($lastPatient) {
            $lastNumber = (int) substr($lastPatient->nomor_rm, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf("MR-%s-%03d", $year, $newNumber);
    }

    /**
     * Get patient's age
     */
    public function getUmurAttribute(): int
    {
        return $this->tanggal_lahir->age;
    }

    /**
     * Get patient's full address
     */
    public function getAlamatLengkapAttribute(): string
    {
        return $this->alamat ?? 'Alamat tidak tercatat';
    }

    /**
     * Relationship with registrations
     */
    public function registrasi(): HasMany
    {
        return $this->hasMany(RegistrasiPasien::class, 'pasien_id');
    }

    /**
     * Relationship with appointments
     */
    public function janjiTemu(): HasMany
    {
        return $this->hasMany(JanjiTemu::class, 'pasien_id');
    }

    /**
     * Relationship with medical history
     */
    public function riwayatPasien(): HasMany
    {
        return $this->hasMany(RiwayatPasien::class, 'pasien_id');
    }

    /**
     * Relationship with communications
     */
    public function komunikasi(): HasMany
    {
        return $this->hasMany(KomunikasiPasien::class, 'pasien_id');
    }

    /**
     * Scope for active patients
     */
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    /**
     * Scope for searching patients
     */
    public function scopeCari($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama_lengkap', 'like', "%{$search}%")
              ->orWhere('nomor_rm', 'like', "%{$search}%")
              ->orWhere('nik', 'like', "%{$search}%")
              ->orWhere('nomor_telepon', 'like', "%{$search}%");
        });
    }

    /**
     * Define media collections for patient files
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('rekam-medis')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
            ->singleFile();

        $this->addMediaCollection('rontgen')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/dicom'])
            ->acceptsFileExtensions(['jpg', 'jpeg', 'png', 'dcm']);

        $this->addMediaCollection('hasil-lab')
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);

        $this->addMediaCollection('resep')
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);
    }
}
