'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/apiData' // Axios instance

export default function useAdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/admin/dashboard')
        setData(res.data)
      } catch (err) {
        console.error('Gagal ambil data dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading }
}