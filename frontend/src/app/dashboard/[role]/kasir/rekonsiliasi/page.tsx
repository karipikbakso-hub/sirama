'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX, FiClock, FiDollarSign, FiAlertTriangle } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { toast } from '@/lib/toast'

interface CashReconciliation {
  id: number
  kasir_id: number
  shift: 'pagi' | 'siang' | 'malam'
  date: string
  expected_cash: number
  actual_cash: number
  discrepancy: number
  discrepancy_reason?: string
  status: 'open' | 'pending_approval' | 'approved' | 'discrepancy'
  approved_by?: number
  approved_at?: string
  created_at: string
  updated_at: string
  kasir?: {
    id: number
    name: string
  }
  approver?: {
    id: number
    name: string
  }
}

const statusConfig = {
  open: { label: 'Terbuka', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  pending_approval: { label: 'Menunggu Persetujuan', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  approved: { label: 'Disetujui', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  discrepancy: { label: 'Ada Selisih', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' }
}

const shiftConfig = {
  pagi: { label: 'Pagi (06:00-14:00)', color: 'blue' },
  siang: { label: 'Siang (14:00-22:00)', color: 'orange' },
  malam: { label: 'Malam (22:00-06:00)', color: 'purple' }
}

export default function RekonsiliasiPage() {
  const [reconciliations, setReconciliations] = useState<CashReconciliation[]>([])
  const [currentReconciliation, setCurrentReconciliation] = useState<CashReconciliation | null>(null)
  const [filteredReconciliations, setFilteredReconciliations] = useState<CashReconciliation[]>([])
  const [loading, setLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [shiftFilter, setShiftFilter] = useState<string>('all')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedReconciliation, setSelectedReconciliation] = useState<CashReconciliation | null>(null)
  const [actualCash, setActualCash] = useState('')
  const [discrepancyReason, setDiscrepancyReason] = useState('')

  useEffect(() => {
    fetchReconciliations()
    fetchCurrentShift()
  }, [])

  useEffect(() => {
    filterReconciliations()
  }, [reconciliations, searchTerm, statusFilter, shiftFilter])

  const fetchReconciliations = async () => {
    try {
      setApiLoading(true)
      const response = await api.get('/reconciliations')
      if (response.data.success) {
        setReconciliations(response.data.data.data)
      }
    } catch (error) {
      toast.error('Gagal memuat data rekonsiliasi')
    } finally {
      setLoading(false)
      setApiLoading(false)
    }
  }

  const fetchCurrentShift = async () => {
    try {
      const response = await api.get('/reconciliations/current-shift')
      if (response.data.success) {
        setCurrentReconciliation(response.data.data)
      }
    } catch (error) {
      // Current shift might not exist yet, which is fine
    }
  }

  const filterReconciliations = () => {
    let filtered = reconciliations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rec =>
        rec.kasir?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.id.toString().includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rec => rec.status === statusFilter)
    }

    // Shift filter
    if (shiftFilter !== 'all') {
      filtered = filtered.filter(rec => rec.shift === shiftFilter)
    }

    setFilteredReconciliations(filtered)
  }

  const handleSubmitReconciliation = async () => {
    if (!selectedReconciliation || !actualCash) return

    try {
      setApiLoading(true)
      const response = await api.post(`/reconciliations/${selectedReconciliation.id}/submit`, {
        actual_cash: parseFloat(actualCash),
        discrepancy_reason: discrepancyReason || null
      })

      if (response.data.success) {
        toast.success('Rekonsiliasi berhasil disubmit')
        setShowSubmitModal(false)
        setSelectedReconciliation(null)
        setActualCash('')
        setDiscrepancyReason('')
        fetchReconciliations()
        fetchCurrentShift()
      }
    } catch (error) {
      toast.error('Gagal submit rekonsiliasi')
    } finally {
      setApiLoading(false)
    }
  }

  const handleApproveReconciliation = async () => {
    if (!selectedReconciliation) return

    try {
      setApiLoading(true)
      const response = await api.post(`/reconciliations/${selectedReconciliation.id}/approve`)

      if (response.data.success) {
        toast.success('Rekonsiliasi berhasil disetujui')
        setShowApproveModal(false)
        setSelectedReconciliation(null)
        fetchReconciliations()
        fetchCurrentShift()
      }
    } catch (error) {
      toast.error('Gagal menyetujui rekonsiliasi')
    } finally {
      setApiLoading(false)
    }
  }

  const handleCloseShift = async (reconciliation: CashReconciliation) => {
    try {
      setApiLoading(true)
      const response = await api.post(`/reconciliations/${reconciliation.id}/close-shift`)

      if (response.data.success) {
        toast.success('Shift berhasil ditutup')
        fetchReconciliations()
        fetchCurrentShift()
      }
    } catch (error) {
      toast.error('Gagal menutup shift')
    } finally {
      setApiLoading(false)
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

  const getDiscrepancyColor = (discrepancy: number) => {
    if (discrepancy === 0) return 'text-green-600'
    if (Math.abs(discrepancy) <= 10000) return 'text-yellow-600'
    return 'text-red-600'
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💰 Rekonsiliasi Kas Harian</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Match kas fisik vs sistem, laporan selisih, tutup shift
          </p>
        </div>
        <Button onClick={fetchReconciliations} disabled={apiLoading}>
          <FiDownload className="text-lg mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Shift Card */}
      {currentReconciliation && (
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <FiClock className="text-xl" />
              Shift Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shift</p>
                <p className="font-semibold">{shiftConfig[currentReconciliation.shift].label}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal</p>
                <p className="font-semibold">{formatDate(currentReconciliation.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expected Cash</p>
                <p className="font-semibold text-green-600">{formatCurrency(currentReconciliation.expected_cash)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <Badge className={`${statusConfig[currentReconciliation.status].bgColor} ${statusConfig[currentReconciliation.status].textColor}`}>
                  {statusConfig[currentReconciliation.status].label}
                </Badge>
              </div>
            </div>

            {currentReconciliation.status === 'open' && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedReconciliation(currentReconciliation)
                    setShowSubmitModal(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FiCheck className="text-lg mr-2" />
                  Submit Rekonsiliasi
                </Button>
              </div>
            )}

            {currentReconciliation.status === 'pending_approval' && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedReconciliation(currentReconciliation)
                    setShowApproveModal(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FiCheck className="text-lg mr-2" />
                  Approve
                </Button>
              </div>
            )}

            {currentReconciliation.status === 'approved' && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => handleCloseShift(currentReconciliation)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={apiLoading}
                >
                  <FiX className="text-lg mr-2" />
                  Tutup Shift
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari nama kasir atau ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="open">Terbuka</option>
              <option value="pending_approval">Menunggu Persetujuan</option>
              <option value="approved">Disetujui</option>
              <option value="discrepancy">Ada Selisih</option>
            </select>

            {/* Shift Filter */}
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Shift</option>
              <option value="pagi">Pagi</option>
              <option value="siang">Siang</option>
              <option value="malam">Malam</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setShiftFilter('all')
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliations List */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Selisih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReconciliations.map((rec) => {
                  const statusInfo = statusConfig[rec.status]
                  const discrepancyColor = getDiscrepancyColor(rec.discrepancy)

                  return (
                    <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{rec.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {rec.kasir?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {shiftConfig[rec.shift].label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(rec.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(rec.expected_cash)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.actual_cash > 0 ? formatCurrency(rec.actual_cash) : '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${discrepancyColor}`}>
                        {rec.discrepancy !== 0 ? formatCurrency(rec.discrepancy) : '-'}
                        {Math.abs(rec.discrepancy) > 10000 && (
                          <FiAlertTriangle className="inline ml-1 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReconciliation(rec)}
                          >
                            <FiEye className="text-lg" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredReconciliations.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada data rekonsiliasi yang ditemukan
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Modal */}
      {showSubmitModal && selectedReconciliation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Submit Rekonsiliasi
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="actualCash">Jumlah Kas Fisik (Rp)</Label>
                  <Input
                    id="actualCash"
                    type="number"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="discrepancyReason">Alasan Selisih (jika ada)</Label>
                  <Textarea
                    id="discrepancyReason"
                    value={discrepancyReason}
                    onChange={(e) => setDiscrepancyReason(e.target.value)}
                    placeholder="Jelaskan alasan jika ada selisih..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowSubmitModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitReconciliation}
                  disabled={apiLoading || !actualCash}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {apiLoading ? 'Menyimpan...' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedReconciliation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Approve Rekonsiliasi
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Expected:</span>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(selectedReconciliation.expected_cash)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Actual:</span>
                      <div className="font-semibold">
                        {formatCurrency(selectedReconciliation.actual_cash)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">Selisih:</span>
                      <div className={`font-semibold ${getDiscrepancyColor(selectedReconciliation.discrepancy)}`}>
                        {formatCurrency(selectedReconciliation.discrepancy)}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReconciliation.discrepancy_reason && (
                  <div>
                    <Label>Alasan Selisih</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedReconciliation.discrepancy_reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowApproveModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleApproveReconciliation}
                  disabled={apiLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {apiLoading ? 'Menyetujui...' : 'Approve'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReconciliation && !showSubmitModal && !showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detail Rekonsiliasi #{selectedReconciliation.id}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReconciliation(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kasir</Label>
                    <p className="text-sm font-medium">{selectedReconciliation.kasir?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Shift</Label>
                    <p className="text-sm font-medium">{shiftConfig[selectedReconciliation.shift].label}</p>
                  </div>
                  <div>
                    <Label>Tanggal</Label>
                    <p className="text-sm font-medium">{formatDate(selectedReconciliation.date)}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={`${statusConfig[selectedReconciliation.status].bgColor} ${statusConfig[selectedReconciliation.status].textColor}`}>
                      {statusConfig[selectedReconciliation.status].label}
                    </Badge>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <Label className="text-green-600">Expected Cash</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedReconciliation.expected_cash)}
                    </p>
                  </div>
                  <div className="text-center">
                    <Label>Actual Cash</Label>
                    <p className="text-2xl font-bold">
                      {selectedReconciliation.actual_cash > 0 ? formatCurrency(selectedReconciliation.actual_cash) : '-'}
                    </p>
                  </div>
                  <div className="text-center">
                    <Label className={getDiscrepancyColor(selectedReconciliation.discrepancy)}>Selisih</Label>
                    <p className={`text-2xl font-bold ${getDiscrepancyColor(selectedReconciliation.discrepancy)}`}>
                      {selectedReconciliation.discrepancy !== 0 ? formatCurrency(selectedReconciliation.discrepancy) : '-'}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                {selectedReconciliation.discrepancy_reason && (
                  <div>
                    <Label>Alasan Selisih</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      {selectedReconciliation.discrepancy_reason}
                    </p>
                  </div>
                )}

                {selectedReconciliation.approver && (
                  <div>
                    <Label>Disetujui Oleh</Label>
                    <p className="text-sm font-medium">{selectedReconciliation.approver.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedReconciliation.approved_at ? formatDate(selectedReconciliation.approved_at) : ''}
                    </p>
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
