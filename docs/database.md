| No | Tabel                    | Kolom Utama                                                              | Deskripsi Singkat                                           |
| -- | ------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 1  | **m_roles**              | `id`, `nama`                                                             | Master daftar role user (mis. admin, dokter, perawat, dsb). |
| 2  | **m_hak_akses**          | `id`, `nama`                                                             | Daftar hak akses / permission per role.                     |
| 3  | **m_unit_kerja**         | `id`, `nama`                                                             | Master unit kerja atau departemen dalam organisasi.         |
| 4  | **m_diagnosa**           | `id`, `kode_icd`, `deskripsi`                                            | Daftar kode ICD diagnosa medis.                             |
| 5  | **m_tindakan**           | `id`, `kode`, `nama`                                                     | Daftar tindakan medis / prosedur.                           |
| 6  | **m_obat**               | `id`, `nama`, `satuan`                                                   | Daftar obat dan satuannya.                                  |
| 7  | **m_satuan**             | `id`, `nama`                                                             | Master satuan umum (mis. tablet, botol, pcs).               |
| 8  | **m_kategori_barang**    | `id`, `nama`                                                             | Kategori barang / inventori.                                |
| 9  | **m_supplier**           | `id`, `nama`, `alamat`, `kontak`                                         | Daftar supplier barang/obat.                                |
| 10 | **m_aset**               | `id`, `nama`, `kategori`, `lokasi`                                       | Master aset tetap dan lokasi penyimpanan.                   |
| 11 | **m_penjamin**           | `id`, `nama`, `jenis`                                                    | Master penjamin pasien (BPJS, Asuransi, Pribadi, dsb).      |
| 12 | **m_bank**               | `id`, `nama`, `nomor_rekening`                                           | Daftar bank dan rekening terkait.                           |
| 13 | **m_tarif**              | `id`, `nama`, `harga`                                                    | Master tarif layanan atau tindakan.                         |
| 14 | **m_ruangan**            | `id`, `nama`, `kapasitas`                                                | Master ruangan pelayanan pasien.                            |
| 15 | **m_pasien**             | `id`, `nama`, `nik`, `tanggal_lahir`, `jenis_kelamin`, `alamat`, `no_hp` | Data identitas pasien.                                      |
| 16 | **m_pegawai**            | `id`, `nama`, `nip`, `jabatan`, `unit_kerja`                             | Master pegawai dan jabatan.                                 |
| 17 | **m_menu**               | `id`, `label`, `path`, `icon`                                            | Struktur menu dashboard / navigasi sistem.                  |
| 18 | **m_kpi**                | `id`, `indikator`, `deskripsi`                                           | Master indikator kinerja (KPI).                             |
| 19 | **m_status_kunjungan**   | `id`, `status`                                                           | Status kunjungan pasien (baru, kontrol, dsb).               |
| 20 | **m_status_pembayaran**  | `id`, `status`                                                           | Status pembayaran (lunas, belum, pending).                  |
| 21 | **m_status_rekam_medis** | `id`, `status`                                                           | Status rekam medis (aktif, selesai, ditutup).               |
| 22 | **m_pengaturan**         | `id`, `kunci`, `nilai`                                                   | Key-value konfigurasi sistem (mis. nama RS, alamat, dsb).   |


| No | Tabel                   | Kolom Utama                                                                                             | Deskripsi Singkat                                    |
| -- | ----------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1  | **t_kunjungan**         | `id`, `pasien_id`, `unit_kerja_id`, `dokter_id`, `penjamin_id`, `status`, `waktu_masuk`, `waktu_keluar` | Catatan setiap kunjungan pasien ke rumah sakit.      |
| 2  | **t_registrasi**        | `id`, `kunjungan_id`, `no_registrasi`, `tanggal`, `status`                                              | Data pendaftaran awal pasien sebelum pelayanan.      |
| 3  | **t_rekam_medis**       | `id`, `kunjungan_id`, `diagnosa_id`, `tindakan_id`, `catatan_dokter`                                    | Rekam medis detail per kunjungan pasien.             |
| 4  | **t_resep_obat**        | `id`, `rekam_medis_id`, `obat_id`, `dosis`, `jumlah`, `keterangan`                                      | Daftar resep obat per pasien dari rekam medis.       |
| 5  | **t_laboratorium**      | `id`, `kunjungan_id`, `jenis_pemeriksaan`, `hasil`, `tanggal`                                           | Catatan hasil pemeriksaan laboratorium pasien.       |
| 6  | **t_radiologi**         | `id`, `kunjungan_id`, `jenis_pemeriksaan`, `hasil`, `tanggal`                                           | Hasil pemeriksaan radiologi (rontgen, USG, CT scan). |
| 7  | **t_tindakan**          | `id`, `kunjungan_id`, `tindakan_id`, `tarif_id`, `pelaksana_id`, `keterangan`                           | Tindakan medis yang dilakukan selama kunjungan.      |
| 8  | **t_pembayaran**        | `id`, `kunjungan_id`, `total_tagihan`, `status_pembayaran`, `tanggal_bayar`                             | Transaksi pembayaran pasien.                         |
| 9  | **t_detail_pembayaran** | `id`, `pembayaran_id`, `item`, `jumlah`, `harga_satuan`, `subtotal`                                     | Rincian detail pembayaran per item layanan.          |
| 10 | **t_klaim_pasien**      | `id`, `kunjungan_id`, `penjamin_id`, `nomor_klaim`, `nilai_klaim`, `status`                             | Data klaim ke penjamin (BPJS / Asuransi).            |
| 11 | **t_gaji_pegawai**      | `id`, `pegawai_id`, `periode`, `total_gaji`, `potongan`, `keterangan`                                   | Penggajian pegawai per periode tertentu.             |
| 12 | **t_absensi**           | `id`, `pegawai_id`, `tanggal`, `jam_masuk`, `jam_keluar`, `status`                                      | Catatan kehadiran dan absensi pegawai.               |
| 13 | **t_stok_obat**         | `id`, `obat_id`, `jumlah_masuk`, `jumlah_keluar`, `stok_akhir`, `tanggal_update`                        | Mutasi stok obat harian.                             |
| 14 | **t_pengadaan_barang**  | `id`, `supplier_id`, `tanggal`, `total`, `status`                                                       | Proses pengadaan barang / inventori.                 |
| 15 | **t_detail_pengadaan**  | `id`, `pengadaan_id`, `barang_id`, `jumlah`, `harga_satuan`, `subtotal`                                 | Rincian barang dalam transaksi pengadaan.            |
| 16 | **t_pemakaian_aset**    | `id`, `aset_id`, `pegawai_id`, `tanggal_pinjam`, `tanggal_kembali`, `status`                            | Catatan pemakaian dan pengembalian aset.             |
| 17 | **t_pemeliharaan_aset** | `id`, `aset_id`, `tanggal`, `jenis_perawatan`, `biaya`, `keterangan`                                    | Log pemeliharaan atau servis aset.                   |
| 18 | **t_pengeluaran**       | `id`, `tanggal`, `kategori`, `nominal`, `keterangan`                                                    | Transaksi pengeluaran keuangan umum.                 |
| 19 | **t_pendapatan**        | `id`, `tanggal`, `sumber`, `nominal`, `keterangan`                                                      | Transaksi pendapatan non-pasien.                     |
| 20 | **t_kpi_nilai**         | `id`, `kpi_id`, `periode`, `nilai`, `catatan`                                                           | Nilai KPI yang dicapai tiap periode.                 |
| 21 | **t_log_aktivitas**     | `id`, `user_id`, `aksi`, `target`, `ip_address`, `user_agent`, `waktu`                                  | Log aktivitas pengguna sistem.                       |
| 22 | **t_notifikasi**        | `id`, `user_id`, `judul`, `pesan`, `status_baca`, `created_at`                                          | Notifikasi sistem untuk pengguna.                    |
