'use client'

import { useState } from 'react'
import { useFetch, useMutate } from '@/hooks/useApi'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DashboardGrid } from '@/components/role/DashboardGrid'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/lib/toast'
import { Database, HardDrive, Clock, Download, RefreshCw, Trash2, Loader2, Calendar, Settings, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { JadwalBackup, RiwayatBackup } from '@/types/role/admin'

export default function BackupPage() {
  const { user } = useAuth()
  const [isBackupRunning, setIsBackupRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('manual')

  // Admin role check
  if (!user?.roles?.includes('admin')) {
    return null
  }

  const { data: backupData, isLoading, refetch } = useFetch('/api/backups/histories')
  const { data: schedulesData, refetch: refetchSchedules } = useFetch('/api/backups/schedules')
  const createMutation = useMutate('post', '/api/backups/manual')
  const deleteMutation = useMutate('delete', '/api/backups')

  const stats = (backupData as any)?.stats || { totalCount: 0, totalSizeBytes: 0, lastBackupAt: null }
  const backups = (backupData as any)?.data || []
  const schedules = (schedulesData as any)?.data || []

  const handleBackup = async () => {
    try {
      setIsBackupRunning(true)
      setProgress(0)

      const res = await createMutation.mutateAsync({})
      toast.success('Backup berhasil dibuat!')
      refetch()
      setIsBackupRunning(false)
    } catch (error: any) {
      setIsBackupRunning(false)
      toast.error(error.response?.data?.message || 'Gagal membuat backup')
    }
  }

  const handleDelete = async (backup: RiwayatBackup) => {
    if (!confirm(`Hapus backup "${backup.nama_file}"?`)) return

    try {
      await deleteMutation.mutateAsync(`/${backup.id}`)
      toast.success('Backup berhasil dihapus!')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus backup')
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatRelative = (date: string | null): string => {
    if (!date) return 'Belum ada'
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} menit yang lalu`
    if (mins < 1440) return `${Math.floor(mins / 60)} jam yang lalu`
    return `${Math.floor(mins / 1440)} hari yang lalu`
  }

  const filteredBackups = backups.filter((backup: RiwayatBackup) =>
    backup.nama_file.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Backup & Recovery</h1>
        <DashboardGrid columns={4}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </DashboardGrid>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Recovery</h1>
          <p className="text-muted-foreground mt-1">Sistem backup dan recovery database</p>
        </div>
        <Button onClick={() => { refetch(); refetchSchedules(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Backup Manual</TabsTrigger>
          <TabsTrigger value="schedules">Jadwal Backup</TabsTrigger>
          <TabsTrigger value="history">Riwayat Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <DashboardGrid columns={4}>
            {/* Total Backups Card */}
            <StatCard
              title="Total Backup"
              value={stats.totalCount.toString()}
              icon={Database}
              description="Semua file backup"
            />

            {/* Total Size Card */}
            <StatCard
              title="Total Ukuran"
              value={formatBytes(stats.totalSizeBytes)}
              icon={HardDrive}
              description="Penyimpanan yang digunakan"
            />

            {/* Last Backup Card */}
            <StatCard
              title="Backup Terakhir"
              value={formatRelative(stats.lastBackupAt)}
              icon={Clock}
              description={stats.lastBackupAt ? 'Berhasil' : 'Belum ada backup'}
            />

            {/* Manual Backup Widget */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Backup Manual</h3>
              <Button
                onClick={handleBackup}
                disabled={isBackupRunning}
                className="w-full"
                size="sm"
              >
                {isBackupRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuat backup... {progress}%
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Backup Sekarang
                  </>
                )}
              </Button>

              {isBackupRunning && (
                <div className="mt-4">
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Membuat backup... Harap tunggu.
                  </p>
                </div>
              )}
            </div>

            {/* Search Widget */}
            <div className="col-span-4 rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Riwayat Backup</h3>
                <Input
                  placeholder="Cari backup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              {filteredBackups.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {backups.length === 0
                      ? "Belum ada backup. Klik 'Backup Sekarang' untuk membuat backup pertama."
                      : "Tidak ada backup yang cocok dengan pencarian."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBackups.slice(0, 5).map((backup: RiwayatBackup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-mono text-sm">{backup.nama_file}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
                            {backup.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {backup.ukuran_file ? formatBytes(backup.ukuran_file) : 'N/A'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(backup.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/backups/${backup.id}/download`, '_blank')}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(backup)}
                          disabled={deleteMutation.isPending}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredBackups.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Dan {filteredBackups.length - 5} backup lainnya...
                    </p>
                  )}
                </div>
              )}
            </div>
          </DashboardGrid>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Backup</CardTitle>
              <CardDescription>
                Kelola jadwal backup otomatis sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Jadwal
                  </Button>
                </div>

                {schedules.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Belum ada jadwal backup. Klik "Tambah Jadwal" untuk membuat jadwal backup otomatis.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule: JadwalBackup) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{schedule.nama_jadwal}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {schedule.frekuensi === 'daily' ? 'Harian' :
                               schedule.frekuensi === 'weekly' ? 'Mingguan' : 'Bulanan'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {schedule.waktu_eksekusi}
                            </span>
                            {schedule.hari_eksekusi && (
                              <span className="text-sm text-muted-foreground">
                                Hari {schedule.hari_eksekusi}
                              </span>
                            )}
                            <Badge variant={schedule.status_aktif ? 'default' : 'secondary'}>
                              {schedule.status_aktif ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </div>
                          {schedule.terakhir_dijalankan && (
                            <p className="text-sm text-muted-foreground">
                              Terakhir dijalankan: {new Date(schedule.terakhir_dijalankan).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="danger">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Backup Lengkap</CardTitle>
              <CardDescription>
                Lihat semua riwayat backup sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Cari backup..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {filteredBackups.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {backups.length === 0
                        ? "Belum ada riwayat backup"
                        : "Tidak ada backup yang cocok dengan pencarian"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBackups.map((backup: RiwayatBackup) => (
                      <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{backup.nama_file}</p>
                            <Badge variant={backup.status === 'completed' ? 'default' :
                                          backup.status === 'running' ? 'secondary' :
                                          backup.status === 'failed' ? 'destructive' : 'outline'}>
                              {backup.status === 'completed' ? 'Selesai' :
                               backup.status === 'running' ? 'Berjalan' :
                               backup.status === 'failed' ? 'Gagal' : 'Dibatalkan'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Ukuran: {backup.ukuran_file ? formatBytes(backup.ukuran_file) : 'N/A'}</span>
                            {backup.durasi_detik && (
                              <span>Durasi: {Math.round(backup.durasi_detik / 60)}m {backup.durasi_detik % 60}s</span>
                            )}
                            <span>{new Date(backup.created_at).toLocaleString('id-ID')}</span>
                            {backup.jadwalBackup && (
                              <span className="text-blue-600">
                                Jadwal: {backup.jadwalBackup.nama_jadwal}
                              </span>
                            )}
                          </div>
                          {backup.pesan_error && (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              Error: {backup.pesan_error}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {backup.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/api/backups/download/${backup.id}`, '_blank')}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(backup)}
                            disabled={deleteMutation.isPending}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
