'use client'

import { useState } from 'react'
import { Patient } from '@/types/role/pendaftaran'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Alert, AlertDescription } from './alert'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { MdEdit, MdPerson, MdLocationOn, MdPhone, MdCreditCard, MdHealthAndSafety, MdWarning } from 'react-icons/md'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePut } from '@/hooks/useApi'
import { differenceInYears } from 'date-fns'

const biodataSchema = z.object({
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  telepon: z.string().optional(),
  alergi: z.string().optional(),
  penyakit_kronis: z.string().optional(),
})

type BiodataForm = z.infer<typeof biodataSchema>

interface PatientBiodataTabProps {
  patient: Patient
  onUpdate: () => void
}

export function PatientBiodataTab({ patient, onUpdate }: PatientBiodataTabProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [originalData, setOriginalData] = useState<BiodataForm | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<BiodataForm>({
    resolver: zodResolver(biodataSchema),
    defaultValues: {
      alamat: patient.address,
      telepon: patient.phone || '',
      alergi: patient.allergies || '',
      penyakit_kronis: patient.chronic_diseases || '',
    }
  })

  const watchedValues = watch()

  const updateMutation = usePut(`/api/pendaftaran/pasien/${patient.id}`, {
    onSuccess: () => {
      setIsEditModalOpen(false)
      setShowPreview(false)
      setOriginalData(null)
      onUpdate()
    }
  })

  const onSubmit = (data: BiodataForm) => {
    if (!showPreview) {
      // Check for suspicious changes
      const hasSuspiciousChanges = checkSuspiciousChanges(data)

      if (hasSuspiciousChanges) {
        // Show additional warning for suspicious changes
        setOriginalData({
          alamat: patient.address,
          telepon: patient.phone || '',
          alergi: patient.allergies || '',
          penyakit_kronis: patient.chronic_diseases || '',
        })
        setShowPreview(true)
      } else {
        // Show normal preview
        setOriginalData({
          alamat: patient.address,
          telepon: patient.phone || '',
          alergi: patient.allergies || '',
          penyakit_kronis: patient.chronic_diseases || '',
        })
        setShowPreview(true)
      }
    } else {
      // Actually save
      updateMutation.mutate(data)
    }
  }

  const checkSuspiciousChanges = (data: BiodataForm) => {
    // Check if critical fields are being changed
    // Note: In real implementation, this would compare with original patient data
    // For now, we'll flag any changes as potentially suspicious
    return true // Simplified - in production, check against original values
  }

  const hasChanges = () => {
    if (!originalData) return false
    return JSON.stringify(originalData) !== JSON.stringify(watchedValues)
  }

  const age = differenceInYears(new Date(), new Date(patient.birth_date))

  return (
    <div className="space-y-6">
      {/* Identitas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdPerson />
            Identitas Pasien
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">No. RM</Label>
              <p className="font-mono">{patient.mrn}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">NIK</Label>
              <p className="font-mono">
                {patient.nik ? `****${patient.nik.slice(-4)}` : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Lengkap</Label>
              <p>{patient.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tanggal Lahir</Label>
              <p>{new Date(patient.birth_date).toLocaleDateString('id-ID')} ({age} tahun)</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Jenis Kelamin</Label>
              <p>{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Golongan Darah</Label>
              <p>{patient.blood_type || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alamat & Kontak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdLocationOn />
              Alamat & Kontak
            </div>
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <MdEdit className="mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className={showPreview ? "max-w-4xl" : "max-w-md"}>
                <DialogHeader>
                  <DialogTitle>
                    {showPreview ? "Konfirmasi Perubahan Biodata" : "Edit Biodata Pasien"}
                  </DialogTitle>
                </DialogHeader>

                {showPreview && originalData ? (
                  <div className="space-y-6">
                    {/* Suspicious Changes Warning */}
                    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                      <MdWarning className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800 dark:text-orange-200">
                        <strong>Perhatian:</strong> Perubahan data pasien memerlukan konfirmasi ekstra.
                        Pastikan data yang diubah sudah benar dan sesuai dengan identitas pasien.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-red-600 mb-3">Data Lama</h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>Alamat:</strong> {originalData.alamat}</div>
                          <div><strong>Telepon:</strong> {originalData.telepon || 'N/A'}</div>
                          <div><strong>Alergi:</strong> {originalData.alergi || 'Tidak ada'}</div>
                          <div><strong>Penyakit Kronis:</strong> {originalData.penyakit_kronis || 'Tidak ada'}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-600 mb-3">Data Baru</h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>Alamat:</strong> {watchedValues.alamat}</div>
                          <div><strong>Telepon:</strong> {watchedValues.telepon || 'N/A'}</div>
                          <div><strong>Alergi:</strong> {watchedValues.alergi || 'Tidak ada'}</div>
                          <div><strong>Penyakit Kronis:</strong> {watchedValues.penyakit_kronis || 'Tidak ada'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(false)}
                      >
                        Edit Lagi
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditModalOpen(false)
                          setShowPreview(false)
                          setOriginalData(null)
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updateMutation.isPending ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="alamat">Alamat</Label>
                      <Textarea
                        id="alamat"
                        {...register('alamat')}
                        placeholder="Masukkan alamat lengkap"
                      />
                      {errors.alamat && (
                        <p className="text-sm text-red-600 mt-1">{errors.alamat.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="telepon">Telepon</Label>
                      <Input
                        id="telepon"
                        {...register('telepon')}
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="alergi">Alergi</Label>
                      <Input
                        id="alergi"
                        {...register('alergi')}
                        placeholder="Masukkan alergi jika ada"
                      />
                    </div>
                    <div>
                      <Label htmlFor="penyakit_kronis">Penyakit Kronis</Label>
                      <Input
                        id="penyakit_kronis"
                        {...register('penyakit_kronis')}
                        placeholder="Masukkan penyakit kronis jika ada"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Alamat</Label>
            <p>{patient.address}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Telepon</Label>
            <p>{patient.phone || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Asuransi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdCreditCard />
            Asuransi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</Label>
            <Badge variant={patient.insurance_status === 'BPJS' ? 'default' : 'secondary'}>
              {patient.insurance_status}
            </Badge>
          </div>
          {patient.bpjs_number && (
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">No. BPJS</Label>
              <p className="font-mono">{patient.bpjs_number}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Riwayat Kesehatan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdHealthAndSafety />
            Riwayat Kesehatan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Alergi</Label>
            <p>{patient.allergies || 'Tidak ada'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Penyakit Kronis</Label>
            <p>{patient.chronic_diseases || 'Tidak ada'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}