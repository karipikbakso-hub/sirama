<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PatientCommunication;

class PatientCommunicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $communications = [
            [
                'patient_id' => 1,
                'communication_type' => 'appointment_reminder',
                'channel' => 'sms',
                'message_content' => 'Pengingat: Anda memiliki appointment dengan Dr. Ahmad Surya pada tanggal 20 Januari 2025 pukul 10:00. Silakan konfirmasi kehadiran.',
                'status' => 'delivered',
                'sent_at' => '2025-01-19 08:00:00',
                'delivered_at' => '2025-01-19 08:00:15',
                'read_at' => '2025-01-19 08:05:00',
                'delivery_confirmation' => 'DELIVERED',
                'message_id' => 'SMS001',
                'cost' => 250.00,
                'metadata' => ['provider' => 'Telkomsel', 'priority' => 'normal'],
                'error_message' => null,
            ],
            [
                'patient_id' => 2,
                'communication_type' => 'prescription_reminder',
                'channel' => 'whatsapp',
                'message_content' => 'Pengobatan Anda: Amoxicillin 500mg, 3x sehari selama 7 hari. Jangan lupa minum obat secara teratur.',
                'status' => 'delivered',
                'sent_at' => '2025-01-18 14:30:00',
                'delivered_at' => '2025-01-18 14:30:20',
                'read_at' => '2025-01-18 15:00:00',
                'delivery_confirmation' => 'READ',
                'message_id' => 'WA001',
                'cost' => 0.00,
                'metadata' => ['provider' => 'WhatsApp Business', 'priority' => 'high'],
                'error_message' => null,
            ],
            [
                'patient_id' => 3,
                'communication_type' => 'lab_result',
                'channel' => 'email',
                'message_content' => 'Hasil laboratorium Anda sudah tersedia. Silakan login ke portal pasien untuk melihat detail hasil.',
                'status' => 'delivered',
                'sent_at' => '2025-01-17 10:15:00',
                'delivered_at' => '2025-01-17 10:15:30',
                'read_at' => '2025-01-17 11:00:00',
                'delivery_confirmation' => 'OPENED',
                'message_id' => 'EMAIL001',
                'cost' => 0.00,
                'metadata' => ['provider' => 'Gmail', 'priority' => 'normal', 'attachments' => ['lab_result.pdf']],
                'error_message' => null,
            ],
            [
                'patient_id' => 4,
                'communication_type' => 'payment_reminder',
                'channel' => 'sms',
                'message_content' => 'Pengingat pembayaran: Tagihan sebesar Rp 150.000 belum dibayar. Batas waktu: 25 Januari 2025.',
                'status' => 'sent',
                'sent_at' => '2025-01-20 09:00:00',
                'delivered_at' => null,
                'read_at' => null,
                'delivery_confirmation' => 'SENT',
                'message_id' => 'SMS002',
                'cost' => 250.00,
                'metadata' => ['provider' => 'Indosat', 'priority' => 'urgent'],
                'error_message' => null,
            ],
            [
                'patient_id' => 5,
                'communication_type' => 'follow_up',
                'channel' => 'call',
                'message_content' => 'Telepon follow-up: Kondisi pasien membaik, saran kontrol kembali dalam 1 minggu.',
                'status' => 'delivered',
                'sent_at' => '2025-01-16 13:45:00',
                'delivered_at' => '2025-01-16 13:50:00',
                'read_at' => null,
                'delivery_confirmation' => 'ANSWERED',
                'message_id' => 'CALL001',
                'cost' => 1500.00,
                'metadata' => ['provider' => 'Local', 'duration' => '5 minutes', 'priority' => 'normal'],
                'error_message' => null,
            ],
            [
                'patient_id' => 1,
                'communication_type' => 'emergency_alert',
                'channel' => 'sms',
                'message_content' => 'ALERT: Kondisi darurat terdeteksi. Segera hubungi rumah sakit jika mengalami gejala yang memburuk.',
                'status' => 'failed',
                'sent_at' => '2025-01-15 22:30:00',
                'delivered_at' => null,
                'read_at' => null,
                'delivery_confirmation' => null,
                'message_id' => 'SMS003',
                'cost' => 0.00,
                'metadata' => ['provider' => 'Telkomsel', 'priority' => 'emergency'],
                'error_message' => 'Nomor tidak aktif',
            ],
            [
                'patient_id' => 3,
                'communication_type' => 'health_education',
                'channel' => 'email',
                'message_content' => 'Tips kesehatan: Jaga pola makan seimbang dan olahraga teratur untuk mengontrol diabetes.',
                'status' => 'delivered',
                'sent_at' => '2025-01-14 07:00:00',
                'delivered_at' => '2025-01-14 07:00:45',
                'read_at' => '2025-01-14 08:30:00',
                'delivery_confirmation' => 'OPENED',
                'message_id' => 'EMAIL002',
                'cost' => 0.00,
                'metadata' => ['provider' => 'Outlook', 'priority' => 'low', 'campaign' => 'diabetes_awareness'],
                'error_message' => null,
            ],
            [
                'patient_id' => 2,
                'communication_type' => 'appointment_confirmation',
                'channel' => 'whatsapp',
                'message_content' => '✅ Appointment dikonfirmasi: Dr. Siti Aminah - 22 Januari 2025 pukul 14:30. Datang 15 menit sebelumnya.',
                'status' => 'delivered',
                'sent_at' => '2025-01-21 16:20:00',
                'delivered_at' => '2025-01-21 16:20:30',
                'read_at' => '2025-01-21 16:25:00',
                'delivery_confirmation' => 'READ',
                'message_id' => 'WA002',
                'cost' => 0.00,
                'metadata' => ['provider' => 'WhatsApp Business', 'priority' => 'normal'],
                'error_message' => null,
            ],
        ];

        foreach ($communications as $communication) {
            PatientCommunication::create($communication);
        }
    }
}
