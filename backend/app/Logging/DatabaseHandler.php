<?php

namespace App\Logging;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Processor\PsrLogMessageProcessor;

class DatabaseHandler extends AbstractProcessingHandler
{
    /**
     * @var string
     */
    private $table;

    /**
     * @param string $table
     * @param int $level
     * @param bool $bubble
     */
    public function __construct($table = 'system_logs', $level = 0, $bubble = true)
    {
        $this->table = $table;
        parent::__construct($level, $bubble);
    }

    /**
     * @param array|\Monolog\LogRecord $record
     */
    protected function write(array|\Monolog\LogRecord $record): void
    {
        try {
            // Sanitize sensitive data
            $record = $this->sanitizeRecord($record);

            // Create system log record
            SystemLog::create([
                'level' => $record['level_name'] ?? $this->getLevelName($record['level']),
                'level_name' => $record['level_name'] ?? $this->getLevelName($record['level']),
                'message' => $record['message'] ?? '',
                'context' => !empty($record['context']) ? $record['context'] : null,
                'channel' => $record['channel'] ?? 'database',
                'extra' => !empty($record['extra']) ? $record['extra'] : null,
                'logger_name' => $record['logger_name'] ?? null,
                'logged_at' => now(),
                'file' => $record['file'] ?? null,
                'line' => $record['line'] ?? null,
                'function' => $record['function'] ?? null,
                'class' => $record['class'] ?? null,
                'user_id' => $this->getCurrentUserId(),
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'request_method' => Request::method(),
                'request_url' => Request::fullUrl(),
                'request_data' => $this->getRequestData(),
                'session_id' => session()->getId(),
                'resolved' => false,
            ]);

        } catch (\Exception $e) {
            // Log to fallback channel if database logging fails
            error_log('Database logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Get current user ID safely
     */
    private function getCurrentUserId(): ?int
    {
        try {
            return Auth::check() ? Auth::id() : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get sanitized request data
     */
    private function getRequestData(): ?array
    {
        try {
            $data = Request::all();

            // Remove sensitive fields
            $sensitive = ['password', 'password_confirmation', 'token', 'api_key', 'secret'];
            foreach ($sensitive as $field) {
                if (isset($data[$field])) {
                    unset($data[$field]);
                }
            }

            return $data;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Sanitize sensitive data from log record
     */
    private function sanitizeRecord(array $record): array
    {
        $sensitive = [
            'password',
            'password_confirmation',
            'token',
            'api_key',
            'secret',
            'authorization',
            'bearer',
            'credit_card',
            'ssn',
            'social_security',
            'medical_record',
            'diagnosis',
            'prescription',
            'treatment'
        ];

        // Sanitize context
        if (isset($record['context']) && is_array($record['context'])) {
            $record['context'] = $this->recursiveSanitize($record['context'], $sensitive);
        }

        // Sanitize extra data
        if (isset($record['extra']) && is_array($record['extra'])) {
            $record['extra'] = $this->recursiveSanitize($record['extra'], $sensitive);
        }

        // Sanitize message if it contains sensitive data
        if (isset($record['message'])) {
            $record['message'] = $this->sanitizeMessage($record['message'], $sensitive);
        }

        return $record;
    }

    /**
     * Recursively sanitize array data
     */
    private function recursiveSanitize(array $data, array $sensitive): array
    {
        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), $sensitive)) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = $this->recursiveSanitize($value, $sensitive);
            } elseif (is_string($value) && $this->containsSensitiveData($key, $value)) {
                $data[$key] = '[REDACTED]';
            }
        }

        return $data;
    }

    /**
     * Sanitize message content
     */
    private function sanitizeMessage(string $message, array $sensitive): string
    {
        foreach ($sensitive as $field) {
            $message = preg_replace('/\b' . preg_quote($field, '/') . '\s*[:=]\s*[^\s]+/i', $field . ': [REDACTED]', $message);
        }

        return $message;
    }

    /**
     * Check if value contains sensitive data
     */
    private function containsSensitiveData(string $key, string $value): bool
    {
        $lowerKey = strtolower($key);

        // Check for credit card patterns
        if (preg_match('/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/', $value)) {
            return true;
        }

        // Check for SSN patterns
        if (preg_match('/\b\d{3}[-]?\d{2}[-]?\d{4}\b/', $value)) {
            return true;
        }

        // Check for API key patterns
        if (preg_match('/\b[A-Za-z0-9]{32,}\b/', $value) && strlen($value) > 30) {
            foreach (['sk-', 'pk-', 'Bearer'] as $prefix) {
                if (strpos($value, $prefix) === 0) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Convert Monolog level to PSR-3 level name
     */
    private function getLevelName(int $level): string
    {
        $levels = [
            100 => 'debug',
            200 => 'info',
            250 => 'notice',
            300 => 'warning',
            400 => 'error',
            500 => 'critical',
            550 => 'alert',
            600 => 'emergency',
        ];

        return $levels[$level] ?? 'info';
    }
}
