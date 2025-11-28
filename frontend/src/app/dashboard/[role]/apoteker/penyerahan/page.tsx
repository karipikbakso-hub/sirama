'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, Search, CheckCircle, FileText, User, Calendar, Download, Eye } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import api from '@/lib/api'

interface Prescription {
  id: number
  prescription_number: string
  status: string
  created_at: string
  patient: {
    id: number
    nama_pasien: string
    no_rm: string
  }
  items: Array<{
    id: number
    medicine: {
      nama_obat: string
      satuan: string
    }
    quantity: number
    dosage: string
    instructions: string
  }>
}

interface HandoverForm {
  prescription_id: number
  receiver_name: string
  receiver_relation: string
  education_checklist: string[]
  notes: string
}

export default function PenyerahanObatPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedHandover, setSelectedHandover] = useState<any>(null)

  // Handover form state
  const [handoverForm, setHandoverForm] = useState<HandoverForm>({
    prescription_id: 0,
    receiver_name: '',
    receiver_relation: 'pasien',
    education_checklist: [],
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch dispensed prescriptions
  const {
    data: prescriptionsData,
    isLoading: prescriptionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchPrescriptions
  } = useInfiniteQuery({
    queryKey: ['dispensed-prescriptions', searchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/api/prescriptions/list-for-apoteker', {
        params: {
          page: pageParam,
          per_page: 20,
          status: 'dispensed',
          search: searchTerm
        }
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta?.pagination?.current_page || 1
      const totalPages = lastPage.meta?.pagination?.last_page || 1
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1
  })

  // Fetch education checklist template
  const { data: educationChecklistData } = useInfiniteQuery({
    queryKey: ['education-checklist-template'],
    queryFn: async () => {
      const response = await api.get('/api/prescription-handovers/education-checklist/template')
      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined
  })

  // Fetch handovers
  const { data: handoversData } = useInfiniteQuery({
    queryKey: ['prescription-handovers'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/api/prescription-handovers', {
        params: { page: pageParam, per_page: 20 }
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.current_page || 1
      const totalPages = lastPage.last_page || 1
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1
  })

  // Create handover mutation
  const createHandoverMutation = useMutation({
    mutationFn: async (data: HandoverForm) => {
      const response = await api.post('/api/prescription-handovers', data)
      return response.data
    },
    onSuccess: async (data) => {
      toast.success('Penyerahan obat berhasil dibuat')
      setShowHandoverModal(false)
      setSelectedPrescription(null)
      setHandoverForm({
        prescription_id: 0,
        receiver_name: '',
        receiver_relation: 'pasien',
        education_checklist: [],
        notes: ''
      })

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['dispensed-prescriptions'], exact: false })
      await queryClient.invalidateQueries({ queryKey: ['prescription-handovers'], exact: false })

      // Show receipt modal
      setSelectedHandover(data.data)
      setShowReceiptModal(true)
    },
    onError: (error: any) => {
      console.error('Handover creation failed:', error)
      toast.error('Gagal membuat penyerahan obat')
    }
  })

  // Download receipt mutation
  const downloadReceiptMutation = useMutation({
    mutationFn: async (handoverId: number) => {
      const response = await api.get(`/api/prescription-handovers/${handoverId}/receipt`, {
        responseType: 'blob'
      })
      return { data: response.data, handoverId }
    },
    onSuccess: ({ data, handoverId }) => {
      // Create download link
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${handoverId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Receipt berhasil diunduh')
    },
    onError: () => {
      toast.error('Gagal mengunduh receipt')
    }
  })

  // Flatten data
  const prescriptions = prescriptionsData?.pages.flatMap(page => page.data || []) || []
  const handovers = handoversData?.pages.flatMap(page => page.data?.data || []) || []
  const educationChecklist = educationChecklistData?.pages[0]?.data || {}

  const handleCreateHandover = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setHandoverForm({
      ...handoverForm,
      prescription_id: prescription.id,
      receiver_name: prescription.patient.nama_pasien
    })
    setShowHandoverModal(true)
  }

  const handleSubmitHandover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPrescription) return

    await createHandoverMutation.mutateAsync(handoverForm)
  }

  const handleEducationChecklistChange = (item: string, checked: boolean) => {
    setHandoverForm(prev => ({
      ...prev,
      education_checklist: checked
        ? [...prev.education_checklist, item]
        : prev.education_checklist.filter(i => i !== item)
    }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, text: 'Menunggu' },
      'validated': { variant: 'default' as const, text: 'Tervalidasi' },
      'dispensed': { variant: 'default' as const, text: 'Siap Diserahkan' },
      'completed': { variant: 'default' as const, text: 'Selesai' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="🔄 Penyerahan Obat"
        description="Kelola proses penyerahan obat kepada pasien dengan edukasi dan dokumentasi lengkap"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">Siap Diserahkan</h3>
              <p className="text-sm text-blue-700">{prescriptions.length} resep</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Sudah Diserahkan</h3>
              <p className="text-sm text-green-700">{handovers.length} resep</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800">Hari Ini</h3>
              <p className="text-sm text-purple-700">
                {handovers.filter(h => new Date(h.handover_at).toDateString() === new Date().toDateString()).length} handover
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Receipt</h3>
              <p className="text-sm text-orange-700">Dapat diunduh</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari resep berdasarkan nama pasien atau nomor resep..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => refetchPrescriptions()} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Prescriptions Ready for Handover */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resep Siap Diserahkan</h3>
        {prescriptionsLoading && prescriptions.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{prescription.patient.nama_pasien}</h4>
                    <Badge variant="outline">{prescription.prescription_number}</Badge>
                    {getStatusBadge(prescription.status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>RM: {prescription.patient.no_rm}</p>
                    <p>{prescription.items.length} jenis obat • Dibuat: {new Date(prescription.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateHandover(prescription)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Serah Terima
                  </Button>
                </div>
              </div>
            ))}

            {prescriptions.length === 0 && !prescriptionsLoading && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada resep yang siap diserahkan</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Recent Handovers */}
      {handovers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Riwayat Penyerahan Hari Ini</h3>
          <div className="space-y-3">
            {handovers.slice(0, 5).map((handover) => (
              <div key={handover.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium">{handover.prescription.patient.nama_pasien}</p>
                  <p className="text-sm text-green-600">
                    Diterima oleh: {handover.receiver_name} ({handover.receiver_relation}) •
                    {new Date(handover.handover_at).toLocaleTimeString('id-ID')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadReceiptMutation.mutate(handover.id)}
                  disabled={downloadReceiptMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Receipt
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Handover Modal */}
      {showHandoverModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Form Penyerahan Obat</h3>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitHandover} className="space-y-6">
              {/* Prescription Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Informasi Resep</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Pasien:</span>
                    <span className="ml-2 font-medium">{selectedPrescription.patient.nama_pasien}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">No. RM:</span>
                    <span className="ml-2 font-medium">{selectedPrescription.patient.no_rm}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">No. Resep:</span>
                    <span className="ml-2 font-medium">{selectedPrescription.prescription_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Jumlah Obat:</span>
                    <span className="ml-2 font-medium">{selectedPrescription.items.length} jenis</span>
                  </div>
                </div>
              </div>

              {/* Receiver Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="receiver_name">Nama Penerima Obat *</Label>
                  <Input
                    id="receiver_name"
                    value={handoverForm.receiver_name}
                    onChange={(e) => setHandoverForm(prev => ({ ...prev, receiver_name: e.target.value }))}
                    placeholder="Nama lengkap penerima obat"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="receiver_relation">Hubungan dengan Pasien *</Label>
                  <Select
                    value={handoverForm.receiver_relation}
                    onChange={(e) => setHandoverForm(prev => ({ ...prev, receiver_relation: e.target.value }))}
                  >
                    <option value="pasien">Pasien Sendiri</option>
                    <option value="suami">Suami</option>
                    <option value="istri">Istri</option>
                    <option value="anak">Anak</option>
                    <option value="orangtua">Orang Tua</option>
                    <option value="lainnya">Lainnya</option>
                  </Select>
                </div>
              </div>

              {/* Education Checklist */}
              <div>
                <Label className="text-base font-medium">Edukasi yang Diberikan *</Label>
                <p className="text-sm text-gray-600 mb-3">Centang edukasi yang telah diberikan kepada penerima obat:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {Object.entries(educationChecklist).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`education-${key}`}
                        checked={handoverForm.education_checklist.includes(label as string)}
                        onChange={(e) =>
                          handleEducationChecklistChange(label as string, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`education-${key}`} className="text-sm">
                        {label as string}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Catatan Tambahan</Label>
                <Textarea
                  id="notes"
                  value={handoverForm.notes}
                  onChange={(e) => setHandoverForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan jika ada..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHandoverModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createHandoverMutation.isPending || handoverForm.education_checklist.length === 0}
                  className="flex-1"
                >
                  {createHandoverMutation.isPending ? 'Menyimpan...' : 'Serah Terima Obat'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedHandover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Penyerahan Berhasil!</h3>
              <p className="text-gray-600 mb-6">
                Receipt penyerahan obat telah dibuat untuk {selectedHandover.prescription.patient.nama_pasien}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1"
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    downloadReceiptMutation.mutate(selectedHandover.id)
                    setShowReceiptModal(false)
                  }}
                  disabled={downloadReceiptMutation.isPending}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Unduh Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}