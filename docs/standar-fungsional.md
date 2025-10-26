# Standar Fungsional SIRAMA

## Modul Pasien
- Fungsi: Pendaftaran, identitas, riwayat kunjungan
- Input: Nama, NIK, alamat, tgl lahir
- Output: ID pasien, status
- Tabel: pasien, reg_periksa
- Endpoint: GET /pasien, POST /pasien

## Modul Kasir
- Fungsi: Billing, pembayaran, piutang
- Input: ID pasien, daftar tindakan, total bayar
- Output: ID transaksi, kwitansi
- Tabel: billing, piutang
- Endpoint: POST /kasir/transaksi
