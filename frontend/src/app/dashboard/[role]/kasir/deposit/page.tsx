'use client'

import { useState, useEffect } from 'react'
import { FaWallet, FaSearch, FaEye, FaPlus, FaMinus, FaHistory, FaExclamationTriangle, FaMoneyBillWave, FaDownload } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from '@/lib/toast'
import { usePatientSearch } from '@/hooks/usePatientSearch'
import { Patient } from '@/types/role/pendaftaran'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Deposit = {
  id: number
  patient_id: number
  deposit_type: 'rawat_inap' | 'rawat_jalan'
  balance: number
  status: 'active' | 'inactive' | 'refunded'
  patient: {
    id: number
    nama_pasien: string
    no_rm: string
  }
  created_at: string
  updated_at: string
}

type DepositTransaction = {
  id: number
  deposit_id: number
  type: 'top_up' | 'deduct' | 'refund'
  amount: number
  payment_method?: string
  reference_id?: string
  notes?: string
  created_by?: number
  created_at: string
}

type DepositDetail = {
  deposit: Deposit
  transactions: DepositTransaction[]
}

type TopUpForm = {
  patient_id: number
  deposit_type: 'rawat_inap' | 'rawat_jalan'
  amount: number
  payment_method: string
  reference_id?: string
  notes?: string
}

type RefundForm = {
  amount: number
  reason: string
  approved_by: string
}

export default function DepositPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [depositTypeFilter, setDepositTypeFilter] = useState<string>('all')
  const [showLowBalanceOnly, setShowLowBalanceOnly] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState<DepositDetail | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [topUpForm, setTopUpForm] = useState<TopUpForm>({
    patient_id: 0,
    deposit_type: 'rawat_inap',
    amount: 0,
    payment_method: 'tunai',
    reference_id: '',
    notes: ''
  })
  const [refundForm, setRefundForm] = useState<RefundForm>({
    amount: 0,
    reason: '',
    approved_by: ''
  })

  // Patient search for top-up
  const { query: patientSearchQuery, setQuery: setPatientSearchQuery, suggestions: patientSuggestions, isLoading: isPatientSearchLoading } = usePatientSearch()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  const queryClient = useQueryClient()

  // Fetch deposits
  const { data: depositsData, isLoading } = useQuery({
    queryKey: ['deposits', searchTerm, depositTypeFilter, showLowBalanceOnly],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (depositTypeFilter !== 'all') params.append('deposit_type', depositTypeFilter)
      if (showLowBalanceOnly) params.append('low_balance', '1')

      const response = await api.get(`/deposits?${params.toString()}`)
      return response.data
    }
  })

  // Fetch deposit statistics
  const { data: statsData } = useQuery({
    queryKey: ['deposit-statistics'],
    queryFn: async () => {
      const response = await api.get('/deposits/statistics')
      return response.data.data
    }
  })

  // Top-up mutation
  const topUpMutation = useMutation({
    mutationFn: async (data: TopUpForm) => {
      const response = await api.post('/deposits/top-up', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Top-up deposit berhasil')
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      queryClient.invalidateQueries({ queryKey: ['deposit-statistics'] })
      setShowTopUpModal(false)
      resetTopUpForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal melakukan top-up deposit')
    }
  })

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RefundForm }) => {
      const response = await api.post(`/deposits/${id}/refund`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Refund deposit berhasil')
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      queryClient.invalidateQueries({ queryKey: ['deposit-statistics'] })
      setShowRefundModal(false)
      resetRefundForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal melakukan refund deposit')
    }
  })

  const resetTopUpForm = () => {
    setTopUpForm({
      patient_id: 0,
      deposit_type: 'rawat_inap',
      amount: 0,
      payment_method: 'tunai',
      reference_id: '',
      notes: ''
    })
  }

  const resetRefundForm = () => {
    setRefundForm({
      amount: 0,
      reason: '',
      approved_by: ''
    })
  }

  const handleViewDetail = async (deposit: Deposit) => {
    try {
      const response = await api.get(`/deposits/${deposit.id}`)
      setSelectedDeposit(response.data.data)
      setShowDetailModal(true)
    } catch (error) {
      toast.error('Gagal memuat detail deposit')
    }
  }

  const handleTopUp = () => {
    if (!selectedPatient || topUpForm.patient_id === 0) {
      toast.error('Silakan pilih pasien terlebih dahulu')
      return
    }
    if (topUpForm.amount <= 0) {
      toast.error('Jumlah top-up harus lebih dari 0')
      return
    }
    if (!topUpForm.payment_method) {
      toast.error('Silakan pilih metode pembayaran')
      return
    }
    topUpMutation.mutate(topUpForm)
  }

  const handleRefund = (depositId: number) => {
    if (refundForm.amount <= 0) {
      toast.error('Jumlah refund harus lebih dari 0')
      return
    }
    refundMutation.mutate({ id: depositId, data: refundForm })
  }

  const getDepositTypeText = (type: string) => {
    switch (type) {
      case 'rawat_inap': return 'Rawat Inap'
      case 'rawat_jalan': return 'Rawat Jalan'
      default: return type
    }
  }

  const getDepositTypeColor = (type: string) => {
    switch (type) {
      case 'rawat_inap': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'rawat_jalan': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'top_up': return 'Top-up'
      case 'deduct': return 'Penggunaan'
      case 'refund': return 'Refund'
      default: return type
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'top_up': return 'text-green-600'
      case 'deduct': return 'text-red-600'
      case 'refund': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const deposits = depositsData?.data || []
  const stats = statsData || {}

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaWallet className="text-blue-500" />
          <span>Manajemen Deposit</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola deposit pasien untuk pembayaran layanan kesehatan
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deposit Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_active_deposits || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.total_balance || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deposit Rendah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.low_balance_count || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">&lt; Rp 100.000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rawat Inap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.rawat_inap_count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Balance Alert */}
      {(stats.low_balance_count || 0) > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <FaExclamationTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Ada {stats.low_balance_count} deposit dengan saldo rendah (&lt; Rp 100.000).
            Periksa dan lakukan top-up jika diperlukan.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari nama pasien, no RM..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={depositTypeFilter}
              onChange={(e) => setDepositTypeFilter(e.target.value)}
            >
              <option value="all">Semua Tipe</option>
              <option value="rawat_inap">Rawat Inap</option>
              <option value="rawat_jalan">Rawat Jalan</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLowBalanceOnly}
                onChange={(e) => setShowLowBalanceOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Saldo Rendah</span>
            </label>
          </div>
          <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
            <DialogTrigger asChild>
              <Button>
                <FaPlus className="mr-2" />
                Top-up Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Top-up Deposit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="patient_search">Cari Pasien</Label>
                  <div className="relative">
                    <Input
                      id="patient_search"
                      placeholder="Nama pasien atau No RM"
                      value={patientSearchQuery}
                      onChange={(e) => {
                        setPatientSearchQuery(e.target.value)
                        setShowPatientDropdown(true)
                      }}
                      onFocus={() => setShowPatientDropdown(true)}
                    />
                    {isPatientSearchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Patient Dropdown */}
                  {showPatientDropdown && patientSearchQuery.length > 2 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {patientSuggestions.length > 0 ? (
                        patientSuggestions.map((patient: Patient) => (
                          <div
                            key={patient.id}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setTopUpForm(prev => ({ ...prev, patient_id: patient.id }))
                              setPatientSearchQuery(`${patient.name} - ${patient.mrn}`)
                              setShowPatientDropdown(false)
                            }}
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">No. RM: {patient.mrn}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {patient.address || 'Alamat tidak tersedia'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
                          {isPatientSearchLoading ? 'Mencari pasien...' : 'Pasien tidak ditemukan'}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedPatient && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm">
                        <strong>Pasien Terpilih:</strong> {selectedPatient.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        No. RM: {selectedPatient.mrn}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedPatient(null)
                          setPatientSearchQuery('')
                          setTopUpForm(prev => ({ ...prev, patient_id: 0 }))
                        }}
                      >
                        Ubah Pasien
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="deposit_type">Tipe Deposit</Label>
                  <select
                    id="deposit_type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                    value={topUpForm.deposit_type}
                    onChange={(e) => setTopUpForm(prev => ({ ...prev, deposit_type: e.target.value as 'rawat_inap' | 'rawat_jalan' }))}
                  >
                    <option value="rawat_inap">Rawat Inap</option>
                    <option value="rawat_jalan">Rawat Jalan</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Jumlah (Rp)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={topUpForm.amount}
                    onChange={(e) => setTopUpForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_method">Metode Pembayaran</Label>
                  <select
                    id="payment_method"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                    value={topUpForm.payment_method}
                    onChange={(e) => setTopUpForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  >
                    <option value="tunai">Tunai</option>
                    <option value="transfer">Transfer</option>
                    <option value="kartu_kredit">Kartu Kredit</option>
                    <option value="kartu_debit">Kartu Debit</option>
                    <option value="e_wallet">E-Wallet</option>
                    <option value="bpjs">BPJS</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="reference_id">No. Referensi (Opsional)</Label>
                  <Input
                    id="reference_id"
                    value={topUpForm.reference_id}
                    onChange={(e) => setTopUpForm(prev => ({ ...prev, reference_id: e.target.value }))}
                    placeholder="Nomor transfer, dll"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    value={topUpForm.notes}
                    onChange={(e) => setTopUpForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Catatan tambahan..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTopUpModal(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleTopUp}
                    disabled={topUpMutation.isPending}
                  >
                    {topUpMutation.isPending ? 'Menyimpan...' : 'Top-up'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">No. RM</th>
                <th className="px-2">Nama Pasien</th>
                <th className="px-2">Tipe Deposit</th>
                <th className="px-2">Saldo</th>
                <th className="px-2">Status</th>
                <th className="px-2">Terakhir Update</th>
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
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FaWallet className="mx-auto text-4xl mb-2" />
                    <p>Tidak ada deposit yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                deposits.map((deposit: Deposit) => (
                  <tr
                    key={deposit.id}
                    className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                  >
                    <td className="py-3 px-2 font-medium">{deposit.patient.no_rm}</td>
                    <td className="px-2 font-medium">{deposit.patient.nama_pasien}</td>
                    <td className="px-2">
                      <Badge className={getDepositTypeColor(deposit.deposit_type)}>
                        {getDepositTypeText(deposit.deposit_type)}
                      </Badge>
                    </td>
                    <td className="px-2 font-medium text-green-600">{formatCurrency(deposit.balance)}</td>
                    <td className="px-2">
                      <Badge className={deposit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {deposit.status === 'active' ? 'Aktif' : deposit.status === 'refunded' ? 'Direfund' : 'Tidak Aktif'}
                      </Badge>
                    </td>
                    <td className="px-2 text-sm text-gray-500">
                      {new Date(deposit.updated_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="text-right px-2">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(deposit)}
                          title="Lihat Detail"
                        >
                          <FaEye />
                        </Button>
                        {deposit.status === 'active' && deposit.balance > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDeposit({ deposit, transactions: [] })
                              setShowRefundModal(true)
                            }}
                            title="Refund"
                          >
                            <FaMinus />
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
        {depositsData?.links && (
          <div className="mt-4 flex justify-center">
            <div className="flex gap-2">
              {depositsData.links.map((link: any, index: number) => (
                <Button
                  key={index}
                  variant={link.active ? "default" : "outline"}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => {
                    // Handle pagination
                  }}
                >
                  {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Deposit - {selectedDeposit?.deposit.patient.nama_pasien}</DialogTitle>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-6">
              {/* Deposit Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">Informasi Pasien</h4>
                  <p><strong>Nama:</strong> {selectedDeposit.deposit.patient.nama_pasien}</p>
                  <p><strong>No. RM:</strong> {selectedDeposit.deposit.patient.no_rm}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informasi Deposit</h4>
                  <p><strong>Tipe:</strong> {getDepositTypeText(selectedDeposit.deposit.deposit_type)}</p>
                  <p><strong>Saldo:</strong> <span className="text-green-600 font-medium">{formatCurrency(selectedDeposit.deposit.balance)}</span></p>
                  <p><strong>Status:</strong> <Badge className={selectedDeposit.deposit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedDeposit.deposit.status === 'active' ? 'Aktif' : selectedDeposit.deposit.status === 'refunded' ? 'Direfund' : 'Tidak Aktif'}
                  </Badge></p>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FaHistory />
                  Riwayat Transaksi
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="p-2 text-left">Tanggal</th>
                        <th className="p-2 text-left">Tipe</th>
                        <th className="p-2 text-right">Jumlah</th>
                        <th className="p-2 text-left">Metode</th>
                        <th className="p-2 text-left">Referensi</th>
                        <th className="p-2 text-left">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDeposit.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t">
                          <td className="p-2">
                            {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-2">
                            <span className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                              {getTransactionTypeText(transaction.type)}
                            </span>
                          </td>
                          <td className="p-2 text-right font-medium">
                            <span className={transaction.type === 'top_up' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'top_up' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="p-2">{transaction.payment_method || '-'}</td>
                          <td className="p-2">{transaction.reference_id || '-'}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <span>{transaction.notes || '-'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDeposit && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p><strong>Pasien:</strong> {selectedDeposit.deposit.patient.nama_pasien}</p>
                <p><strong>Saldo Tersedia:</strong> <span className="text-green-600 font-medium">{formatCurrency(selectedDeposit.deposit.balance)}</span></p>
              </div>
            )}
            <div>
              <Label htmlFor="refund_amount">Jumlah Refund (Rp)</Label>
              <Input
                id="refund_amount"
                type="number"
                value={refundForm.amount}
                onChange={(e) => setRefundForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                max={selectedDeposit?.deposit.balance || 0}
              />
            </div>
            <div>
              <Label htmlFor="refund_reason">Alasan Refund</Label>
              <Textarea
                id="refund_reason"
                value={refundForm.reason}
                onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Jelaskan alasan refund..."
              />
            </div>
            <div>
              <Label htmlFor="approved_by">Disetujui Oleh</Label>
              <Input
                id="approved_by"
                value={refundForm.approved_by}
                onChange={(e) => setRefundForm(prev => ({ ...prev, approved_by: e.target.value }))}
                placeholder="Nama yang menyetujui"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRefundModal(false)}>
                Batal
              </Button>
              <Button
                onClick={() => selectedDeposit && handleRefund(selectedDeposit.deposit.id)}
                disabled={refundMutation.isPending}
              >
                {refundMutation.isPending ? 'Memproses...' : 'Refund'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
