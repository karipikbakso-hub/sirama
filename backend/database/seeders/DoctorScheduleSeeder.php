<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DoctorScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing doctors and polis
        $doctors = DB::table('m_dokter')->where('status', 'active')->get();
        $polis = DB::table('m_poli')->get();

        if ($doctors->isEmpty() || $polis->isEmpty()) {
            $this->command->warn('No active doctors or polis found. Skipping doctor schedule seeding.');
            return;
        }

        $schedules = [];

        // Create schedules for each doctor in each poli
        foreach ($doctors as $doctor) {
            foreach ($polis as $poli) {
                // Create schedules for Monday to Sunday
                $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

                foreach ($days as $day) {
                    $schedules[] = [
                        'doctor_id' => $doctor->id,
                        'poli_id' => $poli->id,
                        'hari' => $day,
                        'jam_mulai' => '08:00',
                        'jam_selesai' => '16:00',
                        'is_active' => true,
                        'quota_pasien' => 50,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // Insert schedules
        DB::table('t_jadwal_dokter')->insert($schedules);

        $this->command->info('Doctor schedules seeded successfully. Total schedules: ' . count($schedules));
    }
}