'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/lib/toast'
import api from '@/lib/api'
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Pill,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface PrescriptionHistory {
  id: number
  status: string
  created_at: string
  validated_at?: string
  dispensed_at?: string
  completed_at?: string
  total_price?: number
  payment_method?: string
  notes?: string
  patient_name: string
  medical_record_number: string
  patient_insurance_type: string
  doctor_name: string
  pharmacist_name?: string
  dispenser_name?: string
  total_items: number
}

interface PrescriptionDetail {
  id: number
  status: string
  created_at: string
  validated_at?: string
  dispensed_at?: string
  completed_at?: string
  total_price?: number
  payment_method?: string
  notes?: string
  patient: {
    nama_lengkap: string
    no_rm: string
    jenis_asuransi: string
  }
  doctor: {
    name: string
  }
  pharmacist?: {
    name: string
  }
  dispenser?: {
    name: string
  }
  items: Array<{
    id: number
    medicine_name: string
    dosage: string
    frequency: string
    duration: string
    instruction?: string
  }>
}

export default function RiwayatResepPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDetail | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [insuranceFilter, setInsuranceFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(50)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    loadPrescriptions()
  }, [search, statusFilter, insuranceFilter, dateFrom, dateTo, sortBy, sortOrder, currentPage])

  const loadPrescriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (insuranceFilter) params.append('insurance_type', insuranceFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const response = await api.get(`/api/prescriptions/history?${params}`)
      setPrescriptions(response.data.data || [])
      setCurrentPage(response.data.current_page || 1)
      setTotal(response.data.total || 0)
      setLastPage(response.data.last_page || 1)
    } catch (error) {
      toast.error('Gagal memuat data riwayat resep')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (prescriptionId: number) => {
    try {
      setDetailLoading(true)
      const response = await api.get(`/api/prescriptions/${prescriptionId}`)
      setSelectedPrescription(response.data.data)
      setShowDetailDialog(true)
    } catch (error) {
      toast.error('Gagal memuat detail resep')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        sort_order: sortOrder
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (insuranceFilter) params.append('insurance_type', insuranceFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const response = await api.get(`/api/prescriptions/export-history?${params}`, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', response.data.filename || 'riwayat_resep.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Export berhasil')
    } catch (error) {
      toast.error('Gagal export data')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Menunggu Validasi</Badge>
      case 'validated':
        return <Badge variant="default" className="bg-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Sudah Divalidasi</Badge>
      case 'dispensed':
        return <Badge variant="default" className="bg-green-600"><Pill className="w-3 h-3 mr-1" />Sudah Dispensing</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-purple-600"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getInsuranceLabel = (type: string) => {
    switch (type) {
      case 'cash': return 'Tunai'
      case 'bpjs': return 'BPJS'
      case 'insurance': return 'Asuransi'
      default: return type
    }
  }

  const getTimelineSteps = (prescription: PrescriptionDetail) => {
    const steps = [
      {
        label: 'Dibuat',
        date: prescription.created_at,
        icon: FileText,
        completed: true
      }
    ]

    if (prescription.validated_at) {
      steps.push({
        label: 'Divalidasi',
        date: prescription.validated_at,
        icon: CheckCircle,
        completed: true
      })
    }

    if (prescription.dispensed_at) {
      steps.push({
        label: 'Dispensing',
        date: prescription.dispensed_at,
        icon: Pill,
        completed: true
      })
    }

    if (prescription.completed_at) {
      steps.push({
        label: 'Selesai',
        date: prescription.completed_at,
        icon: CheckCircle,
        completed: true
      })
    }

    return steps
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <FileText className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Riwayat Resep</h1>
          <p className="text-gray-600">Audit trail semua resep yang telah diproses</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Nama pasien, No. RM, dokter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu Validasi</SelectItem>
                  <SelectItem value="validated">Sudah Divalidasi</SelectItem>
                  <SelectItem value="dispensed">Sudah Dispensing</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="insurance">Jenis Asuransi</Label>
              <Select
                value={insuranceFilter}
                onValueChange={setInsuranceFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Jenis</SelectItem>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="bpjs">BPJS</SelectItem>
                  <SelectItem value="insurance">Asuransi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort">Urutkan</Label>
              <Select
                value={`${sortBy}_${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('_')
                  setSortBy(field)
                  setSortOrder(order)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanggal Dibuat (Terbaru)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at_desc">Tanggal Dibuat (Terbaru)</SelectItem>
                  <SelectItem value="created_at_asc">Tanggal Dibuat (Terlama)</SelectItem>
                  <SelectItem value="patient_name_asc">Nama Pasien (A-Z)</SelectItem>
                  <SelectItem value="patient_name_desc">Nama Pasien (Z-A)</SelectItem>
                  <SelectItem value="doctor_name_asc">Dokter (A-Z)</SelectItem>
                  <SelectItem value="doctor_name_desc">Dokter (Z-A)</SelectItem>
                  <SelectItem value="status_asc">Status (A-Z)</SelectItem>
                  <SelectItem value="status_desc">Status (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="dateFrom">Tanggal Dari</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Tanggal Sampai</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Resep ({total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data resep ditemukan
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Resep</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Dokter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jumlah Item</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        RX-{String(prescription.id).padStart(6, '0')}
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prescription.patient_name}</div>
                          <div className="text-sm text-gray-500">{prescription.medical_record_number}</div>
                          <div className="text-xs text-gray-400">{getInsuranceLabel(prescription.patient_insurance_type)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{prescription.doctor_name}</TableCell>
                      <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                      <TableCell>{prescription.total_items}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(prescription.id)}
                          disabled={detailLoading}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, total)} dari {total} data
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Halaman {currentPage} dari {lastPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                      disabled={currentPage === lastPage}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detail Resep #{selectedPrescription?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6">
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timeline Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getTimelineSteps(selectedPrescription).map((step, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.label}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(step.date).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informasi Pasien
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nama</Label>
                    <p className="font-medium">{selectedPrescription.patient.nama_lengkap}</p>
                  </div>
                  <div>
                    <Label>No. RM</Label>
                    <p className="font-medium">{selectedPrescription.patient.no_rm}</p>
                  </div>
                  <div>
                    <Label>Jenis Asuransi</Label>
                    <p className="font-medium">{getInsuranceLabel(selectedPrescription.patient.jenis_asuransi)}</p>
                  </div>
                  <div>
                    <Label>Dokter</Label>
                    <p className="font-medium">{selectedPrescription.doctor.name}</p>
                  </div>
                  {selectedPrescription.pharmacist && (
                    <div>
                      <Label>Apoteker Validator</Label>
                      <p className="font-medium">{selectedPrescription.pharmacist.name}</p>
                    </div>
                  )}
                  {selectedPrescription.dispenser && (
                    <div>
                      <Label>Apoteker Dispensing</Label>
                      <p className="font-medium">{selectedPrescription.dispenser.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prescription Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Daftar Obat ({selectedPrescription.items.length} item)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPrescription.items.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPrescription.items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Nama Obat</Label>
                              <p className="font-medium">{item.medicine_name}</p>
                            </div>
                            <div>
                              <Label>Dosis</Label>
                              <p className="text-sm text-gray-600">{item.dosage}</p>
                            </div>
                            <div>
                              <Label>Frekuensi</Label>
                              <p className="text-sm text-gray-600">{item.frequency}</p>
                            </div>
                            <div>
                              <Label>Durasi</Label>
                              <p className="text-sm text-gray-600">{item.duration}</p>
                            </div>
                          </div>
                          {item.instruction && (
                            <div className="mt-2">
                              <Label>Instruksi</Label>
                              <p className="text-sm text-gray-600">{item.instruction}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Tidak ada item obat</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedPrescription.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Catatan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{selectedPrescription.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}