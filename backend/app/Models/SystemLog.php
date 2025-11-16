<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemLog extends Model
{
    protected $fillable = [
        'level',
        'level_name',
        'message',
        'context',
        'channel',
        'extra',
        'logger_name',
        'logged_at',
        'file',
        'line',
        'function',
        'class',
        'user_id',
        'ip_address',
        'user_agent',
        'request_method',
        'request_url',
        'request_data',
        'session_id',
        'resolved',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
    ];

    protected $casts = [
        'context' => 'array',
        'extra' => 'array',
        'request_data' => 'array',
        'logged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'resolved' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // Scopes
    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeByChannel($query, $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeResolved($query)
    {
        return $query->where('resolved', true);
    }

    public function scopeUnresolved($query)
    {
        return $query->where('resolved', false);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('logged_at', '>=', now()->subDays($days));
    }

    public function scopeToday($query)
    {
        return $query->whereDate('logged_at', today());
    }

    // Helper methods
    public function getLevelColor(): string
    {
        return match ($this->level) {
            'emergency', 'alert', 'critical' => 'red',
            'error' => 'red',
            'warning' => 'yellow',
            'notice' => 'blue',
            'info' => 'blue',
            'debug' => 'gray',
            default => 'gray',
        };
    }

    public function getLevelIcon(): string
    {
        return match ($this->level) {
            'emergency', 'alert', 'critical', 'error' => 'error',
            'warning' => 'warning',
            'notice', 'info' => 'info',
            'debug' => 'bug_report',
            default => 'info',
        };
    }

    public function markAsResolved(?int $userId = null, ?string $notes = null): void
    {
        $this->update([
            'resolved' => true,
            'resolved_at' => now(),
            'resolved_by' => $userId,
            'resolution_notes' => $notes,
        ]);
    }

    public function getStackTrace(): ?string
    {
        if (!$this->extra) {
            return null;
        }

        return $this->extra['exception'] ?? $this->extra['trace'] ?? null;
    }

    public function getFormattedContext(): array
    {
        if (!$this->context) {
            return [];
        }

        // Format context for better display
        $formatted = [];

        foreach ($this->context as $key => $value) {
            if (is_array($value) || is_object($value)) {
                $formatted[$key] = json_encode($value, JSON_PRETTY_PRINT);
            } else {
                $formatted[$key] = $value;
            }
        }

        return $formatted;
    }

    // Static methods for log analysis
    public static function getLogStats($days = 7): array
    {
        $startDate = now()->subDays($days);

        return [
            'total_logs' => self::where('logged_at', '>=', $startDate)->count(),
            'error_logs' => self::where('logged_at', '>=', $startDate)->whereIn('level', ['error', 'critical', 'emergency'])->count(),
            'warning_logs' => self::where('logged_at', '>=', $startDate)->where('level', 'warning')->count(),
            'unresolved_logs' => self::where('logged_at', '>=', $startDate)->where('resolved', false)->count(),
            'most_common_errors' => self::selectRaw('message, COUNT(*) as count')
                ->where('logged_at', '>=', $startDate)
                ->whereIn('level', ['error', 'critical', 'emergency'])
                ->groupBy('message')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get()
                ->toArray(),
        ];
    }
}
