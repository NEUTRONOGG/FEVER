"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Table2,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface RPRendimiento {
  rp_nombre: string
  total_reservas: number
  reservas_confirmadas: number
  reservas_completadas: number
  reservas_no_asistieron: number
  mesas_asignadas: number
  mesas_activas: number
  total_personas_reservadas: number
  tasa_conversion: number
  promedio_personas_por_reserva: number
}

interface DetalleNoche {
  fecha: string
  rp_nombre: string
  reservas: any[]
  mesas: any[]
  entradas: number
}

export default function RendimientoRPsPage() {
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState("7") // días
  const [rendimientoRPs, setRendimientoRPs] = useState<RPRendimiento[]>([])
  const [detallePorNoche, setDetallePorNoche] = useState<DetalleNoche[]>([])
  const [rpExpandido, setRpExpandido] = useState<string | null>(null)
  const [statsGenerales, setStatsGenerales] = useState({
    totalReservas: 0,
    totalMesasAbiertas: 0,
    totalClientesLlegaron: 0,
    tasaGlobalConversion: 0
  })

  useEffect(() => {
    cargarDatos()
  }, [periodo])

  async function cargarDatos() {
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Calcular fecha de inicio según período
      const fechaInicio = new Date()
      fechaInicio.setDate(fechaInicio.getDate() - parseInt(periodo))
      const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
      
      // 1. Obtener reservaciones del período
      const { data: reservas, error: errorReservas } = await supabase
        .from('reservaciones')
        .select('*')
        .gte('fecha', fechaInicioStr)
        .order('fecha', { ascending: false })
      
      if (errorReservas) throw errorReservas
      
      // 2. Obtener mesas ocupadas del período
      const { data: mesas, error: errorMesas } = await supabase
        .from('mesas')
        .select('*')
        .eq('estado', 'ocupada')
        .not('rp_asignado', 'is', null)
      
      if (errorMesas) throw errorMesas
      
      // 3. Obtener visitas/entradas del período
      const { data: visitas, error: errorVisitas } = await supabase
        .from('visitas')
        .select('*, clientes(nombre)')
        .gte('created_at', `${fechaInicioStr}T00:00:00`)
        .order('created_at', { ascending: false })
      
      if (errorVisitas) throw errorVisitas
      
      // Procesar datos por RP
      const rpMap = new Map<string, RPRendimiento>()
      
      // Inicializar con datos de reservas
      reservas?.forEach((reserva: any) => {
        const rp = reserva.rp_nombre || 'Sin RP'
        if (!rpMap.has(rp)) {
          rpMap.set(rp, {
            rp_nombre: rp,
            total_reservas: 0,
            reservas_confirmadas: 0,
            reservas_completadas: 0,
            reservas_no_asistieron: 0,
            mesas_asignadas: 0,
            mesas_activas: 0,
            total_personas_reservadas: 0,
            tasa_conversion: 0,
            promedio_personas_por_reserva: 0
          })
        }
        
        const data = rpMap.get(rp)!
        data.total_reservas++
        data.total_personas_reservadas += reserva.numero_personas || 1
        
        if (reserva.estado === 'confirmada') data.reservas_confirmadas++
        if (reserva.estado === 'completada') data.reservas_completadas++
        if (reserva.estado === 'no_asistio') data.reservas_no_asistieron++
      })
      
      // Agregar datos de mesas
      mesas?.forEach((mesa: any) => {
        const rp = mesa.rp_asignado || 'Sin RP'
        if (!rpMap.has(rp)) {
          rpMap.set(rp, {
            rp_nombre: rp,
            total_reservas: 0,
            reservas_confirmadas: 0,
            reservas_completadas: 0,
            reservas_no_asistieron: 0,
            mesas_asignadas: 0,
            mesas_activas: 0,
            total_personas_reservadas: 0,
            tasa_conversion: 0,
            promedio_personas_por_reserva: 0
          })
        }
        
        const data = rpMap.get(rp)!
        data.mesas_asignadas++
        if (mesa.estado === 'ocupada') data.mesas_activas++
      })
      
      // Calcular métricas derivadas
      rpMap.forEach((data) => {
        data.promedio_personas_por_reserva = data.total_reservas > 0 
          ? data.total_personas_reservadas / data.total_reservas 
          : 0
        
        data.tasa_conversion = data.reservas_confirmadas > 0
          ? (data.reservas_completadas / data.reservas_confirmadas) * 100
          : 0
      })
      
      const rendimientoArray = Array.from(rpMap.values())
        .sort((a, b) => b.total_reservas - a.total_reservas)
      
      setRendimientoRPs(rendimientoArray)
      
      // Calcular stats generales
      const totalReservas = rendimientoArray.reduce((sum, rp) => sum + rp.total_reservas, 0)
      const totalMesasAbiertas = rendimientoArray.reduce((sum, rp) => sum + rp.mesas_activas, 0)
      const totalLlegaron = rendimientoArray.reduce((sum, rp) => sum + rp.reservas_completadas, 0)
      const totalConfirmadas = rendimientoArray.reduce((sum, rp) => sum + rp.reservas_confirmadas, 0)
      
      setStatsGenerales({
        totalReservas,
        totalMesasAbiertas,
        totalClientesLlegaron: totalLlegaron,
        tasaGlobalConversion: totalConfirmadas > 0 ? (totalLlegaron / totalConfirmadas) * 100 : 0
      })
      
      // Crear detalle por noche
      const detalleMap = new Map<string, DetalleNoche>()
      
      reservas?.forEach((reserva: any) => {
        const key = `${reserva.fecha}_${reserva.rp_nombre || 'Sin RP'}`
        if (!detalleMap.has(key)) {
          detalleMap.set(key, {
            fecha: reserva.fecha,
            rp_nombre: reserva.rp_nombre || 'Sin RP',
            reservas: [],
            mesas: [],
            entradas: 0
          })
        }
        detalleMap.get(key)!.reservas.push(reserva)
      })
      
      mesas?.forEach((mesa: any) => {
        // Buscar fecha de la mesa (usar fecha actual como aproximación)
        const fechaMesa = new Date().toISOString().split('T')[0]
        const key = `${fechaMesa}_${mesa.rp_asignado || 'Sin RP'}`
        if (detalleMap.has(key)) {
          detalleMap.get(key)!.mesas.push(mesa)
        }
      })
      
      const detalleArray = Array.from(detalleMap.values())
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      
      setDetallePorNoche(detalleArray)
      
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

  const dataGrafica = rendimientoRPs.map(rp => ({
    name: rp.rp_nombre,
    reservas: rp.total_reservas,
    completadas: rp.reservas_completadas,
    mesas: rp.mesas_activas,
    conversion: Math.round(rp.tasa_conversion)
  }))

  const dataPie = rendimientoRPs.slice(0, 5).map(rp => ({
    name: rp.rp_nombre,
    value: rp.total_reservas
  }))

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">📊 Rendimiento de RPs</h1>
          <p className="text-slate-400 mt-1">
            Análisis de reservas, mesas y accesos por RP
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40 bg-slate-900 border-slate-800 text-slate-100">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="7" className="text-slate-100">Últimos 7 días</SelectItem>
              <SelectItem value="14" className="text-slate-100">Últimos 14 días</SelectItem>
              <SelectItem value="30" className="text-slate-100">Último mes</SelectItem>
              <SelectItem value="90" className="text-slate-100">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={cargarDatos}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Reservas</p>
                <p className="text-2xl font-bold text-slate-50">{statsGenerales.totalReservas}</p>
                <p className="text-xs text-slate-500 mt-1">En el período</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Mesas Abiertas</p>
                <p className="text-2xl font-bold text-slate-50">{statsGenerales.totalMesasAbiertas}</p>
                <p className="text-xs text-slate-500 mt-1">Actualmente ocupadas</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Table2 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Clientes Llegaron</p>
                <p className="text-2xl font-bold text-slate-50">{statsGenerales.totalClientesLlegaron}</p>
                <p className="text-xs text-slate-500 mt-1">Reservas completadas</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-slate-50">
                  {statsGenerales.tasaGlobalConversion.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Confirmadas → Completadas</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Gráfica de barras - Reservas vs Completadas */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-amber-500" />
              Reservas por RP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGrafica}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="reservas" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Total Reservas" />
                  <Bar dataKey="completadas" fill="#10b981" radius={[4, 4, 0, 0]} name="Completadas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica circular - Distribución */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Distribución de Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Rendimiento por RP */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-50 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            Detalle por RP
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-700 text-slate-300"
            onClick={() => {
              const csv = [
                ['RP', 'Total Reservas', 'Confirmadas', 'Completadas', 'No Asistieron', 'Mesas Activas', 'Tasa Conversión', 'Prom. Personas'].join(','),
                ...rendimientoRPs.map(rp => [
                  rp.rp_nombre,
                  rp.total_reservas,
                  rp.reservas_confirmadas,
                  rp.reservas_completadas,
                  rp.reservas_no_asistieron,
                  rp.mesas_activas,
                  `${rp.tasa_conversion.toFixed(1)}%`,
                  rp.promedio_personas_por_reserva.toFixed(1)
                ].join(','))
              ].join('\n')
              
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `rendimiento-rps-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-300">RP</TableHead>
                <TableHead className="text-slate-300 text-center">Total Reservas</TableHead>
                <TableHead className="text-slate-300 text-center">Confirmadas</TableHead>
                <TableHead className="text-slate-300 text-center">Completadas</TableHead>
                <TableHead className="text-slate-300 text-center">No Asistieron</TableHead>
                <TableHead className="text-slate-300 text-center">Mesas Activas</TableHead>
                <TableHead className="text-slate-300 text-center">Tasa Conversión</TableHead>
                <TableHead className="text-slate-300 text-center">Prom. Personas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rendimientoRPs.map((rp) => (
                <TableRow 
                  key={rp.rp_nombre} 
                  className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => setRpExpandido(rpExpandido === rp.rp_nombre ? null : rp.rp_nombre)}
                >
                  <TableCell className="font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      {rp.rp_nombre}
                      {rpExpandido === rp.rp_nombre ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-slate-300">{rp.total_reservas}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-blue-500/20 text-blue-500">
                      {rp.reservas_confirmadas}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-500/20 text-emerald-500">
                      {rp.reservas_completadas}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-red-500/20 text-red-500">
                      {rp.reservas_no_asistieron}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-amber-500/20 text-amber-500">
                      {rp.mesas_activas}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold ${rp.tasa_conversion >= 70 ? 'text-emerald-500' : rp.tasa_conversion >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {rp.tasa_conversion.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-slate-300">
                    {rp.promedio_personas_por_reserva.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detalle por Noche */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Detalle por Noche (Reservas vs Mesas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {detallePorNoche.slice(0, 10).map((detalle, index) => (
              <Collapsible key={`${detalle.fecha}_${detalle.rp_nombre}`}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-300">{index + 1}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-200">{detalle.fecha}</p>
                        <p className="text-sm text-slate-400">{detalle.rp_nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-300">
                          <span className="text-amber-500 font-semibold">{detalle.reservas.length}</span> reservas
                        </p>
                        <p className="text-sm text-slate-300">
                          <span className="text-blue-500 font-semibold">{detalle.mesas.length}</span> mesas
                        </p>
                      </div>
                      {detalle.reservas.length > 0 || detalle.mesas.length > 0 ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : null}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 bg-slate-800/50 mt-2 rounded-lg space-y-3">
                    {detalle.reservas.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-amber-500 mb-2">Reservas ({detalle.reservas.length}):</p>
                        <div className="space-y-1">
                          {detalle.reservas.map((reserva: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-300">{reserva.cliente_nombre}</span>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  reserva.estado === 'completada' ? 'bg-emerald-500/20 text-emerald-500' :
                                  reserva.estado === 'confirmada' ? 'bg-blue-500/20 text-blue-500' :
                                  reserva.estado === 'no_asistio' ? 'bg-red-500/20 text-red-500' :
                                  'bg-yellow-500/20 text-yellow-500'
                                }>
                                  {reserva.estado}
                                </Badge>
                                <span className="text-slate-400">{reserva.numero_personas} pers.</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {detalle.mesas.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-blue-500 mb-2">Mesas Activas ({detalle.mesas.length}):</p>
                        <div className="space-y-1">
                          {detalle.mesas.map((mesa: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-300">Mesa {mesa.numero}</span>
                              <span className="text-slate-400">{mesa.cliente_nombre}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
