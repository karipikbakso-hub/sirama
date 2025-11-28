f'use client'

import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { MdCreditCard, MdReceipt, MdCalendarToday } from 'react-icons/md'
import { Patient } from '@/types/role/pendaftaran'

interface PatientBpjsHistoryTabProps {
  patient: Patient
}

export function PatientBpjsHistoryTab({ patient }: PatientBpjsHistoryTabProps) {
  // Mock data - replace with actual API call
  const sepHistory = [
    {
      id: 1,
      no_sep: '0121R0011111V000001',
      tanggal_sep: '2024-11-15',
      poli: 'Poli Umum',
      dokter: 'Dr. Ahmad Santoso',
      diagnosa: 'Demam Berdarah',
      status: 'Selesai'
    },
    {
      id: 2,
      no_sep: '0121R0011111V000002',
      tanggal_sep: '2024-10-20',
      poli: 'Poli Anak',
      dokter: 'Dr. Siti Nurhaliza',
      diagnosa: 'ISPA',
      status: 'Selesai'
    }
  ]

  const klaimHistory = [
    {
      id: 1,
      periode: 'November 2024',
      total_klaim: 150000,
      status: 'Dibayar',
      tanggal_bayar: '2024-12-01'
    },
    {
      id: 2,
      periode: 'Oktober 2024',
      total_klaim: 200000,
      status: 'Dibayar',
      tanggal_bayar: '2024-11-01'
    }
  ]

  if (!patient.bpjs_number) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MdCreditCard className="mx-auto mb-2 text-3xl opacity-50" />
            <p>Pasien tidak terdaftar BPJS</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* BPJS Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdCreditCard />
            Informasi BPJS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">No. BPJS:</span>
              <span className="font-mono font-semibold">{patient.bpjs_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <Badge variant="default">Aktif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEP History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdReceipt />
            Riwayat SEP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sepHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MdReceipt className="mx-auto mb-2 text-3xl opacity-50" />
              <p>Belum ada riwayat SEP</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sepHistory.map((sep) => (
                <div key={sep.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-sm font-semibold text-blue-600">
                      {sep.no_sep}
                    </div>
                    <Badge variant={sep.status === 'Selesai' ? 'default' : 'secondary'}>
                      {sep.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MdCalendarToday className="text-gray-500" />
                      <span>{new Date(sep.tanggal_sep).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Poli:</span>
                      <span className="ml-1 font-medium">{sep.poli}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Dokter:</span>
                      <span className="ml-1">{sep.dokter}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Diagnosa:</span>
                      <span className="ml-1">{sep.diagnosa}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Klaim History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdReceipt />
            Riwayat Klaim
          </CardTitle>
        </CardHeader>
        <CardContent>
          {klaimHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MdReceipt className="mx-auto mb-2 text-3xl opacity-50" />
              <p>Belum ada riwayat klaim</p>
            </div>
          ) : (
            <div className="space-y-4">
              {klaimHistory.map((klaim) => (
                <div key={klaim.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">{klaim.periode}</div>
                    <Badge variant={klaim.status === 'Dibayar' ? 'default' : 'secondary'}>
                      {klaim.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Klaim:</span>
                      <span className="ml-1 font-medium text-green-600">
                        Rp {klaim.total_klaim.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Tanggal Bayar:</span>
                      <span className="ml-1">{new Date(klaim.tanggal_bayar).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}