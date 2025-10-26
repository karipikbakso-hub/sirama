# Modul Utama SIRAMA

Dokumen ini merinci fungsi utama tiap modul dalam sistem SIRAMA.

---

## Modul Pasien
- Fungsi: Pendaftaran, identitas, riwayat kunjungan
- Input: Nama, NIK, alamat, tgl lahir
- Output: ID pasien, status
- Tabel: pasien, reg_periksa
- Endpoint: GET /pasien, POST /pasien

---

## Modul Rekam Medis
- Fungsi: Pemeriksaan, diagnosa, tindakan, resume
- Input: No. RM, keluhan, diagnosa, ICD-10
- Output: Resume PDF, status kunjungan
- Tabel: pemeriksaan, diagnosa, resume
- Endpoint: GET /rekam-medis/:id, POST /rekam-medis

---

## Modul Kasir
- Fungsi: Billing, pembayaran, piutang
- Input: ID pasien, daftar tindakan, total bayar
- Output: ID transaksi, kwitansi PDF
- Tabel: billing, piutang
- Endpoint: POST /kasir/transaksi, GET /kasir/:id

---

## Modul Bridging BPJS (Dasar)
- Fungsi: Pembuatan SEP, cek peserta, antrean Mobile JKN
- Input: No. kartu BPJS, poli, diagnosa
- Output: No. SEP, status antrean
- Endpoint: POST /bpjs/sep, GET /bpjs/peserta/:nokartu, GET /bpjs/antrean/:poli

---

## Modul Antrian
- Fungsi: Nomor antrian poli, apotek, loket
- Input: Poli, jenis layanan
- Output: Nomor antrian, status panggilan
- Tabel: antrean_poli, antrean_apotek
- Endpoint: POST /antrian, GET /antrian/:id

---

## Modul Dashboard
- Fungsi: Ringkasan kunjungan, pendapatan, antrean
- Output: Grafik, statistik, rekap harian
- Endpoint: GET /dashboard

---

## Modul Auth & Role
- Fungsi: Login, hak akses, manajemen user
- Tabel: users, roles, permissions
- Endpoint: POST /auth/login, GET /auth/me

---

## Modul Audit Trail
- Fungsi: Log aktivitas pengguna, perubahan data
- Tabel: audit_log
- Endpoint: GET /audit/:id, POST /audit
