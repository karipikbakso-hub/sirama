'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  Lock,
  FileText,
  AlertTriangle,
  Clock,
  User,
  Shield
} from 'lucide-react'

interface Examination {
  id?: number
  status?: string
  created_at?: string
  updated_at?: string
}

interface SignOffPanelProps {
  examination?: Examination
  onSign: () => void
  onSaveDraft: () => void
}

export default function SignOffPanel({
  examination,
  onSign,
  onSaveDraft
}: SignOffPanelProps) {
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [signature, setSignature] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmations, setConfirmations] = useState({
    reviewed: false,
    accurate: false,
    complete: false,
    consent: false
  })

  const handleSignOff = () => {
    if (!signature.trim()) {
      alert('Tanda tangan digital diperlukan')
      return
    }

    const allConfirmed = Object.values(confirmations).every(Boolean)
    if (!allConfirmed) {
      alert('Semua konfirmasi harus dicentang')
      return
    }

    onSign()
    setShowSignDialog(false)
  }

  const isSigned = examination?.status === 'signed' || examination?.status === 'completed'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Penandatanganan EMR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isSigned ? (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-green-600" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-yellow-600" />
              </div>
            )}
            <div>
              <div className="font-medium">
                {isSigned ? 'EMR Ditandatangani' : 'EMR Dalam Draft'}
              </div>
              <div className="text-sm text-gray-600">
                {isSigned
                  ? `Ditandatangani pada ${new Date(examination?.updated_at || '').toLocaleString('id-ID')}`
                  : 'Siap untuk ditandatangani'
                }
              </div>
            </div>
          </div>
          <Badge variant={isSigned ? 'default' : 'secondary'}>
            {isSigned ? 'Final' : 'Draft'}
          </Badge>
        </div>

        {/* Actions */}
        {!isSigned && (
          <div className="flex gap-3">
            <Button
              onClick={onSaveDraft}
              variant="outline"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Simpan Draft
            </Button>

            <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tandatangani EMR
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Konfirmasi Penandatanganan EMR
                  </DialogTitle>
                  <DialogDescription>
                    Pastikan semua data telah lengkap dan akurat sebelum menandatangani.
                    EMR yang sudah ditandatangani tidak dapat diubah lagi.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Confirmations */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Konfirmasi:</Label>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="reviewed"
                          checked={confirmations.reviewed}
                          onChange={(e) =>
                            setConfirmations(prev => ({ ...prev, reviewed: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <Label htmlFor="reviewed" className="text-sm">
                          Saya telah meninjau semua data pemeriksaan dengan teliti
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="accurate"
                          checked={confirmations.accurate}
                          onChange={(e) =>
                            setConfirmations(prev => ({ ...prev, accurate: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <Label htmlFor="accurate" className="text-sm">
                          Semua informasi yang tercatat adalah akurat dan benar
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="complete"
                          checked={confirmations.complete}
                          onChange={(e) =>
                            setConfirmations(prev => ({ ...prev, complete: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <Label htmlFor="complete" className="text-sm">
                          Dokumentasi pemeriksaan telah lengkap sesuai standar medis
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="consent"
                          checked={confirmations.consent}
                          onChange={(e) =>
                            setConfirmations(prev => ({ ...prev, consent: e.target.checked }))
                          }
                          className="rounded"
                        />
                        <Label htmlFor="consent" className="text-sm">
                          Saya bertanggung jawab atas keakuratan dan kelengkapan data ini
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature */}
                  <div className="space-y-2">
                    <Label htmlFor="signature">Tanda Tangan Digital *</Label>
                    <Input
                      id="signature"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Ketik nama lengkap Anda sebagai tanda tangan"
                      className="font-medium"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan tambahan untuk penandatanganan..."
                      rows={2}
                    />
                  </div>

                  {/* Warning */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-amber-800 mb-1">
                          Peringatan
                        </div>
                        <div className="text-amber-700">
                          Setelah EMR ditandatangani, dokumen menjadi final dan tidak dapat diubah.
                          Pastikan semua data sudah benar sebelum melanjutkan.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowSignDialog(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleSignOff}
                      disabled={!signature.trim() || !Object.values(confirmations).every(Boolean)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Tandatangani EMR
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Signed Info */}
        {isSigned && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  EMR telah ditandatangani dan difinalisasi
                </div>
                <div className="text-sm text-green-700">
                  Dokumen ini sekarang bersifat legal dan tidak dapat diubah
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completeness Score */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-gray-600">Kelengkapan Data</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12 min</div>
            <div className="text-sm text-gray-600">Waktu Penyelesaian</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}