import { useQuery } from '@tanstack/react-query'
import api from '@/lib/apiData'

export const useAuditLogs = (userId?: number) => {
  return useQuery({
    queryKey: ['audit-logs', userId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId.toString())
      params.append('per_page', '1000') // Fetch more to handle on frontend
      const res = await api.get(`/admin/audit?${params.toString()}`)
      return res.data
    },
  })
}
