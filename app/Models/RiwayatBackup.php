<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatBackup extends Model
{
    protected $table = 'riwayat_backup';

    public $timestamps = false; // Karena tabel ini tidak menggunakan created_at dan updated_at standar

    protected $fillable = [
        'jadwal_backup_id',
        'nama_file',
        'ukuran_file',
        'path_file',
        'durasi_detik',
        'status',
        'pesan_error',
        'created_at',
    ];

    protected $casts = [
        'ukuran_file' => 'integer',
        'durasi_detik' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Relasi dengan JadwalBackup
     */
    public function jadwalBackup(): BelongsTo
    {
        return $this->belongsTo(JadwalBackup::class, 'jadwal_backup_id');
    }

    /**
     * Scope untuk status tertentu
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk backup berhasil
     */
    public function scopeBerhasil($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope untuk backup gagal
     */
    public function scopeGagal($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope untuk backup yang sedang berjalan
     */
    public function scopeSedangBerjalan($query)
    {
        return $query->where('status', 'running');
    }
}
