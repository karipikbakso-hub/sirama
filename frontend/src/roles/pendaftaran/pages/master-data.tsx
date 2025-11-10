'use client'

import { useState, useEffect } from 'react'
import {
  FaDatabase,
  FaUserMd,
  FaStethoscope,
  FaHospital,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa'
import { useAuthContext } from '@/hooks/AuthContext'
import api from '@/lib/apiAuth'

// Types - Updated to match Indonesian field names from backend
type Doctor = {
  id: number
  nama_dokter: string
  spesialisasi: string
  no_sip: string
  telepon?: string
  email?: string
  status: string
  aktif?: boolean
  created_at: string
}

type Medicine = {
  id: number
  nama_obat: string
  nama_generik?: string
  golongan_obat?: string
  satuan?: string
  stok?: number
  status: string
  aktif?: boolean
}

type ICD10Diagnosis = {
  id: number
  kode_icd: string
  nama_diagnosa: string
  kategori?: string
  status: string
  aktif?: boolean
}

type Statistics = {
  total_doctors: number
  active_doctors: number
  total_medicines: number
  active_medicines: number
  total_icd10: number
  active_icd10: number
}

export default function MasterDataPage() {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<'doctors' | 'medicines' | 'icd10'>('doctors')
  const [statistics, setStatistics] = useState<Statistics | null>(null)

  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [doctorSearch, setDoctorSearch] = useState('')
  const [showDoctorForm, setShowDoctorForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

  // Medicines state
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [medicinesLoading, setMedicinesLoading] = useState(false)
  const [medicineSearch, setMedicineSearch] = useState('')
  const [showMedicineForm, setShowMedicineForm] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)

  // ICD-10 state
  const [icd10Diagnoses, setIcd10Diagnoses] = useState<ICD10Diagnosis[]>([])
  const [icd10Loading, setIcd10Loading] = useState(false)
  const [icd10Search, setIcd10Search] = useState('')
  const [showIcd10Form, setShowIcd10Form] = useState(false)
  const [editingIcd10, setEditingIcd10] = useState<ICD10Diagnosis | null>(null)

  // Form states
  const [formData, setFormData] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadStatistics()
    loadDoctors()
  }, [])

  // Load statistics
  const loadStatistics = async () => {
    try {
      const [doctorsStats, medicinesStats, icd10Stats] = await Promise.all([
        api.get('/api/doctors-statistics'),
        api.get('/api/medicines-statistics'),
        api.get('/api/icd10-diagnoses-statistics')
      ])

      setStatistics({
        total_doctors: doctorsStats.data.data.total_doctors || 0,
        active_doctors: doctorsStats.data.data.active_doctors || 0,
        total_medicines: medicinesStats.data.data.total_medicines || 0,
        active_medicines: medicinesStats.data.data.active_medicines || 0,
        total_icd10: icd10Stats.data.data.total_icd10 || 0,
        active_icd10: icd10Stats.data.data.active_icd10 || 0,
      })
    } catch (err: any) {
      console.error('Error loading statistics:', err)
    }
  }

  // Load doctors
  const loadDoctors = async () => {
    setDoctorsLoading(true)
    try {
      const response = await api.get('/api/doctors')
      if (response.data.success) {
        setDoctors(response.data.data.data || [])
      }
    } catch (err: any) {
      setError('Failed to load doctors')
      console.error('Error loading doctors:', err)
    } finally {
      setDoctorsLoading(false)
    }
  }

  // Load medicines
  const loadMedicines = async () => {
    setMedicinesLoading(true)
    try {
      const response = await api.get('/api/medicines')
      if (response.data.success) {
        setMedicines(response.data.data.data || [])
      }
    } catch (err: any) {
      setError('Failed to load medicines')
      console.error('Error loading medicines:', err)
    } finally {
      setMedicinesLoading(false)
    }
  }

  // Load ICD-10 diagnoses
  const loadIcd10Diagnoses = async () => {
    setIcd10Loading(true)
    try {
      const response = await api.get('/api/icd10-diagnoses')
      if (response.data.success) {
        setIcd10Diagnoses(response.data.data.data || [])
      }
    } catch (err: any) {
      setError('Failed to load ICD-10 diagnoses')
      console.error('Error loading ICD-10 diagnoses:', err)
    } finally {
      setIcd10Loading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (tab: 'doctors' | 'medicines' | 'icd10') => {
    setActiveTab(tab)
    setError(null)
    setSuccess(null)

    if (tab === 'medicines' && medicines.length === 0) {
      loadMedicines()
    } else if (tab === 'icd10' && icd10Diagnoses.length === 0) {
      loadIcd10Diagnoses()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      let response
      const endpoint = activeTab === 'doctors' ? 'doctors' :
                      activeTab === 'medicines' ? 'medicines' : 'icd10-diagnoses'

      if (editingDoctor || editingMedicine || editingIcd10) {
        const id = editingDoctor?.id || editingMedicine?.id || editingIcd10?.id
        response = await api.put(`/api/${endpoint}/${id}`, formData)
      } else {
        response = await api.post(`/api/${endpoint}`, formData)
      }

      if (response.data.success) {
        setSuccess(`${activeTab === 'doctors' ? 'Dokter' : activeTab === 'medicines' ? 'Obat' : 'Diagnosis ICD-10'} berhasil ${editingDoctor || editingMedicine || editingIcd10 ? 'diupdate' : 'ditambahkan'}`)

        // Refresh data
        if (activeTab === 'doctors') loadDoctors()
        else if (activeTab === 'medicines') loadMedicines()
        else loadIcd10Diagnoses()

        loadStatistics()

        // Reset form
        setShowDoctorForm(false)
        setShowMedicineForm(false)
        setShowIcd10Form(false)
        setEditingDoctor(null)
        setEditingMedicine(null)
        setEditingIcd10(null)
        setFormData({})
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan')
      console.error('Error submitting form:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: number, type: 'doctors' | 'medicines' | 'icd10-diagnoses') => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return

    try {
      const response = await api.delete(`/api/${type}/${id}`)
      if (response.data.success) {
        setSuccess('Data berhasil dihapus')

        // Refresh data
        if (type === 'doctors') loadDoctors()
        else if (type === 'medicines') loadMedicines()
        else loadIcd10Diagnoses()

        loadStatistics()
      }
    } catch (err: any) {
      setError('Failed to delete data')
      console.error('Error deleting data:', err)
    }
  }

  // Filter data based on search
  const filteredDoctors = doctors.filter(doctor =>
    (doctor.nama_dokter?.toLowerCase() || '').includes(doctorSearch.toLowerCase()) ||
    (doctor.spesialisasi?.toLowerCase() || '').includes(doctorSearch.toLowerCase()) ||
    (doctor.no_sip?.toLowerCase() || '').includes(doctorSearch.toLowerCase())
  )

  const filteredMedicines = medicines.filter(medicine =>
    (medicine.nama_obat?.toLowerCase() || '').includes(medicineSearch.toLowerCase()) ||
    (medicine.nama_generik?.toLowerCase() || '').includes(medicineSearch.toLowerCase())
  )

  const filteredIcd10 = icd10Diagnoses.filter(diagnosis =>
    (diagnosis.kode_icd?.toLowerCase() || '').includes(icd10Search.toLowerCase()) ||
    (diagnosis.nama_diagnosa?.toLowerCase() || '').includes(icd10Search.toLowerCase())
  )

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaDatabase className="text-blue-500" />
        <span>Master Data Management</span>
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{statistics?.total_doctors || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Dokter</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{statistics?.active_doctors || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Dokter Aktif</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">{statistics?.total_medicines || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Obat</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">{statistics?.active_medicines || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Obat Aktif</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">{statistics?.total_icd10 || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total ICD-10</div>
        </div>
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-teal-600 mb-1">{statistics?.active_icd10 || 0}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">ICD-10 Aktif</div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2">
          <FaTimesCircle className="text-red-600" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          <span className="text-green-800 dark:text-green-200">{success}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleTabChange('doctors')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'doctors'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FaUserMd />
            Data Dokter
          </button>
          <button
            onClick={() => handleTabChange('medicines')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'medicines'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FaStethoscope />
            Data Obat
          </button>
          <button
            onClick={() => handleTabChange('icd10')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'icd10'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FaHospital />
            ICD-10 Diagnosis
          </button>
        </div>

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari dokter..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
              </div>
              <button
                onClick={() => setShowDoctorForm(true)}
                className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <FaPlus />
                Tambah Dokter
              </button>
            </div>

            {doctorsLoading ? (
              <div className="text-center py-8">
                <FaSpinner className="mx-auto text-2xl text-blue-500 animate-spin mb-2" />
                <p>Loading doctors...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left">Nama</th>
                      <th className="px-4 py-3 text-left">Spesialisasi</th>
                      <th className="px-4 py-3 text-left">No. SIP</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-3">{doctor.nama_dokter}</td>
                        <td className="px-4 py-3">{doctor.spesialisasi}</td>
                        <td className="px-4 py-3 font-mono">{doctor.no_sip}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doctor.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.aktif ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingDoctor(doctor)
                                setFormData(doctor)
                                setShowDoctorForm(true)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              aria-label="Edit dokter"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(doctor.id, 'doctors')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              aria-label="Hapus dokter"
                            >
                              <FaTrash />
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
        )}

        {/* Medicines Tab */}
        {activeTab === 'medicines' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari obat..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
              </div>
              <button
                onClick={() => setShowMedicineForm(true)}
                className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
              >
                <FaPlus />
                Tambah Obat
              </button>
            </div>

            {medicinesLoading ? (
              <div className="text-center py-8">
                <FaSpinner className="mx-auto text-2xl text-purple-500 animate-spin mb-2" />
                <p>Loading medicines...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left">Nama Obat</th>
                      <th className="px-4 py-3 text-left">Nama Generik</th>
                      <th className="px-4 py-3 text-left">Kategori</th>
                      <th className="px-4 py-3 text-left">Stok</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((medicine) => (
                      <tr key={medicine.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-3">{medicine.nama_obat}</td>
                        <td className="px-4 py-3">{medicine.nama_generik || '-'}</td>
                        <td className="px-4 py-3">{medicine.golongan_obat || '-'}</td>
                        <td className="px-4 py-3">{medicine.stok || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            medicine.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {medicine.aktif ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingMedicine(medicine)
                                setFormData(medicine)
                                setShowMedicineForm(true)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              aria-label="Edit obat"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(medicine.id, 'medicines')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              aria-label="Hapus obat"
                            >
                              <FaTrash />
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
        )}

        {/* ICD-10 Tab */}
        {activeTab === 'icd10' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari diagnosis..."
                  value={icd10Search}
                  onChange={(e) => setIcd10Search(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
              </div>
              <button
                onClick={() => setShowIcd10Form(true)}
                className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <FaPlus />
                Tambah Diagnosis
              </button>
            </div>

            {icd10Loading ? (
              <div className="text-center py-8">
                <FaSpinner className="mx-auto text-2xl text-green-500 animate-spin mb-2" />
                <p>Loading ICD-10 diagnoses...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left">Kode</th>
                      <th className="px-4 py-3 text-left">Deskripsi</th>
                      <th className="px-4 py-3 text-left">Bab</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIcd10.map((diagnosis) => (
                      <tr key={diagnosis.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-3 font-mono">{diagnosis.kode_icd}</td>
                        <td className="px-4 py-3">{diagnosis.nama_diagnosa}</td>
                        <td className="px-4 py-3">{diagnosis.kategori || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            diagnosis.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {diagnosis.aktif ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingIcd10(diagnosis)
                                setFormData(diagnosis)
                                setShowIcd10Form(true)
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              aria-label="Edit diagnosis ICD-10"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(diagnosis.id, 'icd10-diagnoses')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              aria-label="Hapus diagnosis ICD-10"
                            >
                              <FaTrash />
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
        )}
      </div>

      {/* Doctor Form Modal */}
      {showDoctorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingDoctor ? 'Edit Dokter' : 'Tambah Dokter Baru'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      value={formData.nama_dokter || ''}
                      onChange={(e) => setFormData({...formData, nama_dokter: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan nama lengkap dokter"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Spesialisasi *</label>
                    <input
                      type="text"
                      value={formData.spesialisasi || ''}
                      onChange={(e) => setFormData({...formData, spesialisasi: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan spesialisasi dokter"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nomor SIP *</label>
                    <input
                      type="text"
                      value={formData.no_sip || ''}
                      onChange={(e) => setFormData({...formData, no_sip: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan nomor SIP"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telepon</label>
                    <input
                      type="text"
                      value={formData.telepon || ''}
                      onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan alamat email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status *</label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      aria-label="Status dokter"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="retired">Pensiun</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorForm(false)
                      setEditingDoctor(null)
                      setFormData({})
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? <FaSpinner className="animate-spin mx-auto" /> : (editingDoctor ? 'Update' : 'Simpan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Form Modal */}
      {showMedicineForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingMedicine ? 'Edit Obat' : 'Tambah Obat Baru'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Obat *</label>
                    <input
                      type="text"
                      value={formData.nama_obat || ''}
                      onChange={(e) => setFormData({...formData, nama_obat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan nama obat"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Generik</label>
                    <input
                      type="text"
                      value={formData.nama_generik || ''}
                      onChange={(e) => setFormData({...formData, nama_generik: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan nama generik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Golongan Obat</label>
                    <input
                      type="text"
                      value={formData.golongan_obat || ''}
                      onChange={(e) => setFormData({...formData, golongan_obat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan golongan obat"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Satuan</label>
                    <input
                      type="text"
                      value={formData.satuan || ''}
                      onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan satuan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status *</label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      aria-label="Status obat"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="retired">Pensiun</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMedicineForm(false)
                      setEditingMedicine(null)
                      setFormData({})
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? <FaSpinner className="animate-spin mx-auto" /> : (editingMedicine ? 'Update' : 'Simpan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ICD-10 Form Modal */}
      {showIcd10Form && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingIcd10 ? 'Edit Diagnosis ICD-10' : 'Tambah Diagnosis ICD-10 Baru'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kode ICD-10 *</label>
                    <input
                      type="text"
                      value={formData.kode_icd || ''}
                      onChange={(e) => setFormData({...formData, kode_icd: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan kode ICD-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi *</label>
                    <textarea
                      value={formData.nama_diagnosa || ''}
                      onChange={(e) => setFormData({...formData, nama_diagnosa: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan deskripsi diagnosis"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bab/Kelompok</label>
                    <input
                      type="text"
                      value={formData.kategori || ''}
                      onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      placeholder="Masukkan bab atau kelompok"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status *</label>
                    <select
                      value={formData.aktif !== undefined ? (formData.aktif ? 'active' : 'inactive') : 'active'}
                      onChange={(e) => setFormData({...formData, aktif: e.target.value === 'active'})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      aria-label="Status diagnosis ICD-10"
                      title="Status diagnosis ICD-10"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIcd10Form(false)
                      setEditingIcd10(null)
                      setFormData({})
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? <FaSpinner className="animate-spin mx-auto" /> : (editingIcd10 ? 'Update' : 'Simpan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
