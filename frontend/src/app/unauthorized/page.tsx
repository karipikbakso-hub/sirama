// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Akses Ditolak</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Anda tidak memiliki akses ke halaman ini. Pastikan Anda login dengan role yang sesuai.
        </p>
        <a
          href="/login"
          className="inline-block mt-4 px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          Kembali ke Login
        </a>
      </div>
    </div>
  )
}