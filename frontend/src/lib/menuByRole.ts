import {
  MdLocalHospital, MdNoteAlt, MdAssignment, MdLocalPharmacy, MdScience, MdCameraAlt,
  MdFavorite, MdListAlt, MdUploadFile, MdPeople, MdShield, MdCalendarToday, MdPayment,
  MdReceiptLong, MdDashboard, MdStorage, MdFastfood, MdGroupWork, MdFileCopy, MdBarChart,
  MdPerson, MdError, MdBackup, MdCategory, MdBusiness, MdCloudUpload, MdAttachMoney, MdGroups,
  MdGroup, MdCall, MdChat, MdComputer, MdAccountBalance, MdMedication, MdHealing, MdBiotech, MdMedicalServices
} from 'react-icons/md';

// 🎯 SIRAMA Menu System - Master Context (9 Main Roles)
export type Role =
  | 'admin'           // 👨‍💼 Administrator/IT
  | 'pendaftaran'    // 📋 Registration
  | 'dokter'         // 👨‍⚕️ Doctor
  | 'perawat'        // 👩‍⚕️ Nurse
  | 'apoteker'       // 💊 Pharmacist
  | 'kasir'          // 💰 Cashier
  | 'laboratorium'   // 🔬 Lab Technician
  | 'radiologi'      // 📷 Radiology Technician
  | 'manajemen'      // 🏢 Management (manajemenrs -> manajemen)


export type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export type MenuCategory = {
  label: string;
  items: MenuItem[];
};

export const menuByRole: Record<string, (MenuItem | MenuCategory)[]> = {
  // 🎯 7 MAIN ROLES - KEMENKES STANDARDS

  admin: [
    // 👨‍💼 Administrator/IT - System Management - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/admin', icon: MdComputer },
    { label: 'Manajemen Pengguna', href: '/dashboard/admin/user', icon: MdPerson },
    { label: 'Manajemen Peran', href: '/dashboard/admin/role', icon: MdGroupWork },
    { label: 'Pengaturan Sistem', href: '/dashboard/admin/settings', icon: MdBusiness },
    { label: 'Log Audit', href: '/dashboard/admin/audit', icon: MdReceiptLong },
    { label: 'Backup & Recovery', href: '/dashboard/admin/backup', icon: MdBackup },
    { label: 'Error Log', href: '/dashboard/admin/error-log', icon: MdError },
    { label: 'Integration', href: '/dashboard/admin/integration', icon: MdCloudUpload },
  ],

  pendaftaran: [
    // 📋 Registration - Patient Registration & Queue Management - Direct path routing
    { label: 'Beranda', href: '/dashboard/pendaftaran', icon: MdDashboard },
    { label: 'Dashboard KPI', href: '/dashboard/pendaftaran/kpi', icon: MdBarChart },

    {
      label: 'Pendaftaran Pasien',
      items: [
        { label: 'Pendaftaran Baru', href: '/dashboard/pendaftaran/registrasi', icon: MdPerson },
        { label: 'Data Pasien', href: '/dashboard/pendaftaran/pasien', icon: MdPeople },
        { label: 'Riwayat Medis', href: '/dashboard/pendaftaran/riwayat', icon: MdAssignment },
        { label: 'Pendaftaran IGD', href: '/dashboard/pendaftaran/registrasi-igd', icon: MdLocalHospital },
      ]
    },
    {
      label: 'Manajemen Antrian',
      items: [
        { label: 'Monitor Antrian', href: '/dashboard/pendaftaran/antrian', icon: MdListAlt },
        { label: 'Kontrol Antrian', href: '/dashboard/pendaftaran/antrian-management', icon: MdListAlt },
      ]
    },
    {
      label: 'Layanan Digital',
      items: [
        { label: 'SEP BPJS', href: '/dashboard/pendaftaran/sep', icon: MdShield },
        { label: 'Mobile JKN', href: '/dashboard/pendaftaran/mobile-jkn', icon: MdCall },
        { label: 'Janji Temu', href: '/dashboard/pendaftaran/appointment', icon: MdCalendarToday },
        { label: 'Integrasi BPJS', href: '/dashboard/pendaftaran/bpjs-integration', icon: MdCloudUpload },
      ]
    },
    { label: 'Sistem Rujukan', href: '/dashboard/pendaftaran/rujukan', icon: MdLocalHospital },
    {
      label: 'Administrasi',
      items: [
        { label: 'Data Master', href: '/dashboard/pendaftaran/master-data', icon: MdStorage },
        { label: 'Komunikasi Pasien', href: '/dashboard/pendaftaran/notifications', icon: MdChat },
      ]
    }
  ],

  dokter: [
    // 👨‍⚕️ Doctor - Medical Consultation - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/dokter', icon: MdDashboard },
    { label: 'Rekam Medis Elektronik', href: '/dashboard/dokter/emr', icon: MdLocalHospital },
    { label: 'Dokumentasi CPPT', href: '/dashboard/dokter/cppt', icon: MdNoteAlt },
    { label: 'Diagnosis', href: '/dashboard/dokter/diagnosis', icon: MdAssignment },
    { label: 'Resep Obat', href: '/dashboard/dokter/resep', icon: MdLocalPharmacy },
    { label: 'Order Lab', href: '/dashboard/dokter/order-lab', icon: MdScience },
    { label: 'Order Radiologi', href: '/dashboard/dokter/order-rad', icon: MdCameraAlt },
  ],

  perawat: [
    // 👩‍⚕️ Nurse - Nursing Care (Combined IGD & Poli) - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/perawat', icon: MdDashboard },
    { label: 'Tanda Vital', href: '/dashboard/perawat/ttv', icon: MdFavorite },
    { label: 'Dokumentasi CPPT', href: '/dashboard/perawat/cppt', icon: MdNoteAlt },
    { label: 'Akses EMR', href: '/dashboard/perawat/emr', icon: MdLocalHospital },
    { label: 'Triase Emergency', href: '/dashboard/perawat/triase', icon: MdListAlt },
    { label: 'Antrian Poliklinik', href: '/dashboard/perawat/antrian-poli', icon: MdListAlt },
    { label: 'Distribusi Obat', href: '/dashboard/perawat/distribusi-obat', icon: MdLocalPharmacy },
  ],

  apoteker: [
    // 💊 Pharmacist - Pharmacy Management - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/apoteker', icon: MdDashboard },
    { label: 'Order Resep', href: '/dashboard/apoteker/order-resep', icon: MdAssignment },
    { label: 'Validasi Resep', href: '/dashboard/apoteker/validasi-resep', icon: MdAssignment },
    { label: 'Dispensing', href: '/dashboard/apoteker/dispensing', icon: MdMedication },
    { label: 'Manajemen Stok', href: '/dashboard/apoteker/stok', icon: MdStorage },
    { label: 'Mutasi Stok', href: '/dashboard/apoteker/mutasi-stok', icon: MdAssignment },
    { label: 'Penyerahan Obat', href: '/dashboard/apoteker/penyerahan', icon: MdLocalPharmacy },
    { label: 'Permintaan Obat', href: '/dashboard/apoteker/permintaan', icon: MdListAlt },
    { label: 'Riwayat Resep', href: '/dashboard/apoteker/riwayat-resep', icon: MdFileCopy },
    { label: 'Obat Terpopuler', href: '/dashboard/apoteker/obat-terpopuler', icon: MdBarChart },
  ],

  kasir: [
    // 💰 Cashier - Billing & Payments - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/kasir', icon: MdDashboard },
    { label: 'Manajemen Billing', href: '/dashboard/kasir/billing', icon: MdPayment },
    { label: 'Pemrosesan Pembayaran', href: '/dashboard/kasir/pembayaran', icon: MdAttachMoney },
    { label: 'Kwitansi', href: '/dashboard/kasir/kwitansi', icon: MdReceiptLong },
    { label: 'Manajemen Deposit', href: '/dashboard/kasir/deposit', icon: MdAccountBalance },
    { label: 'Tagihan', href: '/dashboard/kasir/tagihan', icon: MdListAlt },
    { label: 'Rekonsiliasi', href: '/dashboard/kasir/rekonsiliasi', icon: MdBarChart },
  ],

  laboratorium: [
    // 🔬 Lab Technician - Laboratory Management - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/laboratorium', icon: MdDashboard },
    { label: 'Order Lab', href: '/dashboard/laboratorium/order-lab', icon: MdAssignment },
    { label: 'Penerimaan Sample', href: '/dashboard/laboratorium/penerimaan-sample', icon: MdListAlt },
    { label: 'Input Hasil', href: '/dashboard/laboratorium/input-hasil', icon: MdScience },
    { label: 'Validasi Hasil', href: '/dashboard/laboratorium/validasi-hasil', icon: MdMedicalServices },
    { label: 'Laporan Hasil', href: '/dashboard/laboratorium/laporan-hasil', icon: MdFileCopy },
    { label: 'Manajemen LIS', href: '/dashboard/laboratorium/manajemen-lis', icon: MdBusiness },
    { label: 'Riwayat', href: '/dashboard/laboratorium/riwayat', icon: MdAssignment },
    { label: 'QC & QA', href: '/dashboard/laboratorium/qc-qa', icon: MdBarChart },
    { label: 'Pemeliharaan Alat', href: '/dashboard/laboratorium/pemeliharaan-alat', icon: MdBiotech },
  ],

  radiologi: [
    // 📷 Radiology Technician - Radiology Management - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/radiologi', icon: MdDashboard },
    { label: 'Order Radiologi', href: '/dashboard/radiologi/order-rad', icon: MdAssignment },
    { label: 'Penerimaan', href: '/dashboard/radiologi/penerimaan', icon: MdListAlt },
    { label: 'Pemeriksaan Radiologi', href: '/dashboard/radiologi/pemeriksaan', icon: MdCameraAlt },
    { label: 'Input Hasil', href: '/dashboard/radiologi/input-hasil', icon: MdUploadFile },
    { label: 'Manajemen DICOM', href: '/dashboard/radiologi/manajemen-dicom', icon: MdCloudUpload },
    { label: 'Laporan Radiologi', href: '/dashboard/radiologi/laporan', icon: MdNoteAlt },
    { label: 'Validasi Radiologi', href: '/dashboard/radiologi/validasi', icon: MdMedicalServices },
    { label: 'Arsip Radiologi', href: '/dashboard/radiologi/arsip', icon: MdFileCopy },
    { label: 'Pemeliharaan Alat', href: '/dashboard/radiologi/pemeliharaan-alat', icon: MdBiotech },
  ],

  manajemen: [
    // 🏢 Management - Hospital Management - Direct path routing for SPA navigation
    { label: 'Dashboard', href: '/dashboard/manajemen', icon: MdDashboard },
    { label: 'KPI BOR', href: '/dashboard/manajemen/kpi-bor', icon: MdBarChart },
    { label: 'KPI LOS', href: '/dashboard/manajemen/kpi-los', icon: MdBarChart },
    { label: 'Analisis BOR', href: '/dashboard/manajemen/analisis-bor', icon: MdBarChart },
    { label: 'Analisis LOS', href: '/dashboard/manajemen/analisis-los', icon: MdBarChart },
    { label: 'Analitik Pendapatan', href: '/dashboard/manajemen/pendapatan', icon: MdAttachMoney },
    { label: 'Kepuasan Pasien', href: '/dashboard/manajemen/kepuasan', icon: MdGroups },
    { label: 'Indikator Kualitas', href: '/dashboard/manajemen/indikator-kualitas', icon: MdBarChart },
    { label: 'Kinerja', href: '/dashboard/manajemen/kinerja', icon: MdBarChart },
    { label: 'SDM', href: '/dashboard/manajemen/sdm', icon: MdGroup },
    { label: 'Laporan', href: '/dashboard/manajemen/laporan', icon: MdFileCopy },
    { label: 'Hasil Survey', href: '/dashboard/manajemen/hasil-survey', icon: MdListAlt },
  ],
};
