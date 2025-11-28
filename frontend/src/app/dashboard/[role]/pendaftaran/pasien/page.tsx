'use client'

import { useState } from 'react'
import { Patient } from '@/types/role/pendaftaran'
import { PatientSearchBar } from '@/components/ui/PatientSearchBar'
import { PatientCard } from '@/components/ui/PatientCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PatientBiodataTab } from '@/components/ui/PatientBiodataTab'
import { PatientVisitHistoryTab } from '@/components/ui/PatientVisitHistoryTab'
import { PatientBpjsHistoryTab } from '@/components/ui/PatientBpjsHistoryTab'
import { PatientDocumentsTab } from '@/components/ui/PatientDocumentsTab'
import { PatientHistoryTab } from '@/components/ui/PatientHistoryTab'
import { PatientMergeWizard } from '@/components/ui/PatientMergeWizard'
import { usePatientActions } from '@/hooks/usePatientActions'
import { PageHeader } from '@/components/ui/page-header'

export default function PatientEMRPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState('biodata')
  const [isMergeWizardOpen, setIsMergeWizardOpen] = useState(false)
  const { printPatientCard, exportEMR, mergeDuplicate, deactivatePatient } = usePatientActions()

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const handleEdit = () => {
    // Edit modal handled in PatientBiodataTab
  }

  const handlePrint = () => {
    if (selectedPatient) {
      printPatientCard(selectedPatient)
    }
  }

  const handleExport = () => {
    if (selectedPatient) {
      exportEMR(selectedPatient)
    }
  }

  const handleMerge = () => {
    if (selectedPatient) {
      setIsMergeWizardOpen(true)
    }
  }

  const handleDeactivate = () => {
    if (selectedPatient) {
      deactivatePatient(selectedPatient.id)
    }
  }

  const handleUpdatePatient = () => {
    // Refresh patient data - could invalidate queries here
    setSelectedPatient(null)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Data Pasien (EMR)"
          description="Kelola data pasien, riwayat kunjungan, dan dokumen medis"
        />

        {/* Search Bar */}
        <div className="mb-6">
          <PatientSearchBar onSelectPatient={handleSelectPatient} />
        </div>

        {selectedPatient ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Patient Card - Sidebar */}
            <div className="lg:col-span-1">
              <PatientCard
                patient={selectedPatient}
                onEdit={handleEdit}
                onPrint={handlePrint}
                onExport={handleExport}
                onMerge={handleMerge}
                onDeactivate={handleDeactivate}
              />
            </div>

            {/* Main Content - Tabs */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="biodata">Biodata</TabsTrigger>
                  <TabsTrigger value="riwayat">Riwayat Kunjungan</TabsTrigger>
                  <TabsTrigger value="bpjs">BPJS</TabsTrigger>
                  <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
                  <TabsTrigger value="history">Riwayat Perubahan</TabsTrigger>
                </TabsList>

                <TabsContent value="biodata" className="mt-6">
                  <PatientBiodataTab patient={selectedPatient} onUpdate={handleUpdatePatient} />
                </TabsContent>

                <TabsContent value="riwayat" className="mt-6">
                  <PatientVisitHistoryTab patientId={selectedPatient.id} />
                </TabsContent>

                <TabsContent value="bpjs" className="mt-6">
                  <PatientBpjsHistoryTab patient={selectedPatient} />
                </TabsContent>

                <TabsContent value="dokumen" className="mt-6">
                  <PatientDocumentsTab patientId={selectedPatient.id} />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <PatientHistoryTab patient={selectedPatient} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-xl font-medium mb-2">Pilih Pasien</h3>
              <p>Gunakan search bar di atas untuk mencari dan memilih pasien</p>
            </div>
          </div>
        )}

        {/* Merge Wizard Modal */}
        {selectedPatient && (
          <PatientMergeWizard
            patient={selectedPatient}
            isOpen={isMergeWizardOpen}
            onClose={() => setIsMergeWizardOpen(false)}
            onSuccess={() => {
              setSelectedPatient(null)
              setIsMergeWizardOpen(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
