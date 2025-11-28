'use client'

import { useState, useEffect } from 'react'
import { MdAssignment, MdCheckCircle, MdWarning, MdHistory, MdRefresh, MdSearch, MdMedication, MdPerson, MdSchedule, MdError } from 'react-icons/md'

interface PrescriptionItem {
  id: string
  prescription_id: string
  medicine_id: string
  resep: {
    id: string
    no_resep: string
    tanggal_resep: string
    status: string
  }
  patient: {
    id: string
    nama: string
    no_rm: string
    usia: number
    jenis_kelamin: string
  }
  dokter: {
    id: string
    name: string
  }
  obat: {
    id: string
    nama_obat: string
    nama_generik: string
    satuan: string
  }
  jumlah: number
  hari: number
  total_quantity: number
  aturan_pakai: string
  instruksi: string
  harga_satuan: number
  subtotal: number
  distributed_quantity: number
  remaining_quantity: number
  is_ready: boolean
}

interface MedicineDistribution {
  id: string
  prescription_item_id: string
  given_at: string
  quantity_given: number
  notes: string
  resep: {
    id: string
    no_resep: string
    tanggal_resep: string
  }
  patient: {
    id: string
    nama: string
    no_rm: string
  }
  obat: {
    id: string
    nama_obat: string
    nama_generik: string
    satuan?: string
  }
  aturan_pakai: string
  user: {
    id: string
    name: string
  }
  created_at: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export default function DistribusiObatPage() {
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([])
  const [distributions, setDistributions] = useState<MedicineDistribution[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PrescriptionItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [distributing, setDistributing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Form state for 5 benar validation
  const [formData, setFormData] = useState({
    registration_id: '',
    medicine_id: '',
    dosage: '',
    time: '',
    route: '',
    quantity_given: 1,
    notes: ''
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch pending prescriptions
      const prescriptionsResponse = await fetch('/api/prescriptions/pending')
      if (prescriptionsResponse.ok) {
        const prescriptionsData: ApiResponse<PrescriptionItem[]> = await prescriptionsResponse.json()
        if (prescriptionsData.success) {
          setPrescriptionItems(prescriptionsData.data)
        }
      }

      // Fetch recent distributions
      const distributionsResponse = await fetch('/api/t-obat-keluar?per_page=20')
      if (distributionsResponse.ok) {
        const distributionsData: ApiResponse<{ data: MedicineDistribution[] }> = await distributionsResponse.json()
        if (distributionsData.success) {
          setDistributions(distributionsData.data.data || [])
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrescriptionItems = prescriptionItems.filter(item =>
    item.patient.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patient.no_rm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.obat.nama_obat.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDistributeMedicine = async (prescriptionItem: PrescriptionItem) => {
    setSelectedPatient(prescriptionItem)
    setFormData({
      registration_id: prescriptionItem.patient.id, // Assuming patient.id is registration_id
      medicine_id: prescriptionItem.obat.id,
      dosage: prescriptionItem.aturan_pakai,
      time: '',
      route: '',
      quantity_given: Math.min(prescriptionItem.remaining_quantity, 1),
      notes: ''
    })
    setValidationErrors([])
    setShowForm(true)
  }

  const validateFiveRights = (): boolean => {
    const errors: string[] = []

    // 1. Right Patient
    if (formData.registration_id !== selectedPatient?.patient.id) {
      errors.push('Registrasi tidak sesuai dengan resep')
    }

    // 2. Right Medicine
    if (formData.medicine_id !== selectedPatient?.obat.id) {
      errors.push('Obat tidak sesuai dengan resep')
    }

    // 3. Right Dose
    if (formData.dosage !== selectedPatient?.aturan_pakai) {
      errors.push('Dosis tidak sesuai dengan resep')
    }

    // 4. Right Time (simplified validation)
    if (!formData.time.trim()) {
      errors.push('Waktu pemberian harus diisi')
    }

    // 5. Right Route (simplified validation)
    if (!formData.route.trim()) {
      errors.push('Rute pemberian harus diisi')
    }

    // Check quantity
    if (formData.quantity_given > (selectedPatient?.remaining_quantity || 0)) {
      errors.push('Jumlah yang diberikan melebihi sisa resep')
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const submitDistribution = async () => {
    if (!validateFiveRights() || !selectedPatient) return

    try {
      setDistributing(true)

      const response = await fetch('/api/t-obat-keluar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prescription_item_id: selectedPatient.id,
          quantity_given: formData.quantity_given,
          notes: formData.notes,
          registration_id: formData.registration_id,
          medicine_id: formData.medicine_id,
          dosage: formData.dosage,
          time: formData.time,
          route: formData.route,
        }),
      })

      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        alert('Distribusi obat berhasil dicatat!')
        setShowForm(false)
        setSelectedPatient(null)
        fetchData() // Refresh data
      } else {
        alert('Gagal mencatat distribusi: ' + result.message)
      }

    } catch (error) {
      console.error('Error submitting distribution:', error)
      alert('Terjadi kesalahan saat mencatat distribusi')
    } finally {
      setDistributing(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          💊 Distribusi Obat
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Catat pemberian obat ke pasien dengan validasi 5 benar - RS Sirama
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdAssignment className="text-2xl text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resep Pending</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{prescriptionItems.length}</p>
              <p className="text-xs text-blue-600">Menunggu distribusi</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdCheckCircle className="text-2xl text-green-600 dark:text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Distribusi Hari Ini</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {distributions.filter(d => d.given_at.startsWith(new Date().toISOString().split('T')[0])).length}
              </p>
              <p className="text-xs text-green-600">Sudah didistribusikan</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdWarning className="text-2xl text-orange-600 dark:text-orange-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {prescriptionItems.filter(item => {
                  const prescriptionDate = new Date(item.resep.tanggal_resep)
                  const daysDiff = (new Date().getTime() - prescriptionDate.getTime()) / (1000 * 3600 * 24)
                  return daysDiff > 1 && item.remaining_quantity > 0
                }).length}
              </p>
              <p className="text-xs text-orange-600">Lebih dari 1 hari</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MdHistory className="text-2xl text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Distribusi</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{distributions.length}</p>
              <p className="text-xs text-purple-600">Riwayat lengkap</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Prescriptions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  📋 Resep Pending Distribusi ({filteredPrescriptionItems.length})
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      placeholder="Cari pasien atau obat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                  >
                    <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <MdRefresh className="animate-spin text-2xl text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Memuat data resep...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPrescriptionItems.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Patient Info */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <MdPerson className="text-blue-600 dark:text-blue-400 text-lg" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {item.patient.nama}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                MRN: {item.patient.no_rm} • {item.patient.usia} tahun • {item.patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                              </p>
                            </div>
                          </div>

                          {/* Medicine Info */}
                          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <MdMedication className="text-blue-600 dark:text-blue-400 text-lg" />
                              <span className="font-medium text-blue-800 dark:text-blue-400">
                                {item.obat.nama_obat}
                              </span>
                              {item.obat.nama_generik && (
                                <span className="text-sm text-blue-600 dark:text-blue-500">
                                  ({item.obat.nama_generik})
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Dosis: </span>
                                <span className="text-gray-900 dark:text-white">{item.aturan_pakai}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Jumlah: </span>
                                <span className="text-gray-900 dark:text-white">
                                  {item.distributed_quantity}/{item.total_quantity} {item.obat.satuan}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Sisa: </span>
                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                  {item.remaining_quantity} {item.obat.satuan}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Dokter: </span>
                                <span className="text-gray-900 dark:text-white">{item.dokter?.name || '-'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Prescription Info */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>📋 {item.resep.no_resep}</span>
                            <span>📅 {new Date(item.resep.tanggal_resep).toLocaleDateString('id-ID')}</span>
                            {item.instruksi && <span>📝 {item.instruksi}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-4 flex flex-col gap-2">
                          {item.remaining_quantity > 0 ? (
                            <button
                              onClick={() => handleDistributeMedicine(item)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              <MdAssignment className="text-lg" />
                              Berikan Obat
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-sm font-medium">
                              <MdCheckCircle className="text-lg" />
                              Selesai
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredPrescriptionItems.length === 0 && !loading && (
                    <div className="p-8 text-center">
                      <MdAssignment className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'Tidak ada resep yang sesuai dengan pencarian' : 'Tidak ada resep pending saat ini'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Distributions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                📊 Distribusi Terbaru
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {distributions.length === 0 ? (
                <div className="p-6 text-center">
                  <MdHistory className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Belum ada distribusi</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {distributions.slice(0, 10).map((dist) => (
                    <div key={dist.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                          <MdCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {dist.patient.nama}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {dist.obat.nama_obat} • {dist.quantity_given} {dist.obat.satuan || 'unit'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(dist.created_at).toLocaleString('id-ID')}
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mt-1 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            Dikeluarkan
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Form Modal */}
      {showForm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                💊 Distribusi Obat - Validasi 5 Benar
              </h3>
            </div>

            <div className="p-6">
              {/* Patient Info */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">👤 Pasien</h4>
                <p className="text-blue-700 dark:text-blue-300">{selectedPatient.patient.nama}</p>
                <p className="text-sm text-blue-600 dark:text-blue-500">MRN: {selectedPatient.patient.no_rm}</p>
              </div>

              {/* Medicine Info */}
              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">💊 Obat</h4>
                <p className="text-green-700 dark:text-green-300">{selectedPatient.obat.nama_obat}</p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Dosis: {selectedPatient.aturan_pakai} • Sisa: {selectedPatient.remaining_quantity} {selectedPatient.obat.satuan}
                </p>
              </div>

              {/* 5 Rights Validation Form */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-800 dark:text-white">✅ Validasi 5 Benar</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      1. Benar Pasien
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.patient.nama}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      2. Benar Obat
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.obat.nama_obat}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      3. Benar Dosis
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.aturan_pakai}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      4. Benar Waktu *
                    </label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      placeholder="Contoh: Pagi, Siang, Malam, 08:00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      5. Benar Rute *
                    </label>
                    <input
                      type="text"
                      value={formData.route}
                      onChange={(e) => setFormData({...formData, route: e.target.value})}
                      placeholder="Contoh: Oral, IV, IM, SC"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jumlah Diberikan *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedPatient.remaining_quantity}
                      value={formData.quantity_given}
                      onChange={(e) => setFormData({...formData, quantity_given: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Catatan tambahan (opsional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MdError className="text-red-600 dark:text-red-400 text-lg" />
                    <h4 className="font-medium text-red-800 dark:text-red-400">Kesalahan Validasi</h4>
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitDistribution}
                  disabled={distributing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
                >
                  {distributing ? (
                    <>
                      <MdRefresh className="animate-spin inline mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <MdCheckCircle className="inline mr-2" />
                      Catat Distribusi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
