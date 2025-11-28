'use client'

import { Patient } from '@/types/role/pendaftaran'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { MdEdit, MdPrint, MdPerson, MdCake, MdBloodtype, MdCreditCard } from 'react-icons/md'
import { differenceInYears } from 'date-fns'

interface PatientCardProps {
  patient: Patient | null
  onEdit?: () => void
  onPrint?: () => void
  onExport?: () => void
  onMerge?: () => void
  onDeactivate?: () => void
  className?: string
}

export function PatientCard({ patient, onEdit, onPrint, onExport, onMerge, onDeactivate, className = "" }: PatientCardProps) {
  if (!patient) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MdPerson className="mx-auto mb-2 text-2xl" />
            <p>Pilih pasien untuk melihat detail</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const age = differenceInYears(new Date(), new Date(patient.birth_date))

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {patient.photo ? (
              <img
                src={patient.photo}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdPerson className="text-2xl text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{patient.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              No. RM: {patient.mrn}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MdCake className="text-gray-500" />
            <span>{age} tahun</span>
          </div>
          <div className="flex items-center gap-2">
            <MdPerson className="text-gray-500" />
            <span>{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdBloodtype className="text-gray-500" />
            <span>{patient.blood_type || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdCreditCard className="text-gray-500" />
            <Badge variant={patient.insurance_status === 'BPJS' ? 'default' : 'secondary'}>
              {patient.insurance_status}
            </Badge>
          </div>
        </div>

        {/* BPJS Number if available */}
        {patient.bpjs_number && (
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">BPJS: </span>
            <span className="font-mono">{patient.bpjs_number}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 min-w-[100px]"
            >
              <MdEdit className="mr-1" />
              Edit
            </Button>
          )}
          {onPrint && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="flex-1 min-w-[100px]"
            >
              <MdPrint className="mr-1" />
              Print Kartu
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex-1 min-w-[100px]"
            >
              📄 Export EMR
            </Button>
          )}
          {onMerge && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMerge}
              className="flex-1 min-w-[100px]"
            >
              🔄 Merge
            </Button>
          )}
          {onDeactivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeactivate}
              className="flex-1 min-w-[100px] text-red-600 border-red-300 hover:bg-red-50"
            >
              🚫 Nonaktifkan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}