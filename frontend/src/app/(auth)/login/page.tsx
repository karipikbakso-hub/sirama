// src/app/(auth)/login/page.tsx
import LoginForm from '../../../components/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Box Login */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
          <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
            Login SIRAMA
          </h1>
          <LoginForm />
        </div>

        {/* Accordion Akun Demo */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
            🔐 Akun Demo Tersedia
          </h2>

          <div className="space-y-2">
            {[
              {
                title: 'Tenaga Medis',
                roles: [
                  ['Dokter', 'dokter'],
                  ['Perawat Rawat Inap', 'rawat'],
                  ['Petugas Lab/Rad', 'lab'],
                  ['Apoteker', 'apoteker'],
                ],
              },
              {
                title: 'Operasional & Manajemen',
                roles: [
                  ['Admin Sistem', 'admin'],
                  ['Petugas Pendaftaran', 'daftar'],
                  ['Kasir', 'kasir'],
                  ['Manajemen RS', 'manajemen'],
                ],
              },
            ].map((group, i) => (
              <details key={i} className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 p-4">
                <summary className="cursor-pointer font-medium text-gray-800 dark:text-white">
                  {group.title}
                </summary>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {group.roles.map(([label, user]) => (
                    <div key={user} className="bg-gray-50 dark:bg-gray-900 p-3 rounded border dark:border-gray-700">
                      <p className="font-medium text-gray-700 dark:text-white">{label}</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Username: <code className="font-mono">{user}</code>
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>

          {/* Catatan */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Gunakan salah satu username di atas untuk login. Password dapat diisi bebas. Sistem akan otomatis mengarahkan Anda ke dashboard sesuai peran pengguna.
          </p>
        </div>

      </div>
    </main>
  )
}