'use client'

import { useRef, useCallback, useState } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { FaCamera, FaRedo, FaCheck } from 'react-icons/fa'

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void
  capturedImage?: string | null
  className?: string
}

export function WebcamCapture({ onCapture, capturedImage, className = "" }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const capture = useCallback(() => {
    setIsCapturing(true)
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
    }
    setIsCapturing(false)
  }, [webcamRef, onCapture])

  const retake = useCallback(() => {
    onCapture('')
  }, [onCapture])

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {!capturedImage ? (
        <div className="space-y-4">
          <div className="relative">
            <Webcam
              audio={false}
              height={240}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              videoConstraints={videoConstraints}
              className="rounded-lg border border-gray-300 dark:border-gray-600"
            />
          </div>
          <Button
            onClick={capture}
            disabled={isCapturing}
            className="w-full"
          >
            <FaCamera className="mr-2" />
            {isCapturing ? 'Mengambil Foto...' : 'Ambil Foto'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="rounded-lg border border-gray-300 dark:border-gray-600 w-full max-w-xs mx-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={retake}
              variant="outline"
              className="flex-1"
            >
              <FaRedo className="mr-2" />
              Ambil Ulang
            </Button>
            <Button
              onClick={() => onCapture(capturedImage)}
              className="flex-1"
            >
              <FaCheck className="mr-2" />
              Gunakan Foto
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}