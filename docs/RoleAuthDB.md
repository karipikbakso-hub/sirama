# Database Summary — Rumah Sakit (Tipe B/C)
Dokumentasi ringkas: **Master tables**, **Transaksi tables**, dan mapping **role ⇄ menu**.
Format: `nama_tabel` — `kolom utama (FK)` — `deskripsi singkat`.

---

## A. MASTER TABLES (m_*)
| No | Tabel | Kolom Utama (tipe singkat) | Deskripsi |
|----|-------|----------------------------|----------|
| 1  | m_roles | id, nama (string, unique) | Daftar role (dokter, perawatpoli, kasir, admin, ...). |
| 2  | m_hak_akses | id, nama | Permission / hak akses (opsional jika pakai granular permission). |
| 3  | m_unit_kerja | id, nama | Unit/poli/departemen. |
| 4  | m_diagnosa | id, kode_icd, deskripsi | Katalog ICD / diagnosa. |
| 5  | m_tindakan | id, kode, nama, tarif_id (FK m_tarif) | Definisi tindakan medis. |
| 6  | m_tarif | id, nama, harga (decimal) | Tarif layanan / item biaya. |
| 7  | m_obat | id, nama, satuan_id (FK m_satuan), stok_min | Daftar obat & referensi satuan. |
| 8  | m_satuan | id, nama | Master satuan (tablet, ml, ampul). |
| 9  | m_kategori_barang | id, nama | Kategori barang/inventori. |
| 10 | m_supplier | id, nama, alamat, kontak | Supplier barang/obat. |
| 11 | m_aset | id, nama, kategori, lokasi | Aset tetap. |
| 12 | m_penjamin | id, nama, jenis | BPJS / Asuransi / Pribadi. |
| 13 | m_bank | id, nama, nomor_rekening | Data bank. |
| 14 | m_ruangan | id, nama, kapasitas | Ruangan/kelas/rawat. |
| 15 | m_pasien | id, nama, nik, tgl_lahir, jk, alamat, no_hp | Identitas pasien. |
| 16 | m_pegawai | id, nama, nip, jabatan, unit_kerja_id (FK) | Pegawai/tenaga kesehatan. |
| 17 | m_menu | id, label, path, icon, parent_id (nullable), urutan | Struktur navigasi (dipakai untuk sidebar). |
| 18 | m_kpi | id, indikator, deskripsi | Indikator kinerja. |
| 19 | m_status_kunjungan | id, status | Lookup status kunjungan. |
| 20 | m_status_pembayaran | id, status | Lookup status pembayaran. |
| 21 | m_status_rekam_medis | id, status | Lookup status RM. |
| 22 | m_pengaturan | id, kunci (unique), nilai (text) | Key-value app settings. |

**Catatan:** bila kamu gunakan **spatie/laravel-permission** maka `m_roles`/`m_hak_akses` bisa sinkronisasi ke tabel Spatie (`roles`, `permissions`) — atau gunakan Spatie langsung dan jadikan `m_roles` sebagai referensi human-readable.

---

## B. PIVOT / AUTH TABLES (pendukung role/menu)
| Tabel | Kolom Utama | Deskripsi |
|-------|-------------|----------|
| role_menu (m_role_menu) | id, role_id (FK m_roles), menu_id (FK m_menu), can_view (bool), can_create, can_edit, can_delete | Mapping role ⇄ menu + hak dasar (opsional). |
| user_role (m_user_role) | id, user_id (FK users), role_id (FK m_roles) | Jika tidak pakai Spatie. |
| role_permission (m_role_permission) | id, role_id, permission_id | Jika pakai hak granular custom. |

---

## C. TRANSAKSI / OPERASIONAL (t_*)
> Aku susun modular: header/detail + domain tables sehingga jumlah tabel tetap ringkas tapi mencakup semua kasus operasional rumah sakit tipe B/C.

| No | Tabel | Kolom Utama (FKs penting) | Deskripsi singkat |
|----|-------|---------------------------|-------------------|
| 1  | t_kunjungan | id, pasien_id(FK m_pasien), unit_kerja_id, dokter_id(users), jenis_kunjungan, status_id | Header semua aktivitas pasien (rawat jalan/igd/inap). |
| 2  | t_registrasi | id, kunjungan_id(FK), no_registrasi, waktu_registrasi | Pendaftaran / antrian awal. |
| 3  | t_antrian | id, unit_kerja_id, pasien_id, nomor, tanggal | Antrian per unit/poli. |
| 4  | t_triase | id, kunjungan_id, kategori, skor, catatan | Triase IGD / poli. |
| 5  | t_cppt | id, kunjungan_id, petugas_id, subjektif, objektif, assesmen, planning | Catatan perkembangan pasien. |
| 6  | t_ttv | id, kunjungan_id, suhu, nadi, resp, tekanan_darah, waktu | Tanda vital. |
| 7  | t_order (header) | id, kunjungan_id, jenis_order ('lab','rad','lain'), dokter_id, status | Generic order header (dipakai parent→detail). |
| 8  | t_order_detail | id, order_id(FK t_order), kode_item, parameter, nilai, satuan | Detail parameter order (lab) atau metadata radiologi. |
| 9  | t_hasil_lab | id, order_id(FK t_order), parameter, hasil, satuan, nilai_rujukan | Hasil laboratorium (tabular). |
| 10 | t_hasil_rad | id, order_id(FK t_order), file_url, kesimpulan, rekomendasi | Hasil radiologi (report, image links). |
| 11 | t_tindakan | id, kunjungan_id, tindakan_id(FK m_tindakan), petugas_id, tarif_id, waktu | Tindakan/prosedur yang dilakukan. |
| 12 | t_resep (header) | id, kunjungan_id, dokter_id, status, tanggal | Resep pasien. |
| 13 | t_resep_item | id, resep_id, obat_id, dosis, qty, aturan_pakai | Item resep (many). |
| 14 | t_billing | id, kunjungan_id, total, discount, status_id, created_at | Header billing/tagihan. |
| 15 | t_billing_item | id, billing_id, item_type ('tindakan','obat','lab'), item_id, tarif, qty, subtotal | Rincian biaya. |
| 16 | t_pembayaran | id, billing_id, jumlah, metode('tunai','debit','transfer'), waktu | Pembayaran (boleh multiple). |
| 17 | t_klaim_bpjs | id, billing_id, sep_id(FK t_sep), nomor_klaim, status, tanggal_klaim | Klaim kepada BPJS/penjamin. |
| 18 | t_sep | id, kunjungan_id, nomor_sep, tanggal_sep, diagnosa_awal | SEP BPJS. |
| 19 | t_deposit | id, pasien_id, jumlah, tipe('masuk'|'pakai'), waktu | Deposit pasien. |
| 20 | t_po | id, supplier_id, no_po, tanggal, status | Purchase order header. |
| 21 | t_po_item | id, po_id, barang_id, qty, harga_satuan | PO item. |
| 22 | t_stok_mutasi | id, barang_id, jenis('masuk','keluar','opname'), qty, sumber_id(FK), tanggal | Mutasi stok/gudang. |
| 23 | t_opname | id, barang_id, jumlah_fisik, tanggal, keterangan | Stock opname. |
| 24 | t_aset_mutasi | id, aset_id, dari_ruangan, ke_ruangan, tanggal, petugas_id | Mutasi aset. |
| 25 | t_absensi | id, pegawai_id, tanggal, status('hadir','izin','sakit'), jam_masuk, jam_keluar | Absensi pegawai. |
| 26 | t_presensi | id, pegawai_id, waktu_masuk, waktu_keluar | Presensi detil. |
| 27 | t_gaji | id, pegawai_id, periode, jumlah | Gaji / payroll. |
| 28 | t_kpi_nilai | id, kpi_id, periode, nilai, catatan | KPI values per periode. |
| 29 | t_log_aktivitas | id, user_id, aksi, target_tabel, target_id, ip, user_agent, waktu | Log aktivitas user. |
| 30 | t_log_error | id, pesan, lokasi, trace (text), waktu | Error logs. |
| 31 | t_log_integrasi | id, sistem, request_payload (text/json), response (text), waktu | Integrasi eksternal (BPJS, SATUSEHAT, dsb). |
| 32 | t_notifikasi | id, user_id, judul, isi, status_baca, waktu | Notifikasi user. |

**Catatan:** untuk domain yang sangat spesifik (contoh: `t_grouping_cbgs`, `t_koding_icd`, `t_validasi_lab`) gunakan **child/detail tables** yang berhubungan ke parent seperti `t_verifikasi_rm` atau `t_billing` untuk menjaga modularitas.

---

## D. Menu & Role — seed (JSON)
Berikut JSON seed `m_menu` + mapping per role berdasarkan array yang kamu kirim.  
**Gunakan ini sebagai seed (db seeder) atau langsung masukkan ke `m_menu` & `role_menu` pivot.**

```json
{
  "roles": [
    "dokter","perawatpoli","perawatigd","radiografer","lab","apoteker","gizi",
    "rekammedis","kepalaunit","tpp","kasir","sdm","keuangan","logmedis",
    "logumum","manajemenrs","supplier","penjamin","admin","bpjs","satusehat","audit"
  ],
  "menus_by_role": {
    "dokter": [
      {"label":"EMR","path":"/dashboard/dokter/emr","icon":"MdLocalHospital"},
      {"label":"CPPT","path":"/dashboard/dokter/cppt","icon":"MdNoteAlt"},
      {"label":"Diagnosis","path":"/dashboard/dokter/diagnosis","icon":"MdAssignment"},
      {"label":"Resep","path":"/dashboard/dokter/resep","icon":"MdLocalPharmacy"},
      {"label":"Order Lab","path":"/dashboard/dokter/order-lab","icon":"MdScience"},
      {"label":"Order Radiologi","path":"/dashboard/dokter/order-rad","icon":"MdCameraAlt"}
    ],
    "perawatpoli": [
      {"label":"TTV","path":"/dashboard/perawatpoli/ttv","icon":"MdFavorite"},
      {"label":"Triase","path":"/dashboard/perawatpoli/triase","icon":"MdListAlt"},
      {"label":"CPPT","path":"/dashboard/perawatpoli/cppt","icon":"MdNoteAlt"},
      {"label":"Asistensi","path":"/dashboard/perawatpoli/asistensi","icon":"MdAssignment"}
    ],
    "perawatigd": [
      {"label":"Triase","path":"/dashboard/perawatigd/triase","icon":"MdListAlt"},
      {"label":"TTV","path":"/dashboard/perawatigd/ttv","icon":"MdFavorite"},
      {"label":"CPPT","path":"/dashboard/perawatigd/cppt","icon":"MdNoteAlt"},
      {"label":"EMR","path":"/dashboard/perawatigd/emr","icon":"MdLocalHospital"},
      {"label":"Antrian Poli","path":"/dashboard/perawatigd/antrian-poli","icon":"MdListAlt"}
    ],
    "radiografer": [
      {"label":"Order Radiologi","path":"/dashboard/radiografer/order-rad","icon":"MdCameraAlt"},
      {"label":"Hasil Radiologi","path":"/dashboard/radiografer/hasil-rad","icon":"MdUploadFile"},
      {"label":"Validasi Radiologi","path":"/dashboard/radiografer/validasi-rad","icon":"MdAssignment"}
    ],
    "lab": [
      {"label":"Order Lab","path":"/dashboard/lab/order-lab","icon":"MdScience"},
      {"label":"Hasil Lab","path":"/dashboard/lab/hasil-lab","icon":"MdUploadFile"},
      {"label":"Validasi Lab","path":"/dashboard/lab/validasi-lab","icon":"MdAssignment"}
    ],
    "apoteker": [
      {"label":"Order Resep","path":"/dashboard/apoteker/order-resep","icon":"MdAssignment"},
      {"label":"Validasi Resep","path":"/dashboard/apoteker/validasi-resep","icon":"MdAssignment"},
      {"label":"Dispensing","path":"/dashboard/apoteker/dispensing","icon":"MdLocalPharmacy"},
      {"label":"Stok Obat","path":"/dashboard/apoteker/stok","icon":"MdStorage"},
      {"label":"Mutasi Stok","path":"/dashboard/apoteker/mutasi-stok","icon":"MdAssignment"}
    ],
    "gizi": [
      {"label":"Asesmen Gizi","path":"/dashboard/gizi/asesmen","icon":"MdFastfood"},
      {"label":"Order Diet","path":"/dashboard/gizi/order-diet","icon":"MdAssignment"},
      {"label":"Distribusi Diet","path":"/dashboard/gizi/distribusi","icon":"MdLocalPharmacy"}
    ],
    "rekammedis": [
      {"label":"Verifikasi RM","path":"/dashboard/rekammedis/verifikasi","icon":"MdAssignment"},
      {"label":"Koding ICD","path":"/dashboard/rekammedis/koding","icon":"MdAssignment"},
      {"label":"Grouping INA-CBG","path":"/dashboard/rekammedis/grouping","icon":"MdGroupWork"},
      {"label":"Berkas Klaim","path":"/dashboard/rekammedis/klaim","icon":"MdFileCopy"}
    ],
    "kepalaunit": [
      {"label":"KPI BOR","path":"/dashboard/kepalaunit/kpi-bor","icon":"MdBarChart"},
      {"label":"KPI LOS","path":"/dashboard/kepalaunit/kpi-los","icon":"MdBarChart"},
      {"label":"KPI TOI","path":"/dashboard/kepalaunit/kpi-toi","icon":"MdBarChart"}
    ],
    "tpp": [
      {"label":"Registrasi","path":"/dashboard/tpp/registrasi","icon":"MdPerson"},
      {"label":"Data Pasien","path":"/dashboard/tpp/pasien","icon":"MdPeople"},
      {"label":"Antrian","path":"/dashboard/tpp/antrian","icon":"MdListAlt"},
      {"label":"SEP","path":"/dashboard/tpp/sep","icon":"MdShield"}
    ],
    "kasir": [
      {"label":"Billing","path":"/dashboard/kasir/billing","icon":"MdPayment"},
      {"label":"Pembayaran","path":"/dashboard/kasir/pembayaran","icon":"MdAttachMoney"},
      {"label":"Kwitansi","path":"/dashboard/kasir/kwitansi","icon":"MdReceiptLong"},
      {"label":"Deposit","path":"/dashboard/kasir/deposit","icon":"MdDashboard"}
    ],
    "sdm": [
      {"label":"Data Pegawai","path":"/dashboard/sdm/pegawai","icon":"MdPeople"},
      {"label":"Absensi","path":"/dashboard/sdm/absensi","icon":"MdAssignment"},
      {"label":"Presensi","path":"/dashboard/sdm/presensi","icon":"MdAssignment"},
      {"label":"Gaji","path":"/dashboard/sdm/gaji","icon":"MdAttachMoney"}
    ],
    "keuangan": [
      {"label":"Jurnal","path":"/dashboard/keuangan/jurnal","icon":"MdReceiptLong"},
      {"label":"Piutang","path":"/dashboard/keuangan/piutang","icon":"MdAttachMoney"},
      {"label":"Hutang","path":"/dashboard/keuangan/hutang","icon":"MdAttachMoney"},
      {"label":"Bank","path":"/dashboard/keuangan/bank","icon":"MdPayment"}
    ],
    "logmedis": [
      {"label":"Stok Medis","path":"/dashboard/logmedis/stok","icon":"MdStorage"},
      {"label":"Mutasi Stok","path":"/dashboard/logmedis/mutasi","icon":"MdAssignment"},
      {"label":"Opname","path":"/dashboard/logmedis/opname","icon":"MdAssignment"},
      {"label":"Master Obat","path":"/dashboard/logmedis/obat","icon":"MdLocalPharmacy"},
      {"label":"Satuan","path":"/dashboard/logmedis/satuan","icon":"MdCategory"}
    ],
    "logumum": [
      {"label":"Aset","path":"/dashboard/logumum/aset","icon":"MdBusiness"},
      {"label":"PO","path":"/dashboard/logumum/po","icon":"MdAssignment"},
      {"label":"Barang Nonmedis","path":"/dashboard/logumum/barang","icon":"MdStorage"},
      {"label":"Kategori Aset","path":"/dashboard/logumum/kategori","icon":"MdCategory"}
    ],
    "manajemenrs": [
      {"label":"KPI BOR","path":"/dashboard/manajemenrs/kpi-bor","icon":"MdBarChart"},
      {"label":"KPI LOS","path":"/dashboard/manajemenrs/kpi-los","icon":"MdBarChart"},
      {"label":"Pendapatan Global","path":"/dashboard/manajemenrs/pendapatan","icon":"MdAttachMoney"},
      {"label":"Indeks Kepuasan","path":"/dashboard/manajemenrs/kepuasan","icon":"MdGroups"}
    ],
    "supplier": [
      {"label":"Data Supplier","path":"/dashboard/supplier/data","icon":"MdBusiness"},
      {"label":"PO Supplier","path":"/dashboard/supplier/po","icon":"MdAssignment"}
    ],
    "penjamin": [
      {"label":"Master Penjamin","path":"/dashboard/penjamin/master","icon":"MdPeople"},
      {"label":"Relasi Pasien","path":"/dashboard/penjamin/relasi","icon":"MdGroup"}
    ],
    "admin": [
      {"label":"User","path":"/dashboard/admin/user","icon":"MdPerson"},
      {"label":"Role","path":"/dashboard/admin/role","icon":"MdGroupWork"},
      {"label":"Relasi Role","path":"/dashboard/admin/relasi","icon":"MdGroup"},
      {"label":"Audit Log","path":"/dashboard/admin/audit","icon":"MdReceiptLong"},
      {"label":"Backup Audit","path":"/dashboard/admin/backup","icon":"MdBackup"}
    ],
    "bpjs": [
      {"label":"SEP","path":"/dashboard/bpjs/sep","icon":"MdShield"},
      {"label":"Klaim BPJS","path":"/dashboard/bpjs/klaim","icon":"MdReceiptLong"},
      {"label":"Antrol","path":"/dashboard/bpjs/antrol","icon":"MdListAlt"}
    ],
    "satusehat": [
      {"label":"EMR","path":"/dashboard/satusehat/emr","icon":"MdLocalHospital"},
      {"label":"CPPT","path":"/dashboard/satusehat/cppt","icon":"MdNoteAlt"},
      {"label":"Diagnosis","path":"/dashboard/satusehat/diagnosis","icon":"MdAssignment"},
      {"label":"FHIR Push","path":"/dashboard/satusehat/fhir","icon":"MdCloudUpload"}
    ],
    "audit": [
      {"label":"Audit Log","path":"/dashboard/audit/log","icon":"MdReceiptLong"},
      {"label":"Error Log","path":"/dashboard/audit/error","icon":"MdError"},
      {"label":"UAT Log","path":"/dashboard/audit/uat","icon":"MdAssignment"},
      {"label":"Backup Audit","path":"/dashboard/audit/backup","icon":"MdBackup"}
    ]
  }
}
