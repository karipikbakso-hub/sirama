import { ColumnDef } from '@tanstack/react-table'

export interface DoctorTodayPatient {
  id: string
  name: string
  nik: string
  birthDate: string
  gender: string
  diagnosis: string
  status: string
  queueNumber: number
  appointmentTime: string
}

export const getDoctorTodayPatientsColumns = (): ColumnDef<DoctorTodayPatient>[] => [
  {
    accessorKey: 'queueNumber',
    header: 'No. Antrian',
    cell: ({ row }) => (
      <div className="font-medium text-center">
        {row.getValue('queueNumber')}
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Nama Pasien',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'nik',
    header: 'NIK',
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.getValue('nik')}
      </div>
    ),
  },
  {
    accessorKey: 'birthDate',
    header: 'Tanggal Lahir',
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.getValue('birthDate')).toLocaleDateString('id-ID')}
      </div>
    ),
  },
  {
    accessorKey: 'gender',
    header: 'Jenis Kelamin',
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue('gender') === 'L' ? 'Laki-laki' : 'Perempuan'}
      </div>
    ),
  },
  {
    accessorKey: 'diagnosis',
    header: 'Diagnosis',
    cell: ({ row }) => (
      <div className="text-sm max-w-xs truncate">
        {row.getValue('diagnosis') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusColors = {
        'waiting': 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
      }

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
        }`}>
          {status === 'waiting' ? 'Menunggu' :
           status === 'in-progress' ? 'Sedang Ditangani' :
           status === 'completed' ? 'Selesai' :
           status === 'cancelled' ? 'Dibatalkan' : status}
        </span>
      )
    },
  },
  {
    accessorKey: 'appointmentTime',
    header: 'Waktu Kunjungan',
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue('appointmentTime')}
      </div>
    ),
  },
]