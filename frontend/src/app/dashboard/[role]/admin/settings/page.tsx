'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MdSettings,
  MdSave,
  MdInfo,
  MdWarning,
  MdCheckCircle,
  MdComputer,
  MdLocalHospital,
  MdSecurity,
  MdNotifications,
  MdBackup,
  MdCloudUpload,
  MdVisibility,
  MdSystemUpdate,
  MdEdit,
  MdHistory,
  MdUndo,
  MdFileDownload,
  MdFileUpload,
  MdSearch,
  MdRefresh
} from 'react-icons/md'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface Pengaturan {
  id: number
  kategori: string
  kunci: string
  nilai: string | number | boolean
  nilai_decrypted?: any
  nilai_cast?: any
  tipe_data: 'string' | 'integer' | 'boolean' | 'enum' | 'file' | 'json' | 'encrypted'
  deskripsi: string
  is_sensitif: boolean
  created_at: string
  updated_at: string
}

interface Kategori {
  key: string
  label: string
}

interface SystemInfo {
  php_version: string
  laravel_version: string
  server_software: string
  database_connection: string
  cache_driver: string
  session_driver: string
  queue_driver: string
  timezone: string
  locale: string
  debug_mode: boolean
  maintenance_mode: boolean
  last_reload: string | null
}

interface RiwayatPengaturan {
  id: number
  pengaturan_sistem_id: number
  nilai_lama: string | null
  nilai_baru: string | null
  diubah_oleh: number
  created_at: string
  pengaturanSistem: Pengaturan
  user: {
    id: number
    name: string
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('hospital')
  const [modifiedConfigs, setModifiedConfigs] = useState<Record<string, any>>({})
  const [showSystemInfo, setShowSystemInfo] = useState(false)
  const [showEnvValues, setShowEnvValues] = useState(false)

  const queryClient = useQueryClient()

  // Fetch configurations
  const { data: configurationsData, isLoading } = useQuery({
    queryKey: ['system-configurations'],
    queryFn: async () => {
      const response = await api.get('/api/system-configurations')
      return response.data.data
    },
  })

  // Fetch configuration groups
  const { data: groupsData } = useQuery({
    queryKey: ['config-groups'],
    queryFn: async () => {
      const response = await api.get('/api/system-configurations/groups')
      return response.data.data
    },
  })

  // Fetch system info
  const { data: systemInfo } = useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      const response = await api.get('/api/system-configurations/info')
      return response.data.data
    },
  })

  // Fetch env values
  const { data: envValues } = useQuery({
    queryKey: ['env-values'],
    queryFn: async () => {
      const response = await api.get('/api/system-configurations/env')
      return response.data.data
    },
  })

  // Update configurations mutation
  const updateConfigsMutation = useMutation({
    mutationFn: async (configs: Record<string, any>) => {
      const response = await api.put('/api/system-configurations', {
        pengaturan: Object.entries(configs).map(([kunci, nilai]) => ({
          kunci,
          nilai
        }))
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-configurations'] })
      setModifiedConfigs({})

      if (data.data?.restart_required) {
        toast.success(`Konfigurasi berhasil diperbarui. Sistem perlu di-restart untuk menerapkan perubahan. (Diperbarui ${data.data.count} pengaturan)`)
      } else {
        toast.success(`Konfigurasi berhasil diperbarui (Diperbarui ${data.data?.count || 0} pengaturan)`)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui konfigurasi')
    }
  })

  // Reload system mutation
  const reloadSystemMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/system-configurations/reload')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Sistem berhasil di-reload')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal reload sistem')
    }
  })

  const configurations = configurationsData || {}
  const groups = groupsData || {}
  const systemInfoData = systemInfo || {}
  const envData = envValues || {}

  const tabs = Object.entries(groups).map(([key, label]) => ({
    key,
    label: label as string,
    icon: getTabIcon(key)
  }))

  function getTabIcon(group: string) {
    switch (group) {
      case 'hospital': return MdLocalHospital
      case 'system': return MdComputer
      case 'security': return MdSecurity
      case 'notifications': return MdNotifications
      case 'backup': return MdBackup
      case 'integration': return MdCloudUpload
      default: return MdSettings
    }
  }

  const handleConfigChange = (key: string, value: any) => {
    setModifiedConfigs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveChanges = () => {
    if (Object.keys(modifiedConfigs).length === 0) {
      toast.error('Tidak ada perubahan untuk disimpan')
      return
    }

    updateConfigsMutation.mutate(modifiedConfigs)
  }

  const handleReloadSystem = () => {
    if (confirm('Apakah Anda yakin ingin me-reload sistem? Ini akan membersihkan cache dan konfigurasi.')) {
      reloadSystemMutation.mutate()
    }
  }

  const renderConfigInput = (config: Pengaturan) => {
    const currentValue = modifiedConfigs[config.kunci] ?? config.nilai_cast ?? config.nilai

    // Handle different input types based on tipe_data
    switch (config.tipe_data) {
      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(currentValue)}
              onChange={(e) => handleConfigChange(config.kunci, e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {currentValue ? 'Aktif' : 'Nonaktif'}
            </span>
          </label>
        )

      case 'integer':
        return (
          <input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleConfigChange(config.kunci, parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan angka"
          />
        )

      case 'encrypted':
        return (
          <input
            type="password"
            value={currentValue && config.is_sensitif ? '******' : currentValue || ''}
            onChange={(e) => handleConfigChange(config.kunci, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan nilai sensitif"
          />
        )

      default:
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleConfigChange(config.kunci, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan nilai"
          />
        )
    }
  }

  const getModifiedCount = () => Object.keys(modifiedConfigs).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Konfigurasi Sistem
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola pengaturan global RS dan environment aplikasi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSystemInfo(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MdInfo className="text-lg" />
            Info Sistem
          </button>
          <button
            onClick={() => setShowEnvValues(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MdVisibility className="text-lg" />
            Lihat .env
          </button>
          <button
            onClick={handleReloadSystem}
            disabled={reloadSystemMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdSystemUpdate className={`text-lg ${reloadSystemMutation.isPending ? 'animate-spin' : ''}`} />
            Reload Sistem
          </button>
          {getModifiedCount() > 0 && (
            <button
              onClick={handleSaveChanges}
              disabled={updateConfigsMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdSave className={`text-lg ${updateConfigsMutation.isPending ? 'animate-spin' : ''}`} />
              Simpan ({getModifiedCount()})
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {Icon && <Icon className="text-lg" />}
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Configuration Content */}
        <div className="p-6">
          {isLoading ? (
            <div key="loading-state" className="flex items-center justify-center py-12">
              <div key="spinner" className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span key="loading-text" className="ml-3 text-gray-600 dark:text-gray-400">Loading konfigurasi...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {configurations[activeTab]?.map((config: Pengaturan, index: number) => (
                <div key={`${config.id}-${config.kunci}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {config.kunci.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        {modifiedConfigs[config.kunci] !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <MdEdit className="text-lg" />
                            Modified
                          </span>
                        )}
                      </div>
                      {config.deskripsi && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {config.deskripsi}
                        </p>
                      )}
                      <div className="max-w-md">
                        {renderConfigInput(config)}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-12">
                  <MdSettings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Tidak ada konfigurasi
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Tidak ada pengaturan untuk kategori ini.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System Info Modal */}
      {showSystemInfo && systemInfoData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informasi Sistem
              </h3>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">PHP Version</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.php_version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Laravel Version</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.laravel_version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Server Software</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.server_software}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Database</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.database_connection}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cache Driver</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.cache_driver}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Driver</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.session_driver}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Queue Driver</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.queue_driver}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Timezone</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.timezone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Locale</label>
                    <p className="text-sm text-gray-900 dark:text-white">{systemInfoData.locale}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Debug Mode</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {systemInfoData.debug_mode ? 'Aktif' : 'Nonaktif'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance Mode</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {systemInfoData.maintenance_mode ? 'Aktif' : 'Nonaktif'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSystemInfo(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment Values Modal */}
      {showEnvValues && envData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nilai Environment (.env)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Konfigurasi environment yang sedang aktif
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {Object.entries(envData).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</span>
                    <span className="text-sm text-gray-900 dark:text-white font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowEnvValues(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
