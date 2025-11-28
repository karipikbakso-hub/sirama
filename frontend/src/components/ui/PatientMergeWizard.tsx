'use client'

import { useState, useEffect } from 'react'
import { Patient } from '@/types/role/pendaftaran'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Label } from './label'
import { Alert, AlertDescription } from './alert'
import { MdMerge, MdCheckCircle, MdWarning, MdPerson, MdArrowForward } from 'react-icons/md'
import { usePost, useGet } from '@/hooks/useApi'
import toast from '@/lib/toast'

interface PatientMergeWizardProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface DuplicatePatient extends Patient {
  similarity_score: number
  match_reasons: string[]
}

export function PatientMergeWizard({ patient, isOpen, onClose, onSuccess }: PatientMergeWizardProps) {
  const [step, setStep] = useState<'detect' | 'select' | 'preview' | 'confirm'>('detect')
  const [duplicates, setDuplicates] = useState<DuplicatePatient[]>([])
  const [selectedMaster, setSelectedMaster] = useState<Patient | null>(null)
  const [selectedDuplicates, setSelectedDuplicates] = useState<Patient[]>([])

  // Detect duplicates
  const { data: detectedDuplicates, isLoading: detecting } = useGet<DuplicatePatient[]>(
    `/api/pendaftaran/pasien/detect-duplicate?pasien_id=${patient.id}`,
    {
      enabled: isOpen && step === 'detect'
    }
  )

  // Merge mutation
  const mergeMutation = usePost('/api/pendaftaran/pasien/merge', {
    onSuccess: () => {
      toast.success('Data pasien berhasil digabungkan')
      onSuccess()
      onClose()
      resetWizard()
    }
  })

  useEffect(() => {
    if (detectedDuplicates) {
      setDuplicates(detectedDuplicates)
      if (detectedDuplicates.length > 0) {
        setStep('select')
      }
    }
  }, [detectedDuplicates])

  const resetWizard = () => {
    setStep('detect')
    setDuplicates([])
    setSelectedMaster(null)
    setSelectedDuplicates([])
  }

  const handleMerge = () => {
    if (!selectedMaster || selectedDuplicates.length === 0) return

    const duplicateIds = selectedDuplicates.map(d => d.id)
    mergeMutation.mutate({
      master_id: selectedMaster.id,
      duplicate_ids: duplicateIds
    })
  }

  const renderDetectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MdMerge className="mx-auto text-4xl text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Mendeteksi Data Duplikat</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Sistem sedang mencari pasien dengan data yang mirip...
        </p>
      </div>

      {detecting && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Mencari duplikat...</span>
        </div>
      )}

      {!detecting && duplicates.length === 0 && (
        <Alert>
          <MdCheckCircle className="h-4 w-4" />
          <AlertDescription>
            Tidak ditemukan data duplikat untuk pasien ini.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )

  const renderSelectStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pilih Data Master</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Pilih record mana yang akan dijadikan data utama. Data dari record lain akan dipindahkan ke data master.
        </p>
      </div>

      <div className="space-y-4">
        {/* Current patient */}
        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <input
            type="radio"
            id={`master-${patient.id}`}
            name="master-patient"
            value={patient.id.toString()}
            checked={selectedMaster?.id === patient.id}
            onChange={() => setSelectedMaster(patient)}
            className="w-4 h-4 text-blue-600"
          />
          <Label htmlFor={`master-${patient.id}`} className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{patient.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No. RM: {patient.mrn} | NIK: {patient.nik ? `****${patient.nik.slice(-4)}` : 'N/A'}
                </div>
              </div>
              <Badge variant="default">Data Saat Ini</Badge>
            </div>
          </Label>
        </div>

        {/* Duplicate candidates */}
        {duplicates.map((duplicate) => (
          <div key={duplicate.id} className="flex items-center space-x-3 p-4 border rounded-lg">
            <input
              type="radio"
              id={`master-${duplicate.id}`}
              name="master-patient"
              value={duplicate.id.toString()}
              checked={selectedMaster?.id === duplicate.id}
              onChange={() => setSelectedMaster(duplicate)}
              className="w-4 h-4 text-blue-600"
            />
            <Label htmlFor={`master-${duplicate.id}`} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{duplicate.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No. RM: {duplicate.mrn} | NIK: {duplicate.nik ? `****${duplicate.nik.slice(-4)}` : 'N/A'}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Kemiripan: {duplicate.similarity_score}% | {duplicate.match_reasons.join(', ')}
                  </div>
                </div>
                <Badge variant="secondary">Duplikat</Badge>
              </div>
            </Label>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          onClick={() => setStep('preview')}
          disabled={!selectedMaster}
        >
          Lanjutkan
        </Button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Preview Penggabungan</h3>
        <Alert>
          <MdWarning className="h-4 w-4" />
          <AlertDescription>
            Data dari record duplikat akan dipindahkan ke data master. Record duplikat akan dinonaktifkan.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <MdCheckCircle />
              Data Master (Akan Disimpan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Nama:</strong> {selectedMaster?.name}</div>
              <div><strong>No. RM:</strong> {selectedMaster?.mrn}</div>
              <div><strong>NIK:</strong> {selectedMaster?.nik}</div>
              <div><strong>Tanggal Lahir:</strong> {selectedMaster?.birth_date}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <MdArrowForward />
              Data Duplikat (Akan Digabung)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDuplicates.map((dup) => (
                <div key={dup.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                  <div className="space-y-1">
                    <div><strong>Nama:</strong> {dup.name}</div>
                    <div><strong>No. RM:</strong> {dup.mrn}</div>
                    <div><strong>NIK:</strong> {dup.nik}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Yang akan dilakukan:</h4>
        <ul className="text-sm space-y-1">
          <li>• Semua riwayat kunjungan dari data duplikat akan dipindahkan ke data master</li>
          <li>• Dokumen dan lampiran akan dipindahkan ke data master</li>
          <li>• Data duplikat akan dinonaktifkan (soft delete)</li>
          <li>• Akan dibuat log audit untuk tracking</li>
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep('select')}>
          Kembali
        </Button>
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          onClick={() => setStep('confirm')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Konfirmasi Merge
        </Button>
      </div>
    </div>
  )

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MdWarning className="mx-auto text-4xl text-orange-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Konfirmasi Penggabungan Data</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Apakah Anda yakin ingin menggabungkan data pasien ini? Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <MdWarning className="text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Peringatan</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• Data duplikat akan dinonaktifkan secara permanen</li>
              <li>• Pastikan data master sudah benar sebelum melanjutkan</li>
              <li>• Semua riwayat akan dipindahkan ke data master</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep('preview')}>
          Kembali
        </Button>
        <Button
          onClick={handleMerge}
          disabled={mergeMutation.isPending}
          className="bg-red-600 hover:bg-red-700"
        >
          {mergeMutation.isPending ? 'Menggabungkan...' : 'Ya, Gabungkan Data'}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MdMerge />
            Gabungkan Data Pasien Duplikat
          </DialogTitle>
        </DialogHeader>

        {step === 'detect' && renderDetectStep()}
        {step === 'select' && renderSelectStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'confirm' && renderConfirmStep()}
      </DialogContent>
    </Dialog>
  )
}