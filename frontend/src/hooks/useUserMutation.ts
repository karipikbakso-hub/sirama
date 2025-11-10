'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

type UserPayload = {
  id?: number
  name: string
  username: string
  email: string
}

const API_BASE = 'http://localhost:8000/api/users'

export function useUserMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

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
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] })

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users'])

      // Optimistically update to the new value
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return old

        if (newUser.id) {
          // Edit existing user
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((user: any) =>
                user.id === newUser.id ? { ...user, ...newUser } : user
              )
            }
          }
        } else {
          // Add new user
          const optimisticUser = {
            id: Date.now(), // Temporary ID
            ...newUser,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          return {
            ...old,
            data: {
              ...old.data,
              data: [optimisticUser, ...old.data.data],
              total: old.data.total + 1
            }
          }
        }
      })

      // Return a context object with the snapshotted value
      return { previousUsers }
    },
    onError: (err, newUser, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers)
      }
      console.error('❌ Mutasi gagal:', err)
    },
    onSuccess: (data, variables) => {
      console.log('✅ Mutasi berhasil, panggil onSuccess')
      // Invalidate and refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess?.()
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
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] })

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users'])

      // Optimistically update to remove the user
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return old

        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.filter((user: any) => user.id !== deletedId),
            total: old.data.total - 1
          }
        }
      })

      // Return a context object with the snapshotted value
      return { previousUsers, deletedId }
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers)
      }
      console.error('❌ Mutasi hapus gagal:', err)
    },
    onSuccess: (data, variables) => {
      console.log('✅ Hapus berhasil, panggil onSuccess')
      // Invalidate and refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess?.()
    },
  })

  return { addOrEdit, remove }
}
