'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Save,
  Shield,
  AlertCircle
} from 'lucide-react'

interface Patient {
  id: number
  name: string
  mrn: string
  birth_date: string
  gender: string
  phone?: string
  address?: string
}

interface Registration {
  id: number
  registration_no: string
  created_at: string
  status: string
  patient?: Patient
  doctor?: { name: string }
  poli?: { name: string }
}

interface Examination {
  id?: number
  status?: string
  created_at?: string
  updated_at?: string
}

interface PatientHeaderProps {
  patient: Patient
  registration: Registration
  examination?: Examination
  onBack: () => void
  lastSaved: Date | null
  autoSaveEnabled: boolean
  onToggleAutoSave: () => void
}

export default function PatientHeader({
  patient,
  registration,
  examination,
  onBack,
  lastSaved,
  autoSaveEnabled,
  onToggleAutoSave
}: PatientHeaderProps) {
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `${age} tahun`
  }

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Selesai' },
      signed: { color: 'bg-blue-100 text-blue-800', label: 'Ditandatangani' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' },
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge className={`${config.color} ${config.label}`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Card className="border-b rounded-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button & Patient Info */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {patient.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>MRN: {patient.mrn}</span>
                    <span>Umur: {calculateAge(patient.birth_date)}</span>
                    <span>
                      {patient.gender === 'L' ? 'Laki-laki' : patient.gender === 'P' ? 'Perempuan' : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-l pl-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Reg: {registration.registration_no}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(registration.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Status & Controls */}
          <div className="flex items-center gap-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              {getStatusBadge(examination?.status)}
            </div>

            {/* Auto-save Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Auto-save:</span>
              <Switch
                checked={autoSaveEnabled}
                onCheckedChange={onToggleAutoSave}
              />
            </div>

            {/* Last Saved */}
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Save className="w-4 h-4" />
                <span>
                  Tersimpan: {lastSaved.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {/* Security Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">Terenkripsi</span>
            </div>
          </div>
        </div>

        {/* Additional Info Row */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Dokter:</span>
              <div className="font-medium">{registration.doctor?.name || '-'}</div>
            </div>
            <div>
              <span className="text-gray-500">Poli:</span>
              <div className="font-medium">{registration.poli?.name || '-'}</div>
            </div>
            <div>
              <span className="text-gray-500">ID Pemeriksaan:</span>
              <div className="font-mono">{examination?.id || '-'}</div>
            </div>
            <div>
              <span className="text-gray-500">Terakhir Update:</span>
              <div className="font-medium">
                {examination?.updated_at
                  ? new Date(examination.updated_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}