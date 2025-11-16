'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaHospital, FaUserMd, FaFileMedical, FaCheckCircle, FaClock, FaExclamationTriangle, FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaDownload, FaUpload } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from '@/lib/toast'
import apiData from '@/lib/apiData'

// Types
interface Referral {
  id: number
  patient_id: number
  doctor_id: number
  from_hospital: string
  to_hospital: string
  referral_reason: string
  urgency_level: 'darurat' | 'urgent' | 'elektif'
  specialty: string
  medical_summary: string
  diagnostic_results?: string
  treatment_history?: string
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'selesai'
  approval_notes?: string
  rejection_reason?: string
  completion_notes?: string
  approved_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  patient: {
    id: number
    mrn: string
    name: string
  }
  doctor: {
    id: number
    name: string
  }
  approvedBy?: {
    id: number
    name: string
  }
}

interface ReferralStats {
  total_referrals: number
  pending: number
  approved: number
  rejected: number
  completed: number
  emergency: number
  by_specialty: Record<string, number>
  by_hospital: Record<string, number>
  average_approval_time: number | null
}

interface ReferralFormData {
  patient_id: number
  doctor_id: number
  from_hospital: string
  to_hospital: string
  referral_reason: string
  urgency_level: 'darurat' | 'urgent' | 'elektif'
  specialty: string
  medical_summary: string
  diagnostic_results?: string
  treatment_history?: string
  attachments?: File[]
}

export default function SistemRujukanPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'pending' | 'emergency'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [showModal, setShowModal] = useState<'view' | 'edit' | 'approve' | 'create' | null>(null)
  const [formData, setFormData] = useState<ReferralFormData>({
    patient_id: 0,
    doctor_id: 0,
    from_hospital: '',
    to_hospital: '',
    referral_reason: '',
    urgency_level: 'elektif',
    specialty: '',
    medical_summary: '',
    diagnostic_results: '',
    treatment_history: '',
  })

  const queryClient = useQueryClient()

  // Fetch referrals
  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ['referrals', searchTerm, statusFilter, urgencyFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (urgencyFilter !== 'all') params.append('urgency_level', urgencyFilter)

      const response = await apiData.get(`/referrals?${params}`)
      return response.data
    }
  })

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const response = await apiData.get('/referrals/statistics')
      return response.data.data as ReferralStats
    }
  })

  // Fetch pending referrals
  const { data: pendingReferrals } = useQuery({
    queryKey: ['referrals-pending'],
    queryFn: async () => {
      const response = await apiData.get('/referrals/pending')
      return response.data.data
    },
    enabled: activeTab === 'pending'
  })

  // Fetch emergency referrals
  const { data: emergencyReferrals } = useQuery({
    queryKey: ['referrals-emergency'],
    queryFn: async () => {
      const response = await apiData.get('/referrals/emergency')
      return response.data.data
    },
    enabled: activeTab === 'emergency'
  })

  // Create referral mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiData.post('/referrals', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
      toast.success('Rujukan berhasil dibuat')
      setShowModal(null)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat rujukan')
    }
  })

  // Update referral mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: FormData }) => {
      const response = await apiData.post(`/referrals/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      toast.success('Rujukan berhasil diperbarui')
      setShowModal(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui rujukan')
    }
  })

  // Approve/Reject referral mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, action, notes, rejectionReason }: {
      id: number, action: 'approve' | 'reject', notes?: string, rejectionReason?: string
    }) => {
      const response = await apiData.patch(`/referrals/${id}/approve`, {
        action,
        approval_notes: notes,
        rejection_reason: rejectionReason
      })
      return response.data
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
      queryClient.invalidateQueries({ queryKey: ['referrals-pending'] })
      queryClient.invalidateQueries({ queryKey: ['referrals-emergency'] })
      toast.success(`Rujukan berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`)
      setShowModal(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memproses rujukan')
    }
  })

  // Complete referral mutation
  const completeMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number, notes?: string }) => {
      const response = await apiData.patch(`/referrals/${id}/complete`, {
        completion_notes: notes
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
      toast.success('Rujukan berhasil diselesaikan')
      setShowModal(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyelesaikan rujukan')
    }
  })

  // Delete referral mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiData.delete(`/referrals/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
      toast.success('Rujukan berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus rujukan')
    }
  })

  const resetForm = () => {
    setFormData({
      patient_id: 0,
      doctor_id: 0,
      from_hospital: '',
      to_hospital: '',
      referral_reason: '',
      urgency_level: 'elektif',
      specialty: '',
      medical_summary: '',
      diagnostic_results: '',
      treatment_history: '',
    })
  }

  const handleCreate = () => {
    setShowModal('create')
    resetForm()
  }

  const handleEdit = (referral: Referral) => {
    setSelectedReferral(referral)
    setFormData({
      patient_id: referral.patient_id,
      doctor_id: referral.doctor_id,
      from_hospital: referral.from_hospital,
      to_hospital: referral.to_hospital,
      referral_reason: referral.referral_reason,
      urgency_level: referral.urgency_level,
      specialty: referral.specialty,
      medical_summary: referral.medical_summary,
      diagnostic_results: referral.diagnostic_results || '',
      treatment_history: referral.treatment_history || '',
    })
    setShowModal('edit')
  }

  const handleView = (referral: Referral) => {
    setSelectedReferral(referral)
    setShowModal('view')
  }

  const handleApprove = (referral: Referral) => {
    setSelectedReferral(referral)
    setShowModal('approve')
  }

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        value.forEach((file, index) => {
          formDataToSend.append(`attachments[${index}]`, file)
        })
      } else if (value !== '' && value !== 0) {
        formDataToSend.append(key, value.toString())
      }
    })

    if (showModal === 'create') {
      createMutation.mutate(formDataToSend)
    } else if (showModal === 'edit' && selectedReferral) {
      updateMutation.mutate({ id: selectedReferral.id, data: formDataToSend })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Disetujui
        </span>
      case 'menunggu':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaClock className="text-xs" />
          Menunggu
        </span>
      case 'ditolak':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Ditolak
        </span>
      case 'selesai':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Selesai
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'darurat':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Darurat</span>
      case 'urgent':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-full text-xs font-medium">Urgent</span>
      case 'elektif':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">Elektif</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{urgency}</span>
    }
  }

  const currentReferrals = activeTab === 'pending' ? (pendingReferrals?.data || []) :
                          activeTab === 'emergency' ? (emergencyReferrals?.data || []) :
                          (referralsData?.data?.data || [])

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3">
          <FaHospital className="text-blue-500" />
          <span className="truncate">Sistem Rujukan</span>
        </h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition"
        >
          <FaPlus className="text-sm" />
          Buat Rujukan Baru
        </button>
      </div>

      {/* Statistics Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rujukan</p>
                <p className="text-2xl font-bold">{statsData.total_referrals}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">hari ini</p>
              </div>
              <FaFileMedical className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu Approval</p>
                <p className="text-2xl font-bold">{statsData.pending}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">kasus aktif</p>
              </div>
              <FaClock className="text-2xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disetujui</p>
                <p className="text-2xl font-bold">{statsData.approved}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">hari ini</p>
              </div>
              <FaCheckCircle className="text-2xl text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kasus Darurat</p>
                <p className="text-2xl font-bold">{statsData.emergency}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">perlu perhatian</p>
              </div>
              <FaExclamationTriangle className="text-2xl text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'list', label: 'Semua Rujukan', icon: FaFileMedical },
            { key: 'pending', label: 'Menunggu Approval', icon: FaClock },
            { key: 'emergency', label: 'Kasus Darurat', icon: FaExclamationTriangle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeTab === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="text-sm" />
              {label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien, rumah sakit, atau spesialis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Urgensi</option>
              <option value="darurat">Darurat</option>
              <option value="urgent">Urgent</option>
              <option value="elektif">Elektif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold">
            {activeTab === 'pending' ? 'Rujukan Menunggu Approval' :
             activeTab === 'emergency' ? 'Rujukan Kasus Darurat' :
             'Daftar Rujukan'}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentReferrals?.length || 0} rujukan
          </span>
        </div>

        {referralsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">MRN</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">RS Asal</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">RS Tujuan</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Spesialis</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Urgensi</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 dark:text-gray-200">
                {currentReferrals?.map((referral: Referral) => (
                  <tr key={referral.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 font-mono text-sm">{referral.patient.mrn}</td>
                    <td className="px-4 py-3 font-medium">{referral.patient.name}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={referral.from_hospital}>{referral.from_hospital}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={referral.to_hospital}>{referral.to_hospital}</td>
                    <td className="px-4 py-3">{referral.specialty}</td>
                    <td className="px-4 py-3">{getUrgencyBadge(referral.urgency_level)}</td>
                    <td className="px-4 py-3">{getStatusBadge(referral.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(referral.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleView(referral)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                          title="Lihat Detail"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        {referral.status === 'menunggu' && (
                          <>
                            <button
                              onClick={() => handleEdit(referral)}
                              className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm flex items-center gap-1"
                              title="Edit"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleApprove(referral)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center gap-1"
                              title="Approve/Reject"
                            >
                              <FaCheck className="text-xs" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus rujukan ini?')) {
                                  deleteMutation.mutate(referral.id)
                                }
                              }}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm flex items-center gap-1"
                              title="Hapus"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </>
                        )}
                        {referral.status === 'disetujui' && (
                          <button
                            onClick={() => {
                              const notes = prompt('Catatan penyelesaian:')
                              if (notes !== null) {
                                completeMutation.mutate({ id: referral.id, notes })
                              }
                            }}
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                            title="Selesaikan"
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {showModal === 'create' && 'Buat Rujukan Baru'}
                  {showModal === 'edit' && 'Edit Rujukan'}
                  {showModal === 'view' && 'Detail Rujukan'}
                  {showModal === 'approve' && 'Approval Rujukan'}
                </h3>
                <button
                  onClick={() => setShowModal(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {showModal === 'view' && selectedReferral && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Informasi Pasien</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>MRN:</strong> {selectedReferral.patient.mrn}</p>
                        <p><strong>Nama:</strong> {selectedReferral.patient.name}</p>
                        <p><strong>Dokter:</strong> {selectedReferral.doctor.name}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Informasi Rujukan</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>RS Asal:</strong> {selectedReferral.from_hospital}</p>
                        <p><strong>RS Tujuan:</strong> {selectedReferral.to_hospital}</p>
                        <p><strong>Spesialis:</strong> {selectedReferral.specialty}</p>
                        <p><strong>Urgensi:</strong> {getUrgencyBadge(selectedReferral.urgency_level)}</p>
                        <p><strong>Status:</strong> {getStatusBadge(selectedReferral.status)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Alasan Rujukan</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">{selectedReferral.referral_reason}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Ringkasan Medis</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">{selectedReferral.medical_summary}</p>
                  </div>

                  {selectedReferral.diagnostic_results && (
                    <div>
                      <h4 className="font-semibold mb-2">Hasil Diagnostik</h4>
                      <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">{selectedReferral.diagnostic_results}</p>
                    </div>
                  )}

                  {selectedReferral.treatment_history && (
                    <div>
                      <h4 className="font-semibold mb-2">Riwayat Pengobatan</h4>
                      <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">{selectedReferral.treatment_history}</p>
                    </div>
                  )}

                  {selectedReferral.approval_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Catatan Approval</h4>
                      <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">{selectedReferral.approval_notes}</p>
                    </div>
                  )}

                  {selectedReferral.rejection_reason && (
                    <div>
                      <h4 className="font-semibold mb-2">Alasan Penolakan</h4>
                      <p className="text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded text-red-700 dark:text-red-300">{selectedReferral.rejection_reason}</p>
                    </div>
                  )}
                </div>
              )}

              {(showModal === 'create' || showModal === 'edit') && (
                <form onSubmit={submitForm} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">ID Pasien</label>
                      <input
                        type="number"
                        value={formData.patient_id}
                        onChange={(e) => setFormData({...formData, patient_id: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ID Dokter</label>
                      <input
                        type="number"
                        value={formData.doctor_id}
                        onChange={(e) => setFormData({...formData, doctor_id: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rumah Sakit Asal</label>
                      <input
                        type="text"
                        value={formData.from_hospital}
                        onChange={(e) => setFormData({...formData, from_hospital: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rumah Sakit Tujuan</label>
                      <input
                        type="text"
                        value={formData.to_hospital}
                        onChange={(e) => setFormData({...formData, to_hospital: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Spesialis</label>
                      <input
                        type="text"
                        value={formData.specialty}
                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tingkat Urgensi</label>
                      <select
                        value={formData.urgency_level}
                        onChange={(e) => setFormData({...formData, urgency_level: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      >
                        <option value="elektif">Elektif</option>
                        <option value="urgent">Urgent</option>
                        <option value="darurat">Darurat</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alasan Rujukan</label>
                    <textarea
                      value={formData.referral_reason}
                      onChange={(e) => setFormData({...formData, referral_reason: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ringkasan Medis</label>
                    <textarea
                      value={formData.medical_summary}
                      onChange={(e) => setFormData({...formData, medical_summary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hasil Diagnostik</label>
                    <textarea
                      value={formData.diagnostic_results}
                      onChange={(e) => setFormData({...formData, diagnostic_results: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Riwayat Pengobatan</label>
                    <textarea
                      value={formData.treatment_history}
                      onChange={(e) => setFormData({...formData, treatment_history: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(null)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (showModal === 'create' ? 'Buat Rujukan' : 'Update Rujukan')}
                    </button>
                  </div>
                </form>
              )}

              {showModal === 'approve' && selectedReferral && (
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Konfirmasi Approval</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Apakah Anda ingin menyetujui atau menolak rujukan pasien <strong>{selectedReferral.patient.name}</strong>?
                    </p>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => approveMutation.mutate({
                        id: selectedReferral.id,
                        action: 'reject',
                        rejectionReason: 'Ditolak oleh sistem'
                      })}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      disabled={approveMutation.isPending}
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => approveMutation.mutate({
                        id: selectedReferral.id,
                        action: 'approve',
                        notes: 'Disetujui oleh sistem'
                      })}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                      disabled={approveMutation.isPending}
                    >
                      Setujui
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
