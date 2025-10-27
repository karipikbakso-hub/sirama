import { Pasien } from './types'

export async function fetchPasien(): Promise<Pasien[]> {
  // Ganti dengan fetch Laravel nanti
  return new Promise(resolve => setTimeout(() => resolve([]), 500))
}

export async function createPasien(data: Omit<Pasien, 'id' | 'created_at'>): Promise<Pasien> {
  return {
    id: Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
    ...data,
  }
}
