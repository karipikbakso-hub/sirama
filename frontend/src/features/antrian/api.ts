import { Antrian } from './types'

export async function fetchAntrian(): Promise<Antrian[]> {
  return new Promise(resolve => setTimeout(() => resolve([]), 500))
}

export async function createAntrian(data: Omit<Antrian, 'id' | 'created_at'>): Promise<Antrian> {
  return {
    id: Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
    ...data,
  }
}
