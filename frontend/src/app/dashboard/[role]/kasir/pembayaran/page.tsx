'use client'

import { useState, useEffect } from 'react'
import { FaCreditCard, FaMoneyBillWave, FaSearch, FaEye, FaPlus, FaTrash, FaReceipt, FaPrint, FaDownload } from 'react-icons/fa'
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

type PaymentMethod = {
  method: 'cash' | 'debit' | 'credit' | 'transfer' | 'bpjs' | 'deposit'
  amount: number
  reference_number?: string
}

type PaymentForm = {
  billing_id: number
  payments: PaymentMethod[]
  notes: string
}

export default function PembayaranPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBilling, setSelectedBilling] = useState<BillingDetail | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    billing_id: 0,
    payments: [{ method: 'cash', amount: 0 }],
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch pending billings
  const { data: billingsData, isLoading } = useQuery({
    queryKey: ['pending-billings', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)

      const response = await api.get(`/billings/pending-payment?${params.toString()}`)
      return response.data
    }
  })

  // Fetch billing detail
  const fetchBillingDetail = async (id: number) => {
    const response = await api.get(`/billings/${id}`)
    return response.data.data
  }

  // Process payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      const response = await api.post('/payments/process', data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Pembayaran berhasil diproses!')
      queryClient.invalidateQueries({ queryKey: ['pending-billings'] })
      setShowPaymentModal(false)

      // Show receipt info
      if (data.data.receipt_number) {
        toast.success(`Nomor Receipt: ${data.data.receipt_number}`)
        if (data.data.change_amount > 0) {
          toast.info(`Kembalian: Rp ${data.data.change_amount.toLocaleString('id-ID')}`)
        }
      }

      resetPaymentForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran')
    }
  })

  const resetPaymentForm = () => {
    setPaymentForm({
      billing_id: 0,
      payments: [{ method: 'cash', amount: 0 }],
      notes: ''
    })
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

  const handleProcessPayment = async (billing: Billing) => {
    try {
      const detail = await fetchBillingDetail(billing.id)
      setSelectedBilling(detail)
      setPaymentForm({
        billing_id: billing.id,
        payments: [{ method: 'cash', amount: billing.total_bayar }],
        notes: ''
      })
      setShowPaymentModal(true)
    } catch (error) {
      toast.error('Gagal memuat detail billing')
    }
  }

  const addPaymentMethod = () => {
    setPaymentForm(prev => ({
      ...prev,
      payments: [...prev.payments, { method: 'cash', amount: 0 }]
    }))
  }

  const removePaymentMethod = (index: number) => {
    if (paymentForm.payments.length > 1) {
      setPaymentForm(prev => ({
        ...prev,
        payments: prev.payments.filter((_, i) => i !== index)
      }))
    }
  }

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: any) => {
    setPaymentForm(prev => ({
      ...prev,
      payments: prev.payments.map((payment, i) =>
        i === index ? { ...payment, [field]: value } : payment
      )
    }))
  }

  const calculateTotalPayment = () => {
    return paymentForm.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  }

  const calculateChange = () => {
    if (!selectedBilling) return 0
    const totalPayment = calculateTotalPayment()
    const billingAmount = selectedBilling.billing.total_bayar
    return Math.max(0, totalPayment - billingAmount)
  }

  const isPaymentValid = () => {
    if (!selectedBilling) return false
    const totalPayment = calculateTotalPayment()
    return totalPayment >= selectedBilling.billing.total_bayar
  }

  const handlePaymentSubmit = () => {
    if (!isPaymentValid()) {
      toast.error('Total pembayaran kurang dari jumlah tagihan')
      return
    }

    paymentMutation.mutate(paymentForm)
  }

  const generateReceipt = async (billingId: number) => {
    try {
      const response = await api.get(`/payments/${billingId}/generate-receipt`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt_${billingId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Receipt berhasil diunduh')
    } catch (error: any) {
      toast.error('Gagal mengunduh receipt')
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: 'Tunai',
      debit: 'Kartu Debit',
      credit: 'Kartu Kredit',
      transfer: 'Transfer Bank',
      bpjs: 'BPJS',
      deposit: 'Deposit Pasien'
    }
    return labels[method as keyof typeof labels] || method
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Pembayaran'
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
          <FaCreditCard className="text-green-500" />
          <span>Pemrosesan Pembayaran</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola pembayaran tagihan pasien
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        {/* Search */}
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
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : billings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FaCreditCard className="mx-auto text-4xl mb-2" />
                    <p>Tidak ada billing yang menunggu pembayaran</p>
                  </td>
                </tr>
              ) : (
                billings.map((bill: Billing) => (
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
                          variant="default"
                          size="sm"
                          onClick={() => handleProcessPayment(bill)}
                          title="Proses Pembayaran"
                        >
                          <FaCreditCard className="mr-1" />
                          Bayar
                        </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Billing Menunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(billings.reduce((sum: number, b: Billing) => sum + b.total_bayar, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {billings.length > 0
                ? formatCurrency(billings.reduce((sum: number, b: Billing) => sum + b.total_bayar, 0) / billings.length)
                : formatCurrency(0)
              }
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
                <Button onClick={() => generateReceipt(selectedBilling.billing.id)}>
                  <FaDownload className="mr-2" />
                  Unduh Invoice
                </Button>
                <Button onClick={() => {
                  setShowDetailModal(false)
                  handleProcessPayment(selectedBilling.billing)
                }}>
                  <FaCreditCard className="mr-2" />
                  Proses Pembayaran
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proses Pembayaran - {selectedBilling?.billing.no_invoice}</DialogTitle>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-6">
              {/* Billing Summary */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{selectedBilling.billing.patient_name}</p>
                    <p className="text-sm text-gray-600">{selectedBilling.billing.medical_record_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedBilling.billing.total_bayar)}</p>
                    <p className="text-sm text-gray-600">Total Tagihan</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Metode Pembayaran</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPaymentMethod}
                    disabled={paymentForm.payments.length >= 3}
                  >
                    <FaPlus className="mr-1" />
                    Tambah Metode
                  </Button>
                </div>

                <div className="space-y-3">
                  {paymentForm.payments.map((payment, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label>Metode Pembayaran</Label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={payment.method}
                          onChange={(e) => updatePaymentMethod(index, 'method', e.target.value as PaymentMethod['method'])}
                        >
                          <option value="cash">Tunai</option>
                          <option value="debit">Kartu Debit</option>
                          <option value="credit">Kartu Kredit</option>
                          <option value="transfer">Transfer Bank</option>
                          <option value="bpjs">BPJS</option>
                          <option value="deposit">Deposit Pasien</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <Label>Jumlah</Label>
                        <Input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => updatePaymentMethod(index, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      {(payment.method === 'debit' || payment.method === 'credit' || payment.method === 'transfer') && (
                        <div className="flex-1">
                          <Label>No. Referensi</Label>
                          <Input
                            value={payment.reference_number || ''}
                            onChange={(e) => updatePaymentMethod(index, 'reference_number', e.target.value)}
                            placeholder="Nomor kartu/transaksi"
                          />
                        </div>
                      )}
                      {paymentForm.payments.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePaymentMethod(index)}
                          className="mb-0"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Tagihan:</span>
                    <span className="font-semibold">{formatCurrency(selectedBilling.billing.total_bayar)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Dibayar:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(calculateTotalPayment())}</span>
                  </div>
                  {calculateChange() > 0 && (
                    <div className="flex justify-between">
                      <span>Kembalian:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(calculateChange())}</span>
                    </div>
                  )}
                  {calculateTotalPayment() < selectedBilling.billing.total_bayar && (
                    <div className="flex justify-between">
                      <span>Kurang:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedBilling.billing.total_bayar - calculateTotalPayment())}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Tambahkan catatan pembayaran..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                  Batal
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={paymentMutation.isPending || !isPaymentValid()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {paymentMutation.isPending ? 'Memproses...' : 'Proses Pembayaran'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
