'use client'

export default function AdminDashboard() {
  const stats = [
    { icon: '👥', label: 'Total Pengguna', value: '128', color: 'bg-green-400', gradient: 'bg-gradient-to-r from-green-500 to-green-700' },
    { icon: '🧾', label: 'Audit Hari Ini', value: '342', color: 'bg-blue-400', gradient: 'bg-gradient-to-r from-blue-500 to-blue-700' },
    { icon: '⚙️', label: 'Modul Aktif', value: '13', color: 'bg-yellow-400', gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-700' },
    { icon: '📊', label: 'Uptime Sistem', value: '99.9%', color: 'bg-red-400', gradient: 'bg-gradient-to-r from-red-500 to-red-700' },
    { icon: '🏥', label: 'Pasien Klinik', value: '42 aktif', color: 'bg-indigo-400', gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-700' },
    { icon: '🛏️', label: 'Kamar Rawat', value: '18 terisi', color: 'bg-purple-400', gradient: 'bg-gradient-to-r from-purple-500 to-purple-700' },
    { icon: '💊', label: 'Stok Farmasi', value: '312 item', color: 'bg-pink-400', gradient: 'bg-gradient-to-r from-pink-500 to-pink-700' },
    { icon: '🧪', label: 'Sampel Lab', value: '27 diproses', color: 'bg-cyan-400', gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-700' },
    { icon: '🧾', label: 'Kasir Hari Ini', value: 'Rp 12.5 juta', color: 'bg-green-600', gradient: 'bg-gradient-to-r from-green-600 to-green-800' },
    { icon: '🧺', label: 'Laundry Selesai', value: '76 item', color: 'bg-blue-600', gradient: 'bg-gradient-to-r from-blue-600 to-blue-800' },
    { icon: '🍽️', label: 'Transaksi POS', value: '89 transaksi', color: 'bg-orange-400', gradient: 'bg-gradient-to-r from-orange-500 to-orange-700' },
    { icon: '🏘️', label: 'Properti Aktif', value: '5 properti', color: 'bg-teal-400', gradient: 'bg-gradient-to-r from-teal-500 to-teal-700' },
    { icon: '🎓', label: 'Kursus Aktif', value: '3 kursus', color: 'bg-fuchsia-400', gradient: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-700' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-wide">Dashboard Admin</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Selamat datang di pusat kendali sistem. Berikut ringkasan status dari 13 modul aktif:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(({ icon, label, value, color, gradient }) => (
          <div
            key={label}
            className={`relative p-5 rounded-xl shadow-md text-white ${gradient} overflow-hidden`}
          >
            <div className="absolute top-2 right-2 text-5xl opacity-20">{icon}</div>
            <div className="relative z-10 space-y-1">
              <h3 className="text-sm font-medium">{label}</h3>
              <p className="text-2xl font-bold">{value}</p>
              <div className="mt-2 h-1 w-full bg-white/30 rounded-full">
                <div className={`h-1 rounded-full ${color}`} style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}