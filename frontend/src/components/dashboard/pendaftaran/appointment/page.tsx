'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaCalendarAlt, FaClock, FaUserMd, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaCalendarCheck, FaTimes, FaPlus } from 'react-icons/fa'
import apiData from '@/lib/apiData'

export default function AppointmentPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
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
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const queryClient = useQueryClient()

  // API calls with React Query
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', { search: searchTerm, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await apiData.get(`api/appointments?${params.toString()}`)
      return response.data.data
    }
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['appointment-stats'],
    queryFn: async () => {
      const response = await apiData.get('api/appointments/statistics')
      return response.data.data
    }
  })

  // Fetch patients and doctors for autocomplete
  const { data: patientsList } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const response = await apiData.get('api/patients')
      return response.data.data
    }
  })

  const { data: doctorsList } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: async () => {
      const response = await apiData.get('api/doctors')
      return response.data.data
    }
  })

  // Mutations for actions
  const createMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiData.post('api/appointments', appointmentData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
      setShowCreateModal(false)
      setCreateForm({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', notes: '' })
    }
  })

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiData.put(`api/appointments/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
      setShowRescheduleModal(false)
      setSelectedAppointment(null)
      setRescheduleForm({ appointment_date: '', appointment_time: '', notes: '' })
    }
  })

  const confirmMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await apiData.post(`api/appointments/${appointmentId}/confirm`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await apiData.post(`api/appointments/${appointmentId}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-stats'] })
    }
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
  }

  const handleConfirm = (appointmentId: number) => {
    confirmMutation.mutate(appointmentId)
  }

  const handleCancel = (appointmentId: number) => {
    cancelMutation.mutate(appointmentId)
  }

  const handleCreateAppointment = () => {
    setShowCreateModal(true)
  }

  const handleRescheduleAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setRescheduleForm({
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      notes: appointment.notes || ''
    })
    setShowRescheduleModal(true)
  }

  const handleSaveCreateAppointment = async () => {
    try {
      await createMutation.mutateAsync(createForm)
      alert('Appointment created successfully!')
    } catch (error: any) {
      alert('Failed to create appointment: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleSaveRescheduleAppointment = async () => {
    if (!selectedAppointment) return

    try {
      await rescheduleMutation.mutateAsync({
        id: selectedAppointment.id,
        data: rescheduleForm
      })
      alert('Appointment rescheduled successfully!')
    } catch (error: any) {
      alert('Failed to reschedule appointment: ' + (error.response?.data?.message || error.message))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Dikonfirmasi
        </span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaClock className="text-xs" />
          Menunggu
        </span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaTimesCircle className="text-xs" />
          Dibatalkan
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaCalendarCheck className="text-purple-500" />
        <span className="truncate">Appointment</span>
      </h1>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointment</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.total_appointments || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">bulan ini</p>
            </div>
            <FaCalendarAlt className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dikonfirmasi</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.confirmation_rate || 0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tingkat konfirmasi</p>
            </div>
            <FaCheckCircle className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Appointment Hari Ini</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.today_appointments || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">jadwal aktif</p>
            </div>
            <FaClock className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Kepuasan</p>
              <p className="text-2xl font-bold">96%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">dari feedback pasien</p>
            </div>
            <FaUserMd className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

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
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'confirmed'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Dikonfirmasi
            </button>
            <button
              onClick={() => handleStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => handleStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'cancelled'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Dibatalkan
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-2">Daftar Appointment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Kelola semua jadwal appointment pasien</p>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">ID Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Dokter</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Spesialis</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tanggal</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Waktu</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {appointmentsLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">Loading appointments...</td>
                </tr>
              ) : appointments && appointments.data && appointments.data.length > 0 ? (
                appointments.data.map((appointment: any) => (
                  <tr key={appointment.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 font-mono text-sm">{appointment.patient?.mrn || 'N/A'}</td>
                    <td className="px-4 py-3 font-medium">{appointment.patient?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{appointment.doctor?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{appointment.doctor?.specialty || 'N/A'}</td>
                    <td className="px-4 py-3">{new Date(appointment.appointment_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3">{appointment.appointment_time}</td>
                    <td className="px-4 py-3">{getStatusBadge(appointment.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm">
                          Detail
                        </button>
                        {appointment.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleConfirm(appointment.id)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                              disabled={confirmMutation.isPending}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                              disabled={cancelMutation.isPending}
                            >
                              ✗
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleRescheduleAppointment(appointment)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                          ↻
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No appointments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Calendar Preview */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mt-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Kalender Appointment</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}

          {/* Calendar days - simplified */}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 3 // Start from previous month
            const isCurrentMonth = day >= 1 && day <= 31
            const hasAppointment = [15, 20, 22, 25].includes(day)

            return (
              <div
                key={i}
                className={`text-center py-3 rounded-lg transition ${
                  isCurrentMonth
                    ? hasAppointment
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {isCurrentMonth ? day : ''}
                {hasAppointment && (
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/30 rounded"></div>
            <span>Ada Appointment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
            <span>Tersedia</span>
          </div>
        </div>
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
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pasien
                  </label>
                  <input
                    type="text"
                    value={selectedPatient ? `${selectedPatient.mrn} - ${selectedPatient.name}` : createForm.patient_id}
                    onChange={(e) => {
                      setCreateForm({...createForm, patient_id: e.target.value})
                      setSelectedPatient(null)
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    placeholder="Cari dan pilih pasien..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                  {showPatientDropdown && patientsList?.data && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {patientsList.data
                        .filter((patient: any) =>
                          patient.name.toLowerCase().includes(createForm.patient_id.toLowerCase()) ||
                          patient.mrn.toString().includes(createForm.patient_id)
                        )
                        .slice(0, 10)
                        .map((patient: any) => (
                          <div
                            key={patient.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setCreateForm({...createForm, patient_id: patient.id.toString()})
                              setShowPatientDropdown(false)
                            }}
                          >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">MRN: {patient.mrn}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dokter
                  </label>
                  <input
                    type="text"
                    value={selectedDoctor ? `${selectedDoctor.license_number} - ${selectedDoctor.name}` : createForm.doctor_id}
                    onChange={(e) => {
                      setCreateForm({...createForm, doctor_id: e.target.value})
                      setSelectedDoctor(null)
                    }}
                    onFocus={() => setShowDoctorDropdown(true)}
                    placeholder="Cari dan pilih dokter..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                  {showDoctorDropdown && doctorsList?.data && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {doctorsList.data
                        .filter((doctor: any) =>
                          doctor.name.toLowerCase().includes(createForm.doctor_id.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(createForm.doctor_id.toLowerCase()) ||
                          doctor.license_number.toLowerCase().includes(createForm.doctor_id.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((doctor: any) => (
                          <div
                            key={doctor.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedDoctor(doctor)
                              setCreateForm({...createForm, doctor_id: doctor.id.toString()})
                              setShowDoctorDropdown(false)
                            }}
                          >
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</div>
                          </div>
                        ))}
                    </div>
                  )}
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
                  disabled={rescheduleMutation.isPending}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rescheduleMutation.isPending ? 'Menyimpan...' : 'Reschedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
