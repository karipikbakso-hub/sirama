'use client'

import { useState, useEffect } from 'react'
import { MdSearch, MdPerson, MdLocalHospital, MdAssignment, MdSave, MdAdd, MdEdit, MdRefresh } from 'react-icons/md'
import api from '@/lib/apiAuth'

export default function DiagnosisPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [diagnosisData, setDiagnosisData] = useState<any[]>([])
  const [icd10Codes, setIcd10Codes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch patients and ICD-10 data
  useEffect(() => {
    fetchPatients()
    fetchICD10Codes()
  }, [])

  // Fetch diagnosis data when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchDiagnosisData(selectedPatient.id)
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients?per_page=50')

      if (response.data.success) {
        setPatients(response.data.data.data || [])
      } else {
        throw new Error(response.data.message || 'Failed to fetch patients')
      }
    } catch (err: any) {
      console.error('Error fetching patients:', err)
      setPatients([
        { id: 1, nama: 'Ahmad Surya', mrn: 'MRN001', umur: 35, jenis_kelamin: 'L' },
        { id: 2, nama: 'Siti Aminah', mrn: 'MRN002', umur: 28, jenis_kelamin: 'P' },
        { id: 3, nama: 'Budi Santoso', mrn: 'MRN003', umur: 42, jenis_kelamin: 'L' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchICD10Codes = async () => {
    try {
      const response = await api.get('/api/icd10-diagnoses')

      if (response.data.success) {
        setIcd10Codes(response.data.data || [])
      } else {
        throw new Error(response.data.message || 'Failed to fetch ICD-10 codes')
      }
    } catch (err) {
      console.error('Error fetching ICD-10 codes:', err)
      setIcd10Codes([
        { kode_icd10: 'I10', nama_diagnosis: 'Hipertensi Esensial (Primer)' },
        { kode_icd10: 'E11.9', nama_diagnosis: 'Diabetes Melitus Tipe 2 Tanpa Komplikasi' },
        { kode_icd10: 'J45.9', nama_diagnosis: 'Asma Bronkial, Tidak Dinyatakan Lain' },
        { kode_icd10: 'J00', nama_diagnosis: 'Rinitis Akut (Common Cold)' },
        { kode_icd10: 'M54.5', nama_diagnosis: 'Nyeri Punggung Bawah' },
      ])
    }
  }

  const fetchDiagnosisData = async (patientId: number) => {
    try {
      const response = await api.get(`/api/doctor/diagnoses/${patientId}`)

      if (response.data.success) {
        setDiagnosisData(response.data.data || [])
      } else {
        throw new Error(response.data.message || 'Failed to fetch diagnosis data')
      }
    } catch (err) {
      console.error('Error fetching diagnosis data:', err)
      setDiagnosisData([
        {
          id: 1,
          tanggal_waktu: '2025-11-09 08:30:00',
          kode_icd10: 'I10',
          nama_diagnosis: 'Hipertensi Esensial (Primer)',
          tipe_diagnosis: 'Utama',
          status_diagnosis: 'Aktif',
          dokter: { nama: 'Dr. Ahmad Surya' }
        },
        {
          id: 2,
          tanggal_waktu: '2025-11-08 14:15:00',
          kode_icd10: 'E11.9',
          nama_diagnosis: 'Diabetes Melitus Tipe 2 Tanpa Komplikasi',
          tipe_diagnosis: 'Sekunder',
          status_diagnosis: 'Aktif',
          dokter: { nama: 'Dr. Ahmad Surya' }
        }
      ])
    }
  }

  const handleCreateDiagnosis = async (formData: any) => {
    try {
      const response = await api.post('/api/doctor/diagnoses', {
        id_pasien: selectedPatient.id,
        id_dokter: 1, // This should come from authenticated user
        kode_icd10: formData.icd10,
        nama_diagnosis: formData.diagnosis,
        tipe_diagnosis: formData.type,
        status_diagnosis: formData.status,
        catatan: formData.notes
      })

      if (response.data.success) {
        fetchDiagnosisData(selectedPatient.id)
        setShowAddForm(false)
      } else {
        throw new Error(response.data.message || 'Failed to create diagnosis')
      }
    } catch (err) {
      console.error('Error creating diagnosis:', err)
      setShowAddForm(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    (patient.nama || patient.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Diagnosis Pasien
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="text-lg" />
          Tambah Diagnosis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Search & List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Cari Pasien
            </h2>

            {/* Search Input */}
            <div className="relative mb-4">
              <MdSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Patient List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MdPerson className="text-xl text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">{patient.nama || patient.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {patient.mrn} • {(patient.umur || patient.age)}th
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {patient.diagnosis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnosis Content */}
        <div className="lg:col-span-3">
          {selectedPatient ? (
            <DiagnosisContent patient={selectedPatient} diagnosisData={diagnosisData} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-12">
                <MdAssignment className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Pilih Pasien
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Klik pada pasien di sebelah kiri untuk melihat diagnosis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Diagnosis Modal */}
      {showAddForm && (
        <DiagnosisFormModal
          patient={selectedPatient}
          icd10Codes={icd10Codes}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleCreateDiagnosis}
        />
      )}
    </div>
  )
}

function DiagnosisContent({ patient, diagnosisData }: { patient: any, diagnosisData: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Patient Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Diagnosis - {patient.nama || patient.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              MRN: {patient.mrn} • {patient.umur || patient.age} tahun • {(patient.jenis_kelamin || patient.gender) === 'L' ? 'Laki-laki' : 'Perempuan'}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <MdAdd className="text-lg" />
              Tambah Diagnosis
            </button>
          </div>
        </div>
      </div>

      {/* Diagnosis List */}
      <div className="p-6">
        <div className="space-y-4">
          {diagnosisData.map((diagnosis) => (
            <DiagnosisEntry key={diagnosis.id} diagnosis={diagnosis} />
          ))}
        </div>

        {diagnosisData.length === 0 && (
          <div className="text-center py-12">
            <MdAssignment className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Belum ada diagnosis untuk pasien ini.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DiagnosisEntry({ diagnosis }: { diagnosis: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Sembuh': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Kronik': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Utama': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'Sekunder': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'Komplikasi': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Format date and time from database
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const dateStr = date.toLocaleDateString('id-ID')
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return { date: dateStr, time: timeStr }
  }

  const { date, time } = formatDateTime(diagnosis.tanggal_waktu || diagnosis.created_at)

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {date} • {time}
          </div>
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {diagnosis.dokter?.nama || 'Dokter'}
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(diagnosis.tipe_diagnosis || diagnosis.type)}`}>
            {diagnosis.tipe_diagnosis || diagnosis.type}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(diagnosis.status_diagnosis || diagnosis.status)}`}>
            {diagnosis.status_diagnosis || diagnosis.status}
          </span>
          <button
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Edit diagnosis"
            title="Edit"
          >
            <MdEdit className="text-lg" />
          </button>
        </div>
      </div>

      {/* Diagnosis Content */}
      <div className="space-y-3">
        <div>
          <span className="font-medium text-gray-800 dark:text-white">ICD-10: </span>
          <span className="text-blue-600 dark:text-blue-400 font-mono">{diagnosis.kode_icd10 || diagnosis.icd10}</span>
        </div>
        <div>
          <span className="font-medium text-gray-800 dark:text-white">Diagnosis: </span>
          <span className="text-gray-700 dark:text-gray-300">{diagnosis.nama_diagnosis || diagnosis.diagnosis}</span>
        </div>
      </div>
    </div>
  )
}

function DiagnosisFormModal({ patient, icd10Codes, onClose, onSubmit }: { patient: any, icd10Codes: any[], onClose: () => void, onSubmit: (formData: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    icd10: '',
    diagnosis: '',
    type: 'Utama',
    status: 'Aktif',
    notes: ''
  })

  const [searchICD, setSearchICD] = useState('')
  const [showICDDropdown, setShowICDDropdown] = useState(false)

  const filteredICD = icd10Codes.filter(code =>
    (code.kode_icd10 || code.code)?.toLowerCase().includes(searchICD.toLowerCase()) ||
    (code.nama_diagnosis || code.description)?.toLowerCase().includes(searchICD.toLowerCase())
  )

  const handleICDSelect = (code: any) => {
    setFormData({
      ...formData,
      icd10: code.kode_icd10 || code.code,
      diagnosis: code.nama_diagnosis || code.description
    })
    setShowICDDropdown(false)
    setSearchICD('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Tambah Diagnosis
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Pasien: {patient?.nama || patient?.name} ({patient?.mrn})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ICD-10 Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kode ICD-10
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchICD}
                onChange={(e) => {
                  setSearchICD(e.target.value)
                  setShowICDDropdown(true)
                }}
                onFocus={() => setShowICDDropdown(true)}
                placeholder="Cari kode ICD-10..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {showICDDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredICD.map((code) => (
                    <div
                      key={code.kode_icd10 || code.code}
                      onClick={() => handleICDSelect(code)}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="font-mono text-blue-600 dark:text-blue-400">{code.kode_icd10 || code.code}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{code.nama_diagnosis || code.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected ICD-10 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagnosis
            </label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Deskripsi diagnosis..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipe Diagnosis
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                aria-label="Tipe Diagnosis"
              >
                <option value="Utama">Utama</option>
                <option value="Sekunder">Sekunder</option>
                <option value="Komplikasi">Komplikasi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                aria-label="Status Diagnosis"
              >
                <option value="Aktif">Aktif</option>
                <option value="Sembuh">Sembuh</option>
                <option value="Kronik">Kronik</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan Tambahan
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MdSave className="text-lg" />
              Simpan Diagnosis
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
