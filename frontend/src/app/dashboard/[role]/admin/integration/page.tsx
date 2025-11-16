'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MdCloudUpload,
  MdShield,
  MdSync,
  MdCheckCircle,
  MdError,
  MdSettings,
  MdRefresh,
  MdInfo,
  MdLink,
  MdLinkOff,
  MdApi,
  MdSecurity,
  MdEdit,
  MdHistory,
  MdBarChart,
  MdFilterList,
  MdSearch,
  MdDownload,
  MdWarning
} from 'react-icons/md'
import apiData from '@/lib/apiData'
import toast from '@/lib/toast'

interface IntegrationConfig {
  id: number
  name: string
  status: 'active' | 'inactive'
  client_id?: string
  client_secret?: string
  base_url?: string
  organization_id?: string
  facility_id?: string
  last_sync_at?: string
  created_at: string
  updated_at: string
}

interface BpjsConfig {
  id: number
  api_endpoint: string
  api_key?: string
  secret_key?: string
  rate_limit: number
  is_active: boolean
  environment: string
  token_expiry?: string
  created_at: string
  updated_at: string
}

interface ApiLog {
  id: number
  service: string
  endpoint: string
  method: string
  status_code?: number
  response_time?: number
  error_message?: string
  is_success: boolean
  created_at: string
  user?: {
    id: number
    name: string
    email: string
  }
}

interface IntegrationStats {
  bpjs: {
    total_requests: number
    success_rate: number
    avg_response_time: number
    last_sync?: string
  }
  satusehat: {
    total_requests: number
    success_rate: number
    avg_response_time: number
    last_sync?: string
  }
}

export default function IntegrationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bpjs' | 'satusehat' | 'logs' | 'stats'>('overview')
  const [showBpjsModal, setShowBpjsModal] = useState(false)
  const [showSatusehatModal, setShowSatusehatModal] = useState(false)
  const [logFilters, setLogFilters] = useState({
    service: 'all',
    status: 'all',
    date_from: '',
    date_to: ''
  })

  const queryClient = useQueryClient()

  // Fetch integration configurations
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ['integration-configs'],
    queryFn: async () => {
      const response = await apiData.get('/integrations/configurations')
      return response.data.data
    }
  })

  // Fetch API logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['api-logs', logFilters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(logFilters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })
      const response = await apiData.get(`/integrations/logs?${params}`)
      return response.data.data
    }
  })

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['integration-stats'],
    queryFn: async () => {
      const response = await apiData.get('/integrations/statistics')
      return response.data.data
    }
  })

  // Update BPJS config mutation
  const updateBpjsMutation = useMutation({
    mutationFn: async (data: Partial<BpjsConfig>) => {
      const response = await apiData.put('/integrations/bpjs', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] })
      setShowBpjsModal(false)
      toast.success('Konfigurasi BPJS berhasil diperbarui')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui konfigurasi BPJS')
    }
  })

  // Update SATUSEHAT config mutation
  const updateSatusehatMutation = useMutation({
    mutationFn: async (data: Partial<IntegrationConfig>) => {
      const response = await apiData.put('/integrations/satusehat', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] })
      setShowSatusehatModal(false)
      toast.success('Konfigurasi SATUSEHAT berhasil diperbarui')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui konfigurasi SATUSEHAT')
    }
  })

  // Test BPJS connection
  const testBpjsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/integrations/bpjs/test-connection')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] })
      queryClient.invalidateQueries({ queryKey: ['api-logs'] })
      toast.success(data.message || 'Koneksi BPJS berhasil')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Koneksi BPJS gagal')
    }
  })

  // Test SATUSEHAT connection
  const testSatusehatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/integrations/satusehat/test-connection')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] })
      queryClient.invalidateQueries({ queryKey: ['api-logs'] })
      toast.success(data.message || 'Koneksi SATUSEHAT berhasil')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Koneksi SATUSEHAT gagal')
    }
  })

  // Refresh BPJS token
  const refreshBpjsTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/integrations/bpjs/refresh-token')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] })
      toast.success(data.message || 'Token BPJS berhasil diperbarui')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui token BPJS')
    }
  })

  // Refresh SATUSEHAT token
  const refreshSatusehatTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/integrations/satusehat/refresh-token')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integration-configs'] })
      toast.success(data.message || 'Token SATUSEHAT berhasil diperbarui')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui token SATUSEHAT')
    }
  })

  const configs = configsData || { bpjs: { config: null, status: {} }, satusehat: { config: null, status: {} } }
  const logs = logsData?.data || []
  const stats = statsData || { bpjs: {}, satusehat: {} }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <MdCheckCircle className="text-green-500 text-xl" />
      case 'error':
        return <MdError className="text-red-500 text-xl" />
      default:
        return <MdLinkOff className="text-gray-500 text-xl" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Integrasi Sistem
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola integrasi dengan BPJS dan SATUSEHAT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['integration-configs'] })}
            disabled={configsLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${configsLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: MdBarChart },
              { key: 'bpjs', label: 'BPJS', icon: MdShield },
              { key: 'satusehat', label: 'SATUSEHAT', icon: MdApi },
              { key: 'logs', label: 'API Logs', icon: MdHistory },
              { key: 'stats', label: 'Statistik', icon: MdBarChart }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Icon className="text-lg" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BPJS Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <MdShield className="text-blue-600 dark:text-blue-400 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BPJS Integration</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bridging BPJS Kesehatan</p>
                      </div>
                    </div>
                    {getStatusIcon(configs.bpjs.status.status || 'disconnected')}
                  </div>

                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getStatusColor(configs.bpjs.status.status || 'disconnected')}`}>
                    {configs.bpjs.status.status === 'connected' ? 'Terhubung' :
                     configs.bpjs.status.status === 'error' ? 'Error' : 'Terputus'}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {configs.bpjs.status.message || 'Status belum diketahui'}
                  </p>

                  {configs.bpjs.status.last_sync && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      Terakhir sync: {formatDateTime(configs.bpjs.status.last_sync)}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => testBpjsMutation.mutate()}
                      disabled={testBpjsMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <MdLink className="text-lg" />
                      Test Koneksi
                    </button>
                    <button
                      onClick={() => setShowBpjsModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MdSettings className="text-lg" />
                      Konfigurasi
                    </button>
                  </div>
                </div>

                {/* SATUSEHAT Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <MdApi className="text-green-600 dark:text-green-400 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SATUSEHAT Integration</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sistem Informasi Satu Sehat</p>
                      </div>
                    </div>
                    {getStatusIcon(configs.satusehat.status.status || 'disconnected')}
                  </div>

                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getStatusColor(configs.satusehat.status.status || 'disconnected')}`}>
                    {configs.satusehat.status.status === 'connected' ? 'Terhubung' :
                     configs.satusehat.status.status === 'error' ? 'Error' : 'Terputus'}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {configs.satusehat.status.message || 'Status belum diketahui'}
                  </p>

                  {configs.satusehat.status.last_sync && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      Terakhir sync: {formatDateTime(configs.satusehat.status.last_sync)}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => testSatusehatMutation.mutate()}
                      disabled={testSatusehatMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <MdLink className="text-lg" />
                      Test Koneksi
                    </button>
                    <button
                      onClick={() => setShowSatusehatModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <MdSettings className="text-lg" />
                      Konfigurasi
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <MdShield className="text-blue-500 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">BPJS Requests</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.bpjs?.total_requests || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <MdApi className="text-green-500 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SATUSEHAT Requests</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.satusehat?.total_requests || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-500 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {Math.max(stats.bpjs?.success_rate || 0, stats.satusehat?.success_rate || 0)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <MdHistory className="text-purple-500 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{logsData?.total || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BPJS Configuration Tab */}
          {activeTab === 'bpjs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdShield className="text-blue-500 text-2xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BPJS Configuration</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Konfigurasi API BPJS Kesehatan</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBpjsModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <MdEdit className="text-lg" />
                  Edit Config
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Endpoint
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {configs.bpjs.config?.api_endpoint || 'Belum dikonfigurasi'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Consumer ID
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {configs.bpjs.config?.api_key ? '••••••••' : 'Belum dikonfigurasi'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Environment
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {configs.bpjs.config?.environment || 'production'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MdInfo className="text-blue-500 text-xl mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                            Status Koneksi
                          </h4>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(configs.bpjs.status.status || 'disconnected')}`}>
                            {configs.bpjs.status.status === 'connected' ? 'Terhubung' :
                             configs.bpjs.status.status === 'error' ? 'Error' : 'Terputus'}
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                            {configs.bpjs.status.message || 'Status belum diketahui'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => testBpjsMutation.mutate()}
                        disabled={testBpjsMutation.isPending}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <MdLink className="text-lg" />
                        Test Connection
                      </button>
                      <button
                        onClick={() => refreshBpjsTokenMutation.mutate()}
                        disabled={refreshBpjsTokenMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <MdRefresh className="text-lg" />
                        Refresh Token
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SATUSEHAT Configuration Tab */}
          {activeTab === 'satusehat' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdApi className="text-green-500 text-2xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SATUSEHAT Configuration</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Konfigurasi API SATUSEHAT</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSatusehatModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <MdEdit className="text-lg" />
                  Edit Config
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base URL
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {configs.satusehat.config?.base_url || 'Belum dikonfigurasi'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Organization ID
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {configs.satusehat.config?.organization_id || 'Belum dikonfigurasi'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Client ID
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {configs.satusehat.config?.client_id ? '••••••••' : 'Belum dikonfigurasi'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MdInfo className="text-green-500 text-xl mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                            Status Koneksi
                          </h4>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(configs.satusehat.status.status || 'disconnected')}`}>
                            {configs.satusehat.status.status === 'connected' ? 'Terhubung' :
                             configs.satusehat.status.status === 'error' ? 'Error' : 'Terputus'}
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                            {configs.satusehat.status.message || 'Status belum diketahui'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => testSatusehatMutation.mutate()}
                        disabled={testSatusehatMutation.isPending}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <MdLink className="text-lg" />
                        Test Connection
                      </button>
                      <button
                        onClick={() => refreshSatusehatTokenMutation.mutate()}
                        disabled={refreshSatusehatTokenMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <MdRefresh className="text-lg" />
                        Refresh Token
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdHistory className="text-purple-500 text-2xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Logs</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Riwayat panggilan API</p>
                  </div>
                </div>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['api-logs'] })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <MdRefresh className="text-lg" />
                  Refresh
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service
                    </label>
                    <select
                      value={logFilters.service}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, service: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Semua Service</option>
                      <option value="bpjs">BPJS</option>
                      <option value="satusehat">SATUSEHAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={logFilters.status}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Semua Status</option>
                      <option value="success">Berhasil</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      value={logFilters.date_from}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, date_from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      value={logFilters.date_to}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, date_to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {logsLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading logs...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Service
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Endpoint
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Response Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.map((log: ApiLog) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                log.service === 'bpjs'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}>
                                {log.service.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {log.endpoint}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                log.method === 'GET' ? 'bg-green-100 text-green-800' :
                                log.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                log.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {log.is_success ? (
                                <MdCheckCircle className="text-green-500 text-lg" />
                              ) : (
                                <MdError className="text-red-500 text-lg" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {log.response_time ? `${log.response_time}ms` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {log.user?.name || 'System'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDateTime(log.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MdBarChart className="text-indigo-500 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistik Integrasi</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ringkasan performa API</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BPJS Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MdShield className="text-blue-500 text-2xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">BPJS Statistics</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.bpjs?.total_requests || 0}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="text-lg font-semibold text-green-600">{stats.bpjs?.success_rate || 0}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.bpjs?.avg_response_time || 0}ms</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {stats.bpjs?.last_sync ? formatDateTime(stats.bpjs.last_sync) : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SATUSEHAT Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MdApi className="text-green-500 text-2xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">SATUSEHAT Statistics</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.satusehat?.total_requests || 0}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="text-lg font-semibold text-green-600">{stats.satusehat?.success_rate || 0}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.satusehat?.avg_response_time || 0}ms</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {stats.satusehat?.last_sync ? formatDateTime(stats.satusehat.last_sync) : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BPJS Configuration Modal */}
      {showBpjsModal && (
        <BpjsConfigModal
          config={configs.bpjs.config}
          onClose={() => setShowBpjsModal(false)}
          onSave={(data) => updateBpjsMutation.mutate(data)}
          loading={updateBpjsMutation.isPending}
        />
      )}

      {/* SATUSEHAT Configuration Modal */}
      {showSatusehatModal && (
        <SatusehatConfigModal
          config={configs.satusehat.config}
          onClose={() => setShowSatusehatModal(false)}
          onSave={(data) => updateSatusehatMutation.mutate(data)}
          loading={updateSatusehatMutation.isPending}
        />
      )}
    </div>
  )
}

// BPJS Configuration Modal Component
function BpjsConfigModal({ config, onClose, onSave, loading }: {
  config: BpjsConfig | null
  onClose: () => void
  onSave: (data: Partial<BpjsConfig>) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    api_endpoint: config?.api_endpoint || 'https://api.bpjs-kesehatan.go.id',
    api_key: '',
    secret_key: '',
    rate_limit: config?.rate_limit || 1000,
    environment: config?.environment || 'production',
    is_active: config?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <MdShield className="text-blue-500 text-2xl" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Konfigurasi BPJS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Edit pengaturan API BPJS</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Endpoint
            </label>
            <input
              type="url"
              value={formData.api_endpoint}
              onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Consumer ID (API Key)
            </label>
            <input
              type="text"
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder="Masukkan Consumer ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Consumer Secret
            </label>
            <input
              type="password"
              value={formData.secret_key}
              onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
              placeholder="Masukkan Consumer Secret"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rate Limit (requests/hour)
            </label>
            <input
              type="number"
              value={formData.rate_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, rate_limit: parseInt(e.target.value) }))}
              min="1"
              max="10000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktifkan integrasi BPJS
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdCheckCircle className="text-lg" />
              )}
              Simpan Konfigurasi
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// SATUSEHAT Configuration Modal Component
function SatusehatConfigModal({ config, onClose, onSave, loading }: {
  config: IntegrationConfig | null
  onClose: () => void
  onSave: (data: Partial<IntegrationConfig>) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    client_id: config?.client_id || '',
    client_secret: config?.client_secret || '',
    base_url: config?.base_url || 'https://api-satusehat.kemkes.go.id',
    organization_id: config?.organization_id || '',
    facility_id: config?.facility_id || '',
    status: config?.status || 'inactive'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <MdApi className="text-green-500 text-2xl" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Konfigurasi SATUSEHAT</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Edit pengaturan API SATUSEHAT</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base URL
            </label>
            <input
              type="url"
              value={formData.base_url}
              onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization ID
            </label>
            <input
              type="text"
              value={formData.organization_id}
              onChange={(e) => setFormData(prev => ({ ...prev, organization_id: e.target.value }))}
              placeholder="Masukkan Organization ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facility ID
            </label>
            <input
              type="text"
              value={formData.facility_id}
              onChange={(e) => setFormData(prev => ({ ...prev, facility_id: e.target.value }))}
              placeholder="Masukkan Facility ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client ID
            </label>
            <input
              type="text"
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
              placeholder="Masukkan Client ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Secret
            </label>
            <input
              type="password"
              value={formData.client_secret}
              onChange={(e) => setFormData(prev => ({ ...prev, client_secret: e.target.value }))}
              placeholder="Masukkan Client Secret"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdCheckCircle className="text-lg" />
              )}
              Simpan Konfigurasi
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
