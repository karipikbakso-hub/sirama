'use client'

import { useState, useEffect } from 'react'
import { FaFileInvoice, FaSearch, FaEye, FaPrint, FaFilter, FaDownload, FaPercent, FaEdit } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Billing = {
  id: number
  no_invoice: string
  patient_name: string
  medical_record_number: string
  tanggal_billing: string
  total_tagihan: number
  diskon: number
  total_bayar: number
  status: 'draft' | 'pending' | 'partial_paid' | 'paid' | 'cancelled'
  cashier_name?: string
  insurance_type?: string
}

type BillingDetail = {
  billing: Billing & {
    date_of_birth?: string
    address?: string
    jenis_kunjungan?: string
  }
  items: Array<{
    type: string
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
}

type DiscountForm = {
  discount_type: 'percentage' | 'nominal'
  discount_value: number
  reason: string
  approved_by: string
}

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [insuranceFilter, setInsuranceFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedBilling, setSelectedBilling] = useState<BillingDetail | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discountForm, setDiscountForm] = useState<DiscountForm>({
    discount_type: 'percentage',
    discount_value: 0,
    reason: '',
    approved_by: ''
  })

  const queryClient = useQueryClient()

  // Fetch billings
  const { data: billingsData, isLoading } = useQuery({
    queryKey: ['billings', searchTerm, statusFilter, insuranceFilter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (insuranceFilter !== 'all') params.append('insurance_type', insuranceFilter)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await api.get(`/billings?${params.toString()}`)
      return response.data
    }
  })

  // Fetch billing detail
  const fetchBillingDetail = async (id: number) => {
    const response = await api.get(`/billings/${id}`)
    return response.data.data
  }

  // Discount mutation
  const discountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DiscountForm }) => {
      const response = await api.post(`/billings/${id}/adjust-discount`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Diskon berhasil disesuaikan')
      queryClient.invalidateQueries({ queryKey: ['billings'] })
      setShowDiscountModal(false)
      setDiscountForm({
        discount_type: 'percentage',
        discount_value: 0,
        reason: '',
        approved_by: ''
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyesuaikan diskon')
    }
  })

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.patch(`/billings/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      toast.success('Status billing berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['billings'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status')
    }
  })

  // Generate invoice
  const generateInvoice = async (id: number) => {
    try {
      const response = await api.get(`/billings/${id}/generate-invoice`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Invoice berhasil diunduh')
    } catch (error: any) {
      toast.error('Gagal mengunduh invoice')
    }
  }

  const handleViewDetail = async (billing: Billing) => {
    try {
      const detail = await fetchBillingDetail(billing.id)
      setSelectedBilling(detail)
      setShowDetailModal(true)
    } catch (error) {
      toast.error('Gagal memuat detail billing')
    }
  }

  const handleDiscountSubmit = (billingId: number) => {
    discountMutation.mutate({ id: billingId, data: discountForm })
  }

  const handleStatusChange = (billingId: number, status: string) => {
    statusMutation.mutate({ id: billingId, status })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'partial_paid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'pending': return 'Menunggu'
      case 'partial_paid': return 'Dibayar Sebagian'
      case 'paid': return 'Lunas'
      case 'cancelled': return 'Dibatalkan'
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

  const billings = billingsData?.data || []

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaFileInvoice className="text-blue-500" />
          <span>Manajemen Billing</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola tagihan dan pembayaran pasien
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari nama pasien, no RM, no invoice..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Menunggu</option>
              <option value="partial_paid">Dibayar Sebagian</option>
              <option value="paid">Lunas</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value)}
            >
              <option value="all">Semua Penjamin</option>
              <option value="BPJS">BPJS</option>
              <option value="Umum">Umum</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-32"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-32"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">No. Invoice</th>
                <th className="px-2">Nama Pasien</th>
                <th className="px-2 hidden md:table-cell">No. RM</th>
                <th className="px-2 hidden sm:table-cell">Tanggal</th>
                <th className="px-2">Total Tagihan</th>
                <th className="px-2 hidden md:table-cell">Diskon</th>
                <th className="px-2">Total Bayar</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : billings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FaFileInvoice className="mx-auto text-4xl mb-2" />
                    <p>Tidak ada billing yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                billings.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                  >
                    <td className="py-3 px-2 font-medium">{bill.no_invoice}</td>
                    <td className="px-2 font-medium">
                      <div className="flex flex-col">
                        <span>{bill.patient_name}</span>
                        <span className="text-xs text-gray-500 md:hidden">{bill.medical_record_number}</span>
                      </div>
                    </td>
                    <td className="px-2 hidden md:table-cell">{bill.medical_record_number}</td>
                    <td className="px-2 hidden sm:table-cell">
                      {new Date(bill.tanggal_billing).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-2 font-medium">{formatCurrency(bill.total_tagihan)}</td>
                    <td className="px-2 hidden md:table-cell">{formatCurrency(bill.diskon)}</td>
                    <td className="px-2 font-medium text-green-600">{formatCurrency(bill.total_bayar)}</td>
                    <td className="px-2">
                      <Badge className={getStatusColor(bill.status)}>
                        {getStatusText(bill.status)}
                      </Badge>
                    </td>
                    <td className="text-right px-2">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(bill)}
                          title="Lihat Detail"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateInvoice(bill.id)}
                          title="Unduh Invoice"
                        >
                          <FaDownload />
                        </Button>
                        {(bill.status === 'draft' || bill.status === 'pending') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBilling({ billing: bill, items: [] })
                              setShowDiscountModal(true)
                            }}
                            title="Sesuaikan Diskon"
                          >
                            <FaPercent />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {billingsData?.links && (
          <div className="mt-4 flex justify-center">
            <div className="flex gap-2">
              {billingsData.links.map((link: any, index: number) => (
                <Button
                  key={index}
                  variant={link.active ? "default" : "outline"}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => {
                    if (link.url) {
                      // Handle pagination
                    }
                  }}
                >
                  {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {billings.filter(b => b.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lunas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {billings.filter(b => b.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(billings.reduce((sum, b) => sum + b.total_bayar, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Billing - {selectedBilling?.billing.no_invoice}</DialogTitle>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Pasien</h4>
                  <p><strong>Nama:</strong> {selectedBilling.billing.patient_name}</p>
                  <p><strong>No. RM:</strong> {selectedBilling.billing.medical_record_number}</p>
                  <p><strong>Penjamin:</strong> {selectedBilling.billing.insurance_type || 'Umum'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informasi Billing</h4>
                  <p><strong>Tanggal:</strong> {new Date(selectedBilling.billing.tanggal_billing).toLocaleDateString('id-ID')}</p>
                  <p><strong>Kasir:</strong> {selectedBilling.billing.cashier_name || 'N/A'}</p>
                  <p><strong>Status:</strong> <Badge className={getStatusColor(selectedBilling.billing.status)}>{getStatusText(selectedBilling.billing.status)}</Badge></p>
                </div>
              </div>

              {/* Billing Items */}
              <div>
                <h4 className="font-semibold mb-4">Breakdown Biaya</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="p-2 text-left">Deskripsi</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Harga Satuan</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBilling.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="p-2 text-right">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td colSpan={3} className="p-2 text-right">Subtotal:</td>
                        <td className="p-2 text-right">{formatCurrency(selectedBilling.billing.total_tagihan + selectedBilling.billing.diskon)}</td>
                      </tr>
                      {selectedBilling.billing.diskon > 0 && (
                        <tr>
                          <td colSpan={3} className="p-2 text-right">Diskon:</td>
                          <td className="p-2 text-right text-red-600">-{formatCurrency(selectedBilling.billing.diskon)}</td>
                        </tr>
                      )}
                      <tr className="border-t font-bold">
                        <td colSpan={3} className="p-2 text-right">Total Bayar:</td>
                        <td className="p-2 text-right text-green-600">{formatCurrency(selectedBilling.billing.total_bayar)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button onClick={() => generateInvoice(selectedBilling.billing.id)}>
                  <FaDownload className="mr-2" />
                  Unduh Invoice
                </Button>
                {(selectedBilling.billing.status === 'draft' || selectedBilling.billing.status === 'pending') && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDiscountModal(true)
                        setShowDetailModal(false)
                      }}
                    >
                      <FaPercent className="mr-2" />
                      Sesuaikan Diskon
                    </Button>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusChange(selectedBilling.billing.id, e.target.value)
                          setShowDetailModal(false)
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Ubah Status</option>
                      <option value="paid">Tandai Lunas</option>
                      <option value="cancelled">Batalkan</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Discount Modal */}
      <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sesuaikan Diskon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="discount_type">Tipe Diskon</Label>
              <select
                id="discount_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                value={discountForm.discount_type}
                onChange={(e) => setDiscountForm(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'nominal' }))}
              >
                <option value="percentage">Persentase (%)</option>
                <option value="nominal">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount_value">
                Nilai Diskon {discountForm.discount_type === 'percentage' ? '(%)' : '(Rp)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                value={discountForm.discount_value}
                onChange={(e) => setDiscountForm(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                placeholder={discountForm.discount_type === 'percentage' ? '0-50' : '0'}
              />
            </div>
            <div>
              <Label htmlFor="reason">Alasan</Label>
              <Textarea
                id="reason"
                value={discountForm.reason}
                onChange={(e) => setDiscountForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Jelaskan alasan pemberian diskon..."
              />
            </div>
            <div>
              <Label htmlFor="approved_by">Disetujui Oleh</Label>
              <Input
                id="approved_by"
                value={discountForm.approved_by}
                onChange={(e) => setDiscountForm(prev => ({ ...prev, approved_by: e.target.value }))}
                placeholder="Nama yang menyetujui"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDiscountModal(false)}>
                Batal
              </Button>
              <Button
                onClick={() => selectedBilling && handleDiscountSubmit(selectedBilling.billing.id)}
                disabled={discountMutation.isPending}
              >
                {discountMutation.isPending ? 'Menyimpan...' : 'Simpan Diskon'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
