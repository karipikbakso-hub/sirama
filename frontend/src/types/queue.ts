// Queue Monitor Types and Interfaces

export type QueueStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled' | 'skipped'

export interface QueueData {
  id: number
  queue_number: string
  patient_id: number
  registration_id: number
  service_unit: string
  poli_id: number
  status: QueueStatus
  created_at: string
  updated_at: string
  estimated_wait_time: number | null // in minutes
  called_at: string | null
  completed_at: string | null
  patient?: {
    id: number
    mrn: string
    name: string
    nik: string
  }
}

export interface QueueStats {
  total_waiting: number
  total_called: number
  total_in_progress: number
  total_completed: number
  total_cancelled: number
  total_skipped: number
  avg_wait_time: number // in minutes
  longest_wait: {
    queue_id: number
    wait_time: number // in minutes
  }
}

export interface PoliQueue {
  poli_id: number
  poli_name: string
  service_unit: string
  current_serving: QueueData | null
  waiting_list: QueueData[]
  next_3: QueueData[]
  stats: {
    total_waiting: number
    total_completed_today: number
    avg_wait_time: number
  }
}

export interface QueueMonitorData {
  queues: QueueData[]
  stats: QueueStats
  by_poli: Record<number, PoliQueue>
  last_updated: string
}

export interface WebSocketMessage {
  event: 'queue.updated' | 'queue.called' | 'queue.completed' | 'queue.cancelled' | 'queue.skipped'
  data: {
    queue_id: number
    status: QueueStatus
    poli_id: number
    timestamp: string
    queue_data?: QueueData
  }
}

export interface MonitorFilters {
  show_completed: boolean
  status_filter: QueueStatus[] | 'all'
  poli_filter: number[] | 'all'
}

export interface TVModeSettings {
  is_tv_mode: boolean
  auto_scroll: boolean
  sound_enabled: boolean
  night_mode: boolean
  scroll_interval: number // in seconds
  current_poli_index: number
}

// Status colors as per requirements
export const STATUS_COLORS: Record<QueueStatus, string> = {
  waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  called: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export const STATUS_LABELS: Record<QueueStatus, string> = {
  waiting: 'Menunggu',
  called: 'Dipanggil',
  in_progress: 'Sedang Dilayani',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  skipped: 'Skip'
}

export const STATUS_EMOJIS: Record<QueueStatus, string> = {
  waiting: '🟡',
  called: '🔵',
  in_progress: '🟢',
  completed: '✅',
  cancelled: '❌',
  skipped: '⏭️'
}
