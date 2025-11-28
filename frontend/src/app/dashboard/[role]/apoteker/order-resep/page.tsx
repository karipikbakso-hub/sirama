'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaReceipt, FaSearch, FaEye, FaFilter, FaExclamationTriangle } from 'react-icons/fa'
import { useFetch } from '@/hooks/useApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/lib/toast'

interface Prescription {
  id: number
  status: 'pending' | 'validated' | 'dispensed' | 'completed'
  is_urgent: boolean
  total_price: number
  created_at: string
  patient_name: string
  medical_record_number: string
  patient_insurance_type: string
  doctor_name: string
}

interface PrescriptionItem {
  id: number
  medicine_id: number
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  price: number
  subtotal: number
  stock_available: number
}

interface PrescriptionDetail {
  id: number
  status: string
  is_urgent: boolean
  total_price: number
  notes: string
  created_at: string
  patient: {
    id: number
    full_name: string
    medical_record_number: string
    insurance_type: string
  }
  doctor: {
    id: number
    full_name: string
  }
  items: PrescriptionItem[]
}

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    pagination: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  }
}

export default function OrderResepPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDetail | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page when searching
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // API call for prescriptions list
  const { data: prescriptionsResponse, isLoading, error, refetch } = useFetch<ApiResponse<Prescription[]>>(
    '/api/prescriptions/apoteker',
    {
      params: {
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        per_page: 20,
        sort_by: 'created_at',
        sort_order: 'desc'
      }
    }
  )

  const prescriptions = prescriptionsResponse?.data || []
  const pagination = prescriptionsResponse?.meta?.pagination

  // API call for prescription detail
  const { data: detailResponse, isLoading: detailLoading, refetch: refetchDetail } = useFetch<ApiResponse<PrescriptionDetail>>(
    selectedPrescription ? `/api/prescriptions/${selectedPrescription.id}` : '',
    {
      enabled: !!selectedPrescription
    }
  )

  const prescriptionDetail = detailResponse?.data

  // API call for prescription items
  const { data: itemsResponse, isLoading: itemsLoading } = useFetch<ApiResponse<PrescriptionItem[]>>(
    selectedPrescription ? `/api/prescriptions/${selectedPrescription.id}/items` : '',
    {
      enabled: !!selectedPrescription
    }
  )

  const prescriptionItems = itemsResponse?.data || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'validated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'dispensed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'validated': return 'Validated'
      case 'dispensed': return 'Dispensed'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetail = async (prescription: Prescription) => {
    setSelectedPrescription(prescription as any)
    setIsDetailModalOpen(true)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaReceipt className="text-blue-500" />
          <span>Order Resep</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola dan pantau order resep obat dari dokter
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <FaExclamationTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Gagal memuat data resep. Silakan coba lagi.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari nama pasien, no RM, atau dokter..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="validated">Validated</option>
            <option value="dispensed">Dispensed</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pasien</TableHead>
                <TableHead className="hidden md:table-cell">No. RM</TableHead>
                <TableHead className="hidden sm:table-cell">Dokter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
                <TableHead className="hidden xl:table-cell">Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : prescriptions.length > 0 ? (
                prescriptions.map((prescription) => (
                  <TableRow
                    key={prescription.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      prescription.is_urgent ? 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10' : ''
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {prescription.is_urgent && <FaExclamationTriangle className="text-red-500 text-sm" />}
                        <div>
                          <div>{prescription.patient_name}</div>
                          <div className="text-xs text-gray-500 md:hidden">{prescription.medical_record_number}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{prescription.medical_record_number}</TableCell>
                    <TableCell className="hidden sm:table-cell">{prescription.doctor_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(prescription.status)}>
                        {getStatusText(prescription.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(prescription.created_at)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell font-medium">
                      {formatCurrency(prescription.total_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(prescription)}
                        className="h-8 w-8 p-0"
                        title="Lihat Detail"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <FaReceipt className="mx-auto text-4xl mb-2 opacity-50" />
                    <p>Tidak ada order resep yang ditemukan</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} sampai{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari{' '}
              {pagination.total} hasil
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Resep</DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : prescriptionDetail ? (
            <div className="space-y-6">
              {/* Prescription Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Informasi Pasien</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nama:</strong> {prescriptionDetail.patient.full_name}</p>
                    <p><strong>No. RM:</strong> {prescriptionDetail.patient.medical_record_number}</p>
                    <p><strong>Jenis Penjamin:</strong> {prescriptionDetail.patient.insurance_type}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Informasi Resep</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Dokter:</strong> {prescriptionDetail.doctor.full_name}</p>
                    <p><strong>Status:</strong> <Badge className={getStatusColor(prescriptionDetail.status)}>{getStatusText(prescriptionDetail.status)}</Badge></p>
                    <p><strong>Tanggal:</strong> {formatDate(prescriptionDetail.created_at)}</p>
                    {prescriptionDetail.notes && <p><strong>Catatan:</strong> {prescriptionDetail.notes}</p>}
                  </div>
                </div>
              </div>

              {/* Prescription Items */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Daftar Obat</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Obat</TableHead>
                      <TableHead>Dosis</TableHead>
                      <TableHead>Frekuensi</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        </TableRow>
                      ))
                    ) : prescriptionItems.length > 0 ? (
                      prescriptionItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.medicine_name}</TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell>{item.frequency}</TableCell>
                          <TableCell>{item.duration}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(item.subtotal)}</TableCell>
                          <TableCell>
                            <span className={item.stock_available > 0 ? 'text-green-600' : 'text-red-600'}>
                              {item.stock_available}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          Tidak ada item obat
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {prescriptionDetail.total_price > 0 && (
                  <div className="mt-4 text-right">
                    <p className="text-lg font-bold">
                      Total: {formatCurrency(prescriptionDetail.total_price)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Gagal memuat detail resep
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
