"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  UtensilsCrossed, DollarSign, Users, Clock,
  TrendingUp, Receipt
} from "lucide-react"
import { obtenerMesas } from "@/lib/supabase-clientes"

export default function MesasConsumoPage() {
  const [mesas, setMesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarMesas()
    // Actualizar cada 5 segundos
    const interval = setInterval(cargarMesas, 5000)
    return () => clearInterval(interval)
  }, [])

  async function cargarMesas() {
    try {
      const data = await obtenerMesas()
      setMesas(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada')
  const mesasReservadas = mesas.filter(m => m.estado === 'reservada')
  const totalConsumo = mesasOcupadas.reduce((sum, m) => sum + (m.total_actual || 0), 0)

  const getEstadoColor = (estado: string) => {
    const colores = {
      disponible: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
      ocupada: "bg-red-500/20 text-red-500 border-red-500/30",
      reservada: "bg-amber-500/20 text-amber-500 border-amber-500/30",
      limpieza: "bg-blue-500/20 text-blue-500 border-blue-500/30"
    }
    return colores[estado as keyof typeof colores] || colores.disponible
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50 glow-amber">
          Consumo por Mesa
        </h1>
        <p className="text-slate-400 mt-1">
          Monitoreo en tiempo real del consumo de todas las mesas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Mesas Ocupadas</p>
                <p className="text-3xl font-bold text-red-500">{mesasOcupadas.length}</p>
              </div>
              <UtensilsCrossed className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Mesas Reservadas</p>
                <p className="text-3xl font-bold text-amber-500">{mesasReservadas.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Consumo Total</p>
                <p className="text-3xl font-bold text-emerald-500">${totalConsumo.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Promedio/Mesa</p>
                <p className="text-3xl font-bold text-blue-500">
                  ${mesasOcupadas.length > 0 ? (totalConsumo / mesasOcupadas.length).toFixed(0) : '0'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mesas Grid */}
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
            className="glass-hover border-0 shadow-none bg-transparent"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-50 text-xl">
                  Mesa {mesa.numero}
                </CardTitle>
                <Badge className={getEstadoColor(mesa.estado)}>
                  {mesa.estado.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info básica */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Capacidad:</span>
                  <span className="text-slate-200">{mesa.capacidad} personas</span>
                </div>

                {mesa.estado === 'ocupada' && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Cliente:</span>
                      <span className="text-slate-200 font-semibold">
                        {mesa.cliente_nombre || 'Sin nombre'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Personas:</span>
                      <span className="text-slate-200">
                        <Users className="w-4 h-4 inline mr-1" />
                        {mesa.numero_personas}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Hostess:</span>
                      <span className="text-slate-200">{mesa.hostess || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Mesero:</span>
                      <span className="text-slate-200">{mesa.mesero || '-'}</span>
                    </div>

                    {mesa.hora_entrada && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Entrada:</span>
                        <span className="text-slate-200">
                          {new Date(mesa.hora_entrada).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {mesa.estado === 'reservada' && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Reserva:</span>
                      <span className="text-slate-200 font-semibold">
                        {mesa.cliente_nombre || 'Sin nombre'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Personas:</span>
                      <span className="text-slate-200">{mesa.numero_personas}</span>
                    </div>

                    {mesa.hora_entrada && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Hora:</span>
                        <span className="text-slate-200">
                          {new Date(mesa.hora_entrada).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}

                    {mesa.notas && (
                      <div className="text-sm">
                        <span className="text-slate-400">Notas:</span>
                        <p className="text-slate-200 mt-1">{mesa.notas}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Consumo */}
              {mesa.estado === 'ocupada' && (
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-500" />
                      <span className="text-slate-400">Consumo:</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-500">
                      ${(mesa.total_actual || 0).toFixed(2)}
                    </span>
                  </div>

                  {mesa.pedidos_data && mesa.pedidos_data.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2">Productos:</p>
                      <div className="space-y-1">
                        {mesa.pedidos_data.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              {item.cantidad}x {item.producto}
                            </span>
                            <span className="text-slate-300">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {mesa.pedidos_data.length > 3 && (
                          <p className="text-xs text-slate-500 italic">
                            +{mesa.pedidos_data.length - 3} productos más
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mesa.estado === 'disponible' && (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">Mesa disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
              ) : <div key={num} className="opacity-0"></div>
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
