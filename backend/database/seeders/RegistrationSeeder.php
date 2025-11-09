<?php

namespace Database\Seeders;

use App\Models\Registration;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, let's check what patients actually exist
        $existingPatients = \App\Models\Patient::pluck('id')->toArray();

        if (empty($existingPatients)) {
            // If no patients exist, create some basic ones first
            \App\Models\Patient::insert([
                [
                    'mrn' => 'MR-2025-001',
                    'name' => 'Ahmad Susanto',
                    'nik' => '1234567890123456',
                    'birth_date' => '1990-05-15',
                    'gender' => 'L',
                    'phone' => '081234567890',
                    'address' => 'Jl. Merdeka No. 123, Yogyakarta',
                    'emergency_contact' => '081987654321',
                    'bpjs_number' => '00012345678901',
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'mrn' => 'MR-2025-002',
                    'name' => 'Siti Aminah',
                    'nik' => '2345678901234567',
                    'birth_date' => '1985-08-20',
                    'gender' => 'P',
                    'phone' => '081345678901',
                    'address' => 'Jl. Malioboro No. 45, Yogyakarta',
                    'emergency_contact' => '081876543210',
                    'bpjs_number' => '00012345678902',
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'mrn' => 'MR-2025-003',
                    'name' => 'Budi Santoso',
                    'nik' => '3456789012345678',
                    'birth_date' => '1978-12-10',
                    'gender' => 'L',
                    'phone' => '081456789012',
                    'address' => 'Jl. Prawirotaman No. 67, Yogyakarta',
                    'emergency_contact' => '081765432109',
                    'bpjs_number' => '00012345678903',
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            $existingPatients = [1, 2, 3];
        }

        $serviceUnits = [
            'Poli Penyakit Dalam',
            'Poli Anak',
            'Poli Kandungan',
            'IGD',
            'Rawat Inap'
        ];

        $statuses = ['registered', 'checked-in', 'completed', 'cancelled'];
        $paymentMethods = ['tunai', 'bpjs', 'asuransi'];
        $arrivalTypes = ['mandiri', 'rujukan'];

        $referralSources = [
            'RS Sardjito', 'RS Panti Rapih', 'RS Bethesda', 'RS PKU Muhammadiyah',
            'Puskesmas Ngampilan', 'Puskesmas Umbulharjo', 'Puskesmas Mergangsan',
            'Klinik Pratama Sehat', 'RS Islam', 'RS Hermina'
        ];

        $notes = [
            'Kontrol rutin diabetes mellitus',
            'Keluhan demam tinggi dan batuk',
            'Kontrol kehamilan trimester 2',
            'Pasien datang dengan kecelakaan motor',
            'Rujukan untuk hipertensi',
            'Kontrol imunisasi anak',
            'USG kehamilan',
            'Sesak nafas dan nyeri dada',
            'Cedera kepala ringan',
            'Kontrol pasca operasi',
            'Infeksi saluran kemih',
            'Kontrol anak dengan demam',
            'Persalinan normal',
            'Kontrol jantung',
            'Gangguan pencernaan',
            'Kontrol mata',
            'Kontrol THT',
            'Kontrol kulit',
            'Kontrol gigi',
            'Kontrol jiwa'
        ];

        $registrations = [];

        // Generate 50 registrations for better audit data
        for ($i = 1; $i <= 50; $i++) {
            $patientId = $existingPatients[array_rand($existingPatients)];
            $serviceUnit = $serviceUnits[array_rand($serviceUnits)];
            $status = $statuses[array_rand($statuses)];
            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
            $arrivalType = $arrivalTypes[array_rand($arrivalTypes)];

            // Generate queue number based on service unit
            $queuePrefix = match($serviceUnit) {
                'Poli Penyakit Dalam' => 'PD',
                'Poli Anak' => 'AK',
                'Poli Kandungan' => 'KN',
                'IGD' => 'UGD',
                'Rawat Inap' => 'RI',
                default => 'PD'
            };

            $queueNumber = sprintf('%s-%03d', $queuePrefix, $i);

            // Generate registration number
            $date = now()->subDays(rand(0, 30))->format('Ymd');
            $registrationNo = sprintf('REG-%s-%03d', $date, $i);

            // Insurance number based on payment method
            $insuranceNumber = null;
            if ($paymentMethod === 'bpjs') {
                $insuranceNumber = '0001' . str_pad($patientId, 11, '0', STR_PAD_LEFT);
            } elseif ($paymentMethod === 'asuransi') {
                $insuranceNumber = sprintf('POL-2025-%03d', $i);
            }

            // Referral source if arrival type is rujukan
            $referralSource = null;
            if ($arrivalType === 'rujukan') {
                $referralSource = $referralSources[array_rand($referralSources)];
            }

            // Doctor assignment - use only existing user ID (1)
            $doctorId = 1;

            // Random created date within last 30 days
            $createdDate = now()->subDays(rand(0, 30));
            $updatedDate = $createdDate->copy();

            // If status is completed or cancelled, update date might be later
            if (in_array($status, ['completed', 'cancelled'])) {
                $updatedDate = $createdDate->copy()->addHours(rand(1, 24));
            }

            $registrations[] = [
                'patient_id' => $patientId,
                'registration_no' => $registrationNo,
                'service_unit' => $serviceUnit,
                'doctor_id' => $doctorId,
                'arrival_type' => $arrivalType,
                'referral_source' => $referralSource,
                'payment_method' => $paymentMethod,
                'insurance_number' => $insuranceNumber,
                'queue_number' => $queueNumber,
                'status' => $status,
                'notes' => $notes[array_rand($notes)],
                'created_by' => 1,
                'created_at' => $createdDate,
                'updated_at' => $updatedDate,
            ];
        }

        // Insert in chunks to avoid memory issues
        foreach (array_chunk($registrations, 25) as $chunk) {
            Registration::insert($chunk);
        }
    }
}
