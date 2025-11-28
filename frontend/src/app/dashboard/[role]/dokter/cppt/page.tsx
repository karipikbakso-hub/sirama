'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFetch, usePost } from '@/hooks/useApi'
import { toast } from '@/lib/toast'
import { z } from 'zod'
import {
  User,
  Heart,
  Thermometer,
  Activity,
  Wind,
  Weight,
  Ruler,
  Plus,
  Pill,
  TestTube,
  ScanLine,
  Save,
  Send,
  AlertTriangle,
  Clock
} from 'lucide-react'

// Zod Schema untuk validasi CPPT form
const cpptSchema = z.object({
  subjective: z.string().min(10, 'Subjective minimal 10 karakter'),
  objective: z.string().min(10, 'Objective minimal 10 karakter'),
  assessment: z.array(z.object({
    icd10_code: z.string().min(1, 'ICD-10 code wajib diisi'),
    icd10_name: z.string().min(1, 'Nama diagnosis wajib diisi'),
    diagnosis_type: z.enum(['primary', 'secondary'])
  })).min(1, 'Minimal 1 diagnosis primer wajib'),
  plan: z.string().min(10, 'Plan minimal 10 karakter')
})

type CpptFormData = z.infer<typeof cpptSchema>

// Types
interface Patient {
  id: number
  medical_record_number: string
  full_name: string
  date_of_birth: string
  gender: 'L' | 'P'
  allergies: string | null
  phone: string
  address: string
}

interface Registration {
  id: number
  registration_date: string
  complaint: string
  doctor_name: string
}

interface VitalSigns {
  id: number
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  heart_rate: number | null
  temperature: number | null
  respiration_rate: number | null
  oxygen_saturation: number | null
  weight: number | null
  height: number | null
  measured_at: string
}

interface Icd10Option {
  id: number
  kode_icd: string
  nama_diagnosa: string
  kategori: string
}

export default function CpptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get registration_id from search params or URL path
  let registrationId = searchParams?.get('registration_id')
  let patientId = searchParams?.get('patient_id')

  // Fallback: try to get from URL if searchParams is null
  if (!registrationId && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    registrationId = urlParams.get('registration_id')
    patientId = urlParams.get('patient_id')
  }

  // Debug logging
  console.log('CPPT Page Debug:', {
    searchParams: searchParams?.toString(),
    registrationId,
    patientId,
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    fallbackUsed: !searchParams?.get('registration_id') && registrationId
  })

  // Find latest registration for patient if only patient_id is provided
  useEffect(() => {
    const findLatestRegistration = async () => {
      if (!patientId || registrationId) return

      setFindingRegistration(true)
      try {
        // Get patient's registrations
        const response = await fetch(`/api/registrations?patient_id=${patientId}&per_page=1`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()

        if (data.success && data.data.data && data.data.data.length > 0) {
          const latestRegistration = data.data.data[0]
          // Update URL with registration_id
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set('registration_id', latestRegistration.id.toString())
          window.history.replaceState({}, '', newUrl.toString())

          // Trigger page reload with new registration_id
          window.location.reload()
        } else {
          // No registration found, show error
          console.error('No registration found for patient')
        }
      } catch (error) {
        console.error('Failed to find registration:', error)
        setFindingRegistration(false)
      } finally {
        setFindingRegistration(false)
      }
    }

    findLatestRegistration()
  }, [patientId, registrationId])

  const [icd10Search, setIcd10Search] = useState('')
  const [icd10Options, setIcd10Options] = useState<Icd10Option[]>([])
  const [showIcd10Dropdown, setShowIcd10Dropdown] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [findingRegistration, setFindingRegistration] = useState(false)

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CpptFormData>({
    resolver: zodResolver(cpptSchema),
    defaultValues: {
      subjective: '',
      objective: '',
      assessment: [],
      plan: ''
    }
  })

  const assessment = watch('assessment')

  // API calls
  const { data: registrationData, isLoading: registrationLoading } = useFetch<{
    success: boolean
    data: Registration & { patient: Patient }
  }>(registrationId ? `/api/registrations/${registrationId}` : '', {
    enabled: !!registrationId
  })

  const { data: vitalSignsData, isLoading: vitalSignsLoading } = useFetch<{
    success: boolean
    data: VitalSigns[]
  }>(registrationId ? `/api/vital-signs?registration_id=${registrationId}` : '', {
    enabled: !!registrationId
  })

  const saveCpptMutation = usePost('/api/doctor/cppt/' + (registrationId || '') + '/save')
  const saveDiagnosesMutation = usePost('/api/diagnoses')

  // Auto-save mechanism
  const autoSaveDraft = useCallback(async () => {
    if (!registrationId) return

    const formData = getValues()
    if (!formData.subjective && !formData.objective && !formData.plan && formData.assessment.length === 0) {
      return // Don't save empty draft
    }

    try {
      setIsAutoSaving(true)
      const draftKey = `cppt-draft-${registrationId}-${localStorage.getItem('user_id') || 'unknown'}`
      const draftData = {
        ...formData,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(draftKey, JSON.stringify(draftData))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [registrationId, getValues])

  // Load draft on mount
  useEffect(() => {
    if (!registrationId) return

    const draftKey = `cppt-draft-${registrationId}-${localStorage.getItem('user_id') || 'unknown'}`
    const draftData = localStorage.getItem(draftKey)

    if (draftData) {
      try {
        const parsed = JSON.parse(draftData)
        reset({
          subjective: parsed.subjective || '',
          objective: parsed.objective || '',
          assessment: parsed.assessment || [],
          plan: parsed.plan || ''
        })
        toast.success('Draft CPPT berhasil dimuat')
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [registrationId, reset])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!registrationId) return

    const interval = setInterval(autoSaveDraft, 30000)
    return () => clearInterval(interval)
  }, [registrationId, autoSaveDraft])

  // ICD-10 search
  useEffect(() => {
    if (icd10Search.length >= 2) {
      const searchIcd10 = async () => {
        try {
          const response = await fetch(`/api/icd10-diagnoses?search=${encodeURIComponent(icd10Search)}&per_page=10`)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          const data = await response.json()
          if (data.success) {
            setIcd10Options(data.data.data || [])
            setShowIcd10Dropdown(true)
          } else {
            console.error('ICD-10 search failed:', data.message)
            setIcd10Options([])
            setShowIcd10Dropdown(false)
          }
        } catch (error) {
          console.error('ICD-10 search error:', error)
          setIcd10Options([])
          setShowIcd10Dropdown(false)
        }
      }
      searchIcd10()
    } else {
      setIcd10Options([])
      setShowIcd10Dropdown(false)
    }
  }, [icd10Search])

  // Handle ICD-10 selection
  const handleIcd10Select = (icd10: Icd10Option, type: 'primary' | 'secondary') => {
    const newAssessment = [...assessment]
    const existingIndex = newAssessment.findIndex(item => item.diagnosis_type === type)

    const diagnosis = {
      icd10_code: icd10.kode_icd,
      icd10_name: icd10.nama_diagnosa,
      diagnosis_type: type
    }

    if (existingIndex >= 0) {
      newAssessment[existingIndex] = diagnosis
    } else {
      newAssessment.push(diagnosis)
    }

    setValue('assessment', newAssessment)
    setIcd10Search('')
    setShowIcd10Dropdown(false)
  }

  // Remove diagnosis
  const removeDiagnosis = (index: number) => {
    const newAssessment = assessment.filter((_, i) => i !== index)
    setValue('assessment', newAssessment)
  }

  // Submit CPPT
  const onSubmit = async (data: CpptFormData) => {
    if (!registrationId) return

    // Confirmation dialog
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menyimpan CPPT ini? Data yang sudah disimpan tidak dapat diubah.'
    )

    if (!confirmed) return

    try {
      // Save CPPT
      await saveCpptMutation.mutateAsync({
        subjektif: data.subjective,
        objektif: data.objective,
        asesmen: data.assessment.map(d => `${d.icd10_code} - ${d.icd10_name}`).join('; '),
        planning: data.plan,
        status: 'final'
      })

      // Save diagnoses
      const diagnosisPromises = data.assessment.map(diagnosis =>
        saveDiagnosesMutation.mutateAsync({
          pasien_id: registrationData?.data.patient.id,
          registrasi_id: parseInt(registrationId),
          diagnosis_id: null, // Will be handled by backend
          tipe_diagnosis: diagnosis.diagnosis_type === 'primary' ? 'utama' : 'sekunder',
          kepastian: 'terkonfirmasi',
          catatan: diagnosis.icd10_name
        })
      )

      await Promise.all(diagnosisPromises)

      // Clear draft
      const draftKey = `cppt-draft-${registrationId}-${localStorage.getItem('user_id') || 'unknown'}`
      localStorage.removeItem(draftKey)

      toast.success('CPPT berhasil disimpan')
      router.push('/dashboard/dokter/emr')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan CPPT')
    }
  }

  // Quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'prescription':
        router.push(`/dashboard/dokter/prescription?registration_id=${registrationId}`)
        break
      case 'lab':
        router.push(`/dashboard/dokter/order-lab?registration_id=${registrationId}`)
        break
      case 'radiology':
        router.push(`/dashboard/dokter/order-rad?registration_id=${registrationId}`)
        break
    }
  }

  if (!registrationId) {
    if (findingRegistration) {
      return <CpptSkeleton />
    }

    return (
      <div className="space-y-6">
        <PageHeader title="CPPT Form" description="Form Catatan Perkembangan Pasien Terintegrasi" />
        <Alert variant="destructive">
          <AlertDescription className="space-y-3">
            <div>
              <strong>Registration ID tidak ditemukan.</strong>
            </div>
            <div>
              CPPT harus dibuat dari halaman EMR pasien. Silakan ikuti langkah berikut:
            </div>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Buka halaman <strong>EMR</strong> (/dashboard/dokter/emr)</li>
              <li>Cari dan pilih pasien</li>
              <li>Klik tab <strong>"Riwayat"</strong></li>
              <li>Klik tombol <strong>"Buat CPPT"</strong> pada kunjungan yang diinginkan</li>
            </ol>
            <div className="pt-2">
              <Button
                onClick={() => router.push('/dashboard/dokter/emr')}
                variant="outline"
              >
                Kembali ke EMR
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (registrationLoading) {
    return <CpptSkeleton />
  }

  const patient = registrationData?.data.patient
  const registration = registrationData?.data
  const latestVitals = vitalSignsData?.data?.[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="CPPT Form"
        description="Form Catatan Perkembangan Pasien Terintegrasi"
      />

      {/* Patient Info & Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{patient?.full_name}</h3>
              <p className="text-sm text-gray-600">RM: {patient?.medical_record_number}</p>
            </div>
          </div>

          {patient?.allergies && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Alergi:</strong> {patient.allergies}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tanggal Lahir:</span>
              <span>{patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('id-ID') : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Jenis Kelamin:</span>
              <span>{patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telepon:</span>
              <span>{patient?.phone || '-'}</span>
            </div>
          </div>
        </Card>

        {/* Vital Signs */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Tanda Vital Terbaru
          </h4>

          {vitalSignsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : latestVitals ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Heart className="w-4 h-4 mr-2" />
                  <span className="text-sm">Tekanan Darah</span>
                </div>
                <span className="font-medium">
                  {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic} mmHg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Activity className="w-4 h-4 mr-2" />
                  <span className="text-sm">Denyut Jantung</span>
                </div>
                <span className="font-medium">{latestVitals.heart_rate} bpm</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Thermometer className="w-4 h-4 mr-2" />
                  <span className="text-sm">Suhu</span>
                </div>
                <span className="font-medium">{latestVitals.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <Wind className="w-4 h-4 mr-2" />
                  <span className="text-sm">Pernapasan</span>
                </div>
                <span className="font-medium">{latestVitals.respiration_rate}/menit</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Belum ada data tanda vital</p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <Button
              onClick={() => handleQuickAction('prescription')}
              className="w-full justify-start"
              variant="outline"
            >
              <Pill className="w-4 h-4 mr-2" />
              Buat Resep
            </Button>
            <Button
              onClick={() => handleQuickAction('lab')}
              className="w-full justify-start"
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Order Lab
            </Button>
            <Button
              onClick={() => handleQuickAction('radiology')}
              className="w-full justify-start"
              variant="outline"
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Order Radiologi
            </Button>
          </div>
        </Card>
      </div>

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          {isAutoSaving ? 'Menyimpan draft...' : `Draft tersimpan ${lastSaved.toLocaleTimeString('id-ID')}`}
        </div>
      )}

      {/* CPPT Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SOAP Form - Desktop: 2 columns, Mobile: 1 column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Subjective & Objective */}
          <div className="space-y-6">
            {/* Subjective */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-blue-600">S - Subjective</h4>
              <p className="text-sm text-gray-600 mb-4">
                Keluhan pasien, riwayat penyakit, dll.
              </p>
              <Textarea
                {...register('subjective')}
                placeholder="Masukkan keluhan pasien, riwayat penyakit sekarang, riwayat pengobatan sebelumnya, dll."
                className="min-h-[120px]"
              />
              {errors.subjective && (
                <p className="text-red-500 text-sm mt-1">{errors.subjective.message}</p>
              )}
            </Card>

            {/* Objective */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-green-600">O - Objective</h4>
              <p className="text-sm text-gray-600 mb-4">
                Pemeriksaan fisik, hasil lab, tanda vital, dll.
              </p>
              <Textarea
                {...register('objective')}
                placeholder="Masukkan hasil pemeriksaan fisik, tanda vital, hasil pemeriksaan penunjang, dll."
                className="min-h-[120px]"
              />
              {errors.objective && (
                <p className="text-red-500 text-sm mt-1">{errors.objective.message}</p>
              )}
            </Card>
          </div>

          {/* Right Column: Assessment & Plan */}
          <div className="space-y-6">
            {/* Assessment */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-orange-600">A - Assessment</h4>
              <p className="text-sm text-gray-600 mb-4">
                Diagnosis dan penilaian kondisi pasien.
              </p>

              {/* Diagnosis List */}
              <div className="space-y-3 mb-4">
                {assessment.map((diagnosis, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {diagnosis.icd10_code} - {diagnosis.icd10_name}
                        </span>
                        <Badge variant={diagnosis.diagnosis_type === 'primary' ? 'default' : 'secondary'}>
                          {diagnosis.diagnosis_type === 'primary' ? 'Primer' : 'Sekunder'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeDiagnosis(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>

              {/* ICD-10 Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari diagnosis ICD-10..."
                  value={icd10Search}
                  onChange={(e) => setIcd10Search(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* ICD-10 Dropdown */}
                {showIcd10Dropdown && icd10Options.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {icd10Options.map((icd10) => (
                      <div key={icd10.id} className="border-b border-gray-100 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => handleIcd10Select(icd10, 'primary')}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50"
                        >
                          <div className="font-medium text-gray-900">
                            {icd10.kode_icd} - {icd10.nama_diagnosa}
                          </div>
                          <div className="text-sm text-gray-500">{icd10.kategori}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIcd10Select(icd10, 'secondary')}
                          className="w-full px-4 py-2 text-left hover:bg-green-50 text-sm text-gray-600"
                        >
                          + Tambah sebagai sekunder
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errors.assessment && (
                <p className="text-red-500 text-sm mt-1">{errors.assessment.message}</p>
              )}
            </Card>

            {/* Plan */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-purple-600">P - Plan</h4>
              <p className="text-sm text-gray-600 mb-4">
                Rencana tindakan, terapi, follow-up, dll.
              </p>
              <Textarea
                {...register('plan')}
                placeholder="Masukkan rencana tindakan medis, terapi, edukasi pasien, follow-up, dll."
                className="min-h-[120px]"
              />
              {errors.plan && (
                <p className="text-red-500 text-sm mt-1">{errors.plan.message}</p>
              )}
            </Card>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={autoSaveDraft}
            variant="outline"
            disabled={isAutoSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isAutoSaving ? 'Menyimpan...' : 'Simpan Draft'}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || saveCpptMutation.isPending || saveDiagnosesMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Menyimpan...' : 'Submit CPPT'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Skeleton Component
function CpptSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="CPPT Form" description="Form Catatan Perkembangan Pasien Terintegrasi" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    </div>
  )
}