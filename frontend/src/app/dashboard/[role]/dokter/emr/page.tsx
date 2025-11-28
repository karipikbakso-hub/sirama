'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch, useMutate } from '@/hooks/useApi'
import api from '@/lib/api'
import { Download, User, Calendar, FileText, Pill, TestTube, ScanLine, FilePlus, Plus, Stethoscope } from 'lucide-react'

// Types
interface Patient {
  id: number
  medical_record_number: string
  full_name: string
  date_of_birth: string
  gender: 'L' | 'P'
  allergies: string | null
  chronic_diseases: string | null
  phone: string
  address: string
  bpjs_number: string
  nik: string
}

interface Registration {
  id: number
  registration_date: string
  complaint: string
  diagnosis: string
  doctor_name: string
  cppt: Array<{
    id: number
    subjective: string
    objective: string
    assessment: string
    plan: string
    created_at: string
    created_by: string
  }>
  diagnoses: Array<{
    id: number
    icd10_code: string
    icd10_name: string
    diagnosis_type: 'primary' | 'secondary'
    created_at: string
  }>
}

interface EMRData {
  patient: Patient
  registrations: Registration[]
  prescriptions: any[]
  lab_orders: any[]
  radiology_orders: any[]
}

interface PatientOption {
  id: number
  mrn: string
  name: string
  nik: string
  birth_date: string
  gender: string
  phone: string
  address: string
  insurance_status: string
  bpjs_number: string
  status: string
  created_at: string
  updated_at: string
}

export default function EMRPage() {
  const router = useRouter()
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [activeTab, setActiveTab] = useState("timeline")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Search patients - manual trigger
  const [searchResults, setSearchResults] = useState<{ success: boolean; data: PatientOption[] } | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Get EMR data - manual trigger
  const [emrData, setEmrData] = useState<{
    patient: Patient
    registrations: Registration[]
    prescriptions: any[]
    lab_orders: any[]
    radiology_orders: any[]
  } | null>(null)
  const [emrLoading, setEmrLoading] = useState(false)
  const [emrError, setEmrError] = useState<string | null>(null)

  // Manual API functions
  const searchPatients = async (params: { q: string }) => {
    setSearchLoading(true)
    setSearchError(null)
    try {
      const response = await api.get('/api/pendaftaran/pasien/search', { params })
      setSearchResults(response.data)
    } catch (error: any) {
      setSearchError(error.response?.data?.message || 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const loadEMR = async () => {
    if (!selectedPatientId) return
    setEmrLoading(true)
    setEmrError(null)
    try {
      const response = await api.get(`/api/doctor/emr/${selectedPatientId}`)
      setEmrData(response.data)
    } catch (error: any) {
      setEmrError(error.response?.data?.message || 'Failed to load EMR')
    } finally {
      setEmrLoading(false)
    }
  }

  const exportPDF = async () => {
    if (!selectedPatientId) return
    try {
      const response = await api.get(`/api/doctor/emr/${selectedPatientId}/export`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `EMR-${emrData?.patient?.medical_record_number || 'Patient'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      setEmrError(error.response?.data?.message || 'Export failed')
    }
  }

  // Handle patient search
  const handlePatientSearch = async (query: string) => {
    if (query.length >= 2) {
      await searchPatients({ q: query })
    }
  }

  // Handle patient selection
  const handlePatientSelect = async (patient: PatientOption) => {
    setSelectedPatient(patient)
    setSelectedPatientId(patient.id)
    setSearchResults(null) // Clear search results to hide dropdown
    setSearchLoading(false)
    setSearchError(null)

    // Clear the input field
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
    }

    await loadEMR()
  }

  // Handle export PDF
  const handleExportPDF = async () => {
    if (!selectedPatientId) return
    await exportPDF()
  }

  // Calculate age
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Electronic Medical Record (EMR)"
        description="Rekam medis lengkap pasien"
      />

      {/* Patient Search */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Cari Pasien (Nama, No RM, NIK)
            </label>
            <div className="relative">
              <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ketik nama, nomor RM, atau NIK pasien..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => {
                    const query = e.target.value
                    if (query.length >= 2) {
                      handlePatientSearch(query)
                    } else {
                      setSearchResults(null)
                    }
                  }}
                />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Search Results Dropdown */}
              {searchResults?.data && searchResults.data.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {searchResults.data.map((patient: PatientOption) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            RM: {patient.mrn} | NIK: {patient.nik}
                          </div>
                        </div>
                        <Badge variant="outline">{patient.insurance_status}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedPatient && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{selectedPatient.name}</div>
                  <div className="text-sm text-gray-600">
                    RM: {selectedPatient.mrn} | Umur: {calculateAge(selectedPatient.birth_date)} tahun
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExportPDF}
                  disabled={emrLoading}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {emrLoading ? 'Mengekspor...' : 'Export PDF'}
                </Button>

                {/* Quick Actions */}
                <Button
                  onClick={() => {
                    // Get the latest registration for this patient
                    const latestRegistration = emrData?.registrations?.[0];
                    if (latestRegistration) {
                      router.push(`/dashboard/dokter/cppt?registration_id=${latestRegistration.id}`);
                    } else {
                      // Fallback: redirect to CPPT page and let it handle the error
                      router.push(`/dashboard/dokter/cppt?patient_id=${selectedPatientId}`);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={!selectedPatientId}
                >
                  <FilePlus className="w-4 h-4" />
                  CPPT Baru
                </Button>

                <Button
                  onClick={() => router.push(`/dashboard/dokter/prescription/new?patient_id=${selectedPatientId}`)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Pill className="w-4 h-4" />
                  Resep Baru
                </Button>

                <Button
                  onClick={() => router.push(`/dashboard/dokter/order-lab?patient_id=${selectedPatientId}`)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Order Lab
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* EMR Content */}
      {selectedPatientId && (
        <div className="space-y-6">
          {/* Patient Header */}
          {emrLoading ? (
            <PatientHeaderSkeleton />
          ) : emrData?.patient ? (
            <PatientHeader patient={emrData.patient} />
          ) : null}

          {/* EMR Tabs */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Riwayat</span>
                </TabsTrigger>
                <TabsTrigger value="diagnosis" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Diagnosis</span>
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  <span className="hidden sm:inline">Resep</span>
                </TabsTrigger>
                <TabsTrigger value="lab" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  <span className="hidden sm:inline">Lab</span>
                </TabsTrigger>
                <TabsTrigger value="radiology" className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4" />
                  <span className="hidden sm:inline">Radiologi</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="p-6">
                {emrLoading ? (
                  <TimelineSkeleton />
                ) : (
                  <TimelineTab registrations={emrData?.registrations || []} router={router} />
                )}
              </TabsContent>

              <TabsContent value="diagnosis" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Diagnosis Pasien</h3>
                    <p className="text-sm text-gray-600">Riwayat diagnosis dan penilaian kondisi pasien</p>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/dokter/diagnosis/new?patient_id=${selectedPatientId}`)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Diagnosis
                  </Button>
                </div>
                {emrLoading ? (
                  <DiagnosisSkeleton />
                ) : (
                  <DiagnosisTab registrations={emrData?.registrations || []} />
                )}
              </TabsContent>

              <TabsContent value="prescriptions" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Resep Obat</h3>
                    <p className="text-sm text-gray-600">Riwayat resep dan pengobatan pasien</p>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/dokter/prescription/new?patient_id=${selectedPatientId}`)}
                    className="flex items-center gap-2"
                  >
                    <Pill className="w-4 h-4" />
                    Buat Resep Baru
                  </Button>
                </div>
                {emrLoading ? (
                  <PrescriptionSkeleton />
                ) : (
                  <PrescriptionTab prescriptions={emrData?.prescriptions || []} />
                )}
              </TabsContent>

              <TabsContent value="lab" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pemeriksaan Laboratorium</h3>
                    <p className="text-sm text-gray-600">Riwayat pemeriksaan lab dan hasilnya</p>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/dokter/order-lab?patient_id=${selectedPatientId}`)}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    Order Lab Baru
                  </Button>
                </div>
                {emrLoading ? (
                  <LabSkeleton />
                ) : (
                  <LabTab labOrders={emrData?.lab_orders || []} />
                )}
              </TabsContent>

              <TabsContent value="radiology" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pemeriksaan Radiologi</h3>
                    <p className="text-sm text-gray-600">Riwayat pemeriksaan radiologi dan hasilnya</p>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/dokter/order-rad?patient_id=${selectedPatientId}`)}
                    className="flex items-center gap-2"
                  >
                    <ScanLine className="w-4 h-4" />
                    Order Radiologi Baru
                  </Button>
                </div>
                {emrLoading ? (
                  <RadiologySkeleton />
                ) : (
                  <RadiologyTab radiologyOrders={emrData?.radiology_orders || []} />
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {(searchError || emrError) && (
        <Alert variant="destructive">
          <AlertDescription>
            {searchError || emrError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Component: Patient Header
function PatientHeader({ patient }: { patient: Patient }) {
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Patient Photo */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.full_name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
              <span>RM: {patient.medical_record_number}</span>
              <span>Umur: {calculateAge(patient.date_of_birth)} tahun</span>
              <span>Jenis Kelamin: {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </div>
          </div>

          {/* Allergies Alert */}
          {patient.allergies && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Alergi:</strong> {patient.allergies}
              </AlertDescription>
            </Alert>
          )}

          {/* Chronic Diseases */}
          {patient.chronic_diseases && (
            <div>
              <span className="text-sm font-medium text-gray-700">Penyakit Kronis:</span>
              <p className="text-sm text-gray-600 mt-1">{patient.chronic_diseases}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Telepon:</span>
              <span className="ml-2 text-gray-600">{patient.phone || 'Tidak tercatat'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">BPJS:</span>
              <span className="ml-2 text-gray-600">{patient.bpjs_number || 'Tidak tercatat'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-700">Alamat:</span>
              <span className="ml-2 text-gray-600">{patient.address || 'Tidak tercatat'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Component: Timeline Tab
function TimelineTab({ registrations, router }: { registrations: Registration[], router: any }) {
  if (registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat kunjungan</h3>
        <p className="text-gray-600">Riwayat kunjungan pasien akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {registrations.map((registration, index) => (
        <div key={registration.id} className="relative">
          {/* Timeline line */}
          {index < registrations.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
          )}

          <div className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  Kunjungan {new Date(registration.registration_date).toLocaleDateString('id-ID')}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => router.push(`/dashboard/dokter/cppt?registration_id=${registration.id}`)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FilePlus className="w-4 h-4" />
                    Buat CPPT
                  </Button>
                  <Badge variant="outline">{registration.doctor_name}</Badge>
                </div>
              </div>

              {registration.complaint && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Keluhan:</span>
                  <p className="text-sm text-gray-600 mt-1">{registration.complaint}</p>
                </div>
              )}

              {registration.diagnosis && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Diagnosis:</span>
                  <p className="text-sm text-gray-600 mt-1">{registration.diagnosis}</p>
                </div>
              )}

              {/* CPPT Summary */}
              {registration.cppt.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700">CPPT Entries:</span>
                  <div className="mt-2 space-y-2">
                    {registration.cppt.slice(0, 2).map((cppt) => (
                      <div key={cppt.id} className="bg-white rounded p-3 border">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(cppt.created_at).toLocaleString('id-ID')}
                        </div>
                        {cppt.assessment && (
                          <p className="text-sm text-gray-700">{cppt.assessment}</p>
                        )}
                      </div>
                    ))}
                    {registration.cppt.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{registration.cppt.length - 2} entries lainnya
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Component: Diagnosis Tab
function DiagnosisTab({ registrations }: { registrations: Registration[] }) {
  const allDiagnoses = registrations.flatMap(registration =>
    registration.diagnoses.map(diagnosis => ({
      ...diagnosis,
      registration_date: registration.registration_date,
      doctor_name: registration.doctor_name
    }))
  )

  if (allDiagnoses.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada diagnosis</h3>
        <p className="text-gray-600">Diagnosis pasien akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {allDiagnoses.map((diagnosis) => (
        <div key={diagnosis.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {diagnosis.icd10_code} - {diagnosis.icd10_name}
              </span>
              <Badge variant={diagnosis.diagnosis_type === 'primary' ? 'default' : 'secondary'}>
                {diagnosis.diagnosis_type === 'primary' ? 'Primer' : 'Sekunder'}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {new Date(diagnosis.registration_date).toLocaleDateString('id-ID')} - {diagnosis.doctor_name}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Component: Prescription Tab
function PrescriptionTab({ prescriptions }: { prescriptions: any[] }) {
  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada resep</h3>
        <p className="text-gray-600">Resep obat pasien akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <Card key={prescription.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">
              Resep {new Date(prescription.prescription_date).toLocaleDateString('id-ID')}
            </h4>
            <Badge variant="outline">{prescription.doctor_name}</Badge>
          </div>

          {prescription.diagnosis && (
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
            </p>
          )}

          <div className="space-y-2">
            {prescription.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{item.medicine_name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {item.dosage} - {item.frequency} - {item.duration}
                  </span>
                </div>
                {item.instructions && (
                  <span className="text-sm text-gray-600">{item.instructions}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

// Component: Lab Tab
function LabTab({ labOrders }: { labOrders: any[] }) {
  if (labOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pemeriksaan lab</h3>
        <p className="text-gray-600">Hasil pemeriksaan laboratorium akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {labOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">{order.test_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              {new Date(order.ordered_date).toLocaleDateString('id-ID')} - {order.doctor_name}
            </div>
            <div className="text-sm text-gray-600">
              Status: <Badge variant="outline">{order.status}</Badge>
            </div>
          </div>
          {order.result && (
            <div className="text-right">
              <span className="text-sm font-medium text-gray-700">Hasil:</span>
              <p className="text-sm text-gray-600 mt-1">{order.result}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Component: Radiology Tab
function RadiologyTab({ radiologyOrders }: { radiologyOrders: any[] }) {
  if (radiologyOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <ScanLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pemeriksaan radiologi</h3>
        <p className="text-gray-600">Hasil pemeriksaan radiologi akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {radiologyOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">{order.exam_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              {new Date(order.ordered_date).toLocaleDateString('id-ID')} - {order.doctor_name}
            </div>
            <div className="text-sm text-gray-600">
              Status: <Badge variant="outline">{order.status}</Badge>
            </div>
          </div>
          {order.result && (
            <div className="text-right">
              <span className="text-sm font-medium text-gray-700">Hasil:</span>
              <p className="text-sm text-gray-600 mt-1">{order.result}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Skeleton Components
function PatientHeaderSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex gap-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </Card>
  )
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DiagnosisSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  )
}

function PrescriptionSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-4 w-64 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function LabSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  )
}

function RadiologySkeleton() {
  return (
    <div className="text-center py-8">
      <ScanLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pemeriksaan radiologi</h3>
      <p className="text-gray-600">Hasil pemeriksaan radiologi akan muncul di sini.</p>
    </div>
  )
}