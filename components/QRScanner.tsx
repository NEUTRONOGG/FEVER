"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, X, Keyboard } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [manualInput, setManualInput] = useState("")
  const [useManual, setUseManual] = useState(false)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!useManual) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [useManual])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setScanning(true)
          scanQRCode()
        }
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara. Usa entrada manual.")
      setUseManual(true)
      console.error("Error accessing camera:", err)
    }
  }

  function stopCamera() {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  async function scanQRCode() {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d", { willReadFrequently: true })

    if (!context) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        
        // Simulación de escaneo QR (en producción usar jsQR o similar)
        // Por ahora, detectamos patrones simples
        const data = detectQRPattern(imageData)
        if (data) {
          stopCamera()
          onScan(data)
        }
      }
    }

    scanIntervalRef.current = setInterval(scan, 100)
  }

  function detectQRPattern(imageData: ImageData): string | null {
    // Simulación simple - en producción usar jsQR
    // Por ahora retornamos null para que use entrada manual
    return null
  }

  function handleManualSubmit() {
    if (manualInput.trim()) {
      stopCamera()
      onScan(manualInput.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute -top-12 right-0 z-10 text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="bg-slate-900 rounded-lg p-6 space-y-4">
          <div className="text-center">
            {useManual ? (
              <Keyboard className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            ) : (
              <Camera className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            )}
            <h2 className="text-xl font-bold text-white">
              {useManual ? "Entrada Manual" : "Escanear QR"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {useManual 
                ? "Ingresa el teléfono del cliente" 
                : "Apunta la cámara al código QR del cliente"}
            </p>
          </div>

          {useManual ? (
            <div className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Teléfono (10 dígitos)"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  className="bg-slate-800 border-slate-700 text-white text-lg text-center"
                  maxLength={10}
                  autoFocus
                />
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={manualInput.length !== 10}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Buscar Cliente
              </Button>
              <Button
                onClick={() => setUseManual(false)}
                variant="outline"
                className="w-full border-slate-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Usar Cámara
              </Button>
            </div>
          ) : (
            <>
              {error ? (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center space-y-3">
                  <p className="text-red-400 text-sm">{error}</p>
                  <Button
                    onClick={() => setUseManual(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Usar Entrada Manual
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Overlay de escaneo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-4 border-blue-500 rounded-lg relative animate-pulse">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-center text-slate-500">
                      El escaneo se realizará automáticamente
                    </p>
                    <Button
                      onClick={() => setUseManual(true)}
                      variant="outline"
                      className="w-full border-slate-700 text-sm"
                    >
                      <Keyboard className="w-4 h-4 mr-2" />
                      Usar Entrada Manual
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
