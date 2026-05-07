"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign,
  Receipt,
  Users,
  TrendingUp,
  Search,
  Calendar,
  User,
  ShoppingBag,
} from "lucide-react"
export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any | null>(null)
  const [dialogDetalle, setDialogDetalle] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    cargarVentas()
    
    // Escuchar eventos de nuevas ventas
    const handleVentaRegistrada = () => {
      cargarVentas()
    }
    
    window.addEventListener('venta-registrada', handleVentaRegistrada)
    
    // Actualizar cada 10 segundos
    const interval = setInterval(cargarVentas, 10000)
    
    return () => {
      window.removeEventListener('venta-registrada', handleVentaRegistrada)
      clearInterval(interval)
    }
  }, [])

  const cargarVentas = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      // Normalizar formato
      const normalized = (data || []).map((t: any) => ({
        id: t.id,
        mesaId: t.mesa_id || null,
        mesaNumero: String(t.mesa_numero || '?'),
        mesero: t.mesero || t.rp_nombre || 'Sin asignar',
        fecha: t.created_at,
        total: parseFloat(t.total) || 0,
        estado: t.metodo_pago || 'completado',
        clientes: t.cliente_nombre
          ? [{ id: t.cliente_id || '0', nombre: t.cliente_nombre, items: Array.isArray(t.productos) ? t.productos.map((p: any) => ({ id: p.id || p.nombre, producto: p.nombre || p.producto, precio: p.precio || 0, cantidad: p.cantidad || 1 })) : [], total: parseFloat(t.total) || 0 }]
          : []
      }))
      setVentas(normalized)
    } catch (error) {
      console.error('Error cargando ventas:', error)
    }
  }

  const ventasFiltradas = ventas.filter((v) => {
    const searchLower = busqueda.toLowerCase()
    return (
      v.mesaNumero.includes(searchLower) ||
      v.mesero.toLowerCase().includes(searchLower) ||
      v.clientes.some((c: any) => c.nombre.toLowerCase().includes(searchLower))
    )
  })

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0)
  const totalClientes = ventas.reduce((sum, v) => sum + v.clientes.length, 0)
  const promedioVenta = ventas.length > 0 ? totalVentas / ventas.length : 0
  const ventasHoy = ventas.filter((v) => {
    const fecha = new Date(v.fecha)
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  })

  const handleVerDetalle = (venta: any) => {
    setVentaSeleccionada(venta)
    setDialogDetalle(true)
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Ventas y Consumo Individual</h1>
        <p className="text-slate-400 mt-1">Historial de ventas con detalle por cliente</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Ventas</p>
                <p className="text-2xl font-bold text-slate-50">${totalVentas.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ventas Hoy</p>
                <p className="text-2xl font-bold text-slate-50">{ventasHoy.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Clientes</p>
                <p className="text-2xl font-bold text-slate-50">{totalClientes}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Promedio por Venta</p>
                <p className="text-2xl font-bold text-slate-50">${promedioVenta.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Buscar por mesa, mesero o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-slate-100"
        />
      </div>

      {/* Lista de Ventas */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {ventasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No hay ventas registradas</p>
              <p className="text-sm text-slate-500 mt-2">
                Las ventas realizadas desde el POS aparecerán aquí
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {ventasFiltradas.map((venta) => (
                  <div
                    key={venta.id}
                    className="p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors"
                    onClick={() => handleVerDetalle(venta)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-blue-500/20 text-blue-500">Mesa {venta.mesaNumero}</Badge>
                          <Badge className="bg-slate-700 text-slate-300">
                            <User className="w-3 h-3 mr-1" />
                            {venta.mesero}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatearFecha(venta.fecha)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-500">${venta.total.toFixed(2)}</p>
                        <p className="text-sm text-slate-400">{venta.clientes.length} clientes</p>
                      </div>
                    </div>

                    {/* Vista previa de clientes */}
                    <div className="space-y-2">
                      {venta.clientes.map((cliente: any) => (
                        <div
                          key={cliente.id}
                          className="flex items-center justify-between p-2 rounded bg-slate-900/50"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-300">{cliente.nombre}</span>
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {cliente.items.length} productos
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-slate-300">
                            ${cliente.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detalle de Venta */}
      <Dialog open={dialogDetalle} onOpenChange={setDialogDetalle}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-3xl max-h-[90vh]">
          {ventaSeleccionada && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Detalle de Venta</DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6">
                  {/* Información General */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Mesa</p>
                      <p className="text-lg font-semibold text-slate-50">Mesa {ventaSeleccionada.mesaNumero}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Mesero</p>
                      <p className="text-lg font-semibold text-slate-50">{ventaSeleccionada.mesero}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Fecha y Hora</p>
                      <p className="text-lg font-semibold text-slate-50">
                        {formatearFecha(ventaSeleccionada.fecha)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Total Clientes</p>
                      <p className="text-lg font-semibold text-slate-50">{ventaSeleccionada.clientes.length}</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Consumo por Cliente */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Consumo Individual por Cliente
                    </h3>

                    <div className="space-y-4">
                      {ventaSeleccionada.clientes.map((cliente: any, index: number) => (
                        <div key={cliente.id} className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${
                                  [
                                    "bg-blue-500",
                                    "bg-emerald-500",
                                    "bg-purple-500",
                                    "bg-amber-500",
                                    "bg-pink-500",
                                  ][index % 5]
                                } flex items-center justify-center`}
                              >
                                <span className="text-white font-bold text-lg">
                                  {cliente.nombre[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-50">{cliente.nombre}</p>
                                <p className="text-sm text-slate-400">{cliente.items.length} productos</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-amber-500">${cliente.total.toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Productos del Cliente */}
                          <div className="space-y-2 ml-13">
                            {cliente.items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2 rounded bg-slate-900/50"
                              >
                                <div className="flex items-center gap-2">
                                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-300">
                                    {item.cantidad}x {item.producto}
                                  </span>
                                  <span className="text-xs text-slate-500">@ ${item.precio}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-300">
                                  ${(item.precio * item.cantidad).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Total */}
                  <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Total de la Venta</p>
                        <p className="text-3xl font-bold text-amber-500">${ventaSeleccionada.total.toFixed(2)}</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-500 text-lg px-4 py-2">
                        {ventaSeleccionada.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setDialogDetalle(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                >
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
