"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Clock, DollarSign, Check, RefreshCw } from "lucide-react"
import { getMesas } from "@/lib/data"

type EstadoMesa = "disponible" | "ocupada" | "reservada" | "cuenta"

interface Mesa {
  id: number
  numero: string
  capacidad: number
  estado: EstadoMesa
  mesero?: string
  clientes?: any[]
  pedidos?: any[]
  total?: number
  tiempoOcupada?: string
}

const MESAS_BASE = [
  { id: 1, numero: "1", capacidad: 4 },
  { id: 2, numero: "2", capacidad: 2 },
  { id: 3, numero: "3", capacidad: 6 },
  { id: 4, numero: "4", capacidad: 4 },
  { id: 5, numero: "5", capacidad: 8 },
  { id: 6, numero: "6", capacidad: 2 },
  { id: 7, numero: "7", capacidad: 4 },
  { id: 8, numero: "8", capacidad: 4 },
  { id: 9, numero: "9", capacidad: 6 },
  { id: 10, numero: "10", capacidad: 2 },
  { id: 11, numero: "11", capacidad: 4 },
  { id: 12, numero: "12", capacidad: 4 },
]

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  const cargarMesas = () => {
    const mesasActivas = getMesas()
    
    // Combinar mesas base con mesas activas
    const mesasCombinadas = MESAS_BASE.map((mesaBase) => {
      const mesaActiva = mesasActivas.find((m) => m.numero === mesaBase.numero)
      
      if (mesaActiva && mesaActiva.clientes && mesaActiva.clientes.length > 0) {
        // Mesa ocupada
        const total = mesaActiva.pedidos?.reduce((sum: number, p: any) => sum + (p.precio * p.cantidad), 0) || 0
        return {
          ...mesaBase,
          estado: "ocupada" as EstadoMesa,
          mesero: mesaActiva.mesero,
          clientes: mesaActiva.clientes,
          pedidos: mesaActiva.pedidos || [],
          total,
        }
      }
      
      // Mesa disponible
      return {
        ...mesaBase,
        estado: "disponible" as EstadoMesa,
      }
    })
    
    setMesas(mesasCombinadas)
  }

  useEffect(() => {
    cargarMesas()
    
    // Escuchar eventos de actualización de mesas
    const handleMesaActualizada = () => {
      cargarMesas()
    }
    
    window.addEventListener('mesa-actualizada', handleMesaActualizada)
    window.addEventListener('venta-registrada', handleMesaActualizada)
    window.addEventListener('mesa-liberada', handleMesaActualizada)
    
    // Actualizar cada 5 segundos
    const interval = setInterval(cargarMesas, 5000)
    
    return () => {
      window.removeEventListener('mesa-actualizada', handleMesaActualizada)
      window.removeEventListener('venta-registrada', handleMesaActualizada)
      window.removeEventListener('mesa-liberada', handleMesaActualizada)
      clearInterval(interval)
    }
  }, [])

  const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada").length
  const mesasDisponibles = mesas.filter((m) => m.estado === "disponible").length
  const totalVentas = mesas.reduce((acc, m) => acc + (m.total || 0), 0)

  const handleMesaClick = (mesa: Mesa) => {
    setMesaSeleccionada(mesa)
    setDialogAbierto(true)
  }

  const handleLiberarMesa = (mesaNumero: string) => {
    localStorage.removeItem(`mesa_${mesaNumero}`)
    cargarMesas()
    setDialogAbierto(false)
  }

  const getColorEstado = (estado: EstadoMesa) => {
    switch (estado) {
      case "disponible":
        return "bg-emerald-500/20 border-emerald-500"
      case "ocupada":
        return "bg-blue-500/20 border-blue-500"
      case "reservada":
        return "bg-amber-500/20 border-amber-500"
      case "cuenta":
        return "bg-purple-500/20 border-purple-500"
      default:
        return "bg-slate-700 border-slate-600"
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50">Gestión de Mesas</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Vista en tiempo real del estado de las mesas</p>
        </div>
        <Button onClick={cargarMesas} variant="outline" className="border-slate-700 text-slate-300 h-10 text-sm md:text-base w-full md:w-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left w-full">
                <p className="text-xs md:text-sm text-slate-400">Ocupadas</p>
                <p className="text-xl md:text-2xl font-bold text-slate-50">{mesasOcupadas}</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left w-full">
                <p className="text-xs md:text-sm text-slate-400">Disponibles</p>
                <p className="text-xl md:text-2xl font-bold text-slate-50">{mesasDisponibles}</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-4 h-4 md:w-6 md:h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left w-full">
                <p className="text-xs md:text-sm text-slate-400">Ocupación</p>
                <p className="text-xl md:text-2xl font-bold text-slate-50">{Math.round((mesasOcupadas / mesas.length) * 100)}%</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left w-full">
                <p className="text-xs md:text-sm text-slate-400">Ventas</p>
                <p className="text-xl md:text-2xl font-bold text-slate-50">${totalVentas.toFixed(0)}</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leyenda */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-emerald-500/20 border-2 border-emerald-500" />
              <span className="text-xs md:text-sm text-slate-300">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-blue-500/20 border-2 border-blue-500" />
              <span className="text-xs md:text-sm text-slate-300">Ocupada</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-amber-500/20 border-2 border-amber-500" />
              <span className="text-xs md:text-sm text-slate-300">Reservada</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-purple-500/20 border-2 border-purple-500" />
              <span className="text-xs md:text-sm text-slate-300">Cuenta</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Mesas */}
      <div className="space-y-3 md:space-y-4">
        {[
          ['8', '9', '17', '18', '19', '27'],
          ['28', '29', '7', '6', '16', '5'],
          ['15', '4', '14', '3', '13', '2'],
          ['22', '1', '21', '20', '30', '26'],
          ['25', '24', '23', '12', '11', '10']
        ].map((fila, filaIndex) => (
          <div key={filaIndex} className="grid gap-3 md:gap-4 grid-cols-6">
            {fila.map((num) => {
              const mesa = mesas.find(m => m.numero === num)
              return mesa ? (
          <Card
            key={mesa.id}
            className={`cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 ${getColorEstado(mesa.estado)}`}
            onClick={() => handleMesaClick(mesa)}
          >
            <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
              <div className="space-y-2 md:space-y-3">
                <div className="flex flex-col gap-2">
                  <span className="text-lg md:text-2xl font-bold text-slate-50">Mesa {mesa.numero}</span>
                  <Badge
                    className={`text-xs w-fit ${
                      mesa.estado === "disponible"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : mesa.estado === "ocupada"
                          ? "bg-blue-500/20 text-blue-500"
                          : mesa.estado === "reservada"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-purple-500/20 text-purple-500"
                    }`}
                  >
                    {mesa.estado}
                  </Badge>
                </div>

                <div className="text-xs md:text-sm text-slate-400 space-y-1">
                  <p>Cap: {mesa.capacidad}</p>
                  {mesa.mesero && <p className="truncate">Mesero: {mesa.mesero}</p>}
                  {mesa.clientes && mesa.clientes.length > 0 && (
                    <p>Clientes: {mesa.clientes.length}</p>
                  )}
                </div>

                {mesa.total !== undefined && mesa.total > 0 && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-base md:text-lg font-bold text-amber-500">${mesa.total.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
              ) : <div key={num} className="opacity-0"></div>
            })}
          </div>
        ))}
      </div>

      {/* Dialog de Detalles de Mesa */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          {mesaSeleccionada && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Mesa {mesaSeleccionada.numero}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Info de la Mesa */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Estado</p>
                    <Badge
                      className={`mt-1 ${
                        mesaSeleccionada.estado === "disponible"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : mesaSeleccionada.estado === "ocupada"
                            ? "bg-blue-500/20 text-blue-500"
                            : mesaSeleccionada.estado === "reservada"
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-purple-500/20 text-purple-500"
                      }`}
                    >
                      {mesaSeleccionada.estado}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Capacidad</p>
                    <p className="text-lg font-semibold text-slate-50 mt-1">
                      {mesaSeleccionada.clientes?.length || 0}/{mesaSeleccionada.capacidad} personas
                    </p>
                  </div>
                  {mesaSeleccionada.mesero && (
                    <div>
                      <p className="text-sm text-slate-400">Mesero</p>
                      <p className="text-lg font-semibold text-slate-50 mt-1">{mesaSeleccionada.mesero}</p>
                    </div>
                  )}
                </div>

                {/* Clientes */}
                {mesaSeleccionada.clientes && mesaSeleccionada.clientes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50 mb-3">Clientes en la Mesa</h3>
                    <div className="space-y-2">
                      {mesaSeleccionada.clientes.map((cliente: any) => (
                        <div key={cliente.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
                          <div className={`w-10 h-10 rounded-full ${cliente.color} flex items-center justify-center`}>
                            <span className="text-white font-bold">{cliente.nombre[0].toUpperCase()}</span>
                          </div>
                          <span className="text-slate-200">{cliente.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedidos */}
                {mesaSeleccionada.pedidos && mesaSeleccionada.pedidos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50 mb-3">Pedidos</h3>
                    <div className="space-y-2">
                      {mesaSeleccionada.pedidos.map((pedido: any) => {
                        const cliente = mesaSeleccionada.clientes?.find((c: any) => c.id === pedido.clienteId)
                        return (
                          <div
                            key={pedido.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-200">
                                {pedido.cantidad}x {pedido.producto}
                              </p>
                              {cliente && (
                                <p className="text-xs text-slate-400">Para: {cliente.nombre}</p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-slate-300">
                              ${(pedido.cantidad * pedido.precio).toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Total */}
                {mesaSeleccionada.total !== undefined && mesaSeleccionada.total > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border-2 border-amber-500/20">
                    <span className="text-lg font-semibold text-slate-200">Total</span>
                    <span className="text-2xl font-bold text-amber-500">${mesaSeleccionada.total.toFixed(2)}</span>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-2">
                  {mesaSeleccionada.estado === "ocupada" && (
                    <Button
                      onClick={() => handleLiberarMesa(mesaSeleccionada.numero)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Liberar Mesa
                    </Button>
                  )}
                  <Button
                    onClick={() => setDialogAbierto(false)}
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cerrar
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
