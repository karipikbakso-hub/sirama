<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BpjsConfiguration extends Model
{
    protected $fillable = [
        'api_endpoint',
        'api_key',
        'secret_key',
        'token_expiry',
        'rate_limit',
        'is_active',
        'environment',
        'additional_config',
        'description',
    ];

    protected $casts = [
        'token_expiry' => 'datetime',
        'is_active' => 'boolean',
        'additional_config' => 'array',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByEnvironment($query, $environment)
    {
        return $query->where('environment', $environment);
    }
}
