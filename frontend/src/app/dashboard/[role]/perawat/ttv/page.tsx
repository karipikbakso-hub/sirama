'use client'

import { useState, useEffect } from 'react'
import {
  MdFavorite,
  MdThermostat,
  MdMonitorHeart,
  MdAir,
  MdScale,
  MdPerson,
  MdAdd,
  MdEdit,
  MdSave,
  MdRefresh,
  MdSearch,
  MdLocalHospital,
  MdAccessTime,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdClose
} from 'react-icons/md'

interface VitalSigns {
  id: string
  patientId: string
  patientName: string
  room: string
  timestamp: string
  bloodPressure: {
    systolic: number
    diastolic: number
  }
  heartRate: number
  temperature: number
  respirationRate: number
  oxygenSaturation: number
  weight?: number
  height?: number
  bmi?: number
  notes?: string
  nurseId: string
  nurseName: string
  status: 'normal' | 'warning' | 'critical'
}

interface Patient {
  id: string
  name: string
  room: string
  bed: string
  lastVitalSigns?: VitalSigns | null
}

export default function VitalSignsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentVitalSigns, setCurrentVitalSigns] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respirationRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    notes: ''
  })

  useEffect(() => {
    fetchPatients()
    fetchVitalSigns()
  }, [])

  const fetchPatients = async () => {
    try {
      // Fetch active patients from nursing dashboard
      const response = await fetch('/api/dashboard/nursing/active-patients')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.active_patients) {
          // Transform data to match our Patient interface
          const transformedPatients: Patient[] = data.data.active_patients.map((patient: any) => ({
            id: patient.patient_id.toString(),
            name: patient.patient_name,
            room: patient.room || patient.department || 'Unknown',
            bed: patient.bed || 'Unknown',
            lastVitalSigns: null // Will be populated by fetchVitalSigns
          }))
          setPatients(transformedPatients)
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Fallback to mock data if API fails
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'Ahmad Surya',
          room: 'ICU-01',
          bed: 'A1',
          lastVitalSigns: null
        },
        {
          id: '2',
          name: 'Maya Sari',
          room: 'Ward-02',
          bed: 'B2',
          lastVitalSigns: null
        },
        {
          id: '3',
          name: 'Budi Santoso',
          room: 'Ward-01',
          bed: 'A3',
          lastVitalSigns: null
        }
      ]
      setPatients(mockPatients)
    }
  }

  const fetchVitalSigns = async () => {
    try {
      setLoading(true)
      // Fetch all vital signs from API
      const response = await fetch('/api/vital-signs')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform API data to match our VitalSigns interface
          const transformedVitalSigns: VitalSigns[] = data.data.data.map((vital: any) => ({
            id: vital.id.toString(),
            patientId: vital.patient_id.toString(),
            patientName: vital.patient?.name || 'Unknown',
            room: vital.registration?.room || 'Unknown',
            timestamp: vital.measured_at,
            bloodPressure: {
              systolic: vital.blood_pressure_systolic || 0,
              diastolic: vital.blood_pressure_diastolic || 0
            },
            heartRate: vital.heart_rate || 0,
            temperature: vital.temperature || 0,
            respirationRate: vital.respiration_rate || 0,
            oxygenSaturation: vital.oxygen_saturation || 0,
            weight: vital.weight,
            height: vital.height,
            bmi: vital.bmi,
            notes: vital.notes,
            nurseId: vital.nurse_id.toString(),
            nurseName: vital.nurse?.name || 'Unknown',
            status: vital.status as 'normal' | 'warning' | 'critical'
          }))

          setVitalSigns(transformedVitalSigns)

          // Update patients with latest vital signs
          setPatients(prevPatients =>
            prevPatients.map(patient => {
              const latestVital = transformedVitalSigns
                .filter(v => v.patientId === patient.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
              return {
                ...patient,
                lastVitalSigns: latestVital || null
              }
            })
          )
        }
      }
    } catch (error) {
      console.error('Error fetching vital signs:', error)
      // Fallback to mock data if API fails
      const mockVitalSigns: VitalSigns[] = patients
        .filter(p => p.lastVitalSigns)
        .map(p => p.lastVitalSigns!)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setVitalSigns(mockVitalSigns)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.room.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <MdCheckCircle className="text-green-500 text-lg" />
      case 'warning':
        return <MdWarning className="text-yellow-500 text-lg" />
      case 'critical':
        return <MdError className="text-red-500 text-lg" />
      default:
        return <MdCheckCircle className="text-gray-500 text-lg" />
    }
  }

  const calculateBMI = (weight: number, height: number) => {
    if (weight && height) {
      const heightInMeters = height / 100
      return (weight / (heightInMeters * heightInMeters)).toFixed(1)
    }
    return ''
  }

  const handleSaveVitalSigns = async () => {
    if (!selectedPatient) return

    try {
      // Prepare data for API
      const vitalData = {
        registration_id: selectedPatient.id, // Assuming patient ID is registration ID for now
        patient_id: selectedPatient.id,
        blood_pressure_systolic: parseInt(currentVitalSigns.bloodPressureSystolic) || null,
        blood_pressure_diastolic: parseInt(currentVitalSigns.bloodPressureDiastolic) || null,
        heart_rate: parseInt(currentVitalSigns.heartRate) || null,
        temperature: parseFloat(currentVitalSigns.temperature) || null,
        respiration_rate: parseInt(currentVitalSigns.respirationRate) || null,
        oxygen_saturation: parseInt(currentVitalSigns.oxygenSaturation) || null,
        weight: parseFloat(currentVitalSigns.weight) || null,
        height: parseFloat(currentVitalSigns.height) || null,
        notes: currentVitalSigns.notes || null,
        measured_at: new Date().toISOString()
      }

      // Save to API
      const response = await fetch('/api/vital-signs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vitalData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform API response to match our VitalSigns interface
          const newVitalSigns: VitalSigns = {
            id: data.data.id.toString(),
            patientId: data.data.patient_id.toString(),
            patientName: selectedPatient.name,
            room: selectedPatient.room,
            timestamp: data.data.measured_at,
            bloodPressure: {
              systolic: data.data.blood_pressure_systolic || 0,
              diastolic: data.data.blood_pressure_diastolic || 0
            },
            heartRate: data.data.heart_rate || 0,
            temperature: data.data.temperature || 0,
            respirationRate: data.data.respiration_rate || 0,
            oxygenSaturation: data.data.oxygen_saturation || 0,
            weight: data.data.weight,
            height: data.data.height,
            bmi: data.data.bmi,
            notes: data.data.notes,
            nurseId: data.data.nurse_id.toString(),
            nurseName: data.data.nurse?.name || 'Unknown',
            status: data.data.status as 'normal' | 'warning' | 'critical'
          }

          // Update local state
          setVitalSigns(prev => [newVitalSigns, ...prev])
          setPatients(prev => prev.map(p =>
            p.id === selectedPatient.id
              ? { ...p, lastVitalSigns: newVitalSigns }
              : p
          ))

          // Reset form
          setCurrentVitalSigns({
            bloodPressureSystolic: '',
            bloodPressureDiastolic: '',
            heartRate: '',
            temperature: '',
            respirationRate: '',
            oxygenSaturation: '',
            weight: '',
            height: '',
            notes: ''
          })
          setShowForm(false)
          setSelectedPatient(null)

          // Refresh data
          fetchVitalSigns()
        }
      } else {
        console.error('Failed to save vital signs')
      }
    } catch (error) {
      console.error('Error saving vital signs:', error)
      // Fallback to local state update if API fails
      const newVitalSigns: VitalSigns = {
        id: Date.now().toString(),
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        room: selectedPatient.room,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        bloodPressure: {
          systolic: parseInt(currentVitalSigns.bloodPressureSystolic) || 0,
          diastolic: parseInt(currentVitalSigns.bloodPressureDiastolic) || 0
        },
        heartRate: parseInt(currentVitalSigns.heartRate) || 0,
        temperature: parseFloat(currentVitalSigns.temperature) || 0,
        respirationRate: parseInt(currentVitalSigns.respirationRate) || 0,
        oxygenSaturation: parseInt(currentVitalSigns.oxygenSaturation) || 0,
        weight: parseFloat(currentVitalSigns.weight) || undefined,
        height: parseFloat(currentVitalSigns.height) || undefined,
        bmi: currentVitalSigns.weight && currentVitalSigns.height
          ? parseFloat(calculateBMI(parseFloat(currentVitalSigns.weight), parseFloat(currentVitalSigns.height)))
          : undefined,
        notes: currentVitalSigns.notes,
        nurseId: 'current-nurse-id',
        nurseName: 'Siti Nurhaliza',
        status: determineStatus({
          systolic: parseInt(currentVitalSigns.bloodPressureSystolic) || 0,
          diastolic: parseInt(currentVitalSigns.bloodPressureDiastolic) || 0,
          heartRate: parseInt(currentVitalSigns.heartRate) || 0,
          temperature: parseFloat(currentVitalSigns.temperature) || 0,
          respirationRate: parseInt(currentVitalSigns.respirationRate) || 0,
          oxygenSaturation: parseInt(currentVitalSigns.oxygenSaturation) || 0
        })
      }

      setVitalSigns(prev => [newVitalSigns, ...prev])
      setPatients(prev => prev.map(p =>
        p.id === selectedPatient.id
          ? { ...p, lastVitalSigns: newVitalSigns }
          : p
      ))

      setCurrentVitalSigns({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        respirationRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        notes: ''
      })
      setShowForm(false)
      setSelectedPatient(null)
    }
  }

  const determineStatus = (vitals: any) => {
    if (vitals.systolic > 160 || vitals.systolic < 90 ||
        vitals.temperature > 38.5 || vitals.temperature < 35 ||
        vitals.heartRate > 100 || vitals.heartRate < 50 ||
        vitals.oxygenSaturation < 95) {
      return 'warning'
    }
    return 'normal'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Tanda Vital Pasien
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pantau dan catat tanda-tanda vital pasien
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchPatients(); fetchVitalSigns(); }}
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
            Catat TTV
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
                </div>
              </div>
              {patient.lastVitalSigns && (
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.lastVitalSigns.status)}`}>
                  {getStatusIcon(patient.lastVitalSigns.status)}
                  {patient.lastVitalSigns.status === 'normal' ? 'Normal' :
                   patient.lastVitalSigns.status === 'warning' ? 'Perhatian' : 'Kritis'}
                </span>
              )}
            </div>

            {patient.lastVitalSigns && (
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MdFavorite className="text-red-500 text-lg" />
                    <span className="text-gray-600 dark:text-gray-400">TD:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {patient.lastVitalSigns.bloodPressure.systolic}/{patient.lastVitalSigns.bloodPressure.diastolic}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdMonitorHeart className="text-pink-500 text-lg" />
                    <span className="text-gray-600 dark:text-gray-400">HR:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {patient.lastVitalSigns.heartRate} bpm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdThermostat className="text-orange-500 text-lg" />
                    <span className="text-gray-600 dark:text-gray-400">Temp:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {patient.lastVitalSigns.temperature}°C
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdAir className="text-blue-500 text-lg" />
                    <span className="text-gray-600 dark:text-gray-400">RR:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {patient.lastVitalSigns.respirationRate}/min
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MdAccessTime className="text-gray-400 text-lg" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {patient.lastVitalSigns.timestamp}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedPatient(patient); setShowForm(true); }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <MdEdit className="text-lg" />
                Catat TTV
              </button>
              {patient.lastVitalSigns && (
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <MdLocalHospital className="text-lg" />
                  Detail
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Vital Signs Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Catat Tanda Vital
                {selectedPatient && ` - ${selectedPatient.name}`}
              </h3>
              <button
                onClick={() => { setShowForm(false); setSelectedPatient(null); }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdClose className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Pressure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tekanan Darah (mmHg)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Sistolik"
                    value={currentVitalSigns.bloodPressureSystolic}
                    onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="flex items-center text-gray-500">/</span>
                  <input
                    type="number"
                    placeholder="Diastolik"
                    value={currentVitalSigns.bloodPressureDiastolic}
                    onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Denyut Jantung (bpm)
                </label>
                <input
                  type="number"
                  value={currentVitalSigns.heartRate}
                  onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Suhu Tubuh (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentVitalSigns.temperature}
                  onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Respiration Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Laju Pernapasan (/menit)
                </label>
                <input
                  type="number"
                  value={currentVitalSigns.respirationRate}
                  onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, respirationRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Oxygen Saturation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saturasi Oksigen (%)
                </label>
                <input
                  type="number"
                  value={currentVitalSigns.oxygenSaturation}
                  onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Weight & Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Berat & Tinggi Badan
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Berat (kg)"
                    value={currentVitalSigns.weight}
                    onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, weight: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Tinggi (cm)"
                    value={currentVitalSigns.height}
                    onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, height: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {currentVitalSigns.weight && currentVitalSigns.height && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    BMI: {calculateBMI(parseFloat(currentVitalSigns.weight), parseFloat(currentVitalSigns.height))}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catatan
                </label>
                <textarea
                  value={currentVitalSigns.notes}
                  onChange={(e) => setCurrentVitalSigns(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setSelectedPatient(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveVitalSigns}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Simpan TTV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Vital Signs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Riwayat Tanda Vital Terbaru
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  TD (mmHg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  HR (bpm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Temp (°C)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RR (/min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SpO2 (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {vitalSigns.slice(0, 10).map((vital) => (
                <tr key={vital.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {vital.patientName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {vital.room}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {vital.heartRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {vital.temperature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {vital.respirationRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {vital.oxygenSaturation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vital.status)}`}>
                      {vital.status === 'normal' ? 'Normal' :
                       vital.status === 'warning' ? 'Perhatian' : 'Kritis'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {vital.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
