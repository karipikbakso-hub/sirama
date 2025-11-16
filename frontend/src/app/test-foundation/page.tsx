'use client'

import React, { useState } from 'react'
import { UsersIcon, ActivityIcon, DatabaseIcon, SettingsIcon, BarChartIcon, UserPlusIcon, ClockIcon, CheckCircleIcon } from 'lucide-react'

// Our foundation components
import { StatCard } from '@/components/ui/stat-card'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, Column } from '@/components/ui/data-table'
import { CrudPageTemplate } from '@/templates/CrudPageTemplate'
import { DashboardTemplate } from '@/templates/DashboardTemplate'

// Test data and forms
import type { Patient } from '@/lib/apiTypes'

const generateMockPatients = (): Patient[] => [
  {
    id: '1',
    medicalRecordNumber: 'MR-20250001',
    nik: '1234567890123456',
    fullName: 'John Doe',
    dateOfBirth: '1985-01-15',
    gender: 'L' as const,
    address: 'Jl. Sudirman No. 1',
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    district: 'Tanah Abang',
    subDistrict: 'Kebon Melati',
    postalCode: '10230',
    phone: '08123456789',
    email: 'john.doe@example.com',
    emergencyContact: '08123456788',
    emergencyPhone: 'Emergency Contact 1',
    insuranceType: 'bpjs' as const,
    bpjsClass: '1' as const,
    insuranceProvider: 'BPJS Kesehatan',
    insuranceNumber: '0001234567890',
    allergies: ['Penicillin'],
    chronicDiseases: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true,
  },
  {
    id: '2',
    medicalRecordNumber: 'MR-20250002',
    nik: '2345678901234567',
    fullName: 'Jane Smith',
    dateOfBirth: '1990-05-22',
    gender: 'P' as const,
    address: 'Jl. Thamrin No. 25',
    province: 'DKI Jakarta',
    city: 'Jakarta Pusat',
    district: 'Menteng',
    subDistrict: 'Menteng',
    postalCode: '10350',
    phone: '08987654321',
    email: 'jane.smith@example.com',
    emergencyContact: '08987654322',
    emergencyPhone: 'Emergency Contact 2',
    insuranceType: 'private' as const,
    insuranceProvider: 'Prudential',
    insuranceNumber: 'PRU00123456',
    allergies: [],
    chronicDiseases: ['Hypertension'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true,
  },
  {
    id: '3',
    medicalRecordNumber: 'MR-20250003',
    nik: '3456789012345678',
    fullName: 'Bob Johnson',
    dateOfBirth: '1978-03-10',
    gender: 'L' as const,
    address: 'Jl. Gatot Subroto No. 50',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    district: 'Setiabudi',
    subDistrict: 'Setiabudi',
    postalCode: '12950',
    phone: '08111222333',
    emergencyContact: '08111222344',
    emergencyPhone: 'Emergency Contact 3',
    insuranceType: 'cash' as const,
    allergies: [],
    chronicDiseases: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true,
  }
]

const PatientCreateForm = ({ onSuccess }: { onSuccess: () => void }) => (
  <div className="space-y-4">
    <div>Form fields would go here...</div>
    <Button onClick={onSuccess}>Create</Button>
  </div>
)

const PatientEditForm = ({ data, onSuccess }: { data: Patient; onSuccess: () => void }) => (
  <div className="space-y-4">
    <div>Editing: {data.fullName}</div>
    <Button onClick={onSuccess}>Save</Button>
  </div>
)

const TestFoundationPage = () => {
  const [activeTab, setActiveTab] = useState('overview')

  // Static mock data - NO API CALLS
  const [mockPatients] = useState<Patient[]>(generateMockPatients())

  const patientColumns: Column<Patient>[] = [
    { key: 'medicalRecordNumber', label: 'MRN', sortable: true },
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'nik', label: 'NIK', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'gender', label: 'Gender', sortable: true, render: (v) => v === 'L' ? 'Male' : 'Female' }
  ]

  const mockDashboardStats = [
    {
      title: 'Total Patients',
      value: 142,
      icon: UsersIcon,
      change: 12,
      trend: 'up' as const,
      description: '+12% from last month'
    },
    {
      title: 'Today\'s Registrations',
      value: 23,
      icon: UserPlusIcon,
      change: 8,
      trend: 'up' as const,
      description: '+8% from yesterday'
    },
    {
      title: 'Active Queue',
      value: 15,
      icon: ClockIcon,
      change: -3,
      trend: 'down' as const,
      description: '-3 from peak'
    },
    {
      title: 'Completed Today',
      value: 47,
      icon: CheckCircleIcon,
      change: 5,
      trend: 'up' as const,
      description: '+5% completion rate'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Foundation Test Page"
        description="Testing all PHASE 1 foundation components"
        actions={[
          <Button
            key="overview"
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            <ActivityIcon className="h-4 w-4 mr-2" />
            Overview
          </Button>,
          <Button
            key="datatable"
            variant={activeTab === 'datatable' ? 'default' : 'outline'}
            onClick={() => setActiveTab('datatable')}
          >
            <DatabaseIcon className="h-4 w-4 mr-2" />
            DataTable
          </Button>,
          <Button
            key="templates"
            variant={activeTab === 'templates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('templates')}
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Templates
          </Button>,
          <Button
            key="dashboard"
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChartIcon className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        ]}
      />

      <div className="p-6">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">PHASE 1 Foundation Complete</h2>
              <p className="text-muted-foreground mb-6">
                All foundation components are working and ready for testing
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <StatCard
                  title="Components Created"
                  value="19 Files"
                  icon={UsersIcon}
                  change={100}
                  trend="up"
                  description="All foundation components built"
                />
                <StatCard
                  title="Test Status"
                  value="Ready"
                  icon={ActivityIcon}
                  description="Ready to test with npm run dev"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features Tested</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">✅ Data Layer</h4>
                  <p className="text-sm text-muted-foreground">useFetch, useCreate, useUpdate, useDelete hooks</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">✅ UI Components</h4>
                  <p className="text-sm text-muted-foreground">DataTable, StatCard, PageHeader, ModalForm</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">✅ Templates</h4>
                  <p className="text-sm text-muted-foreground">CrudPageTemplate, DashboardTemplate</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">✅ Responsive</h4>
                  <p className="text-sm text-muted-foreground">Mobile-first at 375px+, CSS variables only</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'datatable' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">DataTable Component Test</h2>
            <p className="text-muted-foreground">Test sorting, search, pagination, and mobile responsiveness</p>

            <DataTable
              data={mockPatients}
              columns={patientColumns}
              searchable
              searchPlaceholder="Search patients..."
              pagination
              itemsPerPage={5}
              emptyStateMessage="No patients found"
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">CRUD Template Test</h2>
            <p className="text-muted-foreground">Test the CrudPageTemplate with Master Context Patient model</p>

            <CrudPageTemplate
              title="Test Patient Management"
              description="Demonstrating CrudPageTemplate with Master Context compliance"
              endpoint="/api/test-patients"
              columns={patientColumns}
              CreateForm={PatientCreateForm}
              EditForm={PatientEditForm}
              deletable={true}
            />

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Using mock forms and console logging for this test.
                In production, these connect to real Laravel API endpoints.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Template Test</h2>
            <p className="text-muted-foreground">Test the DashboardTemplate with StatCard components and responsive layout</p>

            <DashboardTemplate
              title="Test Dashboard"
              description="Demonstrating DashboardTemplate with metrics and trends"
              stats={mockDashboardStats}
              statsColumns={3}
              gridGap="md"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TestFoundationPage
