# 📋 Standar Fungsional Sistem SIRAMA

Dokumen ini merinci kebutuhan fungsional utama yang harus dipenuhi oleh sistem SIRAMA berdasarkan praktik terbaik SIMRS dan regulasi Kemenkes.

---

## 🟢 Fase 1 – Klinik & Puskesmas

- Sistem harus mampu mencatat data pasien baru dan riwayat kunjungan
- Sistem harus mendukung pemeriksaan dokter, diagnosa ICD-10, dan resume medis
- Sistem harus menghasilkan tagihan dan kwitansi sesuai tindakan
- Sistem harus mengelola antrean poli dan apotek secara real-time
- Sistem harus memiliki dashboard kunjungan dan pendapatan harian
- Sistem harus memiliki autentikasi pengguna dan manajemen hak akses
- Sistem harus mencatat semua aktivitas pengguna (audit trail)
- Sistem harus terintegrasi dengan BPJS untuk pembuatan SEP dan antrean Mobile JKN

---

## 🟡 Fase 2 – RS Tipe C

- Sistem harus mendukung rawat inap: booking kamar, monitoring, tagihan
- Sistem harus mendukung entry resep dan penyerahan obat di farmasi
- Sistem harus mendukung permintaan dan hasil laboratorium
- Sistem harus mendukung permintaan dan hasil radiologi, termasuk upload gambar
- Sistem harus mendukung pemeriksaan MCU dan cetak sertifikat
- Sistem harus menghasilkan laporan kunjungan, tindakan, dan keuangan

---

## 🟠 Fase 3 – RS Tipe B

- Sistem harus mendukung integrasi BPJS lanjutan: PCare, Aplicare, Rujukan
- Sistem harus mengelola jadwal, shift, dan presensi pegawai
- Sistem harus mencatat dan melacak aset dan inventaris RS
- Sistem harus mendukung permintaan makanan pasien dan stok dapur
- Sistem harus mengirim notifikasi ke pasien via SMS/WA/email
- Sistem harus menghasilkan dan mengirim laporan SIRS sesuai regulasi

---

## 🔴 Fase 4 – RS Tipe A & Nasional

- Sistem harus mendukung interoperabilitas HL7 FHIR
- Sistem harus menyediakan API untuk aplikasi mobile pasien dan dokter
- Sistem harus mendukung telemedisin: video call, upload hasil mandiri
- Sistem harus menyediakan data warehouse untuk analitik lanjutan
- Sistem harus mendukung manajemen multi-cabang RS
- Sistem harus mendukung pembayaran digital: QRIS, e-wallet, VA
- Sistem harus mendukung pelaporan mutu dan manajemen risiko
- Sistem harus mendukung AI untuk triase dan rekomendasi diagnosa

---

## 🧠 Fase Opsional – Ekspansi & Ekosistem

- Sistem harus mendukung pelatihan staf melalui eLearning
- Sistem harus mendukung manajemen grup RS atau franchise
- Sistem harus mendukung pelaporan dan perawatan alat medis
- Sistem harus mendukung manajemen kasbon dan keuangan pegawai
- Sistem harus terintegrasi dengan sistem antrean publik kota/kabupaten
- Sistem harus kompatibel dengan integrasi SATUSEHAT, e-SIRS, e-Klaim

---

📌 Setiap poin fungsional akan dihubungkan ke modul dan endpoint terkait  
📌 Dokumen ini menjadi acuan validasi fitur dan pengujian sistem
