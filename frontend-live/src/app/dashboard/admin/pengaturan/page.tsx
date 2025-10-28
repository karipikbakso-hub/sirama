'use client'

import { useState } from 'react'

export default function PengaturanPage() {
  const [settings, setSettings] = useState({
    bridgingBPJS: true,
    autoBackup: false,
    modeMaintenance: false,
    notifikasiEmail: true,
    aksesMobile: true,
    auditTrail: true,
    modeCetak: false,
    zonaWaktu: 'WIB',
    bahasaSistem: 'Indonesia',
    waktuTutup: '17:00',
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const update = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">⚙️ Pengaturan Sistem</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Toggle Settings */}
        <SettingToggle
          label="Bridging BPJS"
          desc="Integrasi langsung dengan sistem BPJS."
          value={settings.bridgingBPJS}
          onToggle={() => toggle('bridgingBPJS')}
        />
        <SettingToggle
          label="Auto Backup Harian"
          desc="Backup otomatis setiap malam pukul 02:00."
          value={settings.autoBackup}
          onToggle={() => toggle('autoBackup')}
        />
        <SettingToggle
          label="Mode Maintenance"
          desc="Nonaktifkan akses publik sementara."
          value={settings.modeMaintenance}
          onToggle={() => toggle('modeMaintenance')}
        />
        <SettingToggle
          label="Notifikasi Email"
          desc="Kirim notifikasi ke admin saat ada perubahan."
          value={settings.notifikasiEmail}
          onToggle={() => toggle('notifikasiEmail')}
        />
        <SettingToggle
          label="Akses Mobile App"
          desc="Izinkan akses dashboard via aplikasi mobile."
          value={settings.aksesMobile}
          onToggle={() => toggle('aksesMobile')}
        />
        <SettingToggle
          label="Audit Trail Aktif"
          desc="Simpan semua aktivitas pengguna untuk keamanan."
          value={settings.auditTrail}
          onToggle={() => toggle('auditTrail')}
        />
        <SettingToggle
          label="Mode Cetak Otomatis"
          desc="Cetak otomatis setelah input selesai."
          value={settings.modeCetak}
          onToggle={() => toggle('modeCetak')}
        />

        {/* Select Settings */}
        <SettingSelect
          label="Zona Waktu Server"
          desc="Pilih zona waktu sistem."
          options={['WIB', 'WITA', 'WIT']}
          value={settings.zonaWaktu}
          onChange={(val) => update('zonaWaktu', val)}
        />
        <SettingSelect
          label="Bahasa Sistem"
          desc="Bahasa default tampilan admin."
          options={['Indonesia', 'English']}
          value={settings.bahasaSistem}
          onChange={(val) => update('bahasaSistem', val)}
        />

        {/* Time Input */}
        <SettingTime
          label="Jam Tutup Pendaftaran"
          desc="Waktu terakhir pasien bisa daftar hari ini."
          value={settings.waktuTutup}
          onChange={(val) => update('waktuTutup', val)}
        />
      </div>
    </div>
  )
}

function SettingToggle({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string
  desc: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`px-3 py-1 rounded text-xs font-semibold ${
          value
            ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
            : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
        }`}
      >
        {value ? 'Aktif' : 'Nonaktif'}
      </button>
    </div>
  )
}

function SettingSelect({
  label,
  desc,
  options,
  value,
  onChange,
}: {
  label: string
  desc: string
  options: string[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{desc}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function SettingTime({
  label,
  desc,
  value,
  onChange,
}: {
  label: string
  desc: string
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{desc}</p>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 shadow-sm"
      />
    </div>
  )
}