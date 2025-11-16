'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaCloud, FaSync, FaCheckCircle, FaExclamationTriangle, FaPlug, FaLock, FaDatabase, FaLink, FaTimes } from 'react-icons/fa'
import apiData from '@/lib/apiData'

export default function BpjsIntegrationPage() {
  const [selectedService, setSelectedService] = useState('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configForm, setConfigForm] = useState({
    base_url: '',
    cons_id: '',
    secret_key: '',
    is_active: true
  })
  const queryClient = useQueryClient()

  // API calls with React Query
  const { data: bpjsStats, isLoading: statsLoading } = useQuery({
    queryKey: ['bpjs-integration-stats'],
    queryFn: async () => {
      const response = await apiData.get('api/bpjs-integration')
      return response.data.data
    }
  })

  const { data: apiLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['bpjs-integration-logs'],
    queryFn: async () => {
      const response = await apiData.get('api/bpjs-integration/logs')
      return response.data.data
    }
  })

  const { data: bpjsConfig, isLoading: configLoading } = useQuery({
    queryKey: ['bpjs-integration-config'],
    queryFn: async () => {
      const response = await apiData.get('api/bpjs-integration/configuration')
      return response.data.data
    }
  })

  // Mutations for actions
  const syncMutation = useMutation({
    mutationFn: async (serviceType: string) => {
      const response = await apiData.post('api/bpjs-integration/sync', { service_type: serviceType })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpjs-integration-stats'] })
      queryClient.invalidateQueries({ queryKey: ['bpjs-integration-logs'] })
    }
  })

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('api/bpjs-integration/test-connection')
      return response.data
    }
  })

  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiData.post('api/bpjs-integration/configuration', config)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpjs-integration-config'] })
    }
  })

  const handleSync = async (serviceType = 'all') => {
    try {
      await syncMutation.mutateAsync(serviceType)
      alert('BPJS sync completed successfully!')
    } catch (error: any) {
      alert('BPJS sync failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleTestConnection = async () => {
    try {
      const result = await testConnectionMutation.mutateAsync()
      if (result.success) {
        alert(`✅ Connection successful!\nStatus: ${result.data.status_code}\nResponse Time: ${result.data.response_time}ms`)
      } else {
        alert(`❌ Connection failed: ${result.message}`)
      }
    } catch (error: any) {
      alert('Connection test failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleUpdateConfiguration = () => {
    // Pre-fill form with current config if available
    if (bpjsConfig) {
      setConfigForm({
        base_url: bpjsConfig.base_url || '',
        cons_id: bpjsConfig.cons_id || '',
        secret_key: bpjsConfig.secret_key || '',
        is_active: bpjsConfig.is_active ?? true
      })
    }
    setShowConfigModal(true)
  }

  const handleSaveConfiguration = async () => {
    try {
      await updateConfigMutation.mutateAsync(configForm)
      alert('BPJS configuration updated successfully!')
      setShowConfigModal(false)
    } catch (error: any) {
      alert('Failed to update configuration: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleViewDocumentation = () => {
    // Open BPJS API documentation
    window.open('https://dokumentasi.bpjs-kesehatan.go.id', '_blank')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Aktif
        </span>
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Warning
        </span>
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">Tidak Aktif</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getLogStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Success</span>
      case 'error':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Error</span>
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Warning</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaCloud className="text-blue-500" />
        <span className="truncate">Integrasi BPJS</span>
      </h1>

      {/* BPJS Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Request</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (bpjsStats?.total_requests || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">bulan ini</p>
            </div>
            <FaDatabase className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (bpjsStats?.success_rate || 0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tingkat keberhasilan</p>
            </div>
            <FaCheckCircle className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Sync</p>
              <p className="text-lg font-bold">
                {statsLoading ? '...' : bpjsStats?.last_sync ? new Date(bpjsStats.last_sync).toLocaleTimeString('id-ID') : 'Never'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">sync terakhir</p>
            </div>
            <FaSync className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Connections</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (bpjsStats?.active_connections || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">koneksi aktif</p>
            </div>
            <FaLink className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleSync()}
            disabled={syncMutation.isPending}
            className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <FaSync className={`text-2xl text-blue-500 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="font-medium">{syncMutation.isPending ? 'Syncing...' : 'Sync Data'}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Sinkronisasi dengan BPJS</span>
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testConnectionMutation.isPending}
            className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <FaLock className="text-2xl text-green-500" />
            <span className="font-medium">{testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Test koneksi API</span>
          </button>
          <button className="p-4 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex flex-col items-center gap-2">
            <FaDatabase className="text-2xl text-orange-500" />
            <span className="font-medium">Data Mapping</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Mapping data BPJS</span>
          </button>
          <button className="p-4 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex flex-col items-center gap-2">
            <FaPlug className="text-2xl text-red-500" />
            <span className="font-medium">API Settings</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Konfigurasi API</span>
          </button>
        </div>
      </div>

      {/* BPJS Services Status */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Status Layanan BPJS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statsLoading ? (
            <div className="col-span-2 text-center py-8">Loading services...</div>
          ) : bpjsStats?.services && bpjsStats.services.length > 0 ? (
            bpjsStats.services.map((service: any, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{service.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last used: {service.last_used ? new Date(service.last_used).toLocaleString('id-ID') : 'Never'}
                    </p>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Requests Today</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{service.requests_today || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{service.success_rate || 0}%</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">No services available</div>
          )}
        </div>
      </div>

      {/* API Logs */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">API Logs Terbaru</h2>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Timestamp</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Service</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Response Time</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Patient ID</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {logsLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">Loading logs...</td>
                </tr>
              ) : apiLogs?.data && apiLogs.data.length > 0 ? (
                apiLogs.data.map((log: any, index: number) => (
                  <tr key={log.id || index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 font-mono text-sm">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString('id-ID') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">{log.service_type || 'N/A'}</td>
                    <td className="px-4 py-3">{getLogStatusBadge(log.status || 'unknown')}</td>
                    <td className="px-4 py-3">{log.response_time || 'N/A'}</td>
                    <td className="px-4 py-3 font-mono text-sm">{log.patient_id || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No logs available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mt-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Konfigurasi BPJS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">API Endpoints</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Base URL:</span>
                <span className="font-mono">https://api.bpjs-kesehatan.go.id</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">SEP Endpoint:</span>
                <span className="font-mono">/v1/sep</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Patient Endpoint:</span>
                <span className="font-mono">/v1/patient</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Claim Endpoint:</span>
                <span className="font-mono">/v1/claim</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Authentication</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">API Key:</span>
                <span className="font-mono">••••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Secret Key:</span>
                <span className="font-mono">••••••••••••••••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Token Expiry:</span>
                <span className="text-green-600 dark:text-green-400">Valid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rate Limit:</span>
                <span>1000 req/hour</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpdateConfiguration}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Update Configuration
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testConnectionMutation.isPending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
          >
            {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleViewDocumentation}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            View Documentation
          </button>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Update BPJS Configuration</h3>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close modal"
                  aria-label="Close configuration modal"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={configForm.base_url}
                    onChange={(e) => setConfigForm({...configForm, base_url: e.target.value})}
                    placeholder="https://api.bpjs-kesehatan.go.id"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Consumer ID (Cons ID)
                  </label>
                  <input
                    type="text"
                    value={configForm.cons_id}
                    onChange={(e) => setConfigForm({...configForm, cons_id: e.target.value})}
                    placeholder="Your BPJS Consumer ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={configForm.secret_key}
                    onChange={(e) => setConfigForm({...configForm, secret_key: e.target.value})}
                    placeholder="Your BPJS Secret Key"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={configForm.is_active}
                    onChange={(e) => setConfigForm({...configForm, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active Configuration
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfiguration}
                  disabled={updateConfigMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
