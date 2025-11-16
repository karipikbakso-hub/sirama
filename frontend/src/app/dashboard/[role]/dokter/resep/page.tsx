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
import { Plus, Edit, Search, Filter, Eye, Printer, Trash2 } from 'lucide-react';

// Types
interface Patient {
  id: number;
  name: string;
  mrn: string;
}

interface Medicine {
  id: number;
  nama_obat: string;
  harga_jual: number;
  satuan: string;
  golongan_obat: string;
}

interface Registration {
  id: number;
  patient_id: number;
  patient: Patient;
}

interface Prescription {
  id: number;
  no_resep: string;
  registrasi_id: number;
  dokter_id: number;
  diagnosa: string;
  instruksi: string;
  tanggal_resep: string;
  status: 'draft' | 'final' | 'dibuat' | 'selesai';
  registrasi: Registration;
  dokter: {
    id: number;
    name: string;
  };
  resepDetails: PrescriptionDetail[];
  total: number;
}

interface PrescriptionDetail {
  id: number;
  resep_id: number;
  obat_id: number;
  jumlah: number;
  aturan_pakai: string;
  hari: number;
  instruksi: string;
  harga_satuan: number;
  subtotal: number;
  obat: Medicine;
}

export default function ResepPage() {
  const params = useParams();
  const role = params?.role as string;

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    registrasi_id: '',
    diagnosa: '',
    instruksi: '',
    tanggal_resep: new Date().toISOString().split('T')[0],
    status: 'draft',
  });

  const [medicineItems, setMedicineItems] = useState<Array<{
    obat_id: string;
    jumlah: string;
    aturan_pakai: string;
    hari: string;
    instruksi: string;
  }>>([]);

  // Fetch data
  useEffect(() => {
    fetchPrescriptions();
    fetchRegistrations();
    fetchMedicines();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions');
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations?per_page=100');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/master-medicines');
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updatedItems = [...medicineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setMedicineItems(updatedItems);
  };

  const addMedicineItem = () => {
    setMedicineItems([...medicineItems, {
      obat_id: '',
      jumlah: '1',
      aturan_pakai: '1x1 tablet sehari',
      hari: '7',
      instruksi: '',
    }]);
  };

  const removeMedicineItem = (index: number) => {
    setMedicineItems(medicineItems.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      registrasi_id: '',
      diagnosa: '',
      instruksi: '',
      tanggal_resep: new Date().toISOString().split('T')[0],
      status: 'draft',
    });
    setMedicineItems([]);
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      registrasi_id: prescription.registrasi_id.toString(),
      diagnosa: prescription.diagnosa,
      instruksi: prescription.instruksi,
      tanggal_resep: prescription.tanggal_resep.split('T')[0],
      status: prescription.status,
    });
    setMedicineItems(prescription.resepDetails.map(detail => ({
      obat_id: detail.obat_id.toString(),
      jumlah: detail.jumlah.toString(),
      aturan_pakai: detail.aturan_pakai,
      hari: detail.hari.toString(),
      instruksi: detail.instruksi || '',
    })));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        registrasi_id: parseInt(formData.registrasi_id),
        obat: medicineItems.map(item => ({
          obat_id: parseInt(item.obat_id),
          jumlah: parseInt(item.jumlah),
          aturan_pakai: item.aturan_pakai,
          hari: parseInt(item.hari),
          instruksi: item.instruksi,
        })),
      };

      const url = editingPrescription
        ? `/api/prescriptions/${editingPrescription.id}`
        : '/api/prescriptions';

      const method = editingPrescription ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(editingPrescription ? 'Resep berhasil diperbarui' : 'Resep berhasil dibuat');
        setDialogOpen(false);
        resetForm();
        setEditingPrescription(null);
        fetchPrescriptions();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Terjadi kesalahan saat menyimpan resep');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus resep ini?')) return;

    try {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Resep berhasil dihapus');
        fetchPrescriptions();
      } else {
        alert('Gagal menghapus resep');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Terjadi kesalahan saat menghapus resep');
    }
  };

  const handlePrint = async (prescription: Prescription) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescription.id}/print`);
      if (response.ok) {
        const printData = await response.json();
        // Open print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Resep - ${prescription.no_resep}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .patient-info { margin-bottom: 20px; }
                  .medicine-list { margin: 20px 0; }
                  .medicine-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
                  .footer { margin-top: 30px; text-align: center; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>RUMAH SAKIT SIRAMA</h1>
                  <h2>RESEP ELEKTRONIK</h2>
                  <p>No. Resep: ${printData.data.no_resep}</p>
                  <p>Tanggal: ${printData.data.tanggal}</p>
                </div>

                <div class="patient-info">
                  <h3>Data Pasien</h3>
                  <p>Nama: ${printData.data.pasien.nama}</p>
                  <p>MRN: ${printData.data.pasien.mrn}</p>
                  ${printData.data.pasien.umur ? `<p>Umur: ${printData.data.pasien.umur} tahun</p>` : ''}
                </div>

                <div class="medicine-list">
                  <h3>Rincian Obat</h3>
                  ${printData.data.obat.map((item: any) => `
                    <div class="medicine-item">
                      <strong>${item.nama}</strong><br>
                      Jumlah: ${item.jumlah}<br>
                      Aturan Pakai: ${item.aturan_pakai}<br>
                      Lama Hari: ${item.hari}<br>
                      ${item.instruksi ? `Instruksi: ${item.instruksi}` : ''}
                    </div>
                  `).join('')}
                </div>

                <div class="footer">
                  <p>Dokter: ${printData.data.dokter}</p>
                  <p>Diagnosa: ${printData.data.diagnosa}</p>
                  ${printData.data.instruksi ? `<p>Instruksi: ${printData.data.instruksi}</p>` : ''}
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    } catch (error) {
      console.error('Error printing prescription:', error);
      alert('Gagal mencetak resep');
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = !searchTerm ||
      prescription.no_resep.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.registrasi.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.registrasi.patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosa.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterStatus || prescription.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'final': return 'default';
      case 'dibuat': return 'outline';
      case 'selesai': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'final': return 'Final';
      case 'dibuat': return 'Dibuat';
      case 'selesai': return 'Selesai';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data resep...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resep Elektronik</h1>
          <p className="text-muted-foreground">
            Kelola resep digital untuk pasien
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPrescription(null);
              resetForm();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Buat Resep Baru
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrescription ? 'Edit Resep' : 'Buat Resep Baru'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pilih Registrasi Pasien</label>
                  <SearchableSelect
                    options={registrations.map(registration => ({
                      value: registration.id.toString(),
                      label: `${registration.patient.name} (${registration.patient.mrn})`,
                    }))}
                    value={formData.registrasi_id}
                    onValueChange={(value) => handleFormChange('registrasi_id', value)}
                    placeholder="Pilih pasien..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tanggal Resep</label>
                  <Input
                    type="date"
                    value={formData.tanggal_resep}
                    onChange={(e) => handleFormChange('tanggal_resep', e.target.value)}
                  />
                </div>
              </div>

              {/* Diagnosis and Instructions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Diagnosa</label>
                  <Textarea
                    placeholder="Masukkan diagnosa pasien..."
                    value={formData.diagnosa}
                    onChange={(e) => handleFormChange('diagnosa', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Instruksi</label>
                  <Textarea
                    placeholder="Masukkan instruksi tambahan..."
                    value={formData.instruksi}
                    onChange={(e) => handleFormChange('instruksi', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium">Status Resep</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                </select>
              </div>

              {/* Medicine Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Rincian Obat</h3>
                  <Button type="button" onClick={addMedicineItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Obat
                  </Button>
                </div>

                {medicineItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Obat</label>
                        <SearchableSelect
                          options={medicines.map(medicine => ({
                            value: medicine.id.toString(),
                            label: `${medicine.nama_obat} (${medicine.satuan})`,
                          }))}
                          value={item.obat_id}
                          onValueChange={(value) => handleMedicineChange(index, 'obat_id', value)}
                          placeholder="Pilih obat..."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Jumlah</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.jumlah}
                          onChange={(e) => handleMedicineChange(index, 'jumlah', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Hari</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.hari}
                          onChange={(e) => handleMedicineChange(index, 'hari', e.target.value)}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMedicineItem(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Aturan Pakai</label>
                        <Input
                          value={item.aturan_pakai}
                          onChange={(e) => handleMedicineChange(index, 'aturan_pakai', e.target.value)}
                          placeholder="Contoh: 1x1 tablet sehari"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Instruksi Khusus</label>
                        <Input
                          value={item.instruksi}
                          onChange={(e) => handleMedicineChange(index, 'instruksi', e.target.value)}
                          placeholder="Instruksi tambahan..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {medicineItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Belum ada obat yang ditambahkan. Klik "Tambah Obat" untuk menambah.
                  </div>
                )}
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
                  {editingPrescription ? 'Perbarui Resep' : 'Simpan Resep'}
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
                  placeholder="Cari no resep, nama pasien, atau diagnosa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-48 p-2 border rounded-md"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
              <option value="dibuat">Dibuat</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Resep ({filteredPrescriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Resep</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Diagnosa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total Obat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium">{prescription.no_resep}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prescription.registrasi.patient.name}</div>
                      <div className="text-sm text-muted-foreground">{prescription.registrasi.patient.mrn}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={prescription.diagnosa}>
                    {prescription.diagnosa}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(prescription.status)}>
                      {getStatusLabel(prescription.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(prescription.tanggal_resep).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>{prescription.resepDetails?.length || 0} item</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(prescription)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(prescription)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      {prescription.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(prescription.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPrescriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data resep ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
