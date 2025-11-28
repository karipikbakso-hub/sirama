'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  TestTube,
  ScanLine,
  Pill,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

interface Order {
  id?: number
  type: 'lab' | 'radiology' | 'medication'
  name: string
  description?: string
  priority: 'routine' | 'urgent' | 'stat'
  status: 'pending' | 'completed' | 'cancelled'
  ordered_at?: string
  completed_at?: string
}

interface OrdersPanelProps {
  patientId: number
  registrationId: number
  examination?: any
}

export default function OrdersPanel({
  patientId,
  registrationId,
  examination
}: OrdersPanelProps) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      type: 'lab',
      name: 'Darah Rutin',
      description: 'Hemoglobin, Hematokrit, Leukosit, Trombosit',
      priority: 'routine',
      status: 'pending',
      ordered_at: '2024-01-15T10:00:00'
    },
    {
      id: 2,
      type: 'radiology',
      name: 'Thorax PA',
      description: 'Foto thorax PA untuk evaluasi paru',
      priority: 'urgent',
      status: 'completed',
      ordered_at: '2024-01-15T10:15:00',
      completed_at: '2024-01-15T11:30:00'
    }
  ])

  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [orderType, setOrderType] = useState<'lab' | 'radiology' | 'medication'>('lab')
  const [newOrder, setNewOrder] = useState({
    name: '',
    description: '',
    priority: 'routine' as 'routine' | 'urgent' | 'stat'
  })

  // Mock data for order options
  const labTests = [
    { id: '1', name: 'Darah Rutin (CBC)', description: 'Hemoglobin, Hematokrit, Leukosit, Trombosit' },
    { id: '2', name: 'Glukosa Puasa', description: 'Kadar glukosa darah puasa' },
    { id: '3', name: 'Kolesterol Total', description: 'Pemeriksaan kadar kolesterol' },
    { id: '4', name: 'SGOT/SGPT', description: 'Enzim hati' },
    { id: '5', name: 'Creatinin', description: 'Fungsi ginjal' },
    { id: '6', name: 'Urine Rutin', description: 'Analisis urine lengkap' }
  ]

  const radiologyTests = [
    { id: '1', name: 'Thorax PA', description: 'Foto dada posisi PA' },
    { id: '2', name: 'Thorax Lateral', description: 'Foto dada posisi lateral' },
    { id: '3', name: 'USG Abdomen', description: 'Ultrasonografi abdomen' },
    { id: '4', name: 'CT Scan Kepala', description: 'CT scan otak' },
    { id: '5', name: 'MRI Lutut', description: 'MRI sendi lutut' }
  ]

  const medications = [
    { id: '1', name: 'Paracetamol 500mg', description: 'Tablet, 3x sehari' },
    { id: '2', name: 'Amoxicillin 500mg', description: 'Kapsul, 3x sehari' },
    { id: '3', name: 'Ibuprofen 400mg', description: 'Tablet, 3x sehari' },
    { id: '4', name: 'Omeprazole 20mg', description: 'Kapsul, 1x sehari' }
  ]

  const addOrder = () => {
    const order: Order = {
      type: orderType,
      name: newOrder.name,
      description: newOrder.description,
      priority: newOrder.priority,
      status: 'pending',
      ordered_at: new Date().toISOString()
    }

    setOrders([order, ...orders])
    setNewOrder({ name: '', description: '', priority: 'routine' })
    setShowOrderDialog(false)
  }

  const removeOrder = (orderId: number) => {
    setOrders(orders.filter(order => order.id !== orderId))
  }

  const getOrderIcon = (type: string) => {
    switch (type) {
      case 'lab': return <TestTube className="w-4 h-4" />
      case 'radiology': return <ScanLine className="w-4 h-4" />
      case 'medication': return <Pill className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      routine: { color: 'bg-blue-100 text-blue-800', label: 'Rutin' },
      urgent: { color: 'bg-orange-100 text-orange-800', label: 'Urgent' },
      stat: { color: 'bg-red-100 text-red-800', label: 'Stat' }
    }
    const c = config[priority as keyof typeof config] || config.routine
    return <Badge className={`${c.color} ${c.label}`}>{c.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' }
    }
    const c = config[status as keyof typeof config] || config.pending
    return <Badge className={`${c.color} ${c.label}`}>{c.label}</Badge>
  }

  const getOrderOptions = () => {
    switch (orderType) {
      case 'lab': return labTests
      case 'radiology': return radiologyTests
      case 'medication': return medications
      default: return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pesanan Aktif
            </CardTitle>
            <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Pesanan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Pesanan Baru</DialogTitle>
                  <DialogDescription>
                    Pilih jenis pesanan dan lengkapi detailnya
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="lab" className="flex items-center gap-2">
                      <TestTube className="w-4 h-4" />
                      Lab
                    </TabsTrigger>
                    <TabsTrigger value="radiology" className="flex items-center gap-2">
                      <ScanLine className="w-4 h-4" />
                      Radiologi
                    </TabsTrigger>
                    <TabsTrigger value="medication" className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Obat
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Pilih Pemeriksaan</Label>
                      <select
                        className="w-full p-2 border rounded mt-1"
                        onChange={(e) => {
                          const selected = getOrderOptions().find(opt => opt.id === e.target.value)
                          if (selected) {
                            setNewOrder({
                              ...newOrder,
                              name: selected.name,
                              description: selected.description
                            })
                          }
                        }}
                      >
                        <option value="">Pilih dari daftar...</option>
                        {getOrderOptions().map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="orderName">Nama Pemeriksaan</Label>
                      <Input
                        id="orderName"
                        value={newOrder.name}
                        onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                        placeholder="Nama pemeriksaan..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="orderDescription">Deskripsi</Label>
                      <Textarea
                        id="orderDescription"
                        value={newOrder.description}
                        onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                        placeholder="Deskripsi detail..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Prioritas</Label>
                      <select
                        className="w-full p-2 border rounded mt-1"
                        value={newOrder.priority}
                        onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value as any })}
                      >
                        <option value="routine">Rutin</option>
                        <option value="urgent">Urgent</option>
                        <option value="stat">Stat</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                        Batal
                      </Button>
                      <Button onClick={addOrder}>
                        Tambah Pesanan
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.filter(order => order.status === 'pending').map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-3">
                  {getOrderIcon(order.type)}
                  <div>
                    <div className="font-medium">{order.name}</div>
                    <div className="text-sm text-gray-600">{order.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(order.priority)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOrder(order.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {orders.filter(order => order.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada pesanan aktif
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Riwayat Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.filter(order => order.status !== 'pending').map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded">
                <div className="flex items-center gap-3">
                  {getOrderIcon(order.type)}
                  <div>
                    <div className="font-medium">{order.name}</div>
                    <div className="text-sm text-gray-600">{order.description}</div>
                    <div className="text-xs text-gray-500">
                      Dipesan: {new Date(order.ordered_at!).toLocaleDateString('id-ID')}
                      {order.completed_at && ` • Selesai: ${new Date(order.completed_at).toLocaleDateString('id-ID')}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(order.priority)}
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}

            {orders.filter(order => order.status !== 'pending').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada riwayat pesanan
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}