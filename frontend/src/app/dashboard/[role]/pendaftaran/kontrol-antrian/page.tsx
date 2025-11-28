'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaPlay, FaPause, FaRedo, FaEye, FaCog, FaBell, FaBellSlash } from 'react-icons/fa'
import { QueueData, QueueStatus, MonitorFilters } from '@/types/queue'
import { useQueueRealtime } from '@/hooks/useQueueRealtime'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from '@/lib/toast'

// Types for control actions
interface QueueAction {
  id: string
  type: 'call' | 'skip' | 'cancel' | 'transfer' | 'prioritize'
  queue_id: number
  timestamp: Date
  reason?: string
  target_poli_id?: number
  previous_position?: number
  new_position?: number
}

interface UndoAction extends QueueAction {
  undo_data: {
    previous_status: QueueStatus
    previous_position?: number
  }
}

export default function KontrolAntrianPage() {
  // State management
  const [selectedPoli, setSelectedPoli] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [undoStack, setUndoStack] = useState<UndoAction[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean
    action: string
    queue: QueueData | null
    onConfirm: () => void
  }>({ show: false, action: '', queue: null, onConfirm: () => {} })

  const queryClient = useQueryClient()

  // Real-time queue data
  const {
    data: queueData,
    isLoading,
    error,
    isWebSocketConnected
  } = useQueueRealtime({
    enabled: true,
    pollingInterval: 5000,
    enableWebSocket: true,
    filters: selectedPoli ? {
      show_completed: false,
      status_filter: 'all',
      poli_filter: [selectedPoli]
    } : {
      show_completed: false,
      status_filter: 'all',
      poli_filter: 'all'
    }
  })

  // Get available poli list
  const poliList = useMemo(() => {
    if (!queueData?.by_poli) return []
    return Object.values(queueData.by_poli).map(poli => ({
      id: poli.poli_id,
      name: poli.poli_name,
      waiting: poli.waiting_list.length,
      inProgress: poli.current_serving ? 1 : 0,
      completed: poli.stats.total_completed_today
    }))
  }, [queueData])

  // Get current poli data
  const currentPoliData = useMemo(() => {
    if (!selectedPoli || !queueData?.by_poli) return null
    return queueData.by_poli[selectedPoli] || null
  }, [selectedPoli, queueData])

  // Stats for selected poli
  const poliStats = useMemo(() => {
    if (!currentPoliData) return { waiting: 0, inProgress: 0, completed: 0 }
    return {
      waiting: currentPoliData.waiting_list.length,
      inProgress: currentPoliData.current_serving ? 1 : 0,
      completed: currentPoliData.stats.total_completed_today
    }
  }, [currentPoliData])

  // Mutations for queue actions
  const callMutation = useMutation({
    mutationFn: async (queueId: number) => {
      const response = await api.post(`/api/pendaftaran/antrian/call/${queueId}`)
      return response.data
    },
    onSuccess: (data, queueId) => {
      // Add to undo stack
      const queue = currentPoliData?.waiting_list.find(q => q.id === queueId)
      if (queue && currentPoliData) {
        addToUndoStack({
          id: `call_${queueId}_${Date.now()}`,
          type: 'call',
          queue_id: queueId,
          timestamp: new Date(),
          undo_data: {
            previous_status: queue.status,
            previous_position: currentPoliData.waiting_list.indexOf(queue)
          }
        })
      }
      queryClient.invalidateQueries({ queryKey: ['queues'] })
      toast.success('Pasien berhasil dipanggil')
    },
    onError: () => {
      toast.error('Gagal memanggil pasien')
    }
  })

  const skipMutation = useMutation({
    mutationFn: async ({ queueId, reason }: { queueId: number; reason: string }) => {
      const response = await api.post(`/api/pendaftaran/antrian/skip/${queueId}`, { reason })
      return response.data
    },
    onSuccess: (data, { queueId }) => {
      const queue = currentPoliData?.waiting_list.find(q => q.id === queueId)
      if (queue && currentPoliData) {
        addToUndoStack({
          id: `skip_${queueId}_${Date.now()}`,
          type: 'skip',
          queue_id: queueId,
          timestamp: new Date(),
          reason: data.reason,
          undo_data: {
            previous_status: queue.status,
            previous_position: currentPoliData.waiting_list.indexOf(queue)
          }
        })
      }
      queryClient.invalidateQueries({ queryKey: ['queues'] })
      toast.success('Antrian berhasil dilewati')
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async ({ queueId, reason }: { queueId: number; reason: string }) => {
      const response = await api.post(`/api/pendaftaran/antrian/cancel/${queueId}`, { reason })
      return response.data
    },
    onSuccess: (data, { queueId }) => {
      const queue = [...(currentPoliData?.waiting_list || []), currentPoliData?.current_serving].find(q => q?.id === queueId)
      if (queue && currentPoliData) {
        const position = currentPoliData.waiting_list.findIndex(q => q.id === queueId)
        addToUndoStack({
          id: `cancel_${queueId}_${Date.now()}`,
          type: 'cancel',
          queue_id: queueId,
          timestamp: new Date(),
          reason: data.reason,
          undo_data: {
            previous_status: queue.status,
            previous_position: position >= 0 ? position : 0
          }
        })
      }
      queryClient.invalidateQueries({ queryKey: ['queues'] })
      toast.success('Antrian berhasil dibatalkan')
    }
  })

  // Add action to undo stack
  const addToUndoStack = (action: UndoAction) => {
    setUndoStack(prev => [action, ...prev.slice(0, 9)]) // Keep only last 10 actions
  }

  // Handle undo
  const handleUndo = async (actionId: string) => {
    const action = undoStack.find(a => a.id === actionId)
    if (!action) return

    try {
      await api.post(`/api/pendaftaran/antrian/undo/${actionId}`)
      setUndoStack(prev => prev.filter(a => a.id !== actionId))
      queryClient.invalidateQueries({ queryKey: ['queues'] })
      toast.success('Aksi berhasil dibatalkan')
    } catch (error) {
      toast.error('Gagal membatalkan aksi')
    }
  }

  // Handle call next patient
  const handleCallNext = () => {
    if (!currentPoliData?.waiting_list.length) {
      toast.error('Tidak ada antrian menunggu')
      return
    }
    const nextQueue = currentPoliData.waiting_list[0]
    callMutation.mutate(nextQueue.id)
  }

  // Handle skip patient
  const handleSkip = (queue: QueueData) => {
    setShowConfirmDialog({
      show: true,
      action: 'Lewati antrian',
      queue,
      onConfirm: () => {
        const reason = prompt('Alasan melewati antrian:')
        if (reason) {
          skipMutation.mutate({ queueId: queue.id, reason })
        }
        setShowConfirmDialog({ show: false, action: '', queue: null, onConfirm: () => {} })
      }
    })
  }

  // Handle cancel patient
  const handleCancel = (queue: QueueData) => {
    setShowConfirmDialog({
      show: true,
      action: 'Batalkan antrian',
      queue,
      onConfirm: () => {
        const reason = prompt('Alasan pembatalan:')
        if (reason) {
          cancelMutation.mutate({ queueId: queue.id, reason })
        }
        setShowConfirmDialog({ show: false, action: '', queue: null, onConfirm: () => {} })
      }
    })
  }

  // Clean up old undo actions (5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setUndoStack(prev => prev.filter(action =>
        Date.now() - action.timestamp.getTime() < 5 * 60 * 1000
      ))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Memuat data antrian...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p>Unable to load queue data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaCog className="text-blue-500 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold">Kontrol Antrian</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kelola antrian pasien secara real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm">{isWebSocketConnected ? 'Real-time' : 'Polling'}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
            >
              {soundEnabled ? <FaBell /> : <FaBellSlash />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Poli Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Pilih Poli yang Dikelola</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {poliList.map((poli) => (
              <div
                key={poli.id}
                onClick={() => setSelectedPoli(poli.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPoli === poli.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <h3 className="font-semibold">{poli.name}</h3>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-blue-600">Menunggu: {poli.waiting}</span>
                  <span className="text-green-600">Dilayani: {poli.inProgress}</span>
                  <span className="text-purple-600">Selesai: {poli.completed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedPoli && currentPoliData && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu</p>
                    <p className="text-2xl font-bold text-blue-600">{poliStats.waiting}</p>
                  </div>
                  <FaEye className="text-blue-500 text-2xl" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sedang Dilayani</p>
                    <p className="text-2xl font-bold text-green-600">{poliStats.inProgress}</p>
                  </div>
                  <FaPlay className="text-green-500 text-2xl" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Selesai Hari Ini</p>
                    <p className="text-2xl font-bold text-purple-600">{poliStats.completed}</p>
                  </div>
                  <FaRedo className="text-purple-500 text-2xl" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <h3 className="font-semibold mb-4">Aksi Cepat</h3>
              <div className="flex gap-4">
                <button
                  onClick={handleCallNext}
                  disabled={isPaused || poliStats.waiting === 0 || callMutation.isPending}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                >
                  <FaPlay />
                  Panggil Berikutnya
                </button>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isPaused
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {isPaused ? <FaPlay /> : <FaPause />}
                  {isPaused ? 'Lanjutkan' : 'Jeda'}
                </button>
              </div>
            </div>

            {/* Current Serving */}
            {currentPoliData.current_serving && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Sedang Dilayani</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentPoliData.current_serving.patient?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No. {currentPoliData.current_serving.queue_number}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm">
                    Sedang Dilayani
                  </span>
                </div>
              </div>
            )}

            {/* Queue List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Antrian Menunggu</h3>
              </div>

              <div className="p-4">
                {currentPoliData.waiting_list.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Tidak ada antrian menunggu
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentPoliData.waiting_list.map((queue, index) => (
                      <div
                        key={queue.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg font-bold text-blue-600">
                            {queue.queue_number}
                          </span>
                          <div>
                            <p className="font-medium">{queue.patient?.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Posisi: {index + 1}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => callMutation.mutate(queue.id)}
                            disabled={callMutation.isPending}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Panggil
                          </button>
                          <button
                            onClick={() => handleSkip(queue)}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                          >
                            Lewati
                          </button>
                          <button
                            onClick={() => handleCancel(queue)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Undo Panel */}
            {undoStack.length > 0 && (
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Aksi Terbaru (dapat dibatalkan dalam 5 menit)</h3>
                <div className="space-y-2">
                  {undoStack.slice(0, 3).map((action) => (
                    <div key={action.id} className="flex items-center justify-between text-sm">
                      <span>
                        {action.type === 'call' && 'Memanggil pasien'}
                        {action.type === 'skip' && 'Melewati antrian'}
                        {action.type === 'cancel' && 'Membatalkan antrian'}
                        {action.type === 'transfer' && 'Memindahkan poli'}
                        {action.type === 'prioritize' && 'Memprioritaskan'}
                      </span>
                      <button
                        onClick={() => handleUndo(action.id)}
                        className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                      >
                        Batal
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="font-semibold mb-4">{showConfirmDialog.action}</h3>
            {showConfirmDialog.queue && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="font-medium">{showConfirmDialog.queue.patient?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No. {showConfirmDialog.queue.queue_number}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog({ show: false, action: '', queue: null, onConfirm: () => {} })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={showConfirmDialog.onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}