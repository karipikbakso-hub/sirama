'use client'

import { useState } from 'react'

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-blue-600 text-white px-3 py-2 rounded shadow"
      >
        ☰ Menu
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/10 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#1E293B] text-white px-6 py-8 space-y-8 font-sans text-[14px] z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:block`}
      >
        <div className="text-[18px] font-bold tracking-wide">SIRAMA Admin</div>

        {/* Modul Inti */}
        <div>
          <p className="text-[11px] uppercase text-gray-400 mb-3 tracking-wider">Modul Inti</p>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">🏥 <span>Manajemen Klinik</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">📋 <span>Rawat Inap</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">💊 <span>Farmasi & Obat</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">🧪 <span>Laboratorium</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">💳 <span>Kasir & Billing</span></a>
          </nav>
        </div>

        {/* Manajemen Sistem */}
        <div>
          <p className="text-[11px] uppercase text-gray-400 mb-3 tracking-wider">Manajemen Sistem</p>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">👥 <span>Pengguna & Role</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">📊 <span>Laporan & Statistik</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">⚙️ <span>Pengaturan Sistem</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">🧾 <span>Audit Trail</span></a>
          </nav>
        </div>

        {/* Modul Tambahan */}
        <div>
          <p className="text-[11px] uppercase text-gray-400 mb-3 tracking-wider">Modul Tambahan</p>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">🧺 <span>Laundry</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">🧑‍🍳 <span>POS & Kantin</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">🏠 <span>Property & Booking</span></a>
            <a href="#" className="flex items-center gap-3 text-gray-300 hover:text-white transition">🎓 <span>eLearning & Workshop</span></a>
          </nav>
        </div>
      </aside>
    </>
  )
}