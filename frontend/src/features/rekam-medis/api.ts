import { RekamMedis } from './types'

export async function fetchRekamMedis(): Promise<RekamMedis[]> {
  return new Promise(resolve => setTimeout(() => resolve([]), 500))
}

export async function createRekamMedis(data: Omit<RekamMedis, 'id' | 'created_at'>): Promise<RekamMedis> {
  return {
    id: Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
    ...data,
  }
}
