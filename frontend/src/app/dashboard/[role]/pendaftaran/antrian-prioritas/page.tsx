'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MdSearch,
  MdEdit,
  MdPriorityHigh,
  MdElderly,
  MdLocalHospital,
  MdRefresh,
  MdBarChart,
  MdPeople
} from 'react-icons/md';
import apiData from '@/lib/apiData';

interface PriorityPatient {
  id: number;
  registration_no: string;
  queue_number: string;
  patient: {
    id: number;
    mrn: string;
    name: string;
    age: number;
    gender: string;
  };
  priority: {
    id: number;
    name: string;
    code: string;
    color_code: string;
    priority_level: number;
  };
  service_unit: string;
  doctor_name: string;
  status: string;
  arrival_type: string;
  created_at: string;
  queue_order: number;
}

interface PriorityStats {
  total_priority_patients: number;
  by_priority_type: Array<{
    priority_code: string;
    priority_name: string;
    count: number;
    color_code: string;
  }>;
  elderly_patients: number;
  emergency_patients: number;
}

const AntrianPrioritasPage: React.FC = () => {
  const [patients, setPatients] = useState<PriorityPatient[]>([]);
  const [stats, setStats] = useState<PriorityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<PriorityPatient | null>(null);
  const [newPriorityId, setNewPriorityId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch priority queue data
  const fetchPriorityQueue = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (priorityFilter !== 'all') params.append('priority_type', priorityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiData.get(`/priority-queue?${params.toString()}`);
      if (response.data.success) {
        setPatients(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching priority queue:', error);
      alert('Gagal memuat data antrian prioritas');
    } finally {
      setLoading(false);
    }
  };

  // Fetch priority statistics
  const fetchPriorityStats = async () => {
    try {
      const response = await apiData.get('/priority-stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching priority stats:', error);
    }
  };

  // Update patient priority
  const updatePriority = async () => {
    if (!selectedPatient || !newPriorityId) return;

    try {
      setUpdating(true);
      const response = await apiData.patch(`/registrations/${selectedPatient.id}/priority`, {
        priority_id: newPriorityId,
      });

      if (response.data.success) {
        alert('Prioritas pasien berhasil diperbarui');
        setDialogOpen(false);
        fetchPriorityQueue();
        fetchPriorityStats();
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Gagal memperbarui prioritas pasien');
    } finally {
      setUpdating(false);
    }
  };

  // Handle edit priority
  const handleEditPriority = (patient: PriorityPatient) => {
    setSelectedPatient(patient);
    setNewPriorityId(patient.priority?.id || null);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchPriorityQueue();
    fetchPriorityStats();
  }, [priorityFilter, statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'registered': { label: 'Terdaftar', color: 'bg-blue-100 text-blue-800' },
      'checked-in': { label: 'Check-in', color: 'bg-green-100 text-green-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getPriorityBadge = (priority: any) => {
    if (!priority) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Tidak Ada Prioritas</span>;
    return (
      <span
        className="px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: priority.color_code }}
      >
        {priority.name}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Antrian Prioritas</h1>
          <p className="text-muted-foreground">
            Kelola prioritas antrian untuk lansia dan pasien emergency
          </p>
        </div>
        <button
          onClick={() => { fetchPriorityQueue(); fetchPriorityStats(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <MdRefresh className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prioritas</p>
                <p className="text-2xl font-bold">{stats.total_priority_patients}</p>
              </div>
              <MdPeople className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Pasien dengan prioritas</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lansia (≥60)</p>
                <p className="text-2xl font-bold">{stats.elderly_patients}</p>
              </div>
              <MdElderly className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Pasien lansia</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emergency</p>
                <p className="text-2xl font-bold">{stats.emergency_patients}</p>
              </div>
              <MdLocalHospital className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Kasus emergency</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prioritas Aktif</p>
                <p className="text-2xl font-bold">{stats.by_priority_type.length}</p>
              </div>
              <MdPriorityHigh className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Tipe prioritas</p>
          </div>
        </div>
      )}

      {/* Priority Type Breakdown */}
      {stats && stats.by_priority_type.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MdBarChart className="h-5 w-5" />
            Distribusi Prioritas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Jumlah pasien berdasarkan tingkat prioritas
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.by_priority_type.map((priority) => (
              <div key={priority.priority_code} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: priority.color_code }}
                  />
                  <span className="text-sm font-medium">{priority.priority_name}</span>
                </div>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{priority.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
        <h3 className="text-lg font-bold mb-2">Daftar Antrian Prioritas</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Kelola dan pantau pasien dengan prioritas khusus
        </p>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <MdSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama pasien atau nomor antrian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
              <option value="all">Semua Prioritas</option>
              <option value="elderly">Lansia</option>
              <option value="emergency">Emergency</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
              <option value="all">Semua Status</option>
              <option value="registered">Terdaftar</option>
              <option value="checked-in">Check-in</option>
            </select>
          </div>
        </div>
      </div>

      {/* Priority Queue Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">No. Antrian</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Pasien</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Prioritas</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Unit Layanan</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Dokter</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Waktu Daftar</th>
                  <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 dark:text-gray-200">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <MdPriorityHigh className="h-8 w-8 text-gray-400" />
                        <p>Tidak ada pasien dengan prioritas</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 font-medium">
                        <div>
                          <div className="font-semibold">{patient.queue_number}</div>
                          <div className="text-sm text-gray-500">{patient.registration_no}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{patient.patient.name}</div>
                          <div className="text-sm text-gray-500">
                            {patient.patient.age} tahun • {patient.patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </div>
                          <div className="text-xs text-gray-400">{patient.patient.mrn}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getPriorityBadge(patient.priority)}
                      </td>
                      <td className="px-4 py-3">{patient.service_unit}</td>
                      <td className="px-4 py-3">{patient.doctor_name || '-'}</td>
                      <td className="px-4 py-3">{getStatusBadge(patient.status)}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {new Date(patient.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEditPriority(patient)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                        >
                          <MdEdit className="h-4 w-4" />
                          Edit Prioritas
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Priority Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Prioritas Pasien</h2>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>

              {selectedPatient && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium">{selectedPatient.patient.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No. Antrian: {selectedPatient.queue_number} • {selectedPatient.service_unit}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Prioritas Baru</label>
                    <select
                      value={newPriorityId?.toString() || ''}
                      onChange={(e) => setNewPriorityId(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    >
                      <option value="">Pilih prioritas</option>
                      <option value="1">Normal - Pasien Normal</option>
                      <option value="2">Urgent - Pasien Urgent</option>
                      <option value="3">Emergency - Pasien Emergency</option>
                      <option value="4">VIP - Pasien VIP</option>
                    </select>
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MdPriorityHigh className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Perubahan prioritas akan mempengaruhi urutan antrian pasien.
                          Pastikan prioritas yang dipilih sesuai dengan kondisi pasien.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={updatePriority}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
                >
                  {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AntrianPrioritasPage;
