<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_name',
        'action',
        'resource_type',
        'description',
        'level',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array'
    ];

    /**
     * Scope for filtering by action
     */
    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for filtering by resource type
     */
    public function scopeModule($query, $module)
    {
        return $query->where('resource_type', $module);
    }

    /**
     * Scope for filtering by user
     */
    public function scopeUser($query, $userName)
    {
        return $query->where('user_name', $userName);
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get the module name based on resource_type
     */
    public function getModuleName()
    {
        return self::getModuleNameFromResourceType($this->resource_type);
    }

    /**
     * Get the status based on level
     */
    public function getStatusAttribute()
    {
        return match($this->level) {
            'error' => 'error',
            'warning' => 'warning',
            'info' => 'info',
            default => 'success'
        };
    }

    /**
     * Get user name
     */
    public function getUserName()
    {
        return $this->user_name ?? 'System';
    }

    /**
     * Static method to get module name from resource type
     */
    public static function getModuleNameFromResourceType($resourceType)
    {
        $modules = [
            'user' => 'User Management',
            'patient' => 'Patient Management',
            'registration' => 'Registration',
            'appointment' => 'Appointments',
            'prescription' => 'Prescription',
            'lab_order' => 'Laboratory',
            'radiology_order' => 'Radiology',
            'billing' => 'Billing',
            'payment' => 'Payments',
            'system_config' => 'System Configuration',
            'role' => 'Role Management',
            'permission' => 'Permission Management',
            'audit_log' => 'Audit System',
            'api_log' => 'API Integration',
            'backup' => 'System Backup',
            'report' => 'Reports'
        ];

        return $modules[$resourceType] ?? ucfirst(str_replace('_', ' ', $resourceType ?? 'system'));
    }

    /**
     * Static method to get module label from module value (alias for compat)
     */
    public static function getModuleLabel($module)
    {
        return self::getModuleNameFromResourceType($module);
    }

    /**
     * Relationship with User model (if user_id exists)
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}
