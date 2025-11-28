<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BackupSchedule extends Model
{
    protected $fillable = [
        'name',
        'description',
        'backup_type',
        'frequency',
        'schedule_time',
        'schedule_config',
        'is_active',
        'storage_path',
        'retention_days',
        'compress_backup',
        'encrypt_backup',
        'encryption_key',
        'include_tables',
        'exclude_tables',
        'last_run_at',
        'next_run_at',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'schedule_config' => 'array',
        'include_tables' => 'array',
        'exclude_tables' => 'array',
        'is_active' => 'boolean',
        'compress_backup' => 'boolean',
        'encrypt_backup' => 'boolean',
        'last_run_at' => 'datetime',
        'next_run_at' => 'datetime',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(BackupHistory::class, 'schedule_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDue($query)
    {
        return $query->where('next_run_at', '<=', now());
    }

    // Helper methods
    public function getNextRunTime(): ?\DateTime
    {
        if (!$this->is_active) {
            return null;
        }

        $now = now();
        $scheduleTime = $this->schedule_time;

        switch ($this->frequency) {
            case 'daily':
                $nextRun = $now->copy()->setTimeFromTimeString($scheduleTime);
                if ($nextRun->isPast()) {
                    $nextRun->addDay();
                }
                break;

            case 'weekly':
                $nextRun = $now->copy()->setTimeFromTimeString($scheduleTime);
                $nextRun->next($this->schedule_config['day'] ?? 1); // Default to Monday
                break;

            case 'monthly':
                $nextRun = $now->copy()->setTimeFromTimeString($scheduleTime);
                $nextRun->day($this->schedule_config['day'] ?? 1); // Default to 1st
                if ($nextRun->isPast()) {
                    $nextRun->addMonth();
                }
                break;

            default:
                return null;
        }

        return $nextRun->toDateTime();
    }

    public function updateNextRunTime(): void
    {
        $this->next_run_at = $this->getNextRunTime();
        $this->save();
    }
}
