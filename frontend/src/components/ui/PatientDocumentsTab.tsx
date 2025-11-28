'use client'

import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { MdUpload, MdFileDownload } from 'react-icons/md'

interface PatientDocumentsTabProps {
  patientId: number
}

export function PatientDocumentsTab({ patientId }: PatientDocumentsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dokumen Pasien</span>
            <Button variant="outline" size="sm">
              <MdUpload className="mr-2" />
              Upload Dokumen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MdFileDownload className="mx-auto text-4xl mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Belum ada dokumen</h3>
            <p>Upload dokumen seperti KTP, BPJS, atau dokumen medis lainnya</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}