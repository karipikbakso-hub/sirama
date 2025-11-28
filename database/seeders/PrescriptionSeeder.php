<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PrescriptionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some registrations, medicines, and users for seeding
        $registrations = DB::table('t_registrasi')->limit(8)->get();
        $medicines = DB::table('m_obat')->where('aktif', true)->limit(10)->get();
        $users = DB::table('users')->where('email', 'like', '%@sirama.com')->get();

        if ($registrations->isEmpty() || $medicines->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Tidak ada data registrasi, obat, atau user untuk seeding resep');
            return;
        }

        $prescriptions = [];
        $prescriptionDetails = [];

        // Sample diagnoses
        $diagnoses = [
            'Hipertensi esensial',
            'Diabetes mellitus tipe 2',
            'Infeksi saluran napas atas',
            'Gastritis kronis',
            'Bronkitis akut',
            'Anemia defisiensi besi',
            'Osteoarthritis',
            'Hiperkolesterolemia'
        ];

        // Sample instructions
        $instructions = [
            'Minum obat teratur sesuai aturan',
            'Jangan minum obat saat perut kosong',
            'Minum setelah makan',
            'Hindari minum kopi atau teh',
            'Istirahat yang cukup',
            'Kontrol tekanan darah secara teratur',
            'Periksa kadar gula darah',
            'Konsultasi jika ada efek samping'
        ];

        // Sample aturan pakai
        $aturanPakai = [
            '1x1 tablet sehari',
            '2x1 tablet sehari',
            '3x1 tablet sehari',
            '1x1 kapsul sehari',
            '2x1 kapsul sehari',
            '3x1 kapsul sehari',
            '1x1 sendok takar sehari',
            '2x1 sendok takar sehari'
        ];

        $statuses = ['draft', 'final', 'dibuat', 'selesai'];

        // Create prescriptions for each registration
        foreach ($registrations as $index => $registration) {
            $user = $users->random();
            $numPrescriptions = rand(1, 2); // Each registration gets 1-2 prescriptions

            for ($i = 0; $i < $numPrescriptions; $i++) {
                $prescriptionId = DB::table('t_resep')->insertGetId([
                    'no_resep' => $this->generateNoResep(),
                    'registrasi_id' => $registration->id,
                    'dokter_id' => $user->id,
                    'diagnosa' => $diagnoses[array_rand($diagnoses)],
                    'instruksi' => $instructions[array_rand($instructions)],
                    'tanggal_resep' => Carbon::now()->subDays(rand(0, 30)),
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                    'updated_at' => Carbon::now()->subDays(rand(0, 7)),
                ]);

                // Create 2-4 medicine details for each prescription
                $selectedMedicines = $medicines->random(rand(2, 4));

                foreach ($selectedMedicines as $medicine) {
                    $jumlah = rand(10, 60);
                    $hari = rand(7, 30);
                    $hargaSatuan = $medicine->price ?? rand(1000, 10000);

                    DB::table('t_resep_detail')->insert([
                        'resep_id' => $prescriptionId,
                        'obat_id' => $medicine->id,
                        'jumlah' => $jumlah,
                        'aturan_pakai' => $aturanPakai[array_rand($aturanPakai)],
                        'hari' => $hari,
                        'instruksi' => 'Minum sesuai aturan dokter',
                        'harga_satuan' => $hargaSatuan,
                        'subtotal' => $jumlah * $hargaSatuan,
                        'created_at' => Carbon::now()->subDays(rand(0, 30)),
                        'updated_at' => Carbon::now()->subDays(rand(0, 7)),
                    ]);
                }
            }
        }

        $totalPrescriptions = DB::table('t_resep')->count();
        $totalDetails = DB::table('t_resep_detail')->count();

        $this->command->info("Berhasil membuat {$totalPrescriptions} resep dengan {$totalDetails} detail obat untuk testing");
    }

    /**
     * Generate unique prescription number.
     */
    private function generateNoResep(): string
    {
        $year = date('Y');
        $month = date('m');

        // Get the last prescription number for this month
        $lastResep = DB::table('t_resep')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastResep) {
            // Extract the sequence number from the last prescription number
            $parts = explode('-', $lastResep->no_resep);
            if (count($parts) >= 3) {
                $sequence = intval(end($parts)) + 1;
            } else {
                $sequence = 1;
            }
        } else {
            $sequence = 1;
        }

        return sprintf('RS-%s-%s-%03d', $year, $month, $sequence);
    }
}
