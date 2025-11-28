<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BackupHistory extends Model
{
    protected $fillable = [
        'backup_name',
        'filename',
        'backup_type',
        'status',
        'file_size_bytes',
        'file_size_human',
        'file_path',
        'checksum',
        'duration_seconds',
        'started_at',
        'completed_at',
        'error_message',
        'backup_config',
        'statistics',
        'is_compressed',
        'is_encrypted',
        'storage_location',
        'schedule_id',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'backup_config' => 'array',
        'statistics' => 'array',
        'is_compressed' => 'boolean',
        'is_encrypted' => 'boolean',
    ];

    // Relationships
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BackupSchedule::class, 'schedule_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public function getDurationAttribute(): ?string
    {
        if (!$this->started_at || !$this->completed_at) {
            return null;
        }

        $seconds = $this->completed_at->diffInSeconds($this->started_at);
        return $this->formatDuration($seconds);
    }

    private function formatDuration(int $seconds): string
    {
        if ($seconds < 60) {
            return "{$seconds}s";
        }

        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;

        if ($minutes < 60) {
            return $remainingSeconds > 0 ? "{$minutes}m {$remainingSeconds}s" : "{$minutes}m";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return $remainingMinutes > 0 ? "{$hours}h {$remainingMinutes}m" : "{$hours}h";
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(string $error = null): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_message' => $error,
        ]);
    }

    public function isSuccessful(): bool
    {
        return $this->status === 'completed';
    }
}
