## 👥 Role User (Demo Frontend)

| Role                  | Akses Modul                                                                 |
|-----------------------|------------------------------------------------------------------------------|
| **Admin Sistem**      | Semua modul, manajemen user, audit trail, dashboard                         |
| **Petugas Pendaftaran** | Pasien, Antrian, Bridging BPJS, Riwayat Kunjungan                          |
| **Dokter**            | Rekam Medis, Resume, MCU, Riwayat Pasien, Order Lab/Rad                     |
| **Kasir**             | Billing, Kwitansi, Pembayaran, Cetak Tagihan                                |
| **Apoteker**          | Farmasi, Entry Resep, Penyerahan Obat, Stok Gudang                          |
| **Petugas Lab/Rad**   | Laboratorium, Radiologi, Upload Hasil, Cetak                                |
| **Perawat Rawat Inap**| Monitoring pasien, input tanda vital, status kamar                          |
| **Manajemen RS**      | Laporan, dashboard, rekap pendapatan, SDM                                   |

---
## 👥 Role User (Database Backend)

| No | Role               | Jumlah Menu Utama | Tabel yang Diakses di Dashboard                                      |
|----|--------------------|-------------------|------------------------------------------------------------------------|
| 1  | Dokter             | 6                 | t_emr, t_cppt, t_diagnosis, t_order_resep, t_order_lab, t_order_rad   |
| 2  | PerawatPoli        | 4                 | t_ttv, t_triase, t_cppt, t_asistensi                                  |
| 3  | PerawatIGD         | 5                 | t_triase, t_ttv, t_cppt, t_emr, t_antrian_poli                         |
| 4  | Radiografer        | 3                 | t_order_rad, t_hasil_rad, t_validasi_rad                              |
| 5  | AnalisLab          | 3                 | t_order_lab, t_hasil_lab, t_validasi_lab                              |
| 6  | Apoteker           | 5                 | t_order_resep, t_validasi_resep, t_dispensing, t_stok, t_mutasi_stok |
| 7  | Gizi               | 4                 | t_asesmen_gizi, t_order_diet, t_distribusi_diet                       |
| 8  | RekamMedis         | 5                 | t_verifikasi_rm, t_koding_icd, t_grouping_inacbg, t_berkas_klaim      |
| 9  | KepalaUnit         | 3                 | t_kpi_bor, t_kpi_los, t_kpi_toi                                       |
| 10 | TPP                | 5                 | t_registrasi, t_pasien, t_antrian, t_sep                              |
| 11 | Kasir              | 4                 | t_billing, t_pembayaran, t_kwitansi, t_deposit                        |
| 12 | SDM                | 4                 | m_pegawai, t_absensi, t_presensi, t_gaji                              |
| 13 | Keuangan           | 5                 | t_jurnal, t_piutang, t_hutang, m_bank                                 |
| 14 | LogistikMedis      | 5                 | t_stok, t_mutasi_stok, t_opname, m_obat, m_satuan                     |
| 15 | LogistikUmum       | 4                 | t_aset, t_po, m_barang_nonmedis, m_aset_kategori                      |
| 16 | ManajemenRS        | 6                 | t_kpi_bor, t_kpi_los, t_pendapatan_global, t_indeks_kepuasan          |
| 17 | Supplier           | 2                 | m_supplier, t_po                                                      |
| 18 | Penjamin           | 2                 | m_penjamin, r_pasien_penjamin                                         |
| 19 | AdminSistem        | 6                 | m_user, m_role, r_user_role, t_audit_log, t_backup_audit              |
| 20 | IntegrasiBPJS      | 3                 | t_sep, t_klaim_bpjs, t_antrol                                         |
| 21 | IntegrasiSatuSehat | 3                 | t_emr, t_cppt, t_diagnosis, t_fhir_push                               |
| 22 | MonitoringAudit    | 4                 | t_audit_log, t_error_log, t_uat_log, t_backup_audit                   |
