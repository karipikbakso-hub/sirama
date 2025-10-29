import {
  MdLocalHospital, MdListAlt, MdShield, MdCalendarToday,
  MdDescription, MdNoteAlt, MdPsychology, MdHistory, MdScience,
  MdReceiptLong, MdAttachMoney, MdPrint, MdLocalPharmacy, MdAssignment,
  MdLocalShipping, MdInventory, MdCameraAlt, MdUploadFile, MdMonitorHeart,
  MdFavorite, MdMeetingRoom, MdBarChart, MdDashboard, MdGroups, MdPeople, MdPayment, MdHome
} from 'react-icons/md'

export type Role =
  | 'admin'
  | 'pendaftaran'
  | 'dokter'
  | 'kasir'
  | 'apoteker'
  | 'labrad'
  | 'perawat'
  | 'manajemen'

export type MenuItem = {
  label: string
  icon: React.ElementType
  path: string
}

export const menuByRole: Record<Role, MenuItem[]> = {
  admin: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Pengguna & Role', icon: MdPeople, path: 'user' },
    { label: 'Audit Trail', icon: MdReceiptLong, path: 'audit' },
    { label: 'Klinik', icon: MdLocalHospital, path: 'klinik' },
    { label: 'Rawat Inap', icon: MdListAlt, path: 'rawat' },
    { label: 'Farmasi', icon: MdLocalPharmacy, path: 'farmasi' },
    { label: 'Laboratorium', icon: MdScience, path: 'lab' },
    { label: 'Kasir', icon: MdAttachMoney, path: 'kasir' },
    { label: 'Laundry', icon: MdPrint, path: 'laundry' },
    { label: 'POS', icon: MdLocalShipping, path: 'pos' },
    { label: 'Property', icon: MdHome, path: 'property' },
    { label: 'eLearning', icon: MdAssignment, path: 'elearning' },
  ],
  pendaftaran: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Pasien', icon: MdLocalHospital, path: 'pasien' },
    { label: 'Antrian', icon: MdListAlt, path: 'antrian' },
    { label: 'Bridging BPJS', icon: MdShield, path: 'bpjs' },
    { label: 'Riwayat Kunjungan', icon: MdCalendarToday, path: 'kunjungan' },
  ],
  dokter: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Rekam Medis', icon: MdDescription, path: 'medis' },
    { label: 'Resume', icon: MdNoteAlt, path: 'resume' },
    { label: 'MCU', icon: MdPsychology, path: 'mcu' },
    { label: 'Riwayat Pasien', icon: MdHistory, path: 'riwayat' },
    { label: 'Order Lab/Rad', icon: MdScience, path: 'order' },
  ],
  kasir: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Billing', icon: MdPayment, path: 'billing' },
    { label: 'Kwitansi', icon: MdReceiptLong, path: 'kwitansi' },
    { label: 'Pembayaran', icon: MdAttachMoney, path: 'pembayaran' },
    { label: 'Cetak Tagihan', icon: MdPrint, path: 'tagihan' },
  ],
  apoteker: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Farmasi', icon: MdLocalPharmacy, path: 'farmasi' },
    { label: 'Entry Resep', icon: MdAssignment, path: 'resep' },
    { label: 'Penyerahan Obat', icon: MdLocalShipping, path: 'penyerahan' },
    { label: 'Stok Gudang', icon: MdInventory, path: 'stok' },
  ],
  labrad: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Laboratorium', icon: MdScience, path: 'lab' },
    { label: 'Radiologi', icon: MdCameraAlt, path: 'rad' },
    { label: 'Upload Hasil', icon: MdUploadFile, path: 'upload' },
    { label: 'Cetak', icon: MdPrint, path: 'cetak' },
  ],
  perawat: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Monitoring Pasien', icon: MdMonitorHeart, path: 'monitoring' },
    { label: 'Tanda Vital', icon: MdFavorite, path: 'vital' },
    { label: 'Status Kamar', icon: MdMeetingRoom, path: 'kamar' },
  ],
  manajemen: [
    { label: 'Home', icon: MdDashboard, path: '' },
    { label: 'Laporan', icon: MdBarChart, path: 'laporan' },
    { label: 'Dashboard Kinerja', icon: MdDashboard, path: 'kinerja' },
    { label: 'Rekap Pendapatan', icon: MdAttachMoney, path: 'pendapatan' },
    { label: 'SDM', icon: MdGroups, path: 'sdm' },
  ],
}