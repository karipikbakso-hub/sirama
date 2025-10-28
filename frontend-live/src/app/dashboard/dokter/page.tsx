'use client'

import { FaUserMd, FaClipboardCheck, FaPrescriptionBottleAlt, FaClock, FaFileMedical, FaShareSquare, FaChartLine, FaSyncAlt } from 'react-icons/fa'

export default function DokterDashboard() {
  const stats = [
    {
      icon: <FaUserMd className="text-green-600 text-xl" />,
      label: 'Total Pasien Hari Ini',
      value: '42 pasien terdaftar',
    },
    {
      icon: <FaClipboardCheck className="text-blue-600 text-xl" />,
      label: 'Pemeriksaan Selesai',
      value: '28 pemeriksaan lengkap',
    },
    {
      icon: <FaPrescriptionBottleAlt className="text-purple-600 text-xl" />,
      label: 'Resep Diberikan',
      value: '31 resep aktif',
    },
    {
      icon: <FaClock className="text-yellow-500 text-xl" />,
      label: 'Antrian Tersisa',
      value: '11 pasien menunggu',
    },
    {
      icon: <FaFileMedical className="text-indigo-500 text-xl" />,
      label: 'Rekam Medis Baru',
      value: '19 entri hari ini',
    },
    {
      icon: <FaShareSquare className="text-pink-500 text-xl" />,
      label: 'Rujukan Keluar',
      value: '5 pasien dirujuk',
    },
    {
      icon: <FaChartLine className="text-teal-600 text-xl" />,
      label: 'Efisiensi Pemeriksaan',
      value: '67% selesai < 15 menit',
    },
    {
      icon: <FaSyncAlt className="text-gray-500 text-xl" />,
      label: 'Update Modul Klinik',
      value: 'v2.3.1 aktif',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded shadow hover:shadow-md transition"
        >
          <div>{stat.icon}</div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}