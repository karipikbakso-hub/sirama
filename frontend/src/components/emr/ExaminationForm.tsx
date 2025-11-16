'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Ruler, 
  Weight, 
  Plus, 
  Trash2,
  Save,
  FileText,
  Stethoscope,
  Brain,
  Eye,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react'
import { Examination, VitalSigns, Diagnosis, Treatment, Medication, useCreateExamination, useUpdateExamination, useCompleteExamination } from '@/hooks/useEmrExamination'
import toast from '@/lib/toast'

interface ExaminationFormProps {
  examination?: Examination
  patientId: number
  registrationId: number
  doctorId: number
  isReadOnly?: boolean
  onSave?: (examination: Examination) => void
  onCancel?: () => void
}

interface FormData {
  // Anamnesis
  keluhan_utama?: string
  riwayat_penyakit_sekarang?: string
  riwayat_penyakit_dahulu?: string
  riwayat_penyakit_keluarga?: string
  riwayat_alergi?: string
  riwayat_pengobatan?: string
  
  // Physical Examination
  tanda_vital?: VitalSigns
  keadaan_umum?: string
  kesadaran?: string
  kepala?: string
  mata?: string
  telinga?: string
  hidung?: string
  tenggorokan?: string
  leher?: string
  thorax?: string
  jantung?: string
  paru?: string
  abdomen?: string
  ekstremitas?: string
  neurologi?: string
  kulit?: string
  lain_lain?: string
  
  // Diagnosis
  diagnosis?: Diagnosis[]
  diagnosis_utama?: string
  diagnosis_sekunder?: string
  diagnosis_banding?: string
  
  // Treatment Planning
  tindakan?: Treatment[]
  terapi?: Medication[]
  rencana_tindak_lanjut?: string
  tanggal_kontrol?: string
  instruksi_pasien?: string
  
  // Status
  status?: 'draft' | 'completed' | 'cancelled'
  catatan_dokter?: string
}

export default function ExaminationForm({ 
  examination, 
  patientId, 
  registrationId, 
  doctorId, 
  isReadOnly = false,
  onSave,
  onCancel 
}: ExaminationFormProps) {
  const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      status: examination?.status || 'draft',
      tanda_vital: {
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        respiration_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        bmi: ''
      },
      diagnosis: [],
      tindakan: [],
      terapi: []
    }
  })

  const createExamination = useCreateExamination()
  const updateExamination = useUpdateExamination()
  const completeExamination = useCompleteExamination()

  const watchedVitalSigns = watch('tanda_vital')

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (watchedVitalSigns?.weight && watchedVitalSigns?.height) {
      const weight = parseFloat(watchedVitalSigns.weight)
      const height = parseFloat(watchedVitalSigns.height)
      if (weight > 0 && height > 0) {
        const heightInMeters = height / 100
        const bmi = weight / (heightInMeters * heightInMeters)
        setValue('tanda_vital.bmi', Math.round(bmi * 10) / 10)
      }
    }
  }, [watchedVitalSigns?.weight, watchedVitalSigns?.height, setValue])

  // Load examination data if editing
  useEffect(() => {
    if (examination) {
      reset({
        ...examination,
        status: examination.status || 'draft',
        tanda_vital: {
          blood_pressure: examination.tanda_vital?.blood_pressure || '',
          heart_rate: examination.tanda_vital?.heart_rate || '',
          temperature: examination.tanda_vital?.temperature || '',
          respiration_rate: examination.tanda_vital?.respiration_rate || '',
          oxygen_saturation: examination.tanda_vital?.oxygen_saturation || '',
          weight: examination.tanda_vital?.weight || '',
          height: examination.tanda_vital?.height || '',
          bmi: examination.tanda_vital?.bmi || ''
        },
        diagnosis: examination.diagnosis || [],
        tindakan: examination.tindakan || [],
        terapi: examination.terapi || []
      })
    }
  }, [examination, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const examinationData = {
        ...data,
        patient_id: patientId,
        registration_id: registrationId,
        doctor_id: doctorId,
        tanggal_pemeriksaan: new Date().toISOString(),
        // Ensure empty arrays are properly handled
        diagnosis: data.diagnosis?.filter(d => d.name) || [],
        tindakan: data.tindakan?.filter(t => t.name) || [],
        terapi: data.terapi?.filter(t => t.name) || []
      }

      let result
      if (examination?.id) {
        result = await updateExamination.mutateAsync({ 
          id: examination.id, 
          data: examinationData 
        })
      } else {
        result = await createExamination.mutateAsync(examinationData)
      }

      onSave?.(result)
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  }

  const handleComplete = async () => {
    if (examination?.id) {
      try {
        const result = await completeExamination.mutateAsync(examination.id)
        onSave?.(result)
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  }

  const addDiagnosis = () => {
    const currentDiagnosis = watch('diagnosis') || []
    setValue('diagnosis', [...currentDiagnosis, { code: '', name: '', type: 'primary' }])
  }

  const removeDiagnosis = (index: number) => {
    const currentDiagnosis = watch('diagnosis') || []
    setValue('diagnosis', currentDiagnosis.filter((_, i) => i !== index))
  }

  const addTreatment = () => {
    const currentTreatments = watch('tindakan') || []
    setValue('tindakan', [...currentTreatments, { name: '', description: '' }])
  }

  const removeTreatment = (index: number) => {
    const currentTreatments = watch('tindakan') || []
    setValue('tindakan', currentTreatments.filter((_, i) => i !== index))
  }

  const addMedication = () => {
    const currentMedications = watch('terapi') || []
    setValue('terapi', [...currentMedications, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  const removeMedication = (index: number) => {
    const currentMedications = watch('terapi') || []
    setValue('terapi', currentMedications.filter((_, i) => i !== index))
  }

  const isLoading = createExamination.isPending || updateExamination.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rekam Medis Elektronik</h2>
          <p className="text-muted-foreground">
            {examination ? 'Edit Hasil Pemeriksaan' : 'Input Hasil Pemeriksaan Pasien'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {examination?.status === 'completed' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Selesai
            </Badge>
          )}
          {examination?.status === 'draft' && (
            <Badge variant="outline">
              <FileText className="w-4 h-4 mr-1" />
              Draft
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="anamnesis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="anamnesis">Anamnesis</TabsTrigger>
            <TabsTrigger value="physical">Pemeriksaan Fisik</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="planning">Perencanaan</TabsTrigger>
          </TabsList>

          {/* Anamnesis Tab */}
          <TabsContent value="anamnesis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Riwayat Anamnesis
                </CardTitle>
                <CardDescription>
                  Catatan keluhan dan riwayat penyakit pasien
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="keluhan_utama">Keluhan Utama *</Label>
                    <Controller
                      name="keluhan_utama"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Jelaskan keluhan utama pasien..."
                          className="min-h-[100px]"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riwayat_penyakit_sekarang">Riwayat Sakit Sekarang</Label>
                    <Controller
                      name="riwayat_penyakit_sekarang"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Riwayat perjalanan penyakit saat ini..."
                          className="min-h-[100px]"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="riwayat_penyakit_dahulu">Riwayat Sakit Dahulu</Label>
                    <Controller
                      name="riwayat_penyakit_dahulu"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Riwayat penyakit sebelumnya..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riwayat_penyakit_keluarga">Riwayat Sakit Keluarga</Label>
                    <Controller
                      name="riwayat_penyakit_keluarga"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Riwayat penyakit dalam keluarga..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="riwayat_alergi">Riwayat Alergi</Label>
                    <Controller
                      name="riwayat_alergi"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Riwayat alergi obat/makanan..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riwayat_pengobatan">Riwayat Pengobatan</Label>
                    <Controller
                      name="riwayat_pengobatan"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Riwayat pengobatan yang pernah dilakukan..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Examination Tab */}
          <TabsContent value="physical" className="space-y-4">
            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Tanda Vital
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blood_pressure">Tekanan Darah (mmHg)</Label>
                    <Controller
                      name="tanda_vital.blood_pressure"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="120/80"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heart_rate">Detak Jantung (bpm)</Label>
                    <Controller
                      name="tanda_vital.heart_rate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="80"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Suhu (°C)</Label>
                    <Controller
                      name="tanda_vital.temperature"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="36.5"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="respiration_rate">Pernapasan (/menit)</Label>
                    <Controller
                      name="tanda_vital.respiration_rate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="20"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oxygen_saturation">Saturasi Oksigen (%)</Label>
                    <Controller
                      name="tanda_vital.oxygen_saturation"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="98"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Berat Badan (kg)</Label>
                    <Controller
                      name="tanda_vital.weight"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="70"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Tinggi Badan (cm)</Label>
                    <Controller
                      name="tanda_vital.height"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="170"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bmi">BMI</Label>
                    <Controller
                      name="tanda_vital.bmi"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="24.2"
                          disabled={true}
                          className="bg-gray-50"
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Examination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Pemeriksaan Fisik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="keadaan_umum">Keadaan Umum</Label>
                    <Controller
                      name="keadaan_umum"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Compos mentis, tampak sakit ringan/sedang/berat..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kesadaran">Kesadaran</Label>
                    <Controller
                      name="kesadaran"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isReadOnly}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tingkat kesadaran" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compos-mentis">Compos Mentis</SelectItem>
                            <SelectItem value="somnolence">Somnolence</SelectItem>
                            <SelectItem value="sopor">Sopor</SelectItem>
                            <SelectItem value="coma">Coma</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kepala">Kepala</Label>
                    <Controller
                      name="kepala"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan kepala..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mata">Mata</Label>
                    <Controller
                      name="mata"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan mata..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telinga">Telinga</Label>
                    <Controller
                      name="telinga"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan telinga..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hidung">Hidung</Label>
                    <Controller
                      name="hidung"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan hidung..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenggorokan">Tenggorokan</Label>
                    <Controller
                      name="tenggorokan"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan tenggorokan..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leher">Leher</Label>
                    <Controller
                      name="leher"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan leher..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thorax">Thorax</Label>
                    <Controller
                      name="thorax"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan thorax..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jantung">Jantung</Label>
                    <Controller
                      name="jantung"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan jantung..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paru">Paru</Label>
                    <Controller
                      name="paru"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan paru..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abdomen">Abdomen</Label>
                    <Controller
                      name="abdomen"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan abdomen..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ekstremitas">Ekstremitas</Label>
                    <Controller
                      name="ekstremitas"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan ekstremitas..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neurologi">Neurologi</Label>
                    <Controller
                      name="neurologi"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan neurologi..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kulit">Kulit</Label>
                    <Controller
                      name="kulit"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan kulit..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lain_lain">Lain-lain</Label>
                    <Controller
                      name="lain_lain"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Pemeriksaan lainnya..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Diagnosis
                  </span>
                  {!isReadOnly && (
                    <Button type="button" onClick={addDiagnosis} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah Diagnosis
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Manual Diagnosis Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis_utama">Diagnosis Utama</Label>
                    <Controller
                      name="diagnosis_utama"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Diagnosis utama..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis_sekunder">Diagnosis Sekunder</Label>
                    <Controller
                      name="diagnosis_sekunder"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Diagnosis sekunder..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis_banding">Diagnosis Banding</Label>
                    <Controller
                      name="diagnosis_banding"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Diagnosis banding..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Structured Diagnosis List */}
                <div className="space-y-4">
                  <Label>Diagnosis Terstruktur</Label>
                  {(watch('diagnosis') || []).map((diagnosis, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Diagnosis {index + 1}</h4>
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDiagnosis(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Kode ICD-10</Label>
                          <Controller
                            name={`diagnosis.${index}.code`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Contoh: A09.9"
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Nama Diagnosis</Label>
                          <Controller
                            name={`diagnosis.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Nama diagnosis..."
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Jenis</Label>
                          <Controller
                            name={`diagnosis.${index}.type`}
                            control={control}
                            render={({ field }) => (
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                                disabled={isReadOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="primary">Utama</SelectItem>
                                  <SelectItem value="secondary">Sekunder</SelectItem>
                                  <SelectItem value="differential">Banding</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Planning Tab */}
          <TabsContent value="planning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Perencanaan Pengobatan
                  </span>
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Button type="button" onClick={addTreatment} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Tindakan
                      </Button>
                      <Button type="button" onClick={addMedication} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Obat
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Treatment Plans */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Tindakan</Label>
                  {(watch('tindakan') || []).map((treatment, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Tindakan {index + 1}</h4>
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTreatment(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Nama Tindakan</Label>
                          <Controller
                            name={`tindakan.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Nama tindakan..."
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Deskripsi</Label>
                          <Controller
                            name={`tindakan.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Deskripsi tindakan..."
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Medications */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Obat-obat</Label>
                  {(watch('terapi') || []).map((medication, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Obat {index + 1}</h4>
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMedication(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-2">
                          <Label>Nama Obat</Label>
                          <Controller
                            name={`terapi.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Nama obat..."
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Dosis</Label>
                          <Controller
                            name={`terapi.${index}.dosage`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Contoh: 500mg"
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Frekuensi</Label>
                          <Controller
                            name={`terapi.${index}.frequency`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Contoh: 3x sehari"
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Durasi</Label>
                          <Controller
                            name={`terapi.${index}.duration`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Contoh: 7 hari"
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Follow-up Plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rencana_tindak_lanjut">Rencana Tindak Lanjut</Label>
                    <Controller
                      name="rencana_tindak_lanjut"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Rencana tindak lanjut..."
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tanggal_kontrol">Tanggal Kontrol</Label>
                    <Controller
                      name="tanggal_kontrol"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instruksi_pasien">Instruksi untuk Pasien</Label>
                  <Controller
                    name="instruksi_pasien"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Instruksi khusus untuk pasien..."
                        disabled={isReadOnly}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="catatan_dokter">Catatan Dokter</Label>
                  <Controller
                    name="catatan_dokter"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Catatan tambahan dokter..."
                        disabled={isReadOnly}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="flex justify-end gap-3 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
            )}
            
            {examination?.status !== 'completed' && (
              <>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan Draft'}
                </Button>

                {examination?.id && (
                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={isLoading || completeExamination.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {completeExamination.isPending ? 'Menyelesaikan...' : 'Selesai'}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
