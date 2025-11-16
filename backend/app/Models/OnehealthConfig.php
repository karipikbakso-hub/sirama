<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OnehealthConfig extends Model
{
    protected $table = 'onehealth_config';

    protected $fillable = [
        'name',
        'status',
        'client_id',
        'client_secret',
        'base_url',
        'organization_id',
        'facility_id',
        'additional_config',
        'last_sync_at',
        'notes'
    ];

    protected $casts = [
        'additional_config' => 'array',
        'last_sync_at' => 'datetime'
    ];

    /**
     * Check if SATUSEHAT integration is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Scope for active configurations
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for inactive configurations
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }
}
