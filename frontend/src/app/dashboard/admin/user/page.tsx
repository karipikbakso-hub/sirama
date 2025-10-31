'use client'

import { useState } from 'react'

type User = {
  id: number
  name: string
  role: 'Admin' | 'Dokter' | 'Perawat' | 'Kasir'
  status: 'Aktif' | 'Nonaktif'
}

const dummyUsers: User[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  role: ['Admin', 'Dokter', 'Perawat', 'Kasir'][i % 4] as User['role'],
  status: i % 3 === 0 ? 'Nonaktif' : 'Aktif',
}))

const statusColor: Record<User['status'], string> = {
  Aktif: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
  Nonaktif: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200',
}

export default function UserPage() {
  const [page, setPage] = useState(1)
  const [modalUser, setModalUser] = useState<User | null>(null)
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)

  const perPage = 10
  const totalPages = Math.ceil(dummyUsers.length / perPage)
  const users = dummyUsers.slice((page - 1) * perPage, page * perPage)

  const openModal = (user: User, type: 'edit' | 'delete') => {
    setModalUser(user)
    setModalType(type)
  }

  const closeModal = () => {
    setModalUser(null)
    setModalType(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">👥 Pengguna & Role</h2>

      <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 shadow">
        <table className="min-w-full text-sm text-left bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="p-3 border-b border-gray-200 dark:border-gray-600">#</th>
              <th className="p-3 border-b">Nama</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 text-gray-700 dark:text-gray-300">{(page - 1) * perPage + i + 1}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{user.name}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{user.role}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusColor[user.status as keyof typeof statusColor] ??
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => openModal(user, 'edit')}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal(user, 'delete')}
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
        <span>
          Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, dummyUsers.length)} dari {dummyUsers.length} pengguna
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            ← Sebelumnya
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Selanjutnya →
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {modalType === 'edit' ? 'Edit Pengguna' : 'Konfirmasi Hapus'}
            </h3>

            {modalType === 'edit' ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Nama</label>
                  <input
                    type="text"
                    defaultValue={modalUser.name}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Role</label>
                  <select
                    defaultValue={modalUser.role}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                  >
                    <option>Admin</option>
                    <option>Dokter</option>
                    <option>Perawat</option>
                    <option>Kasir</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={closeModal} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                    Batal
                  </button>
                  <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                    Simpan
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Yakin ingin menghapus <strong>{modalUser.name}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                    Batal
                  </button>
                  <button onClick={closeModal} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}