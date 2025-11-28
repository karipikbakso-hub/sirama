<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $appointment;

    /**
     * Create a new notification instance.
     */
    public function __construct($appointment)
    {
        $this->appointment = $appointment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengingat Janji Temu - RS SIRAMA')
            ->greeting('Halo ' . $notifiable->name . ',')
            ->line('Anda memiliki janji temu besok di RS SIRAMA.')
            ->line('**Detail Janji Temu:**')
            ->line('📅 Tanggal: ' . $this->appointment->appointment_date->format('d/m/Y'))
            ->line('⏰ Waktu: ' . $this->appointment->appointment_time)
            ->line('👨‍⚕️ Dokter: ' . ($this->appointment->doctor->name ?? 'TBD'))
            ->line('🏥 Poli: ' . ($this->appointment->specialization ?? 'Umum'))
            ->action('Konfirmasi Kedatangan', url('/appointments/confirm/' . $this->appointment->id))
            ->line('Silakan datang 15 menit sebelum waktu yang dijadwalkan.')
            ->salutation('Salam sehat, Tim RS SIRAMA');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pengingat Janji Temu',
            'message' => 'Anda memiliki janji temu besok di RS SIRAMA',
            'appointment_id' => $this->appointment->id,
            'appointment_date' => $this->appointment->appointment_date,
            'appointment_time' => $this->appointment->appointment_time,
            'doctor_name' => $this->appointment->doctor->name ?? 'TBD',
            'type' => 'appointment_reminder',
        ];
    }
}
