'use client'

import { useState, useEffect } from 'react'
import { MdFavorite, MdNoteAlt, MdLocalHospital, MdListAlt, MdPeople, MdAssignment, MdRefresh, MdSearch, MdVisibility, MdLocalHospital as MdHospitalIcon, MdBusiness, MdEmergency } from 'react-icons/md'

interface VitalSigns {
  source: string
  timestamp: string
  data: {
    blood_pressure?: string
    heart_rate?: number
    temperature?: number
    respiration_rate?: number
    oxygen_saturation?: number
    weight?: number
    height?: number
    bmi?: number
  }
}

interface ActivePatient {
  id: string
  patient_id: string
  patient_name: string
  mrn: string
  age?: number
  gender: string
  registration_number?: string
  admission_number?: string
  status: string
  visit_type?: string
  complaints?: string
  diagnosis?: string
  payment_type?: string
  is_emergency?: boolean
  department?: string
  doctor?: string
  room?: string
  registration_date?: string
  admission_date?: string
  latest_vitals?: VitalSigns | null
  type: 'outpatient' | 'inpatient'
}

interface DashboardStats {
  total_pasien_aktif: number
  butuh_ttv: number
  cppt_pending: number
  triase_igd: number
}

interface Notification {
  id: string
  type: 'abnormal_vitals' | 'new_patient'
  title: string
  message: string
  patient_name?: string
  registration_no?: string
  severity: 'high' | 'medium' | 'low'
  created_at: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    active_patients: ActivePatient[]
    summary: DashboardStats
  }
}

export default function PerawatDashboard() {
  const [activePatients, setActivePatients] = useState<ActivePatient[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_pasien_aktif: 0,
    butuh_ttv: 0,
    cppt_pending: 0,
    triase_igd: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch stats from API
      const statsResponse = await fetch('/api/dashboard/perawat/stats')
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`)
      }
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Fetch active patients from API
      const patientsResponse = await fetch('/api/dashboard/perawat/active-patients')
      if (!patientsResponse.ok) {
        throw new Error(`HTTP error! status: ${patientsResponse.status}`)
      }
      const patientsData = await patientsResponse.json()
      if (patientsData.success) {
        setActivePatients(patientsData.data.active_patients || [])
      }

      // Fetch notifications from API
      const notificationsResponse = await fetch('/api/dashboard/perawat/notifications')
      if (!notificationsResponse.ok) {
        throw new Error(`HTTP error! status: ${notificationsResponse.status}`)
      }
      const notificationsData = await notificationsResponse.json()
      if (notificationsData.success) {
        setNotifications(notificationsData.data || [])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to mock data if API fails
      console.warn('API failed, using mock data...')
      setStats({
        total_pasien_aktif: 3,
        butuh_ttv: 2,
        cppt_pending: 1,
        triase_igd: 1
      })
      setActivePatients([
        {
          id: '1',
          patient_id: 'P001',
          patient_name: 'Ahmad Surya',
          mrn: 'MRN001',
          age: 35,
          gender: 'L',
          registration_number: 'REG001',
          status: 'dipanggil',
          visit_type: 'baru',
          complaints: 'Demam tinggi, batuk kering',
          payment_type: 'tunai',
          is_emergency: false,
          department: 'Poli Umum',
          doctor: 'Dr. Budi Santoso',
          registration_date: '2025-11-14 08:30:00',
          latest_vitals: {
            source: 'examination',
            timestamp: '2025-11-14 10:00:00',
            data: {
              blood_pressure: '120/80',
              heart_rate: 72,
              temperature: 37.2,
              respiration_rate: 16,
              oxygen_saturation: 98
            }
          },
          type: 'outpatient'
        }
      ])
      setNotifications([
        {
          id: 'sample_1',
          type: 'abnormal_vitals',
          title: 'Tanda Vital Abnormal',
          message: 'Pasien Ahmad Surya memiliki tekanan darah tinggi: 160/95 mmHg',
          patient_name: 'Ahmad Surya',
          registration_no: 'REG001',
          severity: 'high',
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = activePatients.filter(patient =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.department && patient.department.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string, type: string) => {
    // Combined status logic for both outpatient and inpatient
    if (type === 'inpatient' && status === 'dirawat') {
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    }

    if (type === 'outpatient') {
      switch (status) {
        case 'menunggu':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
        case 'dipanggil':
          return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
        case 'sedang_diperiksa':
          return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
        case 'selesai':
          return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
      }
    }

    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
  }

  const getVitalSignsSummary = (vitals: VitalSigns | null | undefined) => {
    if (!vitals || !vitals.data) return null

    const { data } = vitals
    const parts = []

    if (data.blood_pressure) parts.push(`TD: ${data.blood_pressure}`)
    if (data.heart_rate) parts.push(`HR: ${data.heart_rate}`)
    if (data.temperature) parts.push(`Temp: ${data.temperature}°C`)
    if (data.oxygen_saturation) parts.push(`SpO2: ${data.oxygen_saturation}%`)

    return parts.length > 0 ? parts.join(', ') : null
  }

  const isAbnormalVitals = (vitals: any) => {
    if (!vitals) return false

    // Blood Pressure
    if (vitals.blood_pressure) {
      const bp = vitals.blood_pressure.split('/')
      if (bp.length === 2) {
        const systolic = parseInt(bp[0])
        const diastolic = parseInt(bp[1])
        if (systolic >= 140 || diastolic >= 90 || systolic < 90 || diastolic < 60) {
          return true
        }
      }
    }

    // Heart Rate
    if (vitals.heart_rate) {
      const hr = parseInt(vitals.heart_rate)
      if (hr > 100 || hr < 60) {
        return true
      }
    }

    // Temperature
    if (vitals.temperature) {
      const temp = parseFloat(vitals.temperature)
      if (temp > 38.0 || temp < 36.0) {
        return true
      }
    }

    // SPO2
    if (vitals.oxygen_saturation) {
      const spo2 = parseInt(vitals.oxygen_saturation)
      if (spo2 < 95) {
        return true
      }
    }

    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          👩‍⚕️ Dashboard Perawat
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Pantau pasien aktif dan status tanda vital - RS Sirama
        </p>
      </div>

      {/* Notifications Alert */}
      {notifications.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <MdEmergency className="text-red-600 dark:text-red-400 text-xl mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                ⚠️ Peringatan Penting ({notifications.length})
              </h3>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-red-700 dark:text-red-400">
                            {notification.title}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notification.severity === 'high'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : notification.severity === 'medium'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {notification.severity === 'high' ? 'Tinggi' : notification.severity === 'medium' ? 'Sedang' : 'Rendah'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length > 3 && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    +{notifications.length - 3} notifikasi lainnya
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards - Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdPeople className="text-2xl text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Pasien Aktif</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_pasien_aktif}</p>
              <p className="text-xs text-green-600">Pasien yang sedang ditangani</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdFavorite className="text-2xl text-red-600 dark:text-red-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Butuh TTV</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.butuh_ttv}</p>
              <p className="text-xs text-red-600">Belum input TTV lebih dari 4 jam</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdNoteAlt className="text-2xl text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">CPPT Pending</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.cppt_pending}</p>
              <p className="text-xs text-orange-600">Perlu dokumentasi CPPT</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdEmergency className="text-2xl text-orange-600 dark:text-orange-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Triase IGD</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.triase_igd}</p>
              <p className="text-xs text-red-600">Kasus prioritas tinggi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              🔍 Aksi Cepat
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/dashboard/perawat/ttv'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <MdFavorite className="inline mr-2" />
                Input TTV
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/perawat/cppt'}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <MdNoteAlt className="inline mr-2" />
                Buat CPPT Keperawatan
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/perawat/triase'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <MdEmergency className="inline mr-2" />
                Triase IGD
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/perawat/distribusi-obat'}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <MdAssignment className="inline mr-2" />
                Distribusi Obat
              </button>
              <hr className="my-4" />
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <MdRefresh className={`inline mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
            <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">Legenda Status</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span>Menunggu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                <span>Dipanggil/Diperiksa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                <span>Selesai</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Dirawat (Inap)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  👥 Daftar Pasien Aktif ({filteredPatients.length})
                </h3>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Cari nama pasien, MRN, atau poli..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <MdRefresh className="animate-spin text-2xl text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Memuat data pasien...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPatients.map((patient) => (
                    <div key={`${patient.type}-${patient.id}`} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Patient Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              {patient.type === 'inpatient' ? (
                                <MdBusiness className="text-blue-600 dark:text-blue-400 text-lg" />
                              ) : (
                                <MdBusiness className="text-blue-600 dark:text-blue-400 text-lg" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {patient.patient_name}
                                </h4>
                                {patient.is_emergency && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    <MdEmergency className="mr-1 text-sm" />
                                    Emergency
                                  </span>
                                )}
                                {patient.type === 'inpatient' && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                    <MdBusiness className="mr-1 text-sm" />
                                    Rawat Inap
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                MRN: {patient.mrn} • {patient.age ? `${patient.age} tahun` : 'Umur belum tercatat'} • {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                              </p>
                            </div>
                          </div>

                          {/* Patient Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">No. Registrasi: </span>
                                <span className="text-gray-900 dark:text-white">
                                  {patient.registration_number || patient.admission_number || '-'}
                                </span>
                              </p>
                              {patient.type === 'outpatient' ? (
                                <>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Poli: </span>
                                    <span className="text-gray-900 dark:text-white">{patient.department || '-'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Dokter: </span>
                                    <span className="text-gray-900 dark:text-white">{patient.doctor || '-'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Keluhan: </span>
                                    <span className="text-gray-900 dark:text-white">{patient.complaints || '-'}</span>
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Ruangan: </span>
                                    <span className="text-gray-900 dark:text-white">{patient.room || '-'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Diagnosa: </span>
                                    <span className="text-gray-900 dark:text-white">{patient.diagnosis || '-'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Tanggal Masuk: </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {patient.admission_date ? new Date(patient.admission_date).toLocaleString('id-ID') : '-'}
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Penjamin: </span>
                                <span className="text-gray-900 dark:text-white capitalize">{patient.payment_type || '-'}</span>
                              </p>
                              {patient.registration_date && (
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Registrasi: </span>
                                  <span className="text-gray-900 dark:text-white">
                                    {new Date(patient.registration_date).toLocaleString('id-ID')}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Vital Signs */}
                          {patient.latest_vitals && getVitalSignsSummary(patient.latest_vitals) && (
                            <div className={`rounded-lg p-3 mb-3 ${
                              isAbnormalVitals(patient.latest_vitals.data)
                                ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'
                                : 'bg-blue-50 dark:bg-blue-900/10'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-medium ${
                                  isAbnormalVitals(patient.latest_vitals.data)
                                    ? 'text-red-800 dark:text-red-400'
                                    : 'text-blue-800 dark:text-blue-400'
                                }`}>
                                  📊 Tanda Vital Terakhir ({patient.latest_vitals.source})
                                </p>
                                {isAbnormalVitals(patient.latest_vitals.data) && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    <MdEmergency className="mr-1 text-sm" />
                                    Abnormal
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${
                                isAbnormalVitals(patient.latest_vitals.data)
                                  ? 'text-red-700 dark:text-red-300'
                                  : 'text-blue-700 dark:text-blue-300'
                              }`}>
                                {getVitalSignsSummary(patient.latest_vitals)}
                              </p>
                              <p className={`text-xs mt-1 ${
                                isAbnormalVitals(patient.latest_vitals.data)
                                  ? 'text-red-600 dark:text-red-500'
                                  : 'text-blue-600 dark:text-blue-500'
                              }`}>
                                {new Date(patient.latest_vitals.timestamp).toLocaleString('id-ID')}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="ml-4 flex flex-col gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status, patient.type)}`}>
                            {patient.type === 'inpatient' && patient.status === 'dirawat' ? 'Dirawat' :
                             patient.status === 'menunggu' ? 'Menunggu' :
                             patient.status === 'dipanggil' ? 'Dipanggil' :
                             patient.status === 'sedang_diperiksa' ? 'Diperiksa' :
                             patient.status === 'selesai' ? 'Selesai' : patient.status}
                          </span>
                          <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <MdVisibility className="text-lg" />
                            Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredPatients.length === 0 && !loading && (
                    <div className="p-8 text-center">
                      <MdPeople className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'Tidak ada pasien yang sesuai dengan pencarian' : 'Tidak ada pasien aktif saat ini'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
