'use client'

import { useState } from 'react'
import { FaBell, FaEnvelope, FaSms, FaPhone, FaWhatsapp, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa'

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    patientName: 'Ahmad Surya',
    patientId: 'P001',
    type: 'appointment_reminder',
    message: 'Pengingat janji temu dengan Dr. Siti Aminah besok pukul 10:00',
    status: 'sent',
    sentAt: '2025-01-15 09:00:00',
    channel: 'whatsapp'
  },
  {
    id: 2,
    patientName: 'Sari Dewi',
    patientId: 'P002',
    type: 'registration_confirmation',
    message: 'Registrasi berhasil. Nomor antrian: A001',
    status: 'delivered',
    sentAt: '2025-01-15 08:30:00',
    channel: 'sms'
  },
  {
    id: 3,
    patientName: 'Rudi Hartono',
    patientId: 'P003',
    type: 'payment_reminder',
    message: 'Pengingat pembayaran untuk kunjungan tanggal 20 Januari',
    status: 'pending',
    sentAt: null,
    channel: 'email'
  }
]

// Mock data for communication templates
const mockTemplates = [
  {
    id: 1,
    name: 'Pengingat Janji Temu',
    type: 'appointment_reminder',
    content: 'Halo [NAMA_PASIEN], ingatkan janji temu Anda dengan [DOKTER] pada [TANGGAL] pukul [JAM].',
    channels: ['whatsapp', 'sms', 'email']
  },
  {
    id: 2,
    name: 'Konfirmasi Registrasi',
    type: 'registration_confirmation',
    content: 'Registrasi berhasil [NAMA_PASIEN]. Nomor antrian: [NOMOR_ANTRIAN]. Datang tepat waktu.',
    channels: ['whatsapp', 'sms']
  },
  {
    id: 3,
    name: 'Pengingat Pembayaran',
    type: 'payment_reminder',
    content: 'Pengingat pembayaran untuk kunjungan [NAMA_PASIEN] sebesar [JUMLAH].',
    channels: ['email', 'sms']
  }
]

export default function NotificationsPage() {
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [filteredNotifications, setFilteredNotifications] = useState(mockNotifications)

  const handleFilter = () => {
    let filtered = mockNotifications

    if (selectedChannel !== 'all') {
      filtered = filtered.filter(item => item.channel === selectedChannel)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    setFilteredNotifications(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Terkirim
        </span>
      case 'delivered':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Diterima
        </span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaClock className="text-xs" />
          Menunggu
        </span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Gagal
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <FaWhatsapp className="text-green-500" />
      case 'sms':
        return <FaSms className="text-blue-500" />
      case 'email':
        return <FaEnvelope className="text-purple-500" />
      case 'phone':
        return <FaPhone className="text-orange-500" />
      default:
        return <FaBell className="text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return 'Pengingat Janji Temu'
      case 'registration_confirmation':
        return 'Konfirmasi Registrasi'
      case 'payment_reminder':
        return 'Pengingat Pembayaran'
      case 'result_notification':
        return 'Notifikasi Hasil'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaBell className="text-orange-500" />
        <span className="truncate">Komunikasi Pasien</span>
      </h1>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pesan</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">bulan ini</p>
            </div>
            <FaPaperPlane className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Pengiriman</p>
              <p className="text-2xl font-bold">96.8%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">berhasil dikirim</p>
            </div>
            <FaCheckCircle className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Respon Rate</p>
              <p className="text-2xl font-bold">78.5%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">pasien merespon</p>
            </div>
            <FaBell className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pesan Hari Ini</p>
              <p className="text-2xl font-bold">89</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">terjadwal dikirim</p>
            </div>
            <FaCalendarAlt className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Kirim Komunikasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex flex-col items-center gap-2">
            <FaWhatsapp className="text-2xl text-green-500" />
            <span className="font-medium">WhatsApp</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Kirim via WhatsApp</span>
          </button>
          <button className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex flex-col items-center gap-2">
            <FaSms className="text-2xl text-blue-500" />
            <span className="font-medium">SMS</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Kirim via SMS</span>
          </button>
          <button className="p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex flex-col items-center gap-2">
            <FaEnvelope className="text-2xl text-purple-500" />
            <span className="font-medium">Email</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Kirim via Email</span>
          </button>
          <button className="p-4 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex flex-col items-center gap-2">
            <FaPhone className="text-2xl text-orange-500" />
            <span className="font-medium">Telepon</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Panggilan suara</span>
          </button>
        </div>
      </div>

      {/* Communication Templates */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Template Pesan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{template.name}</h3>
                <div className="flex gap-1">
                  {template.channels.map((channel) => (
                    <div key={channel} className="text-xs">
                      {getChannelIcon(channel)}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{template.content}</p>
              <button className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition">
                Gunakan Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Filter Komunikasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
              <option value="all">Semua Channel</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="phone">Telepon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipe Pesan
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
              <option value="all">Semua Tipe</option>
              <option value="appointment_reminder">Pengingat Janji Temu</option>
              <option value="registration_confirmation">Konfirmasi Registrasi</option>
              <option value="payment_reminder">Pengingat Pembayaran</option>
              <option value="result_notification">Notifikasi Hasil</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Communication History */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Riwayat Komunikasi</h2>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tipe</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Channel</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Pesan</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Waktu</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {filteredNotifications.map((notification) => (
                <tr key={notification.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{notification.patientName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{notification.patientId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getTypeLabel(notification.type)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(notification.channel)}
                      <span className="capitalize">{notification.channel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={notification.message}>
                    {notification.message}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(notification.status)}</td>
                  <td className="px-4 py-3">
                    {notification.sentAt ? new Date(notification.sentAt).toLocaleString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Communications */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mt-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Jadwal Komunikasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Pesan Terjadwal Hari Ini</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
                <span className="text-sm">Pengingat Janji Temu</span>
                <span className="text-sm font-medium">14:00</span>
              </div>
              <div className="flex justify-between items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
                <span className="text-sm">Konfirmasi Registrasi</span>
                <span className="text-sm font-medium">16:00</span>
              </div>
              <div className="flex justify-between items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
                <span className="text-sm">Pengingat Pembayaran</span>
                <span className="text-sm font-medium">18:00</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Statistik Pengiriman</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</span>
                <span className="font-bold text-green-600">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">SMS</span>
                <span className="font-bold text-blue-600">89%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-bold text-purple-600">96%</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="text-sm font-medium">Rata-rata</span>
                <span className="font-bold">93%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
