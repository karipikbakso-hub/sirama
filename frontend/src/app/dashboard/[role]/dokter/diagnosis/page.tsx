'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Plus, Edit, Search, Filter } from 'lucide-react';

// Types
interface Patient {
  id: number;
  name: string;
  mrn: string;
}

interface Diagnosis {
  id: number;
  kode_icd: string;
  nama_diagnosa: string;
  kategori: string;
}

interface PatientDiagnosis {
  id: number;
  pasien_id: number;
  diagnosis_id: number;
  dokter_id: number;
  tipe_diagnosis: 'utama' | 'sekunder' | 'komorbiditas';
  kepastian: 'terkonfirmasi' | 'presumtif' | 'rule_out';
  catatan?: string;
  tanggal_diagnosis: string;
  pasien: Patient;
  diagnosis: Diagnosis;
  dokter: {
    id: number;
    name: string;
  };
}

export default function DiagnosisPage() {
  const params = useParams();
  const role = params?.role as string;

  const [diagnoses, setDiagnoses] = useState<PatientDiagnosis[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [masterDiagnoses, setMasterDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<PatientDiagnosis | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    pasien_id: '',
    diagnosis_id: '',
    tipe_diagnosis: 'utama',
    kepastian: 'terkonfirmasi',
    catatan: '',
    tanggal_diagnosis: new Date().toISOString().split('T')[0],
  });

  // Fetch data
  useEffect(() => {
    fetchDiagnoses();
    fetchPatients();
    fetchMasterDiagnoses();
  }, []);

  const fetchDiagnoses = async () => {
    try {
      const response = await fetch('/api/patient-diagnoses');
      if (response.ok) {
        const data = await response.json();
        setDiagnoses(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?per_page=100');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchMasterDiagnoses = async () => {
    try {
      const response = await fetch('/api/master-diagnoses');
      if (response.ok) {
        const data = await response.json();
        setMasterDiagnoses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching master diagnoses:', error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      pasien_id: '',
      diagnosis_id: '',
      tipe_diagnosis: 'utama',
      kepastian: 'terkonfirmasi',
      catatan: '',
      tanggal_diagnosis: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (diagnosis: PatientDiagnosis) => {
    setEditingDiagnosis(diagnosis);
    setFormData({
      pasien_id: diagnosis.pasien_id.toString(),
      diagnosis_id: diagnosis.diagnosis_id.toString(),
      tipe_diagnosis: diagnosis.tipe_diagnosis,
      kepastian: diagnosis.kepastian,
      catatan: diagnosis.catatan || '',
      tanggal_diagnosis: diagnosis.tanggal_diagnosis.split('T')[0],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingDiagnosis
        ? `/api/patient-diagnoses/${editingDiagnosis.id}`
        : '/api/patient-diagnoses';

      const method = editingDiagnosis ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        pasien_id: parseInt(formData.pasien_id),
        diagnosis_id: parseInt(formData.diagnosis_id),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(editingDiagnosis ? 'Diagnosis berhasil diperbarui' : 'Diagnosis berhasil ditambahkan');
        setDialogOpen(false);
        resetForm();
        setEditingDiagnosis(null);
        fetchDiagnoses();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      alert('Terjadi kesalahan saat menyimpan diagnosis');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus diagnosis ini?')) return;

    try {
      const response = await fetch(`/api/patient-diagnoses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Diagnosis berhasil dihapus');
        fetchDiagnoses();
      } else {
        alert('Gagal menghapus diagnosis');
      }
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      alert('Terjadi kesalahan saat menghapus diagnosis');
    }
  };

  const filteredDiagnoses = diagnoses.filter(diagnosis => {
    const matchesSearch = !searchTerm ||
      diagnosis.pasien.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.pasien.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.diagnosis.nama_diagnosa.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterTipe || diagnosis.tipe_diagnosis === filterTipe;

    return matchesSearch && matchesFilter;
  });

  const getTipeBadgeVariant = (tipe: string) => {
    switch (tipe) {
      case 'utama': return 'default';
      case 'sekunder': return 'secondary';
      case 'komorbiditas': return 'outline';
      default: return 'secondary';
    }
  };

  const getKepastianBadgeVariant = (kepastian: string) => {
    switch (kepastian) {
      case 'terkonfirmasi': return 'default';
      case 'presumtif': return 'secondary';
      case 'rule_out': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data diagnosis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Diagnosis Pasien</h1>
          <p className="text-muted-foreground">
            Kelola diagnosis ICD-10 untuk pasien
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDiagnosis(null);
              resetForm();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Diagnosis
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDiagnosis ? 'Edit Diagnosis' : 'Tambah Diagnosis Baru'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pasien</label>
                  <SearchableSelect
                    options={patients.map(patient => ({
                      value: patient.id.toString(),
                      label: `${patient.name} (${patient.mrn})`,
                    }))}
                    value={formData.pasien_id}
                    onValueChange={(value) => handleFormChange('pasien_id', value)}
                    placeholder="Pilih pasien..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Diagnosis ICD-10</label>
                  <SearchableSelect
                    options={masterDiagnoses.map(diagnosis => ({
                      value: diagnosis.id.toString(),
                      label: `${diagnosis.kode_icd} - ${diagnosis.nama_diagnosa}`,
                    }))}
                    value={formData.diagnosis_id}
                    onValueChange={(value) => handleFormChange('diagnosis_id', value)}
                    placeholder="Pilih diagnosis..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipe Diagnosis</label>
                  <select
                    value={formData.tipe_diagnosis}
                    onChange={(e) => handleFormChange('tipe_diagnosis', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="utama">Utama</option>
                    <option value="sekunder">Sekunder</option>
                    <option value="komorbiditas">Komorbiditas</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Kepastian</label>
                  <select
                    value={formData.kepastian}
                    onChange={(e) => handleFormChange('kepastian', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="terkonfirmasi">Terkonfirmasi</option>
                    <option value="presumtif">Presumtif</option>
                    <option value="rule_out">Rule Out</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Tanggal Diagnosis</label>
                  <Input
                    type="date"
                    value={formData.tanggal_diagnosis}
                    onChange={(e) => handleFormChange('tanggal_diagnosis', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Catatan</label>
                <Textarea
                  placeholder="Tambahkan catatan diagnosis..."
                  className="min-h-[80px]"
                  value={formData.catatan}
                  onChange={(e) => handleFormChange('catatan', e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {editingDiagnosis ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari pasien atau diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="w-48 p-2 border rounded-md"
            >
              <option value="">Semua Tipe</option>
              <option value="utama">Utama</option>
              <option value="sekunder">Sekunder</option>
              <option value="komorbiditas">Komorbiditas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Diagnosis Pasien ({filteredDiagnoses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pasien</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kepastian</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiagnoses.map((diagnosis) => (
                <TableRow key={diagnosis.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{diagnosis.pasien.name}</div>
                      <div className="text-sm text-muted-foreground">{diagnosis.pasien.mrn}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{diagnosis.diagnosis.nama_diagnosa}</div>
                      <div className="text-sm text-muted-foreground">{diagnosis.diagnosis.kode_icd}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTipeBadgeVariant(diagnosis.tipe_diagnosis)}>
                      {diagnosis.tipe_diagnosis === 'utama' ? 'Utama' :
                       diagnosis.tipe_diagnosis === 'sekunder' ? 'Sekunder' : 'Komorbiditas'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getKepastianBadgeVariant(diagnosis.kepastian)}>
                      {diagnosis.kepastian === 'terkonfirmasi' ? 'Terkonfirmasi' :
                       diagnosis.kepastian === 'presumtif' ? 'Presumtif' : 'Rule Out'}
                    </Badge>
                  </TableCell>
                  <TableCell>{diagnosis.dokter.name}</TableCell>
                  <TableCell>
                    {new Date(diagnosis.tanggal_diagnosis).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(diagnosis)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(diagnosis.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDiagnoses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data diagnosis ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
