'use client'

import { useState, useEffect } from 'react'
import apiData from '@/lib/apiData'
import {
  MdPeople,
  MdSearch,
  MdRefresh,
  MdCall,
  MdSkipNext,
  MdDone,
  MdSchedule,
  MdLocalHospital,
  MdPerson,
  MdAccessTime,
  MdQueue,
  MdPlayArrow,
  MdPause,
  MdStop,
  MdVolumeUp,
  MdSettings
} from 'react-icons/md'
const { isLoggedIn } = { isLoggedIn: true }; // Simplified for now

interface QueueItem {
  id: number
  queueNumber: string
  patientId: number
  patientName: string
  medicalRecordNumber: string
  age: number
  gender: 'male' | 'female'
  polyclinic: string
  doctor: string
  appointmentTime: string
  arrivalTime?: string
  status: 'menunggu' | 'dipanggil' | 'sedang_diperiksa' | 'selesai' | 'batal'
  priority: 'normal' | 'urgent' | 'vip'
  estimatedWaitTime: string
  notes?: string
  registration_no: string
  service_unit: string
}

interface PolyclinicFromAPI {
  id: string
  name: string
  totalWaiting: number
  totalServed: number
  status: 'active' | 'break' | 'closed'
  currentQueue?: QueueItem
  nextQueue?: QueueItem
}

interface Polyclinic {
  id: string
  name: string
  currentQueue?: QueueItem
  nextQueue?: QueueItem
  totalWaiting: number
  totalServed: number
  status: 'active' | 'break' | 'closed'
}

export default function AntrianPoliPage() {
  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([])
  const [selectedPolyclinic, setSelectedPolyclinic] = useState<Polyclinic | null>(null)
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'menunggu' | 'dipanggil' | 'sedang_diperiksa' | 'selesai'>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [autoCall, setAutoCall] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  useEffect(() => {
    fetchPolyclinics()
    fetchQueueItems()
  }, [])

  useEffect(() => {
    if (selectedPolyclinic) {
      fetchQueueItems(selectedPolyclinic.id)
    }
  }, [selectedPolyclinic])

  const fetchPolyclinics = async () => {
    try {
      setLoading(true)
      const response = await apiData.get('/nursing-queue/polyclinics')

      if (response.data.success) {
        setPolyclinics(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch polyclinics')
      }
    } catch (error: any) {
      console.error('Error fetching polyclinics:', error.response?.data || error.message)
      // Fallback to empty array
      setPolyclinics([])
    } finally {
      setLoading(false)
    }
  }

  const fetchQueueItems = async (polyclinicId?: string) => {
    if (!polyclinicId) return

    try {
      const response = await apiData.get(`/nursing-queue/${polyclinicId}`)

      if (response.data.success) {
        setQueueItems(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch queue items')
      }
    } catch (error: any) {
      console.error('Error fetching queue items:', error.response?.data || error.message)
      setQueueItems([])
    }
  }

  const filteredQueueItems = queueItems.filter(item => {
    const matchesSearch = item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.queueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
      case 'dipanggil':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'sedang_diperiksa':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'selesai':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      case 'batal':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'menunggu': return 'Menunggu'
      case 'dipanggil': return 'Dipanggil'
      case 'sedang_diperiksa': return 'Sedang Diperiksa'
      case 'selesai': return 'Selesai'
      case 'batal': return 'Dibatalkan'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent'
      case 'vip': return 'VIP'
      default: return 'Normal'
    }
  }

  const getPolyclinicStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'break':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const handleCallNext = async (polyclinic: Polyclinic) => {
    try {
      const response = await apiData.post(`/nursing-queue/${polyclinic.id}/call-next`, {})

      if (response.data.success) {
        // Refresh data
        fetchQueueItems(selectedPolyclinic?.id)

        if (voiceEnabled) {
          // Voice announcement implementation
          const nextPatient = response.data.data.patient
          if (nextPatient) {
            const speech = new SpeechSynthesisUtterance()
            speech.text = `Nomor antrian ${nextPatient.queueNumber}, ${nextPatient.patientName}, silakan ke poliklinik ${polyclinic.name}`
            speech.lang = 'id-ID' // Indonesian
            speech.rate = 0.8
            speech.volume = 1

            // Use speech synthesis
            if ('speechSynthesis' in window) {
              window.speechSynthesis.speak(speech)
            }
          }
        }
      } else {
        alert(`Error: ${response.data.message}`)
      }
    } catch (error: any) {
      console.error('Error calling next patient:', error.response?.data || error.message)
      alert('Failed to call next patient')
    }
  }

  const handleSkipPatient = async (queueItem: QueueItem) => {
    try {
      const response = await apiData.post(`/nursing-queue/${queueItem.id}/skip`, {})

      if (response.data.success) {
        // Refresh data
        fetchQueueItems(selectedPolyclinic?.id)
      } else {
        alert(`Error: ${response.data.message}`)
      }
    } catch (error: any) {
      console.error('Error skipping patient:', error.response?.data || error.message)
      alert('Failed to skip patient')
    }
  }

  const handleCompleteService = async (queueItem: QueueItem) => {
    try {
      const response = await apiData.post(`/nursing-queue/${queueItem.id}/complete`, {})

      if (response.data.success) {
        // Refresh data
        fetchQueueItems(selectedPolyclinic?.id)
      } else {
        alert(`Error: ${response.data.message}`)
      }
    } catch (error: any) {
      console.error('Error completing service:', error.response?.data || error.message)
      alert('Failed to complete service')
    }
  }

  const handleRecallPatient = async (queueItem: QueueItem) => {
    try {
      const response = await apiData.post(`/nursing-queue/${queueItem.id}/recall`, {})

      if (response.data.success) {
        // Refresh data
        fetchQueueItems(selectedPolyclinic?.id)

        if (voiceEnabled) {
          // Voice announcement for recall
          const speech = new SpeechSynthesisUtterance()
          speech.text = `Pengingat nomor antrian ${queueItem.queueNumber}, ${queueItem.patientName}`
          speech.lang = 'id-ID'
          speech.rate = 0.8
          speech.volume = 1

          if ('speechSynthesis' in window) {
            window.speechSynthesis.speak(speech)
          }
        }
      } else {
        alert(`Error: ${response.data.message}`)
      }
    } catch (error: any) {
      console.error('Error recalling patient:', error.response?.data || error.message)
      alert('Failed to recall patient')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Antrian Poli
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manajemen antrian pasien di poliklinik
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MdSettings className="text-lg" />
            Pengaturan
          </button>
          <button
            onClick={() => { fetchPolyclinics(); fetchQueueItems(); }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Polyclinic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {polyclinics.map((poli) => (
          <div
            key={poli.id}
            onClick={() => setSelectedPolyclinic(poli)}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-all ${
              selectedPolyclinic?.id === poli.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{poli.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPolyclinicStatusColor(poli.status)}`}>
                {poli.status === 'active' ? 'Aktif' : poli.status === 'break' ? 'Istirahat' : 'Tutup'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Menunggu:</span>
                <span className="font-medium text-gray-900 dark:text-white">{poli.totalWaiting}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Dilayani:</span>
                <span className="font-medium text-gray-900 dark:text-white">{poli.totalServed}</span>
              </div>

              {poli.currentQueue && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xs text-green-600 dark:text-green-400 mb-1">Sedang Dilayani</div>
                  <div className="font-medium text-green-800 dark:text-green-200">{poli.currentQueue.queueNumber}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">{poli.currentQueue.patientName}</div>
                </div>
              )}

              {poli.nextQueue && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Selanjutnya</div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">{poli.nextQueue.queueNumber}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">{poli.nextQueue.patientName}</div>
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleCallNext(poli); }}
                disabled={poli.status !== 'active'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <MdCall className="text-lg" />
                Panggil Selanjutnya
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Queue Management */}
      {selectedPolyclinic && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Antrian {selectedPolyclinic.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPolyclinic.totalWaiting} pasien menunggu, {selectedPolyclinic.totalServed} sudah dilayani
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Auto Call:</label>
                  <button
                    onClick={() => setAutoCall(!autoCall)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoCall ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoCall ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Voice:</label>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      voiceEnabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                    }`}
                  >
                    <MdVolumeUp className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Cari pasien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="dipanggil">Dipanggil</option>
                  <option value="sedang_diperiksa">Sedang Diperiksa</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Queue List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredQueueItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.queueNumber}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.patientName}</h3>
                        {item.priority !== 'normal' && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                            {getPriorityText(item.priority)}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{item.medicalRecordNumber}</span>
                        <span>{item.age} tahun, {item.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                        <span>{item.doctor}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-1">
                        <span>Janji: {new Date(item.appointmentTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        {item.arrivalTime && (
                          <span>Datang: {new Date(item.arrivalTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <span>Estimasi: {item.estimatedWaitTime}</span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'menunggu' && (
                      <>
                        <button
                          onClick={() => handleRecallPatient(item)}
                          className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MdCall className="text-lg" />
                          Panggil
                        </button>
                        <button
                          onClick={() => handleSkipPatient(item)}
                          className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MdSkipNext className="text-lg" />
                          Lewati
                        </button>
                      </>
                    )}
                    {item.status === 'dipanggil' && (
                      <button
                        onClick={() => handleCompleteService(item)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <MdDone className="text-lg" />
                        Selesai
                      </button>
                    )}
                    {item.status === 'sedang_diperiksa' && (
                      <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-sm">
                        <MdPlayArrow className="text-lg" />
                        Sedang Dilayani
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredQueueItems.length === 0 && (
            <div className="p-12 text-center">
              <MdQueue className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Tidak ada antrian
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Belum ada pasien dalam antrian untuk poliklinik ini
              </p>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pengaturan Antrian
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdSettings className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Auto Call</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Otomatis panggil pasien berikutnya</p>
                </div>
                <button
                  onClick={() => setAutoCall(!autoCall)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoCall ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoCall ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Voice Announcement</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Aktifkan pengumuman suara</p>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    voiceEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdPeople className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Antrian</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {queueItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdSchedule className="text-yellow-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {queueItems.filter(q => q.status === 'menunggu').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdCall className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dipanggil</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {queueItems.filter(q => q.status === 'dipanggil').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdDone className="text-green-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {queueItems.filter(q => q.status === 'selesai').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
