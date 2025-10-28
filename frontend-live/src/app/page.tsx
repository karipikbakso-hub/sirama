'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const messages = [
  'Selamat datang di SIRAMA...',
  'Sistem Informasi Rumah Sakit Modern Adaptif...',
  'Demo ini dirancang untuk menjelaskan alur sistem kepada stakeholder...',
  'Setiap halaman akan menampilkan fitur sesuai peran pengguna...',
]

export default function Home() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [text, setText] = useState('')

  useEffect(() => {
    const typing = setInterval(() => {
      setText((prev) => {
        const full = messages[current]
        if (prev.length < full.length) {
          return full.slice(0, prev.length + 1)
        } else {
          clearInterval(typing)
          setTimeout(() => {
            if (current < messages.length - 1) {
              setCurrent(current + 1)
              setText('')
            } else {
              router.push('/login')
            }
          }, 1000)
          return prev
        }
      })
    }, 50)

    return () => clearInterval(typing)
  }, [text, current, router])

  const handleSkip = () => {
    router.push('/login')
  }

  return (
    <main className="flex items-center justify-center h-screen bg-white px-4">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-mono text-gray-700">
          {text}
          <span className="animate-pulse">|</span>
        </h1>
        <p className="text-sm text-gray-500">Demo frontend interaktif untuk sistem SIRAMA</p>

        <button
          onClick={handleSkip}
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition duration-200"
        >
          Lewati & Masuk
        </button>
      </div>
    </main>
  )
}