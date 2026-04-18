"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  UtensilsCrossed, DollarSign, Users, Clock, 
  TrendingUp, ShoppingCart, User
} from "lucide-react"

export default function MonitorPedidosPage() {
  const [mesas, setMesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarMesas()
    // Actualizar cada 3 segundos para tiempo real
    const interval = setInterval(cargarMesas, 3000)
    return () => clearInterval(interval)
  }, [])

  async function cargarMesas() {
    try {
      const { obtenerMesas } = await import('@/lib/supabase-clientes')
      const mesasData = await obtenerMesas()
      
      // Filtrar solo mesas ocupadas con pedidos
      const mesasConPedidos = mesasData.filter((m: any) => 
        m.estado === 'ocupada' && 
        m.pedidos_data && 
        Array.isArray(m.pedidos_data) &&
        m.pedidos_data.length > 0
      )
      
      setMesas(mesasConPedidos)
    } catch (error) {
      console.error('Error cargando mesas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Estadísticas
  const totalMesasActivas = mesas.length
  const totalVentas = mesas.reduce((sum, m) => sum + (m.total_actual || 0), 0)
  const ticketPromedio = totalMesasActivas > 0 ? totalVentas / totalMesasActivas : 0
  const totalProductos = mesas.reduce((sum, m) => {
    if (m.pedidos_data && Array.isArray(m.pedidos_data)) {
      return sum + m.pedidos_data.reduce((s: number, p: any) => s + (p.cantidad || 0), 0)
    }
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50 glow-amber">
          📊 Monitor de Pedidos en Tiempo Real
        </h1>
        <p className="text-slate-400 mt-1">
          Visualiza todos los pedidos activos • Actualización cada 3 segundos
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Mesas Activas</p>
                <p className="text-3xl font-bold text-blue-500">{totalMesasActivas}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total en Mesas</p>
                <p className="text-3xl font-bold text-emerald-500">
                  ${totalVentas.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ticket Promedio</p>
                <p className="text-3xl font-bold text-amber-500">
                  ${ticketPromedio.toFixed(0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Productos Pedidos</p>
                <p className="text-3xl font-bold text-purple-500">{totalProductos}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos */}
      <Card className="glass-hover border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-50">
            Pedidos Activos ({totalMesasActivas})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-slate-400 py-8">Cargando pedidos...</p>
          ) : mesas.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No hay pedidos activos</p>
              <p className="text-xs text-slate-500">
                Los pedidos aparecerán cuando los meseros agreguen productos
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {[
                  ['8', '9', '17', '18', '19', '27'],
                  ['28', '29', '7', '6', '16', '5'],
                  ['15', '4', '14', '3', '13', '2'],
                  ['22', '1', '21', '20', '30', '26'],
                  ['25', '24', '23', '12', '11', '10']
                ].map((fila, filaIndex) => (
                  <div key={filaIndex} className="grid gap-4 grid-cols-6">
                    {fila.map((num) => {
                      const mesa = mesas.find(m => m.numero === num)
                      return mesa ? (
                  <Card 
                    key={mesa.id}
                    className="glass border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                              Mesa {mesa.numero}
                            </Badge>
                            {mesa.hora_asignacion && (
                              <span className="text-xs text-slate-500">
                                {new Date(mesa.hora_asignacion).toLocaleTimeString('es-MX', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-50">
                            {mesa.cliente_nombre || 'Cliente'}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {mesa.numero_personas} persona{mesa.numero_personas !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-500">
                            ${(mesa.total_actual || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Lista de Productos */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                          <UtensilsCrossed className="w-4 h-4" />
                          <span>Pedido:</span>
                        </div>
                        {mesa.pedidos_data && Array.isArray(mesa.pedidos_data) && mesa.pedidos_data.map((item: any, index: number) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between text-sm glass rounded-lg p-2"
                          >
                            <div className="flex-1">
                              <p className="text-slate-200 font-medium">
                                {item.producto || item.nombre || 'Producto'}
                              </p>
                              <p className="text-xs text-slate-500">
                                x{item.cantidad} • ${item.precio}/u
                              </p>
                            </div>
                            <p className="text-slate-50 font-semibold">
                              ${((item.precio || 0) * (item.cantidad || 0)).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-slate-700" />

                      {/* Información adicional */}
                      <div className="space-y-1 text-sm">
                        {mesa.mesero && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <User className="w-4 h-4" />
                            <span>Mesero: {mesa.mesero}</span>
                          </div>
                        )}
                        {mesa.hostess && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <User className="w-4 h-4" />
                            <span>Hostess: {mesa.hostess}</span>
                          </div>
                        )}
                        {mesa.rp && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <User className="w-4 h-4" />
                            <span>RP: {mesa.rp}</span>
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
