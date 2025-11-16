'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Beaker, CheckCircle, Clock, FileText, Users } from 'lucide-react'

export default function LaboratoriumDashboard() {
  // Mock data - dalam implementasi nyata data dari API
  const stats = [
    {
      title: 'Pesanan Hari Ini',
      value: '16',
      description: '+12% dari kemarin',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Dalam Proses',
      value: '8',
      description: 'Sedang dianalisis',
      icon: Activity,
      color: 'text-orange-600'
    },
    {
      title: 'Selesai Hari Ini',
      value: '12',
      description: 'Hasil dikirim',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Pending Review',
      value: '4',
      description: 'Menunggu verifikasi',
      icon: Clock,
      color: 'text-red-600'
    }
  ]

  const recentOrders = [
    { id: 'LAB-2025-001', patient: 'Ahmad Rahman', test: 'Darah Lengkap', status: 'Selesai', time: '08:30' },
    { id: 'LAB-2025-002', patient: 'Siti Aminah', test: 'Elektrolit', status: 'Proses', time: '09:15' },
    { id: 'LAB-2025-003', patient: 'Budi Santoso', test: 'Fungsi Hati', status: 'Pending', time: '10:00' },
    { id: 'LAB-2025-004', patient: 'Maya Sari', test: 'Lipid Profil', status: 'Selesai', time: '10:30' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Laboratorium
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pantau aktivitas pemeriksaan laboratorium dan hasil tes
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Beaker className="w-4 h-4 mr-2" />
          Laboratorium
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pesanan Terbaru
          </CardTitle>
          <CardDescription>
            Status pemeriksaan laboratorium hari ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Beaker className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.patient}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.test} • {order.id}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant={
                      order.status === 'Selesai' ? 'default' :
                      order.status === 'Proses' ? 'secondary' : 'destructive'
                    }
                    className="mb-1"
                  >
                    {order.status}
                  </Badge>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-medium">Input Hasil</h3>
              <p className="text-sm text-gray-500">Masukkan hasil pemeriksaan</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-medium">Validasi Hasil</h3>
              <p className="text-sm text-gray-500">Periksa dan validasi</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-4">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-medium">Daftar Pasien</h3>
              <p className="text-sm text-gray-500">Kelola daftar pasien</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
