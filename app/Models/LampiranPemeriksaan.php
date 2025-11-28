<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LampiranPemeriksaan extends Model
{
    use HasFactory;

    protected $table = 't_lampiran_pemeriksaan';

    protected $fillable = [
        'pemeriksaan_id',
        'nama_file',
        'path_file',
        'tipe_file',
        'mime_type',
        'ukuran_file',
        'deskripsi',
        'uploaded_by',
        'uploaded_at',
        'aktif',
    ];

    protected $casts = [
        'ukuran_file' => 'integer',
        'uploaded_at' => 'datetime',
        'aktif' => 'boolean',
    ];

    // Relationships
    public function pemeriksaan(): BelongsTo
    {
        return $this->belongsTo(Pemeriksaan::class, 'pemeriksaan_id');
    }

    // Scopes
    public function scopeAktif($query)
    {
        return $query->where('aktif', true);
    }

    public function scopeUntukTipe($query, $tipe)
    {
        return $query->where('tipe_file', $tipe);
    }

    public function scopeUntukPemeriksaan($query, $pemeriksaanId)
    {
        return $query->where('pemeriksaan_id', $pemeriksaanId);
    }

    // Helper methods
    public function getReadableFileSize(): string
    {
        $bytes = $this->ukuran_file;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function isDocument(): bool
    {
        return in_array($this->mime_type, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ]);
    }

    public function getFullPath(): string
    {
        return storage_path('app/public/' . $this->path_file);
    }

    public function getUrl(): string
    {
        return asset('storage/' . $this->path_file);
    }

    public static function getTipeOptions(): array
    {
        return [
            'image' => 'Gambar/Foto',
            'document' => 'Dokumen',
            'lab-result' => 'Hasil Laboratorium',
            'radiology' => 'Hasil Radiologi',
            'prescription' => 'Resep Obat',
            'other' => 'Lainnya',
        ];
    }
}
