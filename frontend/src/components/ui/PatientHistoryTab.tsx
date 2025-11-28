'use client'

import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { MdHistory, MdPerson, MdEdit, MdMerge } from 'react-icons/md'
import { Patient } from '@/types/role/pendaftaran'
import { useGet } from '@/hooks/useApi'
import { format } from 'date-fns'

interface ChangeHistory {
  id: number
  field_name: string
  old_value: string | null
  new_value: string | null
  changed_by: string
  changed_at: string
  change_type: 'update' | 'merge' | 'create'
  reason?: string
}

interface PatientHistoryTabProps {
  patient: Patient
}

export function PatientHistoryTab({ patient }: PatientHistoryTabProps) {
  const { data: history = [], isLoading } = useGet<ChangeHistory[]>(
    `/api/pendaftaran/pasien/${patient.id}/riwayat-perubahan`
  )

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'merge':
        return <MdMerge className="text-blue-600" />
      case 'create':
        return <MdPerson className="text-green-600" />
      default:
        return <MdEdit className="text-orange-600" />
    }
  }

  const getChangeBadge = (changeType: string) => {
    switch (changeType) {
      case 'merge':
        return <Badge variant="default">Merge</Badge>
      case 'create':
        return <Badge variant="default">Buat</Badge>
      default:
        return <Badge variant="secondary">Update</Badge>
    }
  }

  const formatFieldName = (fieldName: string) => {
    const fieldLabels: Record<string, string> = {
      name: 'Nama',
      address: 'Alamat',
      phone: 'Telepon',
      allergies: 'Alergi',
      chronic_diseases: 'Penyakit Kronis',
      birth_date: 'Tanggal Lahir',
      gender: 'Jenis Kelamin',
      blood_type: 'Golongan Darah',
      insurance_status: 'Status Asuransi',
      bpjs_number: 'No. BPJS'
    }
    return fieldLabels[fieldName] || fieldName
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Memuat riwayat...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdHistory />
            Riwayat Perubahan Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MdHistory className="mx-auto mb-2 text-3xl opacity-50" />
              <p>Belum ada riwayat perubahan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((change) => (
                <div key={change.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getChangeIcon(change.change_type)}
                      <div>
                        <div className="font-semibold">
                          {change.change_type === 'merge' ? 'Data Digabungkan' :
                           change.change_type === 'create' ? 'Data Dibuat' :
                           `Field ${formatFieldName(change.field_name)} Diubah`}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Oleh {change.changed_by} • {format(new Date(change.changed_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    {getChangeBadge(change.change_type)}
                  </div>

                  {change.change_type === 'update' && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-sm">
                        <div className="mb-2">
                          <span className="font-medium text-red-600">Dari:</span>
                          <span className="ml-2 text-red-700 dark:text-red-300">
                            {change.old_value || '(kosong)'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Menjadi:</span>
                          <span className="ml-2 text-green-700 dark:text-green-300">
                            {change.new_value || '(kosong)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {change.change_type === 'merge' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        Data pasien duplikat telah digabungkan ke record ini
                      </div>
                    </div>
                  )}

                  {change.reason && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <div className="text-sm">
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">Alasan:</span>
                        <span className="ml-2 text-yellow-700 dark:text-yellow-300">{change.reason}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}