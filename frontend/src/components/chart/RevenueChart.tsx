'use client'

import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
  }>
  loading?: boolean
}

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Revenue (Rp)',
        data: data.map(item => item.revenue),
        backgroundColor: '#10b981', // green-500
        borderColor: '#059669', // green-600
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Revenue: Rp ${context.parsed.y.toLocaleString('id-ID')}`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return 'Rp ' + value.toLocaleString('id-ID')
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}