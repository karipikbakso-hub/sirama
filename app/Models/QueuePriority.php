<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueuePriority extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'display_name',
        'priority_level',
        'color_code',
        'icon_class',
        'description',
        'requires_approval',
        'max_wait_time_minutes',
        'auto_call',
        'skip_queue',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'priority_level' => 'integer',
        'requires_approval' => 'boolean',
        'max_wait_time_minutes' => 'integer',
        'auto_call' => 'boolean',
        'skip_queue' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }

    public function scopeEmergency($query)
    {
        return $query->where('code', 'emergency');
    }

    public function scopeVip($query)
    {
        return $query->where('code', 'vip');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('priority_level', 'desc')->orderBy('sort_order');
    }

    // Helper methods
    public function getIsEmergencyAttribute()
    {
        return $this->code === 'emergency';
    }

    public function getIsVipAttribute()
    {
        return $this->code === 'vip';
    }

    public function getIsNormalAttribute()
    {
        return $this->code === 'normal';
    }

    public function canSkipQueue()
    {
        return $this->skip_queue;
    }

    public function shouldAutoCall()
    {
        return $this->auto_call;
    }

    public function requiresApproval()
    {
        return $this->requires_approval;
    }

    public function getPriorityBadgeClass()
    {
        $classes = [
            'normal' => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'urgent' => 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'emergency' => 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'vip' => 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        ];

        return $classes[$this->code] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }

    public function getPriorityIcon()
    {
        $icons = [
            'normal' => 'fa-user',
            'urgent' => 'fa-exclamation-triangle',
            'emergency' => 'fa-ambulance',
            'vip' => 'fa-crown',
        ];

        return $this->icon_class ?? $icons[$this->code] ?? 'fa-user';
    }

    // Static methods for common operations
    public static function getDefaultPriority()
    {
        return static::where('code', 'normal')->first();
    }

    public static function getEmergencyPriority()
    {
        return static::where('code', 'emergency')->first();
    }

    public static function getVipPriority()
    {
        return static::where('code', 'vip')->first();
    }

    public static function getPrioritiesForSelect()
    {
        return static::active()->ordered()->get(['id', 'code', 'display_name', 'color_code']);
    }
}
