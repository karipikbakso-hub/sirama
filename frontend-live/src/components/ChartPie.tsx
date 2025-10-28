'use client'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function ChartPie() {
  const data = {
    labels: ['BPJS', 'Umum', 'Asuransi'],
    datasets: [
      {
        data: [62, 28, 10],
        backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'],
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        labels: { color: '#6b7280' },
      },
    },
  }

  return <Pie data={data} options={options} />
}