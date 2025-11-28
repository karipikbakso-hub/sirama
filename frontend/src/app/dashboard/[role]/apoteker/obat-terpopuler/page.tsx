'use client'

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FiPrinter, FiDownload, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface TopMedicine {
  id: number
  name: string
  category: string
  total_quantity: number
  frequency: number
  trend: 'up' | 'down' | 'stable'
  trend_percentage: number
  previous_quantity: number
}

interface TopMedicinesResponse {
  success: boolean
  data: {
    medicines: TopMedicine[]
    period: {
      start_date: string
      end_date: string
      days: number
    }
    previous_period: {
      start_date: string
      end_date: string
    }
  }
  meta: {
    timestamp: string
    total: number
  }
}

const periodOptions = [
  { value: '7', label: '7 Hari Terakhir' },
  { value: '30', label: '30 Hari Terakhir' },
  { value: '90', label: '90 Hari Terakhir' },
  { value: 'custom', label: 'Custom Range' },
]

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <FiTrendingUp className="w-4 h-4 text-green-500" />
    case 'down':
      return <FiTrendingDown className="w-4 h-4 text-red-500" />
    default:
      return <FiMinus className="w-4 h-4 text-gray-500" />
  }
}

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'down':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export default function ObatTerpopulerPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading, error, refetch } = useQuery<TopMedicinesResponse>({
    queryKey: ['top-medicines', selectedPeriod, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('period', selectedPeriod)
      params.append('limit', '20')

      if (selectedPeriod === 'custom' && startDate && endDate) {
        params.append('start_date', startDate)
        params.append('end_date', endDate)
      }

      const response = await api.get(`/api/reports/top-medicines?${params.toString()}`)
      return response.data
    },
    enabled: selectedPeriod !== 'custom' || (Boolean(startDate) && Boolean(endDate)),
  })

  const chartData = useMemo(() => {
    if (!data?.data?.medicines) return null

    return {
      labels: data.data.medicines.slice(0, 10).map((medicine: TopMedicine) => medicine.name),
      datasets: [
        {
          label: 'Total Quantity Dispensed',
          data: data.data.medicines.slice(0, 10).map((medicine: TopMedicine) => medicine.total_quantity),
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1,
        },
      ],
    }
  }, [data])

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting report as ${format}`)
  }

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)
    if (value !== 'custom') {
      setStartDate('')
      setEndDate('')
    }
  }

  if (error) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat data obat terpopuler. Silakan coba lagi.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Coba Lagi</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📊 Obat Terpopuler</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analytics obat paling sering diresepkan untuk strategi stocking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FiPrinter className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <FiDownload className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Periode:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-48 border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="End Date"
              />
            </div>
          )}

          {data?.data?.period && (
            <div className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
              Periode: {data.data.period.start_date} - {data.data.period.end_date}
              ({data.data.period.days} hari)
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      )}

      {/* Content */}
      {data?.data?.medicines && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking Table */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Ranking Obat Terpopuler
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.data.medicines.map((medicine, index) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {medicine.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {medicine.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {medicine.total_quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {medicine.frequency} resep
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 ${getTrendColor(medicine.trend)}`}
                    >
                      {getTrendIcon(medicine.trend)}
                      {Math.abs(medicine.trend_percentage)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bar Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Grafik Distribusi Quantity
            </h2>
            {chartData && (
              <div className="h-80">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.parsed.y} unit dispensed`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Quantity Dispensed',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Medicine Name',
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      {data?.data?.medicines && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {data.data.medicines.length}
            </div>
            <div className="text-sm text-gray-600">Total Obat</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {data.data.medicines.reduce((sum, med) => sum + med.total_quantity, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Quantity</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {data.data.medicines.reduce((sum, med) => sum + med.frequency, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Resep</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {data.data.medicines.filter(med => med.trend === 'up').length}
            </div>
            <div className="text-sm text-gray-600">Obat Trending Up</div>
          </Card>
        </div>
      )}
    </div>
  )
}