'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Eye, Calendar, User, Stethoscope, FileText } from 'lucide-react';

// Types
interface Patient {
  id: number;
  nama_pasien: string;
  no_rm: string;
}

interface Doctor {
  id: number;
  nama_dokter: string;
}

interface PatientHistory {
  id: number;
  patient_id: number;
  doctor_id: number;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  notes?: string;
  follow_up_date?: string;
  vital_signs?: any;
  prescription?: string;
  created_at: string;
  updated_at: string;
  patient: Patient;
  doctor: Doctor;
}

export default function RiwayatPage() {
  const params = useParams();
  const role = params?.role as string;

  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Fetch data
  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const response = await fetch('/api/patient-histories?per_page=50');
      if (response.ok) {
        const data = await response.json();
        setHistories(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patient histories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (history: PatientHistory) => {
    setSelectedHistory(history);
    setDetailDialogOpen(true);
  };

  const filteredHistories = histories.filter(history => {
    const matchesSearch = !searchTerm ||
      (history.patient?.nama_pasien?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (history.patient?.no_rm?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (history.diagnosis?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (history.treatment?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesFilter = !filterStatus || history.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'in_progress': return 'Dalam Proses';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data riwayat pasien...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📜 Riwayat Pasien</h1>
          <p className="text-muted-foreground">
            Histori kunjungan dan pemeriksaan pasien
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari pasien, diagnosis, atau tindakan..."
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
              aria-label="Filter berdasarkan status"
            >
              <option value="">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="in_progress">Dalam Proses</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kunjungan Pasien ({filteredHistories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pasien</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Tindakan</TableHead>
                <TableHead>Dokter</TableHead>
                <TableHead>Tanggal Kunjungan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistories.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{history.patient?.nama_pasien || 'Tidak Diketahui'}</div>
                      <div className="text-sm text-muted-foreground">RM: {history.patient?.no_rm || 'Tidak Ada'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={history.diagnosis || ''}>
                      {history.diagnosis || 'Tidak Ada'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={history.treatment || ''}>
                      {history.treatment || 'Tidak Ada'}
                    </div>
                  </TableCell>
                  <TableCell>{history.doctor?.nama_dokter || 'Tidak Diketahui'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(history.visit_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(history.status)}>
                      {getStatusLabel(history.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(history)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHistories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data riwayat pasien ditemukan
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Riwayat Kunjungan</DialogTitle>
          </DialogHeader>

          {selectedHistory && (
            <div className="space-y-6">
              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informasi Pasien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nama Pasien</label>
                      <p className="font-medium">{selectedHistory.patient?.nama_pasien || 'Tidak Diketahui'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">No. RM</label>
                      <p className="font-medium">{selectedHistory.patient?.no_rm || 'Tidak Ada'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visit Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Informasi Kunjungan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dokter</label>
                      <p className="font-medium">{selectedHistory.doctor?.nama_dokter || 'Tidak Diketahui'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tanggal Kunjungan</label>
                      <p className="font-medium">{formatDate(selectedHistory.visit_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant={getStatusBadgeVariant(selectedHistory.status)}>
                        {getStatusLabel(selectedHistory.status)}
                      </Badge>
                    </div>
                    {selectedHistory.follow_up_date && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Follow Up</label>
                        <p className="font-medium">{formatDate(selectedHistory.follow_up_date)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Informasi Medis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedHistory.diagnosis || 'Tidak Ada'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tindakan/Pengobatan</label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedHistory.treatment || 'Tidak Ada'}</p>
                  </div>

                  {selectedHistory.prescription && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Resep Obat</label>
                      <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedHistory.prescription}</p>
                    </div>
                  )}

                  {selectedHistory.vital_signs && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tanda Vital</label>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        <pre className="whitespace-pre-wrap text-sm">
                          {typeof selectedHistory.vital_signs === 'string'
                            ? selectedHistory.vital_signs
                            : JSON.stringify(selectedHistory.vital_signs, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedHistory.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Catatan</label>
                      <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedHistory.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">
                    <p>Dibuat: {new Date(selectedHistory.created_at).toLocaleString('id-ID')}</p>
                    <p>Diubah: {new Date(selectedHistory.updated_at).toLocaleString('id-ID')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
