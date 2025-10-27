export interface Antrian {
  id: number
  nama: string
  poli: string
  status: 'menunggu' | 'dipanggil' | 'selesai'
  created_at: string
}
