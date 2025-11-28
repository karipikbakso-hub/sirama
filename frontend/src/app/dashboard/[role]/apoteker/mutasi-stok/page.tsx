'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowUp, ArrowDown, Settings, FileText, Search, RefreshCw, Calendar, Download, Filter } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import api from '@/lib/api'

interface StockMovement {
  id: number
  medicine_id: number
  batch_id?: number
  type: 'in' | 'out' | 'adjustment' | 'expired' | 'damaged'
  quantity: number
  reference_type?: string
  reference_id?: number
  created_at: string
  medicine: {
    id: number
    nama_obat: string
    satuan: string
  }
  batch?: {
    batch_number: string
  }
}

export default function MutasiStokPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Build filters object
  const filters = {
    ...(searchTerm && { medicine_name: searchTerm }),
    ...(selectedType && { type: selectedType }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
  }

  // Infinite query for stock movements
  const {
    data: movementsData,
    isLoading: movementsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMovements
  } = useInfiniteQuery({
    queryKey: ['stock-movements', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get('/api/stock-movements', {
        params: {
          page: pageParam,
          per_page: 50, // As per requirement
          ...filters
        }
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.current_page || 1
      const totalPages = lastPage.data?.last_page || 1
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1
  })

  // Statistics query
  const { data: statsData } = useQuery({
    queryKey: ['stock-movements-stats', filters],
    queryFn: async () => {
      // Calculate stats from movements data
      const movements = movementsData?.pages.flatMap(page => page.data?.data || []) || []

      const stats = {
        total_movements: movements.length,
        in_count: movements.filter(m => m.type === 'in').length,
        out_count: movements.filter(m => m.type === 'out').length,
        adjustment_count: movements.filter(m => m.type === 'adjustment').length,
        expired_count: movements.filter(m => m.type === 'expired').length,
        damaged_count: movements.filter(m => m.type === 'damaged').length,
        total_quantity_in: movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0),
        total_quantity_out: movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0),
      }

      return stats
    },
    enabled: !!movementsData
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

  // Flatten movements data from infinite query
  const movements = movementsData?.pages.flatMap(page => page.data?.data || []) || []

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      'in': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Penerimaan', icon: ArrowUp },
      'out': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Pengeluaran', icon: ArrowDown },
      'adjustment': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Penyesuaian', icon: Settings },
      'expired': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Kadaluarsa', icon: Calendar },
      'damaged': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Rusak', icon: Settings }
    }
    const badge = badges[type] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: type, icon: Settings }
    const IconComponent = badge.icon

    return (
      <Badge className={`${badge.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {badge.label}
      </Badge>
    )
  }

  const getReferenceLink = (movement: StockMovement) => {
    if (movement.reference_type === 'prescription') {
      return `/apoteker/prescription/${movement.reference_id}`
    }
    if (movement.reference_type === 'adjustment') {
      return `/apoteker/adjustment/${movement.reference_id}`
    }
    return null
  }

  const getReferenceText = (movement: StockMovement) => {
    if (movement.reference_type === 'prescription') {
      return `Resep #${movement.reference_id}`
    }
    if (movement.reference_type === 'adjustment') {
      return `Penyesuaian #${movement.reference_id}`
    }
    return '-'
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/stock-movements/export', {
        params: filters,
        responseType: 'blob'
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.ms-excel'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.download = `mutasi_stok_${timestamp}.csv`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Laporan mutasi stok berhasil diunduh')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal mengunduh laporan mutasi stok')
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedType('')
    setDateFrom('')
    setDateTo('')
    refetchMovements()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="🔄 Mutasi Stok Obat"
        description="Riwayat lengkap pergerakan stok obat dengan filter & export untuk audit trail"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <ArrowUp className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Penerimaan</h3>
              <p className="text-sm text-green-700">
                {statsData?.in_count || 0} transaksi • {statsData?.total_quantity_in || 0} unit
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <ArrowDown className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Pengeluaran</h3>
              <p className="text-sm text-red-700">
                {statsData?.out_count || 0} transaksi • {statsData?.total_quantity_out || 0} unit
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">Penyesuaian</h3>
              <p className="text-sm text-blue-700">{statsData?.adjustment_count || 0} transaksi</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Total Mutasi</h3>
              <p className="text-sm text-orange-700">{statsData?.total_movements || 0} transaksi</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama obat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button onClick={() => refetchMovements()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="type">Tipe Pergerakan</Label>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Semua Tipe</option>
                  <option value="in">Penerimaan</option>
                  <option value="out">Pengeluaran</option>
                  <option value="adjustment">Penyesuaian</option>
                  <option value="expired">Kadaluarsa</option>
                  <option value="damaged">Rusak</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="date_from">Tanggal Mulai</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date_to">Tanggal Akhir</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleResetFilters} variant="outline" className="w-full">
                  Reset Filter
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Movements List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Riwayat Pergerakan Stok</h3>

        {movementsLoading && movements.length === 0 ? (
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
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {movements.map((movement, index) => (
              <div key={`movement-${movement.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{movement.medicine.nama_obat}</h4>
                      <p className="text-sm text-gray-600">
                        {movement.batch?.batch_number && `Batch: ${movement.batch.batch_number}`}
                      </p>
                    </div>
                    {getTypeBadge(movement.type)}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span>Jumlah: {movement.quantity} {movement.medicine.satuan}</span>
                    <span>Referensi: {
                      getReferenceLink(movement) ? (
                        <a
                          href={getReferenceLink(movement)!}
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {getReferenceText(movement)}
                        </a>
                      ) : (
                        getReferenceText(movement)
                      )
                    }</span>
                    <span>Waktu: {formatDate(movement.created_at)}</span>
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
                  Gulir ke bawah untuk memuat lebih banyak data
                </div>
              ) : movements.length > 0 ? (
                <div className="text-gray-500 text-sm">
                  Semua data telah dimuat ({movements.length} total)
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada data pergerakan stok ditemukan</p>
                  <p className="text-sm mt-1">Coba ubah filter pencarian</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
