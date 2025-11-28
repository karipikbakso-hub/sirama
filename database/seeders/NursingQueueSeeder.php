<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\NursingQueue;
use App\Models\Registration;
use App\Models\Poli;
use Carbon\Carbon;

class NursingQueueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing registrations and polis to create realistic test data
        $registrations = Registration::with(['patient'])->limit(20)->get();
        $polis = Poli::all();

        if ($registrations->isEmpty() || $polis->isEmpty()) {
            $this->command->info('No registrations or polis found. NursingQueueSeeder skipped.');
            return;
        }

        $statuses = ['waiting', 'called', 'serving', 'completed'];
        $queueNumbers = ['A', 'B', 'C'];

        $today = Carbon::today();

        // Create 25 test nursing queue entries
        for ($i = 0; $i < 25; $i++) {
            $letter = $queueNumbers[array_rand($queueNumbers)];
            $number = $i + 1;
            $poliIndex = $i % $polis->count();
            $registration = $registrations->get($i % $registrations->count());

            $status = $statuses[array_rand($statuses)];
            $queueNumber = sprintf('%s-%03d', $letter, $number);

            // Create queue entry
            $queueData = [
                'poli_id' => $polis->get($poliIndex)->id,
                'registration_id' => $registration->id,
                'queue_number' => $queueNumber,
                'queue_date' => $today,
                'status' => $status,
                'created_at' => now()->subMinutes(rand(1, 500)),
                'updated_at' => now()->subMinutes(rand(0, 50)),
            ];

            // Add called_at for called/serving status
            if (in_array($status, ['called', 'serving', 'completed'])) {
                $queueData['called_at'] = now()->subMinutes(rand(5, 120));
            }

            // Add served_at for completed status
            if ($status === 'completed') {
                $queueData['served_at'] = now()->subMinutes(rand(1, 60))->addSeconds(rand(20, 300));
            }

            NursingQueue::create($queueData);
        }

        $this->command->info('NursingQueueSeeder completed. Created 25 test nursing queue entries.');
    }
}
