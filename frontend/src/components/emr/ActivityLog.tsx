'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  History,
  User,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface ActivityEntry {
  id: number
  timestamp: string
  user: string
  action: string
  details?: string
  type: 'view' | 'edit' | 'save' | 'sign' | 'print'
}

interface ActivityLogProps {
  patientId: number
  registrationId: number
}

export default function ActivityLog({ patientId, registrationId }: ActivityLogProps) {
  // Mock activity data
  const activities: ActivityEntry[] = [
    {
      id: 1,
      timestamp: '2024-01-15T14:30:00',
      user: 'Dr. Ahmad',
      action: 'Tandatangani EMR',
      details: 'EMR berhasil ditandatangani dan difinalisasi',
      type: 'sign'
    },
    {
      id: 2,
      timestamp: '2024-01-15T14:25:00',
      user: 'Dr. Ahmad',
      action: 'Simpan draft',
      details: 'Auto-save draft EMR',
      type: 'save'
    },
    {
      id: 3,
      timestamp: '2024-01-15T14:20:00',
      user: 'Dr. Ahmad',
      action: 'Edit diagnosis',
      details: 'Mengubah diagnosis utama',
      type: 'edit'
    },
    {
      id: 4,
      timestamp: '2024-01-15T14:15:00',
      user: 'Perawat Ani',
      action: 'Input tanda vital',
      details: 'TD: 120/80 mmHg, N: 75x/m, T: 36.8°C',
      type: 'edit'
    },
    {
      id: 5,
      timestamp: '2024-01-15T10:00:00',
      user: 'Dr. Ahmad',
      action: 'Buka EMR',
      details: 'Akses pertama ke EMR pasien',
      type: 'view'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <History className="w-4 h-4 text-blue-500" />
      case 'edit': return <FileText className="w-4 h-4 text-orange-500" />
      case 'save': return <Save className="w-4 h-4 text-green-500" />
      case 'sign': return <CheckCircle className="w-4 h-4 text-purple-500" />
      case 'print': return <FileText className="w-4 h-4 text-gray-500" />
      default: return <History className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    const config = {
      view: { color: 'bg-blue-100 text-blue-800', label: 'Lihat' },
      edit: { color: 'bg-orange-100 text-orange-800', label: 'Edit' },
      save: { color: 'bg-green-100 text-green-800', label: 'Simpan' },
      sign: { color: 'bg-purple-100 text-purple-800', label: 'Tandatangan' },
      print: { color: 'bg-gray-100 text-gray-800', label: 'Cetak' }
    }
    const c = config[type as keyof typeof config] || config.view
    return <Badge className={`${c.color} ${c.label}`}>{c.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Log Aktivitas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.user}</span>
                      {getActivityBadge(activity.type)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{activity.action}</div>
                    {activity.details && (
                      <div className="text-gray-600 mt-1">{activity.details}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Akses:</span>
              <div className="font-medium">{activities.length} kali</div>
            </div>
            <div>
              <span className="text-gray-500">Terakhir Aktif:</span>
              <div className="font-medium">
                {new Date(activities[0]?.timestamp).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}