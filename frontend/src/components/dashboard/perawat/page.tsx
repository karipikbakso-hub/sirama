'use client'

import { useState } from 'react'
import { MdFavorite, MdNoteAlt, MdLocalHospital, MdListAlt, MdPeople, MdAssignment } from 'react-icons/md'

export default function PerawatDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          👩‍⚕️ Dashboard Perawat
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Sistem Manajemen Perawatan Pasien - RS Sirama
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdPeople className="text-2xl text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pasien Hari Ini</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">24</p>
              <p className="text-xs text-green-600">+12% dari kemarin</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdFavorite className="text-2xl text-red-600 dark:text-red-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pemeriksaan TTV</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">18</p>
              <p className="text-xs text-green-600">+8% dari kemarin</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdNoteAlt className="text-2xl text-green-600 dark:text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Entri CPPT</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">32</p>
              <p className="text-xs text-green-600">+15% dari kemarin</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdLocalHospital className="text-2xl text-orange-600 dark:text-orange-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kasus Emergency</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">3</p>
              <p className="text-xs text-red-600">-2 dari kemarin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Aksi Cepat
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdFavorite className="inline mr-2" />
                Periksa Tanda Vital
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdNoteAlt className="inline mr-2" />
                Tambah Entri CPPT
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdListAlt className="inline mr-2" />
                Triase Emergency
              </button>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                <MdAssignment className="inline mr-2" />
                Administrasi Obat
              </button>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Pasien Saat Ini
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      Pasien {i} - Kamar {i}0{i}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Diagnosis: {['Pneumonia', 'Hipertensi', 'Diabetes', 'Pasca Operasi', 'Infeksi'][i-1]}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ['bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800', 'bg-green-100 text-green-800'][i % 3]
                    }`}>
                      {['Kritis', 'Stabil', 'Baik'][i % 3]}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800" title="Lihat Detail Pasien">
                      <MdAssignment className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nursing Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Aktivitas Keperawatan Terbaru
        </h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-medium text-gray-800 dark:text-white">Pemeriksaan Tanda Vital - Kamar 101</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">TD: 120/80, Nadi: 72, Suhu: 36.8°C - 10 menit yang lalu</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-medium text-gray-800 dark:text-white">Pemberian Obat - Kamar 102</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Paracetamol 500mg - 15 menit yang lalu</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="font-medium text-gray-800 dark:text-white">Transfer Pasien - Kamar 103</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dipindahkan ke Radiologi - 30 menit yang lalu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
