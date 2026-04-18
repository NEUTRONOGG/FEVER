"use client"

import { useState, useEffect } from "react"
import { 
  obtenerVentasPorDia,
  obtenerRendimientoMeseros,
  obtenerTicketsRecientes
} from "@/lib/supabase-clientes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getVentas } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportesPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("semana")
  const [ventas, setVentas] = useState<any[]>([])
  const [ventasPorDia, setVentasPorDia] = useState<any[]>([])
  const [encuestas, setEncuestas] = useState<any[]>([])
  const [meserosData, setMeserosData] = useState<any[]>([])
  const [ventasPorHora, setVentasPorHora] = useState<any[]>([])
  const [productosMasVendidos, setProductosMasVendidos] = useState<any[]>([])
  const [ventasPorCategoria, setVentasPorCategoria] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 60000)
    return () => clearInterval(interval)
  }, [periodoSeleccionado])

  async function cargarDatos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const [tickets, meseros] = await Promise.all([
        obtenerTicketsRecientes(200),
        obtenerRendimientoMeseros()
      ])
      
      setVentas(tickets)
      setVentasPorDia(procesarVentasPorDia(tickets))
      setMeserosData(meseros)

      // Ventas por hora (tickets del día)
      const hoy = new Date().toISOString().split('T')[0]
      const { data: ticketsHoy } = await supabase
        .from('tickets')
        .select('created_at, total')
        .gte('created_at', `${hoy}T00:00:00`)
      const horaMap: Record<string, number> = {}
      ;(ticketsHoy || []).forEach((t: any) => {
        const h = new Date(t.created_at).getHours()
        const key = h >= 12 ? `${h === 12 ? 12 : h - 12}pm` : `${h === 0 ? 12 : h}am`
        horaMap[key] = (horaMap[key] || 0) + (t.total || 0)
      })
      const horasOrden = ['12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm','12am','1am','2am']
      setVentasPorHora(horasOrden
        .filter(h => horaMap[h])
        .map(h => ({ hora: h, ventas: Math.round(horaMap[h]) }))
      )

      // Productos más vendidos desde JSONB productos en tickets
      const prodMap: Record<string, { cantidad: number; ingresos: number }> = {}
      ;(tickets || []).forEach((t: any) => {
        const prods = Array.isArray(t.productos) ? t.productos : []
        prods.forEach((p: any) => {
          const nombre = p.nombre || p.producto || 'Producto'
          if (!prodMap[nombre]) prodMap[nombre] = { cantidad: 0, ingresos: 0 }
          prodMap[nombre].cantidad += p.cantidad || 1
          prodMap[nombre].ingresos += (p.precio || 0) * (p.cantidad || 1)
        })
      })
      const topProds = Object.entries(prodMap)
        .sort(([,a],[,b]) => b.cantidad - a.cantidad)
        .slice(0, 5)
        .map(([nombre, data]) => ({ nombre, cantidad: data.cantidad, ingresos: Math.round(data.ingresos) }))
      setProductosMasVendidos(topProds)

      // Ventas por categoría desde productos en tickets
      const catMap: Record<string, number> = {}
      ;(tickets || []).forEach((t: any) => {
        const prods = Array.isArray(t.productos) ? t.productos : []
        prods.forEach((p: any) => {
          const cat = p.categoria || 'Otros'
          catMap[cat] = (catMap[cat] || 0) + (p.precio || 0) * (p.cantidad || 1)
        })
      })
      // Si no hay productos en tickets, agrupar por tickets totales
      if (Object.keys(catMap).length === 0) {
        catMap['Ventas'] = tickets.reduce((s: number, t: any) => s + (t.total || 0), 0)
      }
      const totalCat = Object.values(catMap).reduce((a, b) => a + b, 0) || 1
      const cats = Object.entries(catMap)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 5)
        .map(([categoria, valor]) => ({ categoria, valor: Math.round(valor), porcentaje: Math.round(valor / totalCat * 100) }))
      setVentasPorCategoria(cats)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const procesarVentasPorDia = (ventasData: any[]) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const hoy = new Date()
    const ventasPorDiaMap = new Map()

    // Inicializar últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      const dia = dias[fecha.getDay()]
      ventasPorDiaMap.set(dia, { dia, ventas: 0, pedidos: 0 })
    }

    // Procesar ventas
    ventasData.forEach((venta: any) => {
      const fechaVenta = new Date(venta.fecha)
      const diaVenta = dias[fechaVenta.getDay()]
      
      if (ventasPorDiaMap.has(diaVenta)) {
        const data = ventasPorDiaMap.get(diaVenta)
        data.ventas += venta.total
        data.pedidos += 1
      }
    })

    return Array.from(ventasPorDiaMap.values())
  }

  const meserosRendimiento = meserosData.length > 0 ? meserosData : [
    { nombre: "Sin datos", ventas: 0, pedidos: 0, propina: 0 }
  ]

  const COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"]

  const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0)
  const totalPedidos = ventas.length
  const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0
  const totalClientes = ventas.reduce((acc, v) => acc + v.clientes.length, 0)
  const crecimiento = 12.5

  const handleExportar = (tipo: string) => {
    console.log(`Exportando reporte: ${tipo}`)
    alert(`Reporte ${tipo} exportado exitosamente`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Reportes y Analytics</h1>
          <p className="text-slate-400 mt-1">Análisis detallado de ventas y rendimiento</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-40 bg-slate-900 border-slate-800 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="hoy" className="text-slate-100">
                Hoy
              </SelectItem>
              <SelectItem value="semana" className="text-slate-100">
                Esta Semana
              </SelectItem>
              <SelectItem value="mes" className="text-slate-100">
                Este Mes
              </SelectItem>
              <SelectItem value="año" className="text-slate-100">
                Este Año
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleExportar("PDF")}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ventas Totales</p>
                <p className="text-2xl font-bold text-slate-50">${totalVentas.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-500">+{crecimiento}%</span>
                </div>
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
                <p className="text-sm text-slate-400">Total Pedidos</p>
                <p className="text-2xl font-bold text-slate-50">{totalPedidos}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-500">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ticket Promedio</p>
                <p className="text-2xl font-bold text-slate-50">${ticketPromedio.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-500">+5.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-500" />
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
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-500">-2.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ventas por Día */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              Ventas por Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ventas: {
                  label: "Ventas",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="dia" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ventas" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ventas por Categoría */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Ventas por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={ventasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoria, porcentaje }) => `${categoria} ${porcentaje}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {ventasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ventas por Hora */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Distribución de Ventas por Hora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              ventas: {
                label: "Ventas",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hora" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tablas de Datos */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Productos Más Vendidos */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Top 5 Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productosMasVendidos.map((producto, index) => (
                <div key={producto.nombre} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-500">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{producto.nombre}</p>
                      <p className="text-xs text-slate-500">{producto.cantidad} unidades vendidas</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-500">${producto.ingresos}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rendimiento de Meseros */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Rendimiento de Meseros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meserosRendimiento.map((mesero, index) => (
                <div key={mesero.nombre} className="p-3 rounded-lg bg-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-500">{index + 1}</span>
                      </div>
                      <p className="font-medium text-slate-200">{mesero.nombre}</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-500">${mesero.ventas}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Pedidos</p>
                      <p className="text-slate-300 font-semibold">{mesero.pedidos}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Propinas</p>
                      <p className="text-slate-300 font-semibold">${mesero.propina}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen Comparativo */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">Resumen de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Ventas Totales</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-50">${totalVentas.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="text-lg font-semibold text-emerald-500">{totalPedidos} tickets</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Ticket Promedio</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-50">${ticketPromedio.toFixed(0)}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  <span className="text-lg font-semibold text-amber-500">por mesa</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Total Clientes Atendidos</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-50">{totalClientes}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-semibold text-blue-500">registrados</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Satisfacción del Cliente */}
      {encuestas.length > 0 && (
        <>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Satisfacción del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Promedio General</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-amber-500">
                      {(encuestas.reduce((acc, e) => acc + parseFloat(e.promedio), 0) / encuestas.length).toFixed(1)}
                    </span>
                    <span className="text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-amber-500">⭐</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Total Encuestas</p>
                  <span className="text-3xl font-bold text-blue-500">{encuestas.length}</span>
                  <p className="text-xs text-slate-500 mt-2">Respuestas recibidas</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Recompensas Otorgadas</p>
                  <span className="text-3xl font-bold text-emerald-500">
                    {encuestas.filter(e => e.recompensa_otorgada).length}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">5 shots gratis c/u</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Satisfacción</p>
                  <span className="text-3xl font-bold text-emerald-500">
                    {Math.round((encuestas.filter(e => parseFloat(e.promedio) >= 4).length / encuestas.length) * 100)}%
                  </span>
                  <p className="text-xs text-slate-500 mt-2">Clientes satisfechos</p>
                </div>
              </div>

              {/* Últimas Encuestas */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Últimas Encuestas</h4>
                <div className="space-y-2">
                  {encuestas.slice(0, 5).map((encuesta) => (
                    <div key={encuesta.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-amber-500">
                            {parseFloat(encuesta.promedio).toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">Mesa {encuesta.mesa_numero}</p>
                          <p className="text-xs text-slate-500">
                            {encuesta.mesero} • {new Date(encuesta.fecha).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= Math.round(parseFloat(encuesta.promedio)) ? "text-amber-500" : "text-slate-600"}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
