'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FaUsers, FaClock, FaPlay, FaPause, FaStop, FaRedo, FaCog, FaChartBar,
  FaGripVertical, FaVolumeUp, FaBell, FaFastForward, FaStepForward,
  FaCheckCircle, FaHospital, FaUserCheck, FaUserTimes, FaSync
} from 'react-icons/fa'
import apiData from '@/lib/apiData'

// Types
interface QueueManagement {
  id: number
  service_type: string
  status: 'active' | 'paused' | 'stopped'
  current_number: number
  last_called_number: number
  total_served_today: number
  total_skipped_today: number
  estimated_wait_time: number
  working_hours_start: string
  working_hours_end: string
  max_queue_per_hour: number
  average_consultation_time: number
  doctor?: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

interface QueueStats {
  total_active: number
  total_paused: number
  total_stopped: number
  average_wait_time: number
  total_served_today: number
  total_skipped_today: number
  by_service_type: Array<{
    service_type: string
    count: number
    avg_wait_time: number
  }>
}

// Queue Item Component (Simplified without drag & drop)
function QueueItem({ queue, onAction, onCallNext, onSkip }: {
  queue: QueueManagement
  onAction: (id: number, action: string) => void
  onCallNext: (id: number) => void
  onSkip: (id: number) => void
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Aktif
        </span>
      case 'paused':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaPause className="text-xs" />
          Pause
        </span>
      case 'stopped':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaStop className="text-xs" />
          Stop
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getActionButtons = (queue: QueueManagement) => {
    switch (queue.status) {
      case 'active':
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onCallNext(queue.id)}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              title="Panggil Pasien Berikutnya"
            >
              <FaFastForward className="text-sm" />
            </button>
            <button
              onClick={() => onSkip(queue.id)}
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
              title="Lewati Antrian"
            >
              <FaStepForward className="text-sm" />
            </button>
            <button
              onClick={() => onAction(queue.id, 'pause')}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
              title="Pause Queue"
            >
              <FaPause className="text-sm" />
            </button>
            <button
              onClick={() => onAction(queue.id, 'stop')}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              title="Stop Queue"
            >
              <FaStop className="text-sm" />
            </button>
          </div>
        )
      case 'paused':
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onAction(queue.id, 'start')}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              title="Start Queue"
            >
              <FaPlay className="text-sm" />
            </button>
            <button
              onClick={() => onAction(queue.id, 'reset')}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              title="Reset Queue"
            >
              <FaRedo className="text-sm" />
            </button>
          </div>
        )
      case 'stopped':
        return (
          <button
            onClick={() => onAction(queue.id, 'start')}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            title="Start Queue"
          >
            <FaPlay className="text-sm" />
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <FaGripVertical className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{queue.service_type}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
            {queue.doctor?.name || 'Dokter belum ditentukan'}
            </p>
          </div>
        </div>
        {getStatusBadge(queue.status)}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Nomor Sekarang</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{queue.current_number}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Dilayani Hari Ini</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{queue.total_served_today}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Dilewati</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{queue.total_skipped_today}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Estimasi Tunggu</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{queue.estimated_wait_time || 0}min</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span>Jam kerja: {queue.working_hours_start} - {queue.working_hours_end}</span>
        </div>
        {getActionButtons(queue)}
      </div>
    </div>
  )
}

export default function AntrianManagementPage() {
  const [isAnnouncementEnabled, setIsAnnouncementEnabled] = useState(true)
  const [announcementVolume, setAnnouncementVolume] = useState(70)
  const [autoCallEnabled, setAutoCallEnabled] = useState(true)
  const [callInterval, setCallInterval] = useState(30)

  const queryClient = useQueryClient()


  // API Queries
  const { data: queueStats, isLoading: statsLoading } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: async () => {
      const response = await apiData.get('queue-managements/statistics')
      return response.data.data as QueueStats
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: activeQueues, isLoading: queuesLoading, refetch: refetchQueues } = useQuery({
    queryKey: ['active-queues'],
    queryFn: async () => {
      const response = await apiData.get('queue-managements/active')
      return response.data.data as QueueManagement[]
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  // API Mutations
  const updateQueueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<QueueManagement> }) => {
      const response = await apiData.put(`queue-managements/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-queues'] })
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] })
    }
  })

  const callNextMutation = useMutation({
    mutationFn: async (queueId: number) => {
      const response = await apiData.post(`queue-managements/${queueId}/call-next`)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['active-queues'] })
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] })

      // Play announcement if enabled
      if (isAnnouncementEnabled) {
        playAnnouncement(`Nomor antrian ${data.data.current_number} untuk layanan ${data.data.service_type}`)
      }
    }
  })

  const skipQueueMutation = useMutation({
    mutationFn: async (queueId: number) => {
      const response = await apiData.post(`queue-managements/${queueId}/skip`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-queues'] })
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] })
    }
  })


  // Event Handlers
  const handleQueueAction = useCallback((queueId: number, action: string) => {
    const statusMap: { [key: string]: string } = {
      'start': 'active',
      'pause': 'paused',
      'stop': 'stopped',
      'reset': 'active'
    }

    const newStatus = statusMap[action]
    if (newStatus) {
      updateQueueMutation.mutate({
        id: queueId,
        data: { status: newStatus as 'active' | 'paused' | 'stopped' }
      })
    }
  }, [updateQueueMutation])

  const handleCallNext = useCallback((queueId: number) => {
    callNextMutation.mutate(queueId)
  }, [callNextMutation])

  const handleSkip = useCallback((queueId: number) => {
    skipQueueMutation.mutate(queueId)
  }, [skipQueueMutation])


  const playAnnouncement = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.volume = announcementVolume / 100
      utterance.lang = 'id-ID' // Indonesian language

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleBulkAction = (action: 'start_all' | 'pause_all' | 'stop_all') => {
    if (!activeQueues) return

    const statusMap = {
      'start_all': 'active',
      'pause_all': 'paused',
      'stop_all': 'stopped'
    }

    const newStatus = statusMap[action] as 'active' | 'paused' | 'stopped'

    activeQueues.forEach(queue => {
      updateQueueMutation.mutate({
        id: queue.id,
        data: { status: newStatus }
      })
    })
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3">
          <FaCog className="text-blue-500" />
          <span className="truncate">Kontrol Antrian</span>
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaVolumeUp className="text-gray-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={announcementVolume}
              onChange={(e) => setAnnouncementVolume(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{announcementVolume}%</span>
          </div>

          <button
            onClick={() => setIsAnnouncementEnabled(!isAnnouncementEnabled)}
            className={`p-2 rounded-lg transition ${isAnnouncementEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
            title={isAnnouncementEnabled ? 'Disable Announcements' : 'Enable Announcements'}
          >
            <FaBell className="text-sm" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Antrian Aktif</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statsLoading ? '...' : queueStats?.total_active || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">poli beroperasi</p>
            </div>
            <FaHospital className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Tunggu</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statsLoading ? '...' : Math.round(queueStats?.average_wait_time || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">menit per pasien</p>
            </div>
            <FaClock className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dilayani Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {statsLoading ? '...' : queueStats?.total_served_today || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">pasien selesai</p>
            </div>
            <FaUserCheck className="text-2xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dilewati</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {statsLoading ? '...' : queueStats?.total_skipped_today || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">antrian dilewati</p>
            </div>
            <FaUserTimes className="text-2xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Aksi Massal</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleBulkAction('start_all')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <FaPlay className="text-sm" />
            Start Semua
          </button>
          <button
            onClick={() => handleBulkAction('pause_all')}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <FaPause className="text-sm" />
            Pause Semua
          </button>
          <button
            onClick={() => handleBulkAction('stop_all')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <FaStop className="text-sm" />
            Stop Semua
          </button>
          <button
            onClick={() => refetchQueues()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <FaSync className="text-sm" />
            Refresh
          </button>
        </div>
      </div>

      {/* Queue Management Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Queue Controls */}
        <div className="xl:col-span-2">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold">Kontrol Antrian</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Kelola antrian poli dengan kontrol manual
              </div>
            </div>

            {queuesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p>Loading queues...</p>
              </div>
            ) : activeQueues && activeQueues.length > 0 ? (
              <div className="space-y-4">
                {activeQueues.map((queue) => (
                  <QueueItem
                    key={queue.id}
                    queue={queue}
                    onAction={handleQueueAction}
                    onCallNext={handleCallNext}
                    onSkip={handleSkip}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Tidak ada antrian aktif saat ini
              </div>
            )}
          </div>
        </div>

        {/* Settings & Stats */}
        <div className="space-y-4">
          {/* Queue Settings */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Pengaturan</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Panggilan Otomatis
                </label>
                <button
                  onClick={() => setAutoCallEnabled(!autoCallEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoCallEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoCallEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interval Panggilan (detik)
                </label>
                <input
                  type="number"
                  value={callInterval}
                  onChange={(e) => setCallInterval(Number(e.target.value))}
                  min="10"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pengumuman Suara
                </label>
                <button
                  onClick={() => setIsAnnouncementEnabled(!isAnnouncementEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnnouncementEnabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnouncementEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
                Simpan Pengaturan
              </button>
            </div>
          </div>

          {/* Service Type Statistics */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Statistik per Layanan</h2>
            <div className="space-y-3">
              {queueStats?.by_service_type?.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{service.service_type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.count} antrian</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{service.avg_wait_time}min</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">rata-rata tunggu</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Tidak ada data layanan
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
