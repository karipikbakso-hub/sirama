'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FaUserPlus,
  FaClock,
  FaAmbulance,
  FaSave,
  FaArrowLeft,
  FaExclamationTriangle,
  FaVolumeUp,
  FaBell,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa'

import {
  emergencyRegistrationSchema,
  type EmergencyRegistrationFormData,
  TRIAGE_LEVELS,
  type TriageLevel,
  type EmergencyQueueResponse
} from '@/schemas/patientSchemas'

import api from '@/lib/api'
import toast from '@/lib/toast'
import { PatientSearchBar } from '@/components/ui/PatientSearchBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Patient } from '@/types/role/pendaftaran'

// Custom Triage Button Component
const TriageButton = ({
  level,
  selected,
  onClick
}: {
  level: TriageLevel
  selected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`
      relative p-6 rounded-lg border-4 transition-all duration-300 transform hover:scale-105 active:scale-95
      ${selected
        ? `${level.bgColor} ${level.color} border-current shadow-lg animate-pulse`
        : 'bg-white border-gray-300 hover:border-gray-400'
      }
      text-center min-h-[120px] flex flex-col items-center justify-center gap-3
    `}
  >
    <span className="text-4xl">{level.emoji}</span>
    <div>
      <div className={`font-bold text-xl ${selected ? level.color : 'text-gray-800'}`}>
        {level.display}
      </div>
      <div className={`text-sm ${selected ? level.color : 'text-gray-600'}`}>
        {level.description}
      </div>
    </div>
    {selected && (
      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 animate-bounce">
        <FaCheckCircle size={16} />
      </div>
    )}
  </button>
)

// Success Modal Component
const SuccessModal = ({
  data,
  onClose,
  triageLevel
}: {
  data: EmergencyQueueResponse['data']
  onClose: () => void
  triageLevel: TriageLevel
}) => {
  const [timeLeft, setTimeLeft] = useState(data.estimated_time * 60) // Convert to seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Sound notification
  useEffect(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwkZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2NQwoUXrf306dTEAxGn+7zy0QbBjmL1/KJYCMFIHfF8NK QQgkKVLbs8'+Date.now()) // Simple beep sound
    audio.volume = 0.7
    audio.play().catch(() => {/* Ignore audio errors */})

    // Also try to use Notification API if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Pasien IGD ${triageLevel.emoji}`, {
        body: `${data.patient.nama_lengkap} - Antrian ${data.queue_number}`,
        icon: '/favicon.ico'
      })
    }
  }, [data, triageLevel])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-auto animate-fade-in">
        <div className="text-center p-8">
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${triageLevel.bgColor} ${triageLevel.code === 'merah' ? 'animate-pulse' : ''}`}
          >
            <span className="text-4xl">{triageLevel.emoji}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pasien IGD Terdaftar!
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-lg font-semibold text-gray-800 mb-1">
              {data.patient.nama_lengkap}
            </div>
            <div className="text-3xl font-mono font-bold text-blue-600 mb-3">
              {data.queue_number}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <FaClock className="text-gray-500" />
              <span className="text-lg font-mono text-gray-700">
                Estimasi: {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>Prioritas: </span>
              <Badge className={`${triageLevel.bgColor} ${triageLevel.color}`}>
                {triageLevel.emoji} {triageLevel.display}
              </Badge>
            </div>
          </div>

          {triageLevel.code === 'merah' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded animate-blink">
              <div className="flex items-center">
                <FaExclamationTriangle className="mr-2" />
                <strong>PERHATIAN:</strong>
                <span className="ml-1">Pasien priotitas tinggi - panggil segera!</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={onClose} className="px-8">
              Tutup
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="px-8"
            >
              <FaAmbulance className="mr-2" />
              Cetak
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegistrasiIGDPage() {
  console.log('🔥 IGD Registration Page Loaded!')

  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('new')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [currentQueue, setCurrentQueue] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [successModal, setSuccessModal] = useState<EmergencyQueueResponse['data'] | null>(null)

  const form = useForm<EmergencyRegistrationFormData>({
    resolver: zodResolver(emergencyRegistrationSchema),
    defaultValues: {
      patient_type: 'new',
      triage_level: undefined,
      penjamin: 'umum'
    }
  })

  // Auto-save to localStorage every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = form.getValues()
      localStorage.setItem('igd-registration-draft', JSON.stringify(formData))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('igd-registration-draft')
    if (draft) {
      try {
        const data = JSON.parse(draft)
        form.reset(data)
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [])

  // Fetch current IGD queue
  const fetchCurrentQueue = useCallback(async () => {
    try {
      const response = await api.get('/api/queue-managements/igd-aktif')
      if (response.data.success) {
        setCurrentQueue(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch IGD queue:', error)
    }
  }, [])

  // Fetch queue on mount and periodically
  useEffect(() => {
    fetchCurrentQueue()
    const interval = setInterval(fetchCurrentQueue, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchCurrentQueue])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault()
        form.setValue('triage_level', 'merah')
        form.setValue('triage_codes', 'merah')
        document.getElementById('submit-btn')?.focus()
      }
      if (e.key === 'F2') {
        e.preventDefault()
        form.setValue('triage_level', 'kuning')
        form.setValue('triage_codes', 'kuning')
        document.getElementById('submit-btn')?.focus()
      }
      if (e.key === 'F3') {
        e.preventDefault()
        form.setValue('triage_level', 'hijau')
        form.setValue('triage_codes', 'hijau')
        document.getElementById('submit-btn')?.focus()
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        const formData = form.getValues()
        if (formData.triage_level && !submitting) {
          const formElement = document.querySelector('form') as HTMLFormElement
          formElement?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
      if (e.key === 'Escape') {
        handleReset()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [submitting])

  const handleSubmit = useCallback(async (data: EmergencyRegistrationFormData) => {
    if (submitting) return

    console.log('Emergency registration starting...')
    console.log('Form data:', data)
    console.log('Active tab:', activeTab)
    console.log('Selected patient:', selectedPatient)

    try {
      setSubmitting(true)

      // Prepare validation
      if (activeTab === 'existing' && !selectedPatient) {
        toast.error('Pilih pasien yang sudah terdaftar')
        return
      }

      if (activeTab === 'new' && (
        !data.nama_lengkap ||
        !data.tanggal_lahir ||
        !data.jenis_kelamin ||
        !data.telepon
      )) {
        toast.error('Lengkapi data pasien baru')
        return
      }

      if (!data.triage_level) {
        toast.error('Pilih tingkat kegawatan')
        return
      }

      // Submit data
      const submitData = {
        patient_type: activeTab,
        selected_patient_id: selectedPatient?.id,
        nama_lengkap: data.nama_lengkap,
        nik: data.nik,
        tanggal_lahir: activeTab === 'new' ? data.tanggal_lahir?.toISOString().split('T')[0] : undefined,
        jenis_kelamin: data.jenis_kelamin,
        telepon: data.telepon,
        triage_level: data.triage_level,
        keluhan_utama: data.keluhan_utama,
        cara_masuk: data.cara_masuk,
        penjamin: data.penjamin
      }

      console.log('Submitting data to API:', submitData)

      const response = await api.post('/api/pendaftaran/registrasi-igd', submitData)

      console.log('API Response:', response)

      if (response.data.success) {
        const result = response.data as EmergencyQueueResponse

        console.log('Success result:', result)

        // Play success sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwkZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2NQwoUXrf306dTEAxGn+7zy0QbBjmL1/KJYCMFIHfF8NK QQgkKVLbs8'+Date.now()) // Simple beep sound
        audio.volume = 0.5
        audio.play().catch(() => {})

        setSuccessModal(result.data)

        // Clear draft
        localStorage.removeItem('igd-registration-draft')

        toast.success('Pendaftaran IGD berhasil!')

        // Auto-refresh after success
        setTimeout(() => {
          handleReset()
        }, 2000)
      } else {
        console.error('API returned success=false:', response.data)
        toast.error(response.data.message || 'Gagal mendaftarkan ke IGD')
      }

    } catch (error: any) {
      console.error('Emergency registration error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)

      if (error.response) {
        console.error('Error status:', error.response.status)
        console.error('Error data:', error.response.data)

        // Show detailed validation errors if available
        const errorData = error.response.data
        let errorMessage = errorData?.message || 'Gagal mendaftarkan ke IGD'

        if (errorData?.errors) {
          const validationErrors = Object.entries(errorData.errors).map(([field, messages]) => {
            return `${field}: ${(messages as string[]).join(', ')}`
          })
          errorMessage += '\n\n' + validationErrors.join('\n')
          console.error('Validation errors:', errorData.errors)
        }

        toast.error(errorMessage, { duration: 8000 })
        alert('Validation Error:\n\n' + errorMessage) // Also show in alert for visibility
      } else if (error.request) {
        console.error('Error request:', error.request)
        toast.error('Tidak dapat terhubung ke server')
      } else {
        console.error('Error message:', error.message)
        toast.error('Terjadi kesalahan yang tidak terduga')
      }
    } finally {
      setSubmitting(false)
    }
  }, [activeTab, selectedPatient, submitting])

  const handleReset = useCallback(() => {
    setActiveTab('new')
    setSelectedPatient(null)
    form.reset({
      patient_type: 'new',
      triage_level: undefined,
      penjamin: 'umum'
    })
    localStorage.removeItem('igd-registration-draft')
  }, [])

  const selectedTriage = TRIAGE_LEVELS.find(level => level.code === form.watch('triage_level'))

  console.log('🔥 Component rendering...')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaAmbulance className="text-red-600 animate-pulse" />
              Pendaftaran IGD
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-xl">
              Registrasi Cepat Instalasi Gawat Darurat
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <FaArrowLeft className="mr-2" />
            Kembali
          </Button>
        </div>

        {/* Quick Stats - Real-time from Queue */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(() => {
            const redCount = currentQueue.filter(q => q.triage_level === 'merah').length
            const yellowCount = currentQueue.filter(q => q.triage_level === 'kuning').length
            const greenCount = currentQueue.filter(q => q.triage_level === 'hijau').length
            const totalWaiting = currentQueue.length

            return (
              <>
                <div className={`p-4 rounded-lg transition-all ${redCount > 3 ? 'bg-red-200 animate-pulse' : 'bg-red-100'}`}>
                  <div className="flex items-center gap-3">
                    <FaAmbulance className="text-red-600 text-2xl" />
                    <span className="text-red-800 font-bold">Merah: {redCount}</span>
                  </div>
                  {redCount > 3 && (
                    <div className="text-xs text-red-700 mt-1 font-medium">
                      ⚠️ Mass Casualty!
                    </div>
                  )}
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-yellow-600 text-2xl" />
                    <span className="text-yellow-800 font-bold">Kuning: {yellowCount}</span>
                  </div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-green-600 text-2xl" />
                    <span className="text-green-800 font-bold">Hijau: {greenCount}</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaVolumeUp className="text-blue-600 text-2xl" />
                    <span className="text-blue-800 font-bold">Total: {totalWaiting}</span>
                  </div>
                </div>
              </>
            )
          })()}
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

          {/* Patient Selection Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FaUserPlus />
                Data Pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Tab Selection */}
              <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className={`px-6 py-3 rounded-md font-bold transition-all ${
                    activeTab === 'new'
                      ? 'bg-white shadow-md text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Pasien Baru
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('existing')}
                  className={`px-6 py-3 rounded-md font-bold transition-all ${
                    activeTab === 'existing'
                      ? 'bg-white shadow-md text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Pasien Lama
                </button>
              </div>

              {/* Patient Form */}
              {activeTab === 'new' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nama_lengkap" className="flex items-center gap-2 text-xl">
                      Nama Lengkap
                      <Badge variant="destructive" className="text-sm">Wajib</Badge>
                    </Label>
                    <Input
                      id="nama_lengkap"
                      {...form.register('nama_lengkap')}
                      placeholder="Nama lengkap pasien"
                      className="text-xl py-3"
                      autoFocus
                    />
                    {form.formState.errors.nama_lengkap && (
                      <p className="text-sm text-red-600">{form.formState.errors.nama_lengkap.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nik" className="text-xl">NIK (Opsional)</Label>
                    <Input
                      id="nik"
                      {...form.register('nik')}
                      placeholder="16 digit NIK"
                      maxLength={16}
                      className="text-xl py-3"
                    />
                    {form.formState.errors.nik && (
                      <p className="text-sm text-red-600">{form.formState.errors.nik.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir" className="flex items-center gap-2 text-xl">
                      Tanggal Lahir
                      <Badge variant="destructive" className="text-sm">Wajib</Badge>
                    </Label>
                    <Input
                      id="tanggal_lahir"
                      type="date"
                      {...form.register('tanggal_lahir', { valueAsDate: true })}
                      className="text-xl py-3"
                    />
                    {form.formState.errors.tanggal_lahir && (
                      <p className="text-sm text-red-600">{form.formState.errors.tanggal_lahir.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenis_kelamin" className="flex items-center gap-2 text-xl">
                      Jenis Kelamin
                      <Badge variant="destructive" className="text-sm">Wajib</Badge>
                    </Label>
                    <div className="flex gap-4">
                      {[
                        { value: 'L', label: 'Laki-Laki' },
                        { value: 'P', label: 'Perempuan' }
                      ].map((gender) => (
                        <label key={gender.value} className="flex items-center gap-2 cursor-pointer text-xl">
                          <input
                            type="radio"
                            {...form.register('jenis_kelamin')}
                            value={gender.value}
                            className="w-6 h-6 text-red-600"
                          />
                          <span>{gender.label}</span>
                        </label>
                      ))}
                    </div>
                    {form.formState.errors.jenis_kelamin && (
                      <p className="text-sm text-red-600">{form.formState.errors.jenis_kelamin.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="telepon" className="flex items-center gap-2 text-xl">
                      Telepon
                      <Badge variant="destructive" className="text-sm">Wajib</Badge>
                    </Label>
                    <Input
                      id="telepon"
                      {...form.register('telepon')}
                      placeholder="08xxxxxxxxxx"
                      className="text-xl py-3"
                    />
                    {form.formState.errors.telepon && (
                      <p className="text-sm text-red-600">{form.formState.errors.telepon.message}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label className="text-xl block">Cari Pasien Lama</Label>
                  <PatientSearchBar
                    onSelectPatient={(patient) => {
                      setSelectedPatient(patient)
                      form.setValue('selected_patient_id', patient.id)
                    }}
                    placeholder="Cari berdasarkan No. RM, NIK, atau nama..."
                    className="w-full"
                  />
                  {selectedPatient && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{selectedPatient.name}</h3>
                             <p className="text-gray-600">
                               No. RM: {selectedPatient.mrn || 'Belum ada'}
                              {selectedPatient.nik && ` | NIK: ${selectedPatient.nik}`}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            Dipilih
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Triage Section */}
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-red-700">
                <FaExclamationTriangle className="text-red-600 animate-pulse" />
                Tingkat Kegawatan (Triage)
                <Badge variant="destructive" className="ml-2 text-lg">Wajib</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {TRIAGE_LEVELS.map((level) => (
                  <TriageButton
                    key={level.code}
                    level={level}
                    selected={form.watch('triage_level') === level.code}
                    onClick={() => {
                      form.setValue('triage_level', level.code)
                      form.setValue('triage_codes', level.code)
                    }}
                  />
                ))}
              </div>

              <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
                <strong>Keterangan:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong className="text-red-600">Merah:</strong> Resusitasi - Darurat, panggil segera</li>
                  <li><strong className="text-yellow-600">Kuning:</strong> Urgent - Butuh perhatian cepat</li>
                  <li><strong className="text-green-600">Hijau:</strong> Non-urgent - Dapat menunggu</li>
                  <li><strong className="text-gray-600">Hitam:</strong> DOA - Sudah meninggal</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Detail Kondisi Pasien</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="keluhan_utama" className="flex items-center gap-2 text-xl">
                    Keluhan Utama
                    <Badge variant="destructive" className="text-sm">Wajib</Badge>
                  </Label>
                  <Textarea
                    id="keluhan_utama"
                    {...form.register('keluhan_utama')}
                    placeholder="Jelaskan keluhan utama pasien... (minimal 10 karakter)"
                    rows={3}
                    className="text-xl"
                  />
                  {form.formState.errors.keluhan_utama && (
                    <p className="text-sm text-red-600">{form.formState.errors.keluhan_utama.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xl">Cara Masuk</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'datang_sendiri', label: 'Datang Sendiri' },
                        { value: 'ambulans_118', label: 'Ambulans 118' },
                        { value: 'rujukan_puskesmas', label: 'Rujukan Puskesmas' },
                        { value: 'rujukan_rs_lain', label: 'Rujukan RS Lain' }
                      ].map((cara) => (
                        <label key={cara.value} className="flex items-center gap-2 cursor-pointer text-lg">
                          <input
                            type="radio"
                            {...form.register('cara_masuk')}
                            value={cara.value}
                            className="w-5 h-5 text-red-600"
                          />
                          <span>{cara.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xl">Penjamin</Label>
                    <div className="flex gap-6">
                      {[
                        { value: 'bpjs', label: 'BPJS' },
                        { value: 'umum', label: 'Umum/Cash' },
                        { value: 'asuransi_swasta', label: 'Asuransi Swasta' }
                      ].map((penjamin) => (
                        <label key={penjamin.value} className="flex items-center gap-2 cursor-pointer text-lg">
                          <input
                            type="radio"
                            {...form.register('penjamin')}
                            value={penjamin.value}
                            className="w-5 h-5 text-red-600"
                          />
                          <span>{penjamin.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={submitting}
              className="px-8 py-4 text-xl"
            >
              <FaTimes className="mr-2" />
              Reset Form
            </Button>

            <div className="transform hover:scale-105 active:scale-95 transition-transform">
              <Button
                id="submit-btn"
                type="submit"
                disabled={submitting || !form.watch('triage_level')}
                className={`
                  px-12 py-6 text-2xl font-bold rounded-lg shadow-lg transition-all
                  ${selectedTriage?.code === 'merah'
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : selectedTriage?.code === 'kuning'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-600 hover:bg-green-700'
                  }
                `}
              >
                {submitting ? (
                  <>
                    <FaClock className="mr-2 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    🆘 DAFTAR IGD
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Success Modal */}
        {successModal && successModal && selectedTriage && (
          <SuccessModal
            data={successModal}
            onClose={() => {
              setSuccessModal(null)
              fetchCurrentQueue()
              handleReset()
            }}
            triageLevel={selectedTriage}
          />
        )}

        {/* Keyboard Shortcuts Help */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2">Keyboard Shortcuts:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <span><strong>F1</strong> - Triage Merah</span>
              <span><strong>F2</strong> - Triage Kuning</span>
              <span><strong>F3</strong> - Triage Hijau</span>
              <span><strong>Ctrl+Enter</strong> - Submit</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
