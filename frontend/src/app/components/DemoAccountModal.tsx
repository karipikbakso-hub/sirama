'use client'

import { useEffect } from 'react'

export default function DemoAccountModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          🔐 Daftar Akun Demo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Admin Sistem', 'admin'],
            ['Petugas Pendaftaran', 'daftar'],
            ['Dokter', 'dokter'],
            ['Kasir', 'kasir'],
            ['Apoteker', 'apoteker'],
            ['Petugas Lab/Rad', 'lab'],
            ['Perawat Rawat Inap', 'rawat'],
            ['Manajemen RS', 'manajemen'],
          ].map(([label, user]) => (
            <div key={user} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
              <p className="font-medium text-gray-800 dark:text-white">{label}</p>
              <p className="text-gray-500 dark:text-gray-400">
                Username: <code className="font-mono">{user}</code>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Gunakan salah satu username di atas untuk login. Password dapat dikosongkan atau diisi bebas. Setelah login, Anda akan diarahkan ke dashboard sesuai peran pengguna.
        </p>
      </div>
    </div>
  )
}