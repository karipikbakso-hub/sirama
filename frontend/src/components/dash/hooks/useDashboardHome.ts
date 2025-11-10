import { useQuery } from '@tanstack/react-query';
import { apiAuth } from '@/lib/apiAuth';

export interface DashboardStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export interface DashboardHomeData {
  stats: DashboardStat[];
  role: string;
  user: {
    name: string;
    email: string;
  };
}

export const useDashboardHome = () => {
  return useQuery<DashboardHomeData>({
    queryKey: ['dashboard-home'],
    queryFn: async () => {
      const response = await apiAuth.get('/api/dashboard/home');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
