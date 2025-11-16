'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaCalendarAlt, FaClock, FaUserMd, FaCheckCircle, FaTimesCircle, FaCalendarCheck, FaTimes, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import api from '@/lib/apiAuth'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import TableByRole from '@/components/table/TableByRole'
import { getAppointmentColumns } from '@/components/table/columns/appointmentColumns'
import { StatsCard, DashboardGrid } from '@/components/role'
import { usePendaftaranDashboard } from '@/hooks/role'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/role'
import toast from '@/lib/toast'

export default function AppointmentPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [createForm, setCreateForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  })
  const [rescheduleForm, setRescheduleForm] = useState({
    appointment_date: '',
    appointment_time: '',
    notes: ''
  })
  const [cancelForm, setCancelForm] = useState({
    cancellation_reason: ''
  })
  const queryClient = useQueryClient()

  // Fetch appointments with pagination
  const fetchAppointments = async (page = 1, search = '', newPerPage?: number) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (newPerPage || 10).toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await api.get(`/api/appointments?${params}`)
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch appointments')
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err)
      throw err
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/appointments/statistics')
      if (response.data.success) {
        return response.data.data
      }
      return null
    } catch (err: any) {
      console.error('Error fetching stats:', err)
      return null
    }
  }

  // TanStack Query for appointments
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch
  } = useQuery({
    queryKey: ['appointments', currentPage, perPage, searchTerm],
    queryFn: () => fetchAppointments(currentPage, searchTerm, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // TanStack Query for stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['appointment-stats'],
    queryFn: fetchStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const appointments = appointmentsData?.data || []

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await api.post('/api/appointments', appointmentData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
      setShowCreateModal(false)
      setCreateForm({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', notes: '' })
      toast.success('Appointment berhasil dibuat!')
    },
    onError: (error: any) => {
      toast.error('Gagal membuat appointment: ' + (error.response?.data?.message || error.message))
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await api.put(`/api/appointments/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
      setShowRescheduleModal(false)
      setSelectedAppointment(null)
      setRescheduleForm({ appointment_date: '', appointment_time: '', notes: '' })
      toast.success('Appointment berhasil diubah!')
    },
    onError: (error: any) => {
      toast.error('Gagal mengubah appointment: ' + (error.response?.data?.message || error.message))
    }
  })

  const confirmMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await api.patch(`/api/appointments/${appointmentId}/status`, { status: 'confirmed' })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
      toast.success('Appointment berhasil dikonfirmasi!')
    },
    onError: (error: any) => {
      toast.error('Gagal mengkonfirmasi appointment: ' + (error.response?.data?.message || error.message))
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number, reason: string }) => {
      const response = await api.patch(`/api/appointments/${id}/cancel`, { cancellation_reason: reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
      setShowCancelModal(false)
      setSelectedAppointment(null)
      setCancelForm({ cancellation_reason: '' })
      toast.success('Appointment berhasil dibatalkan!')
    },
    onError: (error: any) => {
      toast.error('Gagal membatalkan appointment: ' + (error.response?.data?.message || error.message))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await api.delete(`/api/appointments/${appointmentId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
      toast.success('Appointment berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error('Gagal menghapus appointment: ' + (error.response?.data?.message || error.message))
    }
  })

  const handleConfirm = (appointment: any) => {
    if (confirm('Apakah Anda yakin ingin mengkonfirmasi appointment ini?')) {
      confirmMutation.mutate(appointment.id)
    }
  }

  const handleCancel = (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowCancelModal(true)
  }

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment)
    setRescheduleForm({
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      notes: appointment.notes || ''
    })
    setShowRescheduleModal(true)
  }

  const handleDelete = (appointment: any) => {
    if (confirm('Apakah Anda yakin ingin menghapus appointment ini?')) {
      deleteMutation.mutate(appointment.id)
    }
  }

  const handleView = (appointment: any) => {
    toast.info('Fitur detail appointment akan segera hadir')
  }

  const handleCreateAppointment = () => {
    setShowCreateModal(true)
  }

  const handleSaveCreateAppointment = () => {
    if (!createForm.patient_id || !createForm.doctor_id || !createForm.appointment_date || !createForm.appointment_time) {
      toast.error('Mohon lengkapi semua field yang wajib!')
      return
    }
    createMutation.mutate(createForm)
  }

  const handleSaveRescheduleAppointment = () => {
    if (!selectedAppointment) return
    if (!rescheduleForm.appointment_date || !rescheduleForm.appointment_time) {
      toast.error('Mohon lengkapi tanggal dan waktu!')
      return
    }
    updateMutation.mutate({
      id: selectedAppointment.id,
      data: rescheduleForm
    })
  }

  const handleSaveCancelAppointment = () => {
    if (!selectedAppointment) return
    if (!cancelForm.cancellation_reason.trim()) {
      toast.error('Mohon isi alasan pembatalan!')
      return
    }
    cancelMutation.mutate({
      id: selectedAppointment.id,
      reason: cancelForm.cancellation_reason
    })
  }

  // Create columns with handlers
  const columns = getAppointmentColumns({
    onConfirm: handleConfirm,
    onEdit: handleEdit,
    onCancel: handleCancel,
    onDelete: handleDelete,
    onView: handleView,
  })

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaCalendarCheck className="text-purple-500" />
        <span className="truncate">Appointment</span>
      </h1>

      {/* Appointment Stats */}
      <DashboardGrid className="mb-6">
        <StatsCard
          title="Total Appointment"
          value={statsLoading ? '...' : formatNumber(stats?.total_appointments || 0)}
          change="bulan ini"
          icon={<FaCalendarAlt />}
          color="from-blue-500 to-blue-600"
        />

        <StatsCard
          title="Dikonfirmasi"
          value={statsLoading ? '...' : formatPercentage(stats?.confirmation_rate || 0)}
          change="tingkat konfirmasi"
          icon={<FaCheckCircle />}
          color="from-green-500 to-green-600"
        />

        <StatsCard
          title="Appointment Hari Ini"
          value={statsLoading ? '...' : formatNumber(stats?.today_appointments || 0)}
          change="jadwal aktif"
          icon={<FaClock />}
          color="from-orange-500 to-orange-600"
        />

        <StatsCard
          title="Tingkat Kepuasan"
          value="96%"
          change="dari feedback pasien"
          icon={<FaUserMd />}
          color="from-purple-500 to-purple-600"
        />
      </DashboardGrid>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleCreateAppointment}
            className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex flex-col items-center gap-2"
          >
            <FaPlus className="text-2xl text-blue-500" />
            <span className="font-medium">Buat Appointment</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Jadwalkan kunjungan</span>
          </button>
          <button className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex flex-col items-center gap-2">
            <FaCheckCircle className="text-2xl text-green-500" />
            <span className="font-medium">Konfirmasi</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Setujui appointment</span>
          </button>
          <button className="p-4 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex flex-col items-center gap-2">
            <FaClock className="text-2xl text-orange-500" />
            <span className="font-medium">Reschedule</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Ubah jadwal</span>
          </button>
          <button className="p-4 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex flex-col items-center gap-2">
            <FaTimesCircle className="text-2xl text-red-500" />
            <span className="font-medium">Batalkan</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Cancel appointment</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Cari Appointment</h2>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaUserMd className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien, dokter, atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-2">Daftar Appointment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Kelola semua jadwal appointment pasien</p>

        {appointmentsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <TableByRole role="pendaftaran" data={appointments} />
        )}
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Buat Appointment Baru</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close modal"
                  aria-label="Close create appointment modal"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pasien *
                  </label>
                  <SearchableSelect
                    onChange={(selected) => {
                      if (selected) {
                        setCreateForm(prev => ({
                          ...prev,
                          patient_id: selected.value
                        }))
                      } else {
                        setCreateForm(prev => ({
                          ...prev,
                          patient_id: ''
                        }))
                      }
                    }}
                    placeholder="Cari dan pilih pasien..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dokter *
                  </label>
                  <select
                    value={createForm.doctor_id}
                    onChange={(e) => setCreateForm({...createForm, doctor_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    required
                    aria-label="Pilih dokter"
                  >
                    <option value="">Pilih dokter</option>
                    <option value="1">Dr. Ahmad Santoso - Spesialis Penyakit Dalam</option>
                    <option value="2">Dr. Siti Nurhaliza - Spesialis Anak</option>
                    <option value="3">Dr. Budi Setiawan - Spesialis Bedah</option>
                    <option value="4">Dr. Maya Sari - Spesialis Kandungan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Appointment
                  </label>
                  <input
                    type="date"
                    value={createForm.appointment_date}
                    onChange={(e) => setCreateForm({...createForm, appointment_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    aria-label="Tanggal appointment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Waktu Appointment
                  </label>
                  <input
                    type="time"
                    value={createForm.appointment_time}
                    onChange={(e) => setCreateForm({...createForm, appointment_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    aria-label="Waktu appointment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                    placeholder="Catatan tambahan (opsional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCreateAppointment}
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Buat Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reschedule Appointment</h3>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close modal"
                  aria-label="Close reschedule appointment modal"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Pasien:</strong> {selectedAppointment.patient?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Dokter:</strong> {selectedAppointment.doctor?.name || 'N/A'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Baru
                  </label>
                  <input
                    type="date"
                    value={rescheduleForm.appointment_date}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, appointment_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    aria-label="Tanggal appointment baru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Waktu Baru
                  </label>
                  <input
                    type="time"
                    value={rescheduleForm.appointment_time}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, appointment_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    aria-label="Waktu appointment baru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={rescheduleForm.notes}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, notes: e.target.value})}
                    placeholder="Alasan perubahan jadwal"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveRescheduleAppointment}
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? 'Menyimpan...' : 'Reschedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Batalkan Appointment</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close modal"
                  aria-label="Close cancel appointment modal"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Pasien:</strong> {selectedAppointment.patient?.name || 'N/A'}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Dokter:</strong> {selectedAppointment.doctor?.name || 'N/A'}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Tanggal:</strong> {new Date(selectedAppointment.appointment_date).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alasan Pembatalan *
                  </label>
                  <textarea
                    value={cancelForm.cancellation_reason}
                    onChange={(e) => setCancelForm({...cancelForm, cancellation_reason: e.target.value})}
                    placeholder="Jelaskan alasan pembatalan appointment..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCancelAppointment}
                  disabled={cancelMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelMutation.isPending ? 'Membatalkan...' : 'Batalkan Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
