"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, UserCheck, Clock, Award, Flame, Heart, AlertCircle, ChefHat } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"
import { 
  obtenerClientesActivos, 
  obtenerVisitasHoy,
  obtenerTopClientes,
  obtenerMetricasGenero,
  calcularTicketPromedio,
  obtenerClientesConRachas
} from "@/lib/supabase-clientes"

export default function DashboardPage() {
  const [clientesActivos, setClientesActivos] = useState<any[]>([])
  const [visitasHoy, setVisitasHoy] = useState<any[]>([])
  const [topClientes, setTopClientes] = useState<any[]>([])
  const [metricasGenero, setMetricasGenero] = useState<any>({})
  const [ticketPromedio, setTicketPromedio] = useState(0)
  const [clientesConRachas, setClientesConRachas] = useState<any[]>([])
  const [consumosPorHora, setConsumosPorHora] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
    // Actualizar cada 5 segundos para tiempo real
    const interval = setInterval(cargarDatos, 5000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatos() {
    try {
      const [clientes, visitas, top, metricas, ticket, rachas] = await Promise.all([
        obtenerClientesActivos(),
        obtenerVisitasHoy(),
        obtenerTopClientes(5),
        obtenerMetricasGenero(),
        calcularTicketPromedio(),
        obtenerClientesConRachas()
      ])
      
      setClientesActivos(clientes)
      setVisitasHoy(visitas)
      setTopClientes(top)
      setMetricasGenero(metricas)
      setTicketPromedio(ticket)
      setClientesConRachas(rachas)
      
      // Cargar consumos por hora
      await cargarConsumosPorHora()
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cargarConsumosPorHora() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Obtener tickets del día actual
      const hoy = new Date().toISOString().split('T')[0]
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('created_at, total')
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`)
      
      if (error) {
        console.error('Error cargando tickets:', error)
        return
      }

      // Agrupar por hora
      const consumosPorHoraMap: { [key: string]: number } = {}
      
      tickets?.forEach((ticket: any) => {
        const hora = new Date(ticket.created_at).getHours()
        const horaKey = hora >= 12 ? `${hora === 12 ? 12 : hora - 12}pm` : `${hora === 0 ? 12 : hora}am`
        
        if (!consumosPorHoraMap[horaKey]) {
          consumosPorHoraMap[horaKey] = 0
        }
        consumosPorHoraMap[horaKey] += ticket.total || 0
      })

      // Convertir a array y ordenar
      const horasOrden = ['12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm', '12am', '1am', '2am']
      const consumosArray = horasOrden.map(hora => ({
        hour: hora,
        consumo: Math.round(consumosPorHoraMap[hora] || 0)
      })).filter(item => item.consumo > 0 || horasOrden.indexOf(item.hour) >= horasOrden.indexOf('12pm'))

      setConsumosPorHora(consumosArray)
    } catch (error) {
      console.error('Error calculando consumos por hora:', error)
    }
  }

  const stats = [
    {
      title: "Clientes Activos",
      value: loading ? "..." : clientesActivos.length.toString(),
      change: "+18 esta semana",
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Visitas Hoy",
      value: loading ? "..." : visitasHoy.length.toString(),
      change: "Visitas registradas",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Ticket Promedio",
      value: loading ? "..." : `$${ticketPromedio.toFixed(0)}`,
      change: "+12.5% vs mes anterior",
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Clientes con Racha",
      value: loading ? "..." : clientesConRachas.length.toString(),
      change: "Visitando consecutivamente",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  // Métricas por género (datos reales de Supabase)
  const metricasGeneroDisplay = [
    { 
      genero: "Masculino", 
      clientes: metricasGenero.masculino?.total_clientes || 0, 
      consumo: metricasGenero.masculino?.consumo_total || 0, 
      promedio: Math.round(metricasGenero.masculino?.consumo_promedio || 0)
    },
    { 
      genero: "Femenino", 
      clientes: metricasGenero.femenino?.total_clientes || 0, 
      consumo: metricasGenero.femenino?.consumo_total || 0, 
      promedio: Math.round(metricasGenero.femenino?.consumo_promedio || 0)
    },
  ]

  const topClientesDisplay = topClientes.map(cliente => ({
    nombre: cliente.nombre,
    visitas: cliente.total_visitas,
    consumo: `$${cliente.consumo_total.toLocaleString()}`,
    nivel: cliente.nivel_fidelidad
  }))

  // Actividad reciente de clientes (datos reales)
  const actividadReciente = clientesActivos.slice(0, 4).map(cliente => ({
    cliente: cliente.cliente_nombre || 'Cliente',
    mesa: `Mesa ${cliente.numero}`,
    accion: cliente.estado === 'ocupada' ? 'Check-in' : `Visita #${cliente.total_visitas || 1}`,
    tiempo: cliente.hora_asignacion ? `Hace ${Math.floor((Date.now() - new Date(cliente.hora_asignacion).getTime()) / 60000)} min` : 'Ahora'
  }))

  // Notificaciones importantes (datos reales)
  const notificaciones = [
    { 
      tipo: "racha", 
      mensaje: `${clientesConRachas.length} clientes están por completar racha de fin de semana`, 
      urgencia: clientesConRachas.length > 0 ? "media" : "baja" 
    },
    { 
      tipo: "activos", 
      mensaje: `${clientesActivos.length} clientes activos en el restaurante ahora`, 
      urgencia: clientesActivos.length > 10 ? "alta" : "media" 
    },
  ].filter(n => n.urgencia !== "baja")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Dashboard</h1>
          <p className="text-slate-400">Resumen general del restaurante</p>
        </div>
        <NotificacionesEmergencia />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="glass-hover rounded-2xl overflow-hidden">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center backdrop-blur-sm`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-50">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Consumos por Hora Chart */}
        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Consumos por Hora
              </CardTitle>
              <p className="text-sm text-slate-400">
                Ingresos del día • Total: ${consumosPorHora.reduce((sum, item) => sum + item.consumo, 0).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  consumo: {
                    label: "Consumo",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumosPorHora}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#94a3b8" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass rounded-lg p-3 border border-emerald-500/30">
                              <p className="text-xs text-slate-400">{payload[0].payload.hour}</p>
                              <p className="text-lg font-bold text-emerald-500">
                                ${payload[0].value?.toLocaleString()}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="consumo"
                      fill="oklch(0.68 0.19 156)"
                      radius={[8, 8, 0, 0]}
                      filter="drop-shadow(0 0 12px oklch(0.68 0.19 156 / 0.4))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Clientes */}
        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50">Top Clientes VIP</CardTitle>
              <p className="text-sm text-slate-400">Mayor consumo del mes</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClientesDisplay.map((cliente, index) => (
                  <div key={cliente.nombre} className="flex items-center justify-between glass rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{cliente.nombre}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">{cliente.visitas} visitas</p>
                          <Badge variant="outline" className="text-xs capitalize">{cliente.nivel}</Badge>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-500">{cliente.consumo}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity and Alerts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Actividad de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actividadReciente.map((activity, index) => (
                  <div key={index} className="glass rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-200">{activity.cliente}</p>
                        <p className="text-xs text-slate-400">{activity.mesa} • {activity.accion}</p>
                        <p className="text-xs text-slate-500">{activity.tiempo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notificaciones */}
        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Notificaciones CRM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notificaciones.map((notif, index) => (
                  <div
                    key={index}
                    className={`glass rounded-xl p-3 border ${
                      notif.urgencia === "alta"
                        ? "border-red-500/30"
                        : notif.urgencia === "media"
                          ? "border-amber-500/30"
                          : "border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          notif.urgencia === "alta"
                            ? "bg-red-500 shadow-lg shadow-red-500/50"
                            : notif.urgencia === "media"
                              ? "bg-amber-500 shadow-lg shadow-amber-500/50"
                              : "bg-blue-500 shadow-lg shadow-blue-500/50"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-200">{notif.mensaje}</p>
                        <p className="text-xs text-slate-500 mt-1 capitalize">Urgencia: {notif.urgencia}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas por Género */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50">Métricas por Género</CardTitle>
            <p className="text-sm text-slate-400">Distribución de clientes y consumo</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {metricasGeneroDisplay.map((metrica: any) => (
                <div key={metrica.genero} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-200">{metrica.genero}</h3>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Clientes</span>
                      <span className="text-sm font-semibold text-slate-200">{metrica.clientes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Consumo Total</span>
                      <span className="text-sm font-semibold text-emerald-500">${metrica.consumo.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Ticket Promedio</span>
                      <span className="text-sm font-semibold text-amber-500">${metrica.promedio}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { 
            icon: Award, 
            label: "Clientes VIP", 
            value: loading ? "..." : topClientes.filter(c => c.nivel_fidelidad === 'oro' || c.nivel_fidelidad === 'platino' || c.nivel_fidelidad === 'diamante').length.toString(), 
            color: "purple" 
          },
          { 
            icon: Heart, 
            label: "Satisfacción", 
            value: loading ? "..." : topClientes.length > 0 
              ? `${(topClientes.reduce((sum, c) => sum + (c.calificacion_promedio || 0), 0) / topClientes.length).toFixed(1)}/5`
              : "0/5", 
            color: "pink" 
          },
          { 
            icon: Flame, 
            label: "Rachas Activas", 
            value: loading ? "..." : clientesConRachas.length.toString(), 
            color: "orange" 
          },
        ].map((item) => (
          <div key={item.label} className="glass-hover rounded-2xl overflow-hidden">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center backdrop-blur-sm`}
                  >
                    <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-50">{item.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
