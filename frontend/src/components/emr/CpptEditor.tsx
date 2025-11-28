'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Plus,
  Save,
  Bold,
  Italic,
  List,
  Clock,
  User,
  Stethoscope,
  Pill,
  Search,
  BookOpen,
  Zap
} from 'lucide-react'

interface Patient {
  id: number
  name: string
  mrn: string
}

interface Registration {
  id: number
  registration_no: string
}

interface Examination {
  id?: number
  status?: string
}

interface CpptEntry {
  id?: number
  waktu: string
  fokus: string
  data_subjektif: string
  data_objektif: string
  assessment: string
  planning: string
  instruksi: string
  oleh: string
  profesi: string
}

interface CpptEditorProps {
  patient: Patient
  registration: Registration
  examination?: Examination
  onSave: (data: any) => void
  onSign: () => void
}

export default function CpptEditor({
  patient,
  registration,
  examination,
  onSave,
  onSign
}: CpptEditorProps) {
  const [activeTab, setActiveTab] = useState('soap')
  const [cpptEntries, setCpptEntries] = useState<CpptEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<CpptEntry>({
    waktu: new Date().toISOString(),
    fokus: '',
    data_subjektif: '',
    data_objektif: '',
    assessment: '',
    planning: '',
    instruksi: '',
    oleh: 'Dr. Current User', // TODO: Get from auth
    profesi: 'Dokter'
  })

  const [soapData, setSoapData] = useState({
    keluhan_utama: '',
    riwayat_penyakit_sekarang: '',
    riwayat_penyakit_dahulu: '',
    riwayat_alergi: '',
    pemeriksaan_fisik: '',
    diagnosis: '',
    icd10_code: '',
    tindakan: '',
    resep: '',
    anjuran: ''
  })

  const [templates, setTemplates] = useState([
    {
      id: '1',
      name: 'Demam',
      category: 'Keluhan Umum',
      content: {
        keluhan_utama: 'Pasien mengeluh demam sejak 2 hari yang lalu',
        assessment: 'Demam tidak diketahui penyebab',
        planning: 'Pemeriksaan penunjang darah rutin, urine rutin'
      }
    },
    {
      id: '2',
      name: 'Batuk Pilek',
      category: 'Infeksi Saluran Nafas',
      content: {
        keluhan_utama: 'Pasien mengeluh batuk dan pilek sejak 3 hari',
        assessment: 'Infeksi saluran nafas atas',
        planning: 'Simtomatik, istirahat cukup, minum banyak air'
      }
    }
  ])

  const [snippets, setSnippets] = useState([
    { id: '1', name: 'Vital Normal', content: 'TD: 120/80 mmHg, N: 80x/m, RR: 18x/m, T: 36.8°C' },
    { id: '2', name: 'Kesadaran Compos Mentis', content: 'Kesadaran compos mentis, orientasi baik' },
    { id: '3', name: 'Paru Jernih', content: 'Paru jernih, tidak ada wheezing/ronchi' }
  ])

  useEffect(() => {
    // Load existing CPPT entries
    setCpptEntries([
      {
        id: 1,
        waktu: '2024-01-15T08:30:00',
        fokus: 'Pemeriksaan Awal',
        data_subjektif: 'Pasien datang dengan keluhan demam dan batuk',
        data_objektif: 'TD: 120/80 mmHg, N: 85x/m, T: 38.2°C',
        assessment: 'Infeksi saluran nafas dengan demam',
        planning: 'Pemberian antipiretik, istirahat',
        instruksi: 'Minum obat teratur, kontrol 3 hari lagi',
        oleh: 'Dr. Ahmad',
        profesi: 'Dokter'
      }
    ])
  }, [])

  const addCpptEntry = () => {
    const newEntry = {
      ...currentEntry,
      waktu: new Date().toISOString()
    }
    setCpptEntries([newEntry, ...cpptEntries])
    setCurrentEntry({
      waktu: new Date().toISOString(),
      fokus: '',
      data_subjektif: '',
      data_objektif: '',
      assessment: '',
      planning: '',
      instruksi: '',
      oleh: 'Dr. Current User',
      profesi: 'Dokter'
    })
  }

  const insertSnippet = (snippetContent: string, field: string) => {
    if (activeTab === 'soap') {
      setSoapData(prev => ({
        ...prev,
        [field]: prev[field as keyof typeof prev] + (prev[field as keyof typeof prev] ? '\n' : '') + snippetContent
      }))
    } else {
      setCurrentEntry(prev => ({
        ...prev,
        [field]: prev[field as keyof CpptEntry] + (prev[field as keyof CpptEntry] ? '\n' : '') + snippetContent
      }))
    }
  }

  const applyTemplate = (template: any) => {
    setSoapData(prev => ({
      ...prev,
      ...template.content
    }))
  }

  const handleSave = () => {
    const data = activeTab === 'soap' ? soapData : { cpptEntries, currentEntry }
    onSave(data)
  }

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Dokumentasi Klinis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Draft
              </Button>
              <Button onClick={onSign} className="bg-green-600 hover:bg-green-700">
                <Stethoscope className="w-4 h-4 mr-2" />
                Tandatangani
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Editor */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
          <TabsTrigger value="cppt">CPPT Progress</TabsTrigger>
        </TabsList>

        {/* SOAP Notes Tab */}
        <TabsContent value="soap" className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Editor */}
            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SOAP Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="keluhan_utama">Keluhan Utama (S)</Label>
                    <Textarea
                      id="keluhan_utama"
                      value={soapData.keluhan_utama}
                      onChange={(e) => setSoapData(prev => ({ ...prev, keluhan_utama: e.target.value }))}
                      placeholder="Jelaskan keluhan utama pasien..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="riwayat_sekarang">Riwayat Penyakit Sekarang (S)</Label>
                    <Textarea
                      id="riwayat_sekarang"
                      value={soapData.riwayat_penyakit_sekarang}
                      onChange={(e) => setSoapData(prev => ({ ...prev, riwayat_penyakit_sekarang: e.target.value }))}
                      placeholder="Riwayat penyakit yang dialami sekarang..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="riwayat_dahulu">Riwayat Penyakit Dahulu (S)</Label>
                    <Textarea
                      id="riwayat_dahulu"
                      value={soapData.riwayat_penyakit_dahulu}
                      onChange={(e) => setSoapData(prev => ({ ...prev, riwayat_penyakit_dahulu: e.target.value }))}
                      placeholder="Riwayat penyakit sebelumnya..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alergi">Riwayat Alergi (S)</Label>
                    <Input
                      id="alergi"
                      value={soapData.riwayat_alergi}
                      onChange={(e) => setSoapData(prev => ({ ...prev, riwayat_alergi: e.target.value }))}
                      placeholder="Riwayat alergi obat/makanan..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="pemeriksaan_fisik">Pemeriksaan Fisik (O)</Label>
                    <Textarea
                      id="pemeriksaan_fisik"
                      value={soapData.pemeriksaan_fisik}
                      onChange={(e) => setSoapData(prev => ({ ...prev, pemeriksaan_fisik: e.target.value }))}
                      placeholder="Hasil pemeriksaan fisik..."
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis (A)</Label>
                      <Textarea
                        id="diagnosis"
                        value={soapData.diagnosis}
                        onChange={(e) => setSoapData(prev => ({ ...prev, diagnosis: e.target.value }))}
                        placeholder="Diagnosis medis..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="icd10">Kode ICD-10</Label>
                      <Input
                        id="icd10"
                        value={soapData.icd10_code}
                        onChange={(e) => setSoapData(prev => ({ ...prev, icd10_code: e.target.value }))}
                        placeholder="A09.9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tindakan">Tindakan/Rencana (P)</Label>
                    <Textarea
                      id="tindakan"
                      value={soapData.tindakan}
                      onChange={(e) => setSoapData(prev => ({ ...prev, tindakan: e.target.value }))}
                      placeholder="Rencana tindakan dan pengobatan..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="resep">Resep Obat (P)</Label>
                    <Textarea
                      id="resep"
                      value={soapData.resep}
                      onChange={(e) => setSoapData(prev => ({ ...prev, resep: e.target.value }))}
                      placeholder="Resep obat yang diberikan..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="anjuran">Anjuran untuk Pasien (P)</Label>
                    <Textarea
                      id="anjuran"
                      value={soapData.anjuran}
                      onChange={(e) => setSoapData(prev => ({ ...prev, anjuran: e.target.value }))}
                      placeholder="Instruksi dan anjuran untuk pasien..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-4">
              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => applyTemplate(template)}
                      >
                        <span className="truncate">{template.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Snippets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Snippets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {snippets.map((snippet) => (
                      <div key={snippet.id} className="space-y-1">
                        <div className="text-xs font-medium">{snippet.name}</div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-6"
                            onClick={() => insertSnippet(snippet.content, 'keluhan_utama')}
                          >
                            S
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-6"
                            onClick={() => insertSnippet(snippet.content, 'pemeriksaan_fisik')}
                          >
                            O
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-6"
                            onClick={() => insertSnippet(snippet.content, 'diagnosis')}
                          >
                            A
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-6"
                            onClick={() => insertSnippet(snippet.content, 'tindakan')}
                          >
                            P
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* CPPT Progress Tab */}
        <TabsContent value="cppt" className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            {/* CPPT Editor */}
            <div className="col-span-2 space-y-4">
              {/* New Entry Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Entry CPPT Baru
                    </span>
                    <Button onClick={addCpptEntry} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Entry
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fokus">Fokus Assessment</Label>
                      <Input
                        id="fokus"
                        value={currentEntry.fokus}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, fokus: e.target.value }))}
                        placeholder="Fokus pemeriksaan..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="waktu">Waktu</Label>
                      <Input
                        id="waktu"
                        type="datetime-local"
                        value={currentEntry.waktu.slice(0, 16)}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, waktu: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="data_subjektif">Data Subjektif (S)</Label>
                    <Textarea
                      id="data_subjektif"
                      value={currentEntry.data_subjektif}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, data_subjektif: e.target.value }))}
                      placeholder="Data dari pasien/keluarga..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_objektif">Data Objektif (O)</Label>
                    <Textarea
                      id="data_objektif"
                      value={currentEntry.data_objektif}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, data_objektif: e.target.value }))}
                      placeholder="Hasil pemeriksaan fisik/vital signs..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="assessment">Assessment (A)</Label>
                    <Textarea
                      id="assessment"
                      value={currentEntry.assessment}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, assessment: e.target.value }))}
                      placeholder="Penilaian/analisis kondisi pasien..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="planning">Planning (P)</Label>
                    <Textarea
                      id="planning"
                      value={currentEntry.planning}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, planning: e.target.value }))}
                      placeholder="Rencana tindakan selanjutnya..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instruksi">Instruksi</Label>
                    <Textarea
                      id="instruksi"
                      value={currentEntry.instruksi}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, instruksi: e.target.value }))}
                      placeholder="Instruksi khusus untuk perawat..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Previous Entries */}
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat CPPT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cpptEntries.map((entry, index) => (
                      <div key={entry.id || index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {new Date(entry.waktu).toLocaleString('id-ID')}
                            </span>
                            <Badge variant="outline">{entry.profesi}</Badge>
                          </div>
                          <span className="text-sm text-gray-600">{entry.oleh}</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Fokus:</span> {entry.fokus}
                          </div>
                          <div>
                            <span className="font-medium">S:</span> {entry.data_subjektif}
                          </div>
                          <div>
                            <span className="font-medium">O:</span> {entry.data_objektif}
                          </div>
                          <div>
                            <span className="font-medium">A:</span> {entry.assessment}
                          </div>
                          <div>
                            <span className="font-medium">P:</span> {entry.planning}
                          </div>
                          {entry.instruksi && (
                            <div>
                              <span className="font-medium">Instruksi:</span> {entry.instruksi}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CPPT Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Panduan CPPT</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div>
                    <strong>S (Subjektif):</strong> Data dari pasien/keluarga
                  </div>
                  <div>
                    <strong>O (Objektif):</strong> Data hasil pemeriksaan
                  </div>
                  <div>
                    <strong>A (Assessment):</strong> Penilaian kondisi
                  </div>
                  <div>
                    <strong>P (Planning):</strong> Rencana tindakan
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}