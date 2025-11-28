'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, AlertTriangle, Calendar, Phone, MapPin } from 'lucide-react'

interface Patient {
  id: number
  medical_record_number: string
  full_name: string
  date_of_birth: string
  gender: 'L' | 'P'
  allergies: string | null
  chronic_diseases: string | null
  phone: string
  address: string
  bpjs_number: string
  nik: string
}

interface PatientHeaderEMRProps {
  patient: Patient
}

export default function PatientHeaderEMR({ patient }: PatientHeaderEMRProps) {
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

  const hasAllergies = patient.allergies && patient.allergies.trim() !== ''

  return (
    <div className="space-y-4">
      {/* Allergy Alert */}
      {hasAllergies && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>ALERGI:</strong> {patient.allergies}
          </AlertDescription>
        </Alert>
      )}

      {/* Patient Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Patient Info */}
            <div className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {patient.full_name}
                  </h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">No RM:</span>
                      <Badge variant="outline">{patient.medical_record_number}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Umur: {calculateAge(patient.date_of_birth)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Jenis Kelamin: {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Kontak</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {patient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-2">{patient.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Insurance Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Asuransi</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {patient.bpjs_number && (
                      <div>
                        <span className="font-medium">BPJS:</span>
                        <div className="font-mono">{patient.bpjs_number}</div>
                      </div>
                    )}
                    {patient.nik && (
                      <div>
                        <span className="font-medium">NIK:</span>
                        <div className="font-mono">{patient.nik}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Riwayat Medis</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {patient.chronic_diseases && (
                      <div>
                        <span className="font-medium">Penyakit Kronis:</span>
                        <div className="text-red-600 font-medium">{patient.chronic_diseases}</div>
                      </div>
                    )}
                    {!patient.chronic_diseases && (
                      <div className="text-green-600">Tidak ada penyakit kronis</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}