import {
  MdLocalHospital, MdNoteAlt, MdAssignment, MdLocalPharmacy, MdScience, MdCameraAlt,
  MdFavorite, MdListAlt, MdUploadFile, MdPeople, MdShield, MdCalendarToday, MdPayment,
  MdReceiptLong, MdDashboard, MdStorage, MdFastfood, MdGroupWork, MdFileCopy, MdBarChart,
  MdPerson, MdError, MdBackup, MdCategory, MdBusiness, MdCloudUpload, MdAttachMoney, MdGroups,
  MdGroup, MdCall, MdChat, MdComputer, MdAccountBalance, MdMedication, MdHealing
} from 'react-icons/md';

// 🎯 SIRAMA Menu System - Kemenkes Standards (7 Main Roles)
export type Role =
  | 'admin'           // 👨‍💼 Administrator/IT
  | 'pendaftaran'    // 📋 Registration
  | 'dokter'         // 👨‍⚕️ Doctor
  | 'perawat'        // 👩‍⚕️ Nurse
  | 'apoteker'       // 💊 Pharmacist
  | 'kasir'          // 💰 Cashier
  | 'manajemenrs'    // 🏢 Management


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
    // 👨‍💼 Administrator/IT - System Management
    { label: 'Dashboard', href: '/dashboard/admin', icon: MdComputer },
    { label: 'Manajemen Pengguna', href: '/dashboard/admin/users', icon: MdPerson },
    { label: 'Manajemen Peran', href: '/dashboard/admin/roles', icon: MdGroupWork },
    { label: 'Pengaturan Sistem', href: '/dashboard/admin/settings', icon: MdBusiness },
    { label: 'Log Audit', href: '/dashboard/admin/audit', icon: MdReceiptLong },
    { label: 'Backup & Recovery', href: '/dashboard/admin/backup', icon: MdBackup },
  ],

  pendaftaran: [
    // 📋 Registration - Patient Registration & Queue Management
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
    // 👨‍⚕️ Doctor - Medical Consultation
    { label: 'Dashboard', href: '/dashboard/dokter', icon: MdDashboard },
    { label: 'Rekam Medis Elektronik', href: '/dashboard/dokter/emr', icon: MdLocalHospital },
    { label: 'Dokumentasi CPPT', href: '/dashboard/dokter/cppt', icon: MdNoteAlt },
    { label: 'Diagnosis', href: '/dashboard/dokter/diagnosis', icon: MdAssignment },
    { label: 'Resep Obat', href: '/dashboard/dokter/resep', icon: MdLocalPharmacy },
    { label: 'Order Lab', href: '/dashboard/dokter/order-lab', icon: MdScience },
    { label: 'Order Radiologi', href: '/dashboard/dokter/order-rad', icon: MdCameraAlt },
  ],

  perawat: [
    // 👩‍⚕️ Nurse - Nursing Care (Combined IGD & Poli)
    { label: 'Dashboard', href: '/dashboard/perawat', icon: MdDashboard },
    { label: 'Tanda Vital', href: '/dashboard/perawat/ttv', icon: MdFavorite },
    { label: 'Dokumentasi CPPT', href: '/dashboard/perawat/cppt', icon: MdNoteAlt },
    { label: 'Akses EMR', href: '/dashboard/perawat/emr', icon: MdLocalHospital },
    { label: 'Triase Emergency', href: '/dashboard/perawat/triase', icon: MdListAlt },
    { label: 'Antrian Poliklinik', href: '/dashboard/perawat/antrian-poli', icon: MdListAlt },
  ],

  apoteker: [
    // 💊 Pharmacist - Pharmacy Management
    { label: 'Dashboard', href: '/dashboard/apoteker', icon: MdDashboard },
    { label: 'Order Resep', href: '/dashboard/apoteker/order-resep', icon: MdAssignment },
    { label: 'Validasi Resep', href: '/dashboard/apoteker/validasi-resep', icon: MdAssignment },
    { label: 'Dispensing', href: '/dashboard/apoteker/dispensing', icon: MdMedication },
    { label: 'Manajemen Stok', href: '/dashboard/apoteker/stok', icon: MdStorage },
    { label: 'Mutasi Stok', href: '/dashboard/apoteker/mutasi-stok', icon: MdAssignment },
  ],

  kasir: [
    // 💰 Cashier - Billing & Payments
    { label: 'Dashboard', href: '/dashboard/kasir', icon: MdDashboard },
    { label: 'Manajemen Billing', href: '/dashboard/kasir/billing', icon: MdPayment },
    { label: 'Pemrosesan Pembayaran', href: '/dashboard/kasir/pembayaran', icon: MdAttachMoney },
    { label: 'Kwitansi', href: '/dashboard/kasir/kwitansi', icon: MdReceiptLong },
    { label: 'Manajemen Deposit', href: '/dashboard/kasir/deposit', icon: MdAccountBalance },
  ],

  manajemenrs: [
    // 🏢 Management - Hospital Management
    { label: 'Dashboard', href: '/dashboard/manajemenrs', icon: MdDashboard },
    { label: 'Analisis BOR', href: '/dashboard/manajemenrs/kpi-bor', icon: MdBarChart },
    { label: 'Analisis LOS', href: '/dashboard/manajemenrs/kpi-los', icon: MdBarChart },
    { label: 'Analitik Pendapatan', href: '/dashboard/manajemenrs/pendapatan', icon: MdAttachMoney },
    { label: 'Kepuasan Pasien', href: '/dashboard/manajemenrs/kepuasan', icon: MdGroups },
    { label: 'Indikator Kualitas', href: '/dashboard/manajemenrs/quality', icon: MdBarChart },
  ],
};
