<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\QueuePriority;

class QueuePrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priorities = [
            [
                'code' => 'normal',
                'name' => 'normal',
                'display_name' => 'Pasien Normal',
                'priority_level' => 1,
                'color_code' => '#10B981',
                'icon_class' => 'fa-user',
                'description' => 'Pasien dengan kondisi normal',
                'requires_approval' => false,
                'max_wait_time_minutes' => 120,
                'auto_call' => false,
                'skip_queue' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'urgent',
                'name' => 'urgent',
                'display_name' => 'Pasien Urgent',
                'priority_level' => 3,
                'color_code' => '#F59E0B',
                'icon_class' => 'fa-exclamation-triangle',
                'description' => 'Pasien dengan kondisi urgent',
                'requires_approval' => false,
                'max_wait_time_minutes' => 60,
                'auto_call' => true,
                'skip_queue' => false,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'emergency',
                'name' => 'emergency',
                'display_name' => 'Pasien Emergency',
                'priority_level' => 5,
                'color_code' => '#EF4444',
                'icon_class' => 'fa-ambulance',
                'description' => 'Pasien dengan kondisi emergency',
                'requires_approval' => false,
                'max_wait_time_minutes' => 15,
                'auto_call' => true,
                'skip_queue' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'code' => 'vip',
                'name' => 'vip',
                'display_name' => 'Pasien VIP',
                'priority_level' => 4,
                'color_code' => '#8B5CF6',
                'icon_class' => 'fa-crown',
                'description' => 'Pasien VIP atau prioritas tinggi',
                'requires_approval' => true,
                'max_wait_time_minutes' => 30,
                'auto_call' => true,
                'skip_queue' => false,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'code' => 'elderly',
                'name' => 'elderly',
                'display_name' => 'Lansia (≥60 tahun)',
                'priority_level' => 2,
                'color_code' => '#06B6D4',
                'icon_class' => 'fa-user-plus',
                'description' => 'Pasien lansia berusia 60 tahun ke atas',
                'requires_approval' => false,
                'max_wait_time_minutes' => 90,
                'auto_call' => false,
                'skip_queue' => false,
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($priorities as $priority) {
            QueuePriority::create($priority);
        }
    }
}
