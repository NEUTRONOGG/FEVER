"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Eye, Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function MenuQRPage() {
  const [qrSeleccionado, setQrSeleccionado] = useState<number | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  // Generar QRs para todas las mesas
  const mesas = Array.from({ length: 15 }, (_, i) => i + 1)

  const handleVerQR = (mesa: number) => {
    setQrSeleccionado(mesa)
    setDialogAbierto(true)
  }

  const handleDescargarQR = (mesa: number) => {
    // En producción, esto generaría y descargaría el QR real
    console.log(`Descargando QR para mesa ${mesa}`)
    alert(`QR de Mesa ${mesa} descargado`)
  }

  const handleImprimirQR = (mesa: number) => {
    // En producción, esto abriría el diálogo de impresión
    console.log(`Imprimiendo QR para mesa ${mesa}`)
    window.print()
  }

  const urlMenu = typeof window !== "undefined" ? `${window.location.origin}/menu` : "https://tu-dominio.com/menu"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Códigos QR del Menú</h1>
        <p className="text-slate-400 mt-1">Genera y descarga códigos QR para cada mesa</p>
      </div>

      {/* Instrucciones */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-500" />
            Cómo Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-300">
          <p>1. Cada mesa tiene un código QR único que los clientes pueden escanear</p>
          <p>2. Al escanear, acceden al menú digital desde su celular</p>
          <p>3. Pueden ver productos, agregar al carrito y enviar su pedido</p>
          <p>4. El pedido llega automáticamente al sistema vinculado a su mesa</p>
        </CardContent>
      </Card>

      {/* Grid de QRs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mesas.map((mesa) => (
          <Card key={mesa} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6 space-y-4">
              {/* QR Code Placeholder */}
              <div className="aspect-square bg-white rounded-lg p-4 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-600">Mesa {mesa}</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-50">Mesa {mesa}</h3>
                <p className="text-xs text-slate-500 mt-1 break-all">
                  {urlMenu}/{mesa}
                </p>
              </div>

              {/* Acciones */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleVerQR(mesa)}
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver QR
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleDescargarQR(mesa)}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleImprimirQR(mesa)}
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Vista Previa */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-md">
          {qrSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">QR Mesa {qrSeleccionado}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* QR Grande */}
                <div className="aspect-square bg-white rounded-lg p-8 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-32 h-32 text-slate-700 mx-auto mb-4" />
                      <p className="text-sm text-slate-600 font-semibold">Mesa {qrSeleccionado}</p>
                    </div>
                  </div>
                </div>

                {/* URL */}
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">URL del menú:</p>
                  <p className="text-sm text-slate-200 break-all font-mono">
                    {urlMenu}/{qrSeleccionado}
                  </p>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleDescargarQR(qrSeleccionado)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    onClick={() => handleImprimirQR(qrSeleccionado)}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
