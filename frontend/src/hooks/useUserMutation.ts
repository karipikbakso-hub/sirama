'use client'

import { useMutation } from '@tanstack/react-query'

type UserPayload = {
  id?: number
  name: string
  username: string
  email: string
}

const API_BASE = 'http://localhost:8000/api/users'

export function useUserMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const addOrEdit = useMutation({
    mutationFn: async (payload: UserPayload) => {
      const res = await fetch(`${'http://localhost:8000/api/users'}/${payload.id ?? ''}`, {
        method: payload.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Gagal simpan user:', {
            status: res.status,
            body: errorText,
        })
        throw new Error('Gagal simpan user')
        }
      return res.json()
    },
    onSuccess: () => {
      console.log('✅ Mutasi berhasil, panggil onSuccess')
      onSuccess?.()
    },
    onError: (err) => {
      console.error('❌ Mutasi gagal:', err)
    },
  })

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Gagal hapus user:', errorText)
        throw new Error('Gagal hapus user')
      }
      return res.json()
    },
    onSuccess: () => {
      console.log('✅ Hapus berhasil, panggil onSuccess')
      onSuccess?.()
    },
    onError: (err) => {
      console.error('❌ Mutasi hapus gagal:', err)
    },
  })

  return { addOrEdit, remove }
}