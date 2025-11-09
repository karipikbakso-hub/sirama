// hooks/useRoles.ts
'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/apiAuth'

export default function useRoles() {
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/api/roles')
        setRoles(res.data || [])
      } catch (err) {
        console.error('❌ Gagal ambil roles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  return { roles, loading }
}