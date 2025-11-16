'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Eye, Trash2, FileText, Clock, User, Calendar, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiData from '@/lib/apiData';

interface CpptEntry {
  id: number;
  pasien_id: number;
  registrasi_id?: number;
  user_id: number;
  tanggal_waktu: string;
  shift: 'pagi' | 'siang' | 'malam';
  subjektif?: string;
  objektif?: string;
  asesmen?: string;
  planning?: string;
  instruksi?: string;
  evaluasi?: string;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
  pasien?: {
    id: number;
    name: string;
    mrn: string;
  };
  registrasi?: {
    id: number;
    no_registrasi: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

interface Patient {
  id: number;
  name: string;
  mrn: string;
  birth_date: string;
  gender: string;
}

export default function CpptPage() {
  const params = useParams();
  const role = (params?.role as string) || 'dokter';
  const router = useRouter();
  const { user } = useAuth();

  const [cpptEntries, setCpptEntries] = useState<CpptEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CpptEntry | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    pasien_id: '',
    registrasi_id: '',
    tanggal_waktu: new Date().toISOString().slice(0, 16),
    shift: 'pagi' as 'pagi' | 'siang' | 'malam',
    subjektif: '',
    objektif: '',
    asesmen: '',
    planning: '',
    instruksi: '',
    evaluasi: '',
    status: 'draft' as 'draft' | 'final'
  });

  // Load data on mount
  useEffect(() => {
    loadCpptEntries();
    loadPatients();
  }, []);

  const loadCpptEntries = async () => {
    try {
      const response = await apiData.get('/cppt-entries');
      if (response.data.success) {
        setCpptEntries(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error loading CPPT entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await apiData.get('/patients?per_page=100');
      if (response.data.success) {
        setPatients(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        pasien_id: parseInt(formData.pasien_id),
        registrasi_id: formData.registrasi_id ? parseInt(formData.registrasi_id) : null
      };

      if (editingEntry) {
        await apiData.put(`/cppt-entries/${editingEntry.id}`, data);
      } else {
        await apiData.post('/cppt-entries', data);
      }

      await loadCpptEntries();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving CPPT entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry: CpptEntry) => {
    setEditingEntry(entry);
    setFormData({
      pasien_id: entry.pasien_id.toString(),
      registrasi_id: entry.registrasi_id?.toString() || '',
      tanggal_waktu: new Date(entry.tanggal_waktu).toISOString().slice(0, 16),
      shift: entry.shift,
      subjektif: entry.subjektif || '',
      objektif: entry.objektif || '',
      asesmen: entry.asesmen || '',
      planning: entry.planning || '',
      instruksi: entry.instruksi || '',
      evaluasi: entry.evaluasi || '',
      status: entry.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan CPPT ini?')) return;

    try {
      await apiData.delete(`/cppt-entries/${id}`);
      await loadCpptEntries();
    } catch (error) {
      console.error('Error deleting CPPT entry:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      pasien_id: '',
      registrasi_id: '',
      tanggal_waktu: new Date().toISOString().slice(0, 16),
      shift: 'pagi',
      subjektif: '',
      objektif: '',
      asesmen: '',
      planning: '',
      instruksi: '',
      evaluasi: '',
      status: 'draft'
    });
    setEditingEntry(null);
  };

  const getShiftLabel = (shift: string) => {
    const labels = { pagi: 'Pagi', siang: 'Siang', malam: 'Malam' };
    return labels[shift as keyof typeof labels] || shift;
  };

  const getStatusBadge = (status: string) => {
    return status === 'final' ? (
      <Badge variant="default">Final</Badge>
    ) : (
      <Badge variant="secondary">Draft</Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Catatan Perkembangan Pasien Terintegrasi (CPPT)</h1>
            <p className="text-muted-foreground">SOAP Notes untuk monitoring pasien</p>
          </div>
        </div>

        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catatan Perkembangan Pasien Terintegrasi (CPPT)</h1>
          <p className="text-muted-foreground">SOAP Notes untuk monitoring pasien</p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Catatan CPPT
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Catatan CPPT' : 'Tambah Catatan CPPT'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pasien_id">Pasien *</Label>
                  <SearchableSelect
                    value={formData.pasien_id}
                    onValueChange={(value) => setFormData({ ...formData, pasien_id: value })}
                    options={patients.map((patient) => ({
                      value: patient.id.toString(),
                      label: `${patient.mrn} - ${patient.name}`
                    }))}
                    placeholder="Cari dan pilih pasien..."
                  />
                </div>

                <div>
                  <Label htmlFor="registrasi_id">No. Registrasi (Opsional)</Label>
                  <Input
                    id="registrasi_id"
                    value={formData.registrasi_id}
                    onChange={(e) => setFormData({ ...formData, registrasi_id: e.target.value })}
                    placeholder="Masukkan no registrasi"
                  />
                </div>
              </div>

              {/* Date and Shift */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tanggal_waktu">Tanggal & Waktu *</Label>
                  <Input
                    id="tanggal_waktu"
                    type="datetime-local"
                    value={formData.tanggal_waktu}
                    onChange={(e) => setFormData({ ...formData, tanggal_waktu: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shift">Shift *</Label>
                  <select
                    id="shift"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'pagi' | 'siang' | 'malam' })}
                    className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="pagi">Pagi (07:00 - 14:00)</option>
                    <option value="siang">Siang (14:00 - 21:00)</option>
                    <option value="malam">Malam (21:00 - 07:00)</option>
                  </select>
                </div>
              </div>

              {/* SOAP Notes */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subjektif">S - Subjektif (Keluhan Pasien)</Label>
                  <Textarea
                    id="subjektif"
                    value={formData.subjektif}
                    onChange={(e) => setFormData({ ...formData, subjektif: e.target.value })}
                    placeholder="Keluhan utama, riwayat penyakit, dll."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="objektif">O - Objektif (Temuan Fisik)</Label>
                  <Textarea
                    id="objektif"
                    value={formData.objektif}
                    onChange={(e) => setFormData({ ...formData, objektif: e.target.value })}
                    placeholder="Vital signs, pemeriksaan fisik, hasil lab, dll."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="asesmen">A - Asesmen (Diagnosis)</Label>
                  <Textarea
                    id="asesmen"
                    value={formData.asesmen}
                    onChange={(e) => setFormData({ ...formData, asesmen: e.target.value })}
                    placeholder="Diagnosis atau penilaian medis"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="planning">P - Planning (Rencana Tindakan)</Label>
                  <Textarea
                    id="planning"
                    value={formData.planning}
                    onChange={(e) => setFormData({ ...formData, planning: e.target.value })}
                    placeholder="Terapi, pengobatan, tindakan selanjutnya"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="instruksi">Instruksi Khusus</Label>
                  <Textarea
                    id="instruksi"
                    value={formData.instruksi}
                    onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
                    placeholder="Instruksi khusus untuk perawat/paramedis"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="evaluasi">Evaluasi</Label>
                  <Textarea
                    id="evaluasi"
                    value={formData.evaluasi}
                    onChange={(e) => setFormData({ ...formData, evaluasi: e.target.value })}
                    placeholder="Evaluasi hasil tindakan atau pengobatan"
                    rows={2}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'final' })}
                  className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800"
                  required
                >
                  <option value="draft">Draft (Dapat diedit)</option>
                  <option value="final">Final (Tidak dapat diedit)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : (editingEntry ? 'Update' : 'Simpan')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* CPPT Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Daftar Catatan CPPT
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cpptEntries.length === 0 ? (
            <Alert>
              <AlertDescription>
                Belum ada catatan CPPT. Klik tombol "Tambah Catatan CPPT" untuk membuat catatan pertama.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dokter/Perawat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cpptEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.pasien?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          RM: {entry.pasien?.mrn}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(entry.tanggal_waktu).toLocaleDateString('id-ID')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.tanggal_waktu).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getShiftLabel(entry.shift)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {entry.user?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
