'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crown, Plus, Search, LogOut, Calendar, Filter, Upload, FileText, Trash2, CheckCircle, Clock, Users, Settings, KeyRound, BarChart3, Edit2, Power } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Reservacion {
  id: string
  cliente_nombre: string
  cliente_telefono: string
  fecha: string
  hora: string
  numero_personas: number
  rp_nombre: string
  estado: string
  asistio: boolean | null
  notas?: string
  creado_en: string
}

interface RP {
  id: number
  rp_nombre: string
  password: string
  abreviatura?: string
  shots_disponibles: number
  shots_usados: number
  perlas_negras_disponibles: number
  perlas_negras_usadas: number
  descuento_botella_disponible: number
  descuento_botella_usado: number
  shots_bienvenida_disponibles: number
  shots_bienvenida_usados: number
  activo: boolean
}

export default function AshtonRPPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [todasReservaciones, setTodasReservaciones] = useState<Reservacion[]>([])
  const [filtroEstadoReserva, setFiltroEstadoReserva] = useState<string>('todas')
  const [filtroRPReserva, setFiltroRPReserva] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  
  // Gestión de RPs
  const [vistaActiva, setVistaActiva] = useState<'reservaciones' | 'gestion-rps'>('reservaciones')
  const [rps, setRps] = useState<RP[]>([])
  const [dialogNuevoRP, setDialogNuevoRP] = useState(false)
  const [dialogEditarRP, setDialogEditarRP] = useState(false)
  const [rpSeleccionado, setRpSeleccionado] = useState<RP | null>(null)
  const [nuevoRP, setNuevoRP] = useState({
    rp_nombre: '',
    password: '',
    abreviatura: '',
    shots_disponibles: 5,
    perlas_negras_disponibles: 3,
    descuento_botella_disponible: 1,
    shots_bienvenida_disponibles: 10
  })

  // Importar con IA (Claude)
  const [dialogProcesarIA, setDialogProcesarIA] = useState(false)
  const [archivoIA, setArchivoIA] = useState<File | null>(null)
  const [fechaEventoIA, setFechaEventoIA] = useState(new Date().toISOString().split('T')[0])
  const [rpSeleccionadoIA, setRpSeleccionadoIA] = useState('')
  const [loadingProcesarIA, setLoadingProcesarIA] = useState(false)
  const [resultadoIA, setResultadoIA] = useState<any>(null)
  const [mensajeIA, setMensajeIA] = useState('')
  const [reservasConfirmadasIA, setReservasConfirmadasIA] = useState<any[]>([])

  // Nueva reservación manual
  const [dialogNuevaReserva, setDialogNuevaReserva] = useState(false)
  const [nuevaReserva, setNuevaReserva] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    numero_personas: 2,
    rp_nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '20:00',
    notas: ''
  })

  useEffect(() => {
    const socioData = sessionStorage.getItem('socio')
    if (!socioData) {
      router.push('/socios')
      return
    }
    const socio = JSON.parse(socioData)
    if (socio.nombre !== 'Ashton' && socio.nombre !== 'Socio Principal') {
      router.push('/dashboard/socios')
      return
    }
    cargarTodasReservaciones()
    cargarRPs()
  }, [router])

  const cargarRPs = async () => {
    const { data } = await supabase
      .from('limites_cortesias_rp')
      .select('*')
      .order('rp_nombre', { ascending: true })
    if (data) setRps(data)
  }

  const handleCrearRP = async () => {
    if (!nuevoRP.rp_nombre || !nuevoRP.password) {
      alert('Nombre y contraseña son obligatorios')
      return
    }
    
    if (nuevoRP.abreviatura && !/^[A-Z]{2}$/.test(nuevoRP.abreviatura.toUpperCase())) {
      alert('La abreviatura debe ser exactamente 2 letras mayúsculas')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('limites_cortesias_rp')
        .insert({
          rp_nombre: nuevoRP.rp_nombre,
          password: nuevoRP.password,
          abreviatura: nuevoRP.abreviatura.toUpperCase() || null,
          abreviatura_asignada_por: nuevoRP.abreviatura ? 'Ashton' : null,
          fecha_abreviatura_asignada: nuevoRP.abreviatura ? new Date().toISOString() : null,
          shots_disponibles: nuevoRP.shots_disponibles,
          shots_usados: 0,
          perlas_negras_disponibles: nuevoRP.perlas_negras_disponibles,
          perlas_negras_usadas: 0,
          descuento_botella_disponible: nuevoRP.descuento_botella_disponible,
          descuento_botella_usado: 0,
          shots_bienvenida_disponibles: nuevoRP.shots_bienvenida_disponibles,
          shots_bienvenida_usados: 0,
          activo: true
        })
      
      if (error) {
        if (error.message.includes('duplicate')) {
          alert('Ya existe un RP con ese nombre')
          return
        }
        throw error
      }
      
      alert(`✅ RP ${nuevoRP.rp_nombre} creado exitosamente`)
      setDialogNuevoRP(false)
      setNuevoRP({
        rp_nombre: '',
        password: '',
        abreviatura: '',
        shots_disponibles: 5,
        perlas_negras_disponibles: 3,
        descuento_botella_disponible: 1,
        shots_bienvenida_disponibles: 10
      })
      await cargarRPs()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear RP')
    } finally {
      setLoading(false)
    }
  }

  const handleActualizarRP = async () => {
    if (!rpSeleccionado) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('limites_cortesias_rp')
        .update({
          rp_nombre: rpSeleccionado.rp_nombre,
          password: rpSeleccionado.password,
          abreviatura: rpSeleccionado.abreviatura?.toUpperCase() || null,
          abreviatura_asignada_por: rpSeleccionado.abreviatura ? 'Ashton' : null,
          fecha_abreviatura_asignada: rpSeleccionado.abreviatura ? new Date().toISOString() : null,
          shots_disponibles: rpSeleccionado.shots_disponibles,
          perlas_negras_disponibles: rpSeleccionado.perlas_negras_disponibles,
          descuento_botella_disponible: rpSeleccionado.descuento_botella_disponible,
          shots_bienvenida_disponibles: rpSeleccionado.shots_bienvenida_disponibles,
          activo: rpSeleccionado.activo
        })
        .eq('id', rpSeleccionado.id)
      
      if (error) throw error
      
      // Actualizar reservaciones con la nueva abreviatura
      if (rpSeleccionado.abreviatura) {
        await supabase
          .from('reservaciones')
          .update({ rp_abreviatura: rpSeleccionado.abreviatura.toUpperCase() })
          .eq('rp_nombre', rpSeleccionado.rp_nombre)
      }
      
      alert('✅ RP actualizado exitosamente')
      setDialogEditarRP(false)
      await cargarRPs()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar RP')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActivo = async (rp: RP) => {
    try {
      const { error } = await supabase
        .from('limites_cortesias_rp')
        .update({ activo: !rp.activo })
        .eq('id', rp.id)
      
      if (error) throw error
      
      alert(`✅ RP ${rp.rp_nombre} ${!rp.activo ? 'activado' : 'desactivado'}`)
      await cargarRPs()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cambiar estado')
    }
  }

  const calcularStatsRP = (rpNombre: string) => {
    const reservasRP = todasReservaciones.filter(r => r.rp_nombre === rpNombre)
    return {
      total: reservasRP.length,
      llegaron: reservasRP.filter(r => r.asistio === true).length,
      noLlegaron: reservasRP.filter(r => r.asistio === false).length,
      pendientes: reservasRP.filter(r => r.asistio === null).length
    }
  }

  const cargarTodasReservaciones = async () => {
    const { data } = await supabase
      .from('reservaciones')
      .select('*')
      .order('creado_en', { ascending: false })
    if (data) setTodasReservaciones(data)
  }

  const handleProcesarConClaude = async () => {
    if (!archivoIA) {
      setMensajeIA('❌ Selecciona un archivo primero')
      return
    }
    if (!fechaEventoIA) {
      setMensajeIA('❌ Selecciona la fecha del evento')
      return
    }

    setLoadingProcesarIA(true)
    setMensajeIA('🤖 Procesando con Claude Haiku 3.5...')
    setResultadoIA(null)

    try {
      const formData = new FormData()
      formData.append('archivo', archivoIA)
      formData.append('fechaEvento', fechaEventoIA)

      const response = await fetch('/api/procesar-reservas', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando archivo')
      }

      setResultadoIA(data.data)
      setReservasConfirmadasIA(data.data.reservaciones || [])
      setMensajeIA(`✅ ${data.data.reservaciones?.length || 0} reservaciones detectadas por Claude`)
    } catch (error) {
      console.error('Error:', error)
      setMensajeIA(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoadingProcesarIA(false)
    }
  }

  const handleGuardarReservacionesIA = async () => {
    if (reservasConfirmadasIA.length === 0) return

    const reservasFinales = rpSeleccionadoIA
      ? reservasConfirmadasIA.map(r => ({ ...r, rp_nombre: rpSeleccionadoIA }))
      : reservasConfirmadasIA

    setLoadingProcesarIA(true)
    setMensajeIA('💾 Guardando en Supabase...')

    try {
      const reservasParaGuardar = reservasFinales.map(r => ({
        cliente_nombre: r.cliente_nombre,
        cliente_telefono: r.telefono || '',
        fecha: r.fecha || fechaEventoIA,
        hora: r.hora || '20:00',
        numero_personas: r.numero_personas || 2,
        rp_nombre: r.rp_nombre || 'Sin RP',
        estado: 'pendiente',
        notas: r.notas || '',
        asistio: null,
        creado_por: 'Ashton (IA)'
      }))

      const { error } = await supabase.from('reservaciones').insert(reservasParaGuardar)

      if (error) throw error

      setMensajeIA(`✅ ${reservasParaGuardar.length} reservaciones guardadas exitosamente`)
      await cargarTodasReservaciones()
      setTimeout(() => {
        setDialogProcesarIA(false)
        setResultadoIA(null)
        setReservasConfirmadasIA([])
        setArchivoIA(null)
        setMensajeIA('')
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setMensajeIA(`❌ Error al guardar: ${error instanceof Error ? error.message : 'Error'}`)
    } finally {
      setLoadingProcesarIA(false)
    }
  }

  const handleCrearReservacion = async () => {
    if (!nuevaReserva.cliente_nombre || !nuevaReserva.rp_nombre) {
      alert('Nombre del cliente y RP son obligatorios')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('reservaciones').insert({
        ...nuevaReserva,
        estado: 'pendiente',
        asistio: null
      })

      if (error) throw error

      alert('✅ Reservación creada exitosamente')
      setDialogNuevaReserva(false)
      setNuevaReserva({
        cliente_nombre: '',
        cliente_telefono: '',
        numero_personas: 2,
        rp_nombre: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '20:00',
        notas: ''
      })
      await cargarTodasReservaciones()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear reservación')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('socio')
    router.push('/socios')
  }

  const rpsUnicos = Array.from(new Set(todasReservaciones.map(r => r.rp_nombre || 'Sin RP'))).sort()

  const reservasFiltradas = todasReservaciones.filter(r => {
    const matchRP = filtroRPReserva === 'todos' || (r.rp_nombre || 'Sin RP') === filtroRPReserva
    const matchEstado = filtroEstadoReserva === 'todas' ||
      (filtroEstadoReserva === 'llegaron' && r.asistio === true) ||
      (filtroEstadoReserva === 'no_llegaron' && r.asistio === false) ||
      (filtroEstadoReserva === 'pendientes' && r.asistio === null)
    const matchBusqueda = !busqueda || r.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchRP && matchEstado && matchBusqueda
  })

  const stats = {
    total: reservasFiltradas.length,
    llegaron: reservasFiltradas.filter(r => r.asistio === true).length,
    noLlegaron: reservasFiltradas.filter(r => r.asistio === false).length,
    pendientes: reservasFiltradas.filter(r => r.asistio === null).length
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panel Ashton - Gestión de RPs</h1>
                <p className="text-sm text-slate-400">Reservaciones por RP</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-slate-300">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setVistaActiva('reservaciones')}
            variant={vistaActiva === 'reservaciones' ? 'default' : 'outline'}
            className={vistaActiva === 'reservaciones' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
              : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Reservaciones
          </Button>
          <Button
            onClick={() => setVistaActiva('gestion-rps')}
            variant={vistaActiva === 'gestion-rps' ? 'default' : 'outline'}
            className={vistaActiva === 'gestion-rps' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
              : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestión de RPs
          </Button>
        </div>

        {vistaActiva === 'reservaciones' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Total Reservas</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-900/20 border-green-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-green-400 text-sm mb-1">Llegaron ✓</p>
                <p className="text-3xl font-bold text-green-400">{stats.llegaron}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-400 text-sm mb-1">No Llegaron ✗</p>
                <p className="text-3xl font-bold text-red-400">{stats.noLlegaron}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/20 border-yellow-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-yellow-400 text-sm mb-1">Pendientes ⏳</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pendientes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Botones */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex gap-3 flex-wrap flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 w-48 bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <Select value={filtroRPReserva} onValueChange={setFiltroRPReserva}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="todos">Todos los RPs</SelectItem>
                {rpsUnicos.map(rp => (
                  <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroEstadoReserva} onValueChange={setFiltroEstadoReserva}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="llegaron">Llegaron ✓</SelectItem>
                <SelectItem value="no_llegaron">No Llegaron ✗</SelectItem>
                <SelectItem value="pendientes">Pendientes ⏳</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => { setMensajeIA(''); setResultadoIA(null); setReservasConfirmadasIA([]); setArchivoIA(null); setDialogProcesarIA(true) }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <span className="text-lg mr-2">🤖</span>
              Procesar con IA
            </Button>

            <Button
              onClick={() => setDialogNuevaReserva(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reserva
            </Button>
          </div>
        </div>

        {/* Tabla de Reservaciones */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Reservaciones ({reservasFiltradas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {reservasFiltradas.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">No hay reservaciones</p>
                  </div>
                ) : (
                  reservasFiltradas.map((reservacion) => (
                    <div
                      key={reservacion.id}
                      className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-white font-medium">{reservacion.cliente_nombre}</span>
                          <Badge className="bg-purple-600/30 text-purple-300">
                            {reservacion.rp_nombre || 'Sin RP'}
                          </Badge>
                          {reservacion.asistio === true && (
                            <Badge className="bg-green-500/20 text-green-400">✓ Llegó</Badge>
                          )}
                          {reservacion.asistio === false && (
                            <Badge className="bg-red-500/20 text-red-400">✗ No llegó</Badge>
                          )}
                          {reservacion.asistio === null && (
                            <Badge className="bg-yellow-500/20 text-yellow-400">⏳ Pendiente</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>📅 {new Date(reservacion.fecha).toLocaleDateString('es-MX')}</span>
                          <span>🕐 {reservacion.hora?.substring(0, 5) || '--:--'}</span>
                          <span>👥 {reservacion.numero_personas} personas</span>
                          {reservacion.cliente_telefono && <span>📞 {reservacion.cliente_telefono}</span>}
                        </div>
                        {reservacion.notas && (
                          <p className="text-sm text-slate-500 mt-1">📝 {reservacion.notas}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
          </>
        ) : (
          /* Vista de Gestión de RPs */
          <div className="space-y-6">
            {/* Stats RPs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Total RPs</p>
                    <p className="text-3xl font-bold text-white">{rps.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-900/20 border-green-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-green-400 text-sm mb-1">Activos</p>
                    <p className="text-3xl font-bold text-green-400">{rps.filter(rp => rp.activo).length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-900/20 border-red-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-red-400 text-sm mb-1">Inactivos</p>
                    <p className="text-3xl font-bold text-red-400">{rps.filter(rp => !rp.activo).length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-900/20 border-blue-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-blue-400 text-sm mb-1">Con Abreviatura</p>
                    <p className="text-3xl font-bold text-blue-400">{rps.filter(rp => rp.abreviatura).length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botón Nuevo RP */}
            <div className="flex justify-end">
              <Button
                onClick={() => setDialogNuevoRP(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo RP
              </Button>
            </div>

            {/* Lista de RPs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rps.map((rp) => {
                const stats = calcularStatsRP(rp.rp_nombre)
                return (
                  <Card key={rp.id} className={`bg-slate-900 border-slate-800 ${!rp.activo ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {rp.abreviatura || rp.rp_nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{rp.rp_nombre}</p>
                            <p className="text-xs text-slate-400">
                              {rp.activo ? <span className="text-green-400">● Activo</span> : <span className="text-red-400">● Inactivo</span>}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats del RP */}
                      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                        <div className="bg-slate-800 rounded p-2">
                          <p className="text-xs text-slate-400">Reservas</p>
                          <p className="text-lg font-bold text-white">{stats.total}</p>
                        </div>
                        <div className="bg-green-900/30 rounded p-2">
                          <p className="text-xs text-green-400">Llegaron</p>
                          <p className="text-lg font-bold text-green-400">{stats.llegaron}</p>
                        </div>
                        <div className="bg-red-900/30 rounded p-2">
                          <p className="text-xs text-red-400">No Lleg.</p>
                          <p className="text-lg font-bold text-red-400">{stats.noLlegaron}</p>
                        </div>
                        <div className="bg-yellow-900/30 rounded p-2">
                          <p className="text-xs text-yellow-400">Pend.</p>
                          <p className="text-lg font-bold text-yellow-400">{stats.pendientes}</p>
                        </div>
                      </div>

                      {/* Abreviatura */}
                      {rp.abreviatura && (
                        <div className="mb-3">
                          <Badge className="bg-amber-500/20 text-amber-400">
                            <KeyRound className="w-3 h-3 mr-1" />
                            Abreviatura: {rp.abreviatura}
                          </Badge>
                        </div>
                      )}

                      {/* Botones */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRpSeleccionado(rp)
                            setDialogEditarRP(true)
                          }}
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActivo(rp)}
                          className={`flex-1 ${rp.activo ? 'border-red-600 text-red-400 hover:bg-red-900/30' : 'border-green-600 text-green-400 hover:bg-green-900/30'}`}
                        >
                          <Power className="w-4 h-4 mr-1" />
                          {rp.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dialog Procesar con IA */}
      <Dialog open={dialogProcesarIA} onOpenChange={setDialogProcesarIA}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Procesar Reservaciones con IA (Claude Haiku 3.5)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Sube un archivo Excel, PDF, Word o imagen. La IA extraerá automáticamente las reservaciones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Fecha del evento */}
            <div>
              <Label className="text-slate-300">Fecha del Evento *</Label>
              <Input
                type="date"
                value={fechaEventoIA}
                onChange={(e) => setFechaEventoIA(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Selector de RP */}
            <div>
              <Label className="text-slate-300">RP (opcional - deja en blanco para detectar automáticamente)</Label>
              <Select value={rpSeleccionadoIA} onValueChange={setRpSeleccionadoIA}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Detectar automáticamente" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="">Detectar automáticamente</SelectItem>
                  {rpsUnicos.map(rp => (
                    <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subir archivo */}
            <div>
              <Label className="text-slate-300">Archivo (Excel, PDF, Word, Imagen) *</Label>
              <div className="mt-2 border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-600 transition-colors">
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">
                  {archivoIA ? `📄 ${archivoIA.name}` : 'Arrastra tu archivo o haz clic para seleccionar'}
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
                  onChange={(e) => setArchivoIA(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Botón procesar */}
            <Button
              onClick={handleProcesarConClaude}
              disabled={loadingProcesarIA || !archivoIA}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
            >
              {loadingProcesarIA ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Procesando con Haiku 3.5...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  Procesar con IA
                </span>
              )}
            </Button>

            {/* Mensaje de estado */}
            {mensajeIA && (
              <div className={`text-sm p-3 rounded-lg border ${
                mensajeIA.startsWith('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                mensajeIA.startsWith('❌') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {mensajeIA}
              </div>
            )}

            {/* Resultados por RP */}
            {resultadoIA && resultadoIA.resumen_por_rp && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-slate-300 font-semibold mb-3">📊 Resumen por RP</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(resultadoIA.resumen_por_rp).map(([rp, count]: [string, any]) => (
                    <div key={rp} className="bg-slate-800 rounded-lg px-3 py-2 text-center">
                      <p className="text-white font-medium">{rp}</p>
                      <p className="text-2xl font-bold text-purple-400">{count}</p>
                      <p className="text-xs text-slate-500">reservas</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de reservaciones detectadas */}
            {reservasConfirmadasIA.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-slate-300 font-semibold">
                    📋 Reservaciones Detectadas ({reservasConfirmadasIA.length})
                  </h4>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {reservasConfirmadasIA.map((reserva, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 text-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{reserva.cliente_nombre}</span>
                          <Badge className="bg-purple-600/30 text-purple-300 text-xs">
                            {reserva.rp_nombre || 'Sin RP'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>🕐 {reserva.hora || '20:00'}</span>
                          <span>👥 {reserva.numero_personas || 2} personas</span>
                          {reserva.telefono && <span>📞 {reserva.telefono}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => setReservasConfirmadasIA(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón guardar */}
            {reservasConfirmadasIA.length > 0 && (
              <Button
                onClick={handleGuardarReservacionesIA}
                disabled={loadingProcesarIA}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white disabled:opacity-50"
              >
                {loadingProcesarIA ? 'Guardando...' : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Guardar {reservasConfirmadasIA.length} Reservaciones en Supabase
                  </span>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Nueva Reservación */}
      <Dialog open={dialogNuevaReserva} onOpenChange={setDialogNuevaReserva}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Crear Nueva Reservación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Nombre del Cliente *</Label>
              <Input
                value={nuevaReserva.cliente_nombre}
                onChange={(e) => setNuevaReserva({...nuevaReserva, cliente_nombre: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Ej: Juan García"
              />
            </div>
            <div>
              <Label className="text-slate-300">Teléfono</Label>
              <Input
                value={nuevaReserva.cliente_telefono}
                onChange={(e) => setNuevaReserva({...nuevaReserva, cliente_telefono: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Ej: 5551234567"
              />
            </div>
            <div>
              <Label className="text-slate-300">RP Asignado *</Label>
              <Select value={nuevaReserva.rp_nombre} onValueChange={(val) => setNuevaReserva({...nuevaReserva, rp_nombre: val})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecciona RP" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {rpsUnicos.map(rp => (
                    <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Fecha</Label>
                <Input
                  type="date"
                  value={nuevaReserva.fecha}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, fecha: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Hora</Label>
                <Input
                  type="time"
                  value={nuevaReserva.hora}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, hora: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Número de Personas</Label>
              <Input
                type="number"
                min={1}
                value={nuevaReserva.numero_personas}
                onChange={(e) => setNuevaReserva({...nuevaReserva, numero_personas: parseInt(e.target.value) || 1})}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Notas</Label>
              <Input
                value={nuevaReserva.notas}
                onChange={(e) => setNuevaReserva({...nuevaReserva, notas: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Notas adicionales..."
              />
            </div>
            <Button
              onClick={handleCrearReservacion}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              {loading ? 'Creando...' : 'Crear Reservación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Nuevo RP */}
      <Dialog open={dialogNuevoRP} onOpenChange={setDialogNuevoRP}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Crear Nuevo RP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Nombre del RP *</Label>
              <Input
                value={nuevoRP.rp_nombre}
                onChange={(e) => setNuevoRP({...nuevoRP, rp_nombre: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <Label className="text-slate-300">Contraseña *</Label>
              <Input
                type="password"
                value={nuevoRP.password}
                onChange={(e) => setNuevoRP({...nuevoRP, password: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Contraseña para login"
              />
            </div>
            <div>
              <Label className="text-slate-300">Abreviatura (2 letras)</Label>
              <Input
                value={nuevoRP.abreviatura}
                onChange={(e) => setNuevoRP({...nuevoRP, abreviatura: e.target.value.toUpperCase().slice(0, 2)})}
                className="bg-slate-800 border-slate-700 text-white uppercase"
                placeholder="Ej: JP"
                maxLength={2}
              />
              <p className="text-xs text-slate-500 mt-1">2 letras mayúsculas para identificar al RP</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Shots Disponibles</Label>
                <Input
                  type="number"
                  value={nuevoRP.shots_disponibles}
                  onChange={(e) => setNuevoRP({...nuevoRP, shots_disponibles: parseInt(e.target.value) || 0})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Perlas Negras</Label>
                <Input
                  type="number"
                  value={nuevoRP.perlas_negras_disponibles}
                  onChange={(e) => setNuevoRP({...nuevoRP, perlas_negras_disponibles: parseInt(e.target.value) || 0})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Desc. Botella</Label>
                <Input
                  type="number"
                  value={nuevoRP.descuento_botella_disponible}
                  onChange={(e) => setNuevoRP({...nuevoRP, descuento_botella_disponible: parseInt(e.target.value) || 0})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Shots Bienvenida</Label>
                <Input
                  type="number"
                  value={nuevoRP.shots_bienvenida_disponibles}
                  onChange={(e) => setNuevoRP({...nuevoRP, shots_bienvenida_disponibles: parseInt(e.target.value) || 0})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <Button
              onClick={handleCrearRP}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              {loading ? 'Creando...' : 'Crear RP'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar RP */}
      <Dialog open={dialogEditarRP} onOpenChange={setDialogEditarRP}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar RP</DialogTitle>
          </DialogHeader>
          {rpSeleccionado && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Nombre del RP</Label>
                <Input
                  value={rpSeleccionado.rp_nombre}
                  onChange={(e) => setRpSeleccionado({...rpSeleccionado, rp_nombre: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Contraseña</Label>
                <Input
                  type="password"
                  value={rpSeleccionado.password}
                  onChange={(e) => setRpSeleccionado({...rpSeleccionado, password: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Abreviatura (2 letras)</Label>
                <Input
                  value={rpSeleccionado.abreviatura || ''}
                  onChange={(e) => setRpSeleccionado({...rpSeleccionado, abreviatura: e.target.value.toUpperCase().slice(0, 2)})}
                  className="bg-slate-800 border-slate-700 text-white uppercase"
                  placeholder="Ej: JP"
                  maxLength={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Shots Disp.</Label>
                  <Input
                    type="number"
                    value={rpSeleccionado.shots_disponibles}
                    onChange={(e) => setRpSeleccionado({...rpSeleccionado, shots_disponibles: parseInt(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Perlas Negras</Label>
                  <Input
                    type="number"
                    value={rpSeleccionado.perlas_negras_disponibles}
                    onChange={(e) => setRpSeleccionado({...rpSeleccionado, perlas_negras_disponibles: parseInt(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Desc. Botella</Label>
                  <Input
                    type="number"
                    value={rpSeleccionado.descuento_botella_disponible}
                    onChange={(e) => setRpSeleccionado({...rpSeleccionado, descuento_botella_disponible: parseInt(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Shots Bienv.</Label>
                  <Input
                    type="number"
                    value={rpSeleccionado.shots_bienvenida_disponibles}
                    onChange={(e) => setRpSeleccionado({...rpSeleccionado, shots_bienvenida_disponibles: parseInt(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rpSeleccionado.activo}
                  onChange={(e) => setRpSeleccionado({...rpSeleccionado, activo: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600"
                />
                <Label className="text-slate-300 mb-0">Activo</Label>
              </div>
              <Button
                onClick={handleActualizarRP}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
