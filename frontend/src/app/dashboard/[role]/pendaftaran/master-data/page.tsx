'use client'

import { useState } from 'react'
import { FaDatabase, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaDownload, FaUpload } from 'react-icons/fa'

// Mock data for master data categories
const mockMasterDataCategories = [
  {
    id: 1,
    name: 'Poli/Klinik',
    count: 12,
    lastUpdated: '2025-01-15',
    description: 'Daftar poli dan klinik yang tersedia'
  },
  {
    id: 2,
    name: 'Dokter',
    count: 45,
    lastUpdated: '2025-01-14',
    description: 'Data dokter dan spesialisasi'
  },
  {
    id: 3,
    name: 'Perawat',
    count: 67,
    lastUpdated: '2025-01-13',
    description: 'Data perawat dan bidan'
  },
  {
    id: 4,
    name: 'Obat & Alkes',
    count: 234,
    lastUpdated: '2025-01-12',
    description: 'Master data obat dan alat kesehatan'
  },
  {
    id: 5,
    name: 'Diagnosa ICD-10',
    count: 1250,
    lastUpdated: '2025-01-10',
    description: 'Kode diagnosa ICD-10'
  },
  {
    id: 6,
    name: 'Tindakan Medis',
    count: 89,
    lastUpdated: '2025-01-08',
    description: 'Daftar tindakan medis dan tarif'
  }
]

// Mock data for selected category (Poli/Klinik)
const mockPoliData = [
  { id: 1, code: 'POL001', name: 'Poli Umum', type: 'Poli', status: 'active', capacity: 50 },
  { id: 2, code: 'POL002', name: 'Poli Anak', type: 'Poli', status: 'active', capacity: 30 },
  { id: 3, code: 'POL003', name: 'Poli Jantung', type: 'Poli', status: 'active', capacity: 25 },
  { id: 4, code: 'POL004', name: 'Poli Mata', type: 'Poli', status: 'active', capacity: 20 },
  { id: 5, code: 'POL005', name: 'Poli Kulit & Kelamin', type: 'Poli', status: 'active', capacity: 15 }
]

export default function MasterDataPage() {
  const [selectedCategory, setSelectedCategory] = useState(mockMasterDataCategories[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState(mockPoliData)

  const handleCategorySelect = (category: typeof mockMasterDataCategories[0]) => {
    setSelectedCategory(category)
    // In real implementation, this would fetch data for the selected category
    setFilteredData(mockPoliData) // Using same mock data for demo
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = mockPoliData.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      item.code.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredData(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Aktif</span>
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">Tidak Aktif</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaDatabase className="text-purple-500" />
        <span className="truncate">Master Data</span>
      </h1>

      {/* Master Data Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Kategori</p>
              <p className="text-2xl font-bold">{mockMasterDataCategories.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">kategori master data</p>
            </div>
            <FaDatabase className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold">1,697</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">data master</p>
            </div>
            <FaDatabase className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Aktif</p>
              <p className="text-2xl font-bold">1,623</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">95.6% dari total</p>
            </div>
            <FaDatabase className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
              <p className="text-lg font-bold">15 Jan</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">2025</p>
            </div>
            <FaDatabase className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Master Data Categories */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Kategori Master Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockMasterDataCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className={`border rounded-lg p-4 cursor-pointer transition hover:shadow-md ${
                selectedCategory.id === category.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</h3>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{category.count}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{category.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Updated: {new Date(category.lastUpdated).toLocaleDateString('id-ID')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold">Data {selectedCategory.name}</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
              <FaUpload />
              Import
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
              <FaDownload />
              Export
            </button>
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition flex items-center gap-2">
              <FaPlus />
              Tambah Data
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Cari ${selectedCategory.name.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
            <FaFilter />
            Filter
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Kode</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tipe</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Kapasitas</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3 font-mono text-sm">{item.code}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.capacity} orang</td>
                  <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                        <FaEdit className="text-sm" />
                      </button>
                      <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Maintenance */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Pemeliharaan Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
              <FaDatabase className="text-2xl text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Backup Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Backup otomatis setiap hari
            </p>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
              Backup Sekarang
            </button>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
              <FaDatabase className="text-2xl text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Validasi Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Periksa integritas data
            </p>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
              Validasi
            </button>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
              <FaDatabase className="text-2xl text-orange-500" />
            </div>
            <h3 className="font-semibold mb-2">Sync Eksternal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Sinkronisasi dengan sistem eksternal
            </p>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition">
              Sync Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
