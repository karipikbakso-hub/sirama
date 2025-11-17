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
  MdWarning,
  MdKey,
  MdContentCopy,
  MdSwapHoriz,
  MdAnalytics,
  MdTimer
} from 'react-icons/md'
import apiData from '@/lib/api'
import toast from '@/lib/toast'
import { AdminOnly } from '@/components/auth/RoleGuard'

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

interface IntegrationStatus {
  connected: boolean
  status: 'connected' | 'error' | 'disconnected' | 'inactive' | 'expired' | 'unknown'
  message: string
  last_sync?: string
}

interface IntegrationData {
  bpjs: {
    config: BpjsConfig | null
    status: IntegrationStatus
  }
  satusehat: {
    config: IntegrationConfig | null
    status: IntegrationStatus
  }
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

interface TestResult {
  success: boolean
  message: string
  data: {
    service?: string
    status_code?: number
    response_time?: number
    is_valid_response?: boolean
    error?: any
    meta_data?: any
  }
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bpjs' | 'satusehat' | 'logs' | 'stats'>('overview')
  const [showBpjsModal, setShowBpjsModal] = useState(false)
  const [showSatusehatModal, setShowSatusehatModal] = useState(false)
  const [testService, setTestService] = useState<'vclaim' | 'pcare' | 'antrean' | 'apotek'>('vclaim')
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({})
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production')
  const [logFilters, setLogFilters] = useState({
    service: 'all',
    status: 'all',
    date_from: '',
    date_to: ''
  })

  const queryClient = useQueryClient()

  // Fetch integration configurations
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ['integrations-configs'],
    queryFn: async () => {
      const response = await apiData.get('/integrations/configurations')
      return response.data.data as IntegrationData
    }
  })

  // Fetch API logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['integrations-logs', logFilters],
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
    queryKey: ['integrations-stats'],
    queryFn: async () => {
      const response = await apiData.get('/integrations/statistics')
      return response.data.data as IntegrationStats
    }
  })

  // Update BPJS config mutation
  const updateBpjsMutation = useMutation({
    mutationFn: async (data: Partial<BpjsConfig>) => {
      const response = await apiData.put('/integrations/bpjs', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-configs'] })
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
      queryClient.invalidateQueries({ queryKey: ['integrations-configs'] })
      setShowSatusehatModal(false)
      toast.success('Konfigurasi SATUSEHAT berhasil diperbarui')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui konfigurasi SATUSEHAT')
    }
  })

  // Test BPJS connection
  const testBpjsMutation = useMutation({
    mutationFn: async (service: string) => {
      const response = await apiData.post('/integrations/bpjs/test-connection', { service })
      return { ...response.data, service } as TestResult
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations-configs'] })
      queryClient.invalidateQueries({ queryKey: ['integrations-logs'] })
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Koneksi BPJS gagal')
    }
  })

  // Test SATUSEHAT connection
  const testSatusehatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/integrations/satusehat/test-connection')
      return response.data as TestResult
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations-configs'] })
      queryClient.invalidateQueries({ queryKey: ['integrations-logs'] })
      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Koneksi SATUSEHAT gagal')
    }
  })

  // Rotate BPJS keys
  const rotateBpjsKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/integrations/bpjs/rotate-key')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations-configs'] })
      toast.success(data.message || 'Kunci BPJS berhasil diputar')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memutar kunci BPJS')
    }
  })

  // Rotate SATUSEHAT keys
  const rotateSatusehatKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/integrations/satusehat/rotate-key')
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations-configs'] })
      toast.success(data.message || 'Kunci SATUSEHAT berhasil diputar')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memutar kunci SATUSEHAT')
    }
  })

  const configs = configsData || {
    bpjs: { config: null, status: { connected: false, status: 'unknown', message: 'Status belum diketahui' } },
    satusehat: { config: null, status: { connected: false, status: 'unknown', message: 'Status belum diketahui' } }
  }
  const logs = logsData?.data || []
  const stats = statsData || {
    bpjs: { total_requests: 0, success_rate: 0, avg_response_time: 0, last_sync: null },
    satusehat: { total_requests: 0, success_rate: 0, avg_response_time: 0, last_sync: null }
  }

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const copyToClipboard = async (text?: string) => {
    if (!text) {
      toast.error('Tidak ada teks untuk disalin')
      return
    }
    await navigator.clipboard.writeText(text)
    toast.success('Teks berhasil disalin ke clipboard')
  }

  const maskSecret = (value: string, show: boolean = false): string => {
    if (!value) return 'Belum dikonfigurasi'
    if (show) return value
    return '*'.repeat(Math.min(value.length, 20)) + value.slice(-4)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <MdCheckCircle className="text-green-500 text-xl" />
      case 'error':
        return <MdError className="text-red-500 text-xl" />
      case 'expired':
        return <MdTimer className="text-orange-500 text-xl" />
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
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
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
    <AdminOnly>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            API Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola integrasi dengan BPJS dan SATUSEHAT
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Environment Switch */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment:</span>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as 'production' | 'sandbox')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['integrations-configs'] })}
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
              { key: 'stats', label: 'Statistik', icon: MdAnalytics }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.key
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
                     configs.bpjs.status.status === 'error' ? 'Error' :
                     configs.bpjs.status.status === 'expired' ? 'Expired' : 'Terputus'}
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
                      onClick={() => testBpjsMutation.mutate(testService)}
                      disabled={testBpjsMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <MdLink className="text-lg" />
                      Test {testService.toUpperCase()}
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

              {/* Service Test Selector */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <MdShield className="text-blue-500 text-2xl" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      BPJS Service Test
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(['vclaim', 'pcare', 'antrean', 'apotek'] as const).map((service) => (
                        <button
                          key={service}
                          onClick={() => setTestService(service)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            testService === service
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}
                        >
                          {service.toUpperCase()}
                        </button>
                      ))}
                    </div>
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Success Rate</p>
                      <p className="text-xl font-bold text-green-600">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => rotateBpjsKeyMutation.mutate()}
                    disabled={rotateBpjsKeyMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdKey className="text-lg" />
                    Rotate Keys
                  </button>
                  <button
                    onClick={() => setShowBpjsModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdEdit className="text-lg" />
                    Edit Config
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Endpoint
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2">
                        <span className="flex-1">{configs.bpjs.config?.api_endpoint || 'Belum dikonfigurasi'}</span>
                        {configs.bpjs.config?.api_endpoint && (
                          <button
                            onClick={() => copyToClipboard(configs.bpjs.config!.api_endpoint!)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <MdContentCopy className="text-lg" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Consumer ID (API Key)
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2">
                        <span className="flex-1">{maskSecret(configs.bpjs.config?.api_key || '', showKeys.bpjs_api_key)}</span>
                        {configs.bpjs.config?.api_key && (
                          <>
                            <button
                              onClick={() => toggleKeyVisibility('bpjs_api_key')}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showKeys.bpjs_api_key ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => copyToClipboard(configs.bpjs.config!.api_key)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                            <MdContentCopy className="text-lg" />
                            </button>
                          </>
                        )}
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
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-2 ${getStatusColor(configs.bpjs.status.status || 'disconnected')}`}>
                            {configs.bpjs.status.status === 'connected' ? 'Terhubung' :
                             configs.bpjs.status.status === 'error' ? 'Error' :
                             configs.bpjs.status.status === 'expired' ? 'Expired' : 'Terputus'}
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {configs.bpjs.status.message || 'Status belum diketahui'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Service Test Buttons */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Test Per Service</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(['vclaim', 'pcare', 'antrean', 'apotek'] as const).map((service) => (
                          <button
                            key={service}
                            onClick={() => testBpjsMutation.mutate(service)}
                            disabled={testBpjsMutation.isPending}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Test {service.toUpperCase()}
                          </button>
                        ))}
                      </div>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => rotateSatusehatKeyMutation.mutate()}
                    disabled={rotateSatusehatKeyMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdKey className="text-lg" />
                    Rotate Keys
                  </button>
                  <button
                    onClick={() => setShowSatusehatModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdEdit className="text-lg" />
                    Edit Config
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base URL
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2">
                        <span className="flex-1">{configs.satusehat.config?.base_url || 'Belum dikonfigurasi'}</span>
                        {configs.satusehat.config?.base_url && (
                          <button
                            onClick={() => copyToClipboard(configs.satusehat.config!.base_url)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <MdContentCopy className="text-lg" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Organization ID
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2">
                        <span className="flex-1">{configs.satusehat.config?.organization_id || 'Belum dikonfigurasi'}</span>
                        {configs.satusehat.config?.organization_id && (
                          <button
                            onClick={() => copyToClipboard(configs.satusehat.config!.organization_id)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Copy Organization ID"
                          >
                            <MdContentCopy className="text-lg" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Client ID
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2">
                        <span className="flex-1">{maskSecret(configs.satusehat.config?.client_id || '', showKeys.satusehat_client_id)}</span>
                        {configs.satusehat.config?.client_id && (
                          <>
                            <button
                              onClick={() => toggleKeyVisibility('satusehat_client_id')}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              title="Toggle visibility"
                            >
                              {showKeys.satusehat_client_id ? 'Hide' : 'Show'}
                            </button>
                            <button
                              onClick={() => copyToClipboard(configs.satusehat.config!.client_id)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              title="Copy Client ID"
                            >
                              <MdContentCopy className="text-lg" />
                            </button>
                          </>
                        )}
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
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-2 ${getStatusColor(configs.satusehat.status.status || 'disconnected')}`}>
                            {configs.satusehat.status.status === 'connected' ? 'Terhubung' :
                             configs.satusehat.status.status === 'error' ? 'Error' : 'Terputus'}
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">
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
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['integrations-logs'] })}
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

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MdAnalytics className="text-purple-500 text-2xl" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Integration Statistics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detailed performance metrics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">BPJS Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.bpjs?.total_requests || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="text-lg font-bold text-green-600">{stats.bpjs?.success_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.bpjs?.avg_response_time || 0}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Sync</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {stats.bpjs?.last_sync ? formatDateTime(stats.bpjs.last_sync) : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SATUSEHAT Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.satusehat?.total_requests || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="text-lg font-bold text-green-600">{stats.satusehat?.success_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.satusehat?.avg_response_time || 0}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Sync</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Konfigurasi BPJS</h2>
                <button
                  onClick={() => setShowBpjsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const data = {
                    api_endpoint: formData.get('api_endpoint') as string,
                    cons_id: formData.get('cons_id') as string,
                    secret_key: formData.get('secret_key') as string,
                    user_key: formData.get('user_key') as string,
                    environment: formData.get('environment') as string,
                    is_active: true
                  }
                  updateBpjsMutation.mutate(data)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Endpoint
                  </label>
                  <input
                    type="url"
                    name="api_endpoint"
                    defaultValue={configs.bpjs.config?.api_endpoint}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://new-api.bpjs-kesehatan.go.id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Consumer ID (cons_id)
                  </label>
                  <input
                    type="text"
                    name="cons_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Masukkan Consumer ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="text"
                    name="secret_key"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Masukkan Secret Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Key
                  </label>
                  <input
                    type="text"
                    name="user_key"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Masukkan User Key (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Environment
                  </label>
                  <select
                    name="environment"
                    defaultValue={configs.bpjs.config?.environment || 'production'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="production">Production</option>
                    <option value="sandbox">Sandbox</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBpjsModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updateBpjsMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
                  >
                    {updateBpjsMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SATUSEHAT Configuration Modal */}
      {showSatusehatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Konfigurasi SATUSEHAT</h2>
                <button
                  onClick={() => setShowSatusehatModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const data = {
                    base_url: formData.get('base_url') as string,
                    client_id: formData.get('client_id') as string,
                    client_secret: formData.get('client_secret') as string,
                    organization_id: formData.get('organization_id') as string,
                    facility_id: formData.get('facility_id') as string,
                    status: formData.get('status') as 'active' | 'inactive'
                  }
                  updateSatusehatMutation.mutate(data)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base URL
                  </label>
                  <input
                    type="url"
                    name="base_url"
                    defaultValue={configs.satusehat.config?.base_url}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://api-satusehat.kemkes.go.id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    name="client_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Masukkan Client ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="text"
                    name="client_secret"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Masukkan Client Secret"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization ID
                  </label>
                  <input
                    type="text"
                    name="organization_id"
                    defaultValue={configs.satusehat.config?.organization_id}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Organization ID (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facility ID
                  </label>
                  <input
                    type="text"
                    name="facility_id"
                    defaultValue={configs.satusehat.config?.facility_id}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Facility ID (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={configs.satusehat.config?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSatusehatModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updateSatusehatMutation.isPending}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium"
                  >
                    {updateSatusehatMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  </AdminOnly>
  )
}
