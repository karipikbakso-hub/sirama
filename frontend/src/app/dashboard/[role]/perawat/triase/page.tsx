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
  MdAssignment
} from 'react-icons/md'

interface Patient {
  id: string
  name: string
  medicalRecordNumber: string
  age: number
  gender: 'male' | 'female'
  arrivalTime: string
  chiefComplaint: string
  triageLevel: 1 | 2 | 3 | 4 | 5
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
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<UntriagedPatient | null>(null)
  const [showTriageForm, setShowTriageForm] = useState(false)
  const [untriagedPatients, setUntriagedPatients] = useState<UntriagedPatient[]>([])
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all')

  const [currentTriage, setCurrentTriage] = useState({
    chiefComplaint: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respirationRate: '',
      oxygenSaturation: '',
      painScale: 0,
      consciousness: 'Compos mentis'
    },
    notes: ''
  })

  useEffect(() => {
    fetchPatients()
    loadUntriagedPatients()
  }, [])

  const loadUntriagedPatients = async () => {
    const patients = await fetchUntriagedPatients()
    setUntriagedPatients(patients)
  }

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/triases')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform API data to match frontend interface
          const transformedPatients: Patient[] = data.data.data.map((triase: any) => ({
            id: triase.id.toString(),
            name: triase.patient?.name || 'Unknown',
            medicalRecordNumber: triase.patient?.mrn || 'Unknown',
            age: triase.patient?.birth_date ? new Date().getFullYear() - new Date(triase.patient.birth_date).getFullYear() : 0,
            gender: triase.patient?.gender || 'male',
            arrivalTime: triase.registration?.created_at || triase.created_at,
            chiefComplaint: triase.chief_complaint,
            triageLevel: triase.triage_level,
            triageTime: triase.triage_time,
            triageNurse: triase.nurse?.name || 'Unknown',
            vitalSigns: triase.vital_signs || {
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              respirationRate: '',
              oxygenSaturation: '',
              painScale: 0,
              consciousness: 'Compos mentis'
            },
            status: 'waiting', // Default status
            priority: triase.priority,
            estimatedWaitTime: triase.estimated_wait_time,
            notes: triase.notes
          }))
          setPatients(transformedPatients)
        }
      } else {
        console.error('Failed to fetch triases')
        setPatients([])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUntriagedPatients = async () => {
    try {
      const response = await fetch('/api/triases/untriaged-patients')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          return data.data.map((patient: any) => ({
            id: patient.registration_id.toString(),
            patient_id: patient.patient_id,
            registration_id: patient.registration_id,
            name: patient.name,
            medicalRecordNumber: patient.medical_record_number,
            age: patient.age,
            gender: patient.gender,
            arrivalTime: patient.arrival_time,
            chiefComplaint: patient.chief_complaint,
            status: patient.status
          }))
        }
      }
      return []
    } catch (error) {
      console.error('Error fetching untriaged patients:', error)
      return []
    }
  }

  const filteredPatients = patients
    .filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(patient => filterLevel === 'all' || patient.triageLevel === filterLevel)
    .sort((a, b) => {
      // Sort by triage level (1 = highest priority)
      if (a.triageLevel !== b.triageLevel) {
        return a.triageLevel - b.triageLevel
      }
      // Then by arrival time
      return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
    })

  const getTriageLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return {
          color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          bgColor: 'bg-red-500',
          text: 'Level 1 - Resusitasi',
          description: 'Kegawatan yang mengancam jiwa',
          waitTime: 'Immediate'
        }
      case 2:
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
          bgColor: 'bg-orange-500',
          text: 'Level 2 - Emergensi',
          description: 'Kegawatan tinggi',
          waitTime: '< 10 menit'
        }
      case 3:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
          bgColor: 'bg-yellow-500',
          text: 'Level 3 - Urgent',
          description: 'Kegawatan sedang',
          waitTime: '30-60 menit'
        }
      case 4:
        return {
          color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
          bgColor: 'bg-green-500',
          text: 'Level 4 - Semi Urgent',
          description: 'Kegawatan rendah',
          waitTime: '2-4 jam'
        }
      case 5:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
          bgColor: 'bg-blue-500',
          text: 'Level 5 - Non Urgent',
          description: 'Kegawatan minimal',
          waitTime: '4-6 jam'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
          bgColor: 'bg-gray-500',
          text: 'Unknown',
          description: '',
          waitTime: ''
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

  const calculateTriageLevel = (vitals: any, complaint: string) => {
    // Level 1: Immediate - Life threatening
    if (vitals.respirationRate > 30 || vitals.respirationRate < 8 ||
        vitals.oxygenSaturation < 90 || vitals.heartRate > 130 ||
        vitals.heartRate < 40 || vitals.bloodPressure.split('/')[0] > 200 ||
        vitals.bloodPressure.split('/')[0] < 80 || vitals.painScale >= 9 ||
        complaint.toLowerCase().includes('sesak napas') ||
        complaint.toLowerCase().includes('nyeri dada hebat')) {
      return 1
    }

    // Level 2: Urgent - High priority
    if (vitals.respirationRate > 25 || vitals.oxygenSaturation < 93 ||
        vitals.heartRate > 110 || vitals.temperature > 39 ||
        vitals.painScale >= 7 || complaint.toLowerCase().includes('pendarahan')) {
      return 2
    }

    // Level 3: Standard - Moderate priority
    if (vitals.temperature > 38.5 || vitals.painScale >= 5 ||
        complaint.toLowerCase().includes('demam tinggi')) {
      return 3
    }

    // Level 4: Low priority
    if (vitals.painScale >= 3 || complaint.toLowerCase().includes('cedera')) {
      return 4
    }

    // Level 5: Minimal priority
    return 5
  }

  const handleSaveTriage = async () => {
    if (!selectedPatient) return

    try {
      const triageLevel = calculateTriageLevel(currentTriage.vitalSigns, currentTriage.chiefComplaint)
      const priority = triageLevel === 1 ? 'immediate' : triageLevel === 2 ? 'urgent' : triageLevel === 3 ? 'urgent' : triageLevel === 4 ? 'standard' : 'non_urgent'
      const estimatedWaitTime = getTriageLevelInfo(triageLevel).waitTime

      const triageData = {
        registration_id: parseInt(selectedPatient.registration_id), // Use actual registration_id
        patient_id: parseInt(selectedPatient.patient_id), // Use actual patient_id
        chief_complaint: currentTriage.chiefComplaint,
        vital_signs: currentTriage.vitalSigns,
        priority: priority,
        estimated_wait_time: estimatedWaitTime,
        notes: currentTriage.notes,
        triage_time: new Date().toISOString()
      }

      const response = await fetch('/api/triases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(triageData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh data
          fetchPatients()
          loadUntriagedPatients() // Also refresh untriaged patients list

          // Reset form
          setCurrentTriage({
            chiefComplaint: '',
            vitalSigns: {
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              respirationRate: '',
              oxygenSaturation: '',
              painScale: 0,
              consciousness: 'Compos mentis'
            },
            notes: ''
          })
          setShowTriageForm(false)
          setSelectedPatient(null)
        } else {
          console.error('Failed to save triage:', result.message)
        }
      } else {
        console.error('Failed to save triage')
      }
    } catch (error) {
      console.error('Error saving triage:', error)
    }
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
            onClick={fetchPatients}
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

      {/* Triage Level Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Level Triase</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(level => {
            const info = getTriageLevelInfo(level)
            return (
              <div key={level} className={`p-4 rounded-lg border ${info.color}`}>
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
              <option value="all">Semua Level</option>
              <option value={1}>Level 1 - Resusitasi</option>
              <option value={2}>Level 2 - Emergensi</option>
              <option value={3}>Level 3 - Urgent</option>
              <option value={4}>Level 4 - Semi Urgent</option>
              <option value={5}>Level 5 - Non Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Queue */}
      <div className="space-y-4">
        {filteredPatients.map((patient) => {
          const triageInfo = getTriageLevelInfo(patient.triageLevel)
          return (
            <div key={patient.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${triageInfo.bgColor} flex items-center justify-center text-white font-bold text-lg`}>
                    {patient.triageLevel}
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
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Level Triase yang Direkomendasikan</h4>
                      {(() => {
                        const level = calculateTriageLevel(currentTriage.vitalSigns, currentTriage.chiefComplaint)
                        const info = getTriageLevelInfo(level)
                        return (
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${info.color}`}>
                            <div className={`w-6 h-6 rounded-full ${info.bgColor} flex items-center justify-center text-white font-bold`}>
                              {level}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map(level => {
          const count = patients.filter(p => p.triageLevel === level).length
          const info = getTriageLevelInfo(level)
          return (
            <div key={level} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${info.bgColor} flex items-center justify-center text-white font-bold text-xl`}>
                  {level}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level {level}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
