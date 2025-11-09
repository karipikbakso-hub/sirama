<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MasterTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Master Poli
        $polis = [
            ['kode_poli' => 'POL001', 'nama_poli' => 'Poli Umum', 'jenis_poli' => 'umum', 'deskripsi' => 'Pelayanan kesehatan umum'],
            ['kode_poli' => 'POL002', 'nama_poli' => 'Poli Penyakit Dalam', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis penyakit dalam'],
            ['kode_poli' => 'POL003', 'nama_poli' => 'Poli Anak', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis anak dan tumbuh kembang'],
            ['kode_poli' => 'POL004', 'nama_poli' => 'Poli Kandungan', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis kebidanan dan kandungan'],
            ['kode_poli' => 'POL005', 'nama_poli' => 'Poli Jantung', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis jantung dan pembuluh darah'],
            ['kode_poli' => 'POL006', 'nama_poli' => 'Poli THT', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis telinga hidung tenggorokan'],
            ['kode_poli' => 'POL007', 'nama_poli' => 'Poli Mata', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis mata'],
            ['kode_poli' => 'POL008', 'nama_poli' => 'Poli Kulit', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis kulit dan kelamin'],
            ['kode_poli' => 'POL009', 'nama_poli' => 'Poli Gigi', 'jenis_poli' => 'spesialis', 'deskripsi' => 'Spesialis gigi dan mulut'],
            ['kode_poli' => 'POL010', 'nama_poli' => 'IGD', 'jenis_poli' => 'gawat_darurat', 'deskripsi' => 'Instalasi Gawat Darurat 24 jam'],
        ];

        foreach ($polis as $poli) {
            DB::table('m_poli')->insert($poli);
        }

        // Master Dokter
        $dokters = [
            ['nip' => '197001011990011001', 'nama_dokter' => 'Dr. Ahmad Susanto', 'spesialisasi' => 'Umum', 'no_str' => 'STR001', 'no_sip' => 'SIP001', 'telepon' => '081234567890', 'alamat' => 'Jl. Sudirman No. 1, Yogyakarta'],
            ['nip' => '198002021990022002', 'nama_dokter' => 'Dr. Siti Aminah, Sp.PD', 'spesialisasi' => 'Penyakit Dalam', 'no_str' => 'STR002', 'no_sip' => 'SIP002', 'telepon' => '081234567891', 'alamat' => 'Jl. Malioboro No. 2, Yogyakarta'],
            ['nip' => '198503031990033003', 'nama_dokter' => 'Dr. Budi Santoso, Sp.A', 'spesialisasi' => 'Anak', 'no_str' => 'STR003', 'no_sip' => 'SIP003', 'telepon' => '081234567892', 'alamat' => 'Jl. Prawirotaman No. 3, Yogyakarta'],
            ['nip' => '198704041990044004', 'nama_dokter' => 'Dr. Lestari Dewi, Sp.OG', 'spesialisasi' => 'Kandungan', 'no_str' => 'STR004', 'no_sip' => 'SIP004', 'telepon' => '081234567893', 'alamat' => 'Jl. Gejayan No. 4, Yogyakarta'],
            ['nip' => '197805051990055005', 'nama_dokter' => 'Dr. Hendro Wicaksono, Sp.JP', 'spesialisasi' => 'Jantung', 'no_str' => 'STR005', 'no_sip' => 'SIP005', 'telepon' => '081234567894', 'alamat' => 'Jl. Magelang No. 5, Yogyakarta'],
        ];

        foreach ($dokters as $dokter) {
            DB::table('m_dokter')->insert($dokter);
        }

        // Master Obat
        $obats = [
            ['kode_obat' => 'OBT001', 'nama_obat' => 'Paracetamol', 'nama_generik' => 'Paracetamol', 'bentuk_sediaan' => 'Tablet', 'kekuatan' => '500mg', 'satuan' => 'Tablet', 'golongan_obat' => 'bebas', 'harga_jual' => 2500.00, 'stok_minimum' => 50, 'stok_maksimum' => 500, 'indikasi' => 'Penurun demam dan pereda nyeri ringan'],
            ['kode_obat' => 'OBT002', 'nama_obat' => 'Amoxicillin', 'nama_generik' => 'Amoxicillin', 'bentuk_sediaan' => 'Kapsul', 'kekuatan' => '500mg', 'satuan' => 'Kapsul', 'golongan_obat' => 'keras', 'harga_jual' => 15000.00, 'stok_minimum' => 20, 'stok_maksimum' => 200, 'indikasi' => 'Infeksi bakteri'],
            ['kode_obat' => 'OBT003', 'nama_obat' => 'Ibuprofen', 'nama_generik' => 'Ibuprofen', 'bentuk_sediaan' => 'Tablet', 'kekuatan' => '400mg', 'satuan' => 'Tablet', 'golongan_obat' => 'bebas_terbatas', 'harga_jual' => 3500.00, 'stok_minimum' => 30, 'stok_maksimum' => 300, 'indikasi' => 'Peradangan dan nyeri'],
            ['kode_obat' => 'OBT004', 'nama_obat' => 'Omeprazole', 'nama_generik' => 'Omeprazole', 'bentuk_sediaan' => 'Kapsul', 'kekuatan' => '20mg', 'satuan' => 'Kapsul', 'golongan_obat' => 'keras', 'harga_jual' => 12000.00, 'stok_minimum' => 15, 'stok_maksimum' => 150, 'indikasi' => 'Maag dan GERD'],
            ['kode_obat' => 'OBT005', 'nama_obat' => 'Vitamin C', 'nama_generik' => 'Ascorbic Acid', 'bentuk_sediaan' => 'Tablet', 'kekuatan' => '500mg', 'satuan' => 'Tablet', 'golongan_obat' => 'bebas', 'harga_jual' => 5000.00, 'stok_minimum' => 40, 'stok_maksimum' => 400, 'indikasi' => 'Suplemen vitamin C'],
        ];

        foreach ($obats as $obat) {
            DB::table('m_obat')->insert($obat);
        }

        // Master Diagnosa ICD-10
        $diagnosas = [
            ['kode_icd' => 'A01.0', 'nama_diagnosa' => 'Kolera akibat Vibrio cholerae 01, biovar cholerae', 'kategori' => 'penyakit', 'deskripsi' => 'Infeksi usus oleh bakteri Vibrio cholerae'],
            ['kode_icd' => 'A09', 'nama_diagnosa' => 'Diare dan gastroenteritis berasal dari infeksi', 'kategori' => 'penyakit', 'deskripsi' => 'Infeksi saluran pencernaan dengan gejala diare'],
            ['kode_icd' => 'E11', 'nama_diagnosa' => 'Diabetes mellitus tipe 2', 'kategori' => 'penyakit', 'deskripsi' => 'Diabetes yang tidak tergantung insulin'],
            ['kode_icd' => 'I10', 'nama_diagnosa' => 'Hipertensi esensial (primer)', 'kategori' => 'penyakit', 'deskripsi' => 'Tekanan darah tinggi tanpa penyebab yang jelas'],
            ['kode_icd' => 'J00', 'nama_diagnosa' => 'Infeksi saluran napas atas akut, tidak spesifik', 'kategori' => 'penyakit', 'deskripsi' => 'Infeksi saluran napas atas umum'],
            ['kode_icd' => 'S02.0', 'nama_diagnosa' => 'Fraktur tengkorak dan wajah', 'kategori' => 'cedera', 'deskripsi' => 'Patah tulang pada tengkorak atau wajah'],
            ['kode_icd' => 'Z01.4', 'nama_diagnosa' => 'Pemeriksaan ginekologi', 'kategori' => 'gejala', 'deskripsi' => 'Pemeriksaan kesehatan organ reproduksi wanita'],
        ];

        foreach ($diagnosas as $diagnosa) {
            DB::table('m_diagnosa')->insert($diagnosa);
        }

        // Master Tindakan Medis
        $tindakans = [
            ['kode_tindakan' => 'TIN001', 'nama_tindakan' => 'Pemeriksaan Fisik Lengkap', 'kategori' => 'pemeriksaan', 'tarif' => 75000.00, 'deskripsi' => 'Pemeriksaan fisik menyeluruh oleh dokter'],
            ['kode_tindakan' => 'TIN002', 'nama_tindakan' => 'EKG (Elektrokardiografi)', 'kategori' => 'pemeriksaan', 'tarif' => 150000.00, 'deskripsi' => 'Pemeriksaan fungsi jantung dengan EKG'],
            ['kode_tindakan' => 'TIN003', 'nama_tindakan' => 'USG Abdomen', 'kategori' => 'pemeriksaan', 'tarif' => 250000.00, 'deskripsi' => 'Ultrasonografi abdomen'],
            ['kode_tindakan' => 'TIN004', 'nama_tindakan' => 'Injeksi Intravena', 'kategori' => 'tindakan', 'tarif' => 25000.00, 'deskripsi' => 'Pemberian obat melalui pembuluh darah'],
            ['kode_tindakan' => 'TIN005', 'nama_tindakan' => 'Perawatan Luka', 'kategori' => 'tindakan', 'tarif' => 50000.00, 'deskripsi' => 'Perawatan dan perban luka'],
            ['kode_tindakan' => 'TIN006', 'nama_tindakan' => 'Appendektomi', 'kategori' => 'operasi', 'tarif' => 5000000.00, 'deskripsi' => 'Operasi pengangkatan usus buntu'],
            ['kode_tindakan' => 'TIN007', 'nama_tindakan' => 'Fisioterapi', 'kategori' => 'rehabilitasi', 'tarif' => 100000.00, 'deskripsi' => 'Terapi fisik untuk pemulihan'],
        ];

        foreach ($tindakans as $tindakan) {
            DB::table('m_tindakan')->insert($tindakan);
        }

        // Master Penjamin
        $penjamins = [
            ['kode_penjamin' => 'BPJS001', 'nama_penjamin' => 'BPJS Kesehatan', 'jenis_penjamin' => 'bpjs', 'telepon' => '1500400', 'email' => 'info@bpjs-kesehatan.go.id'],
            ['kode_penjamin' => 'ASUR001', 'nama_penjamin' => 'Prudential Life Assurance', 'jenis_penjamin' => 'asuransi_swasta', 'alamat' => 'Jl. Jend. Sudirman Kav. 50-51, Jakarta', 'telepon' => '021-2500000', 'email' => 'info@prudential.co.id'],
            ['kode_penjamin' => 'ASUR002', 'nama_penjamin' => 'Allianz Indonesia', 'jenis_penjamin' => 'asuransi_swasta', 'alamat' => 'Jl. Prof. Dr. Satrio Kav. 18, Jakarta', 'telepon' => '021-29269999', 'email' => 'info@allianz.co.id'],
            ['kode_penjamin' => 'PERUS001', 'nama_penjamin' => 'PT. Telkom Indonesia', 'jenis_penjamin' => 'perusahaan', 'alamat' => 'Jl. Japati No. 1, Bandung', 'telepon' => '021-3860500', 'email' => 'corporate@telkom.co.id'],
            ['kode_penjamin' => 'UMUM001', 'nama_penjamin' => 'Pembayaran Tunai', 'jenis_penjamin' => 'perorangan'],
        ];

        foreach ($penjamins as $penjamin) {
            DB::table('m_penjamin')->insert($penjamin);
        }

        // Master Ruangan
        $ruangans = [
            ['kode_ruangan' => 'RIN001', 'nama_ruangan' => 'Kamar VIP 101', 'jenis_ruangan' => 'rawat_inap', 'kapasitas' => 1, 'tarif_per_hari' => 1500000.00, 'fasilitas' => 'TV, AC, Kamar mandi dalam, Sofa tamu'],
            ['kode_ruangan' => 'RIN002', 'nama_ruangan' => 'Kamar Kelas 1 - 201', 'jenis_ruangan' => 'rawat_inap', 'kapasitas' => 2, 'tarif_per_hari' => 750000.00, 'fasilitas' => 'TV, AC, Kamar mandi bersama'],
            ['kode_ruangan' => 'RIN003', 'nama_ruangan' => 'Kamar Kelas 2 - 301', 'jenis_ruangan' => 'rawat_inap', 'kapasitas' => 4, 'tarif_per_hari' => 350000.00, 'fasilitas' => 'AC, Kamar mandi bersama'],
            ['kode_ruangan' => 'RICU001', 'nama_ruangan' => 'ICU Room 1', 'jenis_ruangan' => 'icu', 'kapasitas' => 1, 'tarif_per_hari' => 2500000.00, 'fasilitas' => 'Monitor vital, Ventilator, AC sentral'],
            ['kode_ruangan' => 'ROPE001', 'nama_ruangan' => 'Ruang Operasi 1', 'jenis_ruangan' => 'operasi', 'kapasitas' => 1, 'fasilitas' => 'Lampu operasi, Meja operasi, Sterilisasi'],
            ['kode_ruangan' => 'RIGD001', 'nama_ruangan' => 'Ruang IGD', 'jenis_ruangan' => 'igd', 'kapasitas' => 10, 'fasilitas' => 'Bed emergency, Defibrillator, Emergency cart'],
        ];

        foreach ($ruangans as $ruangan) {
            DB::table('m_ruangan')->insert($ruangan);
        }

        // Master Supplier
        $suppliers = [
            ['kode_supplier' => 'SUP001', 'nama_supplier' => 'PT. Kimia Farma', 'alamat' => 'Jl. Veteran No. 1, Jakarta', 'telepon' => '021-3849999', 'email' => 'procurement@kimiafarma.co.id', 'pic' => 'Budi Santoso'],
            ['kode_supplier' => 'SUP002', 'nama_supplier' => 'PT. Indofarma', 'alamat' => 'Jl. Surabaya No. 5, Bandung', 'telepon' => '022-4200000', 'email' => 'sales@indofarma.co.id', 'pic' => 'Siti Aminah'],
            ['kode_supplier' => 'SUP003', 'nama_supplier' => 'PT. Kalbe Farma', 'alamat' => 'Jl. Letjen Suprapto No. 10, Jakarta', 'telepon' => '021-4600000', 'email' => 'proc@kalbe.co.id', 'pic' => 'Ahmad Rahman'],
        ];

        foreach ($suppliers as $supplier) {
            DB::table('m_supplier')->insert($supplier);
        }

        // Master Laboratorium
        $laboratoriums = [
            ['kode_lab' => 'LAB001', 'nama_pemeriksaan' => 'Hemoglobin (Hb)', 'kategori' => 'hematologi', 'satuan' => 'g/dL', 'nilai_normal' => '12-16 (W), 13-17 (P)', 'tarif' => 35000.00],
            ['kode_lab' => 'LAB002', 'nama_pemeriksaan' => 'Leukosit', 'kategori' => 'hematologi', 'satuan' => '/µL', 'nilai_normal' => '4000-11000', 'tarif' => 30000.00],
            ['kode_lab' => 'LAB003', 'nama_pemeriksaan' => 'Trombosit', 'kategori' => 'hematologi', 'satuan' => '/µL', 'nilai_normal' => '150000-450000', 'tarif' => 35000.00],
            ['kode_lab' => 'LAB004', 'nama_pemeriksaan' => 'Glukosa Puasa', 'kategori' => 'kimia', 'satuan' => 'mg/dL', 'nilai_normal' => '70-100', 'tarif' => 25000.00],
            ['kode_lab' => 'LAB005', 'nama_pemeriksaan' => 'Kolesterol Total', 'kategori' => 'kimia', 'satuan' => 'mg/dL', 'nilai_normal' => '<200', 'tarif' => 40000.00],
            ['kode_lab' => 'LAB006', 'nama_pemeriksaan' => 'SGOT/SGPT', 'kategori' => 'kimia', 'satuan' => 'U/L', 'nilai_normal' => 'SGOT: 5-40, SGPT: 7-56', 'tarif' => 50000.00],
        ];

        foreach ($laboratoriums as $lab) {
            DB::table('m_laboratorium')->insert($lab);
        }

        // Master Radiologi
        $radiologis = [
            ['kode_radio' => 'RAD001', 'nama_pemeriksaan' => 'Foto Thorax PA', 'kategori' => 'X-Ray', 'tarif' => 75000.00, 'deskripsi' => 'Foto rontgen dada posisi posterior-anterior'],
            ['kode_radio' => 'RAD002', 'nama_pemeriksaan' => 'Foto Abdomen', 'kategori' => 'X-Ray', 'tarif' => 65000.00, 'deskripsi' => 'Foto rontgen abdomen'],
            ['kode_radio' => 'RAD003', 'nama_pemeriksaan' => 'USG Abdomen', 'kategori' => 'USG', 'tarif' => 150000.00, 'deskripsi' => 'Ultrasonografi abdomen'],
            ['kode_radio' => 'RAD004', 'nama_pemeriksaan' => 'USG Kandungan', 'kategori' => 'USG', 'tarif' => 125000.00, 'deskripsi' => 'Ultrasonografi organ reproduksi wanita'],
            ['kode_radio' => 'RAD005', 'nama_pemeriksaan' => 'CT Scan Kepala', 'kategori' => 'CT-Scan', 'tarif' => 750000.00, 'deskripsi' => 'Computed Tomography scan kepala'],
            ['kode_radio' => 'RAD006', 'nama_pemeriksaan' => 'MRI Lutut', 'kategori' => 'MRI', 'tarif' => 1200000.00, 'deskripsi' => 'Magnetic Resonance Imaging lutut'],
        ];

        foreach ($radiologis as $radio) {
            DB::table('m_radiologi')->insert($radio);
        }
    }
}
