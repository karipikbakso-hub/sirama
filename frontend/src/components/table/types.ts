export type User = {
  id: number
  name: string
  role: string
  status: string
}

export type Pasien = {
  id: number
  nama: string
  umur: number
  diagnosa: string
}

export type Resep = {
  id: number
  nama_obat: string
  jumlah: number
  aturan_pakai: string
}