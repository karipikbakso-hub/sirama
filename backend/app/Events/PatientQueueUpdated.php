<?php

namespace App\Events;

use App\Models\QueueManagement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PatientQueueUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $queueData;

    /**
     * Create a new event instance.
     */
    public function __construct(QueueManagement $queue)
    {
        $this->queueData = [
            'id' => $queue->id,
            'patient_name' => $queue->patient->name ?? 'Unknown',
            'queue_number' => $queue->queue_number,
            'status' => $queue->status,
            'estimated_time' => $queue->estimated_time,
            'current_position' => $queue->current_position,
            'updated_at' => $queue->updated_at,
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('patient-queue'),
            new PrivateChannel('doctor-queue-updates'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'queue.updated';
    }
}
