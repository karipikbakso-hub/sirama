'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  Thermometer,
  Activity,
  Ruler,
  Weight,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  BarChart3,
  AlertTriangle
} from 'lucide-react'

interface VitalSigns {
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  respiratory_rate?: number
  oxygen_saturation?: number
  weight?: number
  height?: number
  bmi?: number
}

interface VitalsSummaryProps {
  patientId: number
  registrationId: number
  examination?: any
}

export default function VitalsSummary({
  patientId,
  registrationId,
  examination
}: VitalsSummaryProps) {
  const [vitals, setVitals] = useState<VitalSigns>({})
  const [previousVitals, setPreviousVitals] = useState<VitalSigns[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Load current vitals from examination
    if (examination?.tanda_vital) {
      setVitals(examination.tanda_vital)
    }

    // Load previous vitals for trends
    setPreviousVitals([
      {
        blood_pressure: '120/80',
        heart_rate: 75,
        temperature: 36.8,
        respiratory_rate: 18,
        oxygen_saturation: 98,
        weight: 68,
        height: 170,
        bmi: 23.5
      },
      {
        blood_pressure: '118/78',
        heart_rate: 72,
        temperature: 36.6,
        respiratory_rate: 16,
        oxygen_saturation: 99,
        weight: 68.5,
        height: 170,
        bmi: 23.7
      }
    ])
  }, [examination])

  const calculateBMI = (weight: number, height: number) => {
    if (weight && height) {
      const heightInMeters = height / 100
      return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
    }
    return 0
  }

  const updateVital = (field: keyof VitalSigns, value: string | number) => {
    const newVitals = { ...vitals, [field]: value }

    // Auto-calculate BMI when weight or height changes
    if (field === 'weight' || field === 'height') {
      const weight = field === 'weight' ? Number(value) : vitals.weight
      const height = field === 'height' ? Number(value) : vitals.height
      if (weight && height) {
        newVitals.bmi = calculateBMI(weight, height)
      }
    }

    setVitals(newVitals)
  }

  const getTrend = (current: number, previous: number[]) => {
    if (!current || previous.length === 0) return null

    const avg = previous.reduce((a, b) => a + b, 0) / previous.length
    const diff = ((current - avg) / avg) * 100

    if (Math.abs(diff) < 5) return 'stable'
    return diff > 0 ? 'up' : 'down'
  }

  const getVitalStatus = (field: keyof VitalSigns, value: any) => {
    if (!value) return null

    const ranges = {
      heart_rate: { min: 60, max: 100, critical: { min: 50, max: 120 } },
      temperature: { min: 36.1, max: 37.2, critical: { min: 35, max: 38.5 } },
      respiratory_rate: { min: 12, max: 20, critical: { min: 8, max: 30 } },
      oxygen_saturation: { min: 95, max: 100, critical: { min: 90, max: 100 } },
      bmi: { min: 18.5, max: 24.9, critical: { min: 15, max: 35 } }
    }

    const range = ranges[field as keyof typeof ranges]
    if (!range) return null

    if (value < range.critical.min || value > range.critical.max) {
      return 'critical'
    }
    if (value < range.min || value > range.max) {
      return 'warning'
    }
    return 'normal'
  }

  const renderVitalInput = (
    label: string,
    field: keyof VitalSigns,
    value: any,
    unit: string,
    icon: React.ReactNode,
    type: 'number' | 'text' = 'number'
  ) => {
    const status = getVitalStatus(field, value)
    const trend = getTrend(
      Number(value),
      previousVitals.map(v => v[field]).filter(Boolean).map(Number)
    )

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            {icon}
            {label}
          </Label>
          {status && (
            <Badge
              variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}
              className="text-xs"
            >
              {status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {status}
            </Badge>
          )}
        </div>

        {isEditing ? (
          <Input
            type={type}
            value={value || ''}
            onChange={(e) => updateVital(field, type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={`Masukkan ${label.toLowerCase()}`}
            className="text-sm"
          />
        ) : (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium">
              {value ? `${value} ${unit}` : '-'}
            </span>
            {trend && (
              <div className="flex items-center">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
                {trend === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Vitals */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Tanda Vital Saat Ini
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Batal' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderVitalInput('Tekanan Darah', 'blood_pressure', vitals.blood_pressure, 'mmHg', <Heart className="w-4 h-4" />, 'text')}
          {renderVitalInput('Detak Jantung', 'heart_rate', vitals.heart_rate, 'bpm', <Activity className="w-4 h-4" />)}
          {renderVitalInput('Suhu', 'temperature', vitals.temperature, '°C', <Thermometer className="w-4 h-4" />)}
          {renderVitalInput('Pernapasan', 'respiratory_rate', vitals.respiratory_rate, '/menit', <Activity className="w-4 h-4" />)}
          {renderVitalInput('SpO2', 'oxygen_saturation', vitals.oxygen_saturation, '%', <Activity className="w-4 h-4" />)}
          {renderVitalInput('Berat Badan', 'weight', vitals.weight, 'kg', <Weight className="w-4 h-4" />)}
          {renderVitalInput('Tinggi Badan', 'height', vitals.height, 'cm', <Ruler className="w-4 h-4" />)}
          {renderVitalInput('BMI', 'bmi', vitals.bmi, '', <BarChart3 className="w-4 h-4" />)}
        </CardContent>
      </Card>

      {/* Quick Lab Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Hasil Lab Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Hemoglobin</span>
              <span className="text-sm font-medium">13.2 g/dL</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Glukosa Puasa</span>
              <span className="text-sm font-medium">95 mg/dL</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Kolesterol Total</span>
              <span className="text-sm font-medium">180 mg/dL</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
              <span className="text-sm">SGOT/SGPT</span>
              <span className="text-sm font-medium text-yellow-800">45/35 U/L</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tren 7 Hari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tekanan Darah</span>
                <span>120/80 mmHg</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Detak Jantung</span>
                <span>75 bpm</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Suhu Tubuh</span>
                <span>36.8°C</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}