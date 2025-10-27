import { DashboardStat } from './types'

export async function fetchDashboardStats(): Promise<DashboardStat[]> {
  // Ganti dengan fetch Laravel nanti
  return new Promise(resolve => setTimeout(() => resolve([]), 500))
}
