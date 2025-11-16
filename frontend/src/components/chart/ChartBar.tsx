'use client'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function ChartBar() {
  const data = {
    labels: ['IGD', 'Rawat Inap', 'Poli Umum', 'Farmasi', 'Laboratorium'],
    datasets: [
      {
        label: 'Kunjungan Minggu Ini',
        data: [120, 85, 210, 160, 95],
        backgroundColor: '#3b82f6',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { color: '#6b7280' } },
      y: { ticks: { color: '#6b7280' } },
    },
  }

  return <Bar data={data} options={options} />
}
