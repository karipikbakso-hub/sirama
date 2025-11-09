'use client'

import { useState, useEffect } from 'react'
import {
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaPaperPlane,
  FaPhone,
  FaEnvelope,
  FaSms
} from 'react-icons/fa'
import { useAuthContext } from '@/hooks/AuthContext'
import api from '@/lib/apiAuth'

// Types
type PatientCommunication = {
  id: number
  patient_id: number
  communication_type: 'email' | 'sms' | 'phone' | 'whatsapp'
  subject?: string
  message: string
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  sent_at?: string
  delivered_at?: string
  created_by: number
  created_at: string
  patient?: {
    id: number
    name: string
    phone?: string
    email?: string
  }
  creator?: {
    id: number
    name: string
  }
}

type Statistics = {
  total_sent: number
  total_delivered: number
  total_failed: number
  total_pending: number
  by_type: {
    email: number
    sms: number
    phone: number
    whatsapp: number
  }
}

export default function NotificationsPage() {
  const { user } = useAuthContext()
  const [communications, setCommunications] = useState<PatientCommunication[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCommunication, setEditingCommunication] = useState<PatientCommunication | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    patient_id: '',
    communication_type: 'sms' as 'email' | 'sms' | 'phone' | 'whatsapp',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadCommunications()
    loadStatistics()
  }, [])

  // Load communications
  const loadCommunications = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/patient-communications')
      if (response.data.success) {
        setCommunications(response.data.data.data || [])
      }
    } catch (err: any) {
      setError('Failed to load communications')
      console.error('Error loading communications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await api.get('/api/patient-communications/statistics')
      if (response.data.success) {
        setStatistics(response.data.data)
      }
    } catch (err: any) {
      console.error('Error loading statistics:', err)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = editingCommunication
        ? await api.put(`/api/patient-communications/${editingCommunication.id}`, formData)
        : await api.post('/api/patient-communications', formData)

      if (response.data.success) {
        setSuccess(`Komunikasi ${editingCommunication ? 'diupdate' : 'dikirim'} berhasil`)
        loadCommunications()
        loadStatistics()

        // Reset form
        setShowForm(false)
        setEditingCommunication(null)
        setFormData({
          patient_id: '',
          communication_type: 'sms',
          subject: '',
          message: ''
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan')
      console.error('Error submitting form:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus komunikasi ini?')) return

    try {
      const response = await api.delete(`/api/patient-communications/${id}`)
      if (response.data.success) {
        setSuccess('Komunikasi berhasil dihapus')
        loadCommunications()
        loadStatistics()
      }
    } catch (err: any) {
      setError('Failed to delete communication')
      console.error('Error deleting communication:', err)
    }
  }

  // Filter communications based on search
  const filteredCommunications = communications.filter(comm =>
    comm.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600 bg-blue-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Terkirim'
      case 'delivered': return 'Diterima'
      case 'failed': return 'Gagal'
      case 'pending': return 'Menunggu'
      default: return status
    }
  }

  // Get communication type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <FaEnvelope className="text-blue-500" />
      case 'sms': return <FaSms className="text-green-500" />
      case 'phone': return <FaPhone className="text-purple-500" />
      case 'whatsapp': return <FaPaperPlane className="text-teal-500" />
      default: return <FaBell className="text-gray-500" />
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaBell className="text-blue-500" />
        <span>Komunikasi Pasien</span>
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{statistics?.total_sent || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Terkirim</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{statistics?.total_delivered || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Diterima</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">{statistics?.total_pending || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Menunggu</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">{statistics?.total_failed || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Gagal</div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2">
          <FaExclamationTriangle className="text-red-600" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          <span className="text-green-800 dark:text-green-200">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Riwayat Komunikasi</h2>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <FaPlus />
                Kirim Pesan
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari komunikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <FaSpinner className="mx-auto text-2xl text-blue-500 animate-spin mb-2" />
                <p>Loading communications...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredCommunications.map((comm) => (
                  <div key={comm.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                      {getTypeIcon(comm.communication_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {comm.patient?.name || 'Pasien Tidak Diketahui'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>
                          {getStatusText(comm.status)}
                        </span>
                      </div>
                      {comm.subject && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {comm.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {comm.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {formatDate(comm.created_at).date} {formatDate(comm.created_at).time}
                        </span>
                        <span>{comm.communication_type.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setEditingCommunication(comm)
                          setFormData({
                            patient_id: comm.patient_id.toString(),
                            communication_type: comm.communication_type,
                            subject: comm.subject || '',
                            message: comm.message
                          })
                          setShowForm(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(comm.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredCommunications.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Tidak ada data komunikasi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Statistik per Tipe</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <FaEnvelope className="text-blue-500" />
                  Email
                </span>
                <span className="font-bold">{statistics?.by_type.email || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <FaSms className="text-green-500" />
                  SMS
                </span>
                <span className="font-bold">{statistics?.by_type.sms || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <FaPhone className="text-purple-500" />
                  Telepon
                </span>
                <span className="font-bold">{statistics?.by_type.phone || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <FaPaperPlane className="text-teal-500" />
                  WhatsApp
                </span>
                <span className="font-bold">{statistics?.by_type.whatsapp || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Template Pesan</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                <div className="font-medium text-blue-800 dark:text-blue-200">Pengingat Janji Temu</div>
                <div className="text-sm text-blue-600 dark:text-blue-300">Template untuk reminder appointment</div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition">
                <div className="font-medium text-green-800 dark:text-green-200">Konfirmasi Registrasi</div>
                <div className="text-sm text-green-600 dark:text-green-300">Template konfirmasi pendaftaran</div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
                <div className="font-medium text-purple-800 dark:text-purple-200">Info Hasil Pemeriksaan</div>
                <div className="text-sm text-purple-600 dark:text-purple-300">Template untuk hasil lab/radiologi</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingCommunication ? 'Edit Komunikasi' : 'Kirim Pesan Baru'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipe Komunikasi *</label>
                    <select
                      value={formData.communication_type}
                      onChange={(e) => setFormData({...formData, communication_type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      required
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="phone">Telepon</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  {(formData.communication_type === 'email' || formData.communication_type === 'phone') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Subjek</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        placeholder="Masukkan subjek pesan"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Pesan *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      rows={4}
                      placeholder="Masukkan isi pesan"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCommunication(null)
                      setFormData({
                        patient_id: '',
                        communication_type: 'sms',
                        subject: '',
                        message: ''
                      })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    {submitting ? 'Mengirim...' : (editingCommunication ? 'Update' : 'Kirim')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
