'use client'

import { useState, useEffect } from 'react'
import { FaCog, FaPlay, FaPause, FaForward, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa'

interface QueueItem {
  id: number
  queue_number: string
  patient_name: string
  service_unit: string
  status: 'waiting' | 'called' | 'served'
  created_at: string
}

export default function AntrianManagementPage() {
  const [queues, setQueues] = useState<QueueItem[]>([])
  const [currentQueue, setCurrentQueue] = useState<QueueItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demonstration
    const mockQueues: QueueItem[] = [
      { id: 1, queue_number: 'A001', patient_name: 'John Doe', service_unit: 'Poli Umum', status: 'waiting', created_at: '2025-11-08 08:00:00' },
      { id: 2, queue_number: 'A002', patient_name: 'Jane Smith', service_unit: 'Poli Anak', status: 'called', created_at: '2025-11-08 08:15:00' },
      { id: 3, queue_number: 'A003', patient_name: 'Bob Johnson', service_unit: 'Poli Umum', status: 'waiting', created_at: '2025-11-08 08:30:00' },
    ]
    setQueues(mockQueues)
    setCurrentQueue(mockQueues.find(q => q.status === 'called') || null)
    setLoading(false)
  }, [])

  const callNextQueue = () => {
    const nextQueue = queues.find(q => q.status === 'waiting')
    if (nextQueue) {
      setQueues(prev => prev.map(q =>
        q.id === nextQueue.id ? { ...q, status: 'called' as const } : q
      ))
      setCurrentQueue(nextQueue)
    }
  }

  const markAsServed = () => {
    if (currentQueue) {
      setQueues(prev => prev.map(q =>
        q.id === currentQueue.id ? { ...q, status: 'served' as const } : q
      ))
      setCurrentQueue(null)
    }
  }

  const skipQueue = () => {
    if (currentQueue) {
      setQueues(prev => prev.map(q =>
        q.id === currentQueue.id ? { ...q, status: 'waiting' as const } : q
      ))
      setCurrentQueue(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <FaClock className="text-4xl text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaCog className="text-blue-500" />
        <span>Manajemen Antrian</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Queue Display */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <FaUsers className="text-green-500" />
              Antrian Saat Ini
            </h2>

            {currentQueue ? (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-2">{currentQueue.queue_number}</div>
                  <div className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{currentQueue.patient_name}</div>
                  <div className="text-gray-600 dark:text-gray-400">{currentQueue.service_unit}</div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-gray-400 mb-2">--</div>
                <div className="text-gray-600 dark:text-gray-400">Tidak ada antrian aktif</div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={callNextQueue}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <FaPlay />
                Panggil Selanjutnya
              </button>
              <button
                onClick={markAsServed}
                disabled={!currentQueue}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <FaCheckCircle />
                Selesai
              </button>
              <button
                onClick={skipQueue}
                disabled={!currentQueue}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <FaForward />
                Lewati
              </button>
            </div>
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Statistik Antrian</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Menunggu</span>
                <span className="font-bold text-blue-600">{queues.filter(q => q.status === 'waiting').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Dipanggil</span>
                <span className="font-bold text-green-600">{queues.filter(q => q.status === 'called').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Dilayani</span>
                <span className="font-bold text-purple-600">{queues.filter(q => q.status === 'served').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Antrian Menunggu</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {queues.filter(q => q.status === 'waiting').map((queue) => (
                <div key={queue.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <div className="font-semibold">{queue.queue_number}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{queue.patient_name}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{queue.service_unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Queue History */}
      <div className="mt-8 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6">Riwayat Antrian Hari Ini</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">No. Antrian</th>
                <th className="px-4 py-3 text-left">Pasien</th>
                <th className="px-4 py-3 text-left">Poli</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((queue) => (
                <tr key={queue.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-mono">{queue.queue_number}</td>
                  <td className="px-4 py-3">{queue.patient_name}</td>
                  <td className="px-4 py-3">{queue.service_unit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      queue.status === 'waiting' ? 'bg-blue-100 text-blue-800' :
                      queue.status === 'called' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {queue.status === 'waiting' ? 'Menunggu' :
                       queue.status === 'called' ? 'Dipanggil' : 'Dilayani'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(queue.created_at).toLocaleTimeString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
