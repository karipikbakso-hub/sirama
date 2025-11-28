<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JadwalBackup extends Model
{
    protected $table = 'jadwal_backup';

    protected $fillable = [
        'nama_jadwal',
        'frekuensi',
        'waktu_eksekusi',
        'hari_eksekusi',
        'status_aktif',
        'terakhir_dijalankan',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
        'waktu_eksekusi' => 'datetime',
        'terakhir_dijalankan' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi dengan RiwayatBackup
     */
    public function riwayatBackups(): HasMany
    {
        return $this->hasMany(RiwayatBackup::class, 'jadwal_backup_id');
    }

    /**
     * Scope untuk jadwal aktif
     */
    public function scopeAktif($query)
    {
        return $query->where('status_aktif', true);
    }

    /**
     * Scope berdasarkan frekuensi
     */
    public function scopeFrekuensi($query, $frekuensi)
    {
        return $query->where('frekuensi', $frekuensi);
    }
}
