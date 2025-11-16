<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'options',
        'is_editable',
        'requires_restart',
    ];

    protected $casts = [
        'options' => 'array',
        'is_editable' => 'boolean',
        'requires_restart' => 'boolean',
    ];

    /**
     * Get configuration value with proper casting
     */
    public function getCastedValueAttribute()
    {
        return match ($this->type) {
            'boolean' => (bool) $this->value,
            'integer' => (int) $this->value,
            'float' => (float) $this->value,
            'json' => json_decode($this->value, true) ?: [],
            default => $this->value,
        };
    }

    /**
     * Set configuration value with proper casting
     */
    public function setCastedValueAttribute($value)
    {
        $this->value = match ($this->type) {
            'boolean' => $value ? '1' : '0',
            'json' => is_array($value) ? json_encode($value) : $value,
            default => (string) $value,
        };
    }

    /**
     * Get configuration by key with caching
     */
    public static function getValue(string $key, $default = null)
    {
        return Cache::remember(
            "config.{$key}",
            3600, // 1 hour
            function () use ($key, $default) {
                $config = static::where('key', $key)->first();
                return $config ? $config->casted_value : $default;
            }
        );
    }

    /**
     * Set configuration value and clear cache
     */
    public static function setValue(string $key, $value): bool
    {
        $config = static::where('key', $key)->first();

        if ($config && $config->is_editable) {
            $config->casted_value = $value;
            $result = $config->save();

            if ($result) {
                Cache::forget("config.{$key}");
            }

            return $result;
        }

        return false;
    }

    /**
     * Get configurations by group
     */
    public static function getByGroup(string $group)
    {
        return Cache::remember(
            "config.group.{$group}",
            3600,
            fn () => static::where('group', $group)
                          ->where('is_editable', true)
                          ->orderBy('label')
                          ->get()
        );
    }

    /**
     * Clear all configuration cache
     */
    public static function clearCache(): void
    {
        $configs = static::all();
        foreach ($configs as $config) {
            Cache::forget("config.{$config->key}");
        }
        Cache::forget('config.groups');
    }

    /**
     * Get all configuration groups
     */
    public static function getGroups()
    {
        return Cache::remember(
            'config.groups',
            3600,
            fn () => static::distinct('group')->pluck('group')->toArray()
        );
    }
}
