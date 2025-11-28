'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaSync, FaMoon, FaSun, FaCompress, FaExpand, FaTv, FaDesktop, FaPlayCircle, FaPause, FaEye } from 'react-icons/fa'
import { useQueueRealtime } from '@/hooks/useQueueRealtime'
import { MonitorFilters, QueueData } from '@/types/queue'
import QueueMonitorCard from '@/components/queue-monitor/QueueMonitorCard'

// Interface untuk data antrian per poli
interface PoliQueueDisplay {
  poli_id: number
  poli_name: string
  service_unit: string
  current_serving: QueueData | null
  waiting_list: QueueData[]
  next_3: QueueData[]
  avg_wait_time: number | null
}

export default function AntrianPage() {
  // State management
  const [filters] = useState<MonitorFilters>({
    show_completed: false,
    status_filter: 'all',
    poli_filter: 'all'
  })

  const [tvSettings, setTvSettings] = useState({
    is_tv_mode: false,
    auto_scroll: false,
    night_mode: false,
    scroll_interval: 10,
    current_poli_index: 0
  })

  const [isFullscreen, setIsFullscreen] = useState(false)

  // Real-time queue data hook
  const {
    data: queueData,
    isLoading,
    error,
    isWebSocketConnected,
    refreshQueue,
    lastUpdate
  } = useQueueRealtime({
    enabled: true,
    pollingInterval: 8000,
    enableWebSocket: true,
    filters
  })

  // Process data for display
  const poliData = useMemo<PoliQueueDisplay[]>(() => {
    if (!queueData?.by_poli) return []

    return Object.values(queueData.by_poli).map((poli) => ({
      ...poli,
      next_3: poli.waiting_list.slice(0, 3)
    }))
  }, [queueData])

  // Stats for overview
  const stats = useMemo(() => ({
    total: queueData?.stats?.total_waiting + queueData?.stats?.total_called + queueData?.stats?.total_in_progress || 0,
    waiting: queueData?.stats?.total_waiting || 0,
    inProgress: queueData?.stats?.total_called + queueData?.stats?.total_in_progress || 0,
    completed: queueData?.stats?.total_completed || 0,
    avgWaitTime: queueData?.stats?.avg_wait_time || null
  }), [queueData])

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Auto-scroll effect for TV mode
  useEffect(() => {
    if (tvSettings.is_tv_mode && tvSettings.auto_scroll && poliData.length > 1) {
      const interval = setInterval(() => {
        setTvSettings(prev => ({
          ...prev,
          current_poli_index: (prev.current_poli_index + 1) % poliData.length
        }))
      }, tvSettings.scroll_interval * 1000)
      return () => clearInterval(interval)
    }
  }, [tvSettings.is_tv_mode, tvSettings.auto_scroll, tvSettings.scroll_interval, poliData.length])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen().catch(console.error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Memuat data antrian...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Terjadi Kesalahan</h2>
          <p className="text-gray-600 dark:text-gray-400">Tidak dapat memuat data antrian</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      min-h-screen p-4 md:p-6 transition-all duration-300
      ${tvSettings.night_mode ? 'bg-black text-white' :
        tvSettings.is_tv_mode ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white' :
        'bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100'
      }
    `}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={`font-bold tracking-wide flex items-center gap-3 ${
          tvSettings.is_tv_mode ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
        }`}>
          <FaEye className="text-blue-500" />
          Monitor Antrian Real-time SIRAMA
        </h1>

        <div className="flex items-center gap-4 text-sm">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <span>Mode:</span>
            <button
              onClick={() => setTvSettings(prev => ({ ...prev, is_tv_mode: !prev.is_tv_mode }))}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                tvSettings.is_tv_mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
              }`}
            >
              {tvSettings.is_tv_mode ? <FaTv /> : <FaDesktop />}
              {tvSettings.is_tv_mode ? 'TV' : 'Desktop'}
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="Fullscreen (F11)"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>

          {/* Night Mode Toggle */}
          <button
            onClick={() => setTvSettings(prev => ({ ...prev, night_mode: !prev.night_mode }))}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title="Night Mode"
          >
            {tvSettings.night_mode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Auto Scroll Toggle (TV Mode only) */}
          {tvSettings.is_tv_mode && (
            <button
              onClick={() => setTvSettings(prev => ({ ...prev, auto_scroll: !prev.auto_scroll }))}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              title="Auto Scroll"
            >
              {tvSettings.auto_scroll ? <FaPause /> : <FaPlayCircle />}
            </button>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-gray-600 dark:text-gray-400 text-xs">
              {isWebSocketConnected ? 'Real-time' : 'Polling'}
            </span>
          </div>

          <div className="text-gray-500 dark:text-gray-400 text-xs">
            Updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('id-ID') : '--:--'}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {!tvSettings.is_tv_mode && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Antrian</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">📋</div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sedang Menunggu</p>
                <p className="text-2xl font-bold text-blue-600">{stats.waiting}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">⏳</div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sedang Dilayani</p>
                <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-blue-900/30 rounded-lg">👨‍⚕️</div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selesai Hari Ini</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">✅</div>
            </div>
          </div>
        </div>
      )}

      {/* TV Mode Single Display */}
      {tvSettings.is_tv_mode && poliData.length > 0 && (
        <div className="mb-6">
          <QueueMonitorCard
            poliName={poliData[tvSettings.current_poli_index]?.poli_name || 'N/A'}
            serviceUnit={poliData[tvSettings.current_poli_index]?.service_unit || ''}
            currentServing={poliData[tvSettings.current_poli_index]?.current_serving || null}
            waitingList={poliData[tvSettings.current_poli_index]?.waiting_list || []}
            next3={poliData[tvSettings.current_poli_index]?.next_3 || []}
            avgWaitTime={poliData[tvSettings.current_poli_index]?.avg_wait_time || null}
            tvMode={tvSettings.is_tv_mode}
            nightMode={tvSettings.night_mode}
            highlightedChanges={new Set()}
            onQueueClick={(queue) => console.log('Queue clicked:', queue)}
          />

          {poliData.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {poliData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTvSettings(prev => ({ ...prev, current_poli_index: index }))}
                  className={`w-3 h-3 rounded-full transition ${
                    index === tvSettings.current_poli_index ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop Grid View */}
      {!tvSettings.is_tv_mode && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Dashboard Antrian per Poli</h2>

          {poliData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {poliData.map((poli) => (
                <QueueMonitorCard
                  key={poli.poli_id}
                  poliName={poli.poli_name}
                  serviceUnit={poli.service_unit}
                  currentServing={poli.current_serving}
                  waitingList={poli.waiting_list}
                  next3={poli.next_3}
                  avgWaitTime={poli.avg_wait_time}
                  tvMode={false}
                  nightMode={tvSettings.night_mode}
                  highlightedChanges={new Set()}
                  onQueueClick={(queue) => console.log('Queue clicked:', queue)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-2 block">📋</span>
              Tidak ada data antrian
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => refreshQueue()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition hover:shadow-xl"
          title="Refresh Manual"
        >
          <FaSync />
        </button>
      </div>
    </div>
  )
}
