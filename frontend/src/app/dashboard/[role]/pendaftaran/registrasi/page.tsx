'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaUserPlus, FaSearch, FaUserCheck, FaArrowLeft, FaIdCard, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaHeartbeat, FaCamera, FaStethoscope, FaCalendarCheck, FaPrint } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pasienBaruSchema, type PasienBaruFormData } from '@/schemas/patientSchemas'
import api from '@/lib/api'
import toast from '@/lib/toast'
import { useRegistrationStore } from '@/store/registrationStore'
import { generatePatientCard, generateQueueNumber, downloadPDF, printPDF } from '@/lib/pdfGenerator'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Webcam component
import { WebcamCapture } from '@/components/ui/WebcamCapture'

// Address cascading component
import { AddressCascadingSelect } from '@/components/ui/AddressCascadingSelect'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function RegistrasiTerpaduPage() {
  const store = useRegistrationStore()
  const {
    currentPhase,
    searchQuery,
    searchResults,
    isSearching,
    selectedPatient,
    formData,
    poliOptions,
    doctorOptions,
    currentStep,
    isSubmitting,
    successModal
  } = store

  // State for patient photo
  const [patientPhoto, setPatientPhoto] = useState<string | null>(null)

  // State for patient visit history
  const [patientVisitHistory, setPatientVisitHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Form for new patient registration
  const form = useForm<PasienBaruFormData>({
    resolver: zodResolver(pasienBaruSchema),
    defaultValues: {
      alergi: [],
      penyakit_kronis: []
    }
  })

  // Load initial data
  useEffect(() => {
    loadPoliOptions()
  }, [])

  // Search patients when query changes
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      searchPatients(debouncedSearchQuery)
    } else {
      store.setSearchResults([])
    }
  }, [debouncedSearchQuery])

  const loadPoliOptions = async () => {
    try {
      const response = await api.get('/api/polis/active')
      if (response.data.success) {
        store.setPoliOptions(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load poli options:', error)
    }
  }

  const searchPatients = async (query: string) => {
    store.setIsSearching(true)
    try {
      const response = await api.get('/api/pendaftaran/pasien/search', {
        params: { q: query }
      })
      if (response.data.success) {
        store.setSearchResults(response.data.data || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
      store.setSearchResults([])
    } finally {
      store.setIsSearching(false)
    }
  }

  const loadDoctorsForPoli = async (poliId: number) => {
    try {
      const response = await api.get('/api/doctors/by-poli', {
        params: { poli_id: poliId }
      })
      if (response.data.success) {
        store.setDoctorOptions(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to load doctors:', error)
      store.setDoctorOptions([])
    }
  }

  const handlePatientSelect = (patient: any) => {
    store.setSelectedPatient(patient)
    loadPatientVisitHistory(patient.id)
    store.setCurrentPhase('visit_registration')
  }

  const loadPatientVisitHistory = async (patientId: number) => {
    setIsLoadingHistory(true)
    try {
      const response = await api.get(`/api/pendaftaran/pasien/${patientId}/riwayat-kunjungan`)
      if (response.data.success) {
        setPatientVisitHistory(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to load patient visit history:', error)
      setPatientVisitHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleNewPatientRegistration = () => {
    store.setCurrentPhase('new_patient')
  }

  const handlePatientFormSubmit = async (data: PasienBaruFormData) => {
    try {
      store.setIsSubmitting(true)

      // Generate MR number first
      const mrResponse = await api.get('/api/pendaftaran/generate-mr-number')
      const mrNumber = mrResponse.data.data.mr_number

      const submitData = {
        ...data,
        tanggal_lahir: data.tanggal_lahir.toISOString().split('T')[0],
        no_rm: mrNumber
      }

      const response = await api.post('/api/pendaftaran/pasien-baru', submitData)

      if (response.data.success) {
        const { pasien } = response.data.data
        store.setSelectedPatient({
          id: pasien.id,
          no_rm: pasien.no_rm,
          nama_lengkap: pasien.nama_lengkap,
          nik: pasien.nik,
          tanggal_lahir: pasien.tanggal_lahir,
          jenis_kelamin: pasien.jenis_kelamin,
          telepon: pasien.telepon
        })
        store.setCurrentPhase('visit_registration')
        toast.success('Pasien berhasil didaftarkan!')
        form.reset()
      }
    } catch (error: any) {
      console.error('Patient registration failed:', error)
      const message = error.response?.data?.message || 'Gagal mendaftarkan pasien'
      toast.error(message)
    } finally {
      store.setIsSubmitting(false)
    }
  }

  const handleVisitRegistration = async () => {
    if (!selectedPatient) return

    try {
      store.setIsSubmitting(true)

      const visitData = {
        patient_id: selectedPatient.id,
        jenis_kunjungan: formData.jenis_kunjungan || 'Rawat Jalan',
        poli_id: formData.poli_id,
        dokter_id: formData.dokter_id,
        keluhan_utama: formData.keluhan_utama,
        jenis_bayar: formData.jenis_bayar || 'Umum'
      }

      const response = await api.post('/api/registrations/unified', visitData)

      if (response.data.success) {
        const { registration, queue_number } = response.data.data
        store.setSuccessModal({
          registration,
          queue_number,
          patient: selectedPatient
        })
        toast.success('Registrasi kunjungan berhasil!')
      }
    } catch (error: any) {
      console.error('Visit registration failed:', error)
      const message = error.response?.data?.message || 'Gagal mendaftarkan kunjungan'
      toast.error(message)
    } finally {
      store.setIsSubmitting(false)
    }
  }

  const resetToSearch = () => {
    store.reset()
  }

  // Render functions
  const renderSearchPhase = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FaSearch className="text-blue-600" />
            Pencarian Pasien
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">Cari Pasien</Label>
            <Input
              id="search"
              placeholder="Ketik nama, nomor RM, NIK, atau nomor BPJS..."
              value={searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              className="mt-1"
            />
            {isSearching && (
              <p className="text-sm text-gray-500 mt-2">Mencari...</p>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Hasil Pencarian:</h3>
              {searchResults.slice(0, 10).map((patient) => (
                <Card key={patient.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handlePatientSelect(patient)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{patient.nama_lengkap}</h4>
                        <p className="text-sm text-gray-600">RM: {patient.no_rm} | NIK: {patient.nik}</p>
                        {patient.no_bpjs && (
                          <p className="text-sm text-gray-600">BPJS: {patient.no_bpjs}</p>
                        )}
                      </div>
                      <Button size="sm" onClick={(e) => {
                        e.stopPropagation()
                        handlePatientSelect(patient)
                      }}>
                        <FaUserCheck className="mr-2" />
                        Pilih
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <FaUserPlus className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pasien Tidak Ditemukan</h3>
              <p className="text-gray-600 mb-4">Pasien dengan kriteria tersebut belum terdaftar.</p>
              <Button onClick={handleNewPatientRegistration}>
                <FaUserPlus className="mr-2" />
                Daftarkan Pasien Baru
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderNewPatientPhase = () => {
    const steps = [
      { id: 1, title: 'Data Pribadi', icon: FaIdCard },
      { id: 2, title: 'Alamat', icon: FaMapMarkerAlt },
      { id: 3, title: 'Kontak & Asuransi', icon: FaPhone },
      { id: 4, title: 'Riwayat Kesehatan', icon: FaHeartbeat }
    ]

    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="w-full" />
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nik">NIK *</Label>
                    <Input
                      id="nik"
                      {...form.register('nik')}
                      placeholder="16 digit NIK"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
                    <Input
                      id="nama_lengkap"
                      {...form.register('nama_lengkap')}
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir *</Label>
                    <Input
                      id="tanggal_lahir"
                      type="date"
                      {...form.register('tanggal_lahir', { valueAsDate: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jenis_kelamin">Jenis Kelamin *</Label>
                    <select
                      {...form.register('jenis_kelamin')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Jenis Kelamin"
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alamat Lengkap</h3>
                <AddressCascadingSelect
                  value={{
                    provinsi: form.watch('provinsi') || '',
                    kota: form.watch('kota') || '',
                    kecamatan: form.watch('kecamatan') || '',
                    kelurahan: form.watch('kelurahan') || '',
                    rt: form.watch('rt') || '',
                    rw: form.watch('rw') || '',
                    kode_pos: form.watch('kode_pos') || ''
                  }}
                  onChange={(address) => {
                    form.setValue('provinsi', address.provinsi || '')
                    form.setValue('kota', address.kota || '')
                    form.setValue('kecamatan', address.kecamatan || '')
                    form.setValue('kelurahan', address.kelurahan || '')
                    form.setValue('rt', address.rt || '')
                    form.setValue('rw', address.rw || '')
                    form.setValue('kode_pos', address.kode_pos || '')
                  }}
                  errors={{
                    provinsi: form.formState.errors.provinsi?.message,
                    kota: form.formState.errors.kota?.message,
                    kecamatan: form.formState.errors.kecamatan?.message,
                    kelurahan: form.formState.errors.kelurahan?.message,
                    rt: form.formState.errors.rt?.message,
                    rw: form.formState.errors.rw?.message,
                    kode_pos: form.formState.errors.kode_pos?.message
                  }}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Kontak & Asuransi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telepon">Nomor Telepon *</Label>
                    <Input
                      id="telepon"
                      {...form.register('telepon')}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telepon_alternatif">Telepon Alternatif</Label>
                    <Input
                      id="telepon_alternatif"
                      {...form.register('telepon_alternatif')}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jenis_asuransi">Jenis Asuransi *</Label>
                    <select
                      {...form.register('jenis_asuransi')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Jenis Asuransi"
                    >
                      <option value="">Pilih jenis asuransi</option>
                      <option value="BPJS">BPJS</option>
                      <option value="Asuransi Swasta">Asuransi Swasta</option>
                      <option value="Perusahaan">Perusahaan</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                  {form.watch('jenis_asuransi') === 'BPJS' && (
                    <>
                      <div>
                        <Label htmlFor="no_bpjs">Nomor BPJS</Label>
                        <div className="flex gap-2">
                          <Input
                            id="no_bpjs"
                            {...form.register('no_bpjs')}
                            placeholder="13 digit"
                            maxLength={13}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const bpjsNumber = form.getValues('no_bpjs');
                              if (!bpjsNumber || bpjsNumber.length !== 13) {
                                toast.error('Nomor BPJS harus 13 digit');
                                return;
                              }

                              try {
                                const response = await api.post('/api/pendaftaran/validasi-bpjs', {
                                  no_bpjs: bpjsNumber
                                });

                                if (response.data.success) {
                                  toast.success('BPJS valid! Data pasien terverifikasi.');
                                  // Optionally populate patient data from BPJS response
                                } else {
                                  toast.error('BPJS tidak valid atau tidak aktif');
                                }
                              } catch (error: any) {
                                console.error('BPJS validation failed:', error);
                                toast.error('Gagal memverifikasi BPJS');
                              }
                            }}
                          >
                            Verifikasi
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="kelas_bpjs">Kelas BPJS</Label>
                        <select
                          {...form.register('kelas_bpjs')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          aria-label="Kelas BPJS"
                        >
                          <option value="">Pilih kelas</option>
                          <option value="1">Kelas 1</option>
                          <option value="2">Kelas 2</option>
                          <option value="3">Kelas 3</option>
                        </select>
                      </div>
                    </>
                  )}
                  {(form.watch('jenis_asuransi') === 'Asuransi Swasta' || form.watch('jenis_asuransi') === 'Perusahaan') && (
                    <>
                      <div>
                        <Label htmlFor="provider_asuransi">Provider Asuransi</Label>
                        <Input
                          id="provider_asuransi"
                          {...form.register('provider_asuransi')}
                          placeholder="Nama perusahaan asuransi"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nomor_asuransi">Nomor Polis</Label>
                        <Input
                          id="nomor_asuransi"
                          {...form.register('nomor_asuransi')}
                          placeholder="Nomor polis asuransi"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Kontak Darurat */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-medium mb-4">Kontak Darurat</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nama_penanggung_jawab">Nama Kontak Darurat *</Label>
                      <Input
                        id="nama_penanggung_jawab"
                        {...form.register('nama_penanggung_jawab')}
                        placeholder="Nama lengkap kontak darurat"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hubungan_penanggung_jawab">Hubungan</Label>
                      <select
                        {...form.register('hubungan_penanggung_jawab')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Hubungan"
                      >
                        <option value="">Pilih hubungan</option>
                        <option value="Suami">Suami</option>
                        <option value="Istri">Istri</option>
                        <option value="Anak">Anak</option>
                        <option value="Orang Tua">Orang Tua</option>
                        <option value="Saudara">Saudara</option>
                        <option value="Kerabat">Kerabat</option>
                        <option value="Teman">Teman</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="telepon_penanggung_jawab">Nomor Telepon Darurat *</Label>
                      <Input
                        id="telepon_penanggung_jawab"
                        {...form.register('telepon_penanggung_jawab')}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kontak_darurat">Kontak Darurat Tambahan</Label>
                      <Input
                        id="kontak_darurat"
                        {...form.register('kontak_darurat')}
                        placeholder="Kontak darurat lainnya"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Riwayat Kesehatan & Foto</h3>
                <div>
                  <Label>Riwayat Penyakit Kronis</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {['Diabetes', 'Hipertensi', 'Penyakit Jantung', 'Penyakit Ginjal', 'Asma', 'Riwayat Stroke', 'Riwayat Kanker', 'Hepatitis'].map((disease) => (
                      <label key={disease} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={disease}
                          {...form.register('penyakit_kronis')}
                          className="form-checkbox"
                        />
                        <span className="text-sm">{disease}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Webcam untuk foto pasien */}
                <div className="mt-6">
                  <Label>Foto Pasien (Opsional)</Label>
                  <div className="mt-2">
                    <WebcamCapture
                      onCapture={(imageSrc) => {
                        // Convert base64 to File object
                        fetch(imageSrc)
                          .then(res => res.blob())
                          .then(blob => {
                            const file = new File([blob], 'patient-photo.jpg', { type: 'image/jpeg' });
                            store.updateFormData({ foto_pasien: file });
                          });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => store.setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Sebelumnya
          </Button>

          {currentStep < 4 ? (
            <Button onClick={() => store.setCurrentStep(currentStep + 1)}>
              Selanjutnya
            </Button>
          ) : (
            <Button onClick={form.handleSubmit(handlePatientFormSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Pasien'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderVisitRegistrationPhase = () => (
    <div className="space-y-6">
      {/* Patient Info */}
      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FaUserCheck className="text-green-600" />
              Data Pasien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nama Lengkap</Label>
                <p className="font-medium">{selectedPatient.nama_lengkap}</p>
              </div>
              <div>
                <Label>Nomor RM</Label>
                <p className="font-medium">{selectedPatient.no_rm}</p>
              </div>
              <div>
                <Label>NIK</Label>
                <p className="font-medium">{selectedPatient.nik}</p>
              </div>
              <div>
                <Label>Jenis Kelamin</Label>
                <p className="font-medium">{selectedPatient.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</p>
              </div>
            </div>

            {/* Riwayat Kunjungan */}
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700">Riwayat Kunjungan</Label>
              {isLoadingHistory ? (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Memuat riwayat kunjungan...</p>
                </div>
              ) : patientVisitHistory.length > 0 ? (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {patientVisitHistory.slice(0, 5).map((visit: any, index: number) => (
                    <div key={visit.id || index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <p><strong>Tanggal:</strong> {visit.tanggal}</p>
                        <p><strong>Poli:</strong> {visit.poli}</p>
                        <p><strong>Dokter:</strong> {visit.dokter}</p>
                        <p><strong>Status:</strong> {visit.status}</p>
                      </div>
                    </div>
                  ))}
                  {patientVisitHistory.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      Dan {patientVisitHistory.length - 5} kunjungan lainnya...
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Belum ada riwayat kunjungan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FaStethoscope className="text-blue-600" />
            Registrasi Kunjungan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jenis_kunjungan">Jenis Kunjungan *</Label>
              <select
                id="jenis_kunjungan"
                value={formData.jenis_kunjungan || ''}
                onChange={(e) => store.updateFormData({ jenis_kunjungan: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Jenis Kunjungan"
              >
                <option value="">Pilih jenis kunjungan</option>
                <option value="Rawat Jalan">Rawat Jalan</option>
                <option value="IGD">IGD</option>
                <option value="Rujukan">Rujukan</option>
              </select>
            </div>

            <div>
              <Label htmlFor="poli">Poli Tujuan *</Label>
              <select
                id="poli"
                value={formData.poli_id || ''}
                onChange={(e) => {
                  const poliId = parseInt(e.target.value)
                  store.updateFormData({ poli_id: poliId })
                  loadDoctorsForPoli(poliId)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Poli Tujuan"
              >
                <option value="">Pilih poli</option>
                {poliOptions.map((poli) => (
                  <option key={poli.id} value={poli.id}>
                    {poli.nama_poli}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dokter">Dokter *</Label>
              <select
                id="dokter"
                value={formData.dokter_id || ''}
                onChange={(e) => store.updateFormData({ dokter_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={!formData.poli_id}
                aria-label="Dokter"
              >
                <option value="">Pilih dokter</option>
                {doctorOptions.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                    {doctor.quota_remaining !== undefined && doctor.quota_total !== undefined && (
                      ` (Quota: ${doctor.quota_remaining}/${doctor.quota_total})`
                    )}
                  </option>
                ))}
              </select>
              {doctorOptions.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {doctorOptions.map((doctor) => (
                    <div key={doctor.id} className="flex justify-between items-center">
                      <span>{doctor.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        (doctor.quota_remaining || 0) > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Quota: {doctor.quota_remaining || 0}/{doctor.quota_total || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="jenis_bayar">Jenis Pembayaran *</Label>
              <select
                id="jenis_bayar"
                value={formData.jenis_bayar || ''}
                onChange={(e) => store.updateFormData({ jenis_bayar: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Jenis Pembayaran"
              >
                <option value="">Pilih jenis pembayaran</option>
                <option value="BPJS">BPJS</option>
                <option value="Umum">Umum</option>
                <option value="Swasta">Asuransi Swasta</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="keluhan">Keluhan Utama *</Label>
            <Textarea
              id="keluhan"
              value={formData.keluhan_utama || ''}
              onChange={(e) => store.updateFormData({ keluhan_utama: e.target.value })}
              placeholder="Jelaskan keluhan utama pasien"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={resetToSearch}>
          <FaArrowLeft className="mr-2" />
          Kembali ke Pencarian
        </Button>
        <Button onClick={handleVisitRegistration} disabled={isSubmitting}>
          {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Kunjungan'}
        </Button>
      </div>
    </div>
  )

  const renderSuccessModal = () => {
    if (!successModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarCheck className="text-green-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Registrasi Berhasil!
            </h3>
            <p className="text-gray-600 mb-4">
              Pasien berhasil didaftarkan dengan nomor antrian: <strong>{successModal.queue_number}</strong>
            </p>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => store.setSuccessModal(null)}>
                Tutup
              </Button>
              <Button
                onClick={() => {
                  // Generate patient card PDF
                  const patientCardData = {
                    no_rm: successModal.patient.no_rm,
                    nama_lengkap: successModal.patient.nama_lengkap,
                    nik: successModal.patient.nik,
                    tanggal_lahir: successModal.patient.tanggal_lahir,
                    jenis_kelamin: successModal.patient.jenis_kelamin,
                    alamat: 'Alamat belum lengkap', // This would come from patient data
                    telepon: successModal.patient.telepon,
                    jenis_asuransi: 'Umum', // This would come from patient data
                    no_bpjs: undefined
                  };

                  const doc = generatePatientCard(patientCardData);
                  downloadPDF(doc, `kartu-berobat-${successModal.patient.no_rm}.pdf`);
                }}
                variant="outline"
              >
                <FaIdCard className="mr-2" />
                Cetak Kartu Berobat
              </Button>
              <Button
                onClick={() => {
                  // Generate queue number PDF
                  const queueData = {
                    queue_number: successModal.queue_number,
                    patient_name: successModal.patient.nama_lengkap,
                    poli_name: 'Poli Umum', // This would come from registration data
                    doctor_name: 'dr. Ahmad Santoso', // This would come from registration data
                    registration_date: new Date().toLocaleDateString('id-ID')
                  };

                  const doc = generateQueueNumber(queueData);
                  downloadPDF(doc, `nomor-antrian-${successModal.queue_number}.pdf`);
                }}
                variant="outline"
              >
                <FaPrint className="mr-2" />
                Cetak Nomor Antrian
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaUserPlus className="text-blue-600" />
              Registrasi Terpadu
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Pencarian pasien dan registrasi kunjungan dalam satu alur
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <FaArrowLeft className="mr-2" />
            Kembali
          </Button>
        </div>

        {/* Phase Content */}
        {currentPhase === 'search' && renderSearchPhase()}
        {currentPhase === 'new_patient' && renderNewPatientPhase()}
        {currentPhase === 'visit_registration' && renderVisitRegistrationPhase()}

        {/* Success Modal */}
        {renderSuccessModal()}

      </div>
    </div>
  )
}
