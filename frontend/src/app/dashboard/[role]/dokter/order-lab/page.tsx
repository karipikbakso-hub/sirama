'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  MdMedicalServices,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdPrint,
  MdPerson,
  MdAccessTime,
  MdSchedule,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdWarning,
  MdLocalHospital,
  MdOutlineAccessTime,
  MdOutlineWarning,
  MdOutlineCheckCircle,
  MdOutlineDelete
} from 'react-icons/md';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

// Types
interface Patient {
  id: number;
  name: string;
  mrn: string;
}

interface Registration {
  id: number;
  patient_id: number;
  patient: Patient;
}

interface LabTest {
  id: number;
  nama_pemeriksaan: string;
  kode_lab: string;
  kategori: string;
  satuan: string;
  nilai_normal: string;
  tarif: number;
}

interface LabOrder {
  id: number;
  registrasi_id: number;
  lab_id: number;
  dokter_id: number;
  tanggal_permintaan: string;
  tanggal_hasil: string | null;
  hasil: string | null;
  satuan: string | null;
  nilai_normal: string | null;
  status: 'diminta' | 'proses' | 'selesai' | 'batal';
  tarif: number;
  catatan: string | null;
  registrasi: Registration;
  labTest: LabTest;
  dokter: {
    id: number;
    name: string;
  };
}

export default function OrderLabPage() {
  const params = useParams();
  const role = params?.role as string;

  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    registrasi_id: '',
    diagnosa_klinis: '',
    indikasi: '',
    prioritas: 'rutin',
    catatan: '',
  });

  const [selectedLabTests, setSelectedLabTests] = useState<Array<{
    lab_id: string;
    catatan_khusus: string;
  }>>([]);

  // Fetch data
  useEffect(() => {
    fetchLabOrders();
    fetchRegistrations();
    fetchLabTests();
  }, []);

  const fetchLabOrders = async () => {
    try {
      const response = await fetch('/api/laboratoriums');
      if (response.ok) {
        const data = await response.json();
        setLabOrders(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lab orders:', error);
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

  const fetchLabTests = async () => {
    try {
      const response = await fetch('/api/master-laboratoriums');
      if (response.ok) {
        const data = await response.json();
        setLabTests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLabTestChange = (index: number, field: string, value: string) => {
    const updatedTests = [...selectedLabTests];
    updatedTests[index] = { ...updatedTests[index], [field]: value };
    setSelectedLabTests(updatedTests);
  };

  const addLabTest = () => {
    setSelectedLabTests([...selectedLabTests, {
      lab_id: '',
      catatan_khusus: '',
    }]);
  };

  const removeLabTest = (index: number) => {
    setSelectedLabTests(selectedLabTests.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      registrasi_id: '',
      diagnosa_klinis: '',
      indikasi: '',
      prioritas: 'rutin',
      catatan: '',
    });
    setSelectedLabTests([]);
  };

  const handleEdit = (order: LabOrder) => {
    setEditingOrder(order);
    setFormData({
      registrasi_id: order.registrasi_id.toString(),
      diagnosa_klinis: '',
      indikasi: '',
      prioritas: 'rutin',
      catatan: order.catatan || '',
    });
    setSelectedLabTests([{
      lab_id: order.lab_id.toString(),
      catatan_khusus: '',
    }]);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        registrasi_id: parseInt(formData.registrasi_id),
        lab_tests: selectedLabTests.map(test => ({
          lab_id: parseInt(test.lab_id),
        })),
      };

      const url = editingOrder
        ? `/api/laboratoriums/${editingOrder.id}`
        : '/api/laboratoriums';

      const method = editingOrder ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(editingOrder ? 'Order lab berhasil diperbarui' : 'Order lab berhasil dibuat');
        setDialogOpen(false);
        resetForm();
        setEditingOrder(null);
        fetchLabOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving lab order:', error);
      alert('Terjadi kesalahan saat menyimpan order lab');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus order lab ini?')) return;

    try {
      const response = await fetch(`/api/laboratoriums/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Order lab berhasil dihapus');
        fetchLabOrders();
      } else {
        alert('Gagal menghapus order lab');
      }
    } catch (error) {
      console.error('Error deleting lab order:', error);
      alert('Terjadi kesalahan saat menghapus order lab');
    }
  };

  const handlePrint = async (order: LabOrder) => {
    try {
      const response = await fetch(`/api/laboratoriums/${order.id}/print`);
      if (response.ok) {
        const printData = await response.json();
        // Open print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Hasil Laboratorium - ${printData.data.pemeriksaan.nama}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .patient-info { margin-bottom: 20px; }
                  .result-section { margin: 20px 0; border: 1px solid #ddd; padding: 15px; }
                  .result-item { margin: 10px 0; padding: 10px; background: #f9f9f9; }
                  .normal { color: green; }
                  .abnormal { color: red; font-weight: bold; }
                  .footer { margin-top: 30px; text-align: center; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>RUMAH SAKIT SIRAMA</h1>
                  <h2>HASIL PEMERIKSAAN LABORATORIUM</h2>
                  <p>No. Order: ${printData.data.no_order}</p>
                  <p>Tanggal: ${printData.data.tanggal_permintaan} - ${printData.data.tanggal_hasil}</p>
                </div>

                <div class="patient-info">
                  <h3>Data Pasien</h3>
                  <p>Nama: ${printData.data.pasien.nama}</p>
                  <p>MRN: ${printData.data.pasien.mrn}</p>
                  ${printData.data.pasien.umur ? `<p>Umur: ${printData.data.pasien.umur} tahun</p>` : ''}
                </div>

                <div class="result-section">
                  <h3>Hasil Pemeriksaan</h3>
                  <div class="result-item">
                    <strong>${printData.data.pemeriksaan.nama}</strong><br>
                    <strong>Hasil: ${printData.data.hasil.nilai} ${printData.data.hasil.satuan}</strong>
                    <span class="${printData.data.hasil.is_abnormal ? 'abnormal' : 'normal'}">
                      (${printData.data.hasil.status})
                    </span><br>
                    Nilai Normal: ${printData.data.hasil.nilai_normal}
                  </div>
                </div>

                <div class="footer">
                  <p>Dokter: ${printData.data.dokter}</p>
                  <p>Status: ${printData.data.hasil.status === 'abnormal' ? 'Perlu Perhatian' : 'Normal'}</p>
                  ${printData.data.catatan ? `<p>Catatan: ${printData.data.catatan}</p>` : ''}
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    } catch (error) {
      console.error('Error printing lab result:', error);
      alert('Gagal mencetak hasil lab');
    }
  };

  const filteredOrders = labOrders.filter(order => {
    // Null checking for nested relations
    const patientName = order.registrasi?.patient?.name || '';
    const patientMrn = order.registrasi?.patient?.mrn || '';
    const labTestName = order.labTest?.nama_pemeriksaan || '';
    const labTestCode = order.labTest?.kode_lab || '';

    const matchesSearch = !searchTerm ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labTestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labTestCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterStatus || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'diminta': return 'secondary';
      case 'proses': return 'outline';
      case 'selesai': return 'default';
      case 'batal': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'diminta': return 'Diminta';
      case 'proses': return 'Proses';
      case 'selesai': return 'Selesai';
      case 'batal': return 'Batal';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diminta': return <MdOutlineAccessTime className="w-4 h-4" />;
      case 'proses': return <MdOutlineWarning className="w-4 h-4" />;
      case 'selesai': return <MdOutlineCheckCircle className="w-4 h-4" />;
      case 'batal': return <MdOutlineDelete className="w-4 h-4" />;
      default: return null;
    }
  };

  const getResultStatus = (order: LabOrder) => {
    if (order.status !== 'selesai' || !order.hasil) return null;

    // Simple logic to determine if result is abnormal
    if (order.nilai_normal && order.hasil) {
      const hasil = parseFloat(order.hasil);
      const normalRange = order.nilai_normal;

      // Parse normal range (e.g., "12-16" or "< 10")
      const rangeMatch = normalRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);
        return (hasil < min || hasil > max) ? 'abnormal' : 'normal';
      }
    }

    return 'normal';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data order laboratorium...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Laboratorium</h1>
          <p className="text-muted-foreground">
            Kelola permintaan pemeriksaan laboratorium pasien
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingOrder(null);
              resetForm();
            }}>
              <MdAdd className="w-4 h-4 mr-2" />
              Buat Order Lab Baru
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? 'Edit Order Lab' : 'Buat Order Lab Baru'}
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
                  <label className="text-sm font-medium">Prioritas</label>
                  <select
                    value={formData.prioritas}
                    onChange={(e) => handleFormChange('prioritas', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    aria-label="Pilih prioritas pemeriksaan"
                  >
                    <option value="rutin">Rutin</option>
                    <option value="cito">Cito</option>
                    <option value="stat">Stat</option>
                  </select>
                </div>
              </div>

              {/* Diagnosis and Indication */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Diagnosa Klinis</label>
                  <Textarea
                    placeholder="Masukkan diagnosa klinis..."
                    value={formData.diagnosa_klinis}
                    onChange={(e) => handleFormChange('diagnosa_klinis', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Indikasi</label>
                  <Textarea
                    placeholder="Masukkan indikasi pemeriksaan..."
                    value={formData.indikasi}
                    onChange={(e) => handleFormChange('indikasi', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Catatan</label>
                <Textarea
                  placeholder="Catatan tambahan..."
                  value={formData.catatan}
                  onChange={(e) => handleFormChange('catatan', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>

              {/* Lab Tests Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Pemeriksaan Laboratorium</h3>
                  <Button type="button" onClick={addLabTest} size="sm">
                    <MdAdd className="w-4 h-4 mr-2" />
                    Tambah Pemeriksaan
                  </Button>
                </div>

                {selectedLabTests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium">Pemeriksaan Lab</label>
                        <SearchableSelect
                          options={labTests.map(labTest => ({
                            value: labTest.id.toString(),
                            label: `${labTest.nama_pemeriksaan} (${labTest.kode_lab}) - ${labTest.kategori}`,
                          }))}
                          value={test.lab_id}
                          onValueChange={(value) => handleLabTestChange(index, 'lab_id', value)}
                          placeholder="Pilih pemeriksaan lab..."
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLabTest(index)}
                          className="text-red-600"
                        >
                          <MdOutlineDelete className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Catatan Khusus</label>
                      <Input
                        value={test.catatan_khusus}
                        onChange={(e) => handleLabTestChange(index, 'catatan_khusus', e.target.value)}
                        placeholder="Catatan khusus untuk pemeriksaan ini..."
                      />
                    </div>
                  </div>
                ))}

                {selectedLabTests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Belum ada pemeriksaan lab yang dipilih. Klik "Tambah Pemeriksaan" untuk menambah.
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
                  {editingOrder ? 'Perbarui Order' : 'Kirim Order Lab'}
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
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama pasien, MRN, atau nama pemeriksaan..."
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
              aria-label="Filter berdasarkan status order"
            >
              <option value="">Semua Status</option>
              <option value="diminta">Diminta</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
              <option value="batal">Batal</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lab Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Order Laboratorium ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Order</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Pemeriksaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Permintaan</TableHead>
                <TableHead>Hasil</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.registrasi?.patient?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.registrasi?.patient?.mrn || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.labTest?.nama_pemeriksaan || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.labTest?.kode_lab || 'N/A'} - {order.labTest?.kategori || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.tanggal_permintaan).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    {order.status === 'selesai' && order.hasil ? (
                      <div>
                        <div className={`font-medium ${getResultStatus(order) === 'abnormal' ? 'text-red-600' : 'text-green-600'}`}>
                          {order.hasil} {order.satuan || ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Normal: {order.nilai_normal || 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {order.status === 'selesai' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(order)}
                        >
                          <MdPrint className="w-4 h-4" />
                        </Button>
                      )}
                      {order.status === 'diminta' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            <MdEdit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <MdOutlineDelete className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data order laboratorium ditemukan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
