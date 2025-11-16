'use client'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function ChartLine() {
  const data = {
    labels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
    datasets: [
      {
        label: 'Pendapatan (juta)',
        data: [75, 82, 90, 88, 95, 102],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#6b7280' } },
    },
    scales: {
      x: { ticks: { color: '#6b7280' } },
      y: { ticks: { color: '#6b7280' } },
    },
  }

  return <Line data={data} options={options} />
}
