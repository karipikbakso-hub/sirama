<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatPengaturan extends Model
{
    use HasFactory;

    protected $table = 'riwayat_pengaturan';

    protected $fillable = [
        'pengaturan_sistem_id',
        'nilai_lama',
        'nilai_baru',
        'diubah_oleh',
    ];

    /**
     * Relasi ke pengaturan sistem
     */
    public function pengaturanSistem(): BelongsTo
    {
        return $this->belongsTo(PengaturanSistem::class, 'pengaturan_sistem_id');
    }

    /**
     * Relasi ke user yang melakukan perubahan
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diubah_oleh');
    }

    /**
     * Get riwayat per pengaturan
     */
    public function scopeByPengaturan($query, $pengaturanId)
    {
        return $query->where('pengaturan_sistem_id', $pengaturanId);
    }

    /**
     * Get riwayat by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('diubah_oleh', $userId);
    }

    /**
     * Order by terbaru
     */
    public function scopeTerbaru($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
