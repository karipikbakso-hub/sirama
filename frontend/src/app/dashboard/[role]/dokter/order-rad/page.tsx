'use client'

import { useState, useEffect } from 'react'
import {
  MdMedicalServices,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdPrint,
  MdPerson,
  MdAccessTime,
  MdSchedule,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdWarning,
  MdLocalHospital
} from 'react-icons/md'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useAuth } from '@/hooks/useAuth'

interface RadiologyOrder {
  id: number
  registrasi_id: number
  radio_id: number
  dokter_id: number
  tanggal_permintaan: string
  tanggal_hasil?: string
  hasil?: string
  kesan?: string
  status: 'diminta' | 'proses' | 'selesai' | 'batal'
  diagnosa_klinis: string
  urgensi: 'rutin' | 'urgent' | 'stat'
  tarif: number
  catatan?: string
  created_at: string
  updated_at: string
  registrasi?: {
    id: number
    pasien: {
      id: number
      name: string
      mrn: string
    }
  }
  master_radiologi?: {
    id: number
    nama_pemeriksaan: string
    kode_radio: string
    kategori: string
  }
  dokter?: {
    id: number
    name: string
  }
}

interface MasterRadiology {
  id: number
  kode_radio: string
  nama_pemeriksaan: string
  kategori: string
  tarif: number
}

interface RegistrationOption {
  registration_id: number
  patient_id: number
  name: string
  mrn: string
  nama_poli: string
  tanggal_registrasi: string
}

interface RadiologyExam {
  id: number
  nama_pemeriksaan: string
  kode_radio: string
  kategori: string
  tarif: number
}

export default function OrderRadiologyPage() {
  const { user } = useAuth()
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<RadiologyOrder | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState<RadiologyOrder | null>(null)

  // New state for real data
  const [registrations, setRegistrations] = useState<RegistrationOption[]>([])
  const [radiologyExams, setRadiologyExams] = useState<RadiologyExam[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)
  const [loadingExams, setLoadingExams] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedRadiologyExam, setSelectedRadiologyExam] = useState('')

  useEffect(() => {
    fetchRadiologyOrders()
  }, [])

  // Load data when create form is opened
  useEffect(() => {
    if (showCreateForm) {
      loadRegistrations()
      loadRadiologyExams()
      // Reset selections when opening create form
      setSelectedPatient('')
      setSelectedRadiologyExam('')
    }
  }, [showCreateForm])

  const loadRegistrations = async () => {
    setLoadingRegistrations(true)
    try {
      const response = await fetch('/api/patients-for-radiology')
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.data || [])
      } else {
        console.error('Failed to load registrations')
        setRegistrations([])
      }
    } catch (error) {
      console.error('Error loading registrations:', error)
      setRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }

  const loadRadiologyExams = async () => {
    setLoadingExams(true)
    try {
      const response = await fetch('/api/master-radiologis')
      if (response.ok) {
        const data = await response.json()
        setRadiologyExams(data.data || [])
      } else {
        console.error('Failed to load radiology exams')
        setRadiologyExams([])
      }
    } catch (error) {
      console.error('Error loading radiology exams:', error)
      setRadiologyExams([])
    } finally {
      setLoadingExams(false)
    }
  }

  const fetchRadiologyOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/radiologis')
      if (response.ok) {
        const data = await response.json()
        setRadiologyOrders(data.data || [])
      } else {
        console.error('Failed to fetch radiology orders')
        setRadiologyOrders([])
      }
    } catch (error) {
      console.error('Error fetching radiology orders:', error)
      setRadiologyOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = radiologyOrders.filter(order =>
    (order.registrasi?.pasien?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.registrasi?.pasien?.mrn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.master_radiologi?.nama_pemeriksaan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.diagnosa_klinis || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'rutin':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'stat':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'rutin':
        return <MdSchedule className="text-blue-500 text-lg" />
      case 'urgent':
        return <MdWarning className="text-yellow-500 text-lg" />
      case 'stat':
        return <MdCancel className="text-red-500 text-lg" />
      default:
        return <MdSchedule className="text-gray-500 text-lg" />
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'rutin': return 'Rutin'
      case 'urgent': return 'Urgent'
      case 'stat': return 'STAT'
      default: return priority
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'diminta':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
      case 'proses':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'selesai':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'batal':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diminta':
        return <MdSchedule className="text-gray-500 text-lg" />
      case 'proses':
        return <MdRefresh className="text-blue-500 text-lg" />
      case 'selesai':
        return <MdCheckCircle className="text-green-500 text-lg" />
      case 'batal':
        return <MdCancel className="text-red-500 text-lg" />
      default:
        return <MdSchedule className="text-gray-500 text-lg" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'diminta': return 'Diminta'
      case 'proses': return 'Diproses'
      case 'selesai': return 'Selesai'
      case 'batal': return 'Dibatalkan'
      default: return status
    }
  }

  const getExaminationTypeIcon = (type: string) => {
    switch (type) {
      case 'xray':
        return <MdMedicalServices className="text-blue-500 text-lg" />
      case 'ct':
        return <MdMedicalServices className="text-purple-500 text-lg" />
      case 'mri':
        return <MdMedicalServices className="text-green-500 text-lg" />
      case 'ultrasound':
        return <MdMedicalServices className="text-orange-500 text-lg" />
      case 'mammography':
        return <MdMedicalServices className="text-pink-500 text-lg" />
      default:
        return <MdMedicalServices className="text-gray-500 text-lg" />
    }
  }

  const getExaminationTypeText = (type: string) => {
    switch (type) {
      case 'xray': return 'X-Ray'
      case 'ct': return 'CT Scan'
      case 'mri': return 'MRI'
      case 'ultrasound': return 'USG'
      case 'mammography': return 'Mammografi'
      default: return type
    }
  }

  const handlePrint = (order: RadiologyOrder) => {
    // Open print dialog for the order details
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Radiologi - ${order.registrasi?.pasien?.name || 'N/A'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info { margin-bottom: 20px; }
              .info div { margin-bottom: 5px; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Order Radiologi</h1>
              <h2>${order.registrasi?.pasien?.name || 'N/A'} - ${order.registrasi?.pasien?.mrn || 'N/A'}</h2>
            </div>
            <div class="info">
              <div><span class="label">Dokter:</span> ${order.dokter?.name || 'N/A'}</div>
              <div><span class="label">Tanggal Order:</span> ${new Date(order.tanggal_permintaan).toLocaleDateString('id-ID')}</div>
              <div><span class="label">Pemeriksaan:</span> ${order.master_radiologi?.nama_pemeriksaan || 'N/A'}</div>
              <div><span class="label">Prioritas:</span> ${getPriorityText(order.urgensi)}</div>
              <div><span class="label">Status:</span> ${getStatusText(order.status)}</div>
              <div><span class="label">Tarif:</span> Rp ${order.tarif.toLocaleString('id-ID')}</div>
            </div>
            <div class="info">
              <div><span class="label">Diagnosa Klinis:</span></div>
              <div style="margin-left: 160px; margin-top: 5px;">${order.diagnosa_klinis}</div>
            </div>
            ${order.catatan ? `
            <div class="info">
              <div><span class="label">Catatan:</span></div>
              <div style="margin-left: 160px; margin-top: 5px;">${order.catatan}</div>
            </div>
            ` : ''}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleEdit = (order: RadiologyOrder) => {
    setEditingOrder(order)
    setShowEditForm(true)
  }

  const handleDelete = (order: RadiologyOrder) => {
    setDeletingOrder(order)
    setShowDeleteConfirm(true)
  }

  const handleCreateOrder = async (formData: FormData) => {
    try {
      const response = await fetch('/api/radiologis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrasi_id: parseInt(formData.get('patient') as string),
          radio_id: parseInt(formData.get('radiologyExam') as string),
          diagnosa_klinis: formData.get('clinicalDiagnosis') as string,
          urgensi: formData.get('priority') as string,
          catatan: formData.get('notes') as string || null,
          tanggal_permintaan: new Date().toISOString().split('T')[0], // Today's date
          status: 'diminta',
          dokter_id: user?.id || 1, // Get from auth context
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Order created successfully:', result)

        // Refresh the orders list
        await fetchRadiologyOrders()

        // Close modal
        setShowCreateForm(false)

        // TODO: Show success message
        alert('Order radiologi berhasil dibuat!')
      } else {
        const error = await response.json()
        console.error('Failed to create order:', error)
        alert('Gagal membuat order radiologi: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating radiology order:', error)
      alert('Terjadi kesalahan saat membuat order radiologi')
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    // Basic validation
    const clinicalDiagnosis = formData.get('clinicalDiagnosis')

    if (!selectedPatient || !selectedRadiologyExam || !clinicalDiagnosis) {
      alert('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    handleCreateOrder(formData)
  }

  const handleEditOrder = async (formData: FormData) => {
    if (!editingOrder) return

    try {
      const response = await fetch(`/api/radiologis/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnosa_klinis: formData.get('clinicalDiagnosis') as string,
          urgensi: formData.get('priority') as string,
          catatan: formData.get('notes') as string || null,
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Order updated successfully:', result)

        // Refresh the orders list
        await fetchRadiologyOrders()

        // Close modal
        setShowEditForm(false)
        setEditingOrder(null)

        alert('Order radiologi berhasil diperbarui!')
      } else {
        const error = await response.json()
        console.error('Failed to update order:', error)
        alert('Gagal memperbarui order radiologi: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating radiology order:', error)
      alert('Terjadi kesalahan saat memperbarui order radiologi')
    }
  }

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return

    try {
      const response = await fetch(`/api/radiologis/${deletingOrder.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('Order deleted successfully')

        // Refresh the orders list
        await fetchRadiologyOrders()

        // Close modal
        setShowDeleteConfirm(false)
        setDeletingOrder(null)

        alert('Order radiologi berhasil dihapus!')
      } else {
        const error = await response.json()
        console.error('Failed to delete order:', error)
        alert('Gagal menghapus order radiologi: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting radiology order:', error)
      alert('Terjadi kesalahan saat menghapus order radiologi')
    }
  }

  const handleEditFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    // Basic validation
    const clinicalDiagnosis = formData.get('clinicalDiagnosis')

    if (!clinicalDiagnosis) {
      alert('Mohon lengkapi diagnosa klinis')
      return
    }

    handleEditOrder(formData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Order Radiologi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola pemesanan pemeriksaan radiologi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRadiologyOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdAdd className="text-lg" />
            Order Radiologi Baru
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Cari order radiologi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Radiology Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading radiology orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pemeriksaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prioritas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <MdPerson className="text-blue-600 dark:text-blue-400 text-lg" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.registrasi?.pasien?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.registrasi?.pasien?.mrn || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.master_radiologi?.nama_pemeriksaan || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {order.diagnosa_klinis}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getExaminationTypeIcon(order.master_radiologi?.kategori || '')}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getExaminationTypeText(order.master_radiologi?.kategori || '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.urgensi)}`}>
                        {getPriorityIcon(order.urgensi)}
                        {getPriorityText(order.urgensi)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.tanggal_permintaan).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Lihat Detail Order"
                        >
                          <MdLocalHospital className="text-lg" />
                          Detail
                        </button>
                        <button
                          onClick={() => handlePrint(order)}
                          className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Print Order Radiologi"
                        >
                          <MdPrint className="text-lg" />
                          Print
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Order Radiologi"
                        >
                          <MdEdit className="text-lg" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                          title="Hapus Order Radiologi"
                        >
                          <MdDelete className="text-lg" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {showEditForm && editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MdEdit className="text-blue-500 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Edit Order Radiologi
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {editingOrder.registrasi?.pasien?.name || 'N/A'} - {editingOrder.registrasi?.pasien?.mrn || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditForm(false)
                  setEditingOrder(null)
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdCancel className="text-gray-400 text-lg" />
              </button>
            </div>

            <form onSubmit={handleEditFormSubmit} className="space-y-6">
              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioritas
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="relative">
                    <input type="radio" name="priority" value="rutin" className="sr-only peer" defaultChecked={editingOrder.urgensi === 'rutin'} />
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <MdSchedule className="text-blue-500 text-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Rutin</span>
                      </div>
                    </div>
                  </label>
                  <label className="relative">
                    <input type="radio" name="priority" value="urgent" className="sr-only peer" defaultChecked={editingOrder.urgensi === 'urgent'} />
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-yellow-500 peer-checked:bg-yellow-50 dark:peer-checked:bg-yellow-900/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <MdWarning className="text-yellow-500 text-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Urgent</span>
                      </div>
                    </div>
                  </label>
                  <label className="relative">
                    <input type="radio" name="priority" value="stat" className="sr-only peer" defaultChecked={editingOrder.urgensi === 'stat'} />
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <MdCancel className="text-red-500 text-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">STAT</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Clinical Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diagnosa Klinis
                </label>
                <textarea
                  name="clinicalDiagnosis"
                  rows={3}
                  placeholder="Jelaskan indikasi klinis untuk pemeriksaan radiologi..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                  defaultValue={editingOrder.diagnosa_klinis}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Catatan khusus untuk radiologi..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  defaultValue={editingOrder.catatan || ''}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingOrder(null)
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MdAdd className="text-green-500 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Radiologi Baru
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Buat permintaan pemeriksaan radiologi untuk pasien
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdCancel className="text-gray-400 text-lg" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Registrasi Pasien
                </label>
                <SearchableSelect
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                  options={registrations.map(registration => ({
                    value: registration.registration_id.toString(),
                    label: `${registration.name} - ${registration.mrn} (${registration.nama_poli}) - ${new Date(registration.tanggal_registrasi).toLocaleDateString('id-ID')}`
                  }))}
                  placeholder={loadingRegistrations ? 'Memuat registrasi...' : 'Cari dan pilih pasien...'}
                  className={loadingRegistrations ? 'opacity-50' : ''}
                />
                <input type="hidden" name="patient" value={selectedPatient} />
              </div>

              {/* Radiology Examination Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pemeriksaan Radiologi
                </label>
                <SearchableSelect
                  value={selectedRadiologyExam}
                  onValueChange={setSelectedRadiologyExam}
                  options={radiologyExams.map(exam => ({
                    value: exam.id.toString(),
                    label: `${exam.nama_pemeriksaan} (${exam.kode_radio}) - Rp ${exam.tarif.toLocaleString('id-ID')} - ${exam.kategori}`
                  }))}
                  placeholder={loadingExams ? 'Memuat pemeriksaan...' : 'Cari dan pilih pemeriksaan...'}
                  className={loadingExams ? 'opacity-50' : ''}
                />
                <input type="hidden" name="radiologyExam" value={selectedRadiologyExam} />
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioritas
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="relative">
                    <input type="radio" name="priority" value="rutin" className="sr-only peer" defaultChecked />
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <MdSchedule className="text-blue-500 text-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Rutin</span>
                      </div>
                    </div>
                  </label>
                  <label className="relative">
                    <input type="radio" name="priority" value="urgent" className="sr-only peer" />
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-yellow-500 peer-checked:bg-yellow-50 dark:peer-checked:bg-yellow-900/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <MdWarning className="text-yellow-500 text-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Urgent</span>
                      </div>
                    </div>
                  </label>
                  <label className="relative">
                    <input type="radio" name="priority" value="stat" className="sr-only peer" />
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <MdCancel className="text-red-500 text-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">STAT</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Clinical Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diagnosa Klinis
                </label>
                <textarea
                  name="clinicalDiagnosis"
                  rows={3}
                  placeholder="Jelaskan indikasi klinis untuk pemeriksaan radiologi..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Catatan khusus untuk radiologi..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Buat Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MdMedicalServices className="text-blue-500 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detail Order Radiologi
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedOrder.registrasi?.pasien?.name || 'N/A'} - {selectedOrder.registrasi?.pasien?.mrn || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdCancel className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Informasi Order</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dokter:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.dokter?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tanggal Order:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedOrder.tanggal_permintaan).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Prioritas:</span>
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedOrder.urgensi)}`}>
                      {getPriorityText(selectedOrder.urgensi)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Detail Pemeriksaan</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Nama Pemeriksaan:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.master_radiologi?.nama_pemeriksaan || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tipe:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getExaminationTypeText(selectedOrder.master_radiologi?.kategori || '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Kode:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.master_radiologi?.kode_radio || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tarif:</span>
                    <span className="font-medium text-gray-900 dark:text-white">Rp {selectedOrder.tarif.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Indikasi Klinis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                {selectedOrder.diagnosa_klinis}
              </p>
            </div>

            {/* Results Section */}
            {(selectedOrder.hasil || selectedOrder.kesan) && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Hasil Radiologi</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {selectedOrder.hasil && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Finding</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.hasil}</p>
                      </div>
                    )}
                    {selectedOrder.kesan && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Kesan</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.kesan}</p>
                      </div>
                    )}
                  </div>
                  {selectedOrder.tanggal_hasil && (
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Tanggal Hasil: {new Date(selectedOrder.tanggal_hasil).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedOrder.catatan && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Catatan:</strong> {selectedOrder.catatan}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Tutup
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <MdDelete className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hapus Order Radiologi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apakah Anda yakin ingin menghapus order ini?
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Pasien:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {deletingOrder.registrasi?.pasien?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Pemeriksaan:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {deletingOrder.master_radiologi?.nama_pemeriksaan || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deletingOrder.status)}`}>
                    {getStatusText(deletingOrder.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <MdWarning className="text-yellow-600 dark:text-yellow-400 text-lg mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Peringatan
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Tindakan ini tidak dapat dibatalkan. Order radiologi akan dihapus secara permanen.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletingOrder(null)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Hapus Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdMedicalServices className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Order</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {radiologyOrders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdSchedule className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Diproses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {radiologyOrders.filter(o => o.status === 'proses').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdCheckCircle className="text-green-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {radiologyOrders.filter(o => o.status === 'selesai').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdWarning className="text-yellow-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {radiologyOrders.filter(o => o.urgensi === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
