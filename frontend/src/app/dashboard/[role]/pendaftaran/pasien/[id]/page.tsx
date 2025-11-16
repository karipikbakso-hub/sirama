'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  FaUser, FaIdCard, FaPhone, FaMapMarkerAlt, FaCalendarAlt,
  FaHeartbeat, FaFileMedical, FaArrowLeft, FaEdit, FaPlus,
  FaClock, FaCheckCircle, FaTimesCircle, FaClipboardList
} from 'react-icons/fa'
import api from '@/lib/apiAuth'

interface Patient {
  id: number
  name: string
  nik: string
  medical_record_number: string
  phone: string
  birth_date: string
  address: string
  gender: string
  blood_type?: string
  allergies?: string
  emergency_contact?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface MedicalHistory {
  id: number
  visit_date: string
  diagnosis: string
  treatment: string
  doctor_name: string
  status: string
  prescription?: string
  notes?: string
  follow_up_date?: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params?.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      setLoading(true)

      // Fetch patient details
      const patientResponse = await api.get(`/api/patients/${patientId}`)
      if (patientResponse.data.success) {
        setPatient(patientResponse.data.data)
      }

      // Fetch medical history
      const historyResponse = await api.get(`/api/patient-histories/patient/${patientId}`)
      if (historyResponse.data.success) {
        setMedicalHistory(historyResponse.data.data || [])
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load patient data')
      console.error('Error fetching patient data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaClock className="mx-auto text-4xl text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data pasien...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaFileMedical className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Data Pasien Tidak Ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
        >
          <FaArrowLeft />
          Kembali ke Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide">
              👤 Detail Pasien
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Informasi lengkap pasien - {patient.name}
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <FaEdit />
              Edit Data
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <FaPlus />
              Registrasi Baru
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold">{patient.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">RM: {patient.medical_record_number}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  patient.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {patient.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaIdCard className="text-blue-500 text-lg" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">NIK</p>
                  <p className="font-medium">{patient.nik}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaPhone className="text-green-500 text-lg" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Telepon</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-purple-500 text-lg" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Lahir</p>
                  <p className="font-medium">{new Date(patient.birth_date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-red-500 text-lg" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alamat</p>
                  <p className="font-medium">{patient.address}</p>
                </div>
              </div>

              {patient.blood_type && (
                <div className="flex items-center gap-3">
                  <FaHeartbeat className="text-red-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Golongan Darah</p>
                    <p className="font-medium">{patient.blood_type}</p>
                  </div>
                </div>
              )}

              {patient.allergies && (
                <div className="flex items-center gap-3">
                  <FaTimesCircle className="text-orange-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alergi</p>
                    <p className="font-medium text-orange-600">{patient.allergies}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Summary for Registration */}
        <div className="lg:col-span-1 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-3 mb-4 text-blue-800 dark:text-blue-200">
              <FaClipboardList className="text-blue-500" />
              Ringkasan untuk Pendaftaran
            </h3>

            {medicalHistory.length > 0 ? (
              <div className="space-y-4">
                {/* Active Conditions */}
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Penyakit Aktif:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(medicalHistory
                      .filter(visit => visit.status === 'completed')
                      .slice(0, 3)
                      .map(visit => visit.diagnosis.split(',')[0].trim())
                    )).map((condition, index) => (
                      <span key={index} className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded text-xs">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Obat Rutin:</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {Array.from(new Set(medicalHistory
                      .filter(visit => visit.prescription)
                      .slice(0, 2)
                      .map(visit => visit.prescription?.split(',')[0].trim())
                    )).join(', ') || 'Tidak ada data'}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Alergi:</h4>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    {patient.allergies || 'Tidak ada riwayat alergi'}
                  </div>
                </div>

                {/* Preferred Doctor */}
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Dokter Biasa:</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {medicalHistory[0]?.doctor_name || 'Belum ada dokter tetap'}
                  </div>
                </div>

                {/* Last Visit */}
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Kunjungan Terakhir:</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {medicalHistory.length > 0 ? new Date(medicalHistory[0].visit_date).toLocaleDateString('id-ID') : 'Belum pernah berkunjung'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <FaFileMedical className="mx-auto text-2xl text-blue-400 mb-2" />
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Belum ada riwayat untuk ringkasan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Medical History */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <FaFileMedical className="text-blue-500" />
                Riwayat Kunjungan Lengkap
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {medicalHistory.length} kunjungan tercatat
              </span>
            </div>

            {medicalHistory.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {medicalHistory.map((visit) => (
                  <div key={visit.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-blue-500" />
                        <div>
                          <p className="font-medium">{new Date(visit.visit_date).toLocaleDateString('id-ID')}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dr. {visit.doctor_name}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        visit.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : visit.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {visit.status === 'completed' ? 'Selesai' :
                         visit.status === 'in_progress' ? 'Dalam Proses' : 'Dibatalkan'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Diagnosis:</p>
                          <p className="font-medium">{visit.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tindakan:</p>
                          <p className="font-medium">{visit.treatment}</p>
                        </div>
                        {visit.prescription && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Resep:</p>
                            <p className="font-medium text-green-700 dark:text-green-300">{visit.prescription}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {visit.notes && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Catatan:</p>
                            <p className="font-medium">{visit.notes}</p>
                          </div>
                        )}
                        {visit.follow_up_date && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Kontrol Lanjutan:</p>
                            <p className="font-medium text-purple-700 dark:text-purple-300">
                              {new Date(visit.follow_up_date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaFileMedical className="mx-auto text-3xl text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Belum Ada Riwayat Kunjungan
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Riwayat kunjungan pasien akan muncul di sini setelah kunjungan pertama
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push(`/dashboard/pendaftaran/registrasi?patient_id=${patient.id}`)}
          className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaPlus className="text-2xl mb-2 mx-auto" />
          <span className="text-sm font-medium block">Registrasi Baru</span>
        </button>

        <button
          onClick={() => router.push(`/dashboard/pendaftaran/appointment?patient_id=${patient.id}`)}
          className="p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaCalendarAlt className="text-2xl mb-2 mx-auto" />
          <span className="text-sm font-medium block">Buat Appointment</span>
        </button>

        <button className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
          <FaFileMedical className="text-2xl mb-2 mx-auto" />
          <span className="text-sm font-medium block">Rekam Medis</span>
        </button>

        <button className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
          <FaPhone className="text-2xl mb-2 mx-auto" />
          <span className="text-sm font-medium block">Hubungi Pasien</span>
        </button>
      </div>
    </div>
  )
}
