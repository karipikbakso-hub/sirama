<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NursingIntervention extends Model
{
    use HasFactory;

    protected $table = 'nursing_interventions';

    protected $fillable = [
        'nic_code',
        'intervention_name',
        'definition',
        'activities',
        'domain',
        'class',
        'active'
    ];

    protected $casts = [
        'active' => 'boolean',
        'activities' => 'array'
    ];

    // Relationships
    public function cpptEntries()
    {
        return $this->belongsToMany(CpptNursingEntry::class, 'cppt_nursing_intervention', 'nursing_intervention_id', 'cppt_nursing_entry_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeByDomain($query, $domain)
    {
        return $query->where('domain', $domain);
    }

    public function scopeByClass($query, $class)
    {
        return $query->where('class', $class);
    }
}