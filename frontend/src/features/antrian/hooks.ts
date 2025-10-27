import { useState } from 'react'
import { Antrian } from './types'
import { dummyAntrian } from './data'

export function useAntrianData() {
  const [data, setData] = useState<Antrian[]>(dummyAntrian)
  const addAntrian = (newData: Omit<Antrian, 'id' | 'created_at'>) => {
    const newEntry: Antrian = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...newData,
    }
    setData(prev => [newEntry, ...prev])
  }
  return { data, addAntrian }
}
