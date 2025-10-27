import { useState } from 'react'
import { Pasien } from './types'
import { dummyPasien } from './data'

export function usePasienData() {
  const [data, setData] = useState<Pasien[]>(dummyPasien)
  const addPasien = (newData: Omit<Pasien, 'id' | 'created_at'>) => {
    const newPasien: Pasien = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...newData,
    }
    setData(prev => [newPasien, ...prev])
  }
  return { data, addPasien }
}
