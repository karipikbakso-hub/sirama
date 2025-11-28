<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueAnnouncement extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_code',
        'template_name',
        'announcement_type',
        'language',
        'voice_template',
        'display_template',
        'voice_gender',
        'voice_speed',
        'voice_pitch',
        'repeat_count',
        'repeat_interval_seconds',
        'is_active',
        'priority_level',
        'variables',
        'notes',
    ];

    protected $casts = [
        'voice_speed' => 'decimal:2',
        'voice_pitch' => 'integer',
        'repeat_count' => 'integer',
        'repeat_interval_seconds' => 'integer',
        'is_active' => 'boolean',
        'priority_level' => 'integer',
        'variables' => 'array',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('announcement_type', $type);
    }

    public function scopeVoice($query)
    {
        return $query->whereIn('announcement_type', ['voice', 'both']);
    }

    public function scopeDisplay($query)
    {
        return $query->whereIn('announcement_type', ['display', 'both']);
    }

    public function scopeByLanguage($query, $language)
    {
        return $query->where('language', $language);
    }

    public function scopeByPriority($query, $minPriority = 1)
    {
        return $query->where('priority_level', '>=', $minPriority);
    }

    // Helper methods
    public function isVoiceEnabled()
    {
        return in_array($this->announcement_type, ['voice', 'both']);
    }

    public function isDisplayEnabled()
    {
        return in_array($this->announcement_type, ['display', 'both']);
    }

    public function renderVoiceText(array $data = [])
    {
        return $this->renderTemplate($this->voice_template, $data);
    }

    public function renderDisplayText(array $data = [])
    {
        return $this->renderTemplate($this->display_template, $data);
    }

    protected function renderTemplate($template, array $data = [])
    {
        if (!$template) {
            return '';
        }

        // Replace variables in template
        foreach ($data as $key => $value) {
            $template = str_replace("{{$key}}", $value, $template);
        }

        return $template;
    }

    public function getVoiceSettings()
    {
        return [
            'gender' => $this->voice_gender,
            'speed' => $this->voice_speed,
            'pitch' => $this->voice_pitch,
            'language' => $this->language,
        ];
    }

    public function getAnnouncementSettings()
    {
        return [
            'repeat_count' => $this->repeat_count,
            'repeat_interval' => $this->repeat_interval_seconds,
            'priority' => $this->priority_level,
        ];
    }

    // Static methods for common operations
    public static function getTemplateByCode($code)
    {
        return static::where('template_code', $code)->active()->first();
    }

    public static function getCallTemplate($priority = 'normal')
    {
        $templateCode = "call_{$priority}";

        // Fallback to normal if specific priority template doesn't exist
        $template = static::getTemplateByCode($templateCode);
        if (!$template) {
            $template = static::getTemplateByCode('call_normal');
        }

        return $template;
    }

    public static function getCompleteTemplate()
    {
        return static::getTemplateByCode('complete_service');
    }

    public static function getSkipTemplate()
    {
        return static::getTemplateByCode('skip_patient');
    }

    public static function getEmergencyTemplate()
    {
        return static::getTemplateByCode('call_emergency');
    }

    public static function getVipTemplate()
    {
        return static::getTemplateByCode('call_vip');
    }

    public static function getAnnouncementQueue()
    {
        // This would return announcements ordered by priority for processing
        return static::active()
                    ->orderBy('priority_level', 'desc')
                    ->orderBy('created_at', 'asc')
                    ->get();
    }

    // Template validation
    public function validateTemplate()
    {
        $errors = [];

        if ($this->isVoiceEnabled() && empty($this->voice_template)) {
            $errors[] = 'Voice template is required for voice announcements';
        }

        if ($this->isDisplayEnabled() && empty($this->display_template)) {
            $errors[] = 'Display template is required for display announcements';
        }

        if ($this->variables) {
            $voiceVars = $this->extractVariables($this->voice_template);
            $displayVars = $this->extractVariables($this->display_template);

            $allVars = array_unique(array_merge($voiceVars, $displayVars));

            foreach ($allVars as $var) {
                if (!in_array($var, $this->variables ?? [])) {
                    $errors[] = "Variable '{$var}' used in template but not defined";
                }
            }
        }

        return $errors;
    }

    protected function extractVariables($template)
    {
        if (!$template) {
            return [];
        }

        preg_match_all('/\{([^}]+)\}/', $template, $matches);
        return $matches[1] ?? [];
    }
}
