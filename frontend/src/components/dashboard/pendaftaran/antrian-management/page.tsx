'use client'

import { useState } from 'react'
import { FaUsers, FaClock, FaPlay, FaPause, FaStop, FaRedo, FaCog, FaChartBar } from 'react-icons/fa'

// Mock data for queue management
const mockQueues = [
  {
    id: 1,
    serviceName: 'Poli Umum',
    currentNumber: 15,
    totalToday: 89,
    averageWaitTime: '12 menit',
    status: 'active',
    doctor: 'Dr. Ahmad Surya'
  },
  {
    id: 2,
    serviceName: 'Poli Anak',
    currentNumber: 8,
    totalToday: 45,
    averageWaitTime: '18 menit',
    status: 'active',
    doctor: 'Dr. Maya Sari'
  },
  {
    id: 3,
    serviceName: 'Poli Jantung',
    currentNumber: 22,
    totalToday: 67,
    averageWaitTime: '25 menit',
    status: 'paused',
    doctor: 'Dr. Budi Santoso'
  },
  {
    id: 4,
    serviceName: 'Poli Mata',
    currentNumber: 5,
    totalToday: 23,
    averageWaitTime: '8 menit',
    status: 'active',
    doctor: 'Dr. Siti Nurhaliza'
  }
]

const mockWaitingPatients = [
  { id: 1, queueNumber: 'A001', patientName: 'Ahmad Rahman', service: 'Poli Umum', waitTime: '5 menit', status: 'waiting' },
  { id: 2, queueNumber: 'A002', patientName: 'Sari Dewi', service: 'Poli Anak', waitTime: '12 menit', status: 'waiting' },
  { id: 3, queueNumber: 'B001', patientName: 'Rudi Hartono', service: 'Poli Jantung', waitTime: '8 menit', status: 'waiting' },
  { id: 4, queueNumber: 'C001', patientName: 'Maya Sari', service: 'Poli Mata', waitTime: '3 menit', status: 'waiting' },
  { id: 5, queueNumber: 'A003', patientName: 'Budi Santoso', service: 'Poli Umum', waitTime: '15 menit', status: 'waiting' }
]

export default function AntrianManagementPage() {
  const [queues, setQueues] = useState(mockQueues)
  const [selectedQueue, setSelectedQueue] = useState(mockQueues[0])

  const handleQueueAction = (queueId: number, action: 'start' | 'pause' | 'stop' | 'reset') => {
    setQueues(prevQueues =>
      prevQueues.map(queue => {
        if (queue.id === queueId) {
          switch (action) {
            case 'start':
              return { ...queue, status: 'active' as const }
            case 'pause':
              return { ...queue, status: 'paused' as const }
            case 'stop':
              return { ...queue, status: 'stopped' as const }
            case 'reset':
              return { ...queue, currentNumber: 0, status: 'active' as const }
            default:
              return queue
          }
        }
        return queue
      })
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Aktif</span>
      case 'paused':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Pause</span>
      case 'stopped':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Stop</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getActionButtons = (queue: typeof mockQueues[0]) => {
    switch (queue.status) {
      case 'active':
        return (
          <div className="flex gap-1">
            <button
              onClick={() => handleQueueAction(queue.id, 'pause')}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
              title="Pause Queue"
            >
              <FaPause className="text-sm" />
            </button>
            <button
              onClick={() => handleQueueAction(queue.id, 'stop')}
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
              onClick={() => handleQueueAction(queue.id, 'start')}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              title="Start Queue"
            >
              <FaPlay className="text-sm" />
            </button>
            <button
              onClick={() => handleQueueAction(queue.id, 'reset')}
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
            onClick={() => handleQueueAction(queue.id, 'start')}
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
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaCog className="text-blue-500" />
        <span className="truncate">Manajemen Antrian</span>
      </h1>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Antrian Hari Ini</p>
              <p className="text-2xl font-bold">224</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+15% dari kemarin</p>
            </div>
            <FaUsers className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Waktu Tunggu</p>
              <p className="text-2xl font-bold">14</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">menit per pasien</p>
            </div>
            <FaClock className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Poli Aktif</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">dari 6 poli tersedia</p>
            </div>
            <FaChartBar className="text-2xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasien Menunggu</p>
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">dalam antrian</p>
            </div>
            <FaUsers className="text-2xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Queue Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Kontrol Antrian</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queues.map((queue) => (
                <div key={queue.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{queue.serviceName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{queue.doctor}</p>
                    </div>
                    {getStatusBadge(queue.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nomor Sekarang</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{queue.currentNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Hari Ini</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{queue.totalToday}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata Tunggu</p>
                      <p className="text-sm font-medium">{queue.averageWaitTime}</p>
                    </div>
                    {getActionButtons(queue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting Patients */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Pasien Menunggu</h2>
            <div className="space-y-3">
              {mockWaitingPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{patient.queueNumber}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{patient.patientName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{patient.service} • Tunggu {patient.waitTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition">
                      Panggil
                    </button>
                    <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded transition">
                      Lewati
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Queue Settings */}
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Pengaturan Antrian</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batas Maksimal Antrian per Hari
                </label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waktu Tunggu Maksimal (menit)
                </label>
                <input
                  type="number"
                  defaultValue="60"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interval Panggilan (detik)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCall"
                  defaultChecked
                  className="mr-2"
                />
                <label htmlFor="autoCall" className="text-sm text-gray-700 dark:text-gray-300">
                  Panggilan Otomatis
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="skipOnNoShow"
                  className="mr-2"
                />
                <label htmlFor="skipOnNoShow" className="text-sm text-gray-700 dark:text-gray-300">
                  Lewati Jika Tidak Hadir
                </label>
              </div>

              <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
                Simpan Pengaturan
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Cepat</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pasien Dilayani</span>
                <span className="font-bold">201</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Layanan</span>
                <span className="font-bold">8.5 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tingkat Kepuasan</span>
                <span className="font-bold text-green-600">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Antrian Terlama</span>
                <span className="font-bold text-orange-600">45 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
