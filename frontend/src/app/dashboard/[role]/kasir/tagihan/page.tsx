'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiDownload, FiEye, FiMail, FiMessageSquare, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/api'
import { toast } from '@/lib/toast'

interface Billing {
  id: number
  no_invoice: string
  patient_name: string
  medical_record_number: string
  total_tagihan: number
  total_bayar: number
  diskon: number
  status: 'draft' | 'pending' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled'
  tanggal_billing: string
  insurance_type?: string
  days_overdue?: number
  aging_category?: string
}

interface BillingDetail {
  billing: Billing
  items: any[]
  payments: any[]
}

const statusConfig = {
  draft: { label: 'Draft', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  pending: { label: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  partial_paid: { label: 'Bayar Sebagian', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  paid: { label: 'Lunas', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  overdue: { label: 'Overdue', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  cancelled: { label: 'Dibatalkan', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
}

const agingCategories = [
  { label: '0-30 Hari', value: '0-30', color: 'green' },
  { label: '31-60 Hari', value: '31-60', color: 'yellow' },
  { label: '>60 Hari', value: '60+', color: 'red' }
]

export default function TagihanPage() {
  const [billings, setBillings] = useState<Billing[]>([])
  const [filteredBillings, setFilteredBillings] = useState<Billing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [agingFilter, setAgingFilter] = useState<string>('all')
  const [insuranceFilter, setInsuranceFilter] = useState<string>('all')
  const [selectedBilling, setSelectedBilling] = useState<BillingDetail | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'items' | 'payments'>('items')
  const [agingStats, setAgingStats] = useState<Record<string, { count: number; amount: number }>>({
    '0-30': { count: 0, amount: 0 },
    '31-60': { count: 0, amount: 0 },
    '60+': { count: 0, amount: 0 }
  })

  const [apiLoading, setApiLoading] = useState(false)

  useEffect(() => {
    fetchBillings()
  }, [])

  useEffect(() => {
    filterBillings()
  }, [billings, searchTerm, statusFilter, agingFilter, insuranceFilter])

  const fetchBillings = async () => {
    try {
      setApiLoading(true)
      const response = await api.get('/billings')
      if (response.data.success) {
        const processedBillings = response.data.data.data.map(processBillingStatus)
        setBillings(processedBillings)
        calculateAgingStats(processedBillings)
      }
    } catch (error) {
      toast.error('Gagal memuat data tagihan')
    } finally {
      setLoading(false)
      setApiLoading(false)
    }
  }

  const processBillingStatus = (billing: any): Billing => {
    const totalPaid = billing.total_bayar || 0
    const totalAmount = billing.total_tagihan || 0
    const paymentRatio = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

    // Determine status based on payment
    let status: Billing['status'] = 'pending'
    if (totalPaid === 0) {
      status = 'pending'
    } else if (totalPaid >= totalAmount) {
      status = 'paid'
    } else if (paymentRatio > 0) {
      status = 'partial_paid'
    }

    // Check for overdue
    const dueDate = new Date(billing.tanggal_billing)
    dueDate.setDate(dueDate.getDate() + 3) // Default 3 days due date
    const today = new Date()
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysOverdue > 0 && status !== 'paid') {
      status = 'overdue'
    }

    // Calculate aging category
    let agingCategory = ''
    if (daysOverdue <= 30) agingCategory = '0-30'
    else if (daysOverdue <= 60) agingCategory = '31-60'
    else agingCategory = '60+'

    return {
      ...billing,
      status,
      days_overdue: Math.max(0, daysOverdue),
      aging_category: agingCategory
    }
  }

  const calculateAgingStats = (billings: Billing[]) => {
    const stats: Record<string, { count: number; amount: number }> = {
      '0-30': { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '60+': { count: 0, amount: 0 }
    }

    billings.forEach(billing => {
      if (billing.status !== 'paid' && billing.aging_category) {
        stats[billing.aging_category].count++
        stats[billing.aging_category].amount += (billing.total_tagihan - billing.total_bayar)
      }
    })

    setAgingStats(stats)
  }

  const filterBillings = () => {
    let filtered = billings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(billing =>
        billing.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        billing.medical_record_number?.includes(searchTerm) ||
        billing.no_invoice?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(billing => billing.status === statusFilter)
    }

    // Aging filter
    if (agingFilter !== 'all') {
      filtered = filtered.filter(billing => billing.aging_category === agingFilter)
    }

    // Insurance filter
    if (insuranceFilter !== 'all') {
      filtered = filtered.filter(billing => billing.insurance_type === insuranceFilter)
    }

    setFilteredBillings(filtered)
  }

  const handleViewDetail = async (billingId: number) => {
    try {
      setApiLoading(true)
      const response = await api.get(`/billings/${billingId}`)
      if (response.data.success) {
        setSelectedBilling(response.data.data)
        setShowDetailModal(true)
      }
    } catch (error) {
      toast.error('Gagal memuat detail tagihan')
    } finally {
      setApiLoading(false)
    }
  }

  const handleSendReminder = async (billing: Billing) => {
    // TODO: Implement payment reminder functionality
    toast.info('Fitur pengingat pembayaran akan segera hadir')
  }

  const handleExportExcel = async () => {
    try {
      // TODO: Implement Excel export
      toast.info('Fitur export Excel akan segera hadir')
    } catch (error) {
      toast.error('Gagal export data')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📄 Manajemen Tagihan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor dan kelola tagihan pasien rumah sakit
          </p>
        </div>
        <Button onClick={handleExportExcel} className="flex items-center gap-2">
          <FiDownload className="text-lg" />
          Export Excel
        </Button>
      </div>

      {/* Aging Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agingCategories.map((category) => (
          <Card key={category.value}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {category.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {agingStats[category.value]?.count || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(agingStats[category.value]?.amount || 0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari nama pasien, No RM, No Invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <SearchableSelect
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'partial_paid', label: 'Bayar Sebagian' },
                { value: 'paid', label: 'Lunas' },
                { value: 'overdue', label: 'Overdue' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
            />

            {/* Aging Filter */}
            <SearchableSelect
              options={[
                { value: 'all', label: 'Semua Aging' },
                ...agingCategories.map(cat => ({ value: cat.value, label: cat.label }))
              ]}
              value={agingFilter}
              onChange={setAgingFilter}
              placeholder="Aging"
            />

            {/* Insurance Filter */}
            <SearchableSelect
              options={[
                { value: 'all', label: 'Semua Asuransi' },
                { value: 'BPJS', label: 'BPJS' },
                { value: 'Asuransi Swasta', label: 'Asuransi Swasta' },
                { value: 'Umum', label: 'Umum' }
              ]}
              value={insuranceFilter}
              onChange={setInsuranceFilter}
              placeholder="Asuransi"
            />

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setAgingFilter('all')
                setInsuranceFilter('all')
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing List */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Tagihan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aging
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBillings.map((billing) => {
                  const statusInfo = statusConfig[billing.status]
                  const paymentProgress = billing.total_tagihan > 0
                    ? (billing.total_bayar / billing.total_tagihan) * 100
                    : 0

                  return (
                    <tr key={billing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {billing.no_invoice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {billing.patient_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          RM: {billing.medical_record_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(billing.total_tagihan)}
                        </div>
                        {billing.status === 'partial_paid' && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Dibayar: {formatCurrency(billing.total_bayar)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}>
                            {statusInfo.label}
                          </Badge>
                          {billing.status === 'partial_paid' && (
                            <div className="w-20">
                              <Progress value={paymentProgress} className="h-2" />
                              <div className="text-xs text-gray-500 mt-1">
                                {Math.round(paymentProgress)}%
                              </div>
                            </div>
                          )}
                          {billing.status === 'overdue' && billing.days_overdue && (
                            <div className="text-xs text-red-600 font-medium">
                              {billing.days_overdue} hari terlambat
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {billing.aging_category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(billing.tanggal_billing)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(billing.id)}
                          >
                            <FiEye className="text-lg" />
                          </Button>
                          {billing.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(billing)}
                            >
                              <FiMail className="text-lg" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredBillings.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada data tagihan yang ditemukan
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedBilling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detail Tagihan
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Billing Header */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedBilling.billing.patient_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No RM: {selectedBilling.billing.medical_record_number}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No Invoice: {selectedBilling.billing.no_invoice}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedBilling.billing.status].bgColor} ${statusConfig[selectedBilling.billing.status].textColor}`}>
                      {statusConfig[selectedBilling.billing.status].label}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Tanggal: {formatDate(selectedBilling.billing.tanggal_billing)}
                    </p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                  <nav className="flex space-x-8">
                    <button
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'items'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('items')}
                    >
                      Item Tagihan
                    </button>
                    <button
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'payments'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('payments')}
                    >
                      Riwayat Pembayaran
                    </button>
                  </nav>
                </div>

                {activeTab === 'items' && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Item
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Qty
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Harga
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedBilling.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {item.description}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {formatCurrency(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                              Total Tagihan:
                            </td>
                            <td className="px-4 py-2 text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(selectedBilling.billing.total_tagihan)}
                            </td>
                          </tr>
                          {selectedBilling.billing.diskon > 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                                Diskon:
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-red-600">
                                -{formatCurrency(selectedBilling.billing.diskon)}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                              Total Bayar:
                            </td>
                            <td className="px-4 py-2 text-sm font-bold text-green-600">
                              {formatCurrency(selectedBilling.billing.total_bayar)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    {selectedBilling.payments && selectedBilling.payments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedBilling.payments.map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FiDollarSign className="text-green-500 text-xl" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(payment.amount)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(payment.created_at)}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              Lunas
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Belum ada riwayat pembayaran
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}