<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample Registrasi Pasien
        $registrasis = [
            [
                'no_registrasi' => 'REG-20251101-001',
                'patient_id' => 1, // Ahmad Susanto
                'poli_id' => 1, // Poli Umum
                'dokter_id' => 1, // Dr. Ahmad Susanto
                'penjamin_id' => 1, // BPJS Kesehatan
                'tanggal_registrasi' => '2025-11-01',
                'jam_registrasi' => '08:30:00',
                'jenis_kunjungan' => 'baru',
                'status' => 'selesai',
                'keluhan' => 'Demam dan batuk',
                'biaya_registrasi' => 25000.00,
            ],
            [
                'no_registrasi' => 'REG-20251101-002',
                'patient_id' => 2, // Siti Aminah
                'poli_id' => 2, // Poli Penyakit Dalam
                'dokter_id' => 2, // Dr. Siti Aminah
                'penjamin_id' => 1, // BPJS Kesehatan
                'tanggal_registrasi' => '2025-11-01',
                'jam_registrasi' => '09:15:00',
                'jenis_kunjungan' => 'lama',
                'status' => 'selesai',
                'keluhan' => 'Sesak napas dan nyeri dada',
                'biaya_registrasi' => 25000.00,
            ],
            [
                'no_registrasi' => 'REG-20251101-003',
                'patient_id' => 3, // Budi Santoso
                'poli_id' => 3, // Poli Anak
                'dokter_id' => 3, // Dr. Budi Santoso
                'penjamin_id' => 1, // BPJS Kesehatan
                'tanggal_registrasi' => '2025-11-01',
                'jam_registrasi' => '10:00:00',
                'jenis_kunjungan' => 'kontrol',
                'status' => 'sedang_diperiksa',
                'keluhan' => 'Batuk pilek anak',
                'biaya_registrasi' => 20000.00,
            ],
        ];

        foreach ($registrasis as $registrasi) {
            DB::table('t_registrasi')->insert($registrasi);
        }

        // Sample Resep
        $reseps = [
            [
                'no_resep' => 'RSP-20251101-001',
                'registrasi_id' => 1,
                'dokter_id' => 1,
                'tanggal_resep' => '2025-11-01',
                'diagnosa' => 'ISPA (Infeksi Saluran Pernapasan Akut)',
                'instruksi' => 'Minum obat sesuai aturan. Istirahat cukup.',
                'status' => 'final',
            ],
            [
                'no_resep' => 'RSP-20251101-002',
                'registrasi_id' => 2,
                'dokter_id' => 2,
                'tanggal_resep' => '2025-11-01',
                'diagnosa' => 'Bronkitis Akut',
                'instruksi' => 'Hindari asap rokok dan debu.',
                'status' => 'final',
            ],
        ];

        foreach ($reseps as $resep) {
            DB::table('t_resep')->insert($resep);
        }

        // Sample Detail Resep
        $resepDetails = [
            [
                'resep_id' => 1,
                'obat_id' => 1, // Paracetamol
                'jumlah' => 20,
                'aturan_pakai' => '3x1 tablet',
                'hari' => 5,
                'harga_satuan' => 2500.00,
                'subtotal' => 50000.00,
                'instruksi' => 'Setelah makan',
            ],
            [
                'resep_id' => 1,
                'obat_id' => 5, // Vitamin C
                'jumlah' => 30,
                'aturan_pakai' => '1x1 tablet',
                'hari' => 10,
                'harga_satuan' => 5000.00,
                'subtotal' => 150000.00,
                'instruksi' => 'Pagi hari',
            ],
            [
                'resep_id' => 2,
                'obat_id' => 1, // Paracetamol
                'jumlah' => 15,
                'aturan_pakai' => '3x1 tablet',
                'hari' => 5,
                'harga_satuan' => 2500.00,
                'subtotal' => 37500.00,
                'instruksi' => 'Jika demam >38°C',
            ],
        ];

        foreach ($resepDetails as $detail) {
            DB::table('t_resep_detail')->insert($detail);
        }

        // Sample Pemeriksaan Medis
        $pemeriksaans = [
            [
                'registrasi_id' => 1,
                'dokter_id' => 1,
                'tanggal_pemeriksaan' => '2025-11-01 08:45:00',
                'anamnesis' => 'Pasien datang dengan keluhan demam 3 hari, batuk berdahak, hidung tersumbat.',
                'pemeriksaan_fisik' => 'Tenggorokan kemerahan, ada sekret hidung.',
                'berat_badan' => 65.5,
                'tinggi_badan' => 170.0,
                'tekanan_darah_sistolik' => 120.0,
                'tekanan_darah_diastolik' => 80.0,
                'suhu_badan' => 38.2,
                'denyut_nadi' => 85,
                'diagnosa' => 'ISPA Ringan',
                'terapi' => 'Paracetamol 3x500mg, Vitamin C 1x500mg, istirahat cukup',
                'catatan' => 'Monitor suhu tubuh, jika >39°C segera kontrol',
                'status' => 'final',
            ],
            [
                'registrasi_id' => 2,
                'dokter_id' => 2,
                'tanggal_pemeriksaan' => '2025-11-01 09:30:00',
                'anamnesis' => 'Sesak napas saat beraktivitas, nyeri dada seperti tertusuk.',
                'pemeriksaan_fisik' => 'Bunyi napas tambahan, denyut jantung teratur.',
                'berat_badan' => 72.0,
                'tinggi_badan' => 165.0,
                'tekanan_darah_sistolik' => 140.0,
                'tekanan_darah_diastolik' => 90.0,
                'suhu_badan' => 36.8,
                'denyut_nadi' => 78,
                'diagnosa' => 'Bronkitis Akut',
                'terapi' => 'Bronkodilator, istirahat, hindari pencetus',
                'catatan' => 'Periksa fungsi paru jika gejala menetap',
                'status' => 'final',
            ],
        ];

        foreach ($pemeriksaans as $pemeriksaan) {
            DB::table('t_pemeriksaan')->insert($pemeriksaan);
        }

        // Sample Tindakan Medis
        $tindakans = [
            [
                'pemeriksaan_id' => 1,
                'tindakan_master_id' => 1, // Pemeriksaan Fisik Lengkap
                'dokter_id' => 1,
                'tanggal_tindakan' => '2025-11-01 08:45:00',
                'jumlah' => 1,
                'tarif_satuan' => 75000.00,
                'subtotal' => 75000.00,
                'catatan' => 'Pemeriksaan lengkap sistem pernapasan',
            ],
            [
                'pemeriksaan_id' => 2,
                'tindakan_master_id' => 2, // EKG
                'dokter_id' => 2,
                'tanggal_tindakan' => '2025-11-01 09:45:00',
                'jumlah' => 1,
                'tarif_satuan' => 150000.00,
                'subtotal' => 150000.00,
                'catatan' => 'EKG normal, sinus ritme',
            ],
        ];

        foreach ($tindakans as $tindakan) {
            DB::table('t_tindakan')->insert($tindakan);
        }

        // Sample Laboratorium
        $laboratoriums = [
            [
                'registrasi_id' => 1,
                'lab_id' => 1, // Hemoglobin
                'dokter_id' => 1,
                'tanggal_permintaan' => '2025-11-01 08:50:00',
                'tanggal_hasil' => '2025-11-01 10:30:00',
                'hasil' => '14.2',
                'satuan' => 'g/dL',
                'nilai_normal' => '12-16 (W), 13-17 (P)',
                'status' => 'selesai',
                'tarif' => 35000.00,
                'catatan' => 'Hasil dalam batas normal',
            ],
            [
                'registrasi_id' => 2,
                'lab_id' => 4, // Glukosa Puasa
                'dokter_id' => 2,
                'tanggal_permintaan' => '2025-11-01 09:50:00',
                'tanggal_hasil' => '2025-11-01 11:15:00',
                'hasil' => '95',
                'satuan' => 'mg/dL',
                'nilai_normal' => '70-100',
                'status' => 'selesai',
                'tarif' => 25000.00,
                'catatan' => 'Glukosa normal',
            ],
        ];

        foreach ($laboratoriums as $lab) {
            DB::table('t_laboratorium')->insert($lab);
        }

        // Sample Radiologi
        $radiologis = [
            [
                'registrasi_id' => 1,
                'radio_id' => 1, // Foto Thorax PA
                'dokter_id' => 1,
                'tanggal_permintaan' => '2025-11-01 08:55:00',
                'tanggal_hasil' => '2025-11-01 10:45:00',
                'hasil' => 'Paru-paru tampak jelas, tidak ada infiltrat',
                'kesan' => 'Tidak ada kelainan pada foto thorax',
                'status' => 'selesai',
                'tarif' => 75000.00,
                'catatan' => 'Foto thorax normal',
            ],
        ];

        foreach ($radiologis as $radio) {
            DB::table('t_radiologi')->insert($radio);
        }

        // Sample Obat Keluar
        $obatKeluar = [
            [
                'resep_detail_id' => 1,
                'user_id' => 1, // Apoteker
                'tanggal_keluar' => '2025-11-01 11:00:00',
                'jumlah_keluar' => 20,
                'harga_satuan' => 2500.00,
                'subtotal' => 50000.00,
                'status' => 'selesai',
                'catatan' => 'Obat telah diberikan kepada pasien',
            ],
            [
                'resep_detail_id' => 2,
                'user_id' => 1,
                'tanggal_keluar' => '2025-11-01 11:05:00',
                'jumlah_keluar' => 30,
                'harga_satuan' => 5000.00,
                'subtotal' => 150000.00,
                'status' => 'selesai',
                'catatan' => 'Vitamin C untuk meningkatkan daya tahan tubuh',
            ],
        ];

        foreach ($obatKeluar as $obat) {
            DB::table('t_obat_keluar')->insert($obat);
        }

        // Sample Billing
        $billings = [
            [
                'no_invoice' => 'INV-20251101-001',
                'registrasi_id' => 1,
                'user_id' => 1, // Kasir
                'tanggal_billing' => '2025-11-01 12:00:00',
                'total_tagihan' => 300000.00,
                'diskon' => 0.00,
                'total_bayar' => 300000.00,
                'status' => 'lunas',
                'catatan' => 'Pembayaran BPJS Kesehatan',
            ],
            [
                'no_invoice' => 'INV-20251101-002',
                'registrasi_id' => 2,
                'user_id' => 1,
                'tanggal_billing' => '2025-11-01 12:30:00',
                'total_tagihan' => 267500.00,
                'diskon' => 0.00,
                'total_bayar' => 267500.00,
                'status' => 'lunas',
                'catatan' => 'Pembayaran BPJS Kesehatan',
            ],
        ];

        foreach ($billings as $billing) {
            DB::table('t_billing')->insert($billing);
        }

        // Sample Pembayaran
        $pembayarans = [
            [
                'billing_id' => 1,
                'user_id' => 1, // Kasir
                'tanggal_bayar' => '2025-11-01 12:00:00',
                'jumlah_bayar' => 300000.00,
                'metode_bayar' => 'transfer',
                'no_referensi' => 'BPJS-20251101-001',
                'catatan' => 'Pembayaran melalui BPJS Kesehatan',
            ],
            [
                'billing_id' => 2,
                'user_id' => 1,
                'tanggal_bayar' => '2025-11-01 12:30:00',
                'jumlah_bayar' => 267500.00,
                'metode_bayar' => 'transfer',
                'no_referensi' => 'BPJS-20251101-002',
                'catatan' => 'Pembayaran melalui BPJS Kesehatan',
            ],
        ];

        foreach ($pembayarans as $pembayaran) {
            DB::table('t_pembayaran')->insert($pembayaran);
        }
    }
}
