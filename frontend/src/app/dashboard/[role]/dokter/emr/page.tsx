'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Stethoscope,
  User,
  Calendar,
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  Users
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTodayPatients, useExaminationByRegistration, useExaminations } from '@/hooks/useEmrExamination'
import ExaminationFormSimple from '@/components/emr/ExaminationFormSimple'
import toast from '@/lib/toast'

interface Patient {
  id: number
  name: string
  mrn: string
  birth_date: string
  gender: string
}

interface Registration {
  id: number
  registration_no: string
  created_at: string
  status: string
}

interface Examination {
  id: number
  tanggal_pemeriksaan: string
  diagnosis_utama?: string
  status: string
  patient?: Patient
  doctor?: { name: string }
}

export default function DokterEMRPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('today-patients')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingExamination, setEditingExamination] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewExaminationModal, setShowNewExaminationModal] = useState(false)
  const [selectedPatientForNewExam, setSelectedPatientForNewExam] = useState<any>(null)
  const [patientSearchTerm, setPatientSearchTerm] = useState('')

  // API hooks
  const {
    data: todayPatientsData,
    isLoading: loadingTodayPatients,
    refetch: refetchTodayPatients
  } = useTodayPatients({ per_page: 20 })

  const {
    data: examinationsData,
    isLoading: loadingExaminations,
    refetch: refetchExaminations
  } = useExaminations({ per_page: 50 })

  const examinationByRegistration = useExaminationByRegistration(selectedRegistration?.id || 0)

  const todayPatients = Array.isArray(todayPatientsData) ? todayPatientsData : []
  const examinations = examinationsData?.data?.data || []
  const existingExamination = examinationByRegistration.data?.data?.[0] || null

  // Filter patients based on search
  const filteredPatients = todayPatients.filter(patient =>
    patient &&
    (patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.mrn?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Handle new examination
  const handleNewExamination = (patient: Patient, registration: Registration) => {
    setSelectedPatient(patient)
    setSelectedRegistration(registration)
    setEditingExamination(null)
    setShowForm(true)
  }

  // Handle edit examination
  const handleEditExamination = (examination: any) => {
    setSelectedPatient(examination.patient)
    setSelectedRegistration(examination.registration)
    setEditingExamination(examination)
    setShowForm(true)
  }

  // Handle view examination
  const handleViewExamination = (examination: any) => {
    setSelectedPatient(examination.patient)
    setSelectedRegistration(examination.registration)
    setEditingExamination(examination)
    // Show view mode
    router.push(`/dashboard/dokter/emr/view/${examination.id}`)
  }

  // Handle new examination from "Tambah Pemeriksaan" button
  const handleCreateNewExamination = (patient?: any) => {
    if (patient) {
      // If patient selected from search
      setSelectedPatient(patient)
      setSelectedRegistration({
        id: patient.id, // Use patient id as temporary registration id
        registration_no: `NEW-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'new'
      })
    }
    setEditingExamination(null)
    setShowNewExaminationModal(false)
    setShowForm(true)
  }

  // Handle form save
  const handleFormSave = () => {
    setShowForm(false)
    setSelectedPatient(null)
    setSelectedRegistration(null)
    setEditingExamination(null)
    refetchTodayPatients()
    refetchExaminations()
    toast.success('Data pemeriksaan berhasil disimpan')
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedPatient(null)
    setSelectedRegistration(null)
    setEditingExamination(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' },
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge className={`${config.color} ${config.label}`}>
        {config.label}
      </Badge>
    )
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `${age} tahun`
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rekam Medis Elektronik (EMR)</h1>
          <p className="text-gray-600 mt-2">Kelola pemeriksaan dan rekam medis pasien</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari pasien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            onClick={() => setShowNewExaminationModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Pemeriksaan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today-patients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Pasien Hari Ini
          </TabsTrigger>
          <TabsTrigger value="all-examinations" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Semua Pemeriksaan
          </TabsTrigger>
        </TabsList>

        {/* Today Patients Tab */}
        <TabsContent value="today-patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pasien Hari Ini
              </CardTitle>
              <CardDescription>
                Daftar pasien yang harus diperiksa hari ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTodayPatients ? (
                <div className="text-center py-12">Loading...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada pasien yang perlu diperiksa hari ini
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Registrasi</TableHead>
                        <TableHead>Nama Pasien</TableHead>
                        <TableHead>MRN</TableHead>
                        <TableHead>Umur</TableHead>
                        <TableHead>Jenis Kelamin</TableHead>
                        <TableHead>Waktu Registrasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            {patient.registration_no || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {patient.name}
                            </div>
                          </TableCell>
                          <TableCell>{patient.mrn}</TableCell>
                          <TableCell>{calculateAge(patient.birth_date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {patient.gender === 'L' ? 'Laki-laki' : patient.gender === 'P' ? 'Perempuan' : '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(patient.created_at).toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge('menunggu')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleNewExamination(
                                  patient as Patient,
                                  {
                                    id: patient.id,
                                    registration_no: patient.registration_no || '',
                                    created_at: patient.created_at,
                                    status: patient.status || 'menunggu'
                                  }
                                )}
                                className="flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Periksa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Examinations Tab */}
        <TabsContent value="all-examinations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Riwayat Pemeriksaan
              </CardTitle>
              <CardDescription>
                Semua pemeriksaan yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExaminations ? (
                <div className="text-center py-12">Loading...</div>
              ) : examinations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Belum ada data pemeriksaan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Diagnosis Utama</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dokter</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examinations.map((examination) => (
                        <TableRow key={examination.id}>
                          <TableCell>
                            {new Date(examination.tanggal_pemeriksaan).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {examination.patient?.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {examination.diagnosis_utama || '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(examination.status)}
                          </TableCell>
                          <TableCell>
                            {examination.doctor?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewExamination(examination)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Lihat
                              </Button>
                              {examination.status === 'draft' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditExamination(examination)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Examination Modal */}
      <Dialog open={showNewExaminationModal} onOpenChange={setShowNewExaminationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Buat Pemeriksaan Baru
            </DialogTitle>
            <DialogDescription>
              Cari pasien atau buat pemeriksaan untuk pasien darurat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="patientSearch">Cari Pasien</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="patientSearch"
                  placeholder="Ketik nama pasien atau nomor RM..."
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {patientSearchTerm && (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <div className="p-4 text-sm text-gray-500 text-center">
                  Fitur pencarian pasien akan diintegrasikan dengan API pencarian pasien
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => handleCreateNewExamination()} // Create without selecting patient
            >
              Buat Pemeriksaan Kosong (Darurat)
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewExaminationModal(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Examination Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExamination ? 'Edit Pemeriksaan' : 'Pemeriksaan Baru'}
            </DialogTitle>
            <DialogDescription>
              {selectedPatient?.name} - {selectedPatient?.mrn}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && selectedRegistration && (
            <ExaminationFormSimple
              patient={selectedPatient}
              registrationId={selectedRegistration.id}
              doctorId={1} // TODO: Get from auth context
              examination={editingExamination}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
