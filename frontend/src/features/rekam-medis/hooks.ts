import { useState } from 'react'
import { RekamMedis } from './types'
import { dummyRekamMedis } from './data'

export function useRekamMedisData() {
  const [data, setData] = useState<RekamMedis[]>(dummyRekamMedis)
  const addRekamMedis = (newData: Omit<RekamMedis, 'id' | 'created_at'>) => {
    const newEntry: RekamMedis = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...newData,
    }
    setData(prev => [newEntry, ...prev])
  }
  return { data, addRekamMedis }
}
