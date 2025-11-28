'use client'

import { useState } from 'react'
import { Patient } from '@/types/role/pendaftaran'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Input } from './input'
import { Badge } from './badge'
import { Skeleton } from './skeleton'
import { Alert, AlertDescription } from './alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { ChevronLeft, ChevronRight, Search, RefreshCw, Eye, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { useFetch } from '@/hooks/useApi'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ExtendedPatient extends Patient {
  status?: string
}

interface PatientListTableProps {
  onSelectPatient?: (patient: ExtendedPatient) => void
  className?: string
}

interface PaginatedResponse {
  data: ExtendedPatient[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function PatientListTable({ onSelectPatient, className = "" }: PatientListTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: response, isLoading, error, refetch } = useFetch<PaginatedResponse>(
    `/api/pendaftaran/pasien/list-all`,
    {
      params: {
        page: currentPage,
        per_page: 20,
        search: debouncedSearch || undefined,
      }
    }
  )

  const patients = response?.data || []
  const pagination = {
    current_page: response?.current_page || 1,
    last_page: response?.last_page || 1,
    per_page: response?.per_page || 20,
    total: response?.total || 0,
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pagination.last_page)))
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const getInsuranceBadge = (status: string) => {
    switch (status) {
      case 'BPJS':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">BPJS</Badge>
      case 'Umum':
        return <Badge variant="secondary">Umum</Badge>
      case 'Swasta':
        return <Badge variant="outline">Swasta</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Aktif
        </Badge>
      case 'inactive':
        return <Badge variant="secondary">Nonaktif</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div className="font-semibold mb-2">Gagal memuat data pasien</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                Coba Lagi
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Daftar Semua Pasien
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pasien..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full max-w-sm" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">
                {debouncedSearch ? 'Tidak ada pasien ditemukan' : 'Belum ada data pasien'}
              </h3>
              <p>
                {debouncedSearch ?
                  `Tidak ada pasien yang cocok dengan "${debouncedSearch}"` :
                  'Belum ada pasien terdaftar di sistem'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">No</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>No. RM</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>No. Telp</TableHead>
                    <TableHead>Asuransi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead className="w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient, index) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => onSelectPatient?.(patient)}
                    >
                      <TableCell className="font-medium">
                        {(pagination.current_page - 1) * pagination.per_page + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-200">
                            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                              {patient.birth_date && (
                                <> • {new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} th</>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{patient.mrn}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {patient.nik ? `****${patient.nik.slice(-4)}` : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{patient.phone || '-'}</TableCell>
                      <TableCell>{getInsuranceBadge(patient.insurance_status)}</TableCell>
                      <TableCell>{getStatusBadge(patient.status || 'active')}</TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(patient.created_at), 'dd MMM yyyy', { locale: id })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectPatient?.(patient)
                          }}
                          className="h-8"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan {patients.length} dari {pagination.total} pasien
                  {debouncedSearch && ` untuk pencarian "${debouncedSearch}"`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Sebelumnya
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                      let pageNum
                      if (pagination.last_page <= 5) {
                        pageNum = i + 1
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.current_page >= pagination.last_page - 2) {
                        pageNum = pagination.last_page - 4 + i
                      } else {
                        pageNum = pagination.current_page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.current_page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
