'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface Setting {
  id: number
  kategori: string
  kunci: string
  nilai: string | number | boolean
  tipe_data: string
  deskripsi: string
  is_sensitif: boolean
}

interface Group {
  key: string
  label: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('hospital')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Fetch configuration groups (filtered to exclude integration)
  const { data: groupsData, isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ['system-configurations', 'groups'],
    queryFn: async () => {
      const response = await api.get('/api/system-configurations/groups')
      // Filter out integration category to avoid duplication with separate integration menu
      const filteredGroups = response.data.data.filter(
        (group: Group) => group.key !== 'integration'
      )
      return filteredGroups
    },
  })

  // Fetch configurations by category
  const { data: settingsData, isLoading: settingsLoading } = useQuery<Setting[]>({
    queryKey: ['system-configurations', activeTab],
    queryFn: async () => {
      const response = await api.get(`/api/system-configurations?kategori=${activeTab}`)
      return response.data.data
    },
  })

  // Set active tab to first available group if current active tab is integration
  useEffect(() => {
    if (groupsData && groupsData.length > 0 && !groupsData.some(g => g.key === activeTab)) {
      setActiveTab(groupsData[0].key)
    }
  }, [groupsData, activeTab])

  // Initialize form data when settings change
  useEffect(() => {
    if (settingsData) {
      const initialFormData: Record<string, any> = {}
      settingsData.forEach(setting => {
        initialFormData[setting.kunci] = setting.tipe_data === 'boolean' 
          ? Boolean(setting.nilai) 
          : setting.nilai
      })
      setFormData(initialFormData)
    }
  }, [settingsData])

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG atau PNG.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    // Preview logo
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload logo
    uploadLogo(file)
  }

  const uploadLogo = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      await api.post('/api/settings/logo-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Logo berhasil diunggah')
    } catch (error) {
      toast.error('Gagal mengunggah logo')
      console.error(error)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const pengaturan = Object.entries(formData).map(([kunci, nilai]) => ({
        kunci,
        nilai: typeof nilai === 'boolean' ? (nilai ? '1' : '0') : String(nilai)
      }))

      await api.put('/api/system-configurations', { pengaturan })

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['system-configurations'] })
      
      toast.success('Pengaturan berhasil disimpan')
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-3 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    )
  }

  const groups = groupsData || []
  const settings = settingsData || []

  // Convert groups to object for easier access
  const groupsObj: Record<string, string> = {}
  groups.forEach(group => {
    groupsObj[group.key] = group.label
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Konfigurasi Sistem SIRAMA
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola pengaturan hospital information system
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {groups.map((group) => (
              <button
                key={group.key}
                onClick={() => setActiveTab(group.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === group.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {group.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading settings...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {settings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No settings found in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTab === 'hospital' && (
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Logo Rumah Sakit
                        </h3>
                        <div className="flex items-center space-x-4">
                          {logoPreview ? (
                            <img 
                              src={logoPreview} 
                              alt="Preview" 
                              className="h-16 w-16 object-contain rounded"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          )}
                          <div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/jpeg,image/png"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={triggerFileInput}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Unggah Logo
                            </button>
                            <p className="text-sm text-gray-500 mt-1">
                              Format JPG/PNG, maks 2MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {settings.map((setting: Setting) => (
                      <div 
                        key={setting.id} 
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {setting.kunci
                                .replace(/^.*?\./, '') // Remove prefix (e.g., hospital.)
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            {setting.deskripsi && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {setting.deskripsi}
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4 w-1/3">
                            {setting.tipe_data === 'boolean' ? (
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(formData[setting.kunci])}
                                  onChange={(e) => handleInputChange(setting.kunci, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                  {Boolean(formData[setting.kunci]) ? 'Aktif' : 'Nonaktif'}
                                </span>
                              </label>
                            ) : setting.tipe_data === 'enum' ? (
                              <select
                                value={String(formData[setting.kunci] || '')}
                                onChange={(e) => handleInputChange(setting.kunci, e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              >
                                {setting.kunci.includes('timezone') && (
                                  <>
                                    <option value="Asia/Jakarta">Asia/Jakarta</option>
                                    <option value="Asia/Makassar">Asia/Makassar</option>
                                    <option value="Asia/Jayapura">Asia/Jayapura</option>
                                  </>
                                )}
                                {setting.kunci.includes('language') && (
                                  <>
                                    <option value="ID">Bahasa Indonesia</option>
                                    <option value="EN">English</option>
                                  </>
                                )}
                                {setting.kunci.includes('date_format') && (
                                  <>
                                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                  </>
                                )}
                                {setting.kunci.includes('currency') && (
                                  <>
                                    <option value="Rp.">Rupiah (Rp.)</option>
                                    <option value="USD">US Dollar ($)</option>
                                  </>
                                )}
                                {setting.kunci.includes('type') && (
                                  <>
                                    <option value="A">Tipe A</option>
                                    <option value="B">Tipe B</option>
                                    <option value="C">Tipe C</option>
                                    <option value="D">Tipe D</option>
                                  </>
                                )}
                              </select>
                            ) : (
                              <input
                                type={setting.tipe_data === 'integer' ? 'number' : 'text'}
                                value={String(formData[setting.kunci] || '')}
                                onChange={(e) => handleInputChange(setting.kunci, e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {settings.length > 0 && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">System Configuration Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Categories:</span> {groups.length}
          </div>
          <div>
            <span className="font-medium">Active Category:</span> {groupsObj[activeTab] || activeTab}
          </div>
        </div>
      </div>
    </div>
  )
}