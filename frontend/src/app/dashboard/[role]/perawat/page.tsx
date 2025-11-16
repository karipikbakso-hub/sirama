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
  total_active: number
  outpatient_count: number
  inpatient_count: number
  emergency_count: number
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
  const [stats, setStats] = useState<DashboardStats>({
    total_active: 0,
    outpatient_count: 0,
    inpatient_count: 0,
    emergency_count: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch data from actual API endpoint
      const response = await fetch('/api/dashboard/nursing/active-patients')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (data.success) {
        setActivePatients(data.data.active_patients)
        setStats(data.data.summary)
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)

      // Fallback to mock data if API fails
      console.warn('API failed, using mock data...')
      const mockResponse: ApiResponse = {
        success: true,
        message: 'Data pasien aktif berhasil diambil (fallback)',
        data: {
          active_patients: [
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
            },
            {
              id: '2',
              patient_id: 'P002',
              patient_name: 'Maya Sari',
              mrn: 'MRN002',
              age: 28,
              gender: 'P',
              admission_number: 'ADM001',
              status: 'dirawat',
              diagnosis: 'Pneumonia lobaris inferior',
              payment_type: 'bpjs',
              room: 'Ruang Melati 301',
              admission_date: '2025-11-13 14:00:00',
              latest_vitals: {
                source: 'examination',
                timestamp: '2025-11-14 06:30:00',
                data: {
                  blood_pressure: '140/90',
                  heart_rate: 85,
                  temperature: 38.2,
                  respiration_rate: 20,
                  oxygen_saturation: 95
                }
              },
              type: 'inpatient'
            },
            {
              id: '3',
              patient_id: 'P003',
              patient_name: 'Budi Santoso',
              mrn: 'MRN003',
              age: 42,
              gender: 'L',
              registration_number: 'REG002',
              status: 'sedang_diperiksa',
              visit_type: 'kontrol',
              complaints: 'Hipertensi tidak terkontrol',
              payment_type: 'asuransi',
              is_emergency: true,
              department: 'Poli Kardiovaskular',
              doctor: 'Dr. Rini Wijaya',
              registration_date: '2025-11-14 09:15:00',
              type: 'outpatient'
            }
          ],
          summary: {
            total_active: 3,
            outpatient_count: 2,
            inpatient_count: 1,
            emergency_count: 1
          }
        }
      }

      setActivePatients(mockResponse.data.active_patients)
      setStats(mockResponse.data.summary)
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

      {/* KPI Cards - Dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdPeople className="text-2xl text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pasien Aktif Hari Ini</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_active}</p>
              <p className="text-xs text-green-600">Rawat Jalan: {stats.outpatient_count}, Inap: {stats.inpatient_count}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdFavorite className="text-2xl text-red-600 dark:text-red-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Diperiksa Hari Ini</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {activePatients.filter(p => p.type === 'outpatient').length}
              </p>
              <p className="text-xs text-green-600">Pasien rawat jalan aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdBusiness className="text-2xl text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pasien Rawat Inap</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.inpatient_count}</p>
              <p className="text-xs text-blue-600">Sedang dirawat</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdEmergency className="text-2xl text-orange-600 dark:text-orange-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kasus Emergency</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.emergency_count}</p>
              <p className="text-xs text-red-600">Perlu perhatian khusus</p>
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
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                <MdFavorite className="inline mr-2" />
                Catat TTV
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                <MdNoteAlt className="inline mr-2" />
                Tambah CPPT
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                <MdListAlt className="inline mr-2" />
                Triase
              </button>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                <MdAssignment className="inline mr-2" />
                Obat
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
                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 mb-3">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
                                📊 Tanda Vital Terakhir ({patient.latest_vitals.source})
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {getVitalSignsSummary(patient.latest_vitals)}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
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
