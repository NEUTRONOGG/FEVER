'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar, Clock, Users, CheckCircle2, AlertCircle, 
  Search, Filter, Download, TrendingUp, UserCheck, UserX
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Reservacion {
  id: string
  cliente_nombre: string
  cliente_telefono?: string
  fecha: string
  hora: string
  numero_personas: number
  rp_nombre: string | null
  estado: string
  asistio: boolean | null
  mesa_asignada?: number
  hora_llegada?: string
  notas?: string
  creado_en: string
}

export default function ReservacionesRPsPage() {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroRP, setFiltroRP] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [rpsUnicos, setRpsUnicos] = useState<string[]>([])

  useEffect(() => {
    cargarReservaciones()
    const interval = setInterval(cargarReservaciones, 15000)
    return () => clearInterval(interval)
  }, [])

  async function cargarReservaciones() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Cargar todas las reservaciones
      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })

      if (error) throw error

      const reservas = data || []
      setReservaciones(reservas)

      // Extraer RPs únicos
      const rps = Array.from(new Set(
        reservas
          .filter(r => r.rp_nombre)
          .map(r => r.rp_nombre as string)
      )).sort()
      setRpsUnicos(rps)
    } catch (error) {
      console.error('Error cargando reservaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const reservacionesFiltradas = reservaciones.filter(r => {
    const matchRP = filtroRP === 'todos' || r.rp_nombre === filtroRP
    const matchEstado = filtroEstado === 'todos' || r.estado === filtroEstado
    const matchBusqueda = r.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchRP && matchEstado && matchBusqueda
  })

  const estadisticas = {
    total: reservacionesFiltradas.length,
    confirmadas: reservacionesFiltradas.filter(r => r.estado === 'confirmada').length,
    completadas: reservacionesFiltradas.filter(r => r.estado === 'completada').length,
    pendientes: reservacionesFiltradas.filter(r => r.estado === 'pendiente').length,
    noAsistio: reservacionesFiltradas.filter(r => r.estado === 'no_asistio').length,
    canceladas: reservacionesFiltradas.filter(r => r.estado === 'cancelada').length,
  }

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'pendiente':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">⏳ Pendiente</Badge>
      case 'confirmada':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">✓ Confirmada</Badge>
      case 'completada':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">✅ Completada</Badge>
      case 'no_asistio':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">✗ No Asistió</Badge>
      case 'cancelada':
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">✗ Cancelada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const getAsistenciaBadge = (asistio: boolean | null, estado: string) => {
    if (estado === 'completada' || estado === 'confirmada') {
      return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">👤 Llegó</Badge>
    }
    if (estado === 'no_asistio') {
      return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">❌ No llegó</Badge>
    }
    return <Badge className="bg-slate-500/20 text-slate-500 border-slate-500/30">⏳ Pendiente</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Reservaciones de RPs</h1>
        <p className="text-slate-400 mt-1">Control y seguimiento de todas las reservaciones asignadas a RPs</p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-50">{estadisticas.total}</p>
              </div>
              <Calendar className="w-6 h-6 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-500">{estadisticas.pendientes}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Confirmadas</p>
                <p className="text-2xl font-bold text-blue-500">{estadisticas.confirmadas}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completadas</p>
                <p className="text-2xl font-bold text-emerald-500">{estadisticas.completadas}</p>
              </div>
              <UserCheck className="w-6 h-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">No Asistió</p>
                <p className="text-2xl font-bold text-red-500">{estadisticas.noAsistio}</p>
              </div>
              <UserX className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Canceladas</p>
                <p className="text-2xl font-bold text-gray-500">{estadisticas.canceladas}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-100"
          />
        </div>

        <Select value={filtroRP} onValueChange={setFiltroRP}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-800 text-slate-100">
            <SelectValue placeholder="Filtrar por RP" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="todos" className="text-slate-100">Todos los RPs</SelectItem>
            {rpsUnicos.map(rp => (
              <SelectItem key={rp} value={rp} className="text-slate-100">{rp}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-800 text-slate-100">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="todos" className="text-slate-100">Todos los estados</SelectItem>
            <SelectItem value="pendiente" className="text-slate-100">Pendiente</SelectItem>
            <SelectItem value="confirmada" className="text-slate-100">Confirmada</SelectItem>
            <SelectItem value="completada" className="text-slate-100">Completada</SelectItem>
            <SelectItem value="no_asistio" className="text-slate-100">No Asistió</SelectItem>
            <SelectItem value="cancelada" className="text-slate-100">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de Reservaciones */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-800/50">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-semibold text-slate-400">Cliente</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">RP Asignado</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Fecha</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Hora</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Personas</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Estado</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Asistencia</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Mesa</th>
                    <th className="p-4 text-sm font-semibold text-slate-400">Llegada</th>
                  </tr>
                </thead>
                <tbody>
                  {reservacionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-slate-400">
                        No hay reservaciones que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    reservacionesFiltradas.map((reserva) => (
                      <tr key={reserva.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-200">{reserva.cliente_nombre}</p>
                            {reserva.cliente_telefono && (
                              <p className="text-xs text-slate-500">{reserva.cliente_telefono}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">
                            {reserva.rp_nombre || 'Sin RP'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="w-4 h-4" />
                            {new Date(reserva.fecha).toLocaleDateString('es-MX')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4" />
                            {reserva.hora}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Users className="w-4 h-4" />
                            {reserva.numero_personas}
                          </div>
                        </td>
                        <td className="p-4">
                          {getEstadoBadge(reserva.estado)}
                        </td>
                        <td className="p-4">
                          {getAsistenciaBadge(reserva.asistio || false, reserva.estado)}
                        </td>
                        <td className="p-4">
                          {reserva.mesa_asignada ? (
                            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                              Mesa {reserva.mesa_asignada}
                            </Badge>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {reserva.hora_llegada ? (
                            <div className="text-xs text-emerald-500">
                              {new Date(reserva.hora_llegada).toLocaleTimeString('es-MX', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notas */}
      {reservacionesFiltradas.some(r => r.notas) && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-50">Notas de Reservaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservacionesFiltradas
                .filter(r => r.notas)
                .map(r => (
                  <div key={r.id} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-200">{r.cliente_nombre}</p>
                        <p className="text-sm text-slate-400 mt-1">{r.notas}</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-500">{r.rp_nombre}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
