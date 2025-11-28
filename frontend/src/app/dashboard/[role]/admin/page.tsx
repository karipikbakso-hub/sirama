'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic imports for admin modules - SPA switching
const UserManagement = dynamic(() => import('./user/page'), { loading: () => <div>Loading...</div> })
const RoleManagement = dynamic(() => import('./role/page'), { loading: () => <div>Loading...</div> })
const AuditLogs = dynamic(() => import('./audit/page'), { loading: () => <div>Loading...</div> })
const BackupRecovery = dynamic(() => import('./backup/page'), { loading: () => <div>Loading...</div> })
const SystemSettings = dynamic(() => import('./settings/page'), { loading: () => <div>Loading...</div> })
const IntegrationHealth = dynamic(() => import('./integration/page'), { loading: () => <div>Loading...</div> })
const ErrorLogs = dynamic(() => import('./error-log/page'), { loading: () => <div>Loading...</div> })
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), { loading: () => <div>Loading...</div> })

function AdminDashboardPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'role' | 'settings' | 'audit' | 'backup' | 'integration' | 'error-log'>('overview')

  // Update active tab based on module query parameter
  useEffect(() => {
    const module = searchParams?.get('module') || 'overview'
    const validModules = ['overview', 'user', 'role', 'settings', 'audit', 'backup', 'integration', 'error-log']
    if (validModules.includes(module)) {
      setActiveTab(module as any)
    } else {
      setActiveTab('overview') // fallback
    }
  }, [searchParams])

  if (activeTab === 'overview') {
    return <AdminDashboard />
  }

  return (
    <div className="space-y-6">
      {activeTab === 'user' && <UserManagement />}
      {activeTab === 'role' && <RoleManagement />}
      {activeTab === 'audit' && <AuditLogs />}
      {activeTab === 'backup' && <BackupRecovery />}
      {activeTab === 'settings' && <SystemSettings />}
      {activeTab === 'integration' && <IntegrationHealth />}
      {activeTab === 'error-log' && <ErrorLogs />}
    </div>
  )
}

export default AdminDashboardPage
