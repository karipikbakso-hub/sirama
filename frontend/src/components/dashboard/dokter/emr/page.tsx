'use client'

import { useState } from 'react'
import { MdSearch, MdPerson, MdLocalHospital, MdNoteAlt, MdSave, MdEdit, MdRefresh, MdAdd } from 'react-icons/md'
import { useQuery } from '@tanstack/react-query'
import apiAuth from '@/lib/apiAuth'
import { Patient } from '@/hooks/useEmr'

export default function EMRPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Fetch patients data using React Query
  const { data: patientsData, isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      params.append('per_page', '50')

      const response = await apiAuth.get(`/patients?${params}`)
      return response.data.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Rekam Medis Elektronik (EMR) - Standar Kemenkes
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Sistem EMR sesuai pedoman Kementerian Kesehatan RI
        </div>
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
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MdSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari pasien berdasarkan nama atau MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {/* Patient List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {patientsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">Memuat data pasien...</p>
                </div>
              ) : patientsError ? (
                <div className="text-center py-4">
                  <p className="text-red-500 dark:text-red-400">Gagal memuat data pasien</p>
                </div>
              ) : (
                patientsData?.data?.map((patient: Patient) => (
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
                        <p className="font-medium text-gray-800 dark:text-white">{patient.nama}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {patient.mrn} • {patient.umur} tahun
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* EMR Content */}
        <div className="lg:col-span-3">
          {selectedPatient ? (
            <EMRContent patient={selectedPatient} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-12">
                <MdLocalHospital className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Pilih Pasien
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Klik pada pasien di sebelah kiri untuk melihat rekam medis elektronik lengkap
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EMRContent({ patient }: { patient: any }) {
  const [activeSection, setActiveSection] = useState('summary')

  const sections = [
    { id: 'summary', label: 'Ringkasan Pasien', icon: MdPerson, roles: ['all'] },
    { id: 'diagnosis', label: 'Diagnosis', icon: MdNoteAlt, roles: ['dokter'] },
    { id: 'vitals', label: 'Tanda Vital', icon: MdPerson, roles: ['perawat', 'dokter'] },
    { id: 'medications', label: 'Obat & Resep', icon: MdNoteAlt, roles: ['dokter', 'apoteker'] },
    { id: 'lab', label: 'Hasil Lab', icon: MdLocalHospital, roles: ['laboratorium', 'dokter'] },
    { id: 'radiology', label: 'Radiologi', icon: MdLocalHospital, roles: ['radiologi', 'dokter'] },
    { id: 'procedures', label: 'Tindakan', icon: MdNoteAlt, roles: ['dokter'] },
    { id: 'progress', label: 'Catatan Perkembangan', icon: MdEdit, roles: ['dokter', 'perawat'] },
    { id: 'allergies', label: 'Alergi & Peringatan', icon: MdNoteAlt, roles: ['all'] },
    { id: 'discharge', label: 'Ringkasan Pulang', icon: MdSave, roles: ['dokter'] },
  ]

  // Mock user role - in real app this would come from auth context
  const userRole = 'dokter' // This should be dynamic based on logged in user

  const accessibleSections = sections.filter(section =>
    section.roles.includes('all') || section.roles.includes(userRole)
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Patient Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              EMR - {patient.nama || patient.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              MRN: {patient.mrn} • {patient.umur || patient.age} tahun • {(patient.jenis_kelamin || patient.gender) === 'L' ? 'Laki-laki' : 'Perempuan'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Terakhir update: {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <MdRefresh className="text-lg" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <MdSave className="text-lg" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 uppercase tracking-wide">
            EMR Sections
          </h3>
          <div className="space-y-1">
            {accessibleSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <section.icon className="text-lg" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Role Indicator */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Role Anda: <span className="font-semibold capitalize">{userRole}</span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'summary' && <EMRSummary patient={patient} />}
          {activeSection === 'diagnosis' && <EMRDiagnosis patient={patient} />}
          {activeSection === 'vitals' && <EMRVitals patient={patient} />}
          {activeSection === 'medications' && <EMRMedications patient={patient} />}
          {activeSection === 'lab' && <EMRLabResults patient={patient} />}
          {activeSection === 'radiology' && <EMRRadiology patient={patient} />}
          {activeSection === 'procedures' && <EMRProcedures patient={patient} />}
          {activeSection === 'progress' && <EMRProgressNotes patient={patient} />}
          {activeSection === 'allergies' && <EMRAllergies patient={patient} />}
          {activeSection === 'discharge' && <EMRDischarge patient={patient} />}
        </div>
      </div>
    </div>
  )
}

function EMROverview({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Ringkasan Pasien
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Diagnosis Utama</h4>
            <p className="text-gray-600 dark:text-gray-400">{patient.diagnosis}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Status</h4>
            <p className="text-green-600 dark:text-green-400">Aktif</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Kunjungan Terakhir
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada kunjungan tercatat untuk pasien ini.
          </p>
        </div>
      </div>
    </div>
  )
}

function EMRHistory({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Riwayat Kunjungan
      </h3>
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
        <MdLocalHospital className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">
          Belum ada riwayat kunjungan untuk pasien ini.
        </p>
      </div>
    </div>
  )
}

function EMRVitals({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Tanda Vital Terakhir
      </h3>
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
        <MdPerson className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">
          Belum ada data tanda vital untuk pasien ini.
        </p>
      </div>
    </div>
  )
}

function EMRMedications({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Obat & Resep
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="text-lg" />
          Tambah Resep
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Medications */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Obat Aktif</h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Amlodipine 5mg</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1 tablet sehari • 30 hari</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dr. Ahmad Surya • 01/11/2025</p>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medication History */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Riwayat Resep</h4>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Paracetamol 500mg</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3x sehari • 5 hari</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dr. Ahmad Surya • 15/10/2025</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                  Selesai
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// New EMR Section Components
function EMRSummary({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Ringkasan Pasien
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient Info */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Informasi Pasien</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tanggal Lahir:</span>
              <span className="text-gray-800 dark:text-white">15 Mei 1990</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Umur:</span>
              <span className="text-gray-800 dark:text-white">{patient.umur || patient.age} tahun</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Golongan Darah:</span>
              <span className="text-gray-800 dark:text-white">O+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">No. BPJS:</span>
              <span className="text-gray-800 dark:text-white">{patient.bpjs_number || '-'}</span>
            </div>
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Ringkasan Klinis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Diagnosis Utama:</span>
              <span className="text-gray-800 dark:text-white">Hipertensi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-green-600 dark:text-green-400">Aktif</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Kunjungan:</span>
              <span className="text-gray-800 dark:text-white">12 kali</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Terakhir:</span>
              <span className="text-gray-800 dark:text-white">01/11/2025</span>
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Tanda Vital Terakhir</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">TD:</span>
              <span className="text-gray-800 dark:text-white">120/80 mmHg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">HR:</span>
              <span className="text-gray-800 dark:text-white">72 bpm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Temp:</span>
              <span className="text-gray-800 dark:text-white">36.5°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">RR:</span>
              <span className="text-gray-800 dark:text-white">16/min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Aksi Cepat</h4>
        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            Buat CPPT
          </button>
          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
            Pesan Lab
          </button>
          <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
            Rujuk Spesialis
          </button>
        </div>
      </div>
    </div>
  )
}

function EMRDiagnosis({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Diagnosis (ICD-10)
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="text-lg" />
          Tambah Diagnosis
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">I10 - Hipertensi Esensial (Primer)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Essential (primary) hypertension</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                Aktif
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dr. Ahmad Surya • 01/11/2025</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              Diagnosis hipertensi grade 1 dengan TD 160/95 mmHg. Pasien mengeluh sakit kepala dan pusing.
              Diberikan antihipertensi dan monitoring tekanan darah.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">E11.9 - Diabetes Mellitus Tipe 2</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Type 2 diabetes mellitus without complications</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                Controlled
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dr. Ahmad Surya • 15/10/2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EMRLabResults({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Hasil Pemeriksaan Laboratorium
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="text-lg" />
          Pesan Lab Baru
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">Hematologi Lengkap</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Laboratorium Klinik • 01/11/2025</p>
            </div>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
              Normal
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">Hemoglobin</p>
              <p className="font-semibold text-gray-800 dark:text-white">14.2 g/dL</p>
              <p className="text-xs text-green-600 dark:text-green-400">Normal: 12-16</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">Leukosit</p>
              <p className="font-semibold text-gray-800 dark:text-white">8.5 × 10³/μL</p>
              <p className="text-xs text-green-600 dark:text-green-400">Normal: 4-11</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">Trombosit</p>
              <p className="font-semibold text-gray-800 dark:text-white">285 × 10³/μL</p>
              <p className="text-xs text-green-600 dark:text-green-400">Normal: 150-400</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">Kimia Darah</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Laboratorium Klinik • 01/11/2025</p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
              Perlu Perhatian
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">Glukosa Puasa</p>
              <p className="font-semibold text-gray-800 dark:text-white">145 mg/dL</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Normal: 100</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">Kolesterol Total</p>
              <p className="font-semibold text-gray-800 dark:text-white">220 mg/dL</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Normal: 200</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-gray-600 dark:text-gray-400">Creatinine</p>
              <p className="font-semibold text-gray-800 dark:text-white">1.1 mg/dL</p>
              <p className="text-xs text-green-600 dark:text-green-400">Normal: 0.7-1.3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EMRRadiology({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Hasil Pemeriksaan Radiologi
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="text-lg" />
          Pesan Radiologi
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">Chest X-Ray PA & Lateral</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Radiologi • 01/11/2025</p>
            </div>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
              Normal
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-2">Temuan:</h5>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Paru-paru tampak jelas tanpa adanya infiltrat, massa, atau efusi pleura.
                Jantung ukuran normal. Diafragma dan sinus kostodiafragma dalam batas normal.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-2">Kesimpulan:</h5>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Tidak tampak kelainan pada pemeriksaan thorax.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">USG Abdomen</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Radiologi • 15/10/2025</p>
            </div>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
              Normal
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-2">Temuan:</h5>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Hati ukuran normal, parenkim homogen. Kandung empedu normal tanpa batu.
                Pankreas tidak terlihat jelas. Ginjal kanan ukuran normal, korteks normal.
                Ginjal kiri ukuran normal, korteks normal.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-2">Kesimpulan:</h5>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Tidak tampak kelainan fokal pada organ abdomen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EMRProcedures({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Riwayat Tindakan Medis
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="text-lg" />
          Catat Tindakan
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">EKG (Elektrokardiografi)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jantung • 01/11/2025</p>
            </div>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
              Normal
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Indikasi:</strong> Evaluasi kardiovaskular pada hipertensi</p>
            <p><strong>Hasil:</strong> Ritme sinus regular, frekuensi 72 bpm. Tidak ada kelainan ST-T.
              QRS normal. Tidak ada hipertrofi ventrikel kiri.</p>
            <p><strong>Dokter:</strong> Dr. Ahmad Surya</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">Konsultasi Kardiologi</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spesialis Jantung • 15/10/2025</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              Konsultasi
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Indikasi:</strong> Hipertensi yang sulit dikontrol</p>
            <p><strong>Rekomendasi:</strong> Tambah ACE inhibitor, monitoring tekanan darah ketat,
              kontrol ulang 1 bulan</p>
            <p><strong>Spesialis:</strong> Dr. Budi Santoso, Sp.JP</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EMRProgressNotes({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Catatan Perkembangan
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="text-lg" />
          Tambah Catatan
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-white">Perkembangan Kondisi Pasien</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dr. Ahmad Surya • 01/11/2025 14:30</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              Dokter
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-1">Subjective:</h5>
              <p className="text-gray-700 dark:text-gray-300">
                Pasien mengatakan gejala sakit kepala berkurang setelah minum obat antihipertensi.
                Masih mengeluh sedikit pusing di pagi hari.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-1">Objective:</h5>
              <p className="text-gray-700 dark:text-gray-300">
                TD: 135/85 mmHg, HR: 70 bpm, RR: 16/min, Temp: 36.4°C.
                Tidak ada edema ekstremitas.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-1">Assessment:</h5>
              <p className="text-gray-700 dark:text-gray-300">
                Hipertensi terkendali dengan terapi saat ini.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 dark:text-white mb-1">Plan:</h5>
              <p className="text-gray-700 dark:text-gray-300">
                Lanjutkan terapi antihipertensi. Kontrol tekanan darah mingguan.
                Edukasi pola hidup sehat.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-white">Monitoring Tanda Vital</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ns. Siti Aminah • 01/11/2025 10:15</p>
            </div>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
              Perawat
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <p>Pagi hari: TD 140/90 mmHg, HR 75 bpm, Temp 36.6°C</p>
            <p>Siang hari: TD 135/85 mmHg, HR 72 bpm, Temp 36.4°C</p>
            <p>Sore hari: TD 130/80 mmHg, HR 70 bpm, Temp 36.3°C</p>
            <p className="text-gray-600 dark:text-gray-400 italic">
              Catatan: Pasien patuh minum obat. Tidak ada keluhan baru.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EMRAllergies({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Alergi & Peringatan Khusus
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <MdAdd className="text-lg" />
          Tambah Alergi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Allergies */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3">🚨 Alergi Obat</h4>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">Aspirin</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Reaksi: Biduran, sesak napas</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dicatat: 15/03/2023</p>
                </div>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded-full">
                  Berat
                </span>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">Penicillin</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Reaksi: Ruam kulit</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dicatat: 20/07/2024</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                  Ringan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Notes */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">📋 Catatan Khusus</h4>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-200">Status Kehamilan</h5>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Pasien sedang hamil trimester II. Hati-hati dengan obat kategori C.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update: 01/11/2025</p>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
              <h5 className="font-medium text-purple-800 dark:text-purple-200">Penyakit Kronik</h5>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Diabetes Mellitus Tipe 2. Monitor kadar gula darah ketat.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Diagnosa: 15/10/2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EMRDischarge({ patient }: { patient: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Ringkasan Pulang
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <MdAdd className="text-lg" />
          Buat Ringkasan
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
        <div className="text-center py-8">
          <MdNoteAlt className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            Belum Ada Ringkasan Pulang
          </h4>
          <p className="text-gray-500 dark:text-gray-500">
            Ringkasan pulang akan dibuat ketika pasien akan dipulangkan dari rumah sakit
          </p>
        </div>
      </div>

      {/* Template for future discharge summary */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hidden">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Template Ringkasan Pulang</h4>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Diagnosis Utama Saat Pulang:
            </label>
            <p className="text-gray-600 dark:text-gray-400">Hipertensi Grade 1, terkendali</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tindakan yang Telah Dilakukan:
            </label>
            <ul className="text-gray-600 dark:text-gray-400 list-disc list-inside">
              <li>Pemeriksaan fisik lengkap</li>
              <li>EKG dan laboratorium</li>
              <li>Terapi antihipertensi</li>
              <li>Edukasi pola hidup sehat</li>
            </ul>
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Obat yang Dianjurkan:
            </label>
            <ul className="text-gray-600 dark:text-gray-400 list-disc list-inside">
              <li>Amlodipine 5mg, 1 tablet sehari</li>
              <li>Aspirin 80mg, 1 tablet sehari</li>
            </ul>
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Anjuran Kontrol Kembali:
            </label>
            <p className="text-gray-600 dark:text-gray-400">2 minggu untuk kontrol tekanan darah</p>
          </div>
        </div>
      </div>
    </div>
  )
}
