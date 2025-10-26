# 📡 SIRAMA API Documentation

Dokumen ini merinci endpoint REST dan FHIR API yang digunakan dalam sistem SIRAMA.  
Semua API menggunakan format JSON dan autentikasi JWT.

---

## 🔐 Autentikasi
POST /auth/login  
Deskripsi: Login pengguna  
Body:  
{ "username": "string", "password": "string" }  
Output:  
{ "token": "JWT" }

GET /auth/me  
Header: Authorization: Bearer <token>  
Output: Data user aktif

---

## 🟢 Fase 1 – Klinik & Puskesmas
Modul Pasien  
GET /pasien → Ambil daftar pasien  
POST /pasien → Tambah pasien baru

Modul Rekam Medis  
GET /rekam-medis/:id → Ambil data rekam medis  
POST /rekam-medis → Simpan hasil pemeriksaan

Modul Kasir  
POST /kasir/transaksi → Buat transaksi pembayaran  
GET /kasir/:id → Ambil detail transaksi

Modul Antrian  
POST /antrian → Ambil nomor antrian  
GET /antrian/:id → Status antrian

Modul Dashboard  
GET /dashboard → Statistik kunjungan & pendapatan

Modul Audit Trail  
GET /audit/:id → Ambil log aktivitas  
POST /audit → Simpan log aktivitas

Modul Bridging BPJS (Dasar)  
POST /bpjs/sep → Buat SEP  
GET /bpjs/peserta/:nokartu → Cek peserta  
GET /bpjs/antrean/:poli → Ambil antrean Mobile JKN

---

## 🟡 Fase 2 – RS Tipe C
Modul Rawat Inap  
POST /inap → Booking kamar  
GET /inap/:id → Status rawat inap

Modul Farmasi  
POST /farmasi/resep → Entry resep  
GET /farmasi/stok → Cek stok obat

Modul Laboratorium  
POST /lab/permintaan → Permintaan lab  
GET /lab/hasil/:id → Hasil lab

Modul Radiologi  
POST /radiologi/permintaan → Permintaan scan  
GET /radiologi/hasil/:id → Hasil radiologi

Modul MCU  
POST /mcu → Entry hasil MCU  
GET /mcu/:id → Sertifikat MCU

Modul Laporan  
GET /laporan/:jenis → Export laporan PDF/Excel

---

## 🟠 Fase 3 – RS Tipe B
Modul Bridging BPJS (Lanjutan)  
POST /bpjs/pcare → Entry PCare  
GET /bpjs/aplicare → Cek ketersediaan kamar  
POST /bpjs/rujukan → Buat rujukan

Modul SDM & Presensi  
POST /sdm/absen → Entry presensi  
GET /sdm/jadwal/:id → Jadwal pegawai

Modul Aset & Inventaris  
POST /aset → Tambah aset  
GET /aset/:id → Detail aset

Modul Gizi & Dapur  
POST /gizi → Permintaan makanan  
GET /gizi/stok → Cek stok dapur

Modul Notifikasi  
POST /notifikasi/send → Kirim notifikasi

Modul Kepatuhan & SIRS  
GET /sirs/export → Export laporan  
POST /sirs/kirim → Kirim ke server SIRS

---

## 🔴 Fase 4 – RS Tipe A & Nasional
Modul FHIR API  
GET /fhir/Patient/:id → Ambil data pasien (FHIR)  
POST /fhir/Encounter → Simpan encounter

Modul Mobile API  
GET /mobile/pasien/:id → Data pasien untuk mobile  
POST /mobile/booking → Booking via mobile

Modul Telemedisin  
POST /telemedisin/sesi → Buat sesi konsultasi  
GET /telemedisin/:id → Status sesi

Modul Data Warehouse  
GET /dw/:jenis → Dataset analitik

Modul Manajemen Cabang  
POST /cabang → Tambah cabang  
GET /cabang/:id → Detail cabang

Modul Pembayaran Digital  
POST /bayar/qris → Buat transaksi QRIS  
GET /bayar/status/:id → Status pembayaran

Modul Mutu & Risiko  
POST /mutu/insiden → Laporan insiden  
GET /mutu/audit → Audit mutu

Modul AI Assistant  
POST /ai/triase → Triase mandiri  
GET /ai/saran/:id → Rekomendasi diagnosa

---

## 🧠 Fase Opsional – Ekspansi & Ekosistem
Modul eLearning  
GET /elearning/:id → Materi pelatihan  
POST /elearning/progress → Update progress

Modul Franchise Manager  
GET /franchise/:id → Detail grup RS

Modul Service Center  
POST /service/report → Laporan kerusakan alat

Modul Kasbon & HR  
POST /kasbon → Entry kasbon pegawai  
GET /kasbon/:id → Status kasbon

Modul Antrian Publik  
GET /antrian-publik/:lokasi → Status antrean kota

---

📌 Semua endpoint akan dihubungkan ke controller dan service masing-masing modul  
📌 Dokumentasi ini akan diperbarui sesuai progres implementasi backend  
📌 Untuk spesifikasi Swagger/OpenAPI, lihat docs/swagger.yaml
