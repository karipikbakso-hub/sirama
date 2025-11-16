'use client'

import { useState, useEffect } from 'react'
import { FaAmbulance, FaUserInjured, FaClock, FaMapMarkerAlt, FaPhone, FaNotesMedical, FaSpinner, FaSearch, FaExclamationTriangle, FaPlus, FaCheck } from 'react-icons/fa'
import api from '@/lib/apiAuth'

interface EmergencyRegistration {
  id: number
  patient_id: number
  emergency_type: string
  severity: 'kritis' | 'darurat' | 'urgent'
  arrival_time: string
  triage_level?: string
  symptoms?: string
  status: string
  initial_diagnosis?: string
  treatment_given?: string
  room_assigned?: string
  patient?: {
    id: number
    name: string
    medical_record_number: string
  }
  doctor?: {
    id: number
    name: string
  }
  nurse?: {
    id: number
    name: string
  }
}

interface EmergencyStats {
  total_today: number
  active_cases: number
  critical_cases: number
  emergency_cases: number
  urgent_cases: number
  completed_today: number
  total_this_month: number
  avg_response_time: number
}

interface Patient {
  id: number
  name: string
  medical_record_number: string
  nik: string
  age?: number
  gender: string
  phone: string
  address: string
}

interface EmergencyFormData {
  patient_id: number | null
  emergency_type: string
  severity: 'kritis' | 'darurat' | 'urgent'
  keluhan_utama: string
  cara_kedatangan: string
  jenis_asuransi: string
  nomor_asuransi: string
}

export default function RegistrasiIGDPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [emergencyRegistrations, setEmergencyRegistrations] = useState<EmergencyRegistration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<EmergencyRegistration[]>([])
  const [stats, setStats] = useState<EmergencyStats>({
    total_today: 0,
    active_cases: 0,
    critical_cases: 0,
    emergency_cases: 0,
    urgent_cases: 0,
    completed_today: 0,
    total_this_month: 0,
    avg_response_time: 0
  })
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState<EmergencyFormData>({
    patient_id: null,
    emergency_type: '',
    severity: 'urgent',
    keluhan_utama: '',
    cara_kedatangan: 'jalan_kaki',
    jenis_asuransi: 'Tunai',
    nomor_asuransi: ''
  })

  // Fetch emergency registrations from API
  const fetchEmergencyRegistrations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/emergency-registrations')
      if (response.data.success) {
        const data = response.data.data.data || []
        setEmergencyRegistrations(data)
        setFilteredRegistrations(data)
      }
    } catch (err: any) {
      console.error('Error fetching emergency registrations:', err)
      setError('Failed to load emergency registrations')
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics from API
  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await api.get('/api/emergency-registrations/statistics')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  // Initialize data on component mount
  useEffect(() => {
    fetchEmergencyRegistrations()
    fetchStats()
  }, [])

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRegistrations(emergencyRegistrations)
    } else {
      const filtered = emergencyRegistrations.filter(item =>
        item.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patient?.medical_record_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.emergency_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRegistrations(filtered)
    }
  }, [searchTerm, emergencyRegistrations])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'kritis':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Kritis</span>
      case 'darurat':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-full text-xs font-medium">Darurat</span>
      case 'urgent':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Urgent</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{severity}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Menunggu</span>
      case 'dalam_perawatan':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">Dalam Perawatan</span>
      case 'stabil':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Stabil</span>
      case 'dirujuk':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full text-xs font-medium">Dirujuk</span>
      case 'meninggal':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">Meninggal</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  // Patient search functionality
  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setPatientResults([])
      return
    }

    try {
      const response = await api.get(`/api/emergency-registrations/patient-lookup?q=${encodeURIComponent(query)}`)
      if (response.data.success) {
        setPatientResults(response.data.data)
      }
    } catch (err) {
      console.error('Error searching patients:', err)
    }
  }

  // Handle patient search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patientSearch.trim()) {
        searchPatients(patientSearch)
      } else {
        setPatientResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [patientSearch])

  // Select patient from search results
  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(prev => ({ ...prev, patient_id: patient.id }))
    setPatientSearch('')
    setPatientResults([])
  }

  // Handle form input changes
  const handleFormChange = (field: keyof EmergencyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Submit emergency registration
  const submitEmergencyRegistration = async () => {
    if (!selectedPatient || !formData.severity || !formData.keluhan_utama.trim()) {
      alert('Mohon lengkapi data pasien, tingkat urgensi, dan keluhan utama')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        patient_id: selectedPatient.id,
        emergency_type: formData.emergency_type || 'Emergency',
        severity: formData.severity,
        keluhan_utama: formData.keluhan_utama,
        cara_kedatangan: formData.cara_kedatangan,
        jenis_asuransi: formData.jenis_asuransi,
        nomor_asuransi: formData.nomor_asuransi,
        arrival_time: new Date().toISOString()
      }

      const response = await api.post('/api/emergency-registrations', payload)

      if (response.data.success) {
        alert('Registrasi IGD berhasil!')
        setShowForm(false)
        setSelectedPatient(null)
        setFormData({
          patient_id: null,
          emergency_type: '',
          severity: 'urgent',
          keluhan_utama: '',
          cara_kedatangan: 'jalan_kaki',
          jenis_asuransi: 'Tunai',
          nomor_asuransi: ''
        })
        // Refresh data
        fetchEmergencyRegistrations()
        fetchStats()
      }
    } catch (err: any) {
      console.error('Error submitting emergency registration:', err)
      alert('Gagal mendaftarkan pasien emergency: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  // Mark as emergency (gawat darurat)
  const markAsEmergency = (registration: EmergencyRegistration) => {
    // This would typically update the severity to 'kritis' and notify relevant staff
    alert(`Pasien ${registration.patient?.name} telah ditandai sebagai GAWAT DARURAT!`)
    // In a real implementation, this would call an API to update the registration
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaAmbulance className="text-red-500" />
        <span className="truncate">Registrasi IGD</span>
      </h1>

      {/* Emergency Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasien Hari Ini</p>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats.total_today}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Total kasus emergency</p>
            </div>
            <FaUserInjured className="text-2xl text-red-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kasus Aktif</p>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats.active_cases}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">dalam perawatan</p>
            </div>
            <FaClock className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kasus Kritis</p>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats.critical_cases}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tingkat kritis</p>
            </div>
            <FaNotesMedical className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
              <p className="text-2xl font-bold">{statsLoading ? '...' : `${stats.avg_response_time}min`}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">rata-rata</p>
            </div>
            <FaAmbulance className="text-2xl text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Registration Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition duration-200 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
        >
          <FaPlus className="text-xl" />
          Registrasi IGD Cepat
        </button>
      </div>

      {/* Emergency Registration Form */}
      {showForm && (
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-red-200 dark:border-red-800 backdrop-blur-md shadow-xl rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">Registrasi IGD Cepat</h2>
            <span className="text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-full font-medium">
              Prioritas Tertinggi
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Search & Form */}
            <div className="space-y-6">
              {/* Patient Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cari Pasien *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik nama atau nomor rekam medis..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  />
                </div>

                {/* Patient Search Results */}
                {patientResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    {patientResults.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => selectPatient(patient)}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-200">{patient.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          RM: {patient.medical_record_number} | {patient.age} tahun | {patient.gender}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Patient */}
                {selectedPatient && (
                  <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Pasien Terpilih:</span>
                    </div>
                    <div className="mt-2">
                      <p className="font-medium">{selectedPatient.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        RM: {selectedPatient.medical_record_number} | {selectedPatient.age} tahun | {selectedPatient.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jenis Emergency
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Serangan Jantung, Kecelakaan, dll"
                  value={formData.emergency_type}
                  onChange={(e) => handleFormChange('emergency_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tingkat Urgensi *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleFormChange('severity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  aria-label="Tingkat Urgensi"
                >
                  <option value="urgent">Pilih tingkat urgensi</option>
                  <option value="kritis">🔴 Kritis - Level 1 (Immediate)</option>
                  <option value="darurat">🟠 Darurat - Level 2 (10 menit)</option>
                  <option value="urgent">🟡 Urgent - Level 3 (30 menit)</option>
                </select>
              </div>

              {/* Arrival Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cara Kedatangan
                </label>
                <select
                  value={formData.cara_kedatangan}
                  onChange={(e) => handleFormChange('cara_kedatangan', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  aria-label="Cara Kedatangan"
                >
                  <option value="jalan_kaki">🚶‍♂️ Jalan Kaki</option>
                  <option value="ambulance">🚑 Ambulance</option>
                  <option value="mobil_pribadi">🚗 Mobil Pribadi</option>
                  <option value="dibawa_orang">👥 Dibawa Orang</option>
                  <option value="angkutan_umum">🚌 Angkutan Umum</option>
                  <option value="helikopter">🚁 Helikopter</option>
                  <option value="lainnya">❓ Lainnya</option>
                </select>
              </div>

              {/* Insurance */}
              <div>
                <label htmlFor="jenis_asuransi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jenis Asuransi
                </label>
                <select
                  id="jenis_asuransi"
                  value={formData.jenis_asuransi}
                  onChange={(e) => handleFormChange('jenis_asuransi', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                >
                  <option value="Tunai">💰 Tunai</option>
                  <option value="BPJS">🏥 BPJS</option>
                  <option value="Asuransi_Swasta">📋 Asuransi Swasta</option>
                </select>
              </div>

              {/* Insurance Number */}
              {formData.jenis_asuransi !== 'Tunai' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor {formData.jenis_asuransi === 'BPJS' ? 'BPJS' : 'Asuransi'}
                  </label>
                  <input
                    type="text"
                    placeholder={`Masukkan nomor ${formData.jenis_asuransi === 'BPJS' ? 'BPJS' : 'asuransi'}`}
                    value={formData.nomor_asuransi}
                    onChange={(e) => handleFormChange('nomor_asuransi', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  />
                </div>
              )}

              {/* Main Complaint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keluhan Utama *
                </label>
                <textarea
                  placeholder="Jelaskan keluhan pasien secara singkat..."
                  rows={3}
                  value={formData.keluhan_utama}
                  onChange={(e) => handleFormChange('keluhan_utama', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submitEmergencyRegistration}
                disabled={submitting || !selectedPatient || !formData.severity || !formData.keluhan_utama.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 text-lg"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="text-xl animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    <FaAmbulance className="text-xl" />
                    Daftarkan Emergency
                  </>
                )}
              </button>
            </div>

            {/* Available Doctors & Response Time */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Dokter IGD Tersedia</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">dr. Emergency Specialist</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Sp. Emergency Medicine</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      Available
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">dr. Trauma Care</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Sp. Traumatology</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                      Busy
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Response Time Standard</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <span className="font-medium text-red-800 dark:text-red-200">Level 1 (Merah)</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">Immediate</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <span className="font-medium text-orange-800 dark:text-orange-200">Level 2 (Orange)</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold"> 10 menit</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">Level 3 (Kuning)</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold"> 30 menit</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="font-medium text-green-800 dark:text-green-200">Level 4 (Hijau)</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">Non-urgent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Cari Registrasi IGD</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaUserInjured className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien atau jenis emergency..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Filter Status
          </button>
        </div>
      </div>

      {/* Emergency Registrations Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-2">Daftar Registrasi IGD</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Pantau semua pasien emergency yang sedang ditangani</p>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">ID Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Jenis Emergency</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tingkat</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Waktu Kedatangan</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <FaSpinner className="mx-auto text-2xl text-blue-500 animate-spin mb-2" />
                    <p>Memuat data registrasi IGD...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-600">
                    <p>❌ {error}</p>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <FaUserInjured className="mx-auto text-3xl mb-2 opacity-50" />
                    <p>Tidak ada data registrasi IGD</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 font-mono text-sm">{registration.patient?.medical_record_number || `RM${registration.patient_id}`}</td>
                    <td className="px-4 py-3 font-medium">{registration.patient?.name || `Pasien ${registration.patient_id}`}</td>
                    <td className="px-4 py-3">{registration.emergency_type}</td>
                    <td className="px-4 py-3">{getSeverityBadge(registration.severity)}</td>
                    <td className="px-4 py-3">{new Date(registration.arrival_time).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{getStatusBadge(registration.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm">
                          Detail
                        </button>
                        <button
                          onClick={() => markAsEmergency(registration)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm flex items-center gap-1"
                        >
                          <FaExclamationTriangle className="text-xs" />
                          Gawat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
