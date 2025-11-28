'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { usePatientSearch } from '@/hooks/usePatientSearch'
import { Patient } from '@/types/role/pendaftaran'
import { Input } from './input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Alert, AlertDescription } from './alert'
import { ChevronLeft, ChevronRight, QrCode, Camera } from 'lucide-react'

interface PatientSearchBarProps {
  onSelectPatient: (patient: Patient) => void
  placeholder?: string
  className?: string
}

const ITEMS_PER_PAGE = 5

export function PatientSearchBar({
  onSelectPatient,
  placeholder = "Cari pasien (No. RM, NIK, nama, BPJS)...",
  className = ""
}: PatientSearchBarProps) {
  const { query, setQuery, suggestions, isLoading } = usePatientSearch()
  const [currentPage, setCurrentPage] = useState(1)
  const [isScanning, setIsScanning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Reset page when query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  // Keyboard shortcut Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const paginatedSuggestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return suggestions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [suggestions, currentPage])

  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE)

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient)
    setQuery('')
    setCurrentPage(1)
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Highlight match function with safety checks
  const highlightMatch = (text: string | undefined | null, query: string) => {
    if (!text || !query) return text || ''
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    try {
      const parts = text.split(regex)
      return parts.map((part, index) =>
        regex.test(part) ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-600">{part}</mark> : part
      )
    } catch {
      return text
    }
  }

  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Tidak dapat mengakses kamera. Pastikan memberikan izin kamera.')
    }
  }

  const stopQRScanner = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsScanning(false)
    }
  }

  const scanQRCode = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (context && videoRef.current.videoWidth > 0) {
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)

        // For demo purposes, we'll simulate QR detection
        // In real implementation, you'd use a QR library like jsQR
        const mockMRN = 'MRN' + Math.random().toString().slice(2, 8)
        setQuery(mockMRN)
        stopQRScanner()
      }
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="py-2 w-full pr-24" // Make room for buttons
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Scan QR Code"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Scan QR Code Pasien</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 bg-black rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <div className="text-center text-white">
                          <Camera className="mx-auto mb-2 text-2xl" />
                          <p className="text-sm">Kamera tidak aktif</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Alert>
                    <AlertDescription>
                      Arahkan kamera ke QR code yang terdapat di kartu pasien atau BPJS
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button onClick={startQRScanner} className="flex-1">
                        <Camera className="mr-2" />
                        Mulai Scan
                      </Button>
                    ) : (
                      <>
                        <Button onClick={scanQRCode} className="flex-1">
                          📸 Capture
                        </Button>
                        <Button variant="outline" onClick={stopQRScanner}>
                          Stop
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Table below search bar */}
      {(suggestions.length > 0 || isLoading) && (
        <div className="mt-4">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Mencari...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Tidak ada pasien ditemukan
            </div>
          ) : (
            <div className="p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-2 px-3 text-sm">Nama</TableHead>
                    <TableHead className="py-2 px-3 text-sm">No. RM</TableHead>
                    <TableHead className="py-2 px-3 text-sm">NIK</TableHead>
                    <TableHead className="py-2 px-3 text-sm">BPJS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSuggestions.map((patient: any) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSelect(patient)}
                    >
                      <TableCell className="py-2 px-3 text-sm font-medium">
                        {highlightMatch(patient.name, query)}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-sm">
                        {highlightMatch(patient.mrn, query)}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-sm">
                        {patient.nik ? highlightMatch(patient.nik.slice(-4), query) : 'N/A'}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-sm">
                        {patient.bpjs_number ? highlightMatch(patient.bpjs_number, query) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 px-2 py-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
