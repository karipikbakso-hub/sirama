# 🧭 Roadmap Pengembangan Proyek SIRAMA

SIRAMA (Sistem Informasi Rumah Sakit Modular Adaptif) dikembangkan secara bertahap dalam 4 fase utama dan 1 fase opsional ekspansi. Setiap fase mencakup modul-modul fungsional yang dapat berdiri sendiri dan dikembangkan secara modular.

---

# 🏥 Roadmap Modular SIMRS – SIRAMA

## 🟢 Fase 1 – Klinik & Puskesmas (Core MVP + BPJS Dasar)
**Fokus**: Alur dasar pasien, pemeriksaan, pembayaran, dan integrasi BPJS minimal  
**Target**: Klinik kecil, Puskesmas, praktik mandiri  
**Fitur Futuristik**: Audit trail granular, dashboard real-time, integrasi antrean Mobile JKN

### Modul:
- **Pasien** – Pendaftaran, identitas, riwayat kunjungan
- **Rekam Medis** – Pemeriksaan, diagnosa, resume
- **Kasir** – Billing rawat jalan, pembayaran, kwitansi
- **Antrian** – Nomor antrian poli, loket, apotek
- **Dashboard** – Ringkasan kunjungan & pendapatan
- **Auth & Role** – Login, hak akses
- **Audit Trail** – Log aktivitas pengguna & perubahan data
- **Bridging BPJS (Dasar)** – Pembuatan SEP, cek peserta, antrean Mobile JKN
- **Fasilitas & Kamar** – Status ruang, pemakaian, pemeliharaan (untuk persiapan rawat inap)
- **Surveilans & Pelaporan** – Laporan penyakit menular, imunisasi, pelaporan ke Kemenkes via FHIR
- **FHIR SATUSEHAT (Dasar)** – Struktur data pasien, encounter, observation, dan kunjungan sesuai HL7 FHIR

---

## 🟡 Fase 2 – RS Tipe C (Rawat Inap & Pemeriksaan Penunjang)
**Fokus**: Layanan rawat inap dan pemeriksaan penunjang  
**Target**: RS tipe C, RS swasta kecil  
**Fitur Futuristik**: Upload hasil lab/radiologi digital, cetak otomatis, integrasi LIS/PACS

### Modul:
- **Rawat Inap** – Booking kamar, monitoring, tagihan
- **Farmasi** – Entry resep, penyerahan, stok gudang
- **Laboratorium** – Permintaan & hasil lab, cetak hasil
- **Radiologi** – Permintaan & hasil scan, upload gambar
- **MCU** – Pemeriksaan fisik, hasil MCU, cetak sertifikat
- **Laporan** – Kunjungan, tindakan, pendapatan, export PDF/Excel
- **Bridging BPJS (Lanjutan)** – e-Claim, VClaim, validasi INA-CBG
- **SDM & Jadwal** – Manajemen pegawai, shift, absensi
- **Integrasi LIS/PACS** – Koneksi sistem lab & radiologi eksternal
- **FHIR SATUSEHAT (Lanjutan)** – Resource lanjutan: DiagnosticReport, Medication, ImagingStudy

---

## 🟠 Fase 3 – RS Tipe B (Integrasi Nasional & Operasional Lanjutan)

**Fokus:** Integrasi BPJS penuh dan manajemen operasional RS  
**Target:** RS tipe B, RS daerah  
**Fitur Futuristik:** Fingerprint presensi, notifikasi otomatis, integrasi e-SIRS

### Modul:
- **Bridging BPJS (Lanjutan)** – PCare, Aplicare, Rujukan, Kontrol
- **SDM & Presensi** – Jadwal, shift, absensi, fingerprint
- **Aset & Inventaris** – Manajemen alat & barang
- **Gizi & Dapur** – Permintaan makanan pasien, stok dapur
- **Notifikasi** – SMS/WA/email untuk antrean, hasil, tagihan
- **Kepatuhan & SIRS** – Laporan SIRS Online, SIMLITABMAS

---

## 🔴 Fase 4 – RS Tipe A & Nasional (Skalabilitas & Inovasi)

**Fokus:** Interoperabilitas, mobile-first, analitik, dan ekspansi multi-faskes  
**Target:** RS tipe A, grup RS, nasional  
**Fitur Futuristik:** FHIR-ready, mobile-first, AI-powered, cloud-native

### Modul:
- **FHIR API** – Standar interoperabilitas global (HL7 FHIR)
- **Mobile API** – Endpoint untuk aplikasi pasien & dokter
- **Telemedisin** – Video call, upload hasil mandiri
- **Data Warehouse** – Integrasi ke BI tools, analitik lanjutan
- **Manajemen Cabang** – Multi-faskes, grup RS, franchise
- **Pembayaran Digital** – QRIS, e-wallet, virtual account
- **Mutu & Risiko** – Audit mutu, pelaporan insiden, manajemen risiko
- **AI Assistant** – Chatbot medis, rekomendasi diagnosa, triase mandiri

---

## 🧠 Fase Opsional – Ekspansi & Ekosistem

**Fokus:** Modul tambahan untuk grup RS, pelatihan, dan integrasi eksternal

### Modul:
- **eLearning** – Pelatihan staf, onboarding digital
- **Franchise Manager** – Manajemen grup klinik atau RS
- **Service Center** – Modul teknisi & perawatan alat
- **Kasbon & HR** – Manajemen keuangan pegawai
- **Antrian Publik** – Integrasi dengan sistem antrean kota/kabupaten
- **Integrasi Kemenkes** – SATUSEHAT, e-SIRS, e-Klaim, e-Presensi

---

> 📌 Setiap modul akan dijabarkan lebih lanjut di `docs/modules.md`  
> 📌 Setiap fase dapat dikembangkan dan diuji secara terpisah  
> 📌 Dokumentasi ini akan terus diperbarui sesuai progres proyek
