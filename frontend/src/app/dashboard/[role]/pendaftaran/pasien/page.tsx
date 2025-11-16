'use client'

import { useState, useEffect } from 'react'
import { FaUserMd, FaEdit, FaSearch, FaEye, FaUser, FaPhone, FaMapMarkerAlt, FaVenusMars, FaBirthdayCake, FaIdCard, FaTimes } from 'react-icons/fa'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import api from '@/lib/apiAuth'

interface Patient {
  id: number
  mrn?: string
  no_rm?: string
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
  updated_at?: string
}

interface EditPatientData {
  name: string
  nik?: string
  birth_date: string
  gender: 'L' | 'P'
  phone?: string
  address?: string
  emergency_contact?: string
}

const validateEditPatient = (data: EditPatientData): string[] => {
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

export default function PatientEMRPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showEMRModal, setShowEMRModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editFormData, setEditFormData] = useState<EditPatientData>({
    name: '',
    nik: '',
    birth_date: '',
    gender: 'L',
    phone: '',
    address: '',
    emergency_contact: ''
  })
  const [editFormErrors, setEditFormErrors] = useState<string[]>([])

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
      patient.emergency_contact || patient.kontak_darurat || '',
      patient.address || patient.alamat || ''
    ]

    return searchableValues.some(fieldValue =>
      fieldValue.toLowerCase().includes(searchValue)
    )
  })

  // Handle view EMR
  const handleViewEMR = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowEMRModal(true)
  }

  // Handle edit patient
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setEditFormData({
      name: patient.name || patient.nama || '',
      nik: patient.nik || '',
      birth_date: patient.birth_date || patient.tanggal_lahir || '',
      gender: (patient.gender || patient.jenis_kelamin || 'L') as 'L' | 'P',
      phone: patient.phone || patient.telepon || '',
      address: patient.address || patient.alamat || '',
      emergency_contact: patient.emergency_contact || patient.kontak_darurat || ''
    })
    setEditFormErrors([])
    setShowEditModal(true)
  }

  // Handle edit form submission
  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateEditPatient(editFormData)
    if (errors.length > 0) {
      setEditFormErrors(errors)
      return
    }

    if (!selectedPatient) return

    try {
      const response = await api.put(`/api/patients/${selectedPatient.id}`, editFormData)
      if (response.data.success) {
        alert('Data pasien berhasil diperbarui')
        setShowEditModal(false)
        fetchPatients()
      }
    } catch (error: any) {
      console.error('Error updating patient:', error)
      alert('Gagal memperbarui data pasien')
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-neutral-900 dark:to-slate-800 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Data Pasien (EMR)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Electronic Medical Records - Sistem rekam medis elektronik terintegrasi
        </p>
      </div>

      {/* Search */}
      <div className="bg-white/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIK, No. RM, atau telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">No. RM</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">TTL</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Kontak</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
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
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {patient.mrn || patient.no_rm || `RM${patient.id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {patient.name || patient.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.nik}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{patient.birth_date || patient.tanggal_lahir ? format(new Date(patient.birth_date || patient.tanggal_lahir!), 'dd/MM/yyyy', { locale: id }) : '-'}</div>
                        <div className="text-gray-500">{patient.gender || patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{patient.phone || patient.telepon || '-'}</div>
                        <div className="text-gray-500">{patient.emergency_contact || patient.kontak_darurat || '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'active' || patient.status === 'aktif'
                          ? 'bg-green-100 text-green-700'
                          : patient.status === 'inactive' || patient.status === 'tidak_aktif'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {patient.status === 'active' || patient.status === 'aktif' ? 'Aktif' :
                         patient.status === 'inactive' || patient.status === 'tidak_aktif' ? 'Tidak Aktif' :
                         patient.status === 'meninggal' ? 'Meninggal' : patient.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewEMR(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat EMR"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Biodata"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <FaSearch className="mx-auto text-3xl mb-2 opacity-50" />
                    <p>Tidak ada data pasien ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMR Detail Modal */}
      {showEMRModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  EMR - {selectedPatient.name || selectedPatient.nama}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  No. RM: {selectedPatient.mrn || selectedPatient.no_rm || `RM${selectedPatient.id}`}
                </p>
              </div>
              <button
                onClick={() => setShowEMRModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Tutup modal EMR"
                title="Tutup"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <FaUser className="text-sm" />
                    Biodata Pasien
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Nama:</span>
                      <span className="font-medium">{selectedPatient.name || selectedPatient.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">NIK:</span>
                      <span>{selectedPatient.nik}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">TTL:</span>
                      <span>
                        {selectedPatient.birth_date || selectedPatient.tanggal_lahir ? format(new Date(selectedPatient.birth_date || selectedPatient.tanggal_lahir!), 'dd MMMM yyyy', { locale: id }) : '-'}
                        ({selectedPatient.gender || selectedPatient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Telepon:</span>
                      <span>{selectedPatient.phone || selectedPatient.telepon || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Kontak Darurat:</span>
                      <span>{selectedPatient.emergency_contact || selectedPatient.kontak_darurat || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Alamat</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPatient.address || selectedPatient.alamat || 'Alamat tidak tersedia'}
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center text-gray-500">
                <p>🛠️ Fitur EMR lengkap akan dikembangkan berdasarkan kebutuhan klinis</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Edit Biodata Pasien</h2>

            <form onSubmit={onEditSubmit} className="space-y-6">
              {editFormErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <ul className="text-red-700 dark:text-red-300 text-sm">
                    {editFormErrors.map((error, index) => (
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
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    value={editFormData.nik}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, nik: e.target.value }))}
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
                    value={editFormData.birth_date}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, gender: e.target.value as 'L' | 'P' }))}
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
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Masukkan no. telepon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kontak Darurat
                  </label>
                  <input
                    type="tel"
                    value={editFormData.emergency_contact}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="No. telepon kontak darurat"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat
                </label>
                <textarea
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Simpan Perubahan
                </button>

                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
