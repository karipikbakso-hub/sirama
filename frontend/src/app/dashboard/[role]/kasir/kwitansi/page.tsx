'use client'

import { useState, useMemo } from 'react'

interface Receipt {
  id: number
  receipt_number: string
  status: 'active' | 'voided'
  payment_id: number
  void_reason?: string
  voided_at?: string
  created_at: string
  updated_at: string
  payment?: {
    id: number
    jumlah_bayar: number
    metode_bayar: string
    tanggal_bayar: string
    billing?: {
      id: number
      no_invoice: string
      total_bayar: number
      patient_name: string
      medical_record_number: string
    }
  }
  patient_name?: string
  medical_record_number?: string
  payment_amount?: number
  payment_method?: string
  cashier_name?: string
}
import { FaReceipt, FaSearch, FaPrint, FaEye, FaDownload, FaBan, FaCalendarAlt, FaFilter } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'


type ReceiptDetail = {
  receipt: Receipt
  items: any[]
}

export default function KwitansiPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({})
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch receipts
  const { data: receiptsData, isLoading, error } = useQuery({
    queryKey: ['receipts', searchTerm, statusFilter, paymentMethodFilter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter)
      if (dateRange.from) params.append('start_date', dateRange.from.toISOString().split('T')[0])
      if (dateRange.to) params.append('end_date', dateRange.to.toISOString().split('T')[0])

      const response = await api.get(`/receipts?${params.toString()}`)
      return response.data
    }
  })

  // Fetch receipt detail
  const { data: receiptDetail } = useQuery({
    queryKey: ['receipt-detail', selectedReceipt?.id],
    queryFn: async () => {
      if (!selectedReceipt) return null
      const response = await api.get(`/receipts/${selectedReceipt.id}`)
      return response.data.data as ReceiptDetail
    },
    enabled: !!selectedReceipt
  })

  // Void receipt mutation
  const voidMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number, reason: string }) => {
      const response = await api.post(`/receipts/${id}/void`, { reason })
      return response.data
    },
    onSuccess: () => {
      toast.success('Kwitansi berhasil dibatalkan')
      queryClient.invalidateQueries({ queryKey: ['receipts'] })
      setIsVoidDialogOpen(false)
      setVoidReason('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membatalkan kwitansi')
    }
  })

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (filters: any) => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.payment_method !== 'all') params.append('payment_method', filters.payment_method)
      if (filters.start_date) params.append('start_date', filters.start_date)
      if (filters.end_date) params.append('end_date', filters.end_date)

      const response = await api.get(`/receipts-export?${params.toString()}`, {
        responseType: 'blob'
      })
      return response.data
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'kwitansi.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Data berhasil diekspor')
    },
    onError: () => {
      toast.error('Gagal mengekspor data')
    }
  })

  const receipts = receiptsData?.data || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'voided': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'voided': return 'Dibatalkan'
      default: return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      'tunai': 'Tunai',
      'transfer': 'Transfer',
      'kartu_kredit': 'Kartu Kredit',
      'kartu_debit': 'Kartu Debit',
      'e_wallet': 'E-Wallet',
      'bpjs': 'BPJS',
      'deposit': 'Deposit'
    }
    return methods[method] || method
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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrint = async (receipt: Receipt) => {
    try {
      const response = await api.get(`/receipts/${receipt.id}/reprint`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `kwitansi_${receipt.receipt_number}_reprint.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Kwitansi berhasil dicetak ulang')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mencetak kwitansi')
    }
  }

  const handleVoid = () => {
    if (!selectedReceipt || !voidReason.trim()) return
    voidMutation.mutate({ id: selectedReceipt.id, reason: voidReason.trim() })
  }

  const handleExport = () => {
    const filters = {
      search: searchTerm,
      status: statusFilter,
      payment_method: paymentMethodFilter,
      start_date: dateRange.from?.toISOString().split('T')[0],
      end_date: dateRange.to?.toISOString().split('T')[0]
    }
    exportMutation.mutate(filters)
  }

  const stats = useMemo(() => {
    if (!receipts.length) return { active: 0, voided: 0, total: 0 }
    return {
      active: receipts.filter((r: Receipt) => r.status === 'active').length,
      voided: receipts.filter((r: Receipt) => r.status === 'voided').length,
      total: receipts.length
    }
  }, [receipts])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaReceipt className="text-blue-500" />
            <span>Kwitansi</span>
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaReceipt className="text-blue-500" />
            <span>Kwitansi</span>
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center py-8 text-red-500">
            <p>Gagal memuat data kwitansi</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaReceipt className="text-blue-500" />
          <span>Kwitansi</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola dan cetak kwitansi pembayaran pasien
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari nama pasien, no RM, atau no kwitansi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-48 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter berdasarkan status"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="voided">Dibatalkan</option>
            </select>

            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full lg:w-48 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter berdasarkan metode pembayaran"
            >
              <option value="all">Semua Metode</option>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="kartu_kredit">Kartu Kredit</option>
              <option value="kartu_debit">Kartu Debit</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="bpjs">BPJS</option>
              <option value="deposit">Deposit</option>
            </select>

            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <Input
                type="date"
                value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
                placeholder="Dari tanggal"
                className="w-32"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="date"
                value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
                placeholder="Sampai tanggal"
                className="w-32"
              />
            </div>

            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaDownload />
              {exportMutation.isPending ? 'Mengekspor...' : 'Ekspor CSV'}
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                  <th className="py-3 px-2">No. Kwitansi</th>
                  <th className="px-2">Nama Pasien</th>
                  <th className="px-2 hidden md:table-cell">No. RM</th>
                  <th className="px-2 hidden sm:table-cell">Tanggal</th>
                  <th className="px-2">Jumlah</th>
                  <th className="px-2 hidden md:table-cell">Metode</th>
                  <th className="px-2 hidden md:table-cell">Kasir</th>
                  <th className="px-2">Status</th>
                  <th className="text-right px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt: Receipt) => (
                  <tr
                    key={receipt.id}
                    className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                  >
                    <td className="py-3 px-2 font-medium text-blue-600 dark:text-blue-400">
                      {receipt.receipt_number}
                    </td>
                    <td className="px-2 font-medium">
                      <div className="flex flex-col">
                        <span>{receipt.patient_name}</span>
                        <span className="text-xs text-gray-500 md:hidden">{receipt.medical_record_number}</span>
                      </div>
                    </td>
                    <td className="px-2 hidden md:table-cell">{receipt.medical_record_number}</td>
                    <td className="px-2 hidden sm:table-cell">{formatDate(receipt.created_at)}</td>
                    <td className="px-2 font-medium">{formatCurrency(receipt.payment_amount || 0)}</td>
                    <td className="px-2 hidden md:table-cell">{getPaymentMethodText(receipt.payment_method || '')}</td>
                    <td className="px-2 hidden md:table-cell">{receipt.cashier_name}</td>
                    <td className="px-2">
                      <Badge className={getStatusColor(receipt.status)}>
                        {getStatusText(receipt.status)}
                      </Badge>
                    </td>
                    <td className="text-right px-2">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReceipt(receipt)}
                              title="Lihat Detail"
                            >
                              <FaEye />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detail Kwitansi {receipt.receipt_number}</DialogTitle>
                            </DialogHeader>
                            {receiptDetail && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">No. Kwitansi</Label>
                                    <p className="text-sm">{receiptDetail.receipt.receipt_number}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge className={getStatusColor(receiptDetail.receipt.status)}>
                                      {getStatusText(receiptDetail.receipt.status)}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Nama Pasien</Label>
                                    <p className="text-sm">{receiptDetail.receipt.patient_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">No. RM</Label>
                                    <p className="text-sm">{receiptDetail.receipt.medical_record_number}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Jumlah Bayar</Label>
                                    <p className="text-sm font-medium">{formatCurrency(receiptDetail.receipt.payment_amount || 0)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Metode Bayar</Label>
                                    <p className="text-sm">{getPaymentMethodText(receiptDetail.receipt.payment_method || '')}</p>
                                  </div>
                                </div>

                                {receiptDetail.items && receiptDetail.items.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Rincian Tagihan</Label>
                                    <div className="border rounded-lg overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                          <tr>
                                            <th className="px-3 py-2 text-left">Item</th>
                                            <th className="px-3 py-2 text-center">Qty</th>
                                            <th className="px-3 py-2 text-right">Harga</th>
                                            <th className="px-3 py-2 text-right">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {receiptDetail.items.map((item: any, index: number) => (
                                            <tr key={index} className="border-t">
                                              <td className="px-3 py-2">{item.description}</td>
                                              <td className="px-3 py-2 text-center">{item.quantity}</td>
                                              <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                                              <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(receipt)}
                          disabled={receipt.status === 'voided'}
                          title="Cetak Ulang"
                        >
                          <FaPrint />
                        </Button>

                        {receipt.status === 'active' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReceipt(receipt)}
                                className="text-red-600 hover:text-red-700"
                                title="Batalkan Kwitansi"
                              >
                                <FaBan />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Batalkan Kwitansi</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Apakah Anda yakin ingin membatalkan kwitansi {receipt.receipt_number}?
                                  Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div>
                                  <Label htmlFor="void-reason">Alasan Pembatalan</Label>
                                  <Textarea
                                    id="void-reason"
                                    placeholder="Masukkan alasan pembatalan..."
                                    value={voidReason}
                                    onChange={(e) => setVoidReason(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setVoidReason('')
                                    setIsVoidDialogOpen(false)
                                  }}
                                >
                                  Batal
                                </Button>
                                <Button
                                  onClick={handleVoid}
                                  disabled={!voidReason.trim() || voidMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {voidMutation.isPending ? 'Membatalkan...' : 'Batalkan Kwitansi'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {receipts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaReceipt className="mx-auto text-4xl mb-2" />
              <p>Tidak ada kwitansi yang ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kwitansi Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Kwitansi yang masih berlaku</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kwitansi Dibatalkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.voided}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Kwitansi yang sudah dibatalkan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Kwitansi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total semua kwitansi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
