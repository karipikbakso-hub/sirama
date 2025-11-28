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
  MdAssignment,
  MdScience,
  MdImage,
  MdHistory,
  MdError,
  MdSick,
  MdExpandMore
} from 'react-icons/md'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface Patient {
  id: number
  mrn: string
  name: string
  nik: string
  birth_date: string
  gender: string
  phone?: string
  address?: string
  allergies?: string
  chronic_diseases?: string
  insurance_status?: string
  bpjs_number?: string
}

interface Registration {
  id: number
  registration_date: string
  complaint: string
  doctor: string
  poli: string
  status: string
}

interface Examination {
  id: number
  registration_id: number
  diagnosis: string
  therapy: string
  anamnesis: string
  physical_exam: string
  vital_signs: {
    weight: number
    height: number
    blood_pressure_systolic: number
    blood_pressure_diastolic: number
    temperature: number
    pulse: number
  }
  created_at: string
}

interface Prescription {
  id: number
  registration_id: number
  items: Array<{
    medicine_name: string
    dosage: string
    frequency: string
  }>
  created_at: string
}

interface LabOrder {
  id: number
  registration_id: number
  test_name: string
  result: string
  status: string
  created_at: string
}

interface RadiologyOrder {
  id: number
  registration_id: number
  exam_name: string
  result_url: string
  status: string
  created_at: string
}

interface CpptEntry {
  id: number
  registration_id: number
  entry_type: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  created_at: string
}

interface EmrData {
  patient: Patient
  registrations: Registration[]
  t_pemeriksaan: Examination[]
  cppt_entries: CpptEntry[]
  prescriptions: Prescription[]
  lab_orders: LabOrder[]
  radiology_orders: RadiologyOrder[]
}

export default function EMRPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [emrData, setEmrData] = useState<EmrData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'pemeriksaan' | 'resep' | 'lab' | 'radiologi' | 'timeline'>('timeline')
  const [mobileCollapsed, setMobileCollapsed] = useState<{[key: string]: boolean}>({
    patientInfo: false,
    alerts: false,
    timeline: false,
    pemeriksaan: false,
    resep: false,
    lab: false,
    radiologi: false
  })

  // Remove useFetch hook, use direct fetch instead

  useEffect(() => {
    if (searchTerm.length >= 3) {
      handleSearch()
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const handleSearch = async () => {
    if (searchTerm.length < 3) return

    try {
      setSearching(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/pendaftaran/pasien/search?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data?.success) {
        setSearchResults(data.data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const loadEmrData = async (patientId: number) => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/patients/${patientId}/emr-readonly`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (data.success) {
        setEmrData(data.data)
        setSelectedPatient(data.data.patient)
      }
    } catch (error) {
      console.error('Error loading EMR data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setSearchTerm('')
    setSearchResults([])
    loadEmrData(patient.id)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const toggleCollapse = (section: string) => {
    setMobileCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePrint = () => {
    if (!selectedPatient || !emrData) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>EMR Summary - ${selectedPatient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .patient-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .alert { padding: 10px; border-radius: 5px; margin-bottom: 10px; }
            .alert-red { background: #fee; border: 1px solid #fcc; color: #c33; }
            .alert-yellow { background: #fff8e1; border: 1px solid #ffe082; color: #f57c00; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Electronic Medical Record Summary</h1>
            <p>Rumah Sakit SIRAMA</p>
          </div>

          <div class="patient-info">
            <h2>Informasi Pasien</h2>
            <p><strong>Nama:</strong> ${selectedPatient.name}</p>
            <p><strong>MRN:</strong> ${selectedPatient.mrn}</p>
            <p><strong>NIK:</strong> ${selectedPatient.nik}</p>
            <p><strong>Tanggal Lahir:</strong> ${selectedPatient.birth_date} (${calculateAge(selectedPatient.birth_date)} tahun)</p>
            <p><strong>Jenis Kelamin:</strong> ${selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
            <p><strong>Telepon:</strong> ${selectedPatient.phone || '-'}</p>
            <p><strong>Alamat:</strong> ${selectedPatient.address || '-'}</p>
          </div>

          ${selectedPatient.allergies ? `<div class="alert alert-red"><strong>Alergi:</strong> ${selectedPatient.allergies}</div>` : ''}
          ${selectedPatient.chronic_diseases ? `<div class="alert alert-yellow"><strong>Penyakit Kronis:</strong> ${selectedPatient.chronic_diseases}</div>` : ''}

          <div class="section">
            <h3>Riwayat Kunjungan</h3>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keluhan</th>
                  <th>Dokter</th>
                  <th>Poli</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${emrData.registrations.map(reg => `
                  <tr>
                    <td>${reg.registration_date}</td>
                    <td>${reg.complaint}</td>
                    <td>${reg.doctor}</td>
                    <td>${reg.poli}</td>
                    <td>${reg.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>Hasil Pemeriksaan (${emrData.t_pemeriksaan.length})</h3>
            ${emrData.t_pemeriksaan.map(exam => `
              <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
                <h4>Pemeriksaan - ${formatDate(exam.created_at)}</h4>
                <p><strong>Diagnosis:</strong> ${exam.diagnosis || 'Tidak ada diagnosis'}</p>
                <p><strong>Terapi:</strong> ${exam.therapy || 'Tidak ada terapi'}</p>
                <p><strong>Tanda Vital:</strong> TD ${exam.vital_signs.blood_pressure_systolic}/${exam.vital_signs.blood_pressure_diastolic} mmHg, Nadi ${exam.vital_signs.pulse} bpm, Suhu ${exam.vital_signs.temperature}°C</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h3>Resep Obat (${emrData.prescriptions.length})</h3>
            ${emrData.prescriptions.map(prescription => `
              <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
                <h4>Resep - ${formatDate(prescription.created_at)}</h4>
                <ul>
                  ${prescription.items.map(item => `<li>${item.medicine_name} - ${item.dosage} - ${item.frequency}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h3>Pemeriksaan Lab (${emrData.lab_orders.length})</h3>
            ${emrData.lab_orders.map(lab => `
              <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
                <h4>${lab.test_name}</h4>
                <p><strong>Status:</strong> ${lab.status}</p>
                <p><strong>Tanggal:</strong> ${formatDate(lab.created_at)}</p>
                ${lab.result ? `<p><strong>Hasil:</strong> ${lab.result}</p>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h3>Pemeriksaan Radiologi (${emrData.radiology_orders.length})</h3>
            ${emrData.radiology_orders.map(rad => `
              <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
                <h4>${rad.exam_name}</h4>
                <p><strong>Status:</strong> ${rad.status}</p>
                <p><strong>Tanggal:</strong> ${formatDate(rad.created_at)}</p>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            <p>Sistem Informasi Rumah Sakit SIRAMA</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            EMR Read-Only
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Electronic Medical Record - Akses Read-Only untuk Perawat
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdPrint className="text-lg" />
            Print EMR
          </button>
        </div>
      </div>

      {/* Patient Search */}
      <Card className="p-6">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Cari pasien berdasarkan nama, MRN, atau NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Search Results */}
        {searching && (
          <div className="mt-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Mencari pasien...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            {searchResults.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handlePatientSelect(patient)}
                className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <MdPerson className="text-blue-600 dark:text-blue-400 text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{patient.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      MRN: {patient.mrn} | NIK: {patient.nik}
                    </p>
                    <p className="text-sm text-gray-500">
                      {calculateAge(patient.birth_date)} tahun, {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* EMR Content */}
      {selectedPatient && (
        <div className="space-y-6">
          {/* Patient Alerts */}
          {(selectedPatient.allergies || selectedPatient.chronic_diseases) && (
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between md:hidden">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Peringatan Pasien</h3>
                <button
                  onClick={() => toggleCollapse('alerts')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Toggle alerts section"
                >
                  <MdExpandMore className={`text-xl transition-transform ${mobileCollapsed.alerts ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className={`space-y-3 ${mobileCollapsed.alerts ? 'hidden md:block' : ''}`}>
                {selectedPatient.allergies && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <MdError className="text-red-500 text-lg" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">Alergi</h4>
                      <p className="text-red-700 dark:text-red-300">{selectedPatient.allergies}</p>
                    </div>
                  </Alert>
                )}
                {selectedPatient.chronic_diseases && (
                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <MdSick className="text-yellow-500 text-lg" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Penyakit Kronis</h4>
                      <p className="text-yellow-700 dark:text-yellow-300">{selectedPatient.chronic_diseases}</p>
                    </div>
                  </Alert>
                )}
              </div>
            </Card>
          )}

          {/* Patient Header */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between md:hidden">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informasi Pasien</h3>
              <button
                onClick={() => toggleCollapse('patientInfo')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Toggle patient info section"
              >
                <MdExpandMore className={`text-xl transition-transform ${mobileCollapsed.patientInfo ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className={`flex items-center gap-4 ${mobileCollapsed.patientInfo ? 'hidden md:flex' : ''}`}>
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <MdPerson className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPatient.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  MRN: {selectedPatient.mrn} | NIK: {selectedPatient.nik}
                </p>
                <p className="text-sm text-gray-500">
                  {calculateAge(selectedPatient.birth_date)} tahun, {selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPatient.phone && `Telp: ${selectedPatient.phone}`} {selectedPatient.address && `| ${selectedPatient.address}`}
                </p>
              </div>
            </div>
          </Card>

          {/* EMR Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <MdTimeline className="text-lg" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="pemeriksaan" className="flex items-center gap-2">
                <MdMedicalServices className="text-lg" />
                Pemeriksaan
              </TabsTrigger>
              <TabsTrigger value="resep" className="flex items-center gap-2">
                <MdMedication className="text-lg" />
                Resep
              </TabsTrigger>
              <TabsTrigger value="lab" className="flex items-center gap-2">
                <MdScience className="text-lg" />
                Lab
              </TabsTrigger>
              <TabsTrigger value="radiologi" className="flex items-center gap-2">
                <MdImage className="text-lg" />
                Radiologi
              </TabsTrigger>
            </TabsList>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* EMR Data */}
            {emrData && !loading && (
              <>
                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-4 mt-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Timeline Riwayat Perawatan</h3>
                    <div className="space-y-6">
                      {/* Combine all events and sort by date */}
                      {(() => {
                        const allEvents: Array<{
                          id: string
                          type: string
                          title: string
                          description: string
                          date: string
                          icon: React.ReactNode
                          color: string
                        }> = []

                        // Add registrations
                        emrData.registrations.forEach(reg => {
                          allEvents.push({
                            id: `reg-${reg.id}`,
                            type: 'registration',
                            title: 'Kunjungan Pasien',
                            description: `${reg.complaint} - ${reg.doctor} (${reg.poli})`,
                            date: reg.registration_date,
                            icon: <MdCalendarToday className="text-blue-500" />,
                            color: 'blue'
                          })
                        })

                        // Add examinations
                        emrData.t_pemeriksaan.forEach(exam => {
                          allEvents.push({
                            id: `exam-${exam.id}`,
                            type: 'examination',
                            title: 'Pemeriksaan Dokter',
                            description: exam.diagnosis || 'Pemeriksaan medis',
                            date: exam.created_at,
                            icon: <MdMedicalServices className="text-green-500" />,
                            color: 'green'
                          })
                        })

                        // Add prescriptions
                        emrData.prescriptions.forEach(prescription => {
                          allEvents.push({
                            id: `prescription-${prescription.id}`,
                            type: 'prescription',
                            title: 'Resep Obat',
                            description: `${prescription.items.length} item obat`,
                            date: prescription.created_at,
                            icon: <MdMedication className="text-purple-500" />,
                            color: 'purple'
                          })
                        })

                        // Add lab orders
                        emrData.lab_orders.forEach(lab => {
                          allEvents.push({
                            id: `lab-${lab.id}`,
                            type: 'lab',
                            title: 'Pemeriksaan Lab',
                            description: lab.test_name,
                            date: lab.created_at,
                            icon: <MdScience className="text-orange-500" />,
                            color: 'orange'
                          })
                        })

                        // Add radiology orders
                        emrData.radiology_orders.forEach(rad => {
                          allEvents.push({
                            id: `rad-${rad.id}`,
                            type: 'radiology',
                            title: 'Pemeriksaan Radiologi',
                            description: rad.exam_name,
                            date: rad.created_at,
                            icon: <MdImage className="text-red-500" />,
                            color: 'red'
                          })
                        })

                        // Sort by date descending (newest first)
                        allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                        return allEvents.length === 0 ? (
                          <div className="text-center py-8">
                            <MdTimeline className="text-4xl text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada riwayat perawatan</h4>
                            <p className="text-gray-600 dark:text-gray-400">Timeline akan menampilkan semua aktivitas perawatan pasien</p>
                          </div>
                        ) : (
                          allEvents.map((event, index) => (
                            <div key={event.id} className="flex items-start gap-4 pb-6 last:pb-0">
                              <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${event.color}-100 dark:bg-${event.color}-900/20`}>
                                  {event.icon}
                                </div>
                                {index < allEvents.length - 1 && (
                                  <div className="w-0.5 h-12 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {formatDate(event.date)}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{event.description}</p>
                              </div>
                            </div>
                          ))
                        )
                      })()}
                    </div>
                  </Card>
                </TabsContent>

                {/* Pemeriksaan Tab */}
                <TabsContent value="pemeriksaan" className="space-y-4 mt-6">
                  {emrData.t_pemeriksaan.length === 0 ? (
                    <Card className="p-8 text-center">
                      <MdMedicalServices className="text-4xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data pemeriksaan</h3>
                      <p className="text-gray-600 dark:text-gray-400">Data pemeriksaan dokter akan muncul di sini</p>
                    </Card>
                  ) : (
                    emrData.t_pemeriksaan.map((exam) => (
                      <Card key={exam.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Pemeriksaan - {formatDate(exam.created_at)}
                          </h3>
                          <Badge variant="secondary">Registration #{exam.registration_id}</Badge>
                        </div>

                        {/* Vital Signs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tekanan Darah</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {exam.vital_signs.blood_pressure_systolic}/{exam.vital_signs.blood_pressure_diastolic} mmHg
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nadi</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {exam.vital_signs.pulse} bpm
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Suhu</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {exam.vital_signs.temperature}°C
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Berat/Tinggi</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {exam.vital_signs.weight}kg / {exam.vital_signs.height}cm
                            </p>
                          </div>
                        </div>

                        {/* Diagnosis & Therapy */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Diagnosis</h4>
                            <p className="text-gray-600 dark:text-gray-400">{exam.diagnosis || 'Tidak ada diagnosis'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Terapi</h4>
                            <p className="text-gray-600 dark:text-gray-400">{exam.therapy || 'Tidak ada terapi'}</p>
                          </div>
                        </div>

                        {/* Anamnesis & Physical Exam */}
                        {(exam.anamnesis || exam.physical_exam) && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {exam.anamnesis && (
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Anamnesis</h4>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{exam.anamnesis}</p>
                                </div>
                              )}
                              {exam.physical_exam && (
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pemeriksaan Fisik</h4>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{exam.physical_exam}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Resep Tab */}
                <TabsContent value="resep" className="space-y-4 mt-6">
                  {emrData.prescriptions.length === 0 ? (
                    <Card className="p-8 text-center">
                      <MdMedication className="text-4xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data resep</h3>
                      <p className="text-gray-600 dark:text-gray-400">Data resep obat akan muncul di sini</p>
                    </Card>
                  ) : (
                    emrData.prescriptions.map((prescription) => (
                      <Card key={prescription.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Resep - {formatDate(prescription.created_at)}
                          </h3>
                          <Badge variant="secondary">Registration #{prescription.registration_id}</Badge>
                        </div>

                        <div className="space-y-3">
                          {prescription.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{item.medicine_name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.dosage} - {item.frequency}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Lab Tab */}
                <TabsContent value="lab" className="space-y-4 mt-6">
                  {emrData.lab_orders.length === 0 ? (
                    <Card className="p-8 text-center">
                      <MdScience className="text-4xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data lab</h3>
                      <p className="text-gray-600 dark:text-gray-400">Data pemeriksaan lab akan muncul di sini</p>
                    </Card>
                  ) : (
                    emrData.lab_orders.map((lab) => (
                      <Card key={lab.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{lab.test_name}</h3>
                          <div className="flex gap-2">
                            <Badge variant={lab.status === 'completed' ? 'default' : 'secondary'}>
                              {lab.status === 'completed' ? 'Selesai' : 'Pending'}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Registration:</span>
                            <span className="font-medium">#{lab.registration_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tanggal:</span>
                            <span className="font-medium">{formatDate(lab.created_at)}</span>
                          </div>
                          {lab.result && (
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Hasil:</h4>
                              <p className="text-gray-600 dark:text-gray-400">{lab.result}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Radiologi Tab */}
                <TabsContent value="radiologi" className="space-y-4 mt-6">
                  {emrData.radiology_orders.length === 0 ? (
                    <Card className="p-8 text-center">
                      <MdImage className="text-4xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data radiologi</h3>
                      <p className="text-gray-600 dark:text-gray-400">Data pemeriksaan radiologi akan muncul di sini</p>
                    </Card>
                  ) : (
                    emrData.radiology_orders.map((rad) => (
                      <Card key={rad.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rad.exam_name}</h3>
                          <div className="flex gap-2">
                            <Badge variant={rad.status === 'completed' ? 'default' : 'secondary'}>
                              {rad.status === 'completed' ? 'Selesai' : 'Pending'}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Registration:</span>
                            <span className="font-medium">#{rad.registration_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tanggal:</span>
                            <span className="font-medium">{formatDate(rad.created_at)}</span>
                          </div>
                          {rad.result_url && (
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Hasil:</h4>
                              <a
                                href={rad.result_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                              >
                                <MdImage className="text-lg" />
                                Lihat Hasil
                              </a>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {!selectedPatient && !searching && searchTerm.length === 0 && (
        <Card className="p-12 text-center">
          <MdLocalHospital className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            EMR Read-Only untuk Perawat
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Cari dan pilih pasien untuk melihat Electronic Medical Record
          </p>
        </Card>
      )}
    </div>
  )
}
