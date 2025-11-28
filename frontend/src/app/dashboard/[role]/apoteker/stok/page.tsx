'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Package, Search, AlertTriangle, RefreshCw, Eye, Edit, FileText, Calendar, Plus, Minus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import api from '@/lib/api'

interface Medicine {
  id: number
  kode_obat: string
  nama_obat: string
  nama_generik: string
  golongan_obat: string
  satuan: string
  stok_minimum: number
  harga_jual: number
  aktif: boolean
  current_stock?: number
}

export default function StokApotekerPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)

  // Stock adjustment form state
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'adjustment',
    quantity: '',
    reason: ''
  })

  const queryClient = useQueryClient()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite query for medicines with auto-pagination
  const {
    data: medicinesData,
    isLoading: medicinesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMedicines
  } = useInfiniteQuery({
    queryKey: ['medicines', searchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/api/medicines', {
        params: {
          page: pageParam,
          per_page: 20, // Load 20 items per page
          search: searchTerm
        }
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

  // Intersection Observer for auto-pagination
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Fetch batch data (single request, not infinite)
  const { data: batchData, isLoading: batchLoading } = useInfiniteQuery({
    queryKey: ['medicine-batches', selectedMedicine?.id],
    queryFn: async () => {
      const response = await api.get(`/api/medicines/${selectedMedicine?.id}/batches`)
      return response.data
    },
    enabled: !!selectedMedicine && showBatchModal,
    initialPageParam: 1,
    getNextPageParam: () => undefined // No pagination for batches
  })

  // Fetch movement data (single request, not infinite)
  const { data: movementData, isLoading: movementLoading } = useInfiniteQuery({
    queryKey: ['stock-movements', selectedMedicine?.id],
    queryFn: async () => {
      const response = await api.get('/api/stock-movements', {
        params: { medicine_id: selectedMedicine?.id, limit: 50 }
      })
      return response.data
    },
    enabled: !!selectedMedicine && showMovementModal,
    initialPageParam: 1,
    getNextPageParam: () => undefined // No pagination for movements
  })

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/stock-adjustments', data)
      return response.data
    },
    onSuccess: async () => {
      toast.success('Stok berhasil disesuaikan')
      setShowAdjustmentModal(false)
      setAdjustmentForm({ type: 'adjustment', quantity: '', reason: '' })

      // ✅ FORCE COMPLETE CACHE CLEAR - INVALIDATE ALL MEDICINES-RELATED QUERIES
      console.log('🧹 Clearing all medicine caches...')
      await queryClient.invalidateQueries({ queryKey: ['medicines'], exact: false })
      await queryClient.invalidateQueries({ queryKey: ['low-stock-medicines'], exact: false })
      await queryClient.invalidateQueries({ queryKey: ['expiring-soon-medicines'], exact: false })
      await queryClient.invalidateQueries({ queryKey: ['stock-movements'], exact: false })

      // ✅ FORCE REFRESH MAIN MEDICINE DATA
      await refetchMedicines()

      console.log('✅ All caches cleared - dashboard updated in real-time!')
    },
    onError: (error: any) => {
      console.error('❌ Stock adjustment failed:', error)
      toast.error('Gagal menyesuaikan stok')
    }
  })

  // Fetch low stock medicines (single request)
  const { data: lowStockData } = useInfiniteQuery({
    queryKey: ['low-stock-medicines'],
    queryFn: async () => {
      const response = await api.get('/api/medicines/low-stock')
      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined
  })

  // Fetch expiring soon medicines (single request)
  const { data: expiringSoonData } = useInfiniteQuery({
    queryKey: ['expiring-soon-medicines'],
    queryFn: async () => {
      const response = await api.get('/api/medicines/expiring-soon', {
        params: { days: 90 }
      })
      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined
  })

  // Flatten medicines data from infinite query
  // API response structure: {success: true, data: {current_page:1, data:[medicines]}}
  const medicines = medicinesData?.pages.flatMap(page => page.data?.data || []) || []
  const lowStockMedicines = lowStockData?.pages.flatMap(page => page.data) || []
  const expiringSoonMedicines = expiringSoonData?.pages.flatMap(page => page.data) || []

  // 🔍🔍🔍 DEBUG: CHECK API RESPONSE FOR CURRENT_STOCK
  console.log('🎯 MEDICINES API RESPONSE:', medicines?.slice(0, 2)) // Show first 2 items
  console.log('✅ Current stock field exists on first medicine?', medicines[0]?.current_stock !== undefined)
  console.log('📊 Current stock value:', medicines[0]?.current_stock)

  // Remove duplicates and filter
  const uniqueMedicines = medicines.filter((medicine, index, self) =>
    index === self.findIndex(m => m.id === medicine.id)
  )

  const filteredMedicines = uniqueMedicines.filter(medicine =>
    (medicine.nama_obat?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (medicine.kode_obat?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (medicine.nama_generik?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getStockStatusBadge = (medicine: Medicine) => {
    const stock = medicine.current_stock || 0
    const reorderPoint = medicine.stok_minimum || 10

    if (stock === 0) {
      return <Badge variant="destructive">Habis</Badge>
    } else if (stock <= reorderPoint) {
      return <Badge className="bg-orange-100 text-orange-800">Menipis</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Tersedia</Badge>
  }

  const getCategoryLabel = (golongan: string) => {
    const labels: Record<string, string> = {
      'bebas': 'Obat Bebas',
      'bebas_terbatas': 'Obat Bebas Terbatas',
      'keras': 'Obat Keras',
      'narkotika': 'Narkotika',
      'psikotropika': 'Psikotropika'
    }
    return labels[golongan] || golongan
  }

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'in': 'Pembelian/Penerimaan',
      'out': 'Penjualan/Dispensing',
      'adjustment': 'Koreksi Stok',
      'expired': 'Kadaluarsa',
      'damaged': 'Rusak'
    }
    return labels[type] || type
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/medicines/export/stock', {
        responseType: 'blob' // Important for file downloads
      })

      // Create and trigger download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.ms-excel'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generate filename with current date
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.download = `laporan_stok_obat_${timestamp}.csv`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Laporan stok berhasil diunduh')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal mengunduh laporan stok')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📦 Manajemen Stok Obat"
        description="Monitor stok obat real-time, kelola batch, dan pantau pergerakan stok"
      />

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Stok Menipis</h3>
              <p className="text-sm text-orange-700">{lowStockMedicines.length} obat perlu restock</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Expired Soon</h3>
              <p className="text-sm text-red-700">{expiringSoonMedicines.length} obat akan expired</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">Total Obat</h3>
              <p className="text-sm text-blue-700">{medicines.length} jenis obat terdaftar</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari obat berdasarkan nama, kode, atau generik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => refetchMedicines()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </Card>

      {/* Medicine List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daftar Obat</h3>
        {medicinesLoading && medicines.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
          {filteredMedicines.map((medicine, index) => (
            <div key={`medicine-${medicine.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium">{medicine.nama_obat}</h4>
                    <p className="text-sm text-gray-600">{medicine.kode_obat} • {medicine.nama_generik}</p>
                  </div>
                  <Badge variant="outline">{getCategoryLabel(medicine.golongan_obat)}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>Stok: {medicine.current_stock || 0} {medicine.satuan}</span>
                  <span>Harga: Rp {(medicine.harga_jual || 0).toLocaleString('id-ID')}</span>
                  <span>Reorder Point: {medicine.stok_minimum}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStockStatusBadge(medicine)}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    title="Lihat Batch"
                    onClick={() => {
                      setSelectedMedicine(medicine)
                      setShowBatchModal(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Sesuaikan Stok"
                    onClick={() => {
                      setSelectedMedicine(medicine)
                      setShowAdjustmentModal(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Riwayat Pergerakan"
                    onClick={() => {
                      setSelectedMedicine(medicine)
                      setShowMovementModal(true)
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Memuat lebih banyak...</span>
              </div>
            ) : hasNextPage ? (
              <div className="text-gray-500 text-sm">
                Gulir ke bawah untuk memuat lebih banyak obat
              </div>
            ) : medicines.length > 0 ? (
              <div className="text-gray-500 text-sm">
                Semua obat telah dimuat ({medicines.length} total)
              </div>
            ) : null}
          </div>
        </div>
        )}
      </Card>

      {/* Low Stock Alerts */}
      {lowStockMedicines.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Peringatan Stok Menipis
          </h3>
          <div className="space-y-3">
            {lowStockMedicines.map((medicine) => (
              <div key={`low-stock-${medicine.id}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium">{medicine.nama_obat}</p>
                  <p className="text-sm text-orange-600">
                    Stok: {medicine.current_stock || 0} {medicine.satuan} • Reorder Point: {medicine.stok_minimum}
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Perlu Restock</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Batch Modal */}
      {showBatchModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Batch Tracking - {selectedMedicine.nama_obat}</h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>FEFO Strategy:</strong> First Expired First Out - Prioritas batch dengan tanggal expired terdekat
                </p>
              </div>

              {batchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Memuat data batch...</p>
                </div>
              ) : batchData?.pages[0]?.data ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Informasi Obat</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Stok:</span>
                        <span className="ml-2 font-medium">{batchData.pages[0].data.medicine.total_stock} {selectedMedicine.satuan}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Jumlah Batch:</span>
                        <span className="ml-2 font-medium">{batchData.pages[0].data.batches.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Daftar Batch (Diurutkan FEFO)</h4>
                    {batchData.pages[0].data.batches.length > 0 ? (
                      batchData.pages[0].data.batches.map((batch: any, index: number) => (
                        <div key={`batch-${batch.batch_number}-${index}`} className={`p-4 border rounded-lg ${index === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{batch.batch_number}</span>
                                {index === 0 && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Batch Terdekat Expired</Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Expired:</span>
                                  <span className="ml-2 font-medium">{new Date(batch.expired_date).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Stok:</span>
                                  <span className="ml-2 font-medium">{batch.stock} {selectedMedicine.satuan}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Harga:</span>
                                  <span className="ml-2 font-medium">Rp {batch.unit_price.toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Tidak ada data batch untuk obat ini</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Gagal memuat data batch</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Penyesuaian Stok - {selectedMedicine.nama_obat}</h3>
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                await adjustStockMutation.mutateAsync({
                  medicine_id: selectedMedicine.id,
                  type: adjustmentForm.type,
                  quantity: parseInt(adjustmentForm.quantity),
                  reason: adjustmentForm.reason
                })
            toast.success('Stok berhasil disesuaikan')
                setShowAdjustmentModal(false)
                setAdjustmentForm({ type: 'adjustment', quantity: '', reason: '' })
                refetchMedicines()
              } catch (error) {
                toast.error('Gagal menyesuaikan stok')
              }
            }} className="space-y-4">
              <div>
                <Label htmlFor="type">Tipe Penyesuaian</Label>
                <Select
                  value={adjustmentForm.type}
                  onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe penyesuaian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjustment">Koreksi Stok</SelectItem>
                    <SelectItem value="in">Pembelian/Penerimaan</SelectItem>
                    <SelectItem value="out">Penjualan/Dispensing</SelectItem>
                    <SelectItem value="expired">Kadaluarsa</SelectItem>
                    <SelectItem value="damaged">Rusak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Jumlah ({selectedMedicine.satuan})</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Masukkan jumlah..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Alasan Penyesuaian</Label>
                <Textarea
                  id="reason"
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Jelaskan alasan penyesuaian stok..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={adjustStockMutation.isPending}
                  className="flex-1"
                >
                  {adjustStockMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovementModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Riwayat Pergerakan Stok - {selectedMedicine.nama_obat}</h3>
              <button
                onClick={() => setShowMovementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {movementLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Memuat riwayat pergerakan...</p>
              </div>
            ) : movementData?.pages[0]?.data && movementData.pages[0].data.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Ringkasan Pergerakan</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {movementData.pages[0].data.filter((m: any) => m.type === 'in').reduce((sum: number, m: any) => sum + Math.abs(m.quantity), 0)}
                      </div>
                      <div className="text-gray-600">Masuk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {movementData.pages[0].data.filter((m: any) => m.type === 'out').reduce((sum: number, m: any) => sum + Math.abs(m.quantity), 0)}
                      </div>
                      <div className="text-gray-600">Keluar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {movementData.pages[0].data.filter((m: any) => m.type === 'adjustment').reduce((sum: number, m: any) => sum + Math.abs(m.quantity), 0)}
                      </div>
                      <div className="text-gray-600">Penyesuaian</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {movementData.pages[0].data.filter((m: any) => ['expired', 'damaged'].includes(m.type)).reduce((sum: number, m: any) => sum + Math.abs(m.quantity), 0)}
                      </div>
                      <div className="text-gray-600">Rusak/Kadaluarsa</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Detail Pergerakan</h4>
                  <div className="max-h-96 overflow-y-auto">
                    {movementData.pages[0].data.map((movement: any) => (
                      <div key={`movement-${movement.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{getMovementTypeLabel(movement.type)}</span>
                            <Badge
                              className={`${
                                movement.type === 'in' ? 'bg-green-100 text-green-800' :
                                movement.type === 'out' ? 'bg-red-100 text-red-800' :
                                movement.type === 'adjustment' ? 'bg-blue-100 text-blue-800' :
                                'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
                              {Math.abs(movement.quantity)} {selectedMedicine.satuan}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {movement.reason && <div>Alasan: {movement.reason}</div>}
                            <div>
                              {new Date(movement.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {movement.adjusted_by && ` • Oleh: ${movement.adjusted_by.name}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada riwayat pergerakan stok untuk obat ini</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
