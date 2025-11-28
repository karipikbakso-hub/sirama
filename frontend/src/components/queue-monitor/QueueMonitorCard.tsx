'use client'

import React, { memo, useMemo } from 'react'
import { FaClock, FaUser, FaArrowRight } from 'react-icons/fa'
import { QueueData, STATUS_COLORS, STATUS_EMOJIS, STATUS_LABELS } from '@/types/queue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QueueMonitorCardProps {
  poliName: string
  serviceUnit: string
  currentServing: QueueData | null
  waitingList: QueueData[]
  next3: QueueData[]
  avgWaitTime: number | null
  tvMode?: boolean
  nightMode?: boolean
  highlightedChanges?: Set<number>
  onQueueClick?: (queue: QueueData) => void
}

const QueueItem = memo(({
  queue,
  isLarge = false,
  highlight = false,
  showTime = false,
  onClick
}: {
  queue: QueueData
  isLarge?: boolean
  highlight?: boolean
  showTime?: boolean
  onClick?: () => void
}) => {
  const patient = queue.patient
  const timeSince = useMemo(() => {
    if (!queue.created_at) return ''
    const diff = Date.now() - new Date(queue.created_at).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }, [queue.created_at])

  return (
    <div
      onClick={onClick}
      className={`
        p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer
        ${highlight ? 'animate-pulse border-yellow-400 shadow-lg scale-105' : 'border-gray-200 hover:border-blue-300'}
        ${isLarge ? 'p-4 text-xl' : 'p-2 text-sm'}
        bg-white dark:bg-gray-800 hover:shadow-md
      `}
    >
      <div className={`flex items-center gap-2 ${isLarge ? 'mb-2' : 'mb-1'}`}>
        <span className={`font-bold ${isLarge ? 'text-3xl' : 'text-lg'}`}>{queue.queue_number}</span>
        <Badge
          className={`${STATUS_COLORS[queue.status]} ${isLarge ? 'text-sm px-2' : 'text-xs px-1 py-0.5'}`}
        >
          {STATUS_EMOJIS[queue.status]} {isLarge ? STATUS_LABELS[queue.status] : ''}
        </Badge>
        {showTime && timeSince && (
          <span className={`text-gray-500 ${isLarge ? 'text-base' : 'text-xs'}`}>
            <FaClock className="inline mr-1" />{timeSince}
          </span>
        )}
      </div>
      <div className={`${isLarge ? 'text-lg font-medium' : 'text-sm font-medium'}`}>
        {patient?.name || 'N/A'}
      </div>
      {patient?.mrn && !isLarge && (
        <div className="text-xs text-gray-500">
          MRN: {patient.mrn}
        </div>
      )}
    </div>
  )
})

const QueueMonitorCard: React.FC<QueueMonitorCardProps> = memo(({
  poliName,
  serviceUnit,
  currentServing,
  waitingList,
  next3,
  avgWaitTime,
  tvMode = false,
  nightMode = false,
  highlightedChanges = new Set(),
  onQueueClick
}) => {
  const waitingCount = waitingList.length

  const displayCard = useMemo(() => {
    if (tvMode) {
      return (
        <Card className={`
          p-6 h-full backdrop-blur-sm shadow-2xl
          ${nightMode ? 'bg-black text-white border border-blue-500' : 'bg-white/95 border border-gray-200'}
          transition-all duration-300 hover:shadow-3xl
        `}>
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-5xl font-bold text-blue-600 mb-2">{poliName}</h3>
            <p className="text-2xl text-gray-600 dark:text-gray-300">{serviceUnit}</p>
          </div>

          {/* Current Serving - Large Display */}
          <div className="mb-8">
            <h4 className="text-3xl font-bold mb-4 text-center">SEDANG DILAYANI</h4>
            {currentServing ? (
              <div className="bg-green-500 text-white rounded-2xl p-6 text-center shadow-lg">
                <div className="text-6xl font-bold mb-2">{currentServing.queue_number}</div>
                <div className="text-3xl">
                  {currentServing.patient?.name || 'N/A'}
                </div>
                {currentServing.patient?.mrn && (
                  <div className="text-xl opacity-90 mt-1">
                    MRN: {currentServing.patient.mrn}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-400 text-gray-200 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">--</div>
                <div className="text-2xl">Tidak ada antrian</div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-500 text-white rounded-xl p-4 text-center">
              <div className="text-4xl font-bold">{waitingCount}</div>
              <div className="text-lg">Menunggu</div>
            </div>
            <div className="bg-orange-500 text-white rounded-xl p-4 text-center">
              <div className="text-4xl font-bold">{next3.length > 0 ? next3[0]?.queue_number : '--'}</div>
              <div className="text-lg">Selanjutnya</div>
            </div>
            <div className="bg-purple-500 text-white rounded-xl p-4 text-center">
              <div className="text-4xl font-bold">{avgWaitTime || '-'}</div>
              <div className="text-lg">Rata tunggu</div>
            </div>
          </div>

          {/* Next 3 Queues - TV Display */}
          <div className="mb-6">
            <h4 className="text-2xl font-bold mb-4 text-center">ANTRIAN SELANJUTNYA</h4>
            <div className="grid grid-cols-1 gap-3">
              {next3.slice(0, 3).map((queue, index) => (
                <QueueItem
                  key={queue.id}
                  queue={queue}
                  isLarge={true}
                  highlight={highlightedChanges.has(queue.id)}
                  showTime={true}
                  onClick={() => onQueueClick?.(queue)}
                />
              ))}
            </div>
          </div>

          {/* Wait Time Info */}
          {avgWaitTime && (
            <div className="text-center text-xl font-medium text-gray-700 dark:text-gray-300">
              <FaClock className="inline mr-2" />
              Waktu tunggu rata-rata: ~{avgWaitTime} menit
            </div>
          )}
        </Card>
      )
    }

    // Compact Mode
    return (
      <Card className={`
        p-4 h-full backdrop-blur-sm shadow-xl
        ${nightMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white/95 border-gray-200'}
        transition-all duration-200 hover:shadow-2xl
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{poliName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{serviceUnit}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaUser className="text-blue-500" />
            <span className="font-semibold text-blue-600">{waitingCount}</span>
          </div>
        </div>

        {/* Current Serving */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sedang Dilayani:</span>
            {avgWaitTime && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <FaClock />
                ~{avgWaitTime}min
              </span>
            )}
          </div>
          {currentServing ? (
            <QueueItem
              queue={currentServing}
              highlight={highlightedChanges.has(currentServing.id)}
              onClick={() => onQueueClick?.(currentServing)}
            />
          ) : (
            <div className="text-center text-sm text-gray-500 py-2 bg-gray-50 dark:bg-gray-700 rounded">
              Tidak ada antrian aktif
            </div>
          )}
        </div>

        {/* Next 3 Queues */}
        {next3.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Antrian Terdepan:</h4>
            <div className="space-y-2">
              {next3.slice(0, 3).map((queue, index) => (
                <div key={queue.id} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-center font-mono">{index + 1}.</span>
                  <QueueItem
                    queue={queue}
                    highlight={highlightedChanges.has(queue.id)}
                    onClick={() => onQueueClick?.(queue)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 border-t pt-2 mt-3">
          <span>Menunggu: {waitingCount}</span>
          {avgWaitTime && <span>Rata: ~{avgWaitTime}min</span>}
        </div>
      </Card>
    )
  }, [
    tvMode,
    nightMode,
    poliName,
    serviceUnit,
    currentServing,
    waitingCount,
    next3,
    avgWaitTime,
    highlightedChanges,
    onQueueClick
  ])

  return displayCard
})

QueueMonitorCard.displayName = 'QueueMonitorCard'

export default QueueMonitorCard
