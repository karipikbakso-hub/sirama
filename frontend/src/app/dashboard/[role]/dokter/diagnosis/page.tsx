'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Plus, Search, Filter, Eye, Trash2, Star, History } from 'lucide-react';

// Types
interface Icd10Data {
  id: number;
  code: string;
  name: string;
  chapter: string;
  category: string;
  usage_count?: number;
}

interface Diagnosis {
  id: number;
  registration_id: number;
  icd10_code: string;
  icd10_name: string;
  diagnosis_type: 'primary' | 'secondary';
  created_at: string;
}

interface Registration {
  id: number;
  patient_id: number;
  full_name: string;
  medical_record_number: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  insurance_type: string;
  queue_number: string;
  registration_date: string;
  status: string;
  complaint: string;
}

const ICD10_CHAPTERS = [
  { value: 'A00-B99', label: 'A00-B99: Infectious and parasitic diseases' },
  { value: 'C00-D48', label: 'C00-D48: Neoplasms' },
  { value: 'D50-D89', label: 'D50-D89: Diseases of the blood and blood-forming organs' },
  { value: 'E00-E90', label: 'E00-E90: Endocrine, nutritional and metabolic diseases' },
  { value: 'F00-F99', label: 'F00-F99: Mental and behavioural disorders' },
  { value: 'G00-G99', label: 'G00-G99: Diseases of the nervous system' },
  { value: 'H00-H59', label: 'H00-H59: Diseases of the eye and adnexa' },
  { value: 'H60-H95', label: 'H60-H95: Diseases of the ear and mastoid process' },
  { value: 'I00-I99', label: 'I00-I99: Diseases of the circulatory system' },
  { value: 'J00-J99', label: 'J00-J99: Diseases of the respiratory system' },
  { value: 'K00-K93', label: 'K00-K93: Diseases of the digestive system' },
  { value: 'L00-L99', label: 'L00-L99: Diseases of the skin and subcutaneous tissue' },
  { value: 'M00-M99', label: 'M00-M99: Diseases of the musculoskeletal system' },
  { value: 'N00-N99', label: 'N00-N99: Diseases of the genitourinary system' },
  { value: 'O00-O99', label: 'O00-O99: Pregnancy, childbirth and the puerperium' },
  { value: 'P00-P96', label: 'P00-P96: Certain conditions originating in the perinatal period' },
  { value: 'Q00-Q99', label: 'Q00-Q99: Congenital malformations, deformations and chromosomal abnormalities' },
  { value: 'R00-R99', label: 'R00-R99: Symptoms, signs and abnormal clinical findings' },
  { value: 'S00-T98', label: 'S00-T98: Injury, poisoning and certain other consequences' },
  { value: 'U00-U99', label: 'U00-U99: Codes for special purposes' },
  { value: 'V01-Y98', label: 'V01-Y98: External causes of morbidity and mortality' },
  { value: 'Z00-Z99', label: 'Z00-Z99: Factors influencing health status and contact with health services' }
];

export default function DiagnosisPage() {
  const params = useParams();
  const role = params?.role as string;

  const [activeTab, setActiveTab] = useState('master');
  const [icd10Data, setIcd10Data] = useState<Icd10Data[]>([]);
  const [mostUsedDiagnoses, setMostUsedDiagnoses] = useState<Icd10Data[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState('');

  // Form state for adding diagnosis
  const [formData, setFormData] = useState({
    registration_id: '',
    icd10_code: '',
    icd10_name: '',
    diagnosis_type: 'primary'
  });

  // Fetch data
  useEffect(() => {
    fetchIcd10Data();
    fetchMostUsedDiagnoses();
    fetchRegistrations();
  }, []);

  useEffect(() => {
    if (selectedRegistration) {
      fetchDiagnoses(selectedRegistration);
    }
  }, [selectedRegistration]);

  const fetchIcd10Data = async (chapter = '') => {
    try {
      const url = chapter
        ? `/api/icd10?chapter=${chapter}&per_page=100`
        : '/api/icd10?per_page=100';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const icd10List = data.data?.data || data.data || [];
        setIcd10Data(Array.isArray(icd10List) ? icd10List : []);
      }
    } catch (error) {
      console.error('Error fetching ICD-10 data:', error);
      setIcd10Data([]);
    }
  };

  const fetchMostUsedDiagnoses = async () => {
    try {
      const response = await fetch('/api/icd10/most-used?limit=20');
      if (response.ok) {
        const data = await response.json();
        const mostUsedList = data.data || [];
        setMostUsedDiagnoses(Array.isArray(mostUsedList) ? mostUsedList : []);
      }
    } catch (error) {
      console.error('Error fetching most used diagnoses:', error);
      setMostUsedDiagnoses([]);
    }
  };

  const fetchDiagnoses = async (registrationId: string) => {
    try {
      const response = await fetch(`/api/diagnoses?registration_id=${registrationId}`);
      if (response.ok) {
        const data = await response.json();
        const diagnosesList = data.data || [];
        setDiagnoses(Array.isArray(diagnosesList) ? diagnosesList : []);
      }
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      setDiagnoses([]);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations?per_page=100');
      if (response.ok) {
        const data = await response.json();
        const registrationsData = data.data?.data || data.data || [];
        setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const searchIcd10 = async (query: string) => {
    if (!query.trim()) {
      fetchIcd10Data(selectedChapter);
      return;
    }

    try {
      const response = await fetch(`/api/icd10/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const searchResults = data.data || [];
        setIcd10Data(Array.isArray(searchResults) ? searchResults : []);
      }
    } catch (error) {
      console.error('Error searching ICD-10:', error);
    }
  };

  const handleChapterFilter = (chapter: string) => {
    setSelectedChapter(chapter);
    fetchIcd10Data(chapter);
  };

  const handleAddDiagnosis = async (icd10Item: Icd10Data) => {
    if (!selectedRegistration) {
      alert('Pilih registrasi pasien terlebih dahulu');
      return;
    }

    try {
      const response = await fetch('/api/diagnoses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration_id: parseInt(selectedRegistration),
          icd10_code: icd10Item.code,
          icd10_name: icd10Item.name,
          diagnosis_type: 'primary' // Default to primary, can be changed later
        }),
      });

      if (response.ok) {
        alert('Diagnosis berhasil ditambahkan');
        fetchDiagnoses(selectedRegistration);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal menambahkan diagnosis');
      }
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      alert('Terjadi kesalahan saat menambahkan diagnosis');
    }
  };

  const handleDeleteDiagnosis = async (diagnosisId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus diagnosis ini?')) return;

    try {
      const response = await fetch(`/api/diagnoses/${diagnosisId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Diagnosis berhasil dihapus');
        if (selectedRegistration) {
          fetchDiagnoses(selectedRegistration);
        }
      } else {
        alert('Gagal menghapus diagnosis');
      }
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      alert('Terjadi kesalahan saat menghapus diagnosis');
    }
  };

  const filteredIcd10Data = icd10Data.filter(item => {
    const matchesSearch = !searchTerm ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getDiagnosisTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'primary' ? 'default' : 'secondary'}>
        {type === 'primary' ? 'Primer' : 'Sekunder'}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold">Diagnosis ICD-10</h1>
          <p className="text-muted-foreground">
            Master data diagnosis ICD-10 dan manajemen diagnosis pasien
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="master">Master ICD-10</TabsTrigger>
          <TabsTrigger value="most-used">Paling Sering Digunakan</TabsTrigger>
          <TabsTrigger value="add">Tambah Diagnosis</TabsTrigger>
          <TabsTrigger value="history">Riwayat Diagnosis</TabsTrigger>
        </TabsList>

        {/* Master ICD-10 Tab */}
        <TabsContent value="master" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Master Data ICD-10</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari kode ICD-10 atau nama penyakit..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        searchIcd10(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={selectedChapter}
                  onChange={(e) => handleChapterFilter(e.target.value)}
                  className="w-64 p-2 border rounded-md"
                  title="Filter by ICD-10 Chapter"
                >
                  <option value="">Semua Chapter</option>
                  {ICD10_CHAPTERS.map(chapter => (
                    <option key={chapter.value} value={chapter.value}>
                      {chapter.label}
                    </option>
                  ))}
                </select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode ICD-10</TableHead>
                    <TableHead>Nama Penyakit</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIcd10Data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell className="max-w-md truncate" title={item.name}>
                        {item.name}
                      </TableCell>
                      <TableCell>{item.chapter}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddDiagnosis(item)}
                          disabled={!selectedRegistration}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredIcd10Data.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada data ICD-10 ditemukan
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Most Used Tab */}
        <TabsContent value="most-used" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis Paling Sering Digunakan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode ICD-10</TableHead>
                    <TableHead>Nama Penyakit</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Jumlah Penggunaan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostUsedDiagnoses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell className="max-w-md truncate" title={item.name}>
                        {item.name}
                      </TableCell>
                      <TableCell>{item.chapter}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          {item.usage_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddDiagnosis(item)}
                          disabled={!selectedRegistration}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {mostUsedDiagnoses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada data diagnosis yang sering digunakan
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Diagnosis Tab */}
        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Diagnosis Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Pilih Registrasi Pasien</label>
                    <SearchableSelect
                      options={registrations.map(registration => ({
                        value: registration.id.toString(),
                        label: `${registration.full_name} (${registration.medical_record_number})`,
                      }))}
                      value={selectedRegistration}
                      onChange={setSelectedRegistration}
                      placeholder="Pilih pasien..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Kode ICD-10</label>
                      <Input
                        value={formData.icd10_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, icd10_code: e.target.value }))}
                        placeholder="Contoh: A00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipe Diagnosis</label>
                      <select
                        value={formData.diagnosis_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, diagnosis_type: e.target.value as 'primary' | 'secondary' }))}
                        className="w-full p-2 border rounded-md"
                        title="Tipe Diagnosis"
                      >
                        <option value="primary">Primer</option>
                        <option value="secondary">Sekunder</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Nama Diagnosis</label>
                    <Input
                      value={formData.icd10_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, icd10_name: e.target.value }))}
                      placeholder="Nama penyakit atau diagnosis"
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      if (!selectedRegistration || !formData.icd10_code || !formData.icd10_name) {
                        alert('Mohon lengkapi semua field');
                        return;
                      }

                      try {
                        const response = await fetch('/api/diagnoses', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            registration_id: parseInt(selectedRegistration),
                            icd10_code: formData.icd10_code,
                            icd10_name: formData.icd10_name,
                            diagnosis_type: formData.diagnosis_type
                          }),
                        });

                        if (response.ok) {
                          alert('Diagnosis berhasil ditambahkan');
                          setFormData({
                            registration_id: '',
                            icd10_code: '',
                            icd10_name: '',
                            diagnosis_type: 'primary'
                          });
                          fetchDiagnoses(selectedRegistration);
                        } else {
                          const errorData = await response.json();
                          alert(errorData.message || 'Gagal menambahkan diagnosis');
                        }
                      } catch (error) {
                        console.error('Error adding diagnosis:', error);
                        alert('Terjadi kesalahan saat menambahkan diagnosis');
                      }
                    }}
                    disabled={!selectedRegistration}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Diagnosis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Diagnosis Pasien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="text-sm font-medium">Pilih Registrasi Pasien</label>
                <SearchableSelect
                  options={registrations.map(registration => ({
                    value: registration.id.toString(),
                    label: `${registration.full_name} (${registration.medical_record_number})`,
                  }))}
                  value={selectedRegistration}
                  onChange={setSelectedRegistration}
                  placeholder="Pilih pasien untuk melihat riwayat diagnosis..."
                />
              </div>

              {selectedRegistration && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode ICD-10</TableHead>
                      <TableHead>Nama Diagnosis</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diagnoses.map((diagnosis) => (
                      <TableRow key={diagnosis.id}>
                        <TableCell className="font-medium">{diagnosis.icd10_code}</TableCell>
                        <TableCell className="max-w-md truncate" title={diagnosis.icd10_name}>
                          {diagnosis.icd10_name}
                        </TableCell>
                        <TableCell>{getDiagnosisTypeBadge(diagnosis.diagnosis_type)}</TableCell>
                        <TableCell>
                          {new Date(diagnosis.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDiagnosis(diagnosis.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {selectedRegistration && diagnoses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada riwayat diagnosis untuk pasien ini
                </div>
              )}

              {!selectedRegistration && (
                <div className="text-center py-8 text-muted-foreground">
                  Pilih registrasi pasien untuk melihat riwayat diagnosis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
