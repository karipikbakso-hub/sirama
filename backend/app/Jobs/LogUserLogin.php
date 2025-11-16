<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class LogUserLogin implements ShouldQueue
{
    use Queueable;

    protected $userId;
    protected $ipAddress;
    protected $userAgent;

    /**
     * Create a new job instance.
     */
    public function __construct(int $userId, string $ipAddress, string $userAgent)
    {
        $this->userId = $userId;
        $this->ipAddress = $ipAddress;
        $this->userAgent = $userAgent;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $user = User::find($this->userId);

            if (!$user) {
                Log::warning('LogUserLogin: User not found', ['user_id' => $this->userId]);
                return;
            }

            // Update last login timestamp (async)
            $user->update([
                'last_login_at' => now(),
                'last_login_ip' => $this->ipAddress,
            ]);

            // Log to application log for monitoring
            Log::info('User login', [
                'user_id' => $this->userId,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'ip_address' => $this->ipAddress,
                'user_agent' => $this->userAgent,
                'login_time' => now()->toISOString(),
            ]);

            // Here you could also save to audit table if needed
            // AuditLog::create([...]);

        } catch (\Exception $e) {
            Log::error('LogUserLogin job failed', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'ip_address' => $this->ipAddress,
            ]);
        }
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('LogUserLogin job permanently failed', [
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
            'ip_address' => $this->ipAddress,
        ]);
    }
}
