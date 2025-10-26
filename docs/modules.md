# Modul Utama SIRAMA

Dokumen ini merinci fungsi utama tiap modul dalam sistem SIRAMA, dibagi berdasarkan fase pengembangan.

---

## 🟢 Fase 1 – Klinik & Puskesmas

### Modul Pasien
- Fungsi: Pendaftaran, identitas, riwayat kunjungan
- Input: Nama, NIK, alamat, tgl lahir
- Output: ID pasien, status
- Tabel: pasien, reg_periksa
- Endpoint: GET /pasien, POST /pasien

### Modul Rekam Medis
- Fungsi: Pemeriksaan, diagnosa, tindakan, resume
- Input: No. RM, keluhan, diagnosa, ICD-10
- Output: Resume PDF, status kunjungan
- Tabel: pemeriksaan, diagnosa, resume
- Endpoint: GET /rekam-medis/:id, POST /rekam-medis

### Modul Kasir
- Fungsi: Billing, pembayaran, piutang
- Input: ID pasien, daftar tindakan, total bayar
- Output: ID transaksi, kwitansi PDF
- Tabel: billing, piutang
- Endpoint: POST /kasir/transaksi, GET /kasir/:id

### Modul Antrian
- Fungsi: Nomor antrian poli, apotek, loket
- Input: Poli, jenis layanan
- Output: Nomor antrian, status panggilan
- Tabel: antrean_poli, antrean_apotek
- Endpoint: POST /antrian, GET /antrian/:id

### Modul Dashboard
- Fungsi: Ringkasan kunjungan, pendapatan, antrean
- Output: Grafik, statistik, rekap harian
- Endpoint: GET /dashboard

### Modul Auth & Role
- Fungsi: Login, hak akses, manajemen user
- Tabel: users, roles, permissions
- Endpoint: POST /auth/login, GET /auth/me

### Modul Audit Trail
- Fungsi: Log aktivitas pengguna, perubahan data
- Tabel: audit_log
- Endpoint: GET /audit/:id, POST /audit

### Modul Bridging BPJS (Dasar)
- Fungsi: Pembuatan SEP, cek peserta, antrean Mobile JKN
- Input: No. kartu BPJS, poli, diagnosa
- Output: No. SEP, status antrean
- Endpoint: POST /bpjs/sep, GET /bpjs/peserta/:nokartu, GET /bpjs/antrean/:poli

---

## 🟡 Fase 2 – RS Tipe C

### Modul Rawat Inap
- Fungsi: Booking kamar, monitoring pasien, tagihan inap
- Input: ID pasien, kamar, tanggal masuk/keluar
- Output: Status rawat, tagihan
- Tabel: inap_kamar, monitoring_inap, tagihan_inap
- Endpoint: POST /inap, GET /inap/:id

### Modul Farmasi
- Fungsi: Entry resep, penyerahan obat, stok gudang
- Input: ID resep, obat, dosis, stok
- Output: Status penyerahan, sisa stok
- Tabel: resep, penyerahan_obat, stok_obat
- Endpoint: POST /farmasi/resep, GET /farmasi/stok

### Modul Laboratorium
- Fungsi: Permintaan & hasil lab
- Input: Jenis pemeriksaan, sampel, ID pasien
- Output: Hasil lab, PDF cetak
- Tabel: permintaan_lab, hasil_lab
- Endpoint: POST /lab/permintaan, GET /lab/hasil/:id

### Modul Radiologi
- Fungsi: Permintaan & hasil scan, upload gambar
- Input: Jenis scan, ID pasien
- Output: Hasil radiologi, file gambar
- Tabel: permintaan_radiologi, hasil_radiologi
- Endpoint: POST /radiologi/permintaan, GET /radiologi/hasil/:id

### Modul MCU
- Fungsi: Pemeriksaan fisik, hasil MCU, cetak sertifikat
- Input: ID pasien, parameter fisik
- Output: Sertifikat MCU, status kelulusan
- Tabel: hasil_mcu
- Endpoint: POST /mcu, GET /mcu/:id

### Modul Laporan
- Fungsi: Kunjungan, tindakan, pendapatan, export PDF/Excel
- Output: File laporan, grafik
- Tabel: laporan_kunjungan, laporan_tindakan, laporan_keuangan
- Endpoint: GET /laporan/:jenis

---

## 🟠 Fase 3 – RS Tipe B

### Modul Bridging BPJS (Lanjutan)
- Fungsi: PCare, Aplicare, Rujukan, Kontrol
- Input: No. kartu, poli, diagnosa, faskes tujuan
- Output: No. rujukan, status kamar, kontrol lanjutan
- Endpoint: POST /bpjs/pcare, GET /bpjs/aplicare, POST /bpjs/rujukan

### Modul SDM & Presensi
- Fungsi: Jadwal, shift, absensi, fingerprint
- Input: ID pegawai, jam masuk/keluar
- Output: Status kehadiran, laporan presensi
- Tabel: pegawai, jadwal_dokter, absensi
- Endpoint: POST /sdm/absen, GET /sdm/jadwal/:id

### Modul Aset & Inventaris
- Fungsi: Manajemen alat & barang
- Input: Nama barang, lokasi, status
- Output: Laporan aset, histori pemakaian
- Tabel: aset, histori_aset
- Endpoint: POST /aset, GET /aset/:id

### Modul Gizi & Dapur
- Fungsi: Permintaan makanan pasien, stok dapur
- Input: ID pasien, jenis diet, menu
- Output: Jadwal makanan, stok bahan
- Tabel: permintaan_gizi, stok_dapur
- Endpoint: POST /gizi, GET /gizi/stok

### Modul Notifikasi
- Fungsi: SMS/WA/email untuk antrean, hasil, tagihan
- Input: No. HP/email, jenis notifikasi
- Output: Status pengiriman
- Tabel: notifikasi_log
- Endpoint: POST /notifikasi/send

### Modul Kepatuhan & SIRS
- Fungsi: Laporan SIRS Online, SIMLITABMAS
- Input: Data kunjungan, tindakan, diagnosa
- Output: File XML/JSON, status kirim
- Tabel: laporan_sirs
- Endpoint: GET /sirs/export, POST /sirs/kirim

---

## 🔴 Fase 4 – RS Tipe A & Nasional

### Modul FHIR API
- Fungsi: Interoperabilitas standar HL7 FHIR
- Output: JSON FHIR resources (Patient, Encounter, Observation)
- Endpoint: GET /fhir/Patient/:id, POST /fhir/Encounter

### Modul Mobile API
- Fungsi: Endpoint untuk aplikasi pasien & dokter
- Output: JSON untuk frontend mobile
- Endpoint: GET /mobile/pasien/:id, POST /mobile/booking

### Modul Telemedisin
- Fungsi: Video call, upload hasil mandiri, triase online
- Input: Keluhan, file hasil, jadwal konsultasi
- Output: Link video, status konsultasi
- Endpoint: POST /telemedisin/sesi, GET /telemedisin/:id

### Modul Data Warehouse
- Fungsi: Integrasi ke BI tools, analitik lanjutan
- Output: Dataset OLAP, grafik tren
- Tabel: dw_kunjungan, dw_pendapatan
- Endpoint: GET /dw/:jenis

### Modul Manajemen Cabang
- Fungsi: Multi-faskes, grup RS, franchise
- Input: ID cabang, data operasional
- Output: Rekap grup, laporan per cabang
- Tabel: cabang, laporan_cabang
- Endpoint: GET /cabang/:id, POST /cabang

### Modul Pembayaran Digital
- Fungsi: QRIS, e-wallet, virtual account
- Input: Total tagihan, metode bayar
- Output: Status transaksi, bukti bayar
- Endpoint: POST /bayar/qris, GET /bayar/status/:id

### Modul Mutu & Risiko
- Fungsi: Audit mutu, pelaporan insiden, manajemen risiko
- Input: Jenis insiden, lokasi, tindakan korektif
- Output: Laporan mutu, status tindak lanjut
- Tabel: insiden, audit_mutu
- Endpoint: POST /mutu/insiden, GET /mutu/audit

### Modul AI Assistant
- Fungsi: Chatbot medis, rekomendasi diagnosa, triase mandiri
- Input: Keluhan pasien, gejala
- Output: Saran diagnosa, rujukan
- Endpoint: POST /ai/triase, GET /ai/saran/:id

---

## 🧠 Fase Opsional Ekspansi

### Modul eLearning
- Fungsi: Pelatihan staf, onboarding digital
- Tabel: materi, progress_pelatihan
- Endpoint: GET /elearning/:id
