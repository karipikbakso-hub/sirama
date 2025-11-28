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
  MdCalculate,
  MdEmergency
} from 'react-icons/md';
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

interface RadiologyExam {
  id: number;
  exam_name: string;
  description: string;
  price: number;
  category: string;
}

interface RadiologyModality {
  modality: string;
  modality_name: string;
  exams: RadiologyExam[];
}

interface RadiologyOrder {
  id: number;
  registration_id: number;
  exam_name: string;
  exam_id: number;
  result: string | null;
  ordered_date: string;
  doctor_name: string;
  status: 'menunggu' | 'proses' | 'selesai';
  urgency: string;
  clinical_indication: string;
  notes: string | null;
  modality: string;
  price: number;
  is_urgent: boolean;
}

interface SelectedExam {
  id: number;
  exam_name: string;
  description: string;
  price: number;
  category: string;
}

export default function OrderRadiologiPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const role = params?.role as string;
  const patientId = searchParams?.get('patient_id');
  const registrationId = searchParams?.get('registration_id');

  // State management
  const [selectedExams, setSelectedExams] = useState<SelectedExam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // API hooks
  const { data: radiologyData, isLoading: examsLoading } = useFetch<{ data: RadiologyModality[] }>('/api/doctor/radiology-exams');

  const { data: patientOrders, isLoading: ordersLoading, refetch: refetchOrders } = useFetch<RadiologyOrder[]>(
    '/api/doctor/radiology-orders/' + (patientId || '0'),
    { enabled: !!patientId }
  );

  const createOrderMutation = usePost('/api/doctor/radiology-orders');

  // Modalities for filtering
  const modalities = [
    { value: 'all', label: 'Semua Modality' },
    { value: 'xray', label: 'X-Ray' },
    { value: 'ct', label: 'CT Scan' },
    { value: 'mri', label: 'MRI' },
    { value: 'usg', label: 'USG' },
    { value: 'mammography', label: 'Mammography' }
  ];

  // Filter exams based on search and modality
  const filteredModalities = radiologyData?.data?.filter(modality => {
    if (selectedModality !== 'all' && modality.modality !== selectedModality) {
      return false;
    }

    // Filter exams within modality
    const filteredExams = modality.exams.filter(exam =>
      exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredExams.length > 0;
  }).map(modality => ({
    ...modality,
    exams: modality.exams.filter(exam =>
      exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })) || [];

  // Handle exam selection
  const handleExamToggle = (exam: RadiologyExam) => {
    setSelectedExams(prev => {
      const isSelected = prev.some(e => e.id === exam.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exam.id);
      } else {
        return [...prev, {
          id: exam.id,
          exam_name: exam.exam_name,
          description: exam.description,
          price: exam.price,
          category: exam.category
        }];
      }
    });
  };

  // Handle exam removal from selected list
  const handleRemoveSelectedExam = (examId: number) => {
    setSelectedExams(prev => prev.filter(e => e.id !== examId));
  };

  // Calculate total price
  const totalPrice = selectedExams.reduce((sum, exam) => sum + exam.price, 0);

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (selectedExams.length === 0) {
      toast.error('Pilih minimal 1 pemeriksaan radiologi');
      return;
    }

    if (!clinicalIndication.trim()) {
      toast.error('Indikasi klinis wajib diisi');
      return;
    }

    if (!registrationId) {
      toast.error('ID registrasi tidak ditemukan');
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        registration_id: parseInt(registrationId),
        exam_ids: selectedExams.map(exam => exam.id),
        clinical_indication: clinicalIndication.trim(),
        is_urgent: isUrgent,
        notes: notes.trim() || null
      });

      toast.success('Order radiologi berhasil dibuat');
      setSelectedExams([]);
      setClinicalIndication('');
      setIsUrgent(false);
      setNotes('');
      setShowConfirmDialog(false);
      refetchOrders();
    } catch (error) {
      toast.error('Gagal membuat order radiologi');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      'menunggu': 'secondary',
      'proses': 'outline',
      'selesai': 'default'
    };
    const labels = {
      'menunggu': 'Menunggu',
      'proses': 'Proses',
      'selesai': 'Selesai'
    };
    return { variant: variants[status as keyof typeof variants], label: labels[status as keyof typeof labels] };
  };

  if (examsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data pemeriksaan radiologi...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MdMedicalServices className="w-8 h-8" />
          Order Radiologi
        </h1>
        <p className="text-muted-foreground">
          Pilih dan pesan pemeriksaan radiologi untuk pasien
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radiology Exams Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari nama pemeriksaan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={selectedModality}
                  onChange={(e) => setSelectedModality(e.target.value)}
                  className="w-48 p-2 border rounded-md"
                  aria-label="Filter berdasarkan modality"
                >
                  {modalities.map(mod => (
                    <option key={mod.value} value={mod.value}>{mod.label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Radiology Exams by Modality */}
          <div className="space-y-4">
            {filteredModalities.map((modality) => (
              <Card key={modality.modality}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {modality.modality_name}
                    {modality.modality === 'xray' && <MdMedicalServices className="w-5 h-5" />}
                    {modality.modality === 'ct' && <MdLocalHospital className="w-5 h-5" />}
                    {modality.modality === 'mri' && <MdMedicalServices className="w-5 h-5" />}
                    {modality.modality === 'usg' && <MdMedicalServices className="w-5 h-5" />}
                    {modality.modality === 'mammography' && <MdMedicalServices className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modality.exams.map(exam => {
                      const isSelected = selectedExams.some(e => e.id === exam.id);
                      return (
                        <div
                          key={exam.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleExamToggle(exam)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleExamToggle(exam)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  aria-label={`Pilih ${exam.exam_name}`}
                                />
                                <h4 className="font-medium">{exam.exam_name}</h4>
                              </div>
                              {exam.description && (
                                <div className="text-sm text-gray-600 mb-2">
                                  {exam.description}
                                </div>
                              )}
                              <div className="text-sm font-medium text-green-600">
                                Rp {exam.price.toLocaleString('id-ID')}
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
          {/* Selected Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdShoppingCart className="w-5 h-5" />
                Pemeriksaan Terpilih ({selectedExams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada pemeriksaan yang dipilih
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedExams.map(exam => (
                    <div key={exam.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{exam.exam_name}</div>
                        <div className="text-xs text-gray-600">{exam.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rp {exam.price.toLocaleString('id-ID')}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSelectedExam(exam.id)}
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
                <label className="text-sm font-medium mb-2 block">
                  Indikasi Klinis <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Masukkan indikasi klinis yang jelas..."
                  value={clinicalIndication}
                  onChange={(e) => setClinicalIndication(e.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="urgent" className="text-sm font-medium flex items-center gap-2">
                  <MdEmergency className="w-4 h-4 text-red-500" />
                  Cito/Urgent
                </label>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Catatan Tambahan</label>
                <Textarea
                  placeholder="Catatan tambahan (opsional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>

              {selectedExams.length > 0 && (
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
                disabled={selectedExams.length === 0 || !clinicalIndication.trim()}
                className="w-full"
              >
                <MdAdd className="w-4 h-4 mr-2" />
                Buat Order Radiologi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Patient Order History */}
      {patientOrders && patientOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Order Radiologi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pemeriksaan</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgent</TableHead>
                  <TableHead>Hasil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        {new Date(order.ordered_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>{order.exam_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.modality.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant as any}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.is_urgent ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <MdEmergency className="w-3 h-3" />
                            CITO
                          </Badge>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
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
            <DialogTitle>Konfirmasi Order Radiologi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Pemeriksaan yang akan dipesan:</h4>
              <div className="space-y-2">
                {selectedExams.map(exam => (
                  <div key={exam.id} className="flex justify-between text-sm">
                    <span>{exam.exam_name}</span>
                    <span>Rp {exam.price.toLocaleString('id-ID')}</span>
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
            <div>
              <h4 className="font-medium mb-2">Indikasi Klinis:</h4>
              <p className="text-sm text-gray-600">{clinicalIndication}</p>
            </div>
            {isUrgent && (
              <Alert>
                <MdEmergency className="w-4 h-4" />
                <AlertDescription>
                  Order ini ditandai sebagai URGENT/CITO
                </AlertDescription>
              </Alert>
            )}
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