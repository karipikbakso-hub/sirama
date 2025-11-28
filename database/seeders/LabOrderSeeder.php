<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LabOrderSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing patients and registrations
        $patients = DB::table('m_pasien')->where('status_aktif', 'aktif')->take(5)->get();
        $registrations = DB::table('registrations')->take(10)->get();
        $doctors = DB::table('m_dokter')->take(3)->get();
        $labTests = DB::table('m_laboratorium')->where('aktif', true)->get();

        if ($patients->isEmpty() || $registrations->isEmpty() || $doctors->isEmpty() || $labTests->isEmpty()) {
            $this->command->warn('Tidak cukup data master untuk membuat seed lab orders');
            return;
        }

        $labOrders = [];

        // Create lab orders for different patients
        foreach ($patients as $patient) {
            // Get patient's registrations
            $patientRegistrations = $registrations->where('patient_id', $patient->id);

            if ($patientRegistrations->isEmpty()) continue;

            // Create 1-3 lab orders per patient
            $numOrders = rand(1, 3);

            for ($i = 0; $i < $numOrders; $i++) {
                $registration = $patientRegistrations->random();
                $doctor = $doctors->random();

                // Select 1-5 random lab tests
                $selectedTests = $labTests->random(rand(1, 5));

                $orderDate = Carbon::now()->subDays(rand(0, 30));

                // Create lab order for each selected test
                foreach ($selectedTests as $test) {
                    $status = collect(['menunggu', 'diproses', 'selesai', 'dibatalkan'])->random();
                    $result = null;
                    $resultDate = null;

                    if ($status === 'selesai') {
                        // Generate mock result based on test type
                        $result = $this->generateMockResult($test);
                        $resultDate = $orderDate->copy()->addHours(rand(1, 24));
                    }

                    $orderId = DB::table('t_pesanan_lab')->insertGetId([
                        'id_pasien' => $patient->id,
                        'id_dokter' => $doctor->id,
                        'id_laboratorium' => $test->id,
                        'tanggal_pesanan' => $orderDate,
                        'urgensi' => collect(['rutin', 'cito', 'stat'])->random(),
                        'status_pesanan' => $status,
                        'diagnosa_klinis' => 'Pemeriksaan rutin untuk monitoring kesehatan',
                        'catatan' => 'Catatan dari dokter: Periksa hasil segera',
                        'hasil' => $result,
                        'tanggal_hasil' => $resultDate,
                        'created_by' => $doctor->id,
                        'created_at' => $orderDate,
                        'updated_at' => $resultDate ?: $orderDate,
                    ]);

                    $labOrders[] = $orderId;
                }


                $labOrders[] = $orderId;
            }
        }

        $this->command->info('Berhasil membuat ' . count($labOrders) . ' order laboratorium');
    }

    /**
     * Generate mock result based on lab test
     */
    private function generateMockResult($test)
    {
        // Parse normal range to generate realistic values
        $normalRange = $test->nilai_normal;

        if (!$normalRange) {
            return rand(10, 100) . ' ' . ($test->satuan ?: '');
        }

        // Simple parsing for ranges like "12-16", "70-100", etc.
        if (preg_match('/(\d+)-(\d+)/', $normalRange, $matches)) {
            $min = (int)$matches[1];
            $max = (int)$matches[2];

            // Generate value within or slightly outside normal range
            $isAbnormal = rand(1, 10) > 8; // 20% chance of abnormal result

            if ($isAbnormal) {
                // Slightly outside normal range
                $value = rand(0, 1) ? $min - rand(1, 5) : $max + rand(1, 5);
            } else {
                // Within normal range
                $value = rand($min, $max);
            }

            return $value . ($test->satuan ? ' ' . $test->satuan : '');
        }

        // For non-numeric results
        if (stripos($normalRange, 'negatif') !== false) {
            return rand(0, 1) ? 'Negatif' : 'Positif';
        }

        if (stripos($normalRange, 'normal') !== false) {
            return rand(0, 1) ? 'Normal' : 'Abnormal';
        }

        // Default fallback
        return rand(10, 100) . ($test->satuan ? ' ' . $test->satuan : '');
    }
}