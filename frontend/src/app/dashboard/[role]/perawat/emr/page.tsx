'use client'

import { useState, useEffect } from 'react'
import {
  MdLocalHospital,
  MdSearch,
  MdPerson,
  MdMedicalServices,
  MdMedication,
  MdAssessment,
  MdTimeline,
  MdRefresh,
  MdVisibility,
  MdEdit,
  MdPrint,
  MdAccessTime,
  MdInfo,
  MdWarning,
  MdCheckCircle,
  MdCancel,
  MdDescription,
  MdCalendarToday,
  MdHealing,
  MdFilterList,
  MdDateRange,
  MdClear,
  MdNotes,
  MdAssignment
} from 'react-icons/md'
import apiData from '@/lib/apiData'

interface Patient {
  id: number
  name: string
  mrn: string
  birth_date: string
  gender: string
  address?: string
  phone?: string
}

interface Doctor {
  id: number
  name: string
  specialization?: string
}

interface Registration {
  id: number
  no_registrasi: string
  poli?: {
    nama_poli: string
  }
}

interface Examination {
  id: number
  registration_id: number
  doctor_id: number
  patient_id: number
  tanggal_pemeriksaan: string
  status: 'draft' | 'completed' | 'cancelled'
  keluhan_utama?: string
  riwayat_penyakit_sekarang?: string
  riwayat_penyakit_dahulu?: string
  riwayat_penyakit_keluarga?: string
  riwayat_alergi?: string
  riwayat_pengobatan?: string
  tanda_vital?: {
    blood_pressure?: string
    heart_rate?: string
    temperature?: string
    respiration_rate?: string
    oxygen_saturation?: string
    weight?: string
    height?: string
    bmi?: number
  }
  keadaan_umum?: string
  kesadaran?: string
  diagnosis?: any[]
  diagnosis_utama?: string
  diagnosis_sekunder?: string
  diagnosis_banding?: string
  tindakan?: any[]
  terapi?: any[]
  rencana_tindak_lanjut?: string
  tanggal_kontrol?: string
  instruksi_pasien?: string
  catatan_dokter?: string
  doctor?: Doctor
  patient?: Patient
  registration?: Registration
  created_at: string
  updated_at: string
}

export default function EMRPage() {
  const [examinations, setExaminations] = useState<Examination[]>([])
  const [filteredExaminations, setFilteredExaminations] = useState<Examination[]>([])
  const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft' | 'cancelled'>('completed')
  const [dateFilter, setDateFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'anamnesis' | 'physical' | 'diagnosis' | 'treatment'>('overview')

  useEffect(() => {
    fetchExaminations()
  }, [])

  useEffect(() => {
    filterExaminations()
  }, [examinations, searchTerm, statusFilter, dateFilter])

  const fetchExaminations = async () => {
    try {
      setLoading(true)
      // Get all completed examinations for nursing access
      const response = await apiData.get('/examinations?status=completed&include=doctor,patient,registration')
      if (response.data.success) {
        setExaminations(response.data.data.data || response.data.data)
      }
    } catch (error) {
      console.error('Error fetching examinations:', error)
      // Fallback to mock data if API fails
      setExaminations([])
    } finally {
      setLoading(false)
    }
  }

  const filterExaminations = () => {
    let filtered = examinations

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.patient?.mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.registration?.no_registrasi?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(exam =>
        exam.tanggal_pemeriksaan?.startsWith(dateFilter)
      )
    }

    setFilteredExaminations(filtered)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'draft': return 'Draft'
      case 'cancelled': return 'Dibatalkan'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Akses EMR
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Electronic Medical Record - Rekam Medis Elektronik
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchExaminations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Cari nama pasien, MRN, dokter, atau no registrasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full lg:w-48">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'completed' || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('completed')
                setDateFilter('')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <MdClear className="text-lg" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Examination List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hasil Pemeriksaan ({filteredExaminations.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Memuat data...
                </div>
              ) : filteredExaminations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada hasil pemeriksaan ditemukan
                </div>
              ) : (
                filteredExaminations.map((examination) => (
                  <div
                    key={examination.id}
                    onClick={() => setSelectedExamination(examination)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                      selectedExamination?.id === examination.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <MdPerson className="text-blue-600 dark:text-blue-400 text-lg" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {examination.patient?.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {examination.patient?.mrn}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(examination.status)}`}>
                        {getStatusText(examination.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <p>Dokter: {examination.doctor?.name}</p>
                      <p>Poli: {examination.registration?.poli?.nama_poli}</p>
                      <p>{formatDate(examination.tanggal_pemeriksaan)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Examination Details */}
        <div className="lg:col-span-2">
          {selectedExamination ? (
            <div className="space-y-6">
              {/* Patient Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <MdPerson className="text-blue-600 dark:text-blue-400 text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedExamination.patient?.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        MRN: {selectedExamination.patient?.mrn} | No. Reg: {selectedExamination.registration?.no_registrasi}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {calculateAge(selectedExamination.patient?.birth_date || '')} tahun, {selectedExamination.patient?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Dokter: {selectedExamination.doctor?.name} | Poli: {selectedExamination.registration?.poli?.nama_poli}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <MdPrint className="text-lg" />
                      Print EMR
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6">
                  {[
                    { id: 'overview', label: 'Ringkasan', icon: MdInfo },
                    { id: 'anamnesis', label: 'Anamnesis', icon: MdNotes },
                    { id: 'physical', label: 'Pemeriksaan Fisik', icon: MdHealing },
                    { id: 'diagnosis', label: 'Diagnosis', icon: MdAssignment },
                    { id: 'treatment', label: 'Tindakan & Terapi', icon: MdMedicalServices }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="text-lg" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Vital Signs */}
                  {selectedExamination.tanda_vital && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MdTimeline className="text-blue-500 text-lg" />
                        Tanda Vital
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tekanan Darah</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedExamination.tanda_vital.blood_pressure || '-'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Detak Jantung</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedExamination.tanda_vital.heart_rate || '-'} bpm
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Suhu</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedExamination.tanda_vital.temperature || '-'}°C
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">SpO2</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedExamination.tanda_vital.oxygen_saturation || '-'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Diagnosis Summary */}
                  {(selectedExamination.diagnosis_utama || selectedExamination.diagnosis_sekunder) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MdAssignment className="text-green-500 text-lg" />
                        Diagnosis
                      </h3>
                      {selectedExamination.diagnosis_utama && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis Utama:</p>
                          <p className="text-gray-900 dark:text-white">{selectedExamination.diagnosis_utama}</p>
                        </div>
                      )}
                      {selectedExamination.diagnosis_sekunder && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis Sekunder:</p>
                          <p className="text-gray-900 dark:text-white">{selectedExamination.diagnosis_sekunder}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Treatment Summary */}
                  {(selectedExamination.tindakan || selectedExamination.terapi) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MdMedicalServices className="text-purple-500 text-lg" />
                        Tindakan & Terapi
                      </h3>
                      {selectedExamination.tindakan && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tindakan:</p>
                          <p className="text-gray-900 dark:text-white">{selectedExamination.tindakan}</p>
                        </div>
                      )}
                      {selectedExamination.terapi && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Terapi:</p>
                          <p className="text-gray-900 dark:text-white">{selectedExamination.terapi}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'anamnesis' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MdNotes className="text-blue-500 text-lg" />
                      Riwayat Anamnesis
                    </h3>
                    <div className="space-y-4">
                      {selectedExamination.keluhan_utama && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Keluhan Utama</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.keluhan_utama}</p>
                        </div>
                      )}
                      {selectedExamination.riwayat_penyakit_sekarang && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Riwayat Penyakit Sekarang</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.riwayat_penyakit_sekarang}</p>
                        </div>
                      )}
                      {selectedExamination.riwayat_penyakit_dahulu && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Riwayat Penyakit Dahulu</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.riwayat_penyakit_dahulu}</p>
                        </div>
                      )}
                      {selectedExamination.riwayat_penyakit_keluarga && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Riwayat Penyakit Keluarga</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.riwayat_penyakit_keluarga}</p>
                        </div>
                      )}
                      {selectedExamination.riwayat_alergi && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Riwayat Alergi</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.riwayat_alergi}</p>
                        </div>
                      )}
                      {selectedExamination.riwayat_pengobatan && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Riwayat Pengobatan</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.riwayat_pengobatan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'physical' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MdHealing className="text-green-500 text-lg" />
                      Pemeriksaan Fisik
                    </h3>
                    <div className="space-y-4">
                      {selectedExamination.keadaan_umum && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Keadaan Umum</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.keadaan_umum}</p>
                        </div>
                      )}
                      {selectedExamination.kesadaran && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Kesadaran</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.kesadaran}</p>
                        </div>
                      )}
                      {selectedExamination.catatan_dokter && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Catatan Dokter</h4>
                          <p className="text-blue-700 dark:text-blue-300">{selectedExamination.catatan_dokter}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'diagnosis' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MdAssignment className="text-green-500 text-lg" />
                      Diagnosis Lengkap
                    </h3>
                    <div className="space-y-4">
                      {selectedExamination.diagnosis_utama && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Diagnosis Utama</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.diagnosis_utama}</p>
                        </div>
                      )}
                      {selectedExamination.diagnosis_sekunder && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Diagnosis Sekunder</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.diagnosis_sekunder}</p>
                        </div>
                      )}
                      {selectedExamination.diagnosis_banding && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Diagnosis Banding</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.diagnosis_banding}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'treatment' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MdMedicalServices className="text-purple-500 text-lg" />
                      Tindakan & Rencana Terapi
                    </h3>
                    <div className="space-y-4">
                      {selectedExamination.tindakan && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tindakan</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.tindakan}</p>
                        </div>
                      )}
                      {selectedExamination.terapi && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Terapi</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.terapi}</p>
                        </div>
                      )}
                      {selectedExamination.rencana_tindak_lanjut && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rencana Tindak Lanjut</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedExamination.rencana_tindak_lanjut}</p>
                        </div>
                      )}
                      {selectedExamination.tanggal_kontrol && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tanggal Kontrol</h4>
                          <p className="text-gray-600 dark:text-gray-400">{new Date(selectedExamination.tanggal_kontrol).toLocaleDateString('id-ID')}</p>
                        </div>
                      )}
                      {selectedExamination.instruksi_pasien && (
                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Instruksi untuk Pasien</h4>
                          <p className="text-green-700 dark:text-green-300">{selectedExamination.instruksi_pasien}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <MdLocalHospital className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Pilih Hasil Pemeriksaan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Klik pada hasil pemeriksaan di sebelah kiri untuk melihat detail lengkap
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
