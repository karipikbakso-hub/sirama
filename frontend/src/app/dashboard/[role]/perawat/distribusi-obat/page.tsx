'use client'

import { useState, useEffect } from 'react'
import {
  MdMedication,
  MdSearch,
  MdCheckCircle,
  MdPending,
  MdLocalShipping,
  MdDone,
  MdRefresh,
  MdAssignment,
  MdWarning,
  MdInfo,
  MdPrint,
  MdEdit,
  MdCancel,
  MdVerified,
  MdInventory,
  MdSchedule,
  MdAdd
} from 'react-icons/md'
import { useAuth } from '@/hooks/useAuth'
import apiData from '@/lib/apiData'

interface MedicationDistribution {
  id: string
  resep_detail_id: string
  tanggal_keluar: string
  jumlah_keluar: number
  harga_satuan: number
  subtotal: number
  status: 'menunggu' | 'dikeluarkan' | 'selesai'
  catatan?: string
  resep: {
    id: string
    no_resep: string
    tanggal_resep: string
  }
  patient: {
    id: string
    nama: string
    no_rm: string
  }
  obat: {
    id: string
    nama_obat: string
    nama_generik?: string
  }
  aturan_pakai?: string
  user: {
    id: string
    name: string
  }
  created_at: string
  updated_at: string
}

interface MedicationItem {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  unit: string
  instructions: string
  status: 'pending' | 'prepared' | 'distributed' | 'cancelled'
  batchNumber?: string
  expiryDate?: string
  verifiedBy?: string
  distributedBy?: string
}

export default function DistribusiObatPage() {
  const [distributions, setDistributions] = useState<MedicationDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'menunggu' | 'dikeluarkan' | 'selesai'>('all')
  const [selectedDistribution, setSelectedDistribution] = useState<MedicationDistribution | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showDistributionModal, setShowDistributionModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)

  useEffect(() => {
    fetchDistributions()
  }, [])

  const fetchDistributions = async () => {
    try {
      setLoading(true)
      const response = await apiData.get('/distribusi-obat')
      if (response.data.success) {
        setDistributions(response.data.data)
      } else {
        console.error('Failed to fetch distributions:', response.data.message)
        setDistributions([])
      }
    } catch (error) {
      console.error('Error fetching distributions:', error)
      setDistributions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptions = async () => {
    try {
      const response = await apiData.get('/distribusi-obat/prescriptions')
      if (response.data.success) {
        setPrescriptions(response.data.data)
      } else {
        console.error('Failed to fetch prescriptions:', response.data.message)
        setPrescriptions([])
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      setPrescriptions([])
    }
  }

  const handleAddDistribution = async (resepDetailId: number, jumlahKeluar: number, hargaSatuan: number, catatan?: string) => {
    try {
      const response = await apiData.post('/distribusi-obat', {
        resep_detail_id: resepDetailId,
        jumlah_keluar: jumlahKeluar,
        harga_satuan: hargaSatuan,
        catatan: catatan
      })
      if (response.data.success) {
        // Refresh data
        fetchDistributions()
        setShowAddModal(false)
        setSelectedPrescription(null)
      } else {
        console.error('Failed to add distribution:', response.data.message)
      }
    } catch (error) {
      console.error('Error adding distribution:', error)
    }
  }

  const filteredDistributions = distributions.filter(distribution => {
    const matchesSearch = distribution.patient.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          distribution.patient.no_rm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          distribution.resep.no_resep.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          distribution.obat.nama_obat.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || distribution.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'distributed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu'
      case 'preparing': return 'Sedang Disiapkan'
      case 'ready': return 'Siap Distribusi'
      case 'distributed': return 'Sudah Didistribusikan'
      case 'cancelled': return 'Dibatalkan'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'stat':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent'
      case 'stat': return 'STAT'
      default: return 'Normal'
    }
  }

  const getMedicationStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'dikeluarkan':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'selesai':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const handleVerifyMedication = (distribution: MedicationDistribution, medicationId: string) => {
    // TODO: Implement medication verification logic
    console.log('Verifying medication:', medicationId, 'for distribution:', distribution.id)
  }

  const handleDistributeMedication = async (distribution: MedicationDistribution) => {
    try {
      const response = await apiData.put(`/distribusi-obat/${distribution.id}`, {
        status: 'selesai'
      })
      if (response.data.success) {
        // Refresh data
        fetchDistributions()
      } else {
        console.error('Failed to update distribution status:', response.data.message)
      }
    } catch (error) {
      console.error('Error updating distribution status:', error)
    }
  }

  const handlePrintLabel = (distribution: MedicationDistribution) => {
    // TODO: Implement label printing logic
    console.log('Printing label for:', distribution.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Distribusi Obat
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pengelolaan distribusi obat kepada pasien sesuai prosedur rumah sakit
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Tambah Distribusi Obat */}
          <button
            onClick={() => {
              fetchPrescriptions()
              setShowAddModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdAdd className="text-lg" />
            Tambah Distribusi
          </button>

          {/* Cek Stok & Ketersediaan Obat */}
          <button
            onClick={() => {
              // Function to check medication stock status before distribution
              alert('Fitur cek stok obat akan diimplementasikan untuk memastikan ketersediaan sebelum distribusi')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdInventory className="text-lg" />
            Cek Stok Obat
          </button>

          {/* Distribusi Masal untuk beberapa pasien */}
          <button
            onClick={() => {
              // Function for bulk medication distribution for multiple patients
              alert('Fitur distribusi masal akan diimplementasikan untuk efisiensi beberapa pasien sekaligus')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdDone className="text-lg" />
            Distribusi Masal
          </button>

          {/* Laporan Distribusi Harian */}
          <button
            onClick={() => {
              // Function to generate daily medication distribution reports
              alert('Fitur laporan distribusi harian akan diimplementasikan untuk tracking dan audit')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdAssignment className="text-lg" />
            Laporan Harian
          </button>

          {/* Peringatan Stok Rendah/Expired */}
          <div className="relative">
            <button
              onClick={() => {
                // Function to show alerts for low stock and expiring medications
                alert('Peringatan: Obat Insulin akan habis dalam 3 hari. Obat Paracetamol expired Jan 2026')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors relative"
            >
              <MdWarning className="text-lg" />
              <span className="hidden sm:inline">Peringatan Stok</span>
              {/* Notification Badge */}
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                2
              </div>
            </button>
          </div>

          <button
            onClick={fetchDistributions}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Cari pasien atau resep..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter status distribusi obat"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="dikeluarkan">Dikeluarkan</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Distribution List */}
      <div className="space-y-4">
        {filteredDistributions.map((distribution) => (
          <div key={distribution.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <MdMedication className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                       {distribution.patient.nama}
                     </h3>
                     <span className="text-sm text-gray-600 dark:text-gray-400">
                       {distribution.patient.no_rm}
                     </span>
                     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(distribution.status)}`}>
                       {getStatusText(distribution.status)}
                     </span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                     <div>
                       <span className="font-medium">Resep:</span> {distribution.resep.no_resep}
                     </div>
                     <div>
                       <span className="font-medium">Obat:</span> {distribution.obat.nama_obat}
                     </div>
                     <div>
                       <span className="font-medium">Jumlah:</span> {distribution.jumlah_keluar}
                     </div>
                   </div>

                   <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                     <span className="font-medium">Tanggal Keluar:</span> {distribution.tanggal_keluar}
                   </div>

                   {distribution.catatan && (
                     <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                       <p className="text-sm text-blue-800 dark:text-blue-200">
                         <strong>Catatan:</strong> {distribution.catatan}
                       </p>
                     </div>
                   )}
                 </div>
              </div>

              {/* Medication Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">{distribution.obat.nama_obat}</h5>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMedicationStatusColor(distribution.status)}`}>
                      {distribution.status === 'menunggu' ? 'Menunggu' :
                       distribution.status === 'dikeluarkan' ? 'Dikeluarkan' :
                       distribution.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {distribution.jumlah_keluar} unit
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Harga Satuan:</span>
                    <span className="ml-2 font-medium">Rp {distribution.harga_satuan?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                    <span className="ml-2 font-medium">Rp {distribution.subtotal?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Aturan Pakai:</span>
                    <span className="ml-2 font-medium">{distribution.aturan_pakai || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Nama Generik:</span>
                    <span className="ml-2 font-medium">{distribution.obat.nama_generik || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    <span>Dicatat oleh: {distribution.user.name}</span>
                  </div>

                  <div className="flex gap-2">
                    {distribution.status === 'dikeluarkan' && (
                      <button
                        onClick={() => handleDistributeMedication(distribution)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                      >
                        <MdDone className="text-sm" />
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Oleh:</span> {distribution.user.name}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrintLabel(distribution)}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MdPrint className="text-lg" />
                    Print Label
                  </button>
                  <button
                    onClick={() => setSelectedDistribution(distribution)}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MdAssignment className="text-lg" />
                    Detail
                  </button>
                  {distribution.status === 'dikeluarkan' && (
                    <button
                      onClick={() => handleDistributeMedication(distribution)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <MdDone className="text-lg" />
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredDistributions.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <MdMedication className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tidak ada distribusi obat
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Belum ada resep obat yang perlu didistribusikan
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdPending className="text-gray-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {distributions.filter(d => d.status === 'menunggu').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdSchedule className="text-yellow-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dikeluarkan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {distributions.filter(d => d.status === 'dikeluarkan').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdCheckCircle className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {distributions.filter(d => d.status === 'selesai').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdDone className="text-green-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Distribusi</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {distributions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Distribution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tambah Distribusi Obat
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <MdCancel className="text-2xl" />
                </button>
              </div>

              {!selectedPrescription ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Pilih resep yang akan didistribusikan:
                  </p>
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedPrescription(prescription)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {prescription.patient.nama} - {prescription.patient.no_rm}
                          </h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Resep: {prescription.resep.no_resep}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Obat:</span> {prescription.obat.nama_obat}
                          </div>
                          <div>
                            <span className="font-medium">Jumlah yang dibutuhkan:</span> {prescription.total_quantity}
                          </div>
                          <div>
                            <span className="font-medium">Sudah didistribusikan:</span> {prescription.distributed_quantity}
                          </div>
                          <div>
                            <span className="font-medium">Sisa:</span> {prescription.remaining_quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                    {prescriptions.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Tidak ada resep yang siap didistribusikan
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <DistributionForm
                  prescription={selectedPrescription}
                  onSubmit={handleAddDistribution}
                  onCancel={() => setSelectedPrescription(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDistribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detail Distribusi Obat
                </h2>
                <button
                  onClick={() => setSelectedDistribution(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <MdCancel className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pasien
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDistribution.patient.nama}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDistribution.patient.no_rm}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Resep
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDistribution.resep.no_resep}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDistribution.resep.tanggal_resep}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Obat
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDistribution.obat.nama_obat}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDistribution.obat.nama_generik}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDistribution.status)}`}>
                      {getStatusText(selectedDistribution.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jumlah Keluar
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDistribution.jumlah_keluar}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Harga Satuan
                    </label>
                    <p className="text-gray-900 dark:text-white">Rp {selectedDistribution.harga_satuan?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subtotal
                    </label>
                    <p className="text-gray-900 dark:text-white">Rp {selectedDistribution.subtotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tanggal Keluar
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedDistribution.tanggal_keluar}</p>
                  </div>
                </div>

                {selectedDistribution.catatan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catatan
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedDistribution.catatan}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Dicatat oleh:</span> {selectedDistribution.user.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDistribution.created_at}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Distribution Form Component
function DistributionForm({ prescription, onSubmit, onCancel }: {
  prescription: any
  onSubmit: (resepDetailId: number, jumlahKeluar: number, hargaSatuan: number, catatan?: string) => void
  onCancel: () => void
}) {
  const [jumlahKeluar, setJumlahKeluar] = useState(prescription.remaining_quantity)
  const [hargaSatuan, setHargaSatuan] = useState(prescription.harga_satuan || 0)
  const [catatan, setCatatan] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (jumlahKeluar > 0 && jumlahKeluar <= prescription.remaining_quantity && hargaSatuan > 0) {
      onSubmit(prescription.id, jumlahKeluar, hargaSatuan, catatan)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Detail Resep</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Pasien:</span> {prescription.patient.nama} ({prescription.patient.no_rm})
          </div>
          <div>
            <span className="font-medium">Resep:</span> {prescription.resep.no_resep}
          </div>
          <div>
            <span className="font-medium">Obat:</span> {prescription.obat.nama_obat}
          </div>
          <div>
            <span className="font-medium">Sisa yang perlu didistribusikan:</span> {prescription.remaining_quantity}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jumlah Keluar *
          </label>
          <input
            type="number"
            value={jumlahKeluar}
            onChange={(e) => setJumlahKeluar(Number(e.target.value))}
            min="1"
            max={prescription.remaining_quantity}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Maksimal: {prescription.remaining_quantity}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Harga Satuan (Rp) *
          </label>
          <input
            type="number"
            value={hargaSatuan}
            onChange={(e) => setHargaSatuan(Number(e.target.value))}
            min="0"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Catatan
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Catatan tambahan (opsional)"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Ringkasan</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p>Total: Rp {(jumlahKeluar * hargaSatuan).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Kembali
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Distribusikan Obat
        </button>
      </div>
    </form>
  )
}
