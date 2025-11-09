'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: '🏥',
      title: 'Sistem Terintegrasi',
      description: 'Platform terpadu untuk semua kebutuhan rumah sakit modern'
    },
    {
      icon: '👥',
      title: 'Multi-Role Access',
      description: 'Akses khusus sesuai peran: Admin, Dokter, Perawat, Apoteker, Kasir'
    },
    {
      icon: '📊',
      title: 'Analytics Real-time',
      description: 'Dashboard dan laporan real-time untuk pengambilan keputusan'
    },
    {
      icon: '🔒',
      title: 'Keamanan Tinggi',
      description: 'Enkripsi data dan kontrol akses berbasis peran yang ketat'
    },
    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'Akses dari desktop, tablet, dan smartphone'
    },
    {
      icon: '⚡',
      title: 'Performa Optimal',
      description: 'Teknologi modern untuk kecepatan dan efisiensi maksimal'
    }
  ]

  const roles = [
    { name: 'Admin/IT', icon: '👨‍💼', desc: 'Manajemen sistem & pengguna' },
    { name: 'Pendaftaran', icon: '📋', desc: 'Registrasi pasien & antrian' },
    { name: 'Dokter', icon: '👨‍⚕️', desc: 'Pelayanan medis & EMR' },
    { name: 'Perawat', icon: '👩‍⚕️', desc: 'Perawatan & dokumentasi' },
    { name: 'Apoteker', icon: '💊', desc: 'Manajemen farmasi' },
    { name: 'Kasir', icon: '💰', desc: 'Billing & pembayaran' },
    { name: 'Manajemen', icon: '🏢', desc: 'Analisis & laporan' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f0a] via-[#111a11] to-[#1a1f1a] text-gray-100">
      {/* efek animasi latar */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,100,0,0.15),transparent_60%)]"></div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-700 via-amber-600 to-green-800 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-amber-200"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 0l3 3m-3-3l-3 3m15.364 6.364l-3-3m3 3l-3 3m-12-3l3-3m3 3l3-3" />
              </svg>
            </div>
            <span className="text-xl font-bold text-amber-400">SIRAMA</span>
          </div>
          <Link
            href="/login"
            className="px-6 py-2 bg-gradient-to-r from-green-700 via-amber-700 to-green-800 hover:from-green-800 hover:via-amber-800 hover:to-green-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-800/40 transition duration-300"
          >
            Masuk Sistem
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-700 via-amber-600 to-green-800 flex items-center justify-center shadow-2xl shadow-green-900/60 border-4 border-amber-400/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-amber-200"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 0l3 3m-3-3l-3 3m15.364 6.364l-3-3m3 3l-3 3m-12-3l3-3m3 3l3-3" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-wider bg-gradient-to-r from-amber-400 via-green-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg mb-6">
            SIRAMA
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Sistem Informasi Rumah Sakit Adaptif Modular
          </p>

          <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
            Platform digital terdepan untuk transformasi rumah sakit modern.
            Integrasi penuh, keamanan tinggi, dan efisiensi maksimal untuk semua stakeholder kesehatan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-green-700 via-amber-700 to-green-800 hover:from-green-800 hover:via-amber-800 hover:to-green-900 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-amber-800/40 transition duration-300"
            >
              🚀 Mulai Sekarang
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-transparent border-2 border-amber-400/30 hover:border-amber-400 text-amber-400 font-semibold text-lg rounded-xl transition duration-300"
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </section>



      {/* Roles Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sistem Multi-Role
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Akses khusus dan terintegrasi untuk setiap peran dalam ekosistem rumah sakit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-[#0f1510]/90 backdrop-blur-xl border border-green-900/40 rounded-xl p-6 text-center hover:bg-[#131a13]/90 transition duration-300"
              >
                <div className="text-4xl mb-3">{role.icon}</div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">{role.name}</h3>
                <p className="text-sm text-gray-400">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#0f1510]/90 backdrop-blur-xl border border-green-900/40 rounded-2xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Transformasi Digital?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Bergabunglah dengan ribuan rumah sakit yang telah mempercayai SIRAMA
              untuk operasional kesehatan yang lebih baik dan efisien.
            </p>
            <Link
              href="/login"
              className="inline-block px-12 py-4 bg-gradient-to-r from-green-700 via-amber-700 to-green-800 hover:from-green-800 hover:via-amber-800 hover:to-green-900 text-white font-semibold text-xl rounded-xl shadow-lg hover:shadow-amber-800/40 transition duration-300"
            >
              🔐 Masuk ke Sistem SIRAMA
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-green-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            © 2025 SIRAMA — Sistem Informasi Rumah Sakit Adaptif Modular
          </p>
        </div>
      </footer>
    </div>
  )
}
