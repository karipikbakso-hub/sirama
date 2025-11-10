'use client'

import { useState, useEffect } from 'react'
import { MdSearch, MdPerson, MdNoteAlt, MdSave, MdAdd, MdEdit, MdDelete, MdRefresh } from 'react-icons/md'

export default function CPPTPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [cpptData, setCpptData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch patients data
  useEffect(() => {
    fetchPatients()
  }, [])

  // Fetch CPPT data when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchCpptData(selectedPatient.id)
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/patients?per_page=50', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setPatients(data.data.data || [])
        setError(null)
      } else {
        throw new Error(data.message || 'Failed to fetch patients')
      }
    } catch (err) {
      setError('Failed to load patients')
      console.error('Error fetching patients:', err)
      // For demo purposes, set some mock data
      setPatients([
        { id: 1, nama: 'Ahmad Surya', mrn: 'MRN001', umur: 35, jenis_kelamin: 'L' },
        { id: 2, nama: 'Siti Aminah', mrn: 'MRN002', umur: 28, jenis_kelamin: 'P' },
        { id: 3, nama: 'Budi Santoso', mrn: 'MRN003', umur: 42, jenis_kelamin: 'L' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchCpptData = async (patientId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8000/api/doctor/cppt/${patientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setCpptData(data.data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch CPPT data')
      }
    } catch (err) {
      console.error('Error fetching CPPT data:', err)
      // For demo purposes, set some mock data
      setCpptData([
        {
          id: 1,
          tanggal_waktu: '2025-11-09 08:30:00',
          subjective: 'Pasien mengeluh sakit kepala dan pusing sejak 2 hari yang lalu',
          objective: 'TD: 160/95 mmHg, HR: 85 bpm, RR: 18/min, Temp: 36.8°C',
          assessment: 'Hipertensi grade 1',
          plan: 'Lanjutkan obat antihipertensi, kontrol tekanan darah mingguan',
          dokter: { nama: 'Dr. Ahmad Surya' }
        },
        {
          id: 2,
          tanggal_waktu: '2025-11-08 14:15:00',
          subjective: 'Pasien merasa lebih baik setelah minum obat',
          objective: 'TD: 145/90 mmHg, HR: 78 bpm, RR: 16/min, Temp: 36.5°C',
          assessment: 'Hipertensi terkendali',
          plan: 'Lanjutkan terapi, kontrol bulan depan',
          dokter: { nama: 'Dr. Ahmad Surya' }
        }
      ])
    }
  }

  const handleCreateCppt = async (formData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/doctor/cppt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({
          id_pasien: selectedPatient.id,
          id_dokter: 1, // This should come from authenticated user
          subjective: formData.subjective,
          objective: formData.objective,
          assessment: formData.assessment,
          plan: formData.plan,
          jenis_profesi: 'dokter'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Refresh CPPT data
        fetchCpptData(selectedPatient.id)
        setShowAddForm(false)
      } else {
        throw new Error(data.message || 'Failed to create CPPT entry')
      }
    } catch (err) {
      console.error('Error creating CPPT entry:', err)
      // For demo purposes, just close the modal
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
          Dokumentasi CPPT
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="text-lg" />
          Tambah CPPT
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

        {/* CPPT Content */}
        <div className="lg:col-span-3">
          {selectedPatient ? (
            <CPPTContent patient={selectedPatient} cpptData={cpptData} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-12">
                <MdNoteAlt className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Pilih Pasien
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Klik pada pasien di sebelah kiri untuk melihat dokumentasi CPPT
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add CPPT Modal */}
      {showAddForm && (
        <CPPTFormModal
          patient={selectedPatient}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleCreateCppt}
        />
      )}
    </div>
  )
}

function CPPTContent({ patient, cpptData }: { patient: any, cpptData: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Patient Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              CPPT - {patient.nama || patient.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              MRN: {patient.mrn} • {patient.umur || patient.age} tahun • {(patient.jenis_kelamin || patient.gender) === 'L' ? 'Laki-laki' : 'Perempuan'}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <MdAdd className="text-lg" />
              Tambah Entry
            </button>
          </div>
        </div>
      </div>

      {/* CPPT Entries */}
      <div className="p-6">
        <div className="space-y-4">
          {cpptData.map((entry) => (
            <CPPTEntry key={entry.id} entry={entry} />
          ))}
        </div>

        {cpptData.length === 0 && (
          <div className="text-center py-12">
            <MdNoteAlt className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Belum ada dokumentasi CPPT untuk pasien ini.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CPPTEntry({ entry }: { entry: any }) {
  // Format date and time from database
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const dateStr = date.toLocaleDateString('id-ID')
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return { date: dateStr, time: timeStr }
  }

  const { date, time } = formatDateTime(entry.tanggal_waktu || entry.created_at)

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {date} • {time}
          </div>
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {entry.dokter?.nama || 'Dokter'}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Edit CPPT entry"
            title="Edit"
          >
            <MdEdit className="text-lg" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Delete CPPT entry"
            title="Delete"
          >
            <MdDelete className="text-lg" />
          </button>
        </div>
      </div>

      {/* CPPT Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">S (Subjective)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {entry.subjective}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">O (Objective)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {entry.objective}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">A (Assessment)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {entry.assessment}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">P (Plan)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            {entry.plan}
          </p>
        </div>
      </div>
    </div>
  )
}

function CPPTFormModal({ patient, onClose, onSubmit }: { patient: any, onClose: () => void, onSubmit: (formData: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  })

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
              Tambah Dokumentasi CPPT
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Pasien: {patient?.name} ({patient?.mrn})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              S (Subjective) - Keluhan Pasien
            </label>
            <textarea
              value={formData.subjective}
              onChange={(e) => setFormData({...formData, subjective: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Jelaskan keluhan pasien..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              O (Objective) - Pemeriksaan Fisik
            </label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData({...formData, objective: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Hasil pemeriksaan fisik, tanda vital, dll..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              A (Assessment) - Diagnosis
            </label>
            <textarea
              value={formData.assessment}
              onChange={(e) => setFormData({...formData, assessment: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={2}
              placeholder="Diagnosis atau assessment..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              P (Plan) - Rencana Tindakan
            </label>
            <textarea
              value={formData.plan}
              onChange={(e) => setFormData({...formData, plan: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Rencana tindakan, terapi, follow-up..."
              required
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
              Simpan CPPT
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
