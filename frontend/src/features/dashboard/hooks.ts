import { useState } from 'react'
import { DashboardStat } from './types'
import { dummyStats } from './data'

export function useDashboardStats() {
  const [stats] = useState<DashboardStat[]>(dummyStats)
  return { stats }
}
