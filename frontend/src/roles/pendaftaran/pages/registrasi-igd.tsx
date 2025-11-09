'use client'

import { useState } from 'react'
import { FaAmbulance, FaExclamationTriangle, FaUserMd, FaClock, FaCheck, FaTimes } from 'react-icons/fa'

export default function RegistrasiIgdPage() {
  const [formData, setFormData] = useState({
    urgencyLevel: '',
    arrivalMethod: 'Ambulance',
    chiefComplaint: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Laki-laki'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [registrationNumber, setRegistrationNumber] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Simulate API call - in real implementation, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate registration number
      const timestamp = Date.now()
      const regNumber = `IGD-${timestamp.toString().slice(-6)}`
      setRegistrationNumber(regNumber)

      setSubmitStatus('success')

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          urgencyLevel: '',
          arrivalMethod: 'Ambulance',
          chiefComplaint: '',
          patientName: '',
          patientAge: '',
          patientGender: 'Laki-laki'
        })
        setSubmitStatus('idle')
        setRegistrationNumber('')
      }, 3000)

    } catch (error) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case '1': return 'text-red-600 bg-red-50 border-red-200'
      case '2': return 'text-orange-600 bg-orange-50 border-orange-200'
      case '3': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case '4': return 'text-green-600 bg-green-50 border-green-200'
      case '5': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950 dark:via-neutral-900 dark:to-orange-950 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaAmbulance className="text-red-500" />
        <span>Registrasi IGD - Emergency</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-red-200 dark:border-red-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 text-red-700 dark:text-red-300">Form Registrasi Emergency</h2>

          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-red-600" />
                <span className="font-semibold text-red-800 dark:text-red-200">Emergency Mode</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-300">
                Form ini untuk kasus emergency. Prioritas tertinggi.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2">Tingkat Urgensi *</label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => handleInputChange('urgencyLevel', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${getUrgencyColor(formData.urgencyLevel)}`}
                  required
                >
                  <option value="">Pilih tingkat urgensi</option>
                  <option value="1">Level 1 - Resusitasi (Merah)</option>
                  <option value="2">Level 2 - Emergency (Orange)</option>
                  <option value="3">Level 3 - Urgent (Kuning)</option>
                  <option value="4">Level 4 - Less Urgent (Hijau)</option>
                  <option value="5">Level 5 - Non Urgent (Biru)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cara Kedatangan</label>
                <select
                  value={formData.arrivalMethod}
                  onChange={(e) => handleInputChange('arrivalMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <option>Ambulance</option>
                  <option>Kendaraan Pribadi</option>
                  <option>Jalan Kaki</option>
                  <option>Polisi</option>
                  <option>Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Keluhan Utama</label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  rows={3}
                  placeholder="Jelaskan keluhan pasien secara singkat"
                  required
                />
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheck className="text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-200">Registrasi Berhasil!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Nomor registrasi: <strong>{registrationNumber}</strong>
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Pasien telah didaftarkan ke IGD dengan prioritas tinggi.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTimes className="text-red-600" />
                    <span className="font-semibold text-red-800 dark:text-red-200">Registrasi Gagal!</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Terjadi kesalahan saat mendaftarkan pasien. Silakan coba lagi.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !formData.urgencyLevel || !formData.chiefComplaint}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    <FaAmbulance />
                    Daftarkan Emergency
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaUserMd className="text-blue-500" />
              Dokter IGD Tersedia
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div>
                  <div className="font-medium">dr. Emergency Specialist</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sp. Emergency Medicine</div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Available</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <div>
                  <div className="font-medium">dr. Trauma Care</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sp. Traumatology</div>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Busy</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaClock className="text-orange-500" />
              Response Time Standard
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Level 1 (Merah)</span>
                <span className="font-bold text-red-600">Immediate</span>
              </div>
              <div className="flex justify-between">
                <span>Level 2 (Orange)</span>
                <span className="font-bold text-orange-600">{'<'} 10 menit</span>
              </div>
              <div className="flex justify-between">
                <span>Level 3 (Kuning)</span>
                <span className="font-bold text-yellow-600">{'<'} 30 menit</span>
              </div>
              <div className="flex justify-between">
                <span>Level 4 (Hijau)</span>
                <span className="font-bold text-green-600">{'<'} 60 menit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
