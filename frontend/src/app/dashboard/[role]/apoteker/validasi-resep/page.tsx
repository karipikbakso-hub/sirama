'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/toast'
import api from '@/lib/api'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Pill,
  Eye,
  FileText,
  Shield,
} from 'lucide-react'

interface Prescription {
  id: number
  status: string
  created_at: string
  notes: string
  doctor: {
    name: string
  }
  registration: {
    patient_id: number
  }
  items: PrescriptionItem[]
}

interface PrescriptionItem {
  id: number
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
  instruction: string
  medicine_id: number
}

interface PrescriptionDetail {
  prescription: Prescription
  patient: {
    id: number
    nama_lengkap: string
    no_rm: string
    tanggal_lahir: string
    jenis_kelamin: string
    alergi: string
    penyakit_kronis: string
  }
  doctor: {
    name: string
  }
  warnings: DrugWarning[]
}

interface DrugWarning {
  type: 'allergy' | 'interaction'
  severity: 'high' | 'moderate' | 'low'
  message: string
  medicine_id?: number
}

export default function ValidasiResepPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDetail | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [editingItems, setEditingItems] = useState<any[]>([])

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)

  useEffect(() => {
    loadPrescriptions()
  }, [])

  const loadPrescriptions = async () => {
    try {
      setPrescriptionsLoading(true)
      const response = await api.get('/api/prescriptions/pending')
      setPrescriptions(response.data.data || [])
    } catch (error) {
      toast.error('Gagal memuat data resep')
    } finally {
      setPrescriptionsLoading(false)
    }
  }

  const handleViewDetail = async (prescriptionId: number) => {
    try {
      setDetailLoading(true)
      const response = await api.get(`/api/prescriptions/${prescriptionId}/detail`)
      setSelectedPrescription(response.data.data)
      setShowDetailDialog(true)
      setVerificationNotes('')
      setRejectionReason('')
      setEditingItems([])
    } catch (error) {
      toast.error('Gagal memuat detail resep')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedPrescription) return

    try {
      setVerifyLoading(true)
      await api.post(`/api/prescriptions/${selectedPrescription.prescription.id}/validate`, {
        verification_notes: verificationNotes,
        edited_items: editingItems
      })
      toast.success('Resep berhasil divalidasi')
      setShowVerifyDialog(false)
      setShowDetailDialog(false)
      loadPrescriptions()
    } catch (error) {
      toast.error('Gagal memvalidasi resep')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedPrescription) return

    try {
      setRejectLoading(true)
      await api.post(`/api/prescriptions/${selectedPrescription.prescription.id}/reject`, {
        rejection_reason: rejectionReason
      })
      toast.success('Resep berhasil ditolak')
      setShowRejectDialog(false)
      setShowDetailDialog(false)
      loadPrescriptions()
    } catch (error) {
      toast.error('Gagal menolak resep')
    } finally {
      setRejectLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'moderate': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline">Menunggu Validasi</Badge>
      case 'validated': return <Badge variant="default">Sudah Divalidasi</Badge>
      case 'rejected': return <Badge variant="destructive">Ditolak</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Validasi Resep</h1>
          <p className="text-gray-600">Verifikasi resep dari dokter sebelum distribusi obat</p>
        </div>
      </div>

      {/* Pending Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resep Menunggu Validasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptionsLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Tidak ada resep yang menunggu validasi</div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">No. Resep</div>
                      <div className="font-medium">#{prescription.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tanggal</div>
                      <div className="font-medium">
                        {new Date(prescription.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Dokter</div>
                      <div className="font-medium">{prescription.doctor.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Jumlah Obat</div>
                      <div className="font-medium">{prescription.items.length}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    {getStatusBadge(prescription.status)}
                    <Button
                      size="sm"
                      onClick={() => handleViewDetail(prescription.id)}
                      disabled={detailLoading}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detail Resep #{selectedPrescription?.prescription.id}
            </DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informasi Pasien
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nama</Label>
                    <p className="font-medium">{selectedPrescription.patient.nama_lengkap}</p>
                  </div>
                  <div>
                    <Label>No. RM</Label>
                    <p className="font-medium">{selectedPrescription.patient.no_rm}</p>
                  </div>
                  <div>
                    <Label>Tanggal Lahir</Label>
                    <p className="font-medium">
                      {new Date(selectedPrescription.patient.tanggal_lahir).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <Label>Jenis Kelamin</Label>
                    <p className="font-medium">{selectedPrescription.patient.jenis_kelamin}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Alergi</Label>
                    <p className="font-medium text-red-600">
                      {selectedPrescription.patient.alergi || 'Tidak ada alergi tercatat'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Drug Warnings */}
              {selectedPrescription.warnings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Peringatan Obat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedPrescription.warnings.map((warning, index) => (
                      <Alert key={index} variant={warning.severity === 'high' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warning.message}</AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Prescription Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Daftar Obat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPrescription.prescription.items.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPrescription.prescription.items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Nama Obat</Label>
                              <p className="font-medium">{item.medicine_name}</p>
                            </div>
                            <div>
                              <Label>Dosis</Label>
                              <p className="text-sm text-gray-600">{item.dosage}</p>
                            </div>
                            <div>
                              <Label>Frekuensi</Label>
                              <p className="text-sm text-gray-600">{item.frequency}</p>
                            </div>
                            <div>
                              <Label>Durasi</Label>
                              <p className="text-sm text-gray-600">{item.duration}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Tidak ada item obat</p>
                  )}
                </CardContent>
              </Card>

              {/* Verification Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Catatan Validasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Tambahkan catatan validasi (opsional)"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Tutup
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Tolak
            </Button>
            <Button
              onClick={() => setShowVerifyDialog(true)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Validasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Confirmation Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Validasi</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin memvalidasi resep ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleVerify} disabled={verifyLoading}>
              {verifyLoading ? 'Memvalidasi...' : 'Ya, Validasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Resep</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Alasan Penolakan *</Label>
            <Textarea
              placeholder="Jelaskan alasan penolakan resep"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={rejectLoading || !rejectionReason.trim()}
            >
              {rejectLoading ? 'Menolak...' : 'Tolak Resep'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
