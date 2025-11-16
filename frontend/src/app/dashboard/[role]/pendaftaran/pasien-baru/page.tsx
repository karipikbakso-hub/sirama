'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { FaUserPlus, FaEdit, FaSearch, FaFilter, FaDownload, FaEye, FaCalendarPlus, FaUserCheck, FaCheck, FaTimes } from 'react-icons/fa'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface Patient {
  id: number
  no_rm?: string
  mrn?: string
  nama?: string
  name?: string
  nik: string
  tanggal_lahir?: string
  birth_date?: string
  jenis_kelamin?: 'L' | 'P'
  gender?: 'L' | 'P'
  telepon?: string
  phone?: string
  alamat?: string
  address?: string
  kontak_darurat?: string
  emergency_contact?: string
  status?: string
  created_at?: string
}

interface Poli {
  id: number
  kode_poli: string
  nama_poli: string
  jenis_poli: string
}

interface Doctor {
  id: number
  nip: string
  nama_dokter: string
  spesialisasi?: string
}

interface Penjamin {
  id: number
  nama_penjamin: string
  jenis_penjamin: string
}

interface PaymentMethod {
  bpjs: Penjamin[]
  asuransi: Penjamin[]
  tunai: { id: null; nama_penjamin: string; jenis_penjamin: string }[]
}

// Combined schema for integrated patient + registration form
const integratedSchema = z.object({
  // Patient search/selection
  patient_search: z.string().optional(),

  // Patient data (auto-filled or manual input)
  patient_id: z.number().optional(),
  name: z.string().min(1, 'Nama wajib diisi'),
  nik: z.string().optional(),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['L', 'P']),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),

  // Registration data
  service_unit: z.string().min(1, 'Unit pelayanan wajib dipilih'),
  doctor_id: z.number().optional(),
  arrival_type: z.enum(['mandiri', 'rujukan', 'igd']),
  referral_source: z.string().optional(),
  payment_method: z.string().min(1, 'Metode pembayaran wajib dipilih'),
  insurance_number: z.string().optional(),
  notes: z.string().optional(),
})

type IntegratedFormData = z.infer<typeof integratedSchema>

export default function PasienBaruPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [polis, setPolis] = useState<Poli[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [patientSuggestions, setPatientSuggestions] = useState<Patient[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [showInsuranceField, setShowInsuranceField] = useState(false)

  const integratedForm = useForm<IntegratedFormData>({
    resolver: zodResolver(integratedSchema)
  })

  // Fetch data
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/patients')
      if (response.data.success) {
        setPatients(response.data.data.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error)
      toast.error('Gagal memuat data pasien')
    } finally {
      setLoading(false)
    }
  }

  const fetchMasterData = async () => {
    try {
      const [polisRes, doctorsRes, paymentRes] = await Promise.all([
        api.get('/api/polis-active'),
        api.get('/api/doctors'),
        api.get('/api/payment-methods')
      ])

      if (polisRes.data.success) setPolis(polisRes.data.data)
      if (doctorsRes.data.success) setDoctors(doctorsRes.data.data.data || [])
      if (paymentRes.data.success) setPaymentMethods(paymentRes.data.data)
    } catch (error: any) {
      console.error('Error fetching master data:', error)
    }
  }

  useEffect(() => {
    fetchPatients()
    fetchMasterData()
  }, [])

  // Search patients with autocomplete
  const searchPatients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPatientSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await api.get(`/api/patients-search?q=${encodeURIComponent(query)}`)
      if (response.data.success) {
        setPatientSuggestions(response.data.data || [])
        setShowSuggestions(true)
      }
    } catch (error: any) {
      console.error('Error searching patients:', error)
    }
  }, [])

  // Handle patient selection from suggestions
  const selectPatient = (patient: Patient) => {
    integratedForm.setValue('patient_id', patient.id)
    integratedForm.setValue('name', patient.name || patient.nama || '')
    integratedForm.setValue('nik', patient.nik || '')
    integratedForm.setValue('birth_date', patient.birth_date || patient.tanggal_lahir || '')
    integratedForm.setValue('gender', (patient.gender || patient.jenis_kelamin || 'L') as 'L' | 'P')
    integratedForm.setValue('phone', patient.phone || patient.telepon || '')
    integratedForm.setValue('address', patient.address || patient.alamat || '')
    integratedForm.setValue('emergency_contact', patient.emergency_contact || patient.kontak_darurat || '')

    setPatientSuggestions([])
    setShowSuggestions(false)
  }

  // Handle integrated form submission
  const onIntegratedSubmit = async (data: IntegratedFormData) => {
    try {
      setSubmitting(true)

      // If patient_id exists, this is registration for existing patient
      if (data.patient_id) {
        // Create registration for existing patient
        let paymentMethod = data.payment_method
        if (data.payment_method.startsWith('bpjs_')) {
          paymentMethod = 'bpjs'
        } else if (data.payment_method.startsWith('asuransi_')) {
          paymentMethod = 'asuransi'
        }

        const registrationPayload = {
          patient_id: data.patient_id,
          service_unit: data.service_unit,
          doctor_id: data.doctor_id || null,
          arrival_type: data.arrival_type,
          referral_source: data.referral_source || null,
          payment_method: paymentMethod,
          insurance_number: data.insurance_number || null,
          notes: data.notes || null,
        }

        const response = await api.post('/api/registrations', registrationPayload)
        if (response.data.success) {
          toast.success('Registrasi berhasil dibuat')
          setShowForm(false)
          integratedForm.reset()
          fetchPatients()
        }
      } else {
        // Create new patient and registration
        const patientPayload = {
          name: data.name,
          nik: data.nik || null,
          birth_date: data.birth_date,
          gender: data.gender,
          phone: data.phone || null,
          address: data.address || null,
          emergency_contact: data.emergency_contact || null,
          status: 'active'
        }

        const patientResponse = await api.post('/api/patients', patientPayload)
        if (patientResponse.data.success) {
          const newPatientId = patientResponse.data.data.id

          // Create registration for new patient
          let paymentMethod = data.payment_method
          if (data.payment_method.startsWith('bpjs_')) {
            paymentMethod = 'bpjs'
          } else if (data.payment_method.startsWith('asuransi_')) {
            paymentMethod = 'asuransi'
          }

          const registrationPayload = {
            patient_id: newPatientId,
            service_unit: data.service_unit,
            doctor_id: data.doctor_id || null,
            arrival_type: data.arrival_type,
            referral_source: data.referral_source || null,
            payment_method: paymentMethod,
            insurance_number: data.insurance_number || null,
            notes: data.notes || null,
          }

          const registrationResponse = await api.post('/api/registrations', registrationPayload)
          if (registrationResponse.data.success) {
            toast.success('Pasien baru dan registrasi berhasil dibuat')
            setShowForm(false)
            integratedForm.reset()
            fetchPatients()
          }
        }
      }
    } catch (error: any) {
      console.error('Error saving:', error)
      const message = error.response?.data?.message || 'Gagal menyimpan data'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit patient
  const handleEdit = (patient: Patient) => {
    integratedForm.setValue('patient_id', patient.id)
    integratedForm.setValue('name', patient.name || patient.nama || '')
    integratedForm.setValue('nik', patient.nik || '')
    integratedForm.setValue('birth_date', patient.birth_date || patient.tanggal_lahir || '')
    integratedForm.setValue('gender', (patient.gender || patient.jenis_kelamin || 'L') as 'L' | 'P')
    integratedForm.setValue('phone', patient.phone || patient.telepon || '')
    integratedForm.setValue('address', patient.address || patient.alamat || '')
    integratedForm.setValue('emergency_contact', patient.emergency_contact || patient.kontak_darurat || '')

    setShowForm(true)
  }

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false)
    integratedForm.reset()
    setPatientSuggestions([])
    setShowSuggestions(false)
  }

  // Table columns
  const columns = useMemo<ColumnDef<Patient>[]>(() => [
    {
      accessorKey: 'mrn',
      header: 'No. RM',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.mrn || row.original.no_rm || `RM${row.original.id}`}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nama Pasien',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name || row.original.nama}
        </span>
      ),
    },
    {
      accessorKey: 'nik',
      header: 'NIK',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.nik || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'birth_date',
      header: 'Tanggal Lahir',
      cell: ({ row }) => {
        const date = row.original.birth_date || row.original.tanggal_lahir
        return date ? new Date(date).toLocaleDateString('id-ID') : '-'
      },
    },
    {
      accessorKey: 'gender',
      header: 'Jenis Kelamin',
      cell: ({ row }) => {
        const gender = row.original.gender || row.original.jenis_kelamin
        return gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : '-'
      },
    },
    {
      accessorKey: 'phone',
      header: 'Telepon',
      cell: ({ row }) => (
        <span>{row.original.phone || row.original.telepon || '-'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'active' || status === 'aktif'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : status === 'inactive' || status === 'tidak_aktif'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
          }`}>
            {status === 'active' || status === 'aktif' ? 'Aktif' :
             status === 'inactive' || status === 'tidak_aktif' ? 'Tidak Aktif' :
             status === 'meninggal' ? 'Meninggal' : status}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit Pasien"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <FaEye className="text-sm" />
          </button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: patients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide">
          Pasien Baru & Registrasi
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sistem terintegrasi untuk input pasien baru dan registrasi pelayanan kesehatan
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <FaUserPlus />
          Registrasi Pasien Baru
        </button>

        <button className="flex items-center gap-3 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors">
          <FaDownload />
          Export Data
        </button>
      </div>

      {/* Integrated Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              Registrasi Pasien & Pelayanan
            </h2>

            <form onSubmit={integratedForm.handleSubmit(onIntegratedSubmit)} className="space-y-8">
              {/* Patient Search Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">
                  <FaUserCheck className="inline mr-2" />
                  Data Pasien
                </h3>

                {/* Patient Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cari Pasien (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      {...integratedForm.register('patient_search')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Ketik nama pasien untuk mencari..."
                      onChange={(e) => {
                        integratedForm.setValue('patient_search', e.target.value)
                        searchPatients(e.target.value)
                      }}
                    />
                    {showSuggestions && patientSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {patientSuggestions.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => selectPatient(patient)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                          >
                            <div className="font-medium">{patient.name || patient.nama}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              RM: {patient.mrn || patient.no_rm || `RM${patient.id}`} | NIK: {patient.nik}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Jika pasien sudah terdaftar, pilih dari hasil pencarian. Jika belum ada, isi form di bawah.
                  </p>
                </div>

                {/* Patient Data Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      {...integratedForm.register('name')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Masukkan nama lengkap"
                    />
                    {integratedForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NIK
                    </label>
                    <input
                      {...integratedForm.register('nik')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="16 digit NIK"
                      maxLength={16}
                    />
                    {integratedForm.formState.errors.nik && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.nik.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Lahir *
                    </label>
                    <input
                      {...integratedForm.register('birth_date')}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    {integratedForm.formState.errors.birth_date && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.birth_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jenis Kelamin *
                    </label>
                    <select
                      {...integratedForm.register('gender')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                    {integratedForm.formState.errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.gender.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No. Telepon
                    </label>
                    <input
                      {...integratedForm.register('phone')}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Masukkan no. telepon"
                    />
                    {integratedForm.formState.errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kontak Darurat
                    </label>
                    <input
                      {...integratedForm.register('emergency_contact')}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="No. telepon kontak darurat"
                    />
                    {integratedForm.formState.errors.emergency_contact && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.emergency_contact.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat
                  </label>
                  <textarea
                    {...integratedForm.register('address')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                    placeholder="Masukkan alamat lengkap"
                  />
                  {integratedForm.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Registration Section */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200">
                  <FaCalendarPlus className="inline mr-2" />
                  Data Registrasi & Pelayanan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit Pelayanan *
                    </label>
                    <select
                      {...integratedForm.register('service_unit')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                    >
                      <option value="">Pilih unit pelayanan</option>
                      {polis.map((poli) => (
                        <option key={poli.id} value={poli.nama_poli}>
                          {poli.nama_poli} ({poli.kode_poli})
                        </option>
                      ))}
                    </select>
                    {integratedForm.formState.errors.service_unit && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.service_unit.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dokter
                    </label>
                    <select
                      {...integratedForm.register('doctor_id')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                    >
                      <option value="">Pilih dokter (opsional)</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.nama_dokter} {doctor.spesialisasi ? `(${doctor.spesialisasi})` : ''}
                        </option>
                      ))}
                    </select>
                    {integratedForm.formState.errors.doctor_id && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.doctor_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cara Kedatangan *
                    </label>
                    <select
                      {...integratedForm.register('arrival_type')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                    >
                      <option value="mandiri">Datang Sendiri</option>
                      <option value="rujukan">Rujukan</option>
                      <option value="igd">IGD</option>
                    </select>
                    {integratedForm.formState.errors.arrival_type && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.arrival_type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Metode Pembayaran *
                    </label>
                    <select
                      {...integratedForm.register('payment_method')}
                      onChange={(e) => {
                        integratedForm.setValue('payment_method', e.target.value)
                        setShowInsuranceField(e.target.value !== 'tunai')
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                    >
                      <option value="tunai">Tunai</option>
                      {paymentMethods?.bpjs?.map((penjamin) => (
                        <option key={penjamin.id} value={`bpjs_${penjamin.id}`}>
                          BPJS - {penjamin.nama_penjamin}
                        </option>
                      ))}
                      {paymentMethods?.asuransi?.map((penjamin) => (
                        <option key={penjamin.id} value={`asuransi_${penjamin.id}`}>
                          Asuransi - {penjamin.nama_penjamin}
                        </option>
                      ))}
                    </select>
                    {integratedForm.formState.errors.payment_method && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.payment_method.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sumber Rujukan
                    </label>
                    <input
                      {...integratedForm.register('referral_source')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                      placeholder="RS/Faskes asal rujukan"
                    />
                    {integratedForm.formState.errors.referral_source && (
                      <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.referral_source.message}</p>
                    )}
                  </div>

                  {showInsuranceField && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        No. Kartu/Polis
                      </label>
                      <input
                        {...integratedForm.register('insurance_number')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                        placeholder="Nomor kartu BPJS atau polis asuransi"
                      />
                      {integratedForm.formState.errors.insurance_number && (
                        <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.insurance_number.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan
                  </label>
                  <textarea
                    {...integratedForm.register('notes')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 resize-none"
                    placeholder="Catatan tambahan (opsional)"
                  />
                  {integratedForm.formState.errors.notes && (
                    <p className="text-red-500 text-sm mt-1">{integratedForm.formState.errors.notes.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-blue-400 disabled:to-green-400 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Simpan Registrasi
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pasien berdasarkan nama, NIK, atau No. RM..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <button className="flex items-center gap-3 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors">
            <FaFilter />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data pasien...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    <FaSearch className="mx-auto text-3xl mb-2 opacity-50" />
                    <p>Tidak ada data pasien ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} sampai{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              dari {table.getFilteredRowModel().rows.length} pasien
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
              {table.getPageCount()}
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
