'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { toast } from '@/lib/toast'
import apiClient from '@/lib/api'
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react'

interface MobileJknBooking {
  id: number
  kode_booking: string
  no_kartu: string
  patient_name: string
  tanggal_periksa: string
  jam_praktek: string
  kode_dokter: string
  nama_dokter: string
  kode_poli: string
  nama_poli: string
  jenis_kunjungan: number
  no_rujukan: string | null
  estimasi_dilayani: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  status_color: string
  reason_rejected: string | null
  synced_at: string | null
  created_at: string
}

interface ConfigStatus {
  enabled: boolean
  configured: boolean
  kdppk: boolean
  cons_id: boolean
  secret_key: boolean
}

export default function MobileJknPage() {
  const [bookings, setBookings] = useState<MobileJknBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<MobileJknBooking | null>(null)
  const [filters, setFilters] = useState({
    tanggal: '',
    status: '',
    poli: ''
  })
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)

  // Check configuration on load
  useEffect(() => {
    checkConfiguration()
  }, [])

  // Auto-refresh every minute
  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 60000)
    return () => clearInterval(interval)
  }, [filters])

  const checkConfiguration = async () => {
    try {
      const response = await apiClient.get('/api/pendaftaran/mobile-jkn/config-status')
      setConfigStatus(response.data.data)
    } catch (error) {
      console.error('Failed to check configuration status')
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.tanggal) params.append('tanggal', filters.tanggal)
      if (filters.status) params.append('status', filters.status)
      if (filters.poli) params.append('poli', filters.poli)

      const response = await apiClient.get(`/api/pendaftaran/mobile-jkn/list?${params}`)
      setBookings(response.data.data.data)
    } catch (error) {
      toast.error('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const response = await apiClient.post('/api/pendaftaran/mobile-jkn/sync')

      toast.success(`Sync completed. ${response.data.data.new_bookings} new bookings added`)

      setLastSync(new Date().toLocaleTimeString())
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sync bookings')
    } finally {
      setSyncing(false)
    }
  }

  const handleApprove = async (bookingId: number, slotAvailable: boolean) => {
    try {
      await apiClient.post(`/api/pendaftaran/mobile-jkn/${bookingId}/approve`, {
        slot_available: slotAvailable
      })

      toast.success('Booking approved successfully')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve booking')
    }
  }

  const handleReject = async (bookingId: number, reason: string) => {
    try {
      await apiClient.post(`/api/pendaftaran/mobile-jkn/${bookingId}/reject`, {
        reason
      })

      toast.success('Booking rejected successfully')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject booking')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-500" />
      default: return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'completed': return 'default'
      case 'cancelled': return 'outline'
      default: return 'secondary'
    }
  }

  const handleCheckin = async (bookingId: number) => {
    try {
      await apiClient.post(`/api/pendaftaran/mobile-jkn/${bookingId}/checkin`)

      toast.success('Patient checked in successfully')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check in patient')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mobile JKN Integration</h1>
          <p className="text-muted-foreground">
            Manage appointments from Mobile JKN BPJS application
          </p>
        </div>
      </div>

      {/* Configuration Alert */}
      {configStatus && !configStatus.configured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Integrasi Mobile JKN belum dikonfigurasi.</strong> Silakan hubungi administrator sistem untuk mengkonfigurasi pengaturan Mobile JKN di panel admin (Pengaturan → Integrasi).
            <br />
            <small>Yang hilang: {!configStatus.kdppk && 'Kode PPK'}, {!configStatus.cons_id && 'Consumer ID'}, {!configStatus.secret_key && 'Secret Key'}</small>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Last sync:</Label>
              <span className="text-sm text-muted-foreground">
                {lastSync ? `${lastSync} ago` : 'Never'}
              </span>
            </div>

            <Button onClick={handleSync} disabled={syncing}>
              {syncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </Button>

            <div className="flex items-center gap-2">
              <Label>Auto-sync:</Label>
              <Badge variant="outline">ON (15 min)</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Label>Date filter:</Label>
              <Input
                type="date"
                value={filters.tanggal}
                onChange={(e) => setFilters({...filters, tanggal: e.target.value})}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border rounded-md w-32"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Poli:</Label>
              <Input
                placeholder="Filter by poli code"
                value={filters.poli}
                onChange={(e) => setFilters({...filters, poli: e.target.value})}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Booking</TableHead>
                  <TableHead>No. Kartu</TableHead>
                  <TableHead>Nama Pasien</TableHead>
                  <TableHead>Tanggal Periksa</TableHead>
                  <TableHead>Jam Praktek</TableHead>
                  <TableHead>Poli</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono">{booking.kode_booking}</TableCell>
                    <TableCell>{booking.no_kartu}</TableCell>
                    <TableCell>{booking.patient_name || 'Unknown'}</TableCell>
                    <TableCell>{new Date(booking.tanggal_periksa).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.jam_praktek}</TableCell>
                    <TableCell>{booking.nama_poli}</TableCell>
                    <TableCell>{booking.nama_dokter}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {/* View Details */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label>Kode Booking:</Label>
                                    <p className="font-mono">{selectedBooking.kode_booking}</p>
                                  </div>
                                  <div>
                                    <Label>No. Kartu:</Label>
                                    <p>{selectedBooking.no_kartu}</p>
                                  </div>
                                  <div>
                                    <Label>Nama Pasien:</Label>
                                    <p>{selectedBooking.patient_name}</p>
                                  </div>
                                  <div>
                                    <Label>Tanggal Periksa:</Label>
                                    <p>{new Date(selectedBooking.tanggal_periksa).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label>Jam Praktek:</Label>
                                    <p>{selectedBooking.jam_praktek}</p>
                                  </div>
                                  <div>
                                    <Label>Poli:</Label>
                                    <p>{selectedBooking.nama_poli}</p>
                                  </div>
                                  <div>
                                    <Label>Dokter:</Label>
                                    <p>{selectedBooking.nama_dokter}</p>
                                  </div>
                                  <div>
                                    <Label>Jenis Kunjungan:</Label>
                                    <p>{selectedBooking.jenis_kunjungan === 1 ? 'Rujukan' : 'Kontrol'}</p>
                                  </div>
                                  {selectedBooking.no_rujukan && (
                                    <div>
                                      <Label>No. Rujukan:</Label>
                                      <p>{selectedBooking.no_rujukan}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Actions */}
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(booking.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Booking</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Reason for rejection:</Label>
                                    <Textarea placeholder="Enter reason..." />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <DialogTrigger asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogTrigger>
                                    <Button variant="danger" onClick={() => {
                                      const reason = (document.querySelector('textarea') as HTMLTextAreaElement)?.value
                                      if (reason && selectedBooking) {
                                        handleReject(selectedBooking.id, reason)
                                      }
                                    }}>
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        {booking.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleCheckin(booking.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Check-in
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
