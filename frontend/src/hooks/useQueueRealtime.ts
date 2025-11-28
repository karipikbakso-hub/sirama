import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { getQueueWebSocket, connectQueueWebSocket, disconnectQueueWebSocket } from '@/lib/websocket'
import type {
  QueueData,
  QueueMonitorData,
  QueueStats,
  WebSocketMessage,
  QueueStatus,
  MonitorFilters
} from '@/types/queue'

interface UseQueueRealtimeOptions {
  enabled?: boolean
  pollingInterval?: number
  enableWebSocket?: boolean
  filters?: MonitorFilters
}

export const useQueueRealtime = (options: UseQueueRealtimeOptions = {}) => {
  const {
    enabled = true,
    pollingInterval = 8000,
    enableWebSocket = false, // Disabled by default - using HTTP polling only
    filters = {
      show_completed: false,
      status_filter: 'all',
      poli_filter: 'all'
    }
  } = options

  const [usePolling, setUsePolling] = useState(!enableWebSocket)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString())
  const [statusChangeIds, setStatusChangeIds] = useState<Set<number>>(new Set())

  const queryClient = useQueryClient()
  const webSocketRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Fetch queue data from API
  const fetchQueueData = useCallback(async (): Promise<QueueMonitorData> => {
    try {
      const response = await api.get('/api/pendaftaran/dashboard/antrian/all', {
        params: {
          show_completed: filters.show_completed,
          status: filters.status_filter !== 'all' ? filters.status_filter : undefined,
          poli: filters.poli_filter !== 'all' ? filters.poli_filter : undefined
        }
      })

      return {
        ...response.data,
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching queue data:', error)
      throw error
    }
  }, [filters])

  // Main query for queue data
  const {
    data: queueData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['queue-monitor', filters],
    queryFn: fetchQueueData,
    enabled: enabled && (usePolling || !enableWebSocket),
    refetchInterval: usePolling ? pollingInterval : false,
    refetchIntervalInBackground: false,
    staleTime: 5000,
    gcTime: 10000,
    placeholderData: (previousData) => previousData
  })

  // WebSocket setup
  useEffect(() => {
    if (!enableWebSocket) return

    const ws = getQueueWebSocket()
    webSocketRef.current = ws

    const unsubscribe = ws.on('queue.updated', (message: WebSocketMessage) => {
      console.log('Queue updated via WebSocket:', message)
      setLastUpdate(message.data.timestamp)

      // Add to status change animation set
      setStatusChangeIds(prev => new Set(prev).add(message.data.queue_id))

      // Clear animation after 3 seconds
      setTimeout(() => {
        setStatusChangeIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(message.data.queue_id)
          return newSet
        })
      }, 3000)

      // Invalidate and refetch to get latest data
      queryClient.invalidateQueries({
        queryKey: ['queue-monitor']
      })

      // Play notification sound if enabled and status changed
      playNotificationSound()
    })

    return () => {
      unsubscribe()
    }
  }, [enableWebSocket, queryClient])

  // Connect WebSocket on mount
  useEffect(() => {
    if (!enableWebSocket) return

    const ws = getQueueWebSocket()

    const checkConnection = () => {
      setIsWebSocketConnected(ws.isWebSocketConnected)
    }

    connectQueueWebSocket()

    // Check connection status periodically
    const interval = setInterval(checkConnection, 2000)
    checkConnection()

    return () => {
      clearInterval(interval)
      // Don't disconnect here as other components might be using it
    }
  }, [enableWebSocket])

  // Fallback to polling if WebSocket connection fails
  useEffect(() => {
    if (enableWebSocket && isWebSocketConnected === false) {
      // Wait 10 seconds before falling back to polling
      const timeout = setTimeout(() => {
        console.log('WebSocket connection failed, falling back to polling')
        setUsePolling(true)
      }, 10000)

      return () => clearTimeout(timeout)
    } else if (isWebSocketConnected) {
      setUsePolling(false)
    }
  }, [isWebSocketConnected, enableWebSocket])

  // Audio notification function
  const playNotificationSound = useCallback(() => {
    // Create audio context if needed
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('Audio context not supported:', error)
        return
      }
    }

    if (!audioContextRef.current) return

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Notification sound: beep
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }, [])

  // Manual refresh function
  const refreshQueue = useCallback(async () => {
    await refetch()
    setLastUpdate(new Date().toISOString())
  }, [refetch])

  // Computed data for ease of use
  const processedData = queueData ? {
    ...queueData,
    queues: queueData.queues.map(queue => ({
      ...queue,
      _isStatusChange: statusChangeIds.has(queue.id)
    })),
    lastUpdated: lastUpdate
  } : null

  return {
    data: processedData,
    isLoading,
    error,
    isWebSocketConnected: enableWebSocket ? isWebSocketConnected : false,
    usePollingFallBack: usePolling,
    refreshQueue,
    lastUpdate,

    // Raw data access
    rawData: queueData,

    // Connection status
    connectionStatus: {
      isWebSocket: enableWebSocket && !usePolling,
      isPolling: usePolling,
      isConnected: (enableWebSocket && isWebSocketConnected) || usePolling
    }
  }
}
