<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class PengaturanSistem extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_sistem';

    protected $fillable = [
        'kategori',
        'kunci',
        'nilai',
        'tipe_data',
        'deskripsi',
        'is_sensitif',
    ];

    protected $casts = [
        'is_sensitif' => 'boolean',
    ];

    protected $hidden = ['nilai_encrypted'];

    protected $appends = ['nilai_decrypted', 'nilai_cast'];

    /**
     * Relasi ke riwayat pengaturan
     */
    public function riwayatPengaturan(): HasMany
    {
        return $this->hasMany(RiwayatPengaturan::class, 'pengaturan_sistem_id');
    }

    /**
     * Otomatis log perubahan ke riwayat
     */
    protected static function booted()
    {
        static::updating(function ($pengaturan) {
            RiwayatPengaturan::create([
                'pengaturan_sistem_id' => $pengaturan->id,
                'nilai_lama' => $pengaturan->getOriginal('nilai'),
                'nilai_baru' => $pengaturan->nilai,
                'diubah_oleh' => auth()->id(),
            ]);
        });
    }

    /**
     * Get nilai decrypted (untuk nilai yang dienkripsi)
     */
    public function getNilaiDecryptedAttribute()
    {
        if ($this->is_sensitif && $this->nilai) {
            try {
                return Crypt::decryptString($this->nilai);
            } catch (\Exception $e) {
                return null;
            }
        }
        return $this->nilai;
    }

    /**
     * Set nilai dengan enkripsi untuk data sensitif
     */
    public function setNilaiAttribute($value)
    {
        if ($this->is_sensitif && $value) {
            $this->attributes['nilai'] = Crypt::encryptString($value);
        } else {
            $this->attributes['nilai'] = $value;
        }
    }

    /**
     * Get nilai dengan type casting sesuai tipe_data
     */
    public function getNilaiCastAttribute()
    {
        $value = $this->nilai_decrypted ?: $this->nilai;

        if (!$value) return null;

        return match ($this->tipe_data) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'json' => json_decode($value, true) ?: [],
            'enum' => $value,
            default => (string) $value,
        };
    }

    /**
     * Get pengaturan by kunci dengan caching
     */
    public static function getByKunci(string $kunci, $default = null)
    {
        return Cache::remember(
            "pengaturan:{$kunci}",
            3600, // 1 hour
            function () use ($kunci, $default) {
                $pengaturan = static::where('kunci', $kunci)->first();
                return $pengaturan ? $pengaturan->nilai_cast : $default;
            }
        );
    }

    /**
     * Set pengaturan by kunci dengan clear cache
     */
    public static function setByKunci(string $kunci, $nilai): bool
    {
        $pengaturan = static::where('kunci', $kunci)->first();

        if ($pengaturan) {
            $pengaturan->nilai = $nilai;
            $result = $pengaturan->save();

            if ($result) {
                Cache::forget("pengaturan:{$kunci}");
                Cache::forget("pengaturan:kategori:{$pengaturan->kategori}");
            }

            return $result;
        }

        return false;
    }

    /**
     * Get pengaturan by kategori
     */
    public static function getByKategori(string $kategori)
    {
        return Cache::remember(
            "pengaturan:kategori:{$kategori}",
            3600,
            fn () => static::where('kategori', $kategori)
                          ->orderBy('kunci')
                          ->get()
        );
    }

    /**
     * Get semua kategori yang tersedia
     */
    public static function getKategori()
    {
        return Cache::remember(
            'pengaturan:kategori:all',
            3600,
            fn () => static::distinct('kategori')->pluck('kategori')->toArray()
        );
    }

    /**
     * Clear semua cache pengaturan
     */
    public static function clearCache(): void
    {
        $pengaturan = static::all();
        foreach ($pengaturan as $item) {
            Cache::forget("pengaturan:{$item->kunci}");
        }
        Cache::forget('pengaturan:kategori:all');
        $kategori = static::distinct('kategori')->pluck('kategori');
        foreach ($kategori as $kat) {
            Cache::forget("pengaturan:kategori:{$kat}");
        }
    }

    /**
     * Scopes untuk filtering
     */
    public function scopeKategori($query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    public function scopeSensitif($query)
    {
        return $query->where('is_sensitif', true);
    }

    public function scopeNonSensitif($query)
    {
        return $query->where('is_sensitif', false);
    }
}
