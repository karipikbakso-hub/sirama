'use client'

import { useState, useEffect } from 'react'
import { FaUserPlus, FaEdit, FaSearch, FaEye } from 'react-icons/fa'
import api from '@/lib/apiAuth'

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
  no_bpjs?: string
  bpjs_number?: string
  status?: string
  created_at?: string
}

interface PatientFormData {
  name: string
  nik?: string
  birth_date: string
  gender: 'L' | 'P'
  phone?: string
  address?: string
  emergency_contact?: string
  bpjs_number?: string
}

const validatePatientForm = (data: PatientFormData): string[] => {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Nama wajib diisi')
  }

  if (!data.birth_date || data.birth_date.trim().length === 0) {
    errors.push('Tanggal lahir wajib diisi')
  }

  if (!data.gender || !['L', 'P'].includes(data.gender)) {
    errors.push('Jenis kelamin wajib dipilih')
  }

  return errors
}

export default function RegistrasiPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    nik: '',
    birth_date: '',
    gender: 'L',
    phone: '',
    address: '',
    emergency_contact: '',
    bpjs_number: ''
  })
  const [formErrors, setFormErrors] = useState<string[]>([])

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/patients')
      if (response.data.success) {
        setPatients(response.data.data.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error)
      alert('Gagal memuat data pasien')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const searchValue = searchTerm.toLowerCase()
    const searchableValues = [
      patient.name || patient.nama || '',
      patient.nik || '',
      patient.mrn || patient.no_rm || '',
      patient.phone || patient.telepon || '',
      patient.bpjs_number || patient.no_bpjs || ''
    ]

    return searchableValues.some(fieldValue =>
      fieldValue.toLowerCase().includes(searchValue)
    )
  })

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validatePatientForm(formData)
    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        ...formData,
        nik: formData.nik || null,
        phone: formData.phone || null,
        address: formData.address || null,
        emergency_contact: formData.emergency_contact || null,
        bpjs_number: formData.bpjs_number || null,
        status: 'active'
      }

      if (editingPatient) {
        // Update patient
        const response = await api.put(`/api/patients/${editingPatient.id}`, payload)
        if (response.data.success) {
          alert('Data pasien berhasil diperbarui')
          setShowForm(false)
          setEditingPatient(null)
          setFormData({
            name: '',
            nik: '',
            birth_date: '',
            gender: 'L',
            phone: '',
            address: '',
            emergency_contact: '',
            bpjs_number: ''
          })
          setFormErrors([])
          fetchPatients()
        }
      } else {
        // Create new patient
        const response = await api.post('/api/patients', payload)
        if (response.data.success) {
          alert('Pasien baru berhasil ditambahkan')
          setShowForm(false)
          setFormData({
            name: '',
            nik: '',
            birth_date: '',
            gender: 'L',
            phone: '',
            address: '',
            emergency_contact: '',
            bpjs_number: ''
          })
          setFormErrors([])
          fetchPatients()
        }
      }
    } catch (error: any) {
      console.error('Error saving patient:', error)
      const message = error.response?.data?.message || 'Gagal menyimpan data pasien'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name || patient.nama || '',
      nik: patient.nik || '',
      birth_date: patient.birth_date || patient.tanggal_lahir || '',
      gender: (patient.gender || patient.jenis_kelamin || 'L') as 'L' | 'P',
      phone: patient.phone || patient.telepon || '',
      address: patient.address || patient.alamat || '',
      emergency_contact: patient.emergency_contact || patient.kontak_darurat || '',
      bpjs_number: patient.bpjs_number || patient.no_bpjs || ''
    })
    setFormErrors([])
    setShowForm(true)
  }

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false)
    setEditingPatient(null)
    setFormData({
      name: '',
      nik: '',
      birth_date: '',
      gender: 'L',
      phone: '',
      address: '',
      emergency_contact: '',
      bpjs_number: ''
    })
    setFormErrors([])
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide">
          Registrasi Pasien
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola data pasien baru dan existing
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <FaUserPlus />
          Tambah Pasien Baru
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingPatient ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
            </h2>

            <form onSubmit={onSubmit} className="space-y-6">
              {formErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <ul className="text-red-700 dark:text-red-300 text-sm">
                    {formErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIK
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData(prev => ({ ...prev, nik: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="16 digit NIK"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'L' | 'P' }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Masukkan no. telepon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No. BPJS
                  </label>
                  <input
                    type="text"
                    value={formData.bpjs_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, bpjs_number: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Masukkan no. BPJS"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kontak Darurat
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="No. telepon kontak darurat"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      {editingPatient ? 'Update' : 'Simpan'}
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

      {/* Search */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pasien berdasarkan nama, NIK, atau No. RM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">No. RM</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">NIK</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tanggal Lahir</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Jenis Kelamin</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Telepon</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">No. BPJS</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data pasien...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">
                        {patient.mrn || patient.no_rm || `RM${patient.id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">
                        {patient.name || patient.nama}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">
                        {patient.nik || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {patient.birth_date || patient.tanggal_lahir ? new Date(patient.birth_date || patient.tanggal_lahir!).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {patient.gender || patient.jenis_kelamin === 'L' ? 'Laki-laki' : patient.gender || patient.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {patient.phone || patient.telepon || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">
                        {patient.bpjs_number || patient.no_bpjs || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'active' || patient.status === 'aktif'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : patient.status === 'inactive' || patient.status === 'tidak_aktif'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {patient.status === 'active' || patient.status === 'aktif' ? 'Aktif' :
                         patient.status === 'inactive' || patient.status === 'tidak_aktif' ? 'Tidak Aktif' :
                         patient.status === 'meninggal' ? 'Meninggal' : patient.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  <FaSearch className="mx-auto text-3xl mb-2 opacity-50" />
                  <p>Tidak ada data pasien ditemukan</p>
                </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
