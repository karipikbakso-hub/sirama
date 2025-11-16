import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MdEdit,
  MdDelete,
  MdVisibility,
  MdCheckCircle,
  MdCancel,
  MdSchedule,
  MdPerson,
  MdPhone,
  MdEmail
} from 'react-icons/md'

export interface AppointmentData {
  id: number
  patientName: string
  patientNik: string
  patientPhone: string
  patientEmail: string
  doctorName: string
  appointmentDate: string
  appointmentTime: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  type: 'consultation' | 'follow_up' | 'emergency' | 'check_up'
  notes: string
  createdAt: string
  updatedAt: string
}

export const getAppointmentColumns = (): ColumnDef<AppointmentData>[] => [
  {
    accessorKey: 'patientName',
    header: 'Pasien',
    cell: ({ row }) => {
      const patient = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <MdPerson className="text-blue-600 dark:text-blue-400 text-sm" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {patient.patientName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              NIK: {patient.patientNik}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'contact',
    header: 'Kontak',
    cell: ({ row }) => {
      const patient = row.original
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <MdPhone className="text-gray-400 text-xs" />
            <span className="text-gray-600 dark:text-gray-400">{patient.patientPhone}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <MdEmail className="text-gray-400 text-xs" />
            <span className="text-gray-600 dark:text-gray-400">{patient.patientEmail}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'doctorName',
    header: 'Dokter',
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 dark:text-white">
        {row.getValue('doctorName')}
      </div>
    ),
  },
  {
    accessorKey: 'appointmentDate',
    header: 'Tanggal & Waktu',
    cell: ({ row }) => {
      const date = row.getValue('appointmentDate') as string
      const time = row.original.appointmentTime
      return (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {new Date(date).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {time}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Jenis',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const typeLabels = {
        consultation: 'Konsultasi',
        follow_up: 'Follow Up',
        emergency: 'Emergency',
        check_up: 'Check Up'
      }

      const typeColors = {
        consultation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        follow_up: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        emergency: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        check_up: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      }

      return (
        <Badge className={typeColors[type as keyof typeof typeColors]}>
          {typeLabels[type as keyof typeof typeLabels]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusLabels = {
        scheduled: 'Terjadwal',
        confirmed: 'Dikonfirmasi',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
        no_show: 'Tidak Hadir'
      }

      const statusColors = {
        scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      }

      return (
        <Badge className={statusColors[status as keyof typeof statusColors]}>
          {statusLabels[status as keyof typeof statusLabels]}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const appointment = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Lihat Detail"
          >
            <MdVisibility className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Edit Janji Temu"
          >
            <MdEdit className="h-4 w-4" />
          </Button>
          {appointment.status === 'scheduled' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              title="Konfirmasi"
            >
              <MdCheckCircle className="h-4 w-4" />
            </Button>
          )}
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Batalkan"
            >
              <MdCancel className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
  },
]

// Mock data for development
export const mockAppointmentData: AppointmentData[] = [
  {
    id: 1,
    patientName: 'Ahmad Surya',
    patientNik: '3171234567890001',
    patientPhone: '+6281234567890',
    patientEmail: 'ahmad.surya@email.com',
    doctorName: 'Dr. Sarah Johnson',
    appointmentDate: '2025-11-20',
    appointmentTime: '09:00',
    status: 'confirmed',
    type: 'consultation',
    notes: 'Konsultasi rutin bulanan',
    createdAt: '2025-11-15T08:00:00Z',
    updatedAt: '2025-11-15T08:00:00Z'
  },
  {
    id: 2,
    patientName: 'Maya Sari',
    patientNik: '3171234567890002',
    patientPhone: '+6281234567891',
    patientEmail: 'maya.sari@email.com',
    doctorName: 'Dr. Budi Santoso',
    appointmentDate: '2025-11-20',
    appointmentTime: '10:30',
    status: 'scheduled',
    type: 'follow_up',
    notes: 'Follow up pemeriksaan darah',
    createdAt: '2025-11-14T14:30:00Z',
    updatedAt: '2025-11-14T14:30:00Z'
  },
  {
    id: 3,
    patientName: 'Rudi Hartono',
    patientNik: '3171234567890003',
    patientPhone: '+6281234567892',
    patientEmail: 'rudi.hartono@email.com',
    doctorName: 'Dr. Lisa Chen',
    appointmentDate: '2025-11-21',
    appointmentTime: '14:00',
    status: 'completed',
    type: 'check_up',
    notes: 'Medical check up tahunan',
    createdAt: '2025-11-10T09:15:00Z',
    updatedAt: '2025-11-21T15:30:00Z'
  },
  {
    id: 4,
    patientName: 'Siti Aminah',
    patientNik: '3171234567890004',
    patientPhone: '+6281234567893',
    patientEmail: 'siti.aminah@email.com',
    doctorName: 'Dr. Ahmad Rahman',
    appointmentDate: '2025-11-19',
    appointmentTime: '11:15',
    status: 'cancelled',
    type: 'consultation',
    notes: 'Konsultasi mata - dibatalkan pasien',
    createdAt: '2025-11-12T16:45:00Z',
    updatedAt: '2025-11-18T10:20:00Z'
  },
  {
    id: 5,
    patientName: 'Dewi Lestari',
    patientNik: '3171234567890005',
    patientPhone: '+6281234567894',
    patientEmail: 'dewi.lestari@email.com',
    doctorName: 'Dr. Michael Brown',
    appointmentDate: '2025-11-22',
    appointmentTime: '08:30',
    status: 'no_show',
    type: 'emergency',
    notes: 'Emergency consultation - tidak hadir',
    createdAt: '2025-11-20T07:00:00Z',
    updatedAt: '2025-11-22T09:00:00Z'
  }
]

// Filter functions
export const filterAppointmentsByStatus = (appointments: AppointmentData[], status: string) => {
  if (status === 'all') return appointments
  return appointments.filter(apt => apt.status === status)
}

export const filterAppointmentsByDate = (appointments: AppointmentData[], date: string) => {
  return appointments.filter(apt => apt.appointmentDate === date)
}

export const filterAppointmentsByDoctor = (appointments: AppointmentData[], doctorName: string) => {
  if (!doctorName) return appointments
  return appointments.filter(apt =>
    apt.doctorName.toLowerCase().includes(doctorName.toLowerCase())
  )
}

// Status update functions
export const updateAppointmentStatus = (
  appointments: AppointmentData[],
  id: number,
  newStatus: AppointmentData['status']
): AppointmentData[] => {
  return appointments.map(apt =>
    apt.id === id
      ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() }
      : apt
  )
}

// Statistics functions
export const getAppointmentStats = (appointments: AppointmentData[]) => {
  const total = appointments.length
  const confirmed = appointments.filter(apt => apt.status === 'confirmed').length
  const completed = appointments.filter(apt => apt.status === 'completed').length
  const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
  const noShow = appointments.filter(apt => apt.status === 'no_show').length
  const scheduled = appointments.filter(apt => apt.status === 'scheduled').length

  return {
    total,
    confirmed,
    completed,
    cancelled,
    noShow,
    scheduled,
    confirmationRate: total > 0 ? ((confirmed + completed) / total * 100).toFixed(1) : '0'
  }
}