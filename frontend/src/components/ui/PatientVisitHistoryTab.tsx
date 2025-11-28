'use client'

import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Skeleton } from './skeleton'
import { Alert, AlertDescription } from './alert'
import { MdExpandMore, MdExpandLess, MdCalendarToday, MdPerson, MdMedicalServices, MdError, MdRefresh } from 'react-icons/md'
import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useFetch } from '@/hooks/useApi'

interface Visit {
  id: number
  tanggal: string
  poli: string
  dokter: string
  diagnosa: string
  status: 'Selesai' | 'Dalam Proses' | 'Batal'
  cppt?: Array<{
    id: number
    subjective: string
    objective: string
    assessment: string
    plan: string
    created_at: string
  }>
}

interface PatientVisitHistoryTabProps {
  patientId: number
}

export function PatientVisitHistoryTab({ patientId }: PatientVisitHistoryTabProps) {
  const { data: visits = [], isLoading, error, refetch } = useFetch<Visit[]>(
    `/api/pendaftaran/pasien/${patientId}/riwayat-kunjungan`
  )

  const [expandedVisit, setExpandedVisit] = useState<number | null>(null)

  const toggleExpand = (visitId: number) => {
    setExpandedVisit(expandedVisit === visitId ? null : visitId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-100 text-green-800'
      case 'Dalam Proses':
        return 'bg-yellow-100 text-yellow-800'
      case 'Batal':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <Alert className="max-w-md mx-auto border-red-200 bg-red-50 dark:bg-red-900/20">
              <MdError className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="font-semibold mb-2">Gagal memuat riwayat kunjungan</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="mt-2"
                >
                  <MdRefresh className="mr-1" />
                  Coba Lagi
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (visits.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MdMedicalServices className="mx-auto mb-2 text-3xl opacity-50" />
            <p>Belum ada riwayat kunjungan</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <Card key={visit.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-3">
                <MdCalendarToday className="text-blue-600" />
                <div>
                  <div className="font-semibold">
                    {format(new Date(visit.tanggal), 'dd MMMM yyyy', { locale: id })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {visit.poli}
                  </div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(visit.status)}>
                  {visit.status}
                </Badge>
                {visit.cppt && visit.cppt.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(visit.id)}
                  >
                    {expandedVisit === visit.id ? <MdExpandLess /> : <MdExpandMore />}
                    Detail
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MdPerson className="text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Dokter:</span>
                <span className="font-medium">{visit.dokter}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdMedicalServices className="text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Diagnosa:</span>
                <span className="font-medium">{visit.diagnosa}</span>
              </div>
            </div>

            {/* Expanded CPPT Details */}
            {expandedVisit === visit.id && visit.cppt && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  Catatan CPPT (READ ONLY)
                </h4>
                <div className="space-y-3">
                  {visit.cppt.map((cppt, index) => (
                    <div key={cppt.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="text-xs text-gray-500 mb-2">
                        {format(new Date(cppt.created_at), 'dd/MM/yyyy HH:mm', { locale: id })}
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Subjective:</span>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">{cppt.subjective}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Objective:</span>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">{cppt.objective}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Assessment:</span>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">{cppt.assessment}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Plan:</span>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">{cppt.plan}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
