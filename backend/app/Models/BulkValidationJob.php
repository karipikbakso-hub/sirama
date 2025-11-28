<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BulkValidationJob extends Model
{
    protected $fillable = [
        'total_seps',
        'batch_size',
        'status', // processing, completed, failed, queued
        'initiated_by',
        'force_revalidate',
        'current_batch',
        'total_batches',
        'processed_seps',
        'progress_percentage',
        'successful_validations',
        'failed_validations',
        'started_at',
        'completed_at',
        'estimated_completion',
        'error_message',
    ];

    protected $casts = [
        'force_revalidate' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'estimated_completion' => 'datetime',
    ];

    /**
     * Get the user who initiated the job
     */
    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    /**
     * Check if job is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if job is processing
     */
    public function isProcessing(): bool
    {
        return in_array($this->status, ['processing', 'queued']);
    }

    /**
     * Check if job failed
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Get remaining SEPs to process
     */
    public function getRemaining(): int
    {
        return $this->total_seps - $this->processed_seps;
    }

    /**
     * Get processing progress as float (0.0 to 1.0)
     */
    public function getProgressRatio(): float
    {
        if ($this->total_seps === 0) return 0.0;
        return min(1.0, $this->processed_seps / $this->total_seps);
    }
}
