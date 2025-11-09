export type Role =
  | 'dokter'
  | 'perawatpoli'
  | 'perawatigd'
  | 'radiografer'
  | 'lab'
  | 'apoteker'
  | 'gizi'
  | 'rekammedis'
  | 'kepalaunit'
  | 'tpp'
  | 'kasir'
  | 'sdm'
  | 'keuangan'
  | 'logmedis'
  | 'logumum'
  | 'manajemenrs'
  | 'supplier'
  | 'penjamin'
  | 'admin'
  | 'bpjs'
  | 'satusehat'
  | 'audit'

export interface User {
  id: number
  name: string
  email: string
  username?: string
  roles: { name: Role }[]
}

export const RoleLabelMap: Record<Role, string> = {
  dokter: 'Dokter',
  perawatpoli: 'Perawat Poli',
  perawatigd: 'Perawat IGD',
  radiografer: 'Radiografer',
  lab: 'Petugas Lab',
  apoteker: 'Apoteker',
  gizi: 'Ahli Gizi',
  rekammedis: 'Rekam Medis',
  kepalaunit: 'Kepala Unit',
  tpp: 'TPP',
  kasir: 'Kasir',
  sdm: 'SDM',
  keuangan: 'Keuangan',
  logmedis: 'Logistik Medis',
  logumum: 'Logistik Umum',
  manajemenrs: 'Manajemen RS',
  supplier: 'Supplier',
  penjamin: 'Penjamin',
  admin: 'Admin',
  bpjs: 'BPJS',
  satusehat: 'Satu Sehat',
  audit: 'Audit',
}