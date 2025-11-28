'use client'

import { useState, useEffect } from 'react'
import {
  MdLocalHospital,
  MdSearch,
  MdAdd,
  MdEdit,
  MdPerson,
  MdAccessTime,
  MdRefresh,
  MdWarning,
  MdCheckCircle,
  MdSchedule,
  MdMedicalServices,
  MdPriorityHigh,
  MdTimer,
  MdAssignment,
  MdHistory,
  MdDashboard
} from 'react-icons/md'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFetch, usePost } from '@/hooks/useApi'

interface Patient {
  id: string
  name: string
  medicalRecordNumber: string
  age: number
  gender: 'male' | 'female'
  arrivalTime: string
  chiefComplaint: string
  kategoriTriase: 'merah' | 'kuning' | 'hijau' | 'hitam'
  triageTime: string
  triageNurse: string
  vitalSigns: {
    bloodPressure: string
    heartRate: string
    temperature: string
    respirationRate: string
    oxygenSaturation: string
    painScale: number
    consciousness: string
  }
  abcde: {
    airway: 'patent' | 'obstruksi' | 'bebas'
    breathing: 'normal' | 'sesak' | 'tidak_ada'
    circulation: 'stabil' | 'syok' | 'tidak_teraba'
    disability: 'composmentis' | 'penurunan_kesadaran' | 'koma'
    exposure: 'cedera_tampak' | 'tidak_ada'
  }
  mekanismeCedera: string
  responseTime: number // in minutes
  status: 'waiting' | 'being_assessed' | 'awaiting_treatment' | 'treated' | 'discharged'
  priority: 'immediate' | 'urgent' | 'standard' | 'non_urgent'
  estimatedWaitTime: string
  notes: string
}

interface UntriagedPatient {
  id: string
  patient_id: string
  registration_id: string
  name: string
  medicalRecordNumber: string
  age: number
  gender: 'male' | 'female'
  arrivalTime: string
  chiefComplaint: string
  status: string
}

export default function TriagePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<UntriagedPatient | null>(null)
  const [showTriageForm, setShowTriageForm] = useState(false)
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<'all' | 'merah' | 'kuning' | 'hijau' | 'hitam'>('all')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Use API hooks
  const { data: triagesData, isLoading: triagesLoading, refetch: refetchTriages } = useFetch<any>('/api/t-triase')
  const { data: untriagedData, isLoading: untriagedLoading, refetch: refetchUntriaged } = useFetch<any>('/api/registrations/igd')
  const saveTriageMutation = usePost('/api/t-triase', {
    onSuccess: () => {
      refetchTriages()
      refetchUntriaged()
      setShowTriageForm(false)
      setSelectedPatient(null)
    }
  })

  const patients: Patient[] = triagesData?.data?.data || []
  const untriagedPatients: UntriagedPatient[] = untriagedData || []
  const loading = triagesLoading || untriagedLoading

  const [currentTriage, setCurrentTriage] = useState({
    chiefComplaint: '',
    mekanismeCedera: '',
    abcde: {
      airway: 'patent' as 'patent' | 'obstruksi' | 'bebas',
      breathing: 'normal' as 'normal' | 'sesak' | 'tidak_ada',
      circulation: 'stabil' as 'stabil' | 'syok' | 'tidak_teraba',
      disability: 'composmentis' as 'composmentis' | 'penurunan_kesadaran' | 'koma',
      exposure: 'tidak_ada' as 'cedera_tampak' | 'tidak_ada'
    },
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respirationRate: '',
      oxygenSaturation: '',
      painScale: 0,
      consciousness: 'Compos mentis'
    },
    responseTime: 0,
    notes: '',
    arrivalTime: null as Date | null
  })


  const filteredPatients = patients
    .filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(patient => filterLevel === 'all' || patient.kategoriTriase === filterLevel)
    .sort((a, b) => {
      // Sort by triage priority (merah = highest priority)
      const priorityOrder = { 'merah': 1, 'kuning': 2, 'hijau': 3, 'hitam': 4 }
      const aPriority = priorityOrder[a.kategoriTriase] || 5
      const bPriority = priorityOrder[b.kategoriTriase] || 5
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      // Then by arrival time
      return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
    })

  const getTriageLevelInfo = (kategori: string) => {
    switch (kategori) {
      case 'merah':
        return {
          color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          bgColor: 'bg-red-500',
          text: 'MERAH - Resusitasi',
          description: 'Life-threatening, immediate',
          waitTime: '0 menit',
          priority: 'immediate'
        }
      case 'kuning':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
          bgColor: 'bg-yellow-500',
          text: 'KUNING - Emergent',
          description: 'Severe, <10 menit',
          waitTime: '< 10 menit',
          priority: 'urgent'
        }
      case 'hijau':
        return {
          color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
          bgColor: 'bg-green-500',
          text: 'HIJAU - Urgent',
          description: 'Moderate, <30 menit',
          waitTime: '< 30 menit',
          priority: 'standard'
        }
      case 'hitam':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
          bgColor: 'bg-gray-700',
          text: 'HITAM - Non-urgent/Death',
          description: 'Dapat ditunda / DOA',
          waitTime: 'Ditunda',
          priority: 'non_urgent'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
          bgColor: 'bg-gray-500',
          text: 'Unknown',
          description: '',
          waitTime: '',
          priority: 'non_urgent'
        }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
      case 'being_assessed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'awaiting_treatment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'treated':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'discharged':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Menunggu'
      case 'being_assessed': return 'Sedang Dinilai'
      case 'awaiting_treatment': return 'Menunggu Perawatan'
      case 'treated': return 'Sudah Dirawat'
      case 'discharged': return 'Sudah Pulang'
      default: return status
    }
  }

  const calculateTriageCategory = (vitals: any, complaint: string): 'merah' | 'kuning' | 'hijau' | 'hitam' => {
    // MERAH: Life-threatening, immediate (0 menit)
    if (vitals.respirationRate > 30 || vitals.respirationRate < 8 ||
        vitals.oxygenSaturation < 90 || vitals.heartRate > 130 ||
        vitals.heartRate < 40 || vitals.bloodPressure.split('/')[0] > 200 ||
        vitals.bloodPressure.split('/')[0] < 80 || vitals.painScale >= 9 ||
        complaint.toLowerCase().includes('sesak napas') ||
        complaint.toLowerCase().includes('nyeri dada hebat') ||
        complaint.toLowerCase().includes('tidak sadar') ||
        complaint.toLowerCase().includes('pendarahan hebat')) {
      return 'merah'
    }

    // KUNING: Severe, <10 menit
    if (vitals.respirationRate > 25 || vitals.oxygenSaturation < 93 ||
        vitals.heartRate > 110 || vitals.temperature > 39 ||
        vitals.painScale >= 7 || complaint.toLowerCase().includes('pendarahan') ||
        complaint.toLowerCase().includes('muntah darah') ||
        complaint.toLowerCase().includes('nyeri perut hebat')) {
      return 'kuning'
    }

    // HIJAU: Moderate, <30 menit
    if (vitals.temperature > 38.5 || vitals.painScale >= 5 ||
        complaint.toLowerCase().includes('demam') ||
        complaint.toLowerCase().includes('mual muntah') ||
        complaint.toLowerCase().includes('diare')) {
      return 'hijau'
    }

    // HITAM: Non-urgent/Death - Dapat ditunda / DOA
    if (complaint.toLowerCase().includes('doa') ||
        complaint.toLowerCase().includes('meninggal')) {
      return 'hitam'
    }

    // Default to HIJAU
    return 'hijau'
  }

  const handleSaveTriage = () => {
    if (!selectedPatient) return

    const kategoriTriase = calculateTriageCategory(currentTriage.vitalSigns, currentTriage.chiefComplaint)
    const priority = getTriageLevelInfo(kategoriTriase).priority
    const estimatedWaitTime = getTriageLevelInfo(kategoriTriase).waitTime

    // Calculate response time in minutes
    const arrivalTime = new Date(selectedPatient.arrivalTime)
    const triageTime = new Date()
    const responseTimeMinutes = Math.floor((triageTime.getTime() - arrivalTime.getTime()) / (1000 * 60))

    const triageData = {
      registration_id: parseInt(selectedPatient.registration_id), // Use actual registration_id
      patient_id: parseInt(selectedPatient.patient_id), // Use actual patient_id
      kategori_triase: kategoriTriase,
      chief_complaint: currentTriage.chiefComplaint,
      mekanisme_cedera: currentTriage.mekanismeCedera,
      airway: currentTriage.abcde.airway,
      breathing: currentTriage.abcde.breathing,
      circulation: currentTriage.abcde.circulation,
      disability: currentTriage.abcde.disability,
      exposure: currentTriage.abcde.exposure,
      vital_signs: currentTriage.vitalSigns,
      response_time: responseTimeMinutes,
      priority: priority,
      estimated_wait_time: estimatedWaitTime,
      notes: currentTriage.notes,
      triage_time: triageTime.toISOString()
    }

    saveTriageMutation.mutate(triageData, {
      onSuccess: () => {
        // Reset form
        setCurrentTriage({
          chiefComplaint: '',
          mekanismeCedera: '',
          abcde: {
            airway: 'patent',
            breathing: 'normal',
            circulation: 'stabil',
            disability: 'composmentis',
            exposure: 'tidak_ada'
          },
          vitalSigns: {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            respirationRate: '',
            oxygenSaturation: '',
            painScale: 0,
            consciousness: 'Compos mentis'
          },
          responseTime: 0,
          notes: '',
          arrivalTime: null
        })
        setShowTriageForm(false)
        setSelectedPatient(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Triase IGD
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistem Klasifikasi Prioritas Pasien Darurat
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchTriages()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowTriageForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdAdd className="text-lg" />
            Triase Pasien Baru
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <MdDashboard className="text-lg" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <MdHistory className="text-lg" />
            History Triase
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">

      {/* Triage Level Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategori Triase IGD</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['merah', 'kuning', 'hijau', 'hitam'].map(kategori => {
            const info = getTriageLevelInfo(kategori)
            return (
              <div key={kategori} className={`p-4 rounded-lg border ${info.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full ${info.bgColor}`}></div>
                  <span className="font-medium">{info.text}</span>
                </div>
                <p className="text-sm opacity-80">{info.description}</p>
                <p className="text-xs mt-1 font-medium">{info.waitTime}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              <option value="merah">MERAH - Resusitasi</option>
              <option value="kuning">KUNING - Emergent</option>
              <option value="hijau">HIJAU - Urgent</option>
              <option value="hitam">HITAM - Non-urgent/Death</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Queue */}
      <div className="space-y-4">
        {filteredPatients.map((patient) => {
          const triageInfo = getTriageLevelInfo(patient.kategoriTriase)
          return (
            <div key={patient.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${triageInfo.bgColor} flex items-center justify-center text-white font-bold text-lg`}>
                    {patient.kategoriTriase.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${triageInfo.color}`}>
                        {triageInfo.text}
                      </span>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                        {getStatusText(patient.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MdPerson className="text-gray-400 text-lg" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {patient.age} tahun, {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MdAccessTime className="text-gray-400 text-lg" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Datang: {new Date(patient.arrivalTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MdTimer className="text-gray-400 text-lg" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Estimasi: {patient.estimatedWaitTime}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Keluhan Utama</h4>
                      <p className="text-gray-600 dark:text-gray-400">{patient.chiefComplaint}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">TD:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">{patient.vitalSigns.bloodPressure}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">HR:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">{patient.vitalSigns.heartRate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Temp:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">{patient.vitalSigns.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">RR:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">{patient.vitalSigns.respirationRate}</span>
                      </div>
                    </div>

                    {patient.notes && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Catatan:</strong> {patient.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <MdMedicalServices className="text-lg" />
                    Update Status
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <MdAssignment className="text-lg" />
                    Detail Lengkap
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    <MdEdit className="text-lg" />
                    Edit Triase
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Triage Form Modal */}
      {showTriageForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Triase Pasien Baru
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Penilaian awal tingkat kegawatan pasien
                </p>
              </div>
              <button
                onClick={() => { setShowTriageForm(false); setSelectedPatient(null); }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdPriorityHigh className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cari Pasien
                </label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Ketik nama atau nomor rekam medis..."
                    value={patientSearchTerm}
                    onChange={(e) => {
                      const searchTerm = e.target.value
                      setPatientSearchTerm(searchTerm)

                      if (searchTerm === '') {
                        setSelectedPatient(null)
                        return
                      }

                      // Find matching patient
                      const patient = untriagedPatients.find(p =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      setSelectedPatient(patient || null)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Selected Patient Display */}
                {selectedPatient && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">{selectedPatient.name}</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">RM: {selectedPatient.medicalRecordNumber}</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {selectedPatient.age} tahun, {selectedPatient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPatient(null)
                          setPatientSearchTerm('')
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        title="Hapus pilihan pasien"
                      >
                        <MdPriorityHigh className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Search Suggestions */}
                {!selectedPatient && patientSearchTerm && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                    {untriagedPatients
                      .filter(patient =>
                        patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                        patient.medicalRecordNumber.toLowerCase().includes(patientSearchTerm.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatient(patient)
                            setPatientSearchTerm(`${patient.name} - ${patient.medicalRecordNumber}`)
                          }}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">RM: {patient.medicalRecordNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {patient.age} tahun, {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {selectedPatient && (
                <>
                  {/* Chief Complaint */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Keluhan Utama
                    </label>
                    <textarea
                      value={currentTriage.chiefComplaint}
                      onChange={(e) => setCurrentTriage(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Jelaskan keluhan utama pasien..."
                    />
                  </div>

                  {/* Vital Signs */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tanda Vital</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          TD (mmHg)
                        </label>
                        <input
                          type="text"
                          value={currentTriage.vitalSigns.bloodPressure}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="120/80"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          HR (bpm)
                        </label>
                        <input
                          type="number"
                          value={currentTriage.vitalSigns.heartRate}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Temp (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentTriage.vitalSigns.temperature}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          RR (/min)
                        </label>
                        <input
                          type="number"
                          value={currentTriage.vitalSigns.respirationRate}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, respirationRate: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          SpO2 (%)
                        </label>
                        <input
                          type="number"
                          value={currentTriage.vitalSigns.oxygenSaturation}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, oxygenSaturation: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Skala Nyeri (0-10)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={currentTriage.vitalSigns.painScale}
                            onChange={(e) => setCurrentTriage(prev => ({
                              ...prev,
                              vitalSigns: { ...prev.vitalSigns, painScale: parseInt(e.target.value) }
                            }))}
                            className="flex-1"
                          />
                          <span className="font-medium text-lg w-8 text-center">
                            {currentTriage.vitalSigns.painScale}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kesadaran
                        </label>
                        <select
                          value={currentTriage.vitalSigns.consciousness}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            vitalSigns: { ...prev.vitalSigns, consciousness: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option>Compos mentis</option>
                          <option>Apatis</option>
                          <option>Somnolen</option>
                          <option>Sopor</option>
                          <option>Coma</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Mekanisme Cedera */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mekanisme Cedera
                    </label>
                    <textarea
                      value={currentTriage.mekanismeCedera}
                      onChange={(e) => setCurrentTriage(prev => ({ ...prev, mekanismeCedera: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Jelaskan mekanisme cedera..."
                    />
                  </div>

                  {/* ABCDE Assessment */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Penilaian ABCDE</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Airway (Jalan Nafas)
                        </label>
                        <select
                          value={currentTriage.abcde.airway}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            abcde: { ...prev.abcde, airway: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="patent">Patent</option>
                          <option value="obstruksi">Obstruksi</option>
                          <option value="bebas">Bebas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Breathing (Pernafasan)
                        </label>
                        <select
                          value={currentTriage.abcde.breathing}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            abcde: { ...prev.abcde, breathing: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="normal">Normal</option>
                          <option value="sesak">Sesak</option>
                          <option value="tidak_ada">Tidak Ada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Circulation (Sirkulasi)
                        </label>
                        <select
                          value={currentTriage.abcde.circulation}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            abcde: { ...prev.abcde, circulation: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="stabil">Stabil</option>
                          <option value="syok">Syok</option>
                          <option value="tidak_teraba">Tidak Teraba</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Disability (Disabilitas)
                        </label>
                        <select
                          value={currentTriage.abcde.disability}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            abcde: { ...prev.abcde, disability: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="composmentis">Compos Mentis</option>
                          <option value="penurunan_kesadaran">Penurunan Kesadaran</option>
                          <option value="koma">Koma</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Exposure (Eksposur)
                        </label>
                        <select
                          value={currentTriage.abcde.exposure}
                          onChange={(e) => setCurrentTriage(prev => ({
                            ...prev,
                            abcde: { ...prev.abcde, exposure: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="tidak_ada">Tidak Ada</option>
                          <option value="cedera_tampak">Cedera Tampak</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catatan Triase
                    </label>
                    <textarea
                      value={currentTriage.notes}
                      onChange={(e) => setCurrentTriage(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Catatan tambahan..."
                    />
                  </div>

                  {/* Triage Level Preview */}
                  {currentTriage.chiefComplaint && currentTriage.vitalSigns.bloodPressure && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Kategori Triase yang Direkomendasikan</h4>
                      {(() => {
                        const kategori = calculateTriageCategory(currentTriage.vitalSigns, currentTriage.chiefComplaint)
                        const info = getTriageLevelInfo(kategori)
                        return (
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${info.color}`}>
                            <div className={`w-6 h-6 rounded-full ${info.bgColor} flex items-center justify-center text-white font-bold`}>
                              {kategori.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{info.text}</div>
                              <div className="text-sm opacity-80">{info.description}</div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowTriageForm(false); setSelectedPatient(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveTriage}
                disabled={!selectedPatient}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                Simpan Triase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Triase */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dashboard Triase IGD</h3>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          {['merah', 'kuning', 'hijau', 'hitam'].map(kategori => {
            const count = patients.filter(p => p.kategoriTriase === kategori).length
            const info = getTriageLevelInfo(kategori)
            return (
              <div key={kategori} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${info.bgColor} flex items-center justify-center text-white font-bold`}>
                    {kategori.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{info.text}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {count}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Response Time Summary */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Ringkasan Response Time</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Rata-rata Response Time</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.responseTime, 0) / patients.length) : 0} menit
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">Response Time Tercepat</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {patients.length > 0 ? Math.min(...patients.map(p => p.responseTime)) : 0} menit
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">Response Time Terlama</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {patients.length > 0 ? Math.max(...patients.map(p => p.responseTime)) : 0} menit
              </p>
            </div>
          </div>
        </div>

        {/* Recent Triages */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Triase Terbaru</h4>
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient) => {
              const info = getTriageLevelInfo(patient.kategoriTriase)
              return (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${info.bgColor} flex items-center justify-center text-white font-bold text-sm`}>
                      {patient.kategoriTriase.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{patient.chiefComplaint}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.responseTime} menit</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(patient.triageTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            {patients.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">Belum ada data triase</p>
            )}
          </div>
        </div>
      </div>

        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* History Triase */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">History Triase</h3>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari nama pasien atau nomor rekam medis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                <option value="merah">Merah</option>
                <option value="kuning">Kuning</option>
                <option value="hijau">Hijau</option>
                <option value="hitam">Hitam</option>
              </select>
            </div>

            {/* Patient List */}
            <div className="space-y-4">
              {filteredPatients.map((patient) => {
                const triageInfo = getTriageLevelInfo(patient.kategoriTriase)
                return (
                  <div key={patient.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${triageInfo.bgColor} flex items-center justify-center text-white font-bold text-lg`}>
                          {patient.kategoriTriase.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">RM: {patient.medicalRecordNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Umur: {patient.age} tahun</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Keluhan: {patient.chiefComplaint}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${triageInfo.color}`}>
                              {triageInfo.text}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Response Time: {patient.responseTime} menit
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(patient.triageTime).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Oleh: {patient.triageNurse}</p>
                        <button
                          onClick={() => {
                            setSelectedPatient({
                              id: patient.id,
                              patient_id: patient.id,
                              registration_id: patient.id,
                              name: patient.name,
                              medicalRecordNumber: patient.medicalRecordNumber,
                              age: patient.age,
                              gender: patient.gender,
                              arrivalTime: patient.arrivalTime,
                              chiefComplaint: patient.chiefComplaint,
                              status: 'waiting'
                            })
                            setShowTriageForm(true)
                          }}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                        >
                          <MdEdit className="text-sm" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <MdMedicalServices className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada data triase</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Belum ada pasien yang ditriase dengan kriteria tersebut.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
