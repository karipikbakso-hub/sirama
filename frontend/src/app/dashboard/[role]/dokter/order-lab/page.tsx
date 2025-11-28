'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  MdOutlineDelete,
  MdShoppingCart,
  MdCalculate
} from 'react-icons/md';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFetch, usePost } from '@/hooks/useApi';
import { toast } from '@/lib/toast';

// Types
interface Patient {
  id: number;
  name: string;
  mrn: string;
  insurance_type?: string;
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
  satuan: string | null;
  nilai_normal: string | null;
  tarif: number;
  aktif: boolean;
}

interface LabOrder {
  id: number;
  registration_id: number;
  test_id: number;
  doctor_id: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string | null;
  created_at: string;
  test_name: string;
  result: string | null;
  patient: Patient;
}

interface SelectedTest {
  id: number;
  nama_pemeriksaan: string;
  kode_lab: string;
  kategori: string;
  tarif: number;
  satuan: string | null;
  nilai_normal: string | null;
}

export default function OrderLabPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const role = params?.role as string;
  const patientId = searchParams?.get('patient_id');
  const registrationId = searchParams?.get('registration_id');

  // State management
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notes, setNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // API hooks
  const { data: labTests, isLoading: testsLoading } = useFetch<LabTest[]>('/api/doctor/lab-tests');

  const { data: patientOrders, isLoading: ordersLoading, refetch: refetchOrders } = useFetch<LabOrder[]>(
    '/api/doctor/lab-orders/' + (patientId || '0'),
    { enabled: !!patientId }
  );

  const createOrderMutation = usePost('/api/doctor/lab-orders');

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'Hematologi', label: 'Hematologi' },
    { value: 'Kimia Klinik', label: 'Kimia Klinik' },
    { value: 'Urinalisis', label: 'Urinalisis' },
    { value: 'Mikrobiologi', label: 'Mikrobiologi' },
    { value: 'Serologi', label: 'Serologi' },
    { value: 'Hormon', label: 'Hormon' }
  ];

  // Filter tests based on search and category
  const filteredTests = labTests?.filter(test => {
    const matchesSearch = test.nama_pemeriksaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          test.kode_lab.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.kategori === selectedCategory;
    return matchesSearch && matchesCategory && test.aktif;
  }) || [];

  // Group tests by category for display
  const groupedTests = filteredTests.reduce((acc, test) => {
    if (!acc[test.kategori]) {
      acc[test.kategori] = [];
    }
    acc[test.kategori].push(test);
    return acc;
  }, {} as Record<string, LabTest[]>);

  // Handle test selection
  const handleTestToggle = (test: LabTest) => {
    setSelectedTests(prev => {
      const isSelected = prev.some(t => t.id === test.id);
      if (isSelected) {
        return prev.filter(t => t.id !== test.id);
      } else {
        return [...prev, {
          id: test.id,
          nama_pemeriksaan: test.nama_pemeriksaan,
          kode_lab: test.kode_lab,
          kategori: test.kategori,
          tarif: test.tarif,
          satuan: test.satuan,
          nilai_normal: test.nilai_normal
        }];
      }
    });
  };

  // Handle test removal from selected list
  const handleRemoveSelectedTest = (testId: number) => {
    setSelectedTests(prev => prev.filter(t => t.id !== testId));
  };

  // Calculate total price
  const totalPrice = selectedTests.reduce((sum, test) => sum + test.tarif, 0);

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (selectedTests.length === 0) {
      toast.error('Pilih minimal 1 pemeriksaan laboratorium');
      return;
    }

    if (!patientId) {
      toast.error('ID pasien tidak ditemukan');
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        patient_id: parseInt(patientId),
        test_ids: selectedTests.map(test => test.id),
        notes: notes.trim() || null
      });

      toast.success('Order laboratorium berhasil dibuat');
      setSelectedTests([]);
      setNotes('');
      setShowConfirmDialog(false);
      refetchOrders();
    } catch (error) {
      toast.error('Gagal membuat order laboratorium');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'outline',
      completed: 'default'
    };
    const labels = {
      pending: 'Menunggu',
      in_progress: 'Proses',
      completed: 'Selesai'
    };
    return { variant: variants[status as keyof typeof variants], label: labels[status as keyof typeof labels] };
  };

  if (testsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data pemeriksaan laboratorium...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MdMedicalServices className="w-8 h-8" />
          Order Laboratorium
        </h1>
        <p className="text-muted-foreground">
          Pilih dan pesan pemeriksaan laboratorium untuk pasien
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Tests Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari nama pemeriksaan atau kode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-48 p-2 border rounded-md"
                  aria-label="Filter berdasarkan kategori pemeriksaan"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Lab Tests by Category */}
          <div className="space-y-4">
            {Object.entries(groupedTests).map(([category, tests]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tests.map(test => {
                      const isSelected = selectedTests.some(t => t.id === test.id);
                      return (
                        <div
                          key={test.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleTestToggle(test)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleTestToggle(test)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  aria-label={`Pilih ${test.nama_pemeriksaan}`}
                                />
                                <h4 className="font-medium">{test.nama_pemeriksaan}</h4>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Kode: {test.kode_lab}</div>
                                {test.nilai_normal && (
                                  <div>Normal: {test.nilai_normal}</div>
                                )}
                                <div className="font-medium text-green-600">
                                  Rp {test.tarif.toLocaleString('id-ID')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Selected Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdShoppingCart className="w-5 h-5" />
                Pemeriksaan Terpilih ({selectedTests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada pemeriksaan yang dipilih
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTests.map(test => (
                    <div key={test.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{test.nama_pemeriksaan}</div>
                        <div className="text-xs text-gray-600">{test.kode_lab}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rp {test.tarif.toLocaleString('id-ID')}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSelectedTest(test.id)}
                          className="text-red-600 hover:text-red-700 p-1 h-auto"
                        >
                          <MdDelete className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Catatan Klinis</label>
                <Textarea
                  placeholder="Masukkan indikasi atau catatan klinis..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {selectedTests.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Biaya:</span>
                    <span className="text-green-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <Alert className="mt-3">
                    <MdCalculate className="w-4 h-4" />
                    <AlertDescription>
                      Harga dapat berubah berdasarkan jenis asuransi pasien
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={selectedTests.length === 0}
                className="w-full"
              >
                <MdAdd className="w-4 h-4 mr-2" />
                Buat Order Laboratorium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Patient Order History */}
      {patientOrders && patientOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Order Laboratorium</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pemeriksaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hasil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>{order.test_name}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant as any}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.result || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Order Laboratorium</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Pemeriksaan yang akan dipesan:</h4>
              <div className="space-y-2">
                {selectedTests.map(test => (
                  <div key={test.id} className="flex justify-between text-sm">
                    <span>{test.nama_pemeriksaan}</span>
                    <span>Rp {test.tarif.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
            {notes && (
              <div>
                <h4 className="font-medium mb-2">Catatan:</h4>
                <p className="text-sm text-gray-600">{notes}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? 'Menyimpan...' : 'Konfirmasi Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
