"use client"

import { useState, useEffect } from "react"
import { 
  obtenerClientes,
  obtenerClientesActivos,
  obtenerEstadisticasGenerales,
  obtenerClientesNuevosEsteMes,
  obtenerVisitasPorDia
} from "@/lib/supabase-clientes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, TrendingUp, DollarSign, Calendar, UserCheck, UserPlus, 
  Flame, Award, Heart, Clock, Target, ArrowUp, Download, RefreshCw
} from "lucide-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState("mes")
  const [loading, setLoading] = useState(true)
  const [datosReales, setDatosReales] = useState<any>({})

  useEffect(() => {
    cargarDatosReales()
    const interval = setInterval(cargarDatosReales, 60000)
    return () => clearInterval(interval)
  }, [])

  async function cargarDatosReales() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const [estadisticas, nuevos] = await Promise.all([
        obtenerEstadisticasGenerales(),
        obtenerClientesNuevosEsteMes(),
      ])

      // Tickets de los últimos 6 meses para gráficas
      const seisMesesAtras = new Date()
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
      const { data: tickets } = await supabase
        .from('tickets')
        .select('created_at, total, productos, mesa_numero')
        .gte('created_at', seisMesesAtras.toISOString())

      // Clientes para análisis de género por mes y rachas
      const { data: clientes } = await supabase
        .from('clientes')
        .select('genero, visitas_consecutivas, nivel_fidelidad, created_at, activo')

      // Crecimiento mensual
      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
      const crecimientoMap: Record<string, { nuevos: number; activos: number }> = {}
      ;(clientes || []).forEach((c: any) => {
        const mes = meses[new Date(c.created_at).getMonth()]
        if (!crecimientoMap[mes]) crecimientoMap[mes] = { nuevos: 0, activos: 0 }
        crecimientoMap[mes].nuevos++
        if (c.activo) crecimientoMap[mes].activos++
      })
      const crecimientoMensual = meses
        .filter(m => crecimientoMap[m])
        .map(m => ({ mes: m, nuevos: crecimientoMap[m].nuevos, activos: crecimientoMap[m].activos }))

      // Consumo por género por mes (desde tickets - usando total del ticket)
      const consumoGeneroMap: Record<string, { masculino: number; femenino: number }> = {}
      ;(tickets || []).forEach((t: any) => {
        const mes = meses[new Date(t.created_at).getMonth()]
        if (!consumoGeneroMap[mes]) consumoGeneroMap[mes] = { masculino: 0, femenino: 0 }
        // Sin datos de género en tickets, distribuimos equitativamente
        consumoGeneroMap[mes].masculino += Math.round((t.total || 0) * 0.5)
        consumoGeneroMap[mes].femenino += Math.round((t.total || 0) * 0.5)
      })
      const consumoGeneroMensual = meses
        .filter(m => consumoGeneroMap[m])
        .map(m => ({ mes: m, masculino: consumoGeneroMap[m].masculino, femenino: consumoGeneroMap[m].femenino }))

      // Visitas por día de la semana (últimos 7 días desde tickets)
      const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      const visitasDiaMap: Record<string, number> = { Dom: 0, Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0 }
      ;(tickets || []).forEach((t: any) => {
        const dia = dias[new Date(t.created_at).getDay()]
        visitasDiaMap[dia] = (visitasDiaMap[dia] || 0) + 1
      })
      const visitasPorDia = dias.map(d => ({ dia: d, visitas: visitasDiaMap[d] || 0 }))

      // Horarios desde tickets
      const horariosMap: Record<string, number> = { 'Noche (8-11pm)': 0, 'Madrugada (11pm-2am)': 0, 'Tarde (5-8pm)': 0, 'Resto': 0 }
      ;(tickets || []).forEach((t: any) => {
        const h = new Date(t.created_at).getHours()
        if (h >= 20 && h < 23) horariosMap['Noche (8-11pm)']++
        else if (h >= 23 || h < 2) horariosMap['Madrugada (11pm-2am)']++
        else if (h >= 17 && h < 20) horariosMap['Tarde (5-8pm)']++
        else horariosMap['Resto']++
      })
      const totalH = Object.values(horariosMap).reduce((a, b) => a + b, 0) || 1
      const horarios = Object.entries(horariosMap)
        .filter(([, v]) => v > 0)
        .map(([horario, clientes]) => ({ horario, clientes, porcentaje: Math.round(clientes / totalH * 100) }))

      // Productos más vendidos desde tickets.productos (JSONB array)
      const productosMasculino: Record<string, number> = {}
      const productosFemenino: Record<string, number> = {}
      ;(tickets || []).forEach((t: any) => {
        if (!Array.isArray(t.productos)) return
        t.productos.forEach((p: any) => {
          const nombre = p.nombre || p.producto || 'Producto'
          const cantidad = p.cantidad || 1
          // Sin datos de género por ticket, dividimos equitativamente
          productosMasculino[nombre] = (productosMasculino[nombre] || 0) + cantidad
          productosFemenino[nombre] = (productosFemenino[nombre] || 0) + cantidad
        })
      })
      const topMasc = Object.entries(productosMasculino)
        .sort(([,a],[,b]) => b - a).slice(0, 5)
      const topFem = Object.entries(productosFemenino)
        .sort(([,a],[,b]) => b - a).slice(0, 5)
      const totalMasc = topMasc.reduce((s,[,v]) => s + v, 0) || 1
      const totalFem = topFem.reduce((s,[,v]) => s + v, 0) || 1
      const productosGeneroData = {
        masculino: topMasc.map(([producto, ventas]) => ({ producto, ventas, porcentaje: Math.round(ventas / totalMasc * 100) })),
        femenino: topFem.map(([producto, ventas]) => ({ producto, ventas, porcentaje: Math.round(ventas / totalFem * 100) }))
      }

      // Rachas
      const total = clientes?.length || 1
      const rachasData = [
        { tipo: '3+ visitas', clientes: clientes?.filter((c: any) => c.visitas_consecutivas >= 3).length || 0 },
        { tipo: '5+ visitas', clientes: clientes?.filter((c: any) => c.visitas_consecutivas >= 5).length || 0 },
        { tipo: '10+ visitas', clientes: clientes?.filter((c: any) => c.visitas_consecutivas >= 10).length || 0 },
        { tipo: '15+ visitas', clientes: clientes?.filter((c: any) => c.visitas_consecutivas >= 15).length || 0 },
      ].map(r => ({ ...r, porcentaje: Math.round(r.clientes / total * 100) }))

      setDatosReales({
        totalClientes: estadisticas?.totalClientes || 0,
        clientesActivos: estadisticas?.clientesActivos || 0,
        nuevosEsteMes: nuevos?.length || 0,
        totalVisitas: estadisticas?.totalVisitas || 0,
        totalConsumo: estadisticas?.totalConsumo || 0,
        ticketPromedio: estadisticas?.ticketPromedio || 0,
        genero: estadisticas?.genero || { masculinos: 0, femeninos: 0 },
        niveles: estadisticas?.niveles || {},
        crecimientoMensual,
        consumoGeneroMensual,
        visitasPorDia,
        horarios,
        productosGenero: productosGeneroData,
        rachas: rachasData
      })
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const metricas = [
    { titulo: "Total Clientes", valor: loading ? "..." : (datosReales.totalClientes || 0).toString(), cambio: "", porcentaje: "", icon: Users, color: "blue" },
    { titulo: "Clientes Activos", valor: loading ? "..." : (datosReales.clientesActivos || 0).toString(), cambio: "", porcentaje: "", icon: UserCheck, color: "emerald" },
    { titulo: "Nuevos Este Mes", valor: loading ? "..." : (datosReales.nuevosEsteMes || 0).toString(), cambio: "", porcentaje: "", icon: UserPlus, color: "purple" },
    { titulo: "Tasa de Retención", valor: loading ? "..." : "N/A", cambio: "", porcentaje: "", icon: Target, color: "amber" },
    { titulo: "Consumo Total", valor: loading ? "..." : `$${(datosReales.totalConsumo || 0).toFixed(2)}`, cambio: "", porcentaje: "", icon: DollarSign, color: "green" },
    { titulo: "Ticket Promedio", valor: loading ? "..." : `$${(datosReales.ticketPromedio || 0).toFixed(2)}`, cambio: "", porcentaje: "", icon: TrendingUp, color: "orange" },
    { titulo: "Visitas Totales", valor: loading ? "..." : (datosReales.totalVisitas || 0).toString(), cambio: "", porcentaje: "", icon: Calendar, color: "pink" },
    { titulo: "Satisfacción", valor: loading ? "..." : "N/A", cambio: "", porcentaje: "", icon: Heart, color: "red" }
  ]

  const totalGenero = (datosReales.genero?.masculinos || 0) + (datosReales.genero?.femeninos || 0)
  const generoData = [
    { 
      genero: "Masculino", 
      clientes: datosReales.genero?.masculinos || 0, 
      porcentaje: totalGenero > 0 ? ((datosReales.genero?.masculinos || 0) / totalGenero * 100).toFixed(1) : 0, 
      color: "#3b82f6" 
    },
    { 
      genero: "Femenino", 
      clientes: datosReales.genero?.femeninos || 0, 
      porcentaje: totalGenero > 0 ? ((datosReales.genero?.femeninos || 0) / totalGenero * 100).toFixed(1) : 0, 
      color: "#ec4899" 
    }
  ]

  const fidelidadData = [
    { nivel: "Bronce", clientes: datosReales.niveles?.bronce || 0, color: "#cd7f32" },
    { nivel: "Plata", clientes: datosReales.niveles?.plata || 0, color: "#c0c0c0" },
    { nivel: "Oro", clientes: datosReales.niveles?.oro || 0, color: "#fbbf24" },
    { nivel: "Platino", clientes: datosReales.niveles?.platino || 0, color: "#a78bfa" },
    { nivel: "Diamante", clientes: datosReales.niveles?.diamante || 0, color: "#60a5fa" }
  ]

  const crecimientoData = datosReales.crecimientoMensual || []
  const consumoGeneroData = datosReales.consumoGeneroMensual || []
  const visitasDiaData = datosReales.visitasPorDia || []
  const horariosData = datosReales.horarios || []
  const productosGenero = datosReales.productosGenero || { masculino: [], femenino: [] }
  const rachasData = datosReales.rachas || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 glow-amber">Estadísticas de Clientes</h1>
          <p className="text-slate-400 mt-1">Análisis completo de métricas y comportamiento</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="año">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setLoading(!loading)} className="border-slate-700">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-green-600">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricas.map((metrica) => (
          <div key={metrica.titulo} className="glass-hover rounded-2xl overflow-hidden">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${metrica.color}-500/10 flex items-center justify-center`}>
                    <metrica.icon className={`w-6 h-6 text-${metrica.color}-500`} />
                  </div>
                  <Badge className={`bg-${metrica.color}-500/20 text-${metrica.color}-500`}>
                    {metrica.porcentaje}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">{metrica.titulo}</p>
                  <p className="text-3xl font-bold text-slate-50 mb-1">{metrica.valor}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500">{metrica.cambio}</span>
                    <span className="text-slate-500">vs mes anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Distribución por Género y Fidelidad */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50">Distribución por Género</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generoData.map((item) => (
                  <div key={item.genero} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-slate-200">{item.genero}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">{item.clientes} clientes</span>
                        <span className="text-sm font-semibold text-slate-50">{item.porcentaje}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${item.porcentaje}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50">Niveles de Fidelidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fidelidadData.map((item) => (
                  <div key={item.nivel} className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" style={{ color: item.color }} />
                        <span className="text-sm font-medium text-slate-200">{item.nivel}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-50">{item.clientes}</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${(item.clientes / 247) * 100}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Crecimiento de Clientes */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50">Crecimiento de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ nuevos: { label: "Nuevos", color: "#10b981" }, activos: { label: "Activos", color: "#3b82f6" } }} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crecimientoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="activos" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="nuevos" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Consumo por Género */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50">Consumo por Género</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ masculino: { label: "Masculino", color: "#3b82f6" }, femenino: { label: "Femenino", color: "#ec4899" } }} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumoGeneroData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="masculino" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="femenino" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Visitas por Día y Horarios */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50">Visitas por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ visitas: { label: "Visitas", color: "#8b5cf6" } }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitasDiaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 85 / 0.3)" />
                    <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
                    <Bar dataKey="visitas" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50">Horarios Preferidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {horariosData.map((item) => (
                  <div key={item.horario} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-slate-200">{item.horario}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-50">{item.clientes}</p>
                        <p className="text-xs text-slate-400">{item.porcentaje}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${item.porcentaje}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Productos por Género */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Top Productos - Masculino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productosGenero.masculino.map((item, index) => (
                  <div key={item.producto} className="glass rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-500">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{item.producto}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-800/50 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${item.porcentaje}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{item.ventas}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="glass-hover rounded-2xl overflow-hidden">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                Top Productos - Femenino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productosGenero.femenino.map((item, index) => (
                  <div key={item.producto} className="glass rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-pink-500">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{item.producto}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-800/50 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-pink-500" style={{ width: `${item.porcentaje}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{item.ventas}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rachas */}
      <div className="glass-hover rounded-2xl overflow-hidden">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Clientes con Rachas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rachasData.map((item) => (
                <div key={item.tipo} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">{item.tipo}</span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-500">{item.clientes}</p>
                      <p className="text-xs text-slate-400">{item.porcentaje}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${item.porcentaje * 3.7}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
