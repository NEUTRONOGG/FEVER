"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Calendar, Clock, Users, CheckCircle2,
  XCircle, AlertCircle, UserCheck, Armchair, Plus
} from "lucide-react"

export default function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<any[]>([])
  const [rpsDisponibles, setRpsDisponibles] = useState<any[]>([])
  const [mesasDisponibles, setMesasDisponibles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialogs
  const [dialogNuevaReservacion, setDialogNuevaReservacion] = useState(false)
  const [dialogConfirmarAsistencia, setDialogConfirmarAsistencia] = useState(false)
  const [reservacionSeleccionada, setReservacionSeleccionada] = useState<any>(null)
  
  // Formulario nueva reservación
  const [nuevaReservacion, setNuevaReservacion] = useState({
    cliente_nombre: "",
    numero_personas: 2,
    numero_hombres: 0,
    numero_mujeres: 0,
    rp_nombre: "sin_rp",
    notas: ""
  })
  
  // Asignación de mesa
  const [mesaAsignada, setMesaAsignada] = useState<number | null>(null)
  const [hostessNombre, setHostessNombre] = useState("Hostess")

  useEffect(() => {
    // Cargar nombre de hostess desde localStorage
    if (typeof window !== 'undefined') {
      const nombre = localStorage.getItem("userName") || "Hostess"
      setHostessNombre(nombre)
    }
    
    cargarDatos()
    const interval = setInterval(cargarDatos, 10000) // Cada 10 segundos
    return () => clearInterval(interval)
  }, [])

  async function cargarDatos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Cargar reservaciones del día
      const hoy = new Date().toISOString().split('T')[0]
      const { data: reservacionesData, error: errorReservaciones } = await supabase
        .from('reservaciones')
        .select('*')
        .gte('fecha', hoy)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })
      
      if (errorReservaciones) {
        console.warn('⚠️ Tabla reservaciones no existe o no tiene datos:', errorReservaciones.message)
        setReservaciones([])
      } else {
        setReservaciones(reservacionesData || [])
      }
      
      // Cargar RPs disponibles
      const { data: rpsData, error: errorRPs } = await supabase
        .from('limites_cortesias_rp')
        .select('rp_nombre')
        .eq('activo', true)
        .order('rp_nombre')
      
      if (errorRPs) {
        console.warn('⚠️ Error cargando RPs:', errorRPs.message)
        setRpsDisponibles([])
      } else {
        setRpsDisponibles(rpsData || [])
      }
      
      // Cargar mesas disponibles
      const { data: mesasData, error: errorMesas } = await supabase
        .from('mesas')
        .select('*')
        .order('numero')
      
      if (errorMesas) {
        console.warn('⚠️ Error cargando mesas:', errorMesas.message)
        setMesasDisponibles([])
      } else {
        console.log('📊 Mesas cargadas:', mesasData)
        // Filtrar solo las disponibles (sin cliente asignado)
        const disponibles = (mesasData || []).filter((m: any) => 
          !m.cliente_nombre || m.cliente_nombre === '' || m.estado === 'disponible'
        )
        console.log('✅ Mesas disponibles:', disponibles.length)
        setMesasDisponibles(disponibles)
      }
      
    } catch (error: any) {
      console.warn('⚠️ Error general cargando datos:', error?.message || error)
    } finally {
      setLoading(false)
    }
  }

  const handleCrearReservacion = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Obtener fecha y hora actual
      const ahora = new Date()
      const fecha = ahora.toISOString().split('T')[0] // YYYY-MM-DD
      const hora = ahora.toTimeString().slice(0, 5) // HH:MM
      
      const { error } = await supabase
        .from('reservaciones')
        .insert({
          cliente_nombre: nuevaReservacion.cliente_nombre,
          fecha: fecha,
          hora: hora,
          numero_personas: nuevaReservacion.numero_personas,
          numero_hombres: nuevaReservacion.numero_hombres,
          numero_mujeres: nuevaReservacion.numero_mujeres,
          numero_ninos: 0,
          numero_ninas: 0,
          rp_nombre: nuevaReservacion.rp_nombre === "sin_rp" ? null : nuevaReservacion.rp_nombre,
          notas: nuevaReservacion.notas,
          estado: 'pendiente',
          creado_por: hostessNombre
        })
      
      if (error) throw error
      
      alert(`✅ Reservación creada para ${nuevaReservacion.cliente_nombre}`)
      
      // Limpiar y cerrar
      setDialogNuevaReservacion(false)
      setNuevaReservacion({
        cliente_nombre: "",
        numero_personas: 2,
        numero_hombres: 0,
        numero_mujeres: 0,
        rp_nombre: "sin_rp",
        notas: ""
      })
      
      await cargarDatos()
    } catch (error) {
      console.error('Error creando reservación:', error)
      alert('Error al crear la reservación')
    }
  }

  const handleConfirmarAsistencia = async () => {
    if (!reservacionSeleccionada || !mesaAsignada) {
      alert('Selecciona una mesa')
      return
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      const { asignarMesaCliente } = await import('@/lib/supabase-clientes')
      
      // 1. Actualizar reservación
      const { error: errorReservacion } = await supabase
        .from('reservaciones')
        .update({
          asistio: true,
          hora_llegada: new Date().toISOString(),
          mesa_asignada: mesaAsignada,
          estado: 'completada'
        })
        .eq('id', reservacionSeleccionada.id)
      
      if (errorReservacion) throw errorReservacion
      
      // 2. Asignar mesa
      const mesaData = mesasDisponibles.find(m => m.numero === mesaAsignada.toString())
      if (mesaData) {
        await asignarMesaCliente(mesaData.id, {
          cliente_nombre: reservacionSeleccionada.cliente_nombre,
          numero_personas: reservacionSeleccionada.numero_personas,
          hostess: hostessNombre,
          rp: reservacionSeleccionada.rp_nombre
        } as any)
      }
      
      alert(`✅ Mesa ${mesaAsignada} asignada a ${reservacionSeleccionada.cliente_nombre}`)
      
      // Limpiar y cerrar
      setDialogConfirmarAsistencia(false)
      setReservacionSeleccionada(null)
      setMesaAsignada(null)
      
      await cargarDatos()
    } catch (error) {
      console.error('Error confirmando asistencia:', error)
      alert('Error al confirmar asistencia')
    }
  }

  const handleCancelarReservacion = async (reservacionId: string) => {
    if (!confirm('¿Cancelar esta reservación?')) return

    try {
      const { supabase } = await import('@/lib/supabase')
      
      const { error } = await supabase
        .from('reservaciones')
        .update({ estado: 'cancelada' })
        .eq('id', reservacionId)
      
      if (error) throw error
      
      alert('✅ Reservación cancelada')
      await cargarDatos()
    } catch (error) {
      console.error('Error cancelando reservación:', error)
      alert('Error al cancelar reservación')
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'pendiente':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pendiente</Badge>
      case 'confirmada':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Confirmada</Badge>
      case 'completada':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completada</Badge>
      case 'cancelada':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Cancelada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-MX', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const formatHora = (hora: string) => {
    return hora.substring(0, 5) // HH:MM
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-50 glow-amber mb-2">
              📅 Reservaciones
            </h1>
            <p className="text-slate-400">
              Gestiona las reservaciones del restaurante
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificacionesEmergencia />
            <Button
              onClick={() => setDialogNuevaReservacion(true)}
              className="bg-gradient-to-r from-pink-600 to-rose-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reservación
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-hover border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {reservaciones.filter(r => r.estado === 'pendiente').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-hover border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Confirmadas</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {reservaciones.filter(r => r.estado === 'confirmada').length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-hover border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Completadas</p>
                  <p className="text-3xl font-bold text-green-500">
                    {reservaciones.filter(r => r.estado === 'completada').length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-hover border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Mesas Disponibles</p>
                  <p className="text-3xl font-bold text-emerald-500">
                    {mesasDisponibles.length}
                  </p>
                </div>
                <Armchair className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Reservaciones */}
        <Card className="glass-hover border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-50">Reservaciones del Día</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-400 py-8">Cargando reservaciones...</p>
            ) : reservaciones.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No hay reservaciones para hoy</p>
                <p className="text-xs text-slate-500">
                  ⚠️ Si acabas de crear la tabla, ejecuta el SQL en Supabase
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservaciones.map((reservacion) => (
                  <Card 
                    key={reservacion.id}
                    className="glass border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-50">
                              {reservacion.cliente_nombre}
                            </h3>
                            {getEstadoBadge(reservacion.estado)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar className="w-4 h-4" />
                              <span>{formatFecha(reservacion.fecha)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>{formatHora(reservacion.hora)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Users className="w-4 h-4" />
                              <span>{reservacion.numero_personas} personas</span>
                            </div>
                            {(reservacion.numero_hombres > 0 || reservacion.numero_mujeres > 0) && (
                              <div className="flex items-center gap-2 text-slate-400">
                                <Users className="w-4 h-4" />
                                <span>
                                  {reservacion.numero_hombres > 0 && `${reservacion.numero_hombres}👨`}
                                  {reservacion.numero_hombres > 0 && reservacion.numero_mujeres > 0 && ' '}
                                  {reservacion.numero_mujeres > 0 && `${reservacion.numero_mujeres}👩`}
                                </span>
                              </div>
                            )}
                          </div>

                          {reservacion.rp_nombre && (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">
                                RP: {reservacion.rp_nombre}
                              </Badge>
                            </div>
                          )}

                          {reservacion.notas && (
                            <p className="text-sm text-slate-500 italic">
                              {reservacion.notas}
                            </p>
                          )}

                          {reservacion.mesa_asignada && (
                            <div className="flex items-center gap-2">
                              <Armchair className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm text-emerald-500 font-medium">
                                Mesa {reservacion.mesa_asignada}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {reservacion.estado === 'pendiente' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setReservacionSeleccionada(reservacion)
                                  setDialogConfirmarAsistencia(true)
                                }}
                                className="bg-gradient-to-r from-emerald-600 to-green-600"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Llegó
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelarReservacion(reservacion.id)}
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Nueva Reservación */}
      <Dialog open={dialogNuevaReservacion} onOpenChange={setDialogNuevaReservacion}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-50">Nueva Reservación</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nombre del Cliente *</Label>
              <Input
                value={nuevaReservacion.cliente_nombre}
                onChange={(e) => setNuevaReservacion({...nuevaReservacion, cliente_nombre: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-slate-100"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Nota: Fecha y hora se registran automáticamente */}
            <div className="glass rounded-lg p-3 border border-blue-500/30">
              <p className="text-xs text-blue-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                La fecha y hora se registrarán automáticamente al crear la reservación
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-slate-300">Total Personas *</Label>
                <Select
                  value={nuevaReservacion.numero_personas.toString()}
                  onValueChange={(value) => setNuevaReservacion({...nuevaReservacion, numero_personas: parseInt(value)})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} persona{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Distribución de Personas</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Hombres 👨</Label>
                    <Select
                      value={nuevaReservacion.numero_hombres.toString()}
                      onValueChange={(value) => setNuevaReservacion({...nuevaReservacion, numero_hombres: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Array.from({length: nuevaReservacion.numero_personas + 1}, (_, i) => i).map((n: number) => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Mujeres 👩</Label>
                    <Select
                      value={nuevaReservacion.numero_mujeres.toString()}
                      onValueChange={(value) => setNuevaReservacion({...nuevaReservacion, numero_mujeres: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Array.from({length: nuevaReservacion.numero_personas + 1}, (_, i) => i).map((n: number) => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Validación visual */}
                {(() => {
                  const total = nuevaReservacion.numero_hombres + nuevaReservacion.numero_mujeres
                  const esValido = total === nuevaReservacion.numero_personas
                  return (
                    <div className={`text-xs p-2 rounded-lg mt-2 ${
                      esValido 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                      {esValido ? (
                        <span>✓ Distribución correcta: {total} de {nuevaReservacion.numero_personas} personas</span>
                      ) : (
                        <span>⚠ La suma debe ser {nuevaReservacion.numero_personas} personas (actual: {total})</span>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">¿Con quién tiene reservación? *</Label>
              <Select
                value={nuevaReservacion.rp_nombre || "sin_rp"}
                onValueChange={(value) => setNuevaReservacion({...nuevaReservacion, rp_nombre: value === "sin_rp" ? "" : value})}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Sin RP específico" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="sin_rp">Sin RP específico</SelectItem>
                  {rpsDisponibles.map((rp) => (
                    <SelectItem key={rp.rp_nombre} value={rp.rp_nombre}>
                      {rp.rp_nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Notas (Opcional)</Label>
              <Textarea
                value={nuevaReservacion.notas}
                onChange={(e) => setNuevaReservacion({...nuevaReservacion, notas: e.target.value})}
                className="bg-slate-800/50 border-slate-700 text-slate-100"
                placeholder="Preferencias, alergias, ocasión especial..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDialogNuevaReservacion(false)}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCrearReservacion}
                disabled={
                  !nuevaReservacion.cliente_nombre ||
                  !nuevaReservacion.rp_nombre ||
                  (nuevaReservacion.numero_hombres + nuevaReservacion.numero_mujeres) !== nuevaReservacion.numero_personas
                }
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600"
              >
                Crear Reservación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Asistencia */}
      <Dialog open={dialogConfirmarAsistencia} onOpenChange={setDialogConfirmarAsistencia}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50">Confirmar Asistencia</DialogTitle>
          </DialogHeader>
          
          {reservacionSeleccionada && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  {reservacionSeleccionada.cliente_nombre}
                </h3>
                <div className="space-y-1 text-sm text-slate-400">
                  <p>📅 {formatFecha(reservacionSeleccionada.fecha)} a las {formatHora(reservacionSeleccionada.hora)}</p>
                  <p>👥 {reservacionSeleccionada.numero_personas} personas</p>
                  {reservacionSeleccionada.rp_nombre && (
                    <p>✨ RP: {reservacionSeleccionada.rp_nombre}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Seleccionar Mesa *</Label>
                <select
                  value={mesaAsignada || ""}
                  onChange={(e) => setMesaAsignada(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-[200px] bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 overflow-y-auto"
                  size={8}
                >
                  <option value="" disabled>Selecciona una mesa disponible</option>
                  {mesasDisponibles.map((mesa) => (
                    <option 
                      key={mesa.id} 
                      value={mesa.numero}
                      className="py-2 hover:bg-slate-700"
                    >
                      Mesa {mesa.numero} (Capacidad: {mesa.capacidad})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  {mesasDisponibles.length} mesas disponibles - Usa scroll para ver todas
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogConfirmarAsistencia(false)
                    setReservacionSeleccionada(null)
                    setMesaAsignada(null)
                  }}
                  className="flex-1 border-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarAsistencia}
                  disabled={!mesaAsignada}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Confirmar y Asignar Mesa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
