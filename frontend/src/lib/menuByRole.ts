import {
  MdLocalHospital, MdNoteAlt, MdAssignment, MdLocalPharmacy, MdScience, MdCameraAlt,
  MdFavorite, MdListAlt, MdUploadFile, MdPeople, MdShield, MdCalendarToday, MdPayment,
  MdReceiptLong, MdDashboard, MdStorage, MdFastfood, MdGroupWork, MdFileCopy, MdBarChart,
  MdPerson, MdError, MdBackup, MdCategory, MdBusiness, MdCloudUpload, MdAttachMoney, MdGroups,
  MdGroup, MdCall, MdChat, MdComputer, MdAccountBalance, MdMedication, MdHealing, MdBiotech, MdMedicalServices
} from 'react-icons/md';

// Additional icons from lucide-react for new menu structure
import {
  LayoutDashboard, UserPlus, FolderOpen, Ambulance, Edit, Monitor,
  Link, CheckCircle, Smartphone, Cloud, Star, Settings,
  Calendar, ArrowUp, ArrowRightLeft, ChevronDown, AlertTriangle
} from 'lucide-react';

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
    | 'manajemen'      // 🏢 Management


export type Badge = {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

export type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: Badge;
};

export type MenuCategory = {
  label: string;
  items: MenuItem[];
};

// New types for collapsible structure
export type CollapsibleMenuItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: Badge;
};

export type CollapsibleMenu = {
  title: string;
  icon: React.ElementType;
  badge?: Badge;
  collapsible: boolean;
  defaultOpen?: boolean;
  children: CollapsibleMenuItem[];
};

export type Separator = {
  type: 'separator';
  title: string;
};

// Union type for all menu item types
export type MenuItemType = MenuItem | MenuCategory | CollapsibleMenu | Separator;

export const menuByRole: Record<string, MenuItemType[]> = {
  // 🎯 7 MAIN ROLES - KEMENKES STANDARDS

  admin: [
    // 👨‍💼 Administrator/IT - System Management - Direct path routing for SPA navigation
    { label: 'Dashboard Admin', href: '/dashboard/admin', icon: MdDashboard },
    { label: 'User Management', href: '/dashboard/admin/user', icon: MdPerson },
    { label: 'Role Management', href: '/dashboard/admin/role', icon: MdGroupWork },
    { label: 'System Settings', href: '/dashboard/admin/settings', icon: MdBusiness },
    { label: 'Audit Log', href: '/dashboard/admin/audit', icon: MdListAlt },
    { label: 'Backup & Recovery', href: '/dashboard/admin/backup', icon: MdBackup },
    { label: 'Error Log', href: '/dashboard/admin/error-log', icon: MdError },
    { label: 'System Integration', href: '/dashboard/admin/integration', icon: MdCloudUpload },
  ],

  pendaftaran: [
    // CORE FEATURES - KEMENKES STANDARDS
    { label: 'Dashboard', href: '/dashboard/pendaftaran', icon: LayoutDashboard },
    { label: 'Pasien Baru', href: '/dashboard/pendaftaran/registrasi', icon: UserPlus },
    { label: 'Data Pasien', href: '/dashboard/pendaftaran/pasien', icon: FolderOpen },
    { label: 'Registrasi IGD', href: '/dashboard/pendaftaran/registrasi-igd', icon: Ambulance, badge: { text: '', variant: 'destructive' } },
    { label: 'Update Data Pasien', href: '/dashboard/pendaftaran/riwayat', icon: Edit },
    { label: 'Monitor Antrian', href: '/dashboard/pendaftaran/antrian', icon: Monitor },
    { label: 'Bridging BPJS', href: '/dashboard/pendaftaran/sep', icon: Link, badge: { text: '⚠️', variant: 'secondary' } },
    { label: 'Verifikasi SEP', href: '/dashboard/pendaftaran/verifikasi-sep', icon: CheckCircle },
    { label: 'Mobile JKN', href: '/dashboard/pendaftaran/mobile-jkn', icon: Smartphone },
    { label: 'SATUSEHAT Sync', href: '/dashboard/pendaftaran/satu-sehat', icon: Cloud, badge: { text: '⚠️', variant: 'secondary' } },

    // SEPARATOR
    { type: 'separator', title: 'FITUR OPSIONAL' },

    // COLLAPSIBLE MENU - 5 Optional Features
    {
      title: 'Fitur Opsional',
      icon: Star,
      badge: { text: 'Beta', variant: 'secondary' },
      collapsible: true,
      defaultOpen: false,
      children: [
        {
          label: 'Kontrol Antrian New',
          href: '/dashboard/pendaftaran/kontrol-antrian',
          icon: Settings
        },
        {
          label: 'Janji Temu',
          href: '/dashboard/pendaftaran/appointment',
          icon: Calendar
        },
        {
          label: 'Antrian Prioritas',
          href: '/dashboard/pendaftaran/antrian-prioritas',
          icon: ArrowUp
        },
        {
          label: 'Sistem Rujukan',
          href: '/dashboard/pendaftaran/rujukan',
          icon: ArrowRightLeft
        },
        {
          label: 'KPI & Laporan',
          href: '/dashboard/pendaftaran/kpi-laporan',
          icon: MdBarChart
        }
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
    { label: 'Serah Terima Obat', href: '/dashboard/apoteker/penyerahan', icon: MdLocalPharmacy },
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
    { label: 'Dashboard Executive', href: '/dashboard/manajemen', icon: MdDashboard },
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
