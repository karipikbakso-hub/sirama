'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const messages = [
  'Selamat datang di SIRAMA...',
  'Sistem Informasi Rumah Sakit Modern Adaptif...',
  'Demo ini dirancang untuk menjelaskan alur sistem kepada stakeholder...',
  'Setiap halaman akan menampilkan fitur sesuai peran pengguna...',
]

// Hindari Math.random() di SSR
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    width: Math.random() * 4 + 2,
    height: Math.random() * 4 + 2,
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: Math.random() * 3 + 2,
  }))
}

export default function Home() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [text, setText] = useState('')
  const [particles, setParticles] = useState<any[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    setParticles(generateParticles(35))
  }, [])

  useEffect(() => {
    let typingInterval: NodeJS.Timeout
    let nextMessageTimeout: NodeJS.Timeout

    if (text.length < messages[current].length) {
      typingInterval = setInterval(() => {
        setText((prev) => messages[current].slice(0, prev.length + 1))
      }, 70)
    } else {
      nextMessageTimeout = setTimeout(() => {
        if (current < messages.length - 1) {
          setCurrent(current + 1)
          setText('')
        } else {
          router.push('/login')
        }
      }, 2000)
    }

    return () => {
      clearInterval(typingInterval)
      clearTimeout(nextMessageTimeout)
    }
  }, [text, current, router])

  const handleSkip = () => router.push('/login')

  return (
    <main className="relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0a192f] to-[#1e293b] text-white px-4">
      {/* Partikel latar belakang */}
      {hydrated && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute bg-cyan-400/15 rounded-full animate-ping"
              style={{
                width: `${p.width}px`,
                height: `${p.height}px`,
                top: `${p.top}%`,
                left: `${p.left}%`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Card utama biar nyatu dengan tampilan login */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 text-center z-10 animate-fade-in">
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 rounded-full mb-6"></div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-wide mb-4">
          <span className="text-cyan-400 drop-shadow-md">{text}</span>
          <span className="inline-block w-1 h-6 bg-cyan-400 animate-pulse ml-1 align-bottom" />
        </h1>

        <p className="text-sm sm:text-base text-gray-300 opacity-80 mb-6">
          Demo interaktif sistem <span className="text-cyan-400 font-semibold">SIRAMA</span>
        </p>

        <button
          onClick={handleSkip}
          className="relative inline-block w-full py-3 font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg hover:from-cyan-400 hover:to-blue-700 transition-all duration-300 after:absolute after:inset-0 after:rounded-xl after:border after:border-cyan-400/30 after:blur-xl after:opacity-70 after:transition-all"
        >
          Lewati &amp; Masuk
        </button>
      </div>

      {/* Glow dekoratif */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/10 blur-[160px] rounded-full"></div>
    </main>
  )
}
