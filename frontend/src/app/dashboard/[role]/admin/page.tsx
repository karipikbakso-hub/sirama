'use client'

import { useState, useEffect } from 'react'
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

function AdminDashboard() {
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

  return (
    <div className="space-y-6">
      {activeTab === 'overview' && (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏥 Admin Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Select a module from the sidebar to get started</p>
        </div>
      )}
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

export default AdminDashboard
