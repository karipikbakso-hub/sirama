import { useQuery } from '@tanstack/react-query'
import api from '@/lib/apiAuth'

export function useUserQuery(page: number = 1) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const res = await api.get(`/api/users?page=${page}`)
      return res.data
    },
    staleTime: 1000 * 60 * 5, // cache 5 menit
    refetchOnWindowFocus: false,
  })
}