'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface RegionData {
  id: string
  nama: string
}

interface AddressCascadingSelectProps {
  value: {
    provinsi?: string
    kota?: string
    kecamatan?: string
    kelurahan?: string
    rt?: string
    rw?: string
    kode_pos?: string
  }
  onChange: (address: {
    provinsi?: string
    kota?: string
    kecamatan?: string
    kelurahan?: string
    rt?: string
    rw?: string
    kode_pos?: string
  }) => void
  errors?: {
    provinsi?: string
    kota?: string
    kecamatan?: string
    kelurahan?: string
    rt?: string
    rw?: string
    kode_pos?: string
  }
}

export function AddressCascadingSelect({ value, onChange, errors }: AddressCascadingSelectProps) {
  const [provinces, setProvinces] = useState<RegionData[]>([])
  const [cities, setCities] = useState<RegionData[]>([])
  const [districts, setDistricts] = useState<RegionData[]>([])
  const [villages, setVillages] = useState<RegionData[]>([])
  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false
  })

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load cities when province changes
  useEffect(() => {
    if (value.provinsi) {
      loadCities(value.provinsi)
    } else {
      setCities([])
      setDistricts([])
      setVillages([])
    }
  }, [value.provinsi])

  // Load districts when city changes
  useEffect(() => {
    if (value.kota) {
      loadDistricts(value.kota)
    } else {
      setDistricts([])
      setVillages([])
    }
  }, [value.kota])

  // Load villages when district changes
  useEffect(() => {
    if (value.kecamatan) {
      loadVillages(value.kecamatan)
    } else {
      setVillages([])
    }
  }, [value.kecamatan])

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }))
    try {
      const response = await api.get('/api/regions/provinces')
      if (response.data.success) {
        setProvinces(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load provinces:', error)
      toast.error('Gagal memuat data provinsi')
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }))
    }
  }

  const loadCities = async (provinceId: string) => {
    setLoading(prev => ({ ...prev, cities: true }))
    try {
      const response = await api.get(`/api/regions/cities/${provinceId}`)
      if (response.data.success) {
        setCities(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
      toast.error('Gagal memuat data kota')
    } finally {
      setLoading(prev => ({ ...prev, cities: false }))
    }
  }

  const loadDistricts = async (cityId: string) => {
    setLoading(prev => ({ ...prev, districts: true }))
    try {
      const response = await api.get(`/api/regions/districts/${cityId}`)
      if (response.data.success) {
        setDistricts(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load districts:', error)
      toast.error('Gagal memuat data kecamatan')
    } finally {
      setLoading(prev => ({ ...prev, districts: false }))
    }
  }

  const loadVillages = async (districtId: string) => {
    setLoading(prev => ({ ...prev, villages: true }))
    try {
      const response = await api.get(`/api/regions/villages/${districtId}`)
      if (response.data.success) {
        setVillages(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load villages:', error)
      toast.error('Gagal memuat data kelurahan')
    } finally {
      setLoading(prev => ({ ...prev, villages: false }))
    }
  }

  const handleProvinceChange = (provinceId: string) => {
    onChange({
      ...value,
      provinsi: provinceId,
      kota: undefined,
      kecamatan: undefined,
      kelurahan: undefined
    })
  }

  const handleCityChange = (cityId: string) => {
    onChange({
      ...value,
      kota: cityId,
      kecamatan: undefined,
      kelurahan: undefined
    })
  }

  const handleDistrictChange = (districtId: string) => {
    onChange({
      ...value,
      kecamatan: districtId,
      kelurahan: undefined
    })
  }

  const handleVillageChange = (villageId: string) => {
    onChange({
      ...value,
      kelurahan: villageId
    })
  }

  const handleTextChange = (field: string, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue
    })
  }

  return (
    <div className="space-y-4">
      {/* Province */}
      <div>
        <Label htmlFor="provinsi">Provinsi *</Label>
        <select
          id="provinsi"
          value={value.provinsi || ''}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading.provinces}
        >
          <option value="">
            {loading.provinces ? 'Memuat...' : 'Pilih Provinsi'}
          </option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.nama}
            </option>
          ))}
        </select>
        {errors?.provinsi && (
          <p className="text-sm text-red-600 mt-1">{errors.provinsi}</p>
        )}
      </div>

      {/* City */}
      <div>
        <Label htmlFor="kota">Kota/Kabupaten *</Label>
        <select
          id="kota"
          value={value.kota || ''}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!value.provinsi || loading.cities}
        >
          <option value="">
            {!value.provinsi
              ? 'Pilih provinsi terlebih dahulu'
              : loading.cities
                ? 'Memuat...'
                : 'Pilih Kota/Kabupaten'
            }
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.nama}
            </option>
          ))}
        </select>
        {errors?.kota && (
          <p className="text-sm text-red-600 mt-1">{errors.kota}</p>
        )}
      </div>

      {/* District */}
      <div>
        <Label htmlFor="kecamatan">Kecamatan *</Label>
        <select
          id="kecamatan"
          value={value.kecamatan || ''}
          onChange={(e) => handleDistrictChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!value.kota || loading.districts}
        >
          <option value="">
            {!value.kota
              ? 'Pilih kota terlebih dahulu'
              : loading.districts
                ? 'Memuat...'
                : 'Pilih Kecamatan'
            }
          </option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.nama}
            </option>
          ))}
        </select>
        {errors?.kecamatan && (
          <p className="text-sm text-red-600 mt-1">{errors.kecamatan}</p>
        )}
      </div>

      {/* Village */}
      <div>
        <Label htmlFor="kelurahan">Kelurahan *</Label>
        <select
          id="kelurahan"
          value={value.kelurahan || ''}
          onChange={(e) => handleVillageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!value.kecamatan || loading.villages}
        >
          <option value="">
            {!value.kecamatan
              ? 'Pilih kecamatan terlebih dahulu'
              : loading.villages
                ? 'Memuat...'
                : 'Pilih Kelurahan'
            }
          </option>
          {villages.map((village) => (
            <option key={village.id} value={village.id}>
              {village.nama}
            </option>
          ))}
        </select>
        {errors?.kelurahan && (
          <p className="text-sm text-red-600 mt-1">{errors.kelurahan}</p>
        )}
      </div>

      {/* RT/RW and Postal Code */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rt">RT</Label>
          <input
            id="rt"
            type="text"
            value={value.rt || ''}
            onChange={(e) => handleTextChange('rt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="001"
            maxLength={3}
          />
          {errors?.rt && (
            <p className="text-sm text-red-600 mt-1">{errors.rt}</p>
          )}
        </div>
        <div>
          <Label htmlFor="rw">RW</Label>
          <input
            id="rw"
            type="text"
            value={value.rw || ''}
            onChange={(e) => handleTextChange('rw', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="001"
            maxLength={3}
          />
          {errors?.rw && (
            <p className="text-sm text-red-600 mt-1">{errors.rw}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="kode_pos">Kode Pos</Label>
        <input
          id="kode_pos"
          type="text"
          value={value.kode_pos || ''}
          onChange={(e) => handleTextChange('kode_pos', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="12345"
          maxLength={5}
        />
        {errors?.kode_pos && (
          <p className="text-sm text-red-600 mt-1">{errors.kode_pos}</p>
        )}
      </div>
    </div>
  )
}