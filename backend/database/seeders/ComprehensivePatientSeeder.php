<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ComprehensivePatientSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->seedPatients();
        $this->seedRegistrations();
        $this->seedVitalSigns();
        $this->seedDiagnoses();
        $this->seedPrescriptions();
        $this->seedBilling();
    }

    private function seedPatients(): void
    {
        $patients = [
            [
                'no_rm' => 'RM001',
                'nama_lengkap' => 'Ahmad Rahman',
                'nik' => '3171234567890001',
                'tanggal_lahir' => '1985-03-15',
                'jenis_kelamin' => 'L',
                'telepon' => '081234567890',
                'alamat' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'kontak_darurat' => 'Siti Rahman',
                'telepon_darurat' => '081234567891',
                'no_bpjs' => '0001234567890',
                'status_aktif' => 'aktif',
                'alergi' => json_encode(['Aspirin']),
                'penyakit_kronis' => json_encode(['Hipertensi']),
                'golongan_darah' => 'O+',
                'jenis_asuransi' => 'BPJS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'no_rm' => 'RM002',
                'nama_lengkap' => 'Sari Dewi',
                'tanggal_lahir' => '1990-07-22',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Thamrin No. 45, Jakarta Pusat',
                'telepon' => '081234567892',
                'no_bpjs' => '0001234567891',
                'nik' => '3171234567890002',
                'kontak_darurat' => 'Budi Dewi',
                'telepon_darurat' => '081234567893',
                'status_aktif' => 'aktif',
                'alergi' => json_encode(['Udang']),
                'penyakit_kronis' => json_encode(['Asma']),
                'golongan_darah' => 'A+',
                'jenis_asuransi' => 'BPJS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'no_rm' => 'RM003',
                'nama_lengkap' => 'Budi Santoso',
                'tanggal_lahir' => '1978-11-08',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Gatot Subroto No. 67, Jakarta Selatan',
                'telepon' => '081234567894',
                'no_bpjs' => '0001234567892',
                'nik' => '3171234567890003',
                'kontak_darurat' => 'Maya Santoso',
                'telepon_darurat' => '081234567895',
                'status_aktif' => 'aktif',
                'alergi' => json_encode(['Kacang']),
                'penyakit_kronis' => json_encode(['Diabetes Melitus']),
                'golongan_darah' => 'B+',
                'jenis_asuransi' => 'BPJS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'no_rm' => 'RM004',
                'nama_lengkap' => 'Maya Sari',
                'tanggal_lahir' => '1995-01-30',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Sudirman No. 89, Jakarta Pusat',
                'telepon' => '081234567896',
                'no_bpjs' => '0001234567893',
                'nik' => '3171234567890004',
                'kontak_darurat' => 'Ahmad Sari',
                'telepon_darurat' => '081234567897',
                'status_aktif' => 'aktif',
                'alergi' => json_encode([]),
                'penyakit_kronis' => json_encode([]),
                'golongan_darah' => 'AB+',
                'jenis_asuransi' => 'BPJS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'no_rm' => 'RM005',
                'nama_lengkap' => 'Rudi Hartono',
                'tanggal_lahir' => '1982-09-12',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. MH Thamrin No. 156, Jakarta Pusat',
                'telepon' => '081234567898',
                'no_bpjs' => '0001234567894',
                'nik' => '3171234567890005',
                'kontak_darurat' => 'Nina Hartono',
                'telepon_darurat' => '081234567899',
                'status_aktif' => 'aktif',
                'alergi' => json_encode(['Penisilin']),
                'penyakit_kronis' => json_encode(['Hipertensi', 'Dislipidemia']),
                'golongan_darah' => 'O-',
                'jenis_asuransi' => 'BPJS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($patients as $patient) {
            DB::table('m_pasien')->updateOrInsert(
                ['no_rm' => $patient['no_rm']],
                $patient
            );
        }
    }

    private function seedRegistrations(): void
    {
        $registrations = [
            [
                'patient_id' => 1,
                'no_registrasi' => 'REG001',
                'poli_id' => 1, // Poli Umum
                'dokter_id' => 5, // Dr. Rudi Setiawan
                'penjamin_id' => 1,
                'tanggal_registrasi' => now()->format('Y-m-d'),
                'jam_registrasi' => now()->format('H:i:s'),
                'jenis_kunjungan' => 'baru',
                'status' => 'selesai',
                'keluhan' => 'Demam, batuk, pilek',
                'biaya_registrasi' => 25000,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'patient_id' => 2,
                'no_registrasi' => 'REG002',
                'poli_id' => 2, // Poli Anak
                'dokter_id' => 2, // Dr. Siti Nurhaliza
                'penjamin_id' => 2,
                'tanggal_registrasi' => now()->format('Y-m-d'),
                'jam_registrasi' => now()->format('H:i:s'),
                'jenis_kunjungan' => 'baru',
                'status' => 'selesai',
                'keluhan' => 'Demam tinggi, muntah',
                'biaya_registrasi' => 35000,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'patient_id' => 3,
                'no_registrasi' => 'REG003',
                'poli_id' => 3, // Poli Penyakit Dalam
                'dokter_id' => 1, // Dr. Ahmad Santoso
                'penjamin_id' => 1,
                'tanggal_registrasi' => now()->format('Y-m-d'),
                'jam_registrasi' => now()->format('H:i:s'),
                'jenis_kunjungan' => 'kontrol',
                'status' => 'dipanggil',
                'keluhan' => 'Kontrol diabetes, gula darah tinggi',
                'biaya_registrasi' => 25000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'patient_id' => 4,
                'no_registrasi' => 'REG004',
                'poli_id' => 5, // Poli Kandungan
                'dokter_id' => 4, // Dr. Maya Sari
                'penjamin_id' => 2,
                'tanggal_registrasi' => now()->format('Y-m-d'),
                'jam_registrasi' => now()->format('H:i:s'),
                'jenis_kunjungan' => 'baru',
                'status' => 'menunggu',
                'keluhan' => 'Kontrol kehamilan trimester 2',
                'biaya_registrasi' => 50000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'patient_id' => 5,
                'no_registrasi' => 'REG005',
                'poli_id' => 4, // Poli Jantung
                'dokter_id' => 3, // Dr. Budi Hartono
                'penjamin_id' => 1,
                'tanggal_registrasi' => now()->format('Y-m-d'),
                'jam_registrasi' => now()->format('H:i:s'),
                'jenis_kunjungan' => 'rujukan',
                'status' => 'menunggu',
                'keluhan' => 'Nyeri dada, sesak napas',
                'biaya_registrasi' => 75000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($registrations as $registration) {
            DB::table('t_registrasi')->updateOrInsert(
                ['no_registrasi' => $registration['no_registrasi']],
                $registration
            );
        }
    }

    private function seedVitalSigns(): void
    {
        $vitalSigns = [
            [
                'registration_id' => 1,
                'patient_id' => 1,
                'nurse_id' => 1,
                'blood_pressure_systolic' => 120,
                'blood_pressure_diastolic' => 80,
                'temperature' => 38.5,
                'heart_rate' => 85,
                'respiration_rate' => 20,
                'weight' => 70.5,
                'height' => 170,
                'oxygen_saturation' => 98,
                'status' => 'warning',
                'notes' => 'Demam, batuk produktif',
                'measured_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'registration_id' => 2,
                'patient_id' => 2,
                'nurse_id' => 1,
                'blood_pressure_systolic' => 110,
                'blood_pressure_diastolic' => 75,
                'temperature' => 39.2,
                'heart_rate' => 95,
                'respiration_rate' => 25,
                'weight' => 15.5,
                'height' => 95,
                'oxygen_saturation' => 97,
                'status' => 'critical',
                'notes' => 'Demam tinggi, rewel',
                'measured_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'registration_id' => 3,
                'patient_id' => 3,
                'nurse_id' => 1,
                'blood_pressure_systolic' => 145,
                'blood_pressure_diastolic' => 95,
                'temperature' => 36.8,
                'heart_rate' => 78,
                'respiration_rate' => 18,
                'weight' => 82.3,
                'height' => 168,
                'oxygen_saturation' => 99,
                'status' => 'warning',
                'notes' => 'Hipertensi, kontrol diabetes',
                'measured_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($vitalSigns as $vitalSign) {
            DB::table('t_tanda_vital')->insert($vitalSign);
        }
    }

    private function seedDiagnoses(): void
    {
        $diagnoses = [
            [
                'patient_id' => 1,
                'dokter_id' => 1,
                'icd10_id' => 1,
                'registration_id' => 1,
                'tipe_diagnosis' => 'utama',
                'kepastian' => 'terkonfirmasi',
                'catatan' => 'Infeksi saluran napas atas',
                'tanggal_diagnosis' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'patient_id' => 2,
                'dokter_id' => 1,
                'icd10_id' => 2,
                'registration_id' => 2,
                'tipe_diagnosis' => 'utama',
                'kepastian' => 'terkonfirmasi',
                'catatan' => 'Sinusitis akut pada anak',
                'tanggal_diagnosis' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'patient_id' => 3,
                'dokter_id' => 1,
                'icd10_id' => 3,
                'registration_id' => 3,
                'tipe_diagnosis' => 'utama',
                'kepastian' => 'terkonfirmasi',
                'catatan' => 'Diabetes melitus tipe 2 tidak terkontrol',
                'tanggal_diagnosis' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'patient_id' => 3,
                'dokter_id' => 1,
                'icd10_id' => 4,
                'registration_id' => 3,
                'tipe_diagnosis' => 'sekunder',
                'kepastian' => 'terkonfirmasi',
                'catatan' => 'Hipertensi esensial',
                'tanggal_diagnosis' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($diagnoses as $diagnosis) {
            DB::table('t_diagnosis_pasien')->insert($diagnosis);
        }
    }

    private function seedPrescriptions(): void
    {
        $prescriptions = [
            [
                'patient_id' => 1,
                'tanggal_resep' => Carbon::now()->subDays(2)->toDateString(),
                'diagnosa' => 'Common cold',
                'status' => 'selesai',
                'catatan' => 'Minum obat sesuai dosis',
                'created_by' => 5,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'patient_id' => 2,
                'tanggal_resep' => Carbon::now()->subDays(1)->toDateString(),
                'diagnosa' => 'Acute sinusitis',
                'status' => 'selesai',
                'catatan' => 'Lanjutkan terapi sampai selesai',
                'created_by' => 2,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'patient_id' => 3,
                'tanggal_resep' => now()->toDateString(),
                'diagnosa' => 'Type 2 diabetes mellitus',
                'status' => 'aktif',
                'catatan' => 'Kontrol gula darah mingguan',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($prescriptions as $prescription) {
            $prescriptionId = DB::table('t_resep_obat')->insertGetId($prescription);

            // Add prescription items
            if ($prescriptionId == 1) {
                DB::table('prescription_items')->insert([
                    [
                        'prescription_id' => $prescriptionId,
                        'medicine_id' => 1, // Paracetamol
                        'medicine_name' => 'Paracetamol',
                        'dosage' => '500mg',
                        'frequency' => '3x sehari',
                        'duration' => '3 hari',
                        'instruction' => 'Sesudah makan',
                        'created_at' => Carbon::now()->subDays(2),
                        'updated_at' => Carbon::now()->subDays(2),
                    ],
                    [
                        'prescription_id' => $prescriptionId,
                        'medicine_id' => 2, // Amoxicillin
                        'medicine_name' => 'Amoxicillin',
                        'dosage' => '500mg',
                        'frequency' => '3x sehari',
                        'duration' => '5 hari',
                        'instruction' => 'Sesudah makan',
                        'created_at' => Carbon::now()->subDays(2),
                        'updated_at' => Carbon::now()->subDays(2),
                    ],
                ]);
            } elseif ($prescriptionId == 2) {
                DB::table('prescription_items')->insert([
                    [
                        'prescription_id' => $prescriptionId,
                        'medicine_id' => 1, // Paracetamol
                        'medicine_name' => 'Paracetamol',
                        'dosage' => '250mg',
                        'frequency' => '3x sehari',
                        'duration' => '3 hari',
                        'instruction' => 'Sesudah makan, sirup untuk anak',
                        'created_at' => Carbon::now()->subDays(1),
                        'updated_at' => Carbon::now()->subDays(1),
                    ],
                ]);
            } elseif ($prescriptionId == 3) {
                DB::table('prescription_items')->insert([
                    [
                        'prescription_id' => $prescriptionId,
                        'medicine_id' => 8, // Insulin
                        'medicine_name' => 'Insulin',
                        'dosage' => '10IU',
                        'frequency' => 'Sesuai kebutuhan',
                        'duration' => '30 hari',
                        'instruction' => 'Kontrol gula darah terlebih dahulu',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'prescription_id' => $prescriptionId,
                        'medicine_id' => 3, // Ibuprofen
                        'medicine_name' => 'Ibuprofen',
                        'dosage' => '400mg',
                        'frequency' => '3x sehari',
                        'duration' => '5 hari',
                        'instruction' => 'Jika ada nyeri',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            }
        }
    }

    private function seedBilling(): void
    {
        $billings = [
            [
                'no_invoice' => 'INV001',
                'registrasi_id' => 1,
                'user_id' => 6, // Kasir
                'tanggal_billing' => Carbon::now()->subDays(2),
                'total_tagihan' => 125000,
                'diskon' => 0,
                'total_bayar' => 125000,
                'status' => 'lunas',
                'catatan' => 'Pembayaran BPJS',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'no_invoice' => 'INV002',
                'registrasi_id' => 2,
                'user_id' => 6,
                'tanggal_billing' => Carbon::now()->subDays(1),
                'total_tagihan' => 185000,
                'diskon' => 0,
                'total_bayar' => 185000,
                'status' => 'lunas',
                'catatan' => 'Pembayaran tunai',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'no_invoice' => 'INV003',
                'registrasi_id' => 3,
                'user_id' => 6,
                'tanggal_billing' => now(),
                'total_tagihan' => 275000,
                'diskon' => 25000,
                'total_bayar' => 250000,
                'status' => 'lunas',
                'catatan' => 'Diskon BPJS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($billings as $billing) {
            DB::table('t_billing')->updateOrInsert(
                ['no_invoice' => $billing['no_invoice']],
                $billing
            );
        }

        // Add payment records
        $payments = [
            [
                'billing_id' => 1,
                'user_id' => 6,
                'tanggal_bayar' => Carbon::now()->subDays(2),
                'jumlah_bayar' => 125000,
                'metode_bayar' => 'transfer',
                'no_referensi' => 'BPJS001',
                'catatan' => 'Pembayaran melalui BPJS',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'billing_id' => 2,
                'user_id' => 6,
                'tanggal_bayar' => Carbon::now()->subDays(1),
                'jumlah_bayar' => 185000,
                'metode_bayar' => 'tunai',
                'catatan' => 'Pembayaran tunai lengkap',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'billing_id' => 3,
                'user_id' => 6,
                'tanggal_bayar' => now(),
                'jumlah_bayar' => 250000,
                'metode_bayar' => 'transfer',
                'no_referensi' => 'TF001234',
                'catatan' => 'Transfer bank BRI',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($payments as $payment) {
            DB::table('t_pembayaran')->insert($payment);
        }
    }
}