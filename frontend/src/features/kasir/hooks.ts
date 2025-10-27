import { useState } from 'react'
import { Transaksi } from './types'
import { dummyTransaksi } from './data'

export function useKasirData() {
  const [data, setData] = useState<Transaksi[]>(dummyTransaksi)
  const addTransaksi = (newData: Omit<Transaksi, 'id' | 'created_at'>) => {
    const newTransaksi: Transaksi = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...newData,
    }
    setData(prev => [newTransaksi, ...prev])
  }
  return { data, addTransaksi }
}
