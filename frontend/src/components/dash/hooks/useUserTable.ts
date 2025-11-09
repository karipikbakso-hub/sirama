import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/apiData'

export const useUserTable = () => {
  return useQuery({
    queryKey: ['user-table'],
    queryFn: async () => {
      const res = await api.get('/admin/users/table')
      return res.data
    },
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userData: { name: string; username: string; email: string; password: string; role: string }) => {
      const res = await api.post('/admin/users/table', userData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-table'] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: { name: string; username: string; email: string; role: string } }) => {
      const res = await api.put(`/admin/users/table/${id}`, userData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-table'] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/users/table/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-table'] })
    },
  })
}
