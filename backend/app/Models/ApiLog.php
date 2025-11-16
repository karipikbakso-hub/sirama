<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiLog extends Model
{
    protected $fillable = [
        'service',
        'endpoint',
        'method',
        'request_data',
        'response_data',
        'status_code',
        'response_time',
        'error_message',
        'request_id',
        'ip_address',
        'user_agent',
        'user_id',
        'environment',
        'is_success'
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'is_success' => 'boolean',
        'response_time' => 'integer',
        'status_code' => 'integer'
    ];

    /**
     * Get the user that made this API request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for successful requests
     */
    public function scopeSuccessful($query)
    {
        return $query->where('is_success', true);
    }

    /**
     * Scope for failed requests
     */
    public function scopeFailed($query)
    {
        return $query->where('is_success', false);
    }

    /**
     * Scope for specific service
     */
    public function scopeService($query, $service)
    {
        return $query->where('service', $service);
    }

    /**
     * Scope for specific environment
     */
    public function scopeEnvironment($query, $environment)
    {
        return $query->where('environment', $environment);
    }
}
