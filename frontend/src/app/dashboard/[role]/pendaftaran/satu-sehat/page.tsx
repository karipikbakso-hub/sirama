'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Database,
  Users,
  Clock,
  Copy,
  Eye,
  RotateCcw,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { mockSatusehatStats, mockSyncLogs } from '@/lib/mockData';
import { toast } from '@/lib/toast';
import { useQuery } from '@tanstack/react-query';
import apiData from '@/lib/api';

// Types for SATUSEHAT integration status
interface SatusehatStatus {
  connected: boolean;
  organizationId: string;
  lastSync: string;
  isEnabled: boolean;
}

interface SatusehatStats {
  total: number;
  synced: number;
  pending: number;
  failed: number;
  todaySync: number;
}

interface SatusehatSyncLog {
  id: string;
  resourceType: 'Patient' | 'Encounter' | 'Observation';
  localId: string;
  patientName: string;
  satusehatId: string | null;
  syncStatus: 'pending' | 'success' | 'failed';
  lastAttempt: string;
  errorMessage: string | null;
  actions: string[];
}

export default function SatusehatSyncPage() {
  const params = useParams();
  const role = params?.role as string;

  // Fetch integration configuration to check if SATUSEHAT is enabled
  const { data: integrationData, isLoading: integrationLoading, error: integrationError } = useQuery({
    queryKey: ['satusehat-integration-status'],
    queryFn: async () => {
      try {
        const response = await apiData.get('/integrations/configurations');
        return response.data.data.satusehat as {
          config: { id?: number; status?: 'active' | 'inactive'; base_url?: string; organization_id?: string };
          status: { connected: boolean; message: string; last_sync?: string };
        };
      } catch (error) {
        console.error('Failed to fetch SATUSEHAT integration status:', error);
        throw error;
      }
    },
    retry: false, // Don't retry failed requests
    enabled: true // Always enable to get proper error state
  });

  // Handle API errors gracefully - default to disabled state
  const isApiError = integrationError && (integrationError as any).response?.status === 404;

  // Determine if SATUSEHAT integration is enabled
  // If API not available, default to disabled
  const isSatusehatEnabled = (!isApiError && integrationData?.config?.status === 'active') || false;
  const satusehatConnection = integrationData?.status?.connected || false;
  const organizationId = integrationData?.config?.organization_id || integrationData?.status?.message || '-';

  // State
  const [status] = useState<SatusehatStatus>({
    connected: satusehatConnection,
    organizationId: organizationId,
    lastSync: integrationData?.status?.last_sync ? new Date(integrationData.status.last_sync).toLocaleString('id-ID') : 'Belum pernah',
    isEnabled: isSatusehatEnabled
  });

  const [stats] = useState<SatusehatStats>(mockSatusehatStats);
  const [syncLogs] = useState<SatusehatSyncLog[]>(mockSyncLogs);
  const [filters, setFilters] = useState({
    resourceType: 'all',
    syncStatus: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleTestConnection = async () => {
    if (!isSatusehatEnabled) {
      toast.error('SATUSEHAT integration tidak diaktifkan dalam admin settings');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Koneksi SATUSEHAT berhasil');
    } catch (error) {
      toast.error('Koneksi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSync = async () => {
    if (!isSatusehatEnabled) {
      toast.error('SATUSEHAT integration tidak diaktifkan dalam admin settings');
      return;
    }

    if (!satusehatConnection) {
      toast.error('Koneksi SATUSEHAT tidak tersedia');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate batch sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Batch sync berhasil dimulai');
    } catch (error) {
      toast.error('Batch sync gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!isSatusehatEnabled) {
      toast.error('SATUSEHAT integration tidak diaktifkan dalam admin settings');
      return;
    }

    if (!satusehatConnection) {
      toast.error('Koneksi SATUSEHAT tidak tersedia');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate retry failed syncs
      await new Promise(resolve => setTimeout(resolve, 2500));
      toast.success('Retry failed syncs berhasil dimulai');
    } catch (error) {
      toast.error('Retry gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Disalin ke clipboard');
    } catch (error) {
      toast.error('Gagal copy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SATUSEHAT Sync</h1>
          <p className="text-muted-foreground">Sinkronisasi data pasien ke platform SATUSEHAT</p>
        </div>
        {!isSatusehatEnabled && (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <Lock className="h-3 w-3 mr-1" />
            Integration Disabled
          </Badge>
        )}
      </div>

      {/* API Error Notice */}
      {isApiError && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Integration API tidak tersedia.</strong>
            <br />
            Backend endpoint belum diimplementasikan. Halaman menampilkan mode disabled sementara ini.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Konfigurasi SATUSEHAT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Status Integration</label>
              <div className="flex items-center gap-2 mt-1">
                {isSatusehatEnabled ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status Koneksi</label>
              <div className="flex items-center gap-2 mt-1">
                {isSatusehatEnabled && status.connected ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : isSatusehatEnabled ? (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Checking...
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    N/A
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Organization ID</label>
              <p className="text-sm text-muted-foreground mt-1">
                {isSatusehatEnabled ? status.organizationId : 'Belum dikonfigurasi'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Last Sync</label>
              <p className="text-sm text-muted-foreground mt-1">
                {isSatusehatEnabled ? status.lastSync : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading || !isSatusehatEnabled}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
            {!isSatusehatEnabled && (
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Buka Admin Integration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Control Panel */}
      <Card className={!isSatusehatEnabled ? 'opacity-50' : ''}>
        <CardHeader>
          <CardTitle>Kontrol Sync</CardTitle>
          {!isSatusehatEnabled && (
            <p className="text-sm text-muted-foreground">
              Fitur sync tidak aktif karena SATUSEHAT integration tidak diaktifkan
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Tanggal Dari</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                disabled={!isSatusehatEnabled}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tanggal Sampai</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                disabled={!isSatusehatEnabled}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Resource Type</label>
              <select
                value={filters.resourceType}
                onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={!isSatusehatEnabled}
              >
                <option value="all">All</option>
                <option value="Patient">Patient</option>
                <option value="Encounter">Encounter</option>
                <option value="Observation">Observation</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={filters.syncStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, syncStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={!isSatusehatEnabled}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBatchSync}
              disabled={isLoading || !isSatusehatEnabled}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Sync Data Baru
            </Button>

            <Button
              variant="outline"
              onClick={handleRetryFailed}
              disabled={isLoading || !isSatusehatEnabled}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Retry Failed
            </Button>

            <Button variant="outline" disabled={!isSatusehatEnabled}>
              Lihat Statistics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sync Queue Table */}
        <div className="lg:col-span-3">
          <Card className={!isSatusehatEnabled ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle>Sync Queue</CardTitle>
              {!isSatusehatEnabled && (
                <p className="text-sm text-muted-foreground">
                  Data tidak tersedia karena integration tidak aktif
                </p>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Type</TableHead>
                    <TableHead>Local ID</TableHead>
                    <TableHead>Nama Pasien</TableHead>
                    <TableHead>SATUSEHAT ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs
                    .filter(log => {
                      if (filters.resourceType !== 'all' && log.resourceType !== filters.resourceType) return false;
                      if (filters.syncStatus !== 'all' && log.syncStatus !== filters.syncStatus) return false;
                      return true;
                    })
                    .slice(0, isSatusehatEnabled ? syncLogs.length : 2) // Show only 2 records when disabled
                    .map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant={
                            log.resourceType === 'Patient' ? 'default' :
                            log.resourceType === 'Encounter' ? 'secondary' : 'outline'
                          }>
                            {log.resourceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.localId}</TableCell>
                        <TableCell>{log.patientName}</TableCell>
                        <TableCell>
                          {log.satusehatId && isSatusehatEnabled ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{log.satusehatId}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(log.satusehatId!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {isSatusehatEnabled ? 'Belum ada' : 'Disabled'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.syncStatus === 'success' ? 'default' :
                              log.syncStatus === 'failed' ? 'destructive' : 'secondary'
                            }
                            className={
                              log.syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                              log.syncStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {log.syncStatus === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {log.syncStatus === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {log.syncStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {isSatusehatEnabled ? log.syncStatus : 'disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {isSatusehatEnabled ? log.lastAttempt : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {log.errorMessage && isSatusehatEnabled ? (
                            <div className="max-w-xs truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {log.syncStatus === 'failed' && isSatusehatEnabled ? (
                              <Button size="sm" variant="ghost">
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            ) : log.syncStatus !== 'failed' && isSatusehatEnabled ? (
                              <Button size="sm" variant="ghost">
                                <Eye className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" disabled>
                                <Lock className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {!isSatusehatEnabled && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    Enable SATUSEHAT integration untuk melihat dan mengelola data sync
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Panel */}
        <div className="lg:col-span-1">
          <Card className={!isSatusehatEnabled ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              {!isSatusehatEnabled && (
                <p className="text-sm text-muted-foreground">
                  Statistics tidak tersedia
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Records</span>
                  <span className="font-bold">{isSatusehatEnabled ? stats.total.toLocaleString() : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Synced</span>
                  <span className="font-bold text-green-600">
                    {isSatusehatEnabled ? stats.synced.toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-yellow-600">Pending</span>
                  <span className="font-bold text-yellow-600">
                    {isSatusehatEnabled ? stats.pending.toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-600">Failed</span>
                  <span className="font-bold text-red-600">
                    {isSatusehatEnabled ? stats.failed.toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Today's Sync</span>
                  <span className="font-bold">
                    {isSatusehatEnabled ? stats.todaySync.toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              {isSatusehatEnabled && (
                <>
                  <div className="pt-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium">Sync Progress</span>
                    </div>
                    <Progress
                      value={(stats.synced / stats.total) * 100}
                      className="w-full"
                    />
                    <div className="text-xs text-center mt-1 text-muted-foreground">
                      {((stats.synced / stats.total) * 100).toFixed(1)}% completed
                    </div>
                  </div>

                  {stats.failed > 0 && (
                    <Alert>
                      <AlertDescription>
                        Ada {stats.failed} record yang gagal sync. Klik Retry Failed untuk mencoba ulang.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {!isSatusehatEnabled && (
                <Alert>
                  <AlertDescription>
                    Feature disabled. Enable SATUSEHAT integration first.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
