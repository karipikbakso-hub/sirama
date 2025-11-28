'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Upload,
  FileImage,
  FileText,
  Download,
  Trash2,
  Eye,
  Plus,
  X,
  AlertCircle
} from 'lucide-react'

interface Attachment {
  id?: number
  name: string
  type: 'image' | 'pdf' | 'document'
  size: number
  uploaded_at: string
  uploaded_by: string
  url?: string
  description?: string
}

interface AttachmentsPanelProps {
  patientId: number
  registrationId: number
  examination?: any
}

export default function AttachmentsPanel({
  patientId,
  registrationId,
  examination
}: AttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: 1,
      name: 'Foto Thorax PA.jpg',
      type: 'image',
      size: 2048576, // 2MB
      uploaded_at: '2024-01-15T10:30:00',
      uploaded_by: 'Dr. Ahmad',
      description: 'Hasil foto thorax PA pasien'
    },
    {
      id: 2,
      name: 'Hasil Lab Darah.pdf',
      type: 'pdf',
      size: 512000, // 512KB
      uploaded_at: '2024-01-15T11:00:00',
      uploaded_by: 'Laboratorium',
      description: 'Laporan hasil pemeriksaan darah lengkap'
    }
  ])

  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadDescription, setUploadDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      const newAttachment: Attachment = {
        name: selectedFile.name,
        type: selectedFile.type.startsWith('image/') ? 'image' :
              selectedFile.type === 'application/pdf' ? 'pdf' : 'document',
        size: selectedFile.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'Dr. Current User', // TODO: Get from auth
        description: uploadDescription,
        url: URL.createObjectURL(selectedFile)
      }

      setAttachments([newAttachment, ...attachments])
      setSelectedFile(null)
      setUploadDescription('')
      setShowUploadDialog(false)
      setIsUploading(false)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }, 2000)
  }

  const removeAttachment = (attachmentId: number) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId))
  }

  const downloadAttachment = (attachment: Attachment) => {
    // Simulate download
    if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const viewAttachment = (attachment: Attachment) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="w-5 h-5 text-blue-500" />
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />
      default: return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getFileTypeBadge = (type: string) => {
    const config = {
      image: { color: 'bg-blue-100 text-blue-800', label: 'Gambar' },
      pdf: { color: 'bg-red-100 text-red-800', label: 'PDF' },
      document: { color: 'bg-gray-100 text-gray-800', label: 'Dokumen' }
    }
    const c = config[type as keyof typeof config] || config.document
    return <Badge className={`${c.color} ${c.label}`}>{c.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Lampiran File
            </CardTitle>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File Baru</DialogTitle>
                  <DialogDescription>
                    Pilih file yang akan dilampirkan ke rekam medis pasien
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Pilih File</Label>
                    <Input
                      id="file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Format yang didukung: JPG, PNG, PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        {getFileIcon(
                          selectedFile.type.startsWith('image/') ? 'image' :
                          selectedFile.type === 'application/pdf' ? 'pdf' : 'document'
                        )}
                        <div>
                          <div className="font-medium">{selectedFile.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Input
                      id="description"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Jelaskan isi file..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null)
                        setUploadDescription('')
                        setShowUploadDialog(false)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                    >
                      {isUploading ? 'Mengupload...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded">
                <div className="flex items-center gap-3">
                  {getFileIcon(attachment.type)}
                  <div>
                    <div className="font-medium">{attachment.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatFileSize(attachment.size)} • {attachment.uploaded_by}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(attachment.uploaded_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {attachment.description && (
                      <div className="text-sm text-gray-700 mt-1">
                        {attachment.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getFileTypeBadge(attachment.type)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewAttachment(attachment)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAttachment(attachment)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {attachments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada file yang dilampirkan
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <FileImage className="w-4 h-4 mr-2" />
              Foto Radiologi
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Hasil Lab
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              EKG
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Lainnya
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-amber-800 mb-1">
                Keamanan File
              </div>
              <div className="text-amber-700">
                Semua file dilampirkan akan dienkripsi dan disimpan dengan aman.
                Akses file tercatat dalam audit log untuk keamanan data pasien.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}