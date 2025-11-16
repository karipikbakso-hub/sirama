'use client'

import { useState, useEffect } from 'react'
import {
  MdNoteAlt,
  MdSearch,
  MdAdd,
  MdEdit,
  MdSave,
  MdPerson,
  MdAccessTime,
  MdRefresh,
  MdAssessment,
  MdTimeline,
  MdMedicalServices,
  MdPsychology,
  MdLocalHospital,
  MdCheckCircle,
  MdWarning,
  MdInfo
} from 'react-icons/md'

interface CPPTEntry {
  id: string
  patientId: string
  patientName: string
  medicalRecordNumber: string
  date: string
  time: string
  nurseId: string
  nurseName: string
  shift: 'pagi' | 'siang' | 'malam'
  assessment: {
    subjective: string
    objective: string
    vitalSigns: {
      bloodPressure: string
      heartRate: string
      temperature: string
      respirationRate: string
      oxygenSaturation: string
    }
    painScale: number
    consciousness: string
  }
  diagnosis: {
    nursing: string[]
    medical: string[]
  }
  planning: {
    shortTerm: string[]
    longTerm: string[]
  }
  intervention: {
    nursing: string[]
    medical: string[]
    education: string[]
  }
  evaluation: {
    outcome: string
    followUp: string
    notes: string
  }
  status: 'active' | 'completed' | 'reviewed'
}

interface Patient {
  id: string
  name: string
  medicalRecordNumber: string
  room: string
  bed: string
  lastCPPT?: CPPTEntry
}

export default function CPPTPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [cpptEntries, setCpptEntries] = useState<CPPTEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<CPPTEntry | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'assessment' | 'diagnosis' | 'planning' | 'intervention' | 'evaluation'>('assessment')

  // Ensure patients is always an array
  const safePatients = Array.isArray(patients) ? patients : []

  const [currentCPPT, setCurrentCPPT] = useState({
    assessment: {
      subjective: '',
      objective: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        respirationRate: '',
        oxygenSaturation: ''
      },
      painScale: 0,
      consciousness: 'Compos mentis'
    },
    diagnosis: {
      nursing: [''],
      medical: ['']
    },
    planning: {
      shortTerm: [''],
      longTerm: ['']
    },
    intervention: {
      nursing: [''],
      medical: [''],
      education: ['']
    },
    evaluation: {
      outcome: '',
      followUp: '',
      notes: ''
    }
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (safePatients.length > 0) {
      fetchCPPTEntries()
    }
  }, [safePatients])

  const fetchPatients = async () => {
    try {
      // Fetch patients with their latest CPPT entries
      const response = await fetch('/api/patients?with_latest_cppt=true')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.data || [])
      } else {
        console.error('Failed to fetch patients')
        // Fallback to mock data for development
        setPatients([
          {
            id: '1',
            name: 'Budi Santoso',
            medicalRecordNumber: 'MR-2025-001',
            room: 'Ward-01',
            bed: 'A1'
          },
          {
            id: '2',
            name: 'Maya Sari',
            medicalRecordNumber: 'MR-2025-002',
            room: 'ICU-01',
            bed: 'B1'
          },
          {
            id: '3',
            name: 'Ahmad Surya',
            medicalRecordNumber: 'MR-2025-003',
            room: 'Ward-02',
            bed: 'C2'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Fallback to mock data
      setPatients([
        {
          id: '1',
          name: 'Budi Santoso',
          medicalRecordNumber: 'MR-2025-001',
          room: 'Ward-01',
          bed: 'A1'
        },
        {
          id: '2',
          name: 'Maya Sari',
          medicalRecordNumber: 'MR-2025-002',
          room: 'ICU-01',
          bed: 'B1'
        },
        {
          id: '3',
          name: 'Ahmad Surya',
          medicalRecordNumber: 'MR-2025-003',
          room: 'Ward-02',
          bed: 'C2'
        }
      ])
    }
  }

  const fetchCPPTEntries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cppt-nursing-entries')
      if (response.ok) {
        const data = await response.json()
        setCpptEntries(data.data || [])
      } else {
        console.error('Failed to fetch CPPT entries')
        // Fallback to mock data
        const mockEntries: CPPTEntry[] = safePatients
          .filter(p => p.lastCPPT)
          .map(p => p.lastCPPT!)
          .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
        setCpptEntries(mockEntries)
      }
    } catch (error) {
      console.error('Error fetching CPPT entries:', error)
      // Fallback to mock data
      const mockEntries: CPPTEntry[] = safePatients
        .filter(p => p.lastCPPT)
        .map(p => p.lastCPPT!)
        .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
      setCpptEntries(mockEntries)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = safePatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.room.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'reviewed':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <MdTimeline className="text-blue-500 text-lg" />
      case 'completed':
        return <MdCheckCircle className="text-green-500 text-lg" />
      case 'reviewed':
        return <MdAssessment className="text-purple-500 text-lg" />
      default:
        return <MdInfo className="text-gray-500 text-lg" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'completed': return 'Selesai'
      case 'reviewed': return 'Ditinjau'
      default: return status
    }
  }

  const getShiftText = (shift: string) => {
    switch (shift) {
      case 'pagi': return 'Pagi (07:00-14:00)'
      case 'siang': return 'Siang (14:00-21:00)'
      case 'malam': return 'Malam (21:00-07:00)'
      default: return shift
    }
  }

  const handleSaveCPPT = async () => {
    if (!selectedPatient) return

    const cpptData = {
      pasien_id: selectedPatient.id,
      tanggal_waktu: new Date().toISOString(),
      shift: new Date().getHours() < 14 ? (new Date().getHours() < 7 ? 'malam' : 'pagi') : 'siang',
      assessment: currentCPPT.assessment,
      diagnosis: currentCPPT.diagnosis,
      planning: currentCPPT.planning,
      intervention: currentCPPT.intervention,
      evaluation: currentCPPT.evaluation,
      status: 'active'
    }

    try {
      const response = await fetch('/api/cppt-nursing-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cpptData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('CPPT entry saved:', result)

        // Refresh data
        fetchCPPTEntries()
        fetchPatients()

        // Reset form
        setCurrentCPPT({
          assessment: {
            subjective: '',
            objective: '',
            vitalSigns: {
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              respirationRate: '',
              oxygenSaturation: ''
            },
            painScale: 0,
            consciousness: 'Compos mentis'
          },
          diagnosis: {
            nursing: [''],
            medical: ['']
          },
          planning: {
            shortTerm: [''],
            longTerm: ['']
          },
          intervention: {
            nursing: [''],
            medical: [''],
            education: ['']
          },
          evaluation: {
            outcome: '',
            followUp: '',
            notes: ''
          }
        })
        setShowForm(false)
        setSelectedPatient(null)
      } else {
        console.error('Failed to save CPPT entry')
        // Fallback to local state update for development
        const newEntry: CPPTEntry = {
          id: Date.now().toString(),
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          medicalRecordNumber: selectedPatient.medicalRecordNumber,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          nurseId: 'current-nurse-id',
          nurseName: 'Siti Nurhaliza',
          shift: cpptData.shift as 'malam' | 'pagi' | 'siang',
          assessment: currentCPPT.assessment,
          diagnosis: currentCPPT.diagnosis,
          planning: currentCPPT.planning,
          intervention: currentCPPT.intervention,
          evaluation: currentCPPT.evaluation,
          status: 'active'
        }

        setCpptEntries(prev => [newEntry, ...prev])
        setPatients(prev => prev.map(p =>
          p.id === selectedPatient.id
            ? { ...p, lastCPPT: newEntry }
            : p
        ))

        setCurrentCPPT({
          assessment: {
            subjective: '',
            objective: '',
            vitalSigns: {
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              respirationRate: '',
              oxygenSaturation: ''
            },
            painScale: 0,
            consciousness: 'Compos mentis'
          },
          diagnosis: {
            nursing: [''],
            medical: ['']
          },
          planning: {
            shortTerm: [''],
            longTerm: ['']
          },
          intervention: {
            nursing: [''],
            medical: [''],
            education: ['']
          },
          evaluation: {
            outcome: '',
            followUp: '',
            notes: ''
          }
        })
        setShowForm(false)
        setSelectedPatient(null)
      }
    } catch (error) {
      console.error('Error saving CPPT entry:', error)
      // Fallback to local state update
      const newEntry: CPPTEntry = {
        id: Date.now().toString(),
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        medicalRecordNumber: selectedPatient.medicalRecordNumber,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        nurseId: 'current-nurse-id',
        nurseName: 'Siti Nurhaliza',
        shift: cpptData.shift as 'malam' | 'pagi' | 'siang',
        assessment: currentCPPT.assessment,
        diagnosis: currentCPPT.diagnosis,
        planning: currentCPPT.planning,
        intervention: currentCPPT.intervention,
        evaluation: currentCPPT.evaluation,
        status: 'active'
      }

      setCpptEntries(prev => [newEntry, ...prev])
      setPatients(prev => prev.map(p =>
        p.id === selectedPatient.id
          ? { ...p, lastCPPT: newEntry }
          : p
      ))

      setCurrentCPPT({
        assessment: {
          subjective: '',
          objective: '',
          vitalSigns: {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            respirationRate: '',
            oxygenSaturation: ''
          },
          painScale: 0,
          consciousness: 'Compos mentis'
        },
        diagnosis: {
          nursing: [''],
          medical: ['']
        },
        planning: {
          shortTerm: [''],
          longTerm: ['']
        },
        intervention: {
          nursing: [''],
          medical: [''],
          education: ['']
        },
        evaluation: {
          outcome: '',
          followUp: '',
          notes: ''
        }
      })
      setShowForm(false)
      setSelectedPatient(null)
    }
  }

  const addItemToArray = (section: string, field: string) => {
    setCurrentCPPT(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: [...(prev[section as keyof typeof prev] as any)[field], '']
      }
    }))
  }

  const updateArrayItem = (section: string, field: string, index: number, value: string) => {
    setCurrentCPPT(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: (prev[section as keyof typeof prev] as any)[field].map((item: string, i: number) =>
          i === index ? value : item
        )
      }
    }))
  }

  const removeArrayItem = (section: string, field: string, index: number) => {
    setCurrentCPPT(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: (prev[section as keyof typeof prev] as any)[field].filter((_: string, i: number) => i !== index)
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            CPPT Keperawatan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dokumentasi perawatan pasien terintegrasi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchPatients(); fetchCPPTEntries(); }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdAdd className="text-lg" />
            Buat CPPT Baru
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex-1 max-w-md">
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
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <MdPerson className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {patient.room} - {patient.bed}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {patient.medicalRecordNumber}
                  </p>
                </div>
              </div>
              {patient.lastCPPT && (
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.lastCPPT.status)}`}>
                  {getStatusIcon(patient.lastCPPT.status)}
                  {getStatusText(patient.lastCPPT.status)}
                </span>
              )}
            </div>

            {patient.lastCPPT && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MdAccessTime className="text-gray-400 text-lg" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {patient.lastCPPT.date} {patient.lastCPPT.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MdMedicalServices className="text-gray-400 text-lg" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Shift: {getShiftText(patient.lastCPPT.shift)}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {patient.lastCPPT.assessment.subjective}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedPatient(patient); setShowForm(true); }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <MdNoteAlt className="text-lg" />
                Buat CPPT
              </button>
              {patient.lastCPPT && (
                <button
                  onClick={() => setSelectedEntry(patient.lastCPPT!)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <MdAssessment className="text-lg" />
                  Lihat
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CPPT Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dokumentasi CPPT
                  {selectedPatient && ` - ${selectedPatient.name}`}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clinical Progress Patient Tracking
                </p>
              </div>
              <button
                onClick={() => { setShowForm(false); setSelectedPatient(null); }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdInfo className="text-gray-400 text-lg" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              {[
                { id: 'assessment', label: 'Assessment', icon: MdMedicalServices },
                { id: 'diagnosis', label: 'Diagnosis', icon: MdPsychology },
                { id: 'planning', label: 'Planning', icon: MdTimeline },
                { id: 'intervention', label: 'Intervention', icon: MdMedicalServices },
                { id: 'evaluation', label: 'Evaluation', icon: MdAssessment }
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

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Assessment Tab */}
              {activeTab === 'assessment' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subjective (Keluhan Pasien)
                      </label>
                      <textarea
                        value={currentCPPT.assessment.subjective}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: { ...prev.assessment, subjective: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Keluhan utama pasien..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Objective (Pemeriksaan Fisik)
                      </label>
                      <textarea
                        value={currentCPPT.assessment.objective}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: { ...prev.assessment, objective: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Hasil pemeriksaan fisik..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        TD (mmHg)
                      </label>
                      <input
                        type="text"
                        value={currentCPPT.assessment.vitalSigns.bloodPressure}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: {
                            ...prev.assessment,
                            vitalSigns: { ...prev.assessment.vitalSigns, bloodPressure: e.target.value }
                          }
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
                        value={currentCPPT.assessment.vitalSigns.heartRate}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: {
                            ...prev.assessment,
                            vitalSigns: { ...prev.assessment.vitalSigns, heartRate: e.target.value }
                          }
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
                        value={currentCPPT.assessment.vitalSigns.temperature}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: {
                            ...prev.assessment,
                            vitalSigns: { ...prev.assessment.vitalSigns, temperature: e.target.value }
                          }
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
                        value={currentCPPT.assessment.vitalSigns.respirationRate}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: {
                            ...prev.assessment,
                            vitalSigns: { ...prev.assessment.vitalSigns, respirationRate: e.target.value }
                          }
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
                        value={currentCPPT.assessment.vitalSigns.oxygenSaturation}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: {
                            ...prev.assessment,
                            vitalSigns: { ...prev.assessment.vitalSigns, oxygenSaturation: e.target.value }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Skala Nyeri (0-10)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={currentCPPT.assessment.painScale}
                          onChange={(e) => setCurrentCPPT(prev => ({
                            ...prev,
                            assessment: { ...prev.assessment, painScale: parseInt(e.target.value) }
                          }))}
                          className="flex-1"
                        />
                        <span className="font-medium text-lg w-8 text-center">
                          {currentCPPT.assessment.painScale}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kesadaran
                      </label>
                      <select
                        value={currentCPPT.assessment.consciousness}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          assessment: { ...prev.assessment, consciousness: e.target.value }
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
              )}

              {/* Diagnosis Tab */}
              {activeTab === 'diagnosis' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Diagnosis Keperawatan
                      </label>
                      <div className="space-y-2">
                        {currentCPPT.diagnosis.nursing.map((diagnosis, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={diagnosis}
                              onChange={(e) => updateArrayItem('diagnosis', 'nursing', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan diagnosis keperawatan..."
                            />
                            {currentCPPT.diagnosis.nursing.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('diagnosis', 'nursing', index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItemToArray('diagnosis', 'nursing')}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                        >
                          <MdAdd className="text-lg" />
                          Tambah Diagnosis
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Diagnosis Medis
                      </label>
                      <div className="space-y-2">
                        {currentCPPT.diagnosis.medical.map((diagnosis, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={diagnosis}
                              onChange={(e) => updateArrayItem('diagnosis', 'medical', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan diagnosis medis..."
                            />
                            {currentCPPT.diagnosis.medical.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('diagnosis', 'medical', index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItemToArray('diagnosis', 'medical')}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                        >
                          <MdAdd className="text-lg" />
                          Tambah Diagnosis
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Planning Tab */}
              {activeTab === 'planning' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Planning Jangka Pendek
                      </label>
                      <div className="space-y-2">
                        {currentCPPT.planning.shortTerm.map((plan, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={plan}
                              onChange={(e) => updateArrayItem('planning', 'shortTerm', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan planning jangka pendek..."
                            />
                            {currentCPPT.planning.shortTerm.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('planning', 'shortTerm', index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItemToArray('planning', 'shortTerm')}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                        >
                          <MdAdd className="text-lg" />
                          Tambah Planning
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Planning Jangka Panjang
                      </label>
                      <div className="space-y-2">
                        {currentCPPT.planning.longTerm.map((plan, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={plan}
                              onChange={(e) => updateArrayItem('planning', 'longTerm', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan planning jangka panjang..."
                            />
                            {currentCPPT.planning.longTerm.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('planning', 'longTerm', index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItemToArray('planning', 'longTerm')}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                        >
                          <MdAdd className="text-lg" />
                          Tambah Planning
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Intervention Tab */}
              {activeTab === 'intervention' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Intervensi Keperawatan
                      </label>
                      <div className="space-y-2">
                        {currentCPPT.intervention.nursing.map((intervention, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={intervention}
                              onChange={(e) => updateArrayItem('intervention', 'nursing', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan intervensi keperawatan..."
                            />
                            {currentCPPT.intervention.nursing.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('intervention', 'nursing', index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItemToArray('intervention', 'nursing')}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                        >
                          <MdAdd className="text-lg" />
                          Tambah Intervensi
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Intervensi Medis
                      </label>
                      <div className="space-y-2">
                        {currentCPPT.intervention.medical.map((intervention, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={intervention}
                              onChange={(e) => updateArrayItem('intervention', 'medical', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan intervensi medis..."
                            />
                            {currentCPPT.intervention.medical.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('intervention', 'medical', index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItemToArray('intervention', 'medical')}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                        >
                          <MdAdd className="text-lg" />
                          Tambah Intervensi
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Edukasi Pasien/Keluarga
                      </label>
                      <div className="space-y-2">
                        {currentCPPT.intervention.education.map((education, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={education}
                              onChange={(e) => updateArrayItem('intervention', 'education', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Masukkan edukasi..."
                            />
                            {currentCPPT.intervention.education.length > 1 && (
                              <button
                                onClick={() => removeArrayItem('intervention', 'education', index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addItemToArray('intervention', 'education')}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                        >
                          <MdAdd className="text-lg" />
                          Tambah Edukasi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluation Tab */}
              {activeTab === 'evaluation' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Outcome/Evaluasi Hasil
                      </label>
                      <textarea
                        value={currentCPPT.evaluation.outcome}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          evaluation: { ...prev.evaluation, outcome: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Jelaskan hasil evaluasi..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rencana Tindak Lanjut
                      </label>
                      <textarea
                        value={currentCPPT.evaluation.followUp}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          evaluation: { ...prev.evaluation, followUp: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Rencana tindak lanjut..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Catatan Tambahan
                      </label>
                      <textarea
                        value={currentCPPT.evaluation.notes}
                        onChange={(e) => setCurrentCPPT(prev => ({
                          ...prev,
                          evaluation: { ...prev.evaluation, notes: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Catatan tambahan..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowForm(false); setSelectedPatient(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCPPT}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Simpan CPPT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CPPT Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detail CPPT - {selectedEntry.patientName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedEntry.date} {selectedEntry.time} - Shift {getShiftText(selectedEntry.shift)}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdInfo className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Assessment */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MdMedicalServices className="text-blue-500 text-lg" />
                  Assessment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Subjective</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.assessment.subjective}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Objective</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.assessment.objective}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">TD</span>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedEntry.assessment.vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">HR</span>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedEntry.assessment.vitalSigns.heartRate}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Temp</span>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedEntry.assessment.vitalSigns.temperature}°C</p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">RR</span>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedEntry.assessment.vitalSigns.respirationRate}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">SpO2</span>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedEntry.assessment.vitalSigns.oxygenSaturation}%</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MdPsychology className="text-purple-500 text-lg" />
                  Diagnosis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Keperawatan</h5>
                    <ul className="space-y-1">
                      {selectedEntry.diagnosis.nursing.map((diagnosis, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {diagnosis}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Medis</h5>
                    <ul className="space-y-1">
                      {selectedEntry.diagnosis.medical.map((diagnosis, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {diagnosis}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Planning */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MdTimeline className="text-green-500 text-lg" />
                  Planning
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Jangka Pendek</h5>
                    <ul className="space-y-1">
                      {selectedEntry.planning.shortTerm.map((plan, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {plan}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Jangka Panjang</h5>
                    <ul className="space-y-1">
                      {selectedEntry.planning.longTerm.map((plan, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {plan}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Intervention */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MdMedicalServices className="text-blue-500 text-lg" />
                  Intervention
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Keperawatan</h5>
                    <ul className="space-y-1">
                      {selectedEntry.intervention.nursing.map((intervention, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {intervention}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Medis</h5>
                    <ul className="space-y-1">
                      {selectedEntry.intervention.medical.map((intervention, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {intervention}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Edukasi</h5>
                    <ul className="space-y-1">
                      {selectedEntry.intervention.education.map((education, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">• {education}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Evaluation */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MdAssessment className="text-orange-500 text-lg" />
                  Evaluation
                </h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Outcome</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.evaluation.outcome}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Rencana Tindak Lanjut</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.evaluation.followUp}</p>
                  </div>
                  {selectedEntry.evaluation.notes && (
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEntry.evaluation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Tutup
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Edit CPPT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdNoteAlt className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total CPPT</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cpptEntries.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdTimeline className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cpptEntries.filter(e => e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdCheckCircle className="text-green-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cpptEntries.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdAssessment className="text-purple-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ditinjau</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cpptEntries.filter(e => e.status === 'reviewed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
