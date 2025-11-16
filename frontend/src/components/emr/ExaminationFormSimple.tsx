'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, X, Heart, Thermometer, Activity, Weight, Ruler } from 'lucide-react'

interface VitalSigns {
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  respiratory_rate?: number
  oxygen_saturation?: number
  weight?: number
  height?: number
  bmi?: number
}

interface PhysicalExamination {
  general?: string
  head_neck?: string
  cardiovascular?: string
  respiratory?: string
  gastrointestinal?: string
  genitourinary?: string
  musculoskeletal?: string
  neurological?: string
  psychiatric?: string
}

interface ExaminationData {
  chief_complaint: string
  present_illness: string
  past_medical_history?: string
  family_history?: string
  social_history?: string
  allergies?: string
  vital_signs: VitalSigns
  physical_examination: PhysicalExamination
  diagnosis?: string
  icd10_code?: string
  treatment_plan?: string
  prescriptions?: string
  follow_up_instructions?: string
}

interface ExaminationFormSimpleProps {
  patientName: string
  patientId: number
  registrationId?: number
  initialData?: Partial<ExaminationData>
  onSave: (data: ExaminationData) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
}

export default function ExaminationFormSimple({
  patientName,
  patientId,
  registrationId,
  initialData,
  onSave,
  onCancel,
  loading = false
}: ExaminationFormSimpleProps) {
  const [formData, setFormData] = useState<ExaminationData>({
    chief_complaint: initialData?.chief_complaint || '',
    present_illness: initialData?.present_illness || '',
    past_medical_history: initialData?.past_medical_history || '',
    family_history: initialData?.family_history || '',
    social_history: initialData?.social_history || '',
    allergies: initialData?.allergies || '',
    vital_signs: initialData?.vital_signs || {},
    physical_examination: initialData?.physical_examination || {},
    diagnosis: initialData?.diagnosis || '',
    icd10_code: initialData?.icd10_code || '',
    treatment_plan: initialData?.treatment_plan || '',
    prescriptions: initialData?.prescriptions || '',
    follow_up_instructions: initialData?.follow_up_instructions || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.chief_complaint.trim() || !formData.present_illness.trim()) {
      alert('Keluhan utama dan riwayat penyakit sekarang harus diisi')
      return
    }

    const success = await onSave(formData)
    if (success) {
      alert('Pemeriksaan berhasil disimpan')
    } else {
      alert('Gagal menyimpan pemeriksaan')
    }
  }

  const updateVitalSigns = (field: keyof VitalSigns, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [field]: value
      }
    }))
  }

  const updatePhysicalExam = (field: keyof PhysicalExamination, value: string) => {
    setFormData(prev => ({
      ...prev,
      physical_examination: {
        ...prev.physical_examination,
        [field]: value
      }
    }))
  }

  const calculateBMI = () => {
    const weight = formData.vital_signs.weight
    const height = formData.vital_signs.height

    if (weight && height) {
      const heightInMeters = height / 100
      const bmi = weight / (heightInMeters * heightInMeters)
      updateVitalSigns('bmi', Math.round(bmi * 10) / 10)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pemeriksaan Medis</h2>
          <p className="text-muted-foreground">Pasien: {patientName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Informasi Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_name">Nama Pasien</Label>
                <Input
                  id="patient_name"
                  value={patientName}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="patient_id">ID Pasien</Label>
                <Input
                  id="patient_id"
                  value={patientId}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chief Complaint & Present Illness */}
        <Card>
          <CardHeader>
            <CardTitle>Anamnesis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chief_complaint">Keluhan Utama *</Label>
              <Textarea
                id="chief_complaint"
                value={formData.chief_complaint}
                onChange={(e) => setFormData(prev => ({ ...prev, chief_complaint: e.target.value }))}
                placeholder="Jelaskan keluhan utama pasien..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="present_illness">Riwayat Penyakit Sekarang *</Label>
              <Textarea
                id="present_illness"
                value={formData.present_illness}
                onChange={(e) => setFormData(prev => ({ ...prev, present_illness: e.target.value }))}
                placeholder="Jelaskan riwayat penyakit yang diderita sekarang..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="past_medical_history">Riwayat Penyakit Dahulu</Label>
                <Textarea
                  id="past_medical_history"
                  value={formData.past_medical_history}
                  onChange={(e) => setFormData(prev => ({ ...prev, past_medical_history: e.target.value }))}
                  placeholder="Riwayat penyakit sebelumnya..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="family_history">Riwayat Keluarga</Label>
                <Textarea
                  id="family_history"
                  value={formData.family_history}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_history: e.target.value }))}
                  placeholder="Riwayat penyakit keluarga..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="social_history">Riwayat Sosial</Label>
                <Textarea
                  id="social_history"
                  value={formData.social_history}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_history: e.target.value }))}
                  placeholder="Pekerjaan, kebiasaan, dll..."
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="allergies">Alergi</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="Alergi obat, makanan, dll..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Tanda Vital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="blood_pressure">Tekanan Darah</Label>
                <Input
                  id="blood_pressure"
                  value={formData.vital_signs.blood_pressure || ''}
                  onChange={(e) => updateVitalSigns('blood_pressure', e.target.value)}
                  placeholder="120/80 mmHg"
                />
              </div>

              <div>
                <Label htmlFor="heart_rate">Denyut Jantung</Label>
                <Input
                  id="heart_rate"
                  type="number"
                  value={formData.vital_signs.heart_rate || ''}
                  onChange={(e) => updateVitalSigns('heart_rate', parseInt(e.target.value) || undefined)}
                  placeholder="bpm"
                />
              </div>

              <div>
                <Label htmlFor="temperature">Suhu</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.vital_signs.temperature || ''}
                  onChange={(e) => updateVitalSigns('temperature', parseFloat(e.target.value) || undefined)}
                  placeholder="°C"
                />
              </div>

              <div>
                <Label htmlFor="respiratory_rate">Pernapasan</Label>
                <Input
                  id="respiratory_rate"
                  type="number"
                  value={formData.vital_signs.respiratory_rate || ''}
                  onChange={(e) => updateVitalSigns('respiratory_rate', parseInt(e.target.value) || undefined)}
                  placeholder="/menit"
                />
              </div>

              <div>
                <Label htmlFor="oxygen_saturation">SpO2</Label>
                <Input
                  id="oxygen_saturation"
                  type="number"
                  value={formData.vital_signs.oxygen_saturation || ''}
                  onChange={(e) => updateVitalSigns('oxygen_saturation', parseInt(e.target.value) || undefined)}
                  placeholder="%"
                />
              </div>

              <div>
                <Label htmlFor="weight">Berat Badan</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.vital_signs.weight || ''}
                  onChange={(e) => updateVitalSigns('weight', parseFloat(e.target.value) || undefined)}
                  placeholder="kg"
                  onBlur={calculateBMI}
                />
              </div>

              <div>
                <Label htmlFor="height">Tinggi Badan</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.vital_signs.height || ''}
                  onChange={(e) => updateVitalSigns('height', parseFloat(e.target.value) || undefined)}
                  placeholder="cm"
                  onBlur={calculateBMI}
                />
              </div>

              <div>
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  value={formData.vital_signs.bmi || ''}
                  readOnly
                  className="bg-muted"
                  placeholder="Otomatis"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical Examination */}
        <Card>
          <CardHeader>
            <CardTitle>Pemeriksaan Fisik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="general">Keadaan Umum</Label>
                <Textarea
                  id="general"
                  value={formData.physical_examination.general || ''}
                  onChange={(e) => updatePhysicalExam('general', e.target.value)}
                  placeholder="Keadaan umum pasien..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="head_neck">Kepala & Leher</Label>
                <Textarea
                  id="head_neck"
                  value={formData.physical_examination.head_neck || ''}
                  onChange={(e) => updatePhysicalExam('head_neck', e.target.value)}
                  placeholder="Pemeriksaan kepala dan leher..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="cardiovascular">Sistem Kardiovaskular</Label>
                <Textarea
                  id="cardiovascular"
                  value={formData.physical_examination.cardiovascular || ''}
                  onChange={(e) => updatePhysicalExam('cardiovascular', e.target.value)}
                  placeholder="Jantung, pembuluh darah..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="respiratory">Sistem Pernapasan</Label>
                <Textarea
                  id="respiratory"
                  value={formData.physical_examination.respiratory || ''}
                  onChange={(e) => updatePhysicalExam('respiratory', e.target.value)}
                  placeholder="Paru-paru, pernapasan..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="gastrointestinal">Sistem Pencernaan</Label>
                <Textarea
                  id="gastrointestinal"
                  value={formData.physical_examination.gastrointestinal || ''}
                  onChange={(e) => updatePhysicalExam('gastrointestinal', e.target.value)}
                  placeholder="Perut, usus..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="genitourinary">Sistem Kemih</Label>
                <Textarea
                  id="genitourinary"
                  value={formData.physical_examination.genitourinary || ''}
                  onChange={(e) => updatePhysicalExam('genitourinary', e.target.value)}
                  placeholder="Ginjal, saluran kemih..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="musculoskeletal">Sistem Gerak</Label>
                <Textarea
                  id="musculoskeletal"
                  value={formData.physical_examination.musculoskeletal || ''}
                  onChange={(e) => updatePhysicalExam('musculoskeletal', e.target.value)}
                  placeholder="Otot, tulang, sendi..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="neurological">Sistem Saraf</Label>
                <Textarea
                  id="neurological"
                  value={formData.physical_examination.neurological || ''}
                  onChange={(e) => updatePhysicalExam('neurological', e.target.value)}
                  placeholder="Sistem saraf..."
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="psychiatric">Status Psikiatri</Label>
              <Textarea
                id="psychiatric"
                value={formData.physical_examination.psychiatric || ''}
                onChange={(e) => updatePhysicalExam('psychiatric', e.target.value)}
                placeholder="Status mental dan psikiatri..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis & Treatment */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnosis & Rencana Tindakan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Diagnosis medis..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="icd10_code">Kode ICD-10</Label>
                <Input
                  id="icd10_code"
                  value={formData.icd10_code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, icd10_code: e.target.value }))}
                  placeholder="Kode ICD-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="treatment_plan">Rencana Tindakan</Label>
              <Textarea
                id="treatment_plan"
                value={formData.treatment_plan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment_plan: e.target.value }))}
                placeholder="Rencana pengobatan dan tindakan..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="prescriptions">Resep Obat</Label>
              <Textarea
                id="prescriptions"
                value={formData.prescriptions || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, prescriptions: e.target.value }))}
                placeholder="Resep obat yang diberikan..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="follow_up_instructions">Instruksi Tindak Lanjut</Label>
              <Textarea
                id="follow_up_instructions"
                value={formData.follow_up_instructions || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, follow_up_instructions: e.target.value }))}
                placeholder="Instruksi untuk kontrol berikutnya..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
