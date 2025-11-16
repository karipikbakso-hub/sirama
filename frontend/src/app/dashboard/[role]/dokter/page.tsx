'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MdToday,
  MdPeople,
  MdAssignment,
  MdLocalHospital,
  MdSchedule,
  MdTrendingUp,
  MdAccessTime,
  MdCheckCircle,
  MdPending,
  MdMedicalServices,
  MdScience,
  MdImage,
  MdNoteAdd,
  MdPersonAdd,
  MdVisibility,
  MdArrowForward,
  MdRefresh
} from 'react-icons/md'
import { menuByRole, MenuItem } from '@/lib/menuByRole'
import { Table } from '@/components/table/core/Table'
import { getDoctorTodayPatientsColumns, DoctorTodayPatient } from '@/components/table/columns/doctorTodayPatientsColumns'
import { Button } from '@/components/ui/button'

export default function DokterDashboard() {
  return <DokterDashboardHome />
}

// Home/Dashboard component with comprehensive doctor overview
function DokterDashboardHome() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [patients, setPatients] = useState<DoctorTodayPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch today's patients
  useEffect(() => {
    fetchTodayPatients()
  }, [])

  const fetchTodayPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/examinations/today-patients', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch patients')
      }

      const data = await response.json()
      if (data.success) {
        setPatients(data.data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch patients')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPatient = (patient: DoctorTodayPatient) => {
    // Navigate to patient EMR/detail page
    router.push(`/dashboard/dokter/emr?patientId=${patient.patient.id}&registrationId=${patient.id}`)
  }

  const handleRefreshPatients = () => {
    fetchTodayPatients()
  }

  // Navigation handlers
  const handleMenuClick = (module: string) => {
    router.push(`/dashboard/dokter?module=${module}`)
  }

  const handleAppointmentClick = (appointmentId: number) => {
    // In real implementation, this would navigate to patient EMR
    router.push(`/dashboard/dokter?module=emr&patient=${appointmentId}`)
  }

  const handleActivityClick = (activity: any) => {
    // Navigate to relevant module based on activity type
    const moduleMap = {
      prescription: 'resep',
      lab_order: 'order-lab',
      cppt: 'cppt',
      radiology: 'order-rad'
    }
    const module = moduleMap[activity.type as keyof typeof moduleMap] || 'emr'
    router.push(`/dashboard/dokter?module=${module}`)
  }

  const handleTaskClick = (taskType: string) => {
    // Navigate to relevant module based on task type
    const moduleMap = {
      'Verifikasi Resep': 'resep',
      'Review Hasil Lab': 'order-lab',
      'Review Hasil Radiologi': 'order-rad',
      'Update CPPT': 'cppt'
    }
    const module = moduleMap[taskType as keyof typeof moduleMap] || 'emr'
    router.push(`/dashboard/dokter?module=${module}`)
  }

  // Mock data - in real implementation, this would come from APIs
  const stats = {
    patientsToday: 12,
    pendingPrescriptions: 3,
    pendingLabOrders: 5,
    pendingRadiologyOrders: 2,
    completedToday: 8,
    waitingPatients: 3
  }

  const recentActivities = [
    { id: 1, type: 'prescription', patient: 'Ahmad Surya', time: '10:30', status: 'completed' },
    { id: 2, type: 'lab_order', patient: 'Siti Aminah', time: '09:45', status: 'pending' },
    { id: 3, type: 'cppt', patient: 'Budi Santoso', time: '09:15', status: 'completed' },
    { id: 4, type: 'radiology', patient: 'Maya Sari', time: '08:50', status: 'pending' },
  ]

  const upcomingAppointments = [
    { id: 1, patient: 'Dewi Lestari', time: '14:00', type: 'Follow-up' },
    { id: 2, patient: 'Rudi Hartono', time: '14:30', type: 'Consultation' },
    { id: 3, patient: 'Nina Putri', time: '15:00', type: 'Check-up' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard Dokter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Waktu saat ini</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pasien Hari Ini"
          value={stats.patientsToday}
          icon={MdPeople}
          color="blue"
          subtitle={`${stats.completedToday} selesai`}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Menunggu Antrian"
          value={stats.waitingPatients}
          icon={MdAccessTime}
          color="orange"
          subtitle="Perlu perhatian"
          trend="+3"
          trendUp={false}
        />
        <StatCard
          title="Resep Pending"
          value={stats.pendingPrescriptions}
          icon={MdAssignment}
          color="red"
          subtitle="Perlu diverifikasi"
          trend="-2"
          trendUp={true}
        />
        <StatCard
          title="Order Lab Pending"
          value={stats.pendingLabOrders}
          icon={MdScience}
          color="purple"
          subtitle="Menunggu hasil"
          trend="+5"
          trendUp={false}
        />
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Load Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <MdTrendingUp className="text-blue-600" />
            Beban Kerja Minggu Ini
          </h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, index) => {
              const height = [65, 80, 45, 90, 75, 30, 85][index]
              const isToday = index === 6 // Minggu
              return (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full max-w-8 rounded-t transition-all duration-300 ${
                      isToday ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-700'
                    }`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className={`text-xs mt-2 ${isToday ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                    {day}
                  </span>
                  <span className="text-xs text-gray-400">{[8, 10, 6, 12, 9, 4, 11][index]}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Rata-rata: 8.4 pasien/hari</span>
            <span className="text-green-600">+15% dari minggu lalu</span>
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <MdCheckCircle className="text-green-600" />
            Produktivitas Hari Ini
          </h2>
          <div className="space-y-4">
            <TaskProgressBar label="CPPT Entries" completed={8} total={10} color="blue" />
            <TaskProgressBar label="Resep Dibuat" completed={5} total={7} color="green" />
            <TaskProgressBar label="Order Lab" completed={3} total={5} color="purple" />
            <TaskProgressBar label="Order Radiologi" completed={2} total={4} color="orange" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800 dark:text-white">Total Progress</span>
              <span className="text-lg font-bold text-green-600">65%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Appointments & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <MdSchedule className="text-blue-600" />
                Janji Temu Hari Ini
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {upcomingAppointments.length} janji temu
              </span>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  onClick={() => handleAppointmentClick(appointment.id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <MdPersonAdd className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{appointment.patient}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 dark:text-white">{appointment.time}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">WIB</p>
                    </div>
                    <MdArrowForward className="text-gray-400 text-sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <MdTrendingUp className="text-green-600" />
                Aktivitas Terbaru
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Hari ini
              </span>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-orange-100 dark:bg-orange-900'
                    }`}>
                      {activity.type === 'prescription' && <MdMedicalServices className={
                        activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                      } />}
                      {activity.type === 'lab_order' && <MdScience className={
                        activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                      } />}
                      {activity.type === 'cppt' && <MdNoteAdd className={
                        activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                      } />}
                      {activity.type === 'radiology' && <MdImage className={
                        activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                      } />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{activity.patient}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {activity.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                      }`}>
                        {activity.status === 'completed' ? 'Selesai' : 'Pending'}
                      </span>
                    </div>
                    <MdArrowForward className="text-gray-400 text-sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Patients List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <MdToday className="text-blue-600" />
                Daftar Pasien Hari Ini
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshPatients}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <MdRefresh className={loading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {patients.length} pasien
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Memuat data pasien...</span>
              </div>
            ) : patients.length > 0 ? (
              <div className="overflow-x-auto">
                <Table
                  columns={getDoctorTodayPatientsColumns({ onViewPatient: handleViewPatient })}
                  data={patients}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <MdToday className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada pasien hari ini</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Belum ada pasien yang terdaftar untuk hari ini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions & Pending Tasks */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <MdLocalHospital className="text-indigo-600" />
              Aksi Cepat
            </h2>
            <div className="space-y-3">
              {menuByRole.dokter?.filter((item): item is MenuItem => 'icon' in item).slice(0, 6).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item.href?.split('/').pop() || 'emr')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
                >
                  <item.icon className="text-lg text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-800 dark:text-white">{item.label}</span>
                  <MdArrowForward className="text-gray-400 text-sm ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <MdPending className="text-orange-600" />
              Tugas Pending
            </h2>
            <div className="space-y-3">
              <TaskItem
                title="Verifikasi Resep"
                count={stats.pendingPrescriptions}
                icon={MdAssignment}
                color="red"
                onClick={() => handleTaskClick("Verifikasi Resep")}
              />
              <TaskItem
                title="Review Hasil Lab"
                count={stats.pendingLabOrders}
                icon={MdScience}
                color="purple"
                onClick={() => handleTaskClick("Review Hasil Lab")}
              />
              <TaskItem
                title="Review Hasil Radiologi"
                count={stats.pendingRadiologyOrders}
                icon={MdImage}
                color="blue"
                onClick={() => handleTaskClick("Review Hasil Radiologi")}
              />
              <TaskItem
                title="Update CPPT"
                count={2}
                icon={MdNoteAdd}
                color="green"
                onClick={() => handleTaskClick("Update CPPT")}
              />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <MdCheckCircle className="text-green-600" />
              Status Sistem
            </h2>
            <div className="space-y-3">
              <StatusItem label="EMR System" status="online" />
              <StatusItem label="Lab Integration" status="online" />
              <StatusItem label="Radiology System" status="online" />
              <StatusItem label="Pharmacy System" status="online" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subtitle, trend, trendUp }: {
  title: string
  value: number
  icon: any
  color: string
  subtitle?: string
  trend?: string
  trendUp?: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend} dari kemarin
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]} bg-opacity-10`}>
          <Icon className={`text-xl ${colorClasses[color as keyof typeof colorClasses].replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  )
}

// Task Progress Bar Component
function TaskProgressBar({ label, completed, total, color }: {
  label: string
  completed: number
  total: number
  color: string
}) {
  const percentage = Math.round((completed / total) * 100)
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-800 dark:text-white">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{completed}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-right">
        <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}% selesai</span>
      </div>
    </div>
  )
}

// Task Item Component
function TaskItem({ title, count, icon: Icon, color, onClick }: {
  title: string
  count: number
  icon: any
  color: string
  onClick?: () => void
}) {
  const colorClasses = {
    red: 'text-red-600 bg-red-100 dark:bg-red-900',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
    green: 'text-green-600 bg-green-100 dark:bg-green-900'
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="text-lg" />
        </div>
        <span className="font-medium text-gray-800 dark:text-white">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          count > 0
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        }`}>
          {count}
        </span>
        <MdArrowForward className="text-gray-400 text-sm" />
      </div>
    </button>
  )
}

// Status Item Component
function StatusItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'online' ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className={`text-xs font-medium capitalize ${
          status === 'online'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {status}
        </span>
      </div>
    </div>
  )
}
