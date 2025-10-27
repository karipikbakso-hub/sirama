import { Transaksi } from './types'

export async function fetchTransaksi(): Promise<Transaksi[]> {
  return new Promise(resolve => setTimeout(() => resolve([]), 500))
}

export async function createTransaksi(data: Omit<Transaksi, 'id' | 'created_at'>): Promise<Transaksi> {
  return {
    id: Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
    ...data,
  }
}
