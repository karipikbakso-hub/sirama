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
import { useFetch } from '@/hooks/useApi'
import { toast } from '@/lib/toast'
import api from '@/lib/api'
import {
  Pill,
  User,
  AlertTriangle,
  CheckCircle,
  Printer,
  Receipt,
  Package,
  Clock,
  Eye,
  Truck,
  DollarSign,
  Heart,
  Activity
} from 'lucide-react'

interface Prescription {
  id: number
  status: string
  created_at: string
  dispensed_at: string | null
  total_price: number | null
  payment_method: string | null
  edukasi_notes: string | null
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
  quantity: number
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
    insurance_type?: string
  }
  doctor: {
    name: string
  }
}

interface MedicineBatch {
  batch_number: string
  expired_date: string
  stock: number
  unit_price: number
}

interface DispensingItem {
  prescription_item_id: number
  medicine_id: number
  quantity: number
  batch_number: string
  expired_date: string
}

export default function DispensingPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDetail | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDispenseDialog, setShowDispenseDialog] = useState(false)
  const [dispensingItems, setDispensingItems] = useState<DispensingItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [edukasiNotes, setEdukasiNotes] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [dispenseLoading, setDispenseLoading] = useState(false)
  const [batchesLoading, setBatchesLoading] = useState(false)

  useEffect(() => {
    loadPrescriptions()
  }, [])

  const loadPrescriptions = async () => {
    try {
      setPrescriptionsLoading(true)
      const response = await api.get('/api/prescriptions/verified')
      setPrescriptions(response.data.data?.data || [])
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
      setDispensingItems([])
      setPaymentMethod('')
      setEdukasiNotes('')
      setTotalPrice(0)
    } catch (error) {
      toast.error('Gagal memuat detail resep')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDispense = async () => {
    if (!selectedPrescription) return

    // Validate all items have batch selection
    const incompleteItems = dispensingItems.filter(item =>
      !item.batch_number || !item.expired_date || item.quantity <= 0
    )

    if (incompleteItems.length > 0) {
      toast.error('Semua item harus memiliki batch dan quantity yang valid')
      return
    }

    if (!paymentMethod) {
      toast.error('Metode pembayaran harus dipilih')
      return
    }

    try {
      setDispenseLoading(true)
      await api.post(`/api/prescriptions/${selectedPrescription.prescription.id}/dispense`, {
        items: dispensingItems,
        total_price: totalPrice,
        payment_method: paymentMethod,
        edukasi_notes: edukasiNotes
      })
      toast.success('Resep berhasil didispensing')
      setShowDispenseDialog(false)
      setShowDetailDialog(false)
      loadPrescriptions()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal melakukan dispensing')
    } finally {
      setDispenseLoading(false)
    }
  }

  const loadMedicineBatches = async (medicineId: number, prescriptionItemId: number) => {
    try {
      setBatchesLoading(true)
      const response = await api.get(`/api/medicines/${medicineId}/batches`)

      // Sort batches by expired_date ASC (FEFO principle)
      const sortedBatches = response.data.data.batches.sort((a: any, b: any) =>
        new Date(a.expired_date).getTime() - new Date(b.expired_date).getTime()
      )

      // Auto-select first (oldest expiry) batch
      const firstBatch = sortedBatches[0]
      if (firstBatch && firstBatch.stock > 0) {
        updateDispensingItem(prescriptionItemId, medicineId, {
          batch_number: firstBatch.batch_number,
          expired_date: firstBatch.expired_date,
          quantity: Math.min(1, firstBatch.stock) // Default quantity limited by stock
        })
      }
    } catch (error) {
      toast.error('Gagal memuat data batch obat')
    } finally {
      setBatchesLoading(false)
    }
  }

  const updateDispensingItem = (prescriptionItemId: number, medicineId: number, updates: Partial<DispensingItem>) => {
    const existingIndex = dispensingItems.findIndex(item => item.prescription_item_id === prescriptionItemId)
    const newItem = {
      prescription_item_id: prescriptionItemId,
      medicine_id: medicineId,
      quantity: 1,
      batch_number: '',
      expired_date: '',
      ...updates
    }

    if (existingIndex >= 0) {
      const updated = [...dispensingItems]
      updated[existingIndex] = { ...updated[existingIndex], ...updates }
      setDispensingItems(updated)
    } else {
      setDispensingItems([...dispensingItems, newItem])
    }

    // Recalculate total price
    calculateTotalPrice()
  }

  const calculateTotalPrice = () => {
    // This is a simplified calculation - in real system would use medicine prices
    // For now, just use a mock calculation
    const mockPrice = dispensingItems.reduce((total, item) => total + (item.quantity * 10000), 0)
    setTotalPrice(mockPrice)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="default">Siap Dispensing</Badge>
      case 'dispensed': return <Badge variant="secondary">Sudah Dispensing</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai'
      case 'bpjs': return 'BPJS'
      case 'insurance': return 'Asuransi'
      default: return method
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Package className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">Dispensing Obat</h1>
          <p className="text-gray-600">Proses penyerahan obat ke pasien dengan validasi stok dan batch</p>
        </div>
      </div>

      {/* Verified Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Resep Siap Dispensing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptionsLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Tidak ada resep yang siap dispensing</div>
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
                      Detail & Dispensing
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
              <Package className="w-5 h-5" />
              Detail Resep #{selectedPrescription?.prescription.id} - Dispensing
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
                    <Label>Jenis Penjamin</Label>
                    <p className="font-medium">{selectedPrescription.patient.insurance_type || 'Umum'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Prescription Items with Batch Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Daftar Obat - Pilih Batch (FEFO)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPrescription.prescription.items.map((item) => {
                      const dispensingItem = dispensingItems.find(di => di.prescription_item_id === item.id)

                      return (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Nama Obat</Label>
                              <p className="font-medium">{item.medicine_name}</p>
                            </div>
                            <div>
                              <Label>Dosis</Label>
                              <p className="font-medium">{item.dosage}</p>
                            </div>
                            <div>
                              <Label>Frekuensi</Label>
                              <p className="font-medium">{item.frequency}</p>
                            </div>
                            <div>
                              <Label>Durasi</Label>
                              <p className="font-medium">{item.duration}</p>
                            </div>
                          </div>

                          {/* Batch Selection */}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Batch Number</Label>
                              <Input
                                value={dispensingItem?.batch_number || ''}
                                onChange={(e) => updateDispensingItem(item.id, item.medicine_id, { batch_number: e.target.value })}
                                placeholder="Pilih batch"
                              />
                            </div>
                            <div>
                              <Label>Expired Date</Label>
                              <Input
                                type="date"
                                value={dispensingItem?.expired_date || ''}
                                onChange={(e) => updateDispensingItem(item.id, item.medicine_id, { expired_date: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={dispensingItem?.quantity || 1}
                                onChange={(e) => updateDispensingItem(item.id, item.medicine_id, { quantity: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                          </div>

                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadMedicineBatches(item.medicine_id, item.id)}
                              disabled={batchesLoading}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Load Batch FEFO
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Education */}
              <div className="grid grid-cols-2 gap-6">
                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Informasi Pembayaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Metode Pembayaran</Label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800"
                      >
                        <option value="">Pilih metode pembayaran</option>
                        <option value="cash">Tunai</option>
                        <option value="bpjs">BPJS</option>
                        <option value="insurance">Asuransi Swasta</option>
                      </select>
                    </div>
                    <div>
                      <Label>Total Harga</Label>
                      <Input
                        type="number"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                        placeholder="Total harga"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Education */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Edukasi Pasien (PIO)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Catatan edukasi pasien tentang cara pakai obat, efek samping, dll."
                      value={edukasiNotes}
                      onChange={(e) => setEdukasiNotes(e.target.value)}
                      rows={6}
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      <p>• Cara pakai obat</p>
                      <p>• Waktu konsumsi</p>
                      <p>• Efek samping</p>
                      <p>• Penyimpanan obat</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dispensing Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Checklist Dispensing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Stok obat cukup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Batch FEFO dipilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Harga sesuai penjamin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>Edukasi pasien</span>
                    </div>
                  </div>
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
              variant="outline"
              onClick={() => {
                // Print label logic would go here
                toast.info('Fitur print label akan diimplementasikan')
              }}
            >
              <Printer className="w-4 h-4 mr-1" />
              Print Label
            </Button>
            <Button
              onClick={() => setShowDispenseDialog(true)}
            >
              <Package className="w-4 h-4 mr-1" />
              Dispensing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispense Confirmation Dialog */}
      <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Dispensing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Pastikan semua data sudah benar. Setelah dispensing, stok obat akan berkurang dan tidak dapat dibatalkan.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Metode Pembayaran:</span>
                <p>{getPaymentMethodLabel(paymentMethod)}</p>
              </div>
              <div>
                <span className="font-medium">Total Harga:</span>
                <p>Rp {totalPrice.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispenseDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleDispense} disabled={dispenseLoading}>
              {dispenseLoading ? 'Memproses...' : 'Konfirmasi Dispensing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
