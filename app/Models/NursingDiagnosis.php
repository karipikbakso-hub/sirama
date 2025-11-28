<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NursingDiagnosis extends Model
{
    use HasFactory;

    protected $table = 'nursing_diagnoses';

    protected $fillable = [
        'nanda_code',
        'diagnosis_name',
        'definition',
        'defining_characteristics',
        'related_factors',
        'domain',
        'class',
        'active'
    ];

    protected $casts = [
        'active' => 'boolean',
        'defining_characteristics' => 'array',
        'related_factors' => 'array'
    ];

    // Relationships
    public function cpptEntries()
    {
        return $this->belongsToMany(CpptNursingEntry::class, 'cppt_nursing_diagnosis', 'nursing_diagnosis_id', 'cppt_nursing_entry_id');
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