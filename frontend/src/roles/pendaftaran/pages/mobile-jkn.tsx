'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaMobileAlt, FaQrcode, FaDownload, FaShare, FaClock, FaUsers, FaCheckCircle, FaIdCard, FaHistory, FaBell } from 'react-icons/fa'
import axios from 'axios'
import apiData from '@/lib/apiData'

// Create separate axios instance for public endpoints (no credentials)
const publicApi = axios.create({
  baseURL: 'http://localhost:8000/',
  // No withCredentials for public endpoints to avoid CSRF
})

export default function MobileJknPage() {
  const [selectedFeature, setSelectedFeature] = useState('all')
  const queryClient = useQueryClient()

  // API calls with React Query (using public routes for testing)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['mobile-jkn-stats'],
    queryFn: async () => {
      const response = await apiData.get('public/mobile-jkn/statistics')
      return response.data.data
    }
  })

  const { data: features, isLoading: featuresLoading } = useQuery({
    queryKey: ['mobile-jkn-features'],
    queryFn: async () => {
      const response = await apiData.get('public/mobile-jkn/features')
      return response.data.data
    }
  })

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['mobile-jkn-activities'],
    queryFn: async () => {
      const response = await apiData.get('public/mobile-jkn/activities')
      return response.data.data
    }
  })

  // Mutations for actions (using public routes for testing)
  const generateQRMutation = useMutation({
    mutationFn: async (data: { patient_id: number; service_type: string }) => {
      const response = await publicApi.post('public/mobile-jkn/generate-qr', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-jkn-activities'] })
    }
  })

  const verifyCardMutation = useMutation({
    mutationFn: async (bpjsNumber: string) => {
      const response = await publicApi.post('public/mobile-jkn/verify-card', { bpjs_number: bpjsNumber })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-jkn-stats'] })
      queryClient.invalidateQueries({ queryKey: ['mobile-jkn-activities'] })
    }
  })

  const registerMutation = useMutation({
    mutationFn: async (data: { patient_id: number; bpjs_number: string; phone: string; email?: string }) => {
      const response = await publicApi.post('public/mobile-jkn/register', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-jkn-stats'] })
      queryClient.invalidateQueries({ queryKey: ['mobile-jkn-activities'] })
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Aktif</span>
      case 'beta':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">Beta</span>
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">Tidak Aktif</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getActivityStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Berhasil</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Gagal</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Pending</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const handleGenerateQR = async () => {
    // For demo purposes, we'll generate QR for a sample patient
    // In real implementation, this would open a modal to select patient
    const sampleData = {
      patient_id: 1, // Sample patient ID
      service_type: 'registration'
    }

    try {
      await generateQRMutation.mutateAsync(sampleData)
      alert('QR Code berhasil di-generate! Lihat di console untuk detail.')
    } catch (error) {
      alert('Gagal generate QR Code: ' + (error as Error).message)
    }
  }

  const handleVerifyCard = async () => {
    // For demo purposes, we'll verify a sample BPJS number
    const sampleBpjsNumber = '1234567890123' // Sample BPJS number

    try {
      const result = await verifyCardMutation.mutateAsync(sampleBpjsNumber)
      if (result.success) {
        alert(`✅ Kartu BPJS berhasil diverifikasi!\nNama: ${result.data.name}\nStatus: ${result.data.status}`)
      } else {
        alert(`❌ Verifikasi gagal: ${result.message}`)
      }
    } catch (error) {
      alert('Gagal verifikasi kartu: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaMobileAlt className="text-green-500" />
        <span>Mobile JKN</span>
      </h1>

      {/* JKN Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrasi</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.total_registrations || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">pengguna terdaftar</p>
            </div>
            <FaUsers className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pengguna Aktif</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.active_users || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">bulan ini</p>
            </div>
            <FaMobileAlt className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registrasi Hari Ini</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.today_registrations || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+18% dari kemarin</p>
            </div>
            <FaClock className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Verifikasi</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.verification_success || 0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">keberhasilan validasi</p>
            </div>
            <FaCheckCircle className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* App Features */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Fitur Aplikasi Mobile JKN</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuresLoading ? (
            <div className="col-span-2 text-center py-8">Loading features...</div>
          ) : features && features.length > 0 ? (
            features.map((feature: any) => {
              const getIconComponent = (iconName: string) => {
                switch (iconName) {
                  case 'FaMobileAlt': return FaMobileAlt
                  case 'FaIdCard': return FaIdCard
                  case 'FaBell': return FaBell
                  case 'FaHistory': return FaHistory
                  default: return FaMobileAlt
                }
              }
              const IconComponent = getIconComponent(feature.icon)

              return (
                <div key={feature.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <IconComponent className="text-xl text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{feature.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(feature.status)}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Penggunaan hari ini</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{feature.usage}</span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">No features available</div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Aktivitas Terbaru</h2>
        <div className="space-y-3">
          {activitiesLoading ? (
            <div className="text-center py-8">Loading activities...</div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {activity.user.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{activity.user}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getActivityStatusBadge(activity.status)}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No recent activities</div>
          )}
        </div>
      </div>

      {/* QR Code & Download */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">QR Code Registrasi</h2>
          <div className="text-center">
            <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500">
                <FaQrcode className="text-6xl mx-auto mb-2" />
                <p className="text-sm">QR Code akan muncul di sini</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGenerateQR}
                disabled={generateQRMutation.isPending}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaQrcode />
                {generateQRMutation.isPending ? 'Generating...' : 'Generate QR Code'}
              </button>

              <button
                onClick={handleVerifyCard}
                disabled={verifyCardMutation.isPending}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaIdCard />
                {verifyCardMutation.isPending ? 'Verifying...' : 'Verify BPJS Card'}
              </button>
            </div>

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Petunjuk:</strong> Buka aplikasi Mobile JKN, scan QR code ini untuk registrasi cepat tanpa antri fisik.
              </p>
            </div>
          </div>
        </div>

        {/* App Download */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Download Aplikasi</h2>
          <div className="space-y-6">
            {/* Android */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">Android App</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Tersedia di Google Play Store
              </p>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center justify-center gap-2">
                  <FaDownload className="text-sm" />
                  APK
                </button>
                <button className="flex-1 px-4 py-2 border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition">
                  Play Store
                </button>
              </div>
            </div>

            {/* iOS */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍎</span>
              </div>
              <h3 className="font-semibold mb-2">iOS App</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Tersedia di App Store
              </p>
              <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center justify-center gap-2">
                <FaDownload className="text-sm" />
                Download iOS
              </button>
            </div>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Info:</strong> Aplikasi Mobile JKN resmi BPJS Kesehatan. Pastikan download dari sumber resmi untuk keamanan data Anda.
            </p>
          </div>
        </div>
      </div>

      {/* User Guide */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mt-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Panduan Pengguna</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Registrasi</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daftar akun menggunakan nomor BPJS dan data diri
            </p>
          </div>

          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 dark:text-green-400 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Pilih Layanan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pilih poli tujuan dan jadwal kunjungan
            </p>
          </div>

          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Konfirmasi</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Terima konfirmasi dan nomor antrian digital
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
