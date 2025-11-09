'use client'

import { useState } from 'react'
import { FaUser, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type Employee = {
  id: number
  name: string
  employeeId: string
  position: string
  department: string
  status: 'active' | 'inactive' | 'on-leave'
}

const initialData: Employee[] = [
  {
    id: 1,
    name: 'Budi Santoso',
    employeeId: 'EMP-2025-001',
    position: 'Dokter Umum',
    department: 'Rawat Jalan',
    status: 'active'
  },
  {
    id: 2,
    name: 'Dewi Lestari',
    employeeId: 'EMP-2025-002',
    position: 'Perawat',
    department: 'Rawat Inap',
    status: 'active'
  },
  {
    id: 3,
    name: 'Andi Prasetyo',
    employeeId: 'EMP-2025-003',
    position: 'Apoteker',
    department: 'Farmasi',
    status: 'on-leave'
  },
  {
    id: 4,
    name: 'Siti Rahayu',
    employeeId: 'EMP-2025-004',
    position: 'Administrasi',
    department: 'Keuangan',
    status: 'active'
  },
  {
    id: 5,
    name: 'Joko Susilo',
    employeeId: 'EMP-2025-005',
    position: 'Laboran',
    department: 'Laboratorium',
    status: 'inactive'
  }
]

export default function DataPegawaiPage() {
  const [employees] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'on-leave': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Nonaktif'
      case 'on-leave': return 'Cuti'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaUser className="text-blue-500" />
        <span className="truncate">Data Pegawai</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pegawai..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaUser />
            <span className="hidden sm:inline">Tambah Pegawai</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama</th>
                <th className="px-2 hidden md:table-cell">ID Pegawai</th>
                <th className="px-2">Jabatan</th>
                <th className="px-2 hidden sm:table-cell">Departemen</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{employee.name}</span>
                      <span className="text-xs text-gray-500 md:hidden">{employee.employeeId}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{employee.employeeId}</td>
                  <td className="px-2">{employee.position}</td>
                  <td className="px-2 hidden sm:table-cell">{employee.department}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEye />
                      </button>
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEdit />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaUser className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data pegawai yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Pegawai</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Aktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Nonaktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {employees.filter(e => e.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Cuti</p>
              <p className="text-lg md:text-2xl font-bold">
                {employees.filter(e => e.status === 'on-leave').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Pegawai</p>
              <p className="text-lg md:text-2xl font-bold">{employees.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Departemen</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Rawat Jalan</span>
              <span className="font-bold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rawat Inap</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Farmasi</span>
              <span className="font-bold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Laboratorium</span>
              <span className="font-bold">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}