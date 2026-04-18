"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Clock, DollarSign, Check } from "lucide-react"
import { MesaCard } from "@/components/mesa-card"
import { PedidoDialog } from "@/components/pedido-dialog"

type EstadoMesa = "disponible" | "ocupada" | "reservada" | "cuenta"

interface Mesa {
  id: number
  numero: string
  capacidad: number
  estado: EstadoMesa
  mesero?: string
  clientes?: number
  pedidos?: Pedido[]
  total?: number
  tiempoOcupada?: string
}

interface Pedido {
  id: number
  producto: string
  cantidad: number
  precio: number
  estado: "pendiente" | "en-cocina" | "listo" | "entregado"
  notas?: string
}

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([
    // Mesas base
    { id: 1, numero: "1", capacidad: 4, estado: "disponible" },
    { id: 2, numero: "2", capacidad: 2, estado: "disponible" },
    { id: 3, numero: "3", capacidad: 6, estado: "disponible" },
    { id: 4, numero: "4", capacidad: 4, estado: "disponible" },
    { id: 5, numero: "5", capacidad: 8, estado: "disponible" },
    { id: 6, numero: "6", capacidad: 2, estado: "disponible" },
    { id: 7, numero: "7", capacidad: 4, estado: "disponible" },
    { id: 8, numero: "8", capacidad: 4, estado: "disponible" },
    { id: 9, numero: "9", capacidad: 6, estado: "disponible" },
    { id: 10, numero: "10", capacidad: 2, estado: "disponible" },
    { id: 11, numero: "11", capacidad: 4, estado: "disponible" },
    { id: 12, numero: "12", capacidad: 4, estado: "disponible" },
  ])
  
  const [mesasIniciales] = useState<Mesa[]>([
    {
      id: 1,
      numero: "1",
      capacidad: 4,
      estado: "ocupada",
      mesero: "Carlos",
      clientes: 3,
      total: 125.5,
      tiempoOcupada: "45 min",
      pedidos: [
        { id: 1, producto: "Hamburguesa Clásica", cantidad: 2, precio: 15, estado: "entregado" },
        { id: 2, producto: "Cerveza Corona", cantidad: 3, precio: 8, estado: "entregado" },
        { id: 3, producto: "Alitas Picantes", cantidad: 1, precio: 12, estado: "en-cocina" },
      ],
    },
    {
      id: 2,
      numero: "2",
      capacidad: 2,
      estado: "disponible",
    },
    {
      id: 3,
      numero: "3",
      capacidad: 6,
      estado: "cuenta",
      mesero: "Ana",
      clientes: 5,
      total: 210.0,
      tiempoOcupada: "1h 20min",
      pedidos: [
        { id: 4, producto: "Mojito", cantidad: 4, precio: 15, estado: "entregado" },
        { id: 5, producto: "Pizza Margarita", cantidad: 2, precio: 18, estado: "entregado" },
        { id: 6, producto: "Ensalada César", cantidad: 2, precio: 12, estado: "entregado" },
      ],
    },
    {
      id: 4,
      numero: "4",
      capacidad: 4,
      estado: "disponible",
    },
    {
      id: 5,
      numero: "5",
      capacidad: 8,
      estado: "reservada",
      mesero: "Luis",
      clientes: 8,
    },
    {
      id: 6,
      numero: "6",
      capacidad: 2,
      estado: "ocupada",
      mesero: "María",
      clientes: 2,
      total: 45.0,
      tiempoOcupada: "15 min",
      pedidos: [{ id: 7, producto: "Café Americano", cantidad: 2, precio: 5, estado: "listo" }],
    },
    {
      id: 7,
      numero: "7",
      capacidad: 4,
      estado: "disponible",
    },
    {
      id: 8,
      numero: "8",
      capacidad: 4,
      estado: "ocupada",
      mesero: "Carlos",
      clientes: 4,
      total: 95.0,
      tiempoOcupada: "30 min",
      pedidos: [
        { id: 8, producto: "Tacos al Pastor", cantidad: 3, precio: 12, estado: "en-cocina" },
        { id: 9, producto: "Margarita", cantidad: 2, precio: 20, estado: "entregado" },
      ],
    },
    {
      id: 9,
      numero: "9",
      capacidad: 6,
      estado: "disponible",
    },
    {
      id: 10,
      numero: "10",
      capacidad: 2,
      estado: "disponible",
    },
    {
      id: 11,
      numero: "11",
      capacidad: 4,
      estado: "disponible",
    },
    {
      id: 12,
      numero: "12",
      capacidad: 4,
      estado: "ocupada",
      mesero: "Ana",
      clientes: 3,
      total: 85.0,
      tiempoOcupada: "25 min",
      pedidos: [{ id: 10, producto: "Sushi Roll", cantidad: 2, precio: 25, estado: "pendiente" }],
    },
  ])

  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada").length
  const mesasDisponibles = mesas.filter((m) => m.estado === "disponible").length
  const totalVentas = mesas.reduce((acc, m) => acc + (m.total || 0), 0)

  const handleMesaClick = (mesa: Mesa) => {
    setMesaSeleccionada(mesa)
    setDialogAbierto(true)
  }

  const handleCambiarEstado = (mesaId: number, nuevoEstado: EstadoMesa) => {
    setMesas(
      mesas.map((m) =>
        m.id === mesaId
          ? {
              ...m,
              estado: nuevoEstado,
              ...(nuevoEstado === "disponible" && { mesero: undefined, clientes: undefined, total: 0, pedidos: [] }),
            }
          : m,
      ),
    )
    setDialogAbierto(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Gestión de Mesas</h1>
        <p className="text-slate-400 mt-1">Vista en tiempo real del estado de las mesas</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Mesas Ocupadas</p>
                <p className="text-2xl font-bold text-slate-50">{mesasOcupadas}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Disponibles</p>
                <p className="text-2xl font-bold text-slate-50">{mesasDisponibles}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ocupación</p>
                <p className="text-2xl font-bold text-slate-50">{Math.round((mesasOcupadas / mesas.length) * 100)}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ventas Activas</p>
                <p className="text-2xl font-bold text-slate-50">${totalVentas.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leyenda */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/20 border-2 border-emerald-500" />
              <span className="text-sm text-slate-300">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border-2 border-blue-500" />
              <span className="text-sm text-slate-300">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/20 border-2 border-amber-500" />
              <span className="text-sm text-slate-300">Reservada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/20 border-2 border-purple-500" />
              <span className="text-sm text-slate-300">Solicitó Cuenta</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Mesas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mesas.map((mesa) => (
          <MesaCard key={mesa.id} mesa={mesa} onClick={() => handleMesaClick(mesa)} />
        ))}
      </div>

      {/* Dialog de Detalles de Mesa */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      {mesaSeleccionada.clientes || 0}/{mesaSeleccionada.capacidad} personas
                    </p>
                  </div>
                  {mesaSeleccionada.mesero && (
                    <div>
                      <p className="text-sm text-slate-400">Mesero</p>
                      <p className="text-lg font-semibold text-slate-50 mt-1">{mesaSeleccionada.mesero}</p>
                    </div>
                  )}
                  {mesaSeleccionada.tiempoOcupada && (
                    <div>
                      <p className="text-sm text-slate-400">Tiempo</p>
                      <p className="text-lg font-semibold text-slate-50 mt-1">{mesaSeleccionada.tiempoOcupada}</p>
                    </div>
                  )}
                </div>

                {/* Pedidos */}
                {mesaSeleccionada.pedidos && mesaSeleccionada.pedidos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50 mb-3">Pedidos</h3>
                    <div className="space-y-2">
                      {mesaSeleccionada.pedidos.map((pedido) => (
                        <div
                          key={pedido.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-200">
                              {pedido.cantidad}x {pedido.producto}
                            </p>
                            <Badge
                              className={`mt-1 text-xs ${
                                pedido.estado === "pendiente"
                                  ? "bg-slate-700 text-slate-300"
                                  : pedido.estado === "en-cocina"
                                    ? "bg-amber-500/20 text-amber-500"
                                    : pedido.estado === "listo"
                                      ? "bg-blue-500/20 text-blue-500"
                                      : "bg-emerald-500/20 text-emerald-500"
                              }`}
                            >
                              {pedido.estado}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-slate-300">
                            ${(pedido.cantidad * pedido.precio).toFixed(2)}
                          </span>
                        </div>
                      ))}
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
                  {mesaSeleccionada.estado === "disponible" && (
                    <Button
                      onClick={() => handleCambiarEstado(mesaSeleccionada.id, "ocupada")}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Ocupar Mesa
                    </Button>
                  )}
                  {mesaSeleccionada.estado === "ocupada" && (
                    <>
                      <PedidoDialog mesaId={mesaSeleccionada.id} />
                      <Button
                        onClick={() => handleCambiarEstado(mesaSeleccionada.id, "cuenta")}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Solicitar Cuenta
                      </Button>
                    </>
                  )}
                  {mesaSeleccionada.estado === "cuenta" && (
                    <Button
                      onClick={() => handleCambiarEstado(mesaSeleccionada.id, "disponible")}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Cerrar Mesa
                    </Button>
                  )}
                  {mesaSeleccionada.estado !== "disponible" && (
                    <Button
                      onClick={() => handleCambiarEstado(mesaSeleccionada.id, "disponible")}
                      variant="outline"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Liberar Mesa
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
