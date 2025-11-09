'use client'

import { useState } from 'react'
import { FaPrescription, FaSearch, FaPlus, FaEdit, FaTrash, FaPrint, FaPills } from 'react-icons/fa'

type Prescription = {
  id: number
  prescriptionNumber: string
  patient: string
  date: string
  doctor: string
  status: 'active' | 'completed' | 'cancelled'
  medications: Medication[]
}

type Medication = {
  name: string
  dosage: string
  frequency: string
  duration: string
}

const initialData: Prescription[] = [
  {
    id: 1,
    prescriptionNumber: 'RX-2025-001',
    patient: 'Budi Santoso',
    date: '2025-11-05',
    doctor: 'dr. Andi Prasetyo',
    status: 'active',
    medications: [
      { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: '3x sehari', duration: '5 hari' },
      { name: 'Amoxicillin 250mg', dosage: '1 kapsul', frequency: '2x sehari', duration: '7 hari' }
    ]
  },
  {
    id: 2,
    prescriptionNumber: 'RX-2025-002',
    patient: 'Dewi Lestari',
    date: '2025-11-04',
    doctor: 'dr. Andi Prasetyo',
    status: 'completed',
    medications: [
      { name: 'Metformin 500mg', dosage: '1 tablet', frequency: '2x sehari', duration: '30 hari' },
      { name: 'Glimepiride 2mg', dosage: '1 tablet', frequency: '1x sehari', duration: '30 hari' }
    ]
  },
  {
    id: 3,
    prescriptionNumber: 'RX-2025-003',
    patient: 'Andi Prasetyo',
    date: '2025-11-03',
    doctor: 'dr. Andi Prasetyo',
    status: 'active',
    medications: [
      { name: 'Sumatriptan 50mg', dosage: '1 tablet', frequency: 'Jika sakit kepala', duration: '7 hari' }
    ]
  }
]

export default function PrescriptionPage() {
  const [prescriptions] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'completed': return 'Selesai'
      case 'cancelled': return 'Dibatalkan'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 tracking-wide flex items-center gap-3">
        <FaPrescription className="text-blue-500" />
        Manajemen Resep
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari resep..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center gap-2">
            <FaPlus />
            Buat Resep Baru
          </button>
        </div>

        <div className="space-y-4">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((prescription) => (
              <div 
                key={prescription.id} 
                className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
              >
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{prescription.prescriptionNumber}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{prescription.patient}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(prescription.status)}`}>
                      {getStatusText(prescription.status)}
                    </span>
                    <div className="space-x-2">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaPrint />
                      </button>
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEdit />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Tanggal:</span>
                    <span className="ml-2 font-medium">{prescription.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Dokter:</span>
                    <span className="ml-2 font-medium">{prescription.doctor}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FaPills className="text-blue-500" />
                    Obat yang Diresepkan:
                  </h4>
                  <div className="space-y-2">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="flex flex-wrap gap-2 text-sm bg-gray-50 dark:bg-zinc-800 p-2 rounded">
                        <div className="font-medium">{med.name}</div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {med.dosage} | {med.frequency} | {med.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaPrescription className="mx-auto text-4xl mb-2" />
              <p>Tidak ada resep yang ditemukan</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Statistik Resep</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Resep</span>
              <span className="font-bold">{prescriptions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Aktif</span>
              <span className="font-bold text-blue-500">
                {prescriptions.filter(p => p.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Selesai</span>
              <span className="font-bold text-green-500">
                {prescriptions.filter(p => p.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dibatalkan</span>
              <span className="font-bold text-red-500">
                {prescriptions.filter(p => p.status === 'cancelled').length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Obat Paling Sering Diresepkan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                  <th className="py-2">Nama Obat</th>
                  <th>Jumlah Resep</th>
                  <th>Frekuensi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <td className="py-2">Paracetamol 500mg</td>
                  <td>15</td>
                  <td>3x sehari</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <td className="py-2">Amoxicillin 250mg</td>
                  <td>12</td>
                  <td>2x sehari</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <td className="py-2">Metformin 500mg</td>
                  <td>10</td>
                  <td>2x sehari</td>
                </tr>
                <tr>
                  <td className="py-2">Losartan 50mg</td>
                  <td>8</td>
                  <td>1x sehari</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}