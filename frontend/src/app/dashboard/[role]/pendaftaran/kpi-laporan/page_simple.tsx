'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { format, subDays } from 'date-fns'
import { id } from 'date-fns/locale'

export default function KPIPendaftaranSimplePage() {
  // Simple mock data
  const kpiSummary = [
    {
      label: 'Total Kunjungan',
      value: 145,
      change: '+12.5%',
      status: 'good',
      color: '#10B981'
    },
    {
      label: 'Avg Registration Time',
      value: '8.5 min',
      status: 'good',
      target: '10 min',
      color: '#10B981'
    },
    {
      label: 'Avg Waiting Time',
      value: '12 min',
      status: 'good',
      target: '15 min',
      color: '#10B981'
    },
    {
      label: 'BPJS Success Rate',
      value: '94%',
      status: 'good',
      target: '95%',
      color: '#10B981'
    }
  ]

  const mockTrendData = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'dd/MM', { locale: id }),
    total: Math.floor(Math.random() * 20) + 15,
    baru: Math.floor(Math.random() * 8) + 3,
    lama: Math.floor(Math.random() * 12) + 5
  }))

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 text-slate-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          KPI Pendaftaran - Kinerja Unit Pendaftaran
        </h1>
        <p className="text-gray-600">
          Monitoring metrik kinerja dan evaluasi layanan pendaftaran pasien
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiSummary.map((metric, index) => (
          <Card key={index} className="p-4 bg-white border border-gray-200 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {metric.label}
              </span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
            </div>
            <div className="text-2xl font-bold mb-1">{metric.value}</div>
            {metric.change && (
              <div className="text-sm text-green-600">{metric.change}</div>
            )}
            {metric.target && (
              <div className="text-xs text-gray-500">Target: {metric.target}</div>
            )}
          </Card>
        ))}
      </div>

      {/* Simple Chart Section */}
      <Card className="p-6 mb-8 bg-white border border-gray-200">
        <h3 className="text-lg font-bold mb-6">Tren Kunjungan Harian</h3>
        <div className="space-y-4">
          {mockTrendData.map((row, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">{row.date}</span>
              <div className="flex items-center gap-4">
                <span>Total: <strong>{row.total}</strong></span>
                <span>Baru: <strong className="text-green-600">{row.baru}</strong></span>
                <span>Lama: <strong className="text-blue-600">{row.lama}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Tables */}
      <Card className="p-6 bg-white border border-gray-200">
        <Tabs defaultValue="daily">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="daily">Ringkasan Harian</TabsTrigger>
              <TabsTrigger value="staff">Performa Staff</TabsTrigger>
              <TabsTrigger value="errors">Log Error</TabsTrigger>
            </TabsList>
            <Button variant="outline">
              Export Data
            </Button>
          </div>

          <TabsContent value="daily">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Baru</TableHead>
                  <TableHead>Lama</TableHead>
                  <TableHead>SEP</TableHead>
                  <TableHead>Avg Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrendData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="font-medium">{row.total}</TableCell>
                    <TableCell>{row.baru}</TableCell>
                    <TableCell>{row.lama}</TableCell>
                    <TableCell className="text-green-600">{Math.floor(row.total * 0.8)}</TableCell>
                    <TableCell>{Math.floor(Math.random() * 3) + 5} min</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="staff">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Registrasi</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>SEP Count</TableHead>
                  <TableHead>Error Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Petugas A', registrations: 45, avgTime: 8.5, sepCount: 38, errorRate: 2.1 },
                  { name: 'Petugas B', registrations: 38, avgTime: 9.2, sepCount: 32, errorRate: 3.5 },
                  { name: 'Petugas C', registrations: 42, avgTime: 8.1, sepCount: 35, errorRate: 1.8 },
                ].map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.registrations}</TableCell>
                    <TableCell>{staff.avgTime} min</TableCell>
                    <TableCell className="text-green-600">{staff.sepCount}</TableCell>
                    <TableCell className={`${staff.errorRate > 3 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {staff.errorRate}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="errors">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Tipe Error</TableHead>
                  <TableHead>Deskripsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { time: '08:15', type: 'BPJS Validation', description: 'NIK tidak valid' },
                  { time: '10:22', type: 'SEP Generation', description: 'Koneksi BPJS timeout' },
                  { time: '14:33', type: 'Data Entry', description: 'Duplikasi nomor registrasi' },
                ].map((error, index) => (
                  <TableRow key={index}>
                    <TableCell>{error.time}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="text-xs">
                        {error.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{error.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Quick Actions Footer */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button className="bg-red-500 hover:bg-red-600">
          Export PDF Report
        </Button>
        <Button variant="outline">
          Export Excel Data
        </Button>
      </div>
    </div>
  )
}
