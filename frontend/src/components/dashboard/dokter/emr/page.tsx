'use client'

import { useState } from 'react'
import { MdSearch, MdPerson, MdLocalHospital, MdNoteAlt, MdSave, MdEdit } from 'react-icons/md'

export default function EMRPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  // Mock patient data
  const patients = [
    { id: 1, name: 'Ahmad Surya', mrn: 'MRN001', age: 35, gender: 'L', diagnosis: 'Hipertensi' },
    { id: 2, name: 'Siti Aminah', mrn: 'MRN002', age: 28, gender: 'P', diagnosis: 'Diabetes Melitus' },
    { id: 3, name: 'Budi Santoso', mrn: 'MRN003', age: 42, gender: 'L', diagnosis: 'Asma Bronkial' },
  ]

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Rekam Medis Elektronik (EMR)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <p className="font-medium text-gray-800 dark:text-white">{patient.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {patient.mrn} • {patient.age}th • {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Diagnosis: {patient.diagnosis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EMR Content */}
        <div className="lg:col-span-2">
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
                  Klik pada pasien di sebelah kiri untuk melihat rekam medis elektronik
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
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: MdNoteAlt },
    { id: 'history', label: 'Riwayat Kunjungan', icon: MdLocalHospital },
    { id: 'vitals', label: 'Tanda Vital', icon: MdPerson },
    { id: 'medications', label: 'Obat', icon: MdNoteAlt },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Patient Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {patient.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              MRN: {patient.mrn} • {patient.age} tahun • {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <MdEdit className="text-lg" />
              Edit EMR
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <MdSave className="text-lg" />
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <EMROverview patient={patient} />}
        {activeTab === 'history' && <EMRHistory patient={patient} />}
        {activeTab === 'vitals' && <EMRVitals patient={patient} />}
        {activeTab === 'medications' && <EMRMedications patient={patient} />}
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
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Riwayat Pengobatan
      </h3>
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
        <MdNoteAlt className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">
          Belum ada riwayat pengobatan untuk pasien ini.
        </p>
      </div>
    </div>
  )
}
