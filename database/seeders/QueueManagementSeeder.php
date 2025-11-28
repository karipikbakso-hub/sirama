<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\QueueManagement;

class QueueManagementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $queues = [
            [
                'doctor_id' => 1,
                'service_type' => 'Poli Penyakit Dalam',
                'current_number' => 15,
                'last_called_number' => 14,
                'estimated_wait_time' => 45,
                'status' => 'active',
                'working_hours_start' => '08:00:00',
                'working_hours_end' => '12:00:00',
                'max_queue_per_hour' => 12,
                'average_consultation_time' => 25,
                'queue_date' => '2025-01-20',
                'total_served_today' => 14,
                'total_skipped_today' => 1,
                'notes' => 'Antrian lancar, dokter on time',
            ],
            [
                'doctor_id' => 2,
                'service_type' => 'Poli Kandungan',
                'current_number' => 8,
                'last_called_number' => 7,
                'estimated_wait_time' => 30,
                'status' => 'active',
                'working_hours_start' => '07:00:00',
                'working_hours_end' => '11:00:00',
                'max_queue_per_hour' => 10,
                'average_consultation_time' => 20,
                'queue_date' => '2025-01-20',
                'total_served_today' => 7,
                'total_skipped_today' => 0,
                'notes' => 'Mayoritas pasien antenatal check-up',
            ],
            [
                'doctor_id' => 3,
                'service_type' => 'Poli Anak',
                'current_number' => 22,
                'last_called_number' => 21,
                'estimated_wait_time' => 60,
                'status' => 'active',
                'working_hours_start' => '08:00:00',
                'working_hours_end' => '12:00:00',
                'max_queue_per_hour' => 15,
                'average_consultation_time' => 18,
                'queue_date' => '2025-01-20',
                'total_served_today' => 21,
                'total_skipped_today' => 2,
                'notes' => 'Banyak anak dengan demam dan ISPA',
            ],
            [
                'doctor_id' => 4,
                'service_type' => 'Poli Endokrin',
                'current_number' => 5,
                'last_called_number' => 5,
                'estimated_wait_time' => 15,
                'status' => 'active',
                'working_hours_start' => '09:00:00',
                'working_hours_end' => '13:00:00',
                'max_queue_per_hour' => 8,
                'average_consultation_time' => 35,
                'queue_date' => '2025-01-20',
                'total_served_today' => 5,
                'total_skipped_today' => 0,
                'notes' => 'Konsultasi diabetes dan thyroid',
            ],
            [
                'doctor_id' => 5,
                'service_type' => 'Poli Jantung',
                'current_number' => 3,
                'last_called_number' => 3,
                'estimated_wait_time' => 10,
                'status' => 'active',
                'working_hours_start' => '07:00:00',
                'working_hours_end' => '11:00:00',
                'max_queue_per_hour' => 6,
                'average_consultation_time' => 40,
                'queue_date' => '2025-01-20',
                'total_served_today' => 3,
                'total_skipped_today' => 0,
                'notes' => 'Emergency cardiology cases',
            ],
        ];

        foreach ($queues as $queue) {
            QueueManagement::create($queue);
        }
    }
}
