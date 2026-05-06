"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, Lock, Eye, EyeOff, Sparkles, AlertCircle, UserCog, Zap,
  Search, ShoppingCart, Utensils, Gift, Clock, Check, 
  Calendar, Wine, Droplet, Award, ChefHat, LogOut, LayoutGrid,
  CheckCircle2, History, Upload, FileText, Trash2, CheckCircle
} from "lucide-react"
import { 
  obtenerMesas,
  obtenerLimitesRP,
  autorizarCortesia,
  obtenerCortesiasRP,
  crearCortesiaActiva,
  obtenerCortesiasActivasRP,
  actualizarTiempoCortesias,
  cerrarCortesiaActiva,
  suscribirCortesiasActivas,
  obtenerCortesiasParaNotificar,
  marcarNotificacionCortesia,
  type CortesiaActiva
} from "@/lib/supabase-clientes"

export default function RPPage() {
  const router = useRouter()
  const [mesas, setMesas] = useState<any[]>([])
  const [limites, setLimites] = useState<any>(null)
  const [cortesias, setCortesias] = useState<any[]>([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState<any | null>(null)
  const [dialogCortesia, setDialogCortesia] = useState(false)
  const [dialogConfirmarCortesia, setDialogConfirmarCortesia] = useState(false)
  const [dialogHistorial, setDialogHistorial] = useState(false)
  const [dialogReservaciones, setDialogReservaciones] = useState(false)
  const [dialogNuevaReservacion, setDialogNuevaReservacion] = useState(false)
  // Estados para procesamiento con IA (Claude) y texto
  const [dialogProcesarIA, setDialogProcesarIA] = useState(false)
  const [archivoIA, setArchivoIA] = useState<File | null>(null)
  const [fechaEventoIA, setFechaEventoIA] = useState(new Date().toISOString().split('T')[0])
  const [rpSeleccionadoIA, setRpSeleccionadoIA] = useState('')
  const [loadingProcesarIA, setLoadingProcesarIA] = useState(false)
  const [resultadoIA, setResultadoIA] = useState<any>(null)
  const [mensajeIA, setMensajeIA] = useState('')
  const [reservasConfirmadasIA, setReservasConfirmadasIA] = useState<any[]>([])
  const [rpsUnicos, setRpsUnicos] = useState<string[]>([])
  const [textoIA, setTextoIA] = useState('')
  const [modoIA, setModoIA] = useState<'texto' | 'archivo'>('texto')
  const [loadingCotejo, setLoadingCotejo] = useState(false)
  const [resultadoCotejo, setResultadoCotejo] = useState<string>('')
  const [dialogMenu, setDialogMenu] = useState(false)
  const [dialogPedido, setDialogPedido] = useState(false)
  const [mesaParaPedido, setMesaParaPedido] = useState<any | null>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [carritoPedido, setCarritoPedido] = useState<any[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [carritoMenu, setCarritoMenu] = useState<any[]>([])
  const [mesaSeleccionadaMenu, setMesaSeleccionadaMenu] = useState<any | null>(null)
  const [cortesiasActivas, setCortesiasActivas] = useState<CortesiaActiva[]>([])
  const [cortesiaExpandida, setCortesiaExpandida] = useState<string | null>(null)
  const [dialogCortesiasMesa, setDialogCortesiasMesa] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reservaciones, setReservaciones] = useState<any[]>([])
  const [rpsDisponibles, setRpsDisponibles] = useState<any[]>([])
  const [statsSemanales, setStatsSemanales] = useState({ reservadas: 0, llegaron: 0, efectividad: 0 })
  const [reservasHistoricas, setReservasHistoricas] = useState<any[]>([])
  const [filtroHistorial, setFiltroHistorial] = useState<'todos' | 'llego' | 'no_llego' | 'pendiente'>('todos')
  // Vista global
  const [todasReservas, setTodasReservas] = useState<any[]>([])
  const [clientesVivos, setClientesVivos] = useState<any[]>([])
  const [historialVisitas, setHistorialVisitas] = useState<any[]>([])
  const [vistaGlobal, setVistaGlobal] = useState<'reservas' | 'vivos' | 'historial' | 'analisis' | 'gestion-rps'>('reservas')
  
  // Estados para gestión de RPs (solo Ashton)
  const [rpsListado, setRpsListado] = useState<any[]>([])
  const [dialogNuevoRP, setDialogNuevoRP] = useState(false)
  const [dialogEditarRP, setDialogEditarRP] = useState(false)
  const [rpSeleccionado, setRpSeleccionado] = useState<any>(null)
  const [nuevoRP, setNuevoRP] = useState({
    rp_nombre: '',
    password: '',
    abreviatura: '',
    shots_disponibles: 5,
    perlas_negras_disponibles: 3,
    descuento_botella_disponible: 1,
    shots_bienvenida_disponibles: 10
  })
  const [filtroRPGlobal, setFiltroRPGlobal] = useState<string>('todos')
  const [filtroEstadoGlobal, setFiltroEstadoGlobal] = useState<string>('todos')
  const [rpsLista, setRpsLista] = useState<string[]>([])
  // Filtros para análisis de Ashton
  const [periodoAnalisis, setPeriodoAnalisis] = useState<'semana' | 'mes' | 'todas'>('todas')
  
  // Cargar nombre del RP inmediatamente desde localStorage
  const [rpNombre, setRpNombre] = useState(() => {
    if (typeof window !== 'undefined') {
      const nombre = localStorage.getItem("userName") || "RP"
      console.log('🔍 Nombre del RP desde localStorage:', nombre)
      return nombre
    }
    return ""
  })
  
  // Detectar si es Ashton para mostrar análisis exclusivo (después de declarar rpNombre)
  const esAshton = rpNombre.toLowerCase().includes('ashton') || rpNombre.toLowerCase().includes('admin')

  const [cortesiaForm, setCortesiaForm] = useState({
    tipo: "bufanda_rosa",
    cantidad: 0,
    notas: ""
  })

  const [nuevaReservacion, setNuevaReservacion] = useState({
    cliente_nombre: "",
    numero_personas: 2,
    numero_hombres: 0,
    numero_mujeres: 0,
    rp_nombre: "sin_rp",
    notas: ""
  })

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return
    
    if (!rpNombre) return
    
    verificarSesion()
    cargarDatos()
    cargarStatsSemanales()
    cargarReservasHistoricas()
    cargarDatosGlobales()
    const interval = setInterval(cargarDatos, 5000)
    const sesionInterval = setInterval(verificarSesion, 60000)
    const statsInterval = setInterval(cargarStatsSemanales, 15000)
    const globalInterval = setInterval(cargarDatosGlobales, 20000)
    return () => {
      clearInterval(interval)
      clearInterval(sesionInterval)
      clearInterval(statsInterval)
      clearInterval(globalInterval)
    }
  }, [rpNombre])

  // Cargar cortesías activas desde Supabase al iniciar
  useEffect(() => {
    const cargarCortesiasActivas = async () => {
      try {
        const cortesias = await obtenerCortesiasActivasRP(rpNombre)
        setCortesiasActivas(cortesias)
      } catch (error) {
        console.error('⚠️ Error cargando cortesías activas:', error)
        console.log('💡 Ejecuta EJECUTAR-PASO-A-PASO.sql en Supabase')
      }
    }
    
    if (rpNombre) {
      cargarCortesiasActivas()
    }
  }, [rpNombre])

  // Suscripción en tiempo real a cortesías activas
  useEffect(() => {
    if (!rpNombre) return
    
    try {
      const channel = suscribirCortesiasActivas(rpNombre, (cortesias) => {
        setCortesiasActivas(cortesias)
      })
      
      return () => {
        channel.unsubscribe()
      }
    } catch (error) {
      console.error('⚠️ Error en suscripción:', error)
    }
  }, [rpNombre])

  // Suscripción en tiempo real a reservaciones para actualizar stats
  useEffect(() => {
    if (!rpNombre) return
    
    const suscribirReservaciones = async () => {
      const { supabase } = await import('@/lib/supabase')
      
      const channel = supabase
        .channel('reservaciones-rp')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reservaciones',
            filter: `rp_nombre=eq.${rpNombre}`
          },
          (payload) => {
            console.log('🔄 Cambio en reservaciones:', payload)
            // Recargar stats inmediatamente
            cargarStatsSemanales()
            // También recargar límites por si llegó una reservación (bufandas acumulables)
            obtenerLimitesRP(rpNombre).then(setLimites)
          }
        )
        .subscribe()
      
      return channel
    }
    
    const channelPromise = suscribirReservaciones()
    
    return () => {
      channelPromise.then(channel => channel.unsubscribe())
    }
  }, [rpNombre])

  // Temporizador para actualizar tiempo en Supabase
  useEffect(() => {
    if (!rpNombre) return
    
    const timer = setInterval(async () => {
      try {
        // Actualizar tiempo en Supabase (reduce 1 segundo a todas)
        await actualizarTiempoCortesias()
        
        // Recargar cortesías actualizadas
        const cortesias = await obtenerCortesiasActivasRP(rpNombre)
        setCortesiasActivas(cortesias)
      } catch (error) {
        // Silenciar error si la tabla no existe aún
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [rpNombre])

  // Sistema de notificaciones
  useEffect(() => {
    const notificacionesTimer = setInterval(async () => {
      try {
        const cortesiasNotificar = await obtenerCortesiasParaNotificar()
        
        cortesiasNotificar.forEach(async (cortesia: any) => {
          if (cortesia.tipo_notificacion === '5min') {
            alert(`⚠️ URGENTE: Cortesía ${cortesia.folio || ''} en Mesa ${cortesia.mesa_numero} expira en 5 minutos!\n\n${cortesia.descripcion}`)
            await marcarNotificacionCortesia(cortesia.id, '5min')
          } else if (cortesia.tipo_notificacion === '10min') {
            alert(`⏰ Cortesía ${cortesia.folio || ''} en Mesa ${cortesia.mesa_numero} expira en 10 minutos\n\n${cortesia.descripcion}`)
            await marcarNotificacionCortesia(cortesia.id, '10min')
          }
        })
      } catch (error) {
        // Silenciar error si la tabla no existe aún
      }
    }, 60000) // Cada minuto
    
    return () => clearInterval(notificacionesTimer)
  }, [])

  function verificarSesion() {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return
    
    const sesion = localStorage.getItem('rp_sesion')
    if (!sesion) {
      router.push('/dashboard/rp-login')
      return
    }

    try {
      const { timestamp } = JSON.parse(sesion)
      const ahora = new Date().getTime()
      const tiempoTranscurrido = ahora - timestamp
      const tresHoras = 3 * 60 * 60 * 1000 // 3 horas en milisegundos

      if (tiempoTranscurrido >= tresHoras) {
        // Sesión expirada
        localStorage.removeItem('rp_sesion')
        alert('⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
        router.push('/dashboard/rp-login')
      }
    } catch (error) {
      console.error('Error verificando sesión:', error)
      router.push('/dashboard/rp-login')
    }
  }

  function handleCerrarSesion() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('rp_sesion')
      router.push('/dashboard/rp-login')
    }
  }

  async function cargarReservasHistoricas() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .eq('rp_nombre', rpNombre)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })
      if (!error) setReservasHistoricas(data || [])
    } catch (e) {
      console.error('Error cargando historial reservas:', e)
    }
  }

  async function cargarDatosGlobales() {
    try {
      const { supabase } = await import('@/lib/supabase')
      console.log('🌐 Cargando datos globales para:', rpNombre)

      // 1. Todas las reservaciones de todos los RPs (sin límite de fecha)
      const { data: todasData, error: errorReservas } = await supabase
        .from('reservaciones')
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })
      
      if (errorReservas) {
        console.error('❌ Error cargando reservas:', errorReservas)
      } else {
        console.log('✅ Reservas cargadas:', todasData?.length || 0)
      }
      
      const reservas = todasData || []
      setTodasReservas(reservas)
      
      // RPs únicos para filtro
      const rps = Array.from(new Set(reservas.filter((r: any) => r.rp_nombre).map((r: any) => r.rp_nombre as string))).sort() as string[]
      setRpsLista(rps)

      // 2. Clientes actualmente en el restaurante (mesas ocupadas)
      const { data: mesasOcupadas, error: errorMesas } = await supabase
        .from('mesas')
        .select('*')
        .eq('estado', 'ocupada')
        .order('numero')
      
      if (errorMesas) {
        console.error('❌ Error cargando mesas:', errorMesas)
      } else {
        console.log('✅ Mesas ocupadas:', mesasOcupadas?.length || 0)
      }
      
      setClientesVivos(mesasOcupadas || [])

      // 3. Historial de visitas (últimas 100)
      const { data: visitasData, error: errorVisitas } = await supabase
        .from('visitas')
        .select('*, clientes(nombre, telefono)')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (errorVisitas) {
        console.error('❌ Error cargando visitas:', errorVisitas)
      } else {
        console.log('✅ Visitas cargadas:', visitasData?.length || 0)
      }
      
      setHistorialVisitas(visitasData || [])
    } catch (e) {
      console.error('Error cargando datos globales:', e)
    }
  }

  async function cotejarMesasConReservaciones() {
    setLoadingCotejo(true)
    setResultadoCotejo('🔄 Cotejando mesas con reservaciones...')
    try {
      const { supabase } = await import('@/lib/supabase')

      // 1. Obtener todas las mesas que tienen hora_asignacion registrada
      const { data: todasMesas, error: errorMesas } = await supabase
        .from('mesas')
        .select('*')
        .not('hora_asignacion', 'is', null)

      if (errorMesas) throw errorMesas

      // 2. Fechas únicas de las mesas
      const fechasUnicas = Array.from(new Set(
        (todasMesas || [])
          .filter((m: any) => m.hora_asignacion)
          .map((m: any) => new Date(m.hora_asignacion).toISOString().split('T')[0])
      ))

      if (fechasUnicas.length === 0) {
        setResultadoCotejo('⚠️ No hay mesas con fecha de asignación registrada')
        setLoadingCotejo(false)
        return
      }

      // 3. Reservaciones pendientes para esas fechas
      const { data: reservsPendientes, error: errorReservs } = await supabase
        .from('reservaciones')
        .select('*')
        .in('fecha', fechasUnicas)
        .is('asistio', null)

      if (errorReservs) throw errorReservs
      if (!reservsPendientes || reservsPendientes.length === 0) {
        setResultadoCotejo('ℹ️ No hay reservaciones pendientes para las fechas de las mesas')
        setLoadingCotejo(false)
        return
      }

      // 4. Cotejar: misma fecha + mismo RP
      const idsParaMarcar: number[] = []
      const coincidencias: string[] = []

      for (const mesa of (todasMesas || [])) {
        if (!mesa.hora_asignacion || !mesa.rp_nombre) continue
        const fechaMesa = new Date(mesa.hora_asignacion).toISOString().split('T')[0]

        const match = reservsPendientes.find((r: any) =>
          r.fecha === fechaMesa &&
          r.rp_nombre === mesa.rp_nombre &&
          !idsParaMarcar.includes(r.id)
        )
        if (match) {
          idsParaMarcar.push(match.id)
          coincidencias.push(`${match.cliente_nombre} (${match.rp_nombre}) — ${fechaMesa}`)
        }
      }

      if (idsParaMarcar.length === 0) {
        setResultadoCotejo('⚠️ No se encontraron coincidencias RP+fecha entre mesas y reservaciones')
        setLoadingCotejo(false)
        return
      }

      // 5. Marcar como llegaron
      const { error: errorUpdate } = await supabase
        .from('reservaciones')
        .update({ asistio: true, estado: 'confirmada' })
        .in('id', idsParaMarcar)

      if (errorUpdate) throw errorUpdate

      setResultadoCotejo(`✅ ${idsParaMarcar.length} marcadas como llegaron:\n${coincidencias.slice(0, 10).join('\n')}${coincidencias.length > 10 ? `\n...y ${coincidencias.length - 10} más` : ''}`)
      await Promise.all([cargarReservaciones(), cargarReservasHistoricas(), cargarStatsSemanales(), cargarDatosGlobales()])
    } catch (e: any) {
      setResultadoCotejo(`❌ Error: ${e.message || 'Error desconocido'}`)
    } finally {
      setLoadingCotejo(false)
    }
  }

  async function cargarStatsSemanales() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Obtener fecha de hace 7 días
      const hace7Dias = new Date()
      hace7Dias.setDate(hace7Dias.getDate() - 7)
      const fechaInicio = hace7Dias.toISOString().split('T')[0]
      
      // Contar reservaciones creadas por este RP en la última semana
      const { data: reservadasData, error: errorReservadas } = await supabase
        .from('reservaciones')
        .select('id, asistio, estado, cliente_nombre')
        .eq('rp_nombre', rpNombre)
        .gte('fecha', fechaInicio)
      
      if (errorReservadas) {
        console.error('Error cargando stats:', errorReservadas)
        return
      }
      
      // Solo contar reservaciones confirmadas para la efectividad
      const reservacionesConfirmadas = reservadasData?.filter(r => r.estado === 'confirmada') || []
      const totalConfirmadas = reservacionesConfirmadas.length
      const totalLlegaron = reservacionesConfirmadas.filter(r => r.asistio === true).length
      const efectividad = totalConfirmadas > 0 ? (totalLlegaron / totalConfirmadas) * 100 : 0
      
      console.log('📊 Total confirmadas:', totalConfirmadas)
      console.log('📊 Llegaron físicamente:', totalLlegaron)
      console.log('📊 Efectividad:', Math.round(efectividad) + '%')
      
      setStatsSemanales({
        reservadas: totalConfirmadas,
        llegaron: totalLlegaron,
        efectividad: Math.round(efectividad)
      })
    } catch (error) {
      console.error('Error cargando stats semanales:', error)
    }
  }

  async function cargarDatos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      console.log('🔍 Cargando datos para RP:', rpNombre)
      
      const [limitesData, cortesiasData, reservacionesConfirmadas, productosData] = await Promise.all([
        obtenerLimitesRP(rpNombre),
        obtenerCortesiasRP(rpNombre),
        // Cargar reservaciones confirmadas de este RP
        supabase
          .from('reservaciones')
          .select('*')
          .eq('rp_nombre', rpNombre)
          .eq('estado', 'confirmada')
          .then(({ data }) => data || []),
        // Cargar productos para el menú de pedidos
        supabase
          .from('productos')
          .select('*')
          .order('categoria', { ascending: true })
          .order('nombre', { ascending: true })
          .then(({ data }) => data || [])
      ])
      
      console.log('📊 Límites obtenidos:', limitesData)
      console.log('🎁 Cortesías obtenidas:', cortesiasData?.length || 0)
      
      // Cargar SOLO las mesas asignadas a este RP
      console.log('🔍 Buscando mesas para RP:', rpNombre)
      
      const { data: mesasData, error: mesasError } = await supabase
        .from('mesas')
        .select(`
          *,
          meseros (
            id,
            nombre
          )
        `)
        .eq('estado', 'ocupada')
        .eq('rp_asignado', rpNombre)  // ✅ FILTRO: Solo mesas de este RP
      
      if (mesasError) {
        console.error('❌ Error cargando mesas:', mesasError)
      }
      
      console.log('📊 Mesas encontradas:', mesasData?.length || 0)
      console.log('📋 Detalle de mesas:', mesasData)
      
      // Filtrar solo mesas ocupadas reales con cliente
      const mesasRP = (mesasData || [])
        .filter((m: any) => m.cliente_nombre)
        .map((m: any) => ({
          ...m,
          mesero: m.meseros?.nombre || 'Sin asignar'
        }))
      
      console.log('✅ Mesas filtradas con cliente:', mesasRP.length)
      
      setMesas(mesasRP)
      setLimites(limitesData)
      setCortesias(cortesiasData)
      setProductos(productosData || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cargarReservaciones() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Cargar reservaciones creadas por este RP
      const hoy = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .eq('creado_por', rpNombre)
        .gte('fecha', hoy)
        .eq('activo', true)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })
      
      if (error) throw error
      setReservaciones(data || [])
      
      // Cargar RPs disponibles
      const { data: rpsData, error: errorRPs } = await supabase
        .from('limites_cortesias_rp')
        .select('rp_nombre')
        .eq('activo', true)
        .order('rp_nombre')
      
      if (errorRPs) throw errorRPs
      setRpsDisponibles(rpsData || [])
    } catch (error) {
      console.error('Error cargando reservaciones:', error)
    }
  }

  async function handleCrearReservacion() {
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
          rp_nombre: rpNombre,
          notas: nuevaReservacion.notas,
          estado: 'pendiente',
          creado_por: rpNombre
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
      
      await cargarReservaciones()
    } catch (error: any) {
      console.error('Error creando reservación:', error)
      alert(`Error al crear la reservación: ${error?.message || error || 'Error desconocido'}`)
    }
  }

  // ========== FUNCIONES PARA PROCESAMIENTO CON IA (CLAUDE) ==========
  async function cargarRPsUnicos() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('limites_cortesias_rp')
        .select('rp_nombre')
        .eq('activo', true)
        .order('rp_nombre')
      
      if (!error && data) {
        const nombres = data.map(r => r.rp_nombre)
        setRpsUnicos(nombres)
        setRpsLista(nombres)
      }
    } catch (e) {
      console.error('Error cargando RPs:', e)
    }
  }

  // ========== FUNCIÓN PARA GESTIÓN DE RPs (ASHTON) ==========
  async function cargarRPsListado() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('limites_cortesias_rp')
        .select('*')
        .order('rp_nombre')
      
      if (!error && data) {
        setRpsListado(data)
      }
    } catch (e) {
      console.error('Error cargando listado de RPs:', e)
    }
  }

  // Cargar RPs al iniciar si es Ashton
  useEffect(() => {
    if (esAshton) {
      cargarRPsListado()
    }
  }, [esAshton])

  async function cargarRPsUnicosOriginal() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('reservaciones')
        .select('rp_nombre')
        .not('rp_nombre', 'is', null)
      
      if (error) throw error
      
      const unicos = Array.from(new Set(data?.map(r => r.rp_nombre) || [])).sort()
      setRpsUnicos(unicos)
    } catch (error) {
      console.error('Error cargando RPs:', error)
    }
  }

  async function handleProcesarConClaude() {
    if (modoIA === 'texto') {
      if (!textoIA.trim()) {
        setMensajeIA('❌ Pega el texto de las reservaciones primero')
        return
      }

      setLoadingProcesarIA(true)
      setMensajeIA('🤖 Procesando con Claude...')
      setResultadoIA(null)

      try {
        // Dividir el texto en partes si es muy grande (> 500KB)
        const MAX_SIZE = 500 * 1024; // 500KB
        const textos = textoIA.length > MAX_SIZE
          ? dividirTextoEnPartes(textoIA, MAX_SIZE)
          : [textoIA];

        const todasLasReservas: any[] = [];
        const todasLasFechas = new Set<string>();

        for (let i = 0; i < textos.length; i++) {
          setMensajeIA(`🤖 Procesando parte ${i + 1} de ${textos.length}...`);

          const fd = new FormData();
          fd.append('texto', textos[i]);
          fd.append('fechaHoy', new Date().toISOString().split('T')[0]);

          const response = await fetch('/api/procesar-reservas', {
            method: 'POST',
            body: fd
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Error procesando parte ${i + 1}`);
          }

          todasLasReservas.push(...(data.data.reservaciones || []));
          (data.data.reservaciones || []).forEach((r: any) => todasLasFechas.add(r.fecha));
        }

        setResultadoIA({
          ...{ total_reservaciones: todasLasReservas.length },
          reservaciones: todasLasReservas
        });
        setReservasConfirmadasIA(todasLasReservas);
        const fechasStr = Array.from(todasLasFechas).sort().join(', ');
        setMensajeIA(`✅ ${todasLasReservas.length} reservaciones detectadas — fechas: ${fechasStr}`);
      } catch (error) {
        console.error('Error:', error);
        setMensajeIA(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setLoadingProcesarIA(false);
      }
      return
    }

    // Modo archivo - enviar a Claude API
    if (!archivoIA) {
      setMensajeIA('❌ Selecciona un archivo primero')
      return
    }
    if (!fechaEventoIA) {
      setMensajeIA('❌ Selecciona la fecha del evento')
      return
    }

    setLoadingProcesarIA(true)
    setMensajeIA('🤖 Procesando con Claude Haiku 4.5...')
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

  // Función auxiliar para dividir texto en partes
  function dividirTextoEnPartes(texto: string, maxTamaño: number): string[] {
    const partes: string[] = [];
    const lineas = texto.split('\n');
    let parteActual = '';

    for (const linea of lineas) {
      const nuevaTamaño = (parteActual + '\n' + linea).length;

      // Si agregar esta línea excede el límite, guardar la parte actual
      if (parteActual.length > 0 && nuevaTamaño > maxTamaño) {
        // Si la línea es un encabezado de fecha (ej: "MIÉRCOLES 25"), incluirla en la nueva parte
        if (/^(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\s+\d{1,2}/i.test(linea.trim())) {
          partes.push(parteActual.trim());
          parteActual = linea;
        } else {
          partes.push(parteActual.trim());
          parteActual = linea;
        }
      } else {
        parteActual += (parteActual ? '\n' : '') + linea;
      }
    }

    if (parteActual.trim()) {
      partes.push(parteActual.trim());
    }

    return partes.length > 0 ? partes : [texto];
  }

  async function handleGuardarReservacionesIA() {
    if (reservasConfirmadasIA.length === 0) return

    const reservasFinales = rpSeleccionadoIA
      ? reservasConfirmadasIA.map(r => ({ ...r, rp_nombre: rpSeleccionadoIA }))
      : reservasConfirmadasIA

    setLoadingProcesarIA(true)
    setMensajeIA('💾 Guardando en Supabase...')

    try {
      const { supabase } = await import('@/lib/supabase')
      
      const hoy = new Date().toISOString().split('T')[0]
      const reservasParaGuardar = reservasFinales.map(r => {
        const esPasada = (r.fecha || hoy) < hoy
        return {
          cliente_nombre: r.cliente_nombre,
          cliente_telefono: r.telefono || '',
          fecha: r.fecha || hoy,
          hora: r.hora || '20:00',
          numero_personas: r.numero_personas || 2,
          rp_nombre: r.rp_nombre || rpNombre,
          estado: esPasada ? 'confirmada' : 'pendiente',
          notas: r.notas || '',
          asistio: esPasada ? true : null,
          creado_por: rpNombre + ' (IA)'
        }
      })

      const pasadas = reservasParaGuardar.filter(r => r.fecha < hoy).length
      const futuras = reservasParaGuardar.length - pasadas

      const { error } = await supabase.from('reservaciones').insert(reservasParaGuardar)

      if (error) throw error

      const msg = pasadas > 0
        ? `✅ ${reservasParaGuardar.length} reservaciones guardadas (${futuras} activas${pasadas > 0 ? `, ${pasadas} en historial por ser de fechas pasadas` : ''})`
        : `✅ ${reservasParaGuardar.length} reservaciones guardadas`
      setMensajeIA(msg)
      
      // Recargar datos
      await cargarReservaciones()
      await cargarReservasHistoricas()
      await cargarDatosGlobales()
      await cargarStatsSemanales()
      
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
  // ========== FIN FUNCIONES IA ==========

  const getCortesiaInfo = (tipo: string) => {
    // Solo Bufanda Rosa disponible - datos desde Supabase (acumulables por llegada)
    const disponibles = limites ? (limites.bufandas_rosa_disponibles || 0) - (limites.bufandas_rosa_usadas || 0) : 0
    const total = limites?.bufandas_rosa_disponibles || 0
    return {
      nombre: "Bufanda Rosa",
      disponibles: disponibles,
      total: total,
      icon: Gift,
      color: "text-pink-500"
    }
  }

  const handleSolicitarAutorizacion = () => {
    if (!mesaSeleccionada) return

    const info = getCortesiaInfo(cortesiaForm.tipo)
    
    // Verificar límites
    if (info.disponibles < cortesiaForm.cantidad) {
      alert(`❌ No tienes suficientes ${info.nombre} disponibles. Disponibles: ${info.disponibles}`)
      return
    }

    // Mostrar diálogo de confirmación
    setDialogConfirmarCortesia(true)
  }

  const handleAutorizarCortesia = async () => {
    if (!mesaSeleccionada) return

    // Validar que la cantidad sea mayor a 0
    if (cortesiaForm.cantidad === 0 || cortesiaForm.cantidad < 1) {
      alert('❌ Debes ingresar una cantidad válida (mayor a 0)')
      return
    }

    // Validar disponibilidad antes de autorizar
    const info = getCortesiaInfo(cortesiaForm.tipo)
    if (info.disponibles < cortesiaForm.cantidad) {
      alert(`❌ No tienes suficientes ${info.nombre} disponibles\n\nDisponibles: ${info.disponibles}\nSolicitadas: ${cortesiaForm.cantidad}`)
      return
    }

    try {
      const descripcion = `${cortesiaForm.cantidad} Bufanda${cortesiaForm.cantidad > 1 ? 's' : ''} Rosa`

      await autorizarCortesia({
        rp_nombre: rpNombre,
        mesa_id: mesaSeleccionada.id,
        mesa_numero: parseInt(mesaSeleccionada.numero),
        cliente_nombre: mesaSeleccionada.cliente_nombre,
        tipo_cortesia: cortesiaForm.tipo,
        descripcion: descripcion,
        cantidad: cortesiaForm.cantidad,
        valor_descuento: 0,
        notas: cortesiaForm.notas
      })

      setDialogConfirmarCortesia(false)
      setDialogCortesia(false)
      setCortesiaForm({ tipo: "bufanda_rosa", cantidad: 0, notas: "" })
      
      // Recargar límites actualizados INMEDIATAMENTE
      const limitesActualizados = await obtenerLimitesRP(rpNombre)
      setLimites(limitesActualizados)
      console.log('🔄 Límites actualizados:', limitesActualizados)
      
      // Crear cortesía activa en Supabase (si la tabla existe)
      try {
        const nuevaCortesia = {
          id: `${mesaSeleccionada.id}-${Date.now()}`,
          rp_nombre: rpNombre,
          mesa_id: mesaSeleccionada.id,
          mesa_numero: mesaSeleccionada.numero,
          cliente_nombre: mesaSeleccionada.cliente_nombre,
          tipo_cortesia: cortesiaForm.tipo,
          descripcion: descripcion,
          cantidad: cortesiaForm.cantidad,
          fecha_autorizacion: Date.now()
        }
        
        // Guardar en Supabase y obtener folio generado
        const folio = await crearCortesiaActiva(nuevaCortesia)
        console.log('✅ Cortesía creada con folio:', folio)
        
        // Recargar cortesías activas desde Supabase
        const cortesiasActualizadas = await obtenerCortesiasActivasRP(rpNombre)
        console.log('🔄 Cortesías actualizadas:', cortesiasActualizadas)
        console.log('📊 Total cortesías activas:', cortesiasActualizadas?.length || 0)
        setCortesiasActivas(cortesiasActualizadas)
        
        // Expandir la cortesía recién creada
        setCortesiaExpandida(nuevaCortesia.id)
        
        // Mostrar mensaje de éxito
        alert(`✅ Cortesía autorizada exitosamente!\n\nFolio: ${folio}\nMesa: ${mesaSeleccionada.numero}\nTiempo: 15:00 minutos`)
      } catch (error) {
        console.error('⚠️ Error creando cortesía activa:', error)
        console.log('💡 Ejecuta EJECUTAR-PASO-A-PASO.sql en Supabase para habilitar cortesías activas')
      }
      
      await cargarDatos() // Recargar datos completos
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al autorizar cortesía')
    }
  }

  // Filtrar cortesías de hoy
  const cortesiasHoy = cortesias.filter((c: any) => {
    const fecha = new Date(c.fecha_autorizacion)
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  })

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 glow-purple">Panel RP</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Bienvenido, {rpNombre}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <Button
            onClick={() => window.location.href = '/dashboard/selector-rol'}
            variant="outline"
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 h-10 text-sm flex-1 md:flex-none"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Menú Staff</span>
            <span className="md:hidden">Menú</span>
          </Button>
          <Button
            onClick={() => setDialogNuevaReservacion(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-10 text-sm flex-1 md:flex-none"
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Nueva Reservación</span>
            <span className="md:hidden">Nueva</span>
          </Button>
          <Button
            onClick={() => setDialogReservaciones(true)}
            variant="outline"
            className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10 h-10 text-sm flex-1 md:flex-none"
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Mis Reservaciones</span>
            <span className="md:hidden">Reservas</span>
          </Button>
          {esAshton && (
            <Button
              onClick={() => { 
                setMensajeIA(''); 
                setResultadoIA(null); 
                setReservasConfirmadasIA([]); 
                setArchivoIA(null);
                setTextoIA('');
                setModoIA('texto');
                cargarRPsUnicos();
                setDialogProcesarIA(true);
              }}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 h-10 text-sm flex-1 md:flex-none text-white"
            >
              <span className="text-lg mr-1">📋</span>
              <span className="hidden md:inline">Procesar Reservaciones</span>
              <span className="md:hidden">Reservas</span>
            </Button>
          )}
          <Button
            onClick={() => setDialogHistorial(true)}
            variant="outline"
            className="border-slate-700 h-10 text-sm flex-1 md:flex-none"
          >
            <History className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Ver Historial</span>
            <span className="md:hidden">Historial</span>
          </Button>
          <NotificacionesEmergencia />
          <Button
            onClick={handleCerrarSesion}
            variant="outline"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10 h-10 text-sm w-full md:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>

      {/* Cortesía Bufanda Rosa */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
            <span className="text-xl">🧣</span>
            Cortesía Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="glass rounded-xl p-4 md:p-6 border-2 border-pink-500/30 bg-pink-500/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <span className="text-3xl">🧣</span>
              </div>
              <div className="flex-1">
                <p className="text-xl md:text-2xl font-bold text-pink-400">Bufanda Rosa</p>
                <p className="text-sm text-slate-400">+3 bufandas por cada reservación que llega</p>
              </div>
              <div className="text-right">
                <p className="text-3xl md:text-4xl font-bold text-pink-500">
                  {limites ? (limites.bufandas_rosa_disponibles || 0) - (limites.bufandas_rosa_usadas || 0) : 0}
                </p>
                <p className="text-xs text-slate-400">disponibles hoy</p>
                {limites && (limites.bufandas_rosa_usadas || 0) > 0 && (
                  <p className="text-xs text-pink-400 mt-1">
                    {limites.bufandas_rosa_usadas} usadas
                  </p>
                )}
              </div>
            </div>
            {/* Barra de progreso */}
            {limites && (
              <div className="mt-4">
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(((limites.bufandas_rosa_disponibles || 3) - (limites.bufandas_rosa_usadas || 0)) / (limites.bufandas_rosa_disponibles || 3)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-400">Mesas Activas</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-500">{mesas.length}</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-400">Cortesías Hoy</p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-500">{cortesiasHoy.length}</p>
              </div>
              <Gift className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-400">Reservaciones</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-500">{reservaciones.length}</p>
              </div>
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-400">Reservas Semana</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-500">{statsSemanales.reservadas}</p>
              </div>
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efectividad Semanal */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
            Efectividad Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="glass rounded-xl p-4 md:p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-400">Reservaciones que llegaron</p>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {statsSemanales.efectividad}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Llegaron / Total</p>
                <p className="text-xl font-bold text-emerald-400">
                  {statsSemanales.llegaron} / {statsSemanales.reservadas}
                </p>
              </div>
            </div>
            
            {/* Barra de progreso moderna */}
            <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-purple-500/50"
                style={{ width: `${statsSemanales.efectividad}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== PANEL GLOBAL: RESERVACIONES + CLIENTES ===== */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              Panel Global
            </CardTitle>
            <button onClick={cargarDatosGlobales} className="text-xs text-purple-400 hover:text-purple-200 underline underline-offset-2">
              Actualizar
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Métricas globales top */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-xl p-3 text-center border border-purple-500/20 bg-purple-500/5">
              <p className="text-2xl font-bold text-purple-400">{todasReservas.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total Reservas</p>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-2xl font-bold text-emerald-400">{clientesVivos.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">En el lugar ahora</p>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-blue-500/20 bg-blue-500/5">
              <p className="text-2xl font-bold text-blue-400">{historialVisitas.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Visitas historial</p>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl">
            {([
              { key: 'reservas', label: '📋 Reservaciones', count: todasReservas.length },
              { key: 'vivos',    label: '🟢 En el lugar',   count: clientesVivos.length },
              { key: 'historial',label: '📜 Historial',     count: historialVisitas.length },
              ...(esAshton ? [{ key: 'analisis', label: '📊 Análisis', count: null }] : []),
              ...(esAshton ? [{ key: 'gestion-rps', label: '⚙️ Gestionar RPs', count: null }] : []),
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setVistaGlobal(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  vistaGlobal === t.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${vistaGlobal === t.key ? 'bg-white/20' : 'bg-slate-700'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ---- PESTAÑA: TODAS LAS RESERVACIONES ---- */}
          {vistaGlobal === 'reservas' && (
            <div className="space-y-3">
              {/* Stats rápidas */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Llegaron', val: todasReservas.filter(r => r.asistio === true || r.estado === 'confirmada' || r.estado === 'completada').length, color: 'text-emerald-400' },
                  { label: 'No llegaron', val: todasReservas.filter(r => r.estado === 'no_asistio').length, color: 'text-red-400' },
                  { label: 'Pendientes', val: todasReservas.filter(r => r.estado === 'pendiente').length, color: 'text-amber-400' },
                  { label: 'Canceladas', val: todasReservas.filter(r => r.estado === 'cancelada').length, color: 'text-slate-500' },
                ].map(s => (
                  <div key={s.label} className="glass rounded-lg p-2 text-center border border-slate-700/50">
                    <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filtros */}
              <div className="flex gap-2 flex-wrap items-center">
                <select
                  value={filtroRPGlobal}
                  onChange={e => setFiltroRPGlobal(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5"
                >
                  <option value="todos">Todos los RPs</option>
                  {rpsLista.map(rp => <option key={rp} value={rp}>{rp}</option>)}
                </select>
                <select
                  value={filtroEstadoGlobal}
                  onChange={e => setFiltroEstadoGlobal(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="confirmada">✓ Confirmada</option>
                  <option value="completada">✅ Completada</option>
                  <option value="no_asistio">❌ No asistió</option>
                  <option value="cancelada">✗ Cancelada</option>
                </select>
              </div>

              {/* Lista reservaciones */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {todasReservas
                  .filter(r => {
                    const okRP = filtroRPGlobal === 'todos' || r.rp_nombre === filtroRPGlobal
                    const okEstado = filtroEstadoGlobal === 'todos' || r.estado === filtroEstadoGlobal
                    return okRP && okEstado
                  })
                  .map((r: any) => {
                    const llego = r.asistio === true || r.estado === 'confirmada' || r.estado === 'completada'
                    const noLlego = r.estado === 'no_asistio'
                    return (
                      <div key={r.id} className={`glass rounded-xl p-3 border transition-colors ${
                        llego ? 'border-emerald-500/20 bg-emerald-500/5' :
                        noLlego ? 'border-red-500/20 bg-red-500/5' :
                        'border-slate-700/40'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-200 text-sm">{r.cliente_nombre}</p>
                              {r.rp_nombre && (
                                <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full px-1.5 py-0.5">
                                  👑 {r.rp_nombre}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-500">📅 {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span className="text-xs text-slate-500">🕐 {r.hora}</span>
                              <span className="text-xs text-slate-500">👥 {r.numero_personas} pax</span>
                              {r.mesa_asignada && <span className="text-xs text-yellow-400">Mesa {r.mesa_asignada}</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {llego ? (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">✅ Llegó</span>
                            ) : noLlego ? (
                              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">❌ No llegó</span>
                            ) : r.estado === 'cancelada' ? (
                              <span className="text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full px-2 py-0.5">✗ Cancelada</span>
                            ) : (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">⏳ Pendiente</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                {todasReservas.filter(r => {
                  const okRP = filtroRPGlobal === 'todos' || r.rp_nombre === filtroRPGlobal
                  const okEstado = filtroEstadoGlobal === 'todos' || r.estado === filtroEstadoGlobal
                  return okRP && okEstado
                }).length === 0 && (
                  <div className="text-center py-10 text-slate-500">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin reservaciones con este filtro</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- PESTAÑA: CLIENTES EN EL LUGAR AHORA ---- */}
          {vistaGlobal === 'vivos' && (
            <div className="space-y-2">
              {/* Botón de cotejo */}
              <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                <Button
                  size="sm"
                  onClick={cotejarMesasConReservaciones}
                  disabled={loadingCotejo}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs"
                >
                  {loadingCotejo ? '🔄 Cotejando...' : '🔗 Cotejar mesas con reservaciones'}
                </Button>
              </div>
              {resultadoCotejo && (
                <pre className={`text-xs p-2 rounded-lg whitespace-pre-wrap border ${
                  resultadoCotejo.startsWith('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  resultadoCotejo.startsWith('❌') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}>{resultadoCotejo}</pre>
              )}
              {clientesVivos.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay clientes en el restaurante ahora</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-2">Mesas ocupadas en tiempo real — actualiza cada 20 seg</p>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {clientesVivos.map((mesa: any) => (
                      <div key={mesa.id} className="glass rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 font-bold">Mesa {mesa.numero}</span>
                              <p className="font-semibold text-slate-200 text-sm truncate">{mesa.cliente_nombre || 'Sin nombre'}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {mesa.rp_nombre && <span className="text-xs text-yellow-400">👑 {mesa.rp_nombre}</span>}
                              {mesa.hostess && <span className="text-xs text-purple-400">🧍 {mesa.hostess}</span>}
                              {mesa.numero_personas && <span className="text-xs text-slate-500">👥 {mesa.numero_personas} pax</span>}
                              {mesa.hora_asignacion && (
                                <span className="text-xs text-slate-500">
                                  🕐 Desde {new Date(mesa.hora_asignacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---- PESTAÑA: HISTORIAL DE VISITAS ---- */}
          {vistaGlobal === 'historial' && (
            <div className="space-y-2">
              {historialVisitas.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sin historial de visitas</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {historialVisitas.map((v: any) => (
                    <div key={v.id} className="glass rounded-xl p-3 border border-slate-700/40">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 text-sm">
                            {v.clientes?.nombre || v.cliente_nombre || 'Cliente'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {v.clientes?.telefono && <span className="text-xs text-slate-500">📞 {v.clientes.telefono}</span>}
                            {v.mesa_numero && <span className="text-xs text-purple-400">Mesa {v.mesa_numero}</span>}
                            {v.rp_nombre && <span className="text-xs text-yellow-400">👑 {v.rp_nombre}</span>}
                            <span className="text-xs text-slate-500">
                              {new Date(v.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' '}
                              {new Date(v.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        {v.activa ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">🟢 Activa</span>
                        ) : (
                          <span className="text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full px-2 py-0.5">Finalizada</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---- PESTAÑA: ANÁLISIS ASHTON ---- */}
          {vistaGlobal === 'analisis' && (
            <div className="space-y-4">
              {/* Filtro período */}
              <div className="flex gap-2">
                {(['semana', 'mes', 'todas'] as const).map(p => {
                  const labels = { semana: '📅 Esta semana', mes: '📆 Este mes', todas: '📋 Todas' }
                  return (
                    <button
                      key={p}
                      onClick={() => setPeriodoAnalisis(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        periodoAnalisis === p
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500'
                          : 'bg-transparent text-slate-400 border-slate-700 hover:border-amber-500/50'
                      }`}
                    >
                      {labels[p]}
                    </button>
                  )
                })}
              </div>

              {(() => {
                // Calcular fechas según período
                const hoy = new Date()
                const inicioSemana = new Date(hoy)
                inicioSemana.setDate(hoy.getDate() - hoy.getDay())
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

                const reservasFiltradas = todasReservas.filter((r: any) => {
                  if (periodoAnalisis === 'todas') return true
                  const fechaReserva = new Date(r.fecha + 'T12:00:00')
                  if (periodoAnalisis === 'semana') return fechaReserva >= inicioSemana
                  if (periodoAnalisis === 'mes') return fechaReserva >= inicioMes
                  return true
                })

                const totalReservas = reservasFiltradas.length
                const llegaron = reservasFiltradas.filter((r: any) => r.asistio === true || r.estado === 'confirmada' || r.estado === 'completada').length
                const noLlegaron = reservasFiltradas.filter((r: any) => r.estado === 'no_asistio').length
                const pendientes = reservasFiltradas.filter((r: any) => r.estado === 'pendiente').length
                const canceladas = reservasFiltradas.filter((r: any) => r.estado === 'cancelada').length
                const tasaConversion = totalReservas > 0 ? Math.round((llegaron / totalReservas) * 100) : 0

                return (
                  <>
                    {/* Métricas principales comparativas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/10">
                        <p className="text-xs text-amber-400 mb-1">📝 Reservas Realizadas</p>
                        <p className="text-4xl font-bold text-amber-500">{totalReservas}</p>
                        <p className="text-xs text-slate-500 mt-1">Total de reservas creadas</p>
                      </div>
                      <div className="glass rounded-xl p-4 border border-emerald-500/30 bg-emerald-500/10">
                        <p className="text-xs text-emerald-400 mb-1">✅ Personas que Asistieron</p>
                        <p className="text-4xl font-bold text-emerald-500">{llegaron}</p>
                        <p className="text-xs text-slate-500 mt-1">Reservas confirmadas/completadas</p>
                      </div>
                    </div>

                    {/* Tasa de conversión */}
                    <div className="glass rounded-xl p-4 border border-purple-500/30 bg-purple-500/5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-slate-400">📊 Tasa de Conversión</p>
                          <p className="text-3xl font-bold text-purple-400">{tasaConversion}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Efectividad</p>
                          <p className="text-lg font-bold text-emerald-400">{llegaron}</p>
                          <p className="text-xs text-slate-500">de {totalReservas}</p>
                        </div>
                      </div>
                      {/* Barra de progreso */}
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-500 transition-all duration-1000"
                          style={{ width: `${tasaConversion}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Stats detalladas */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Llegaron', val: llegaron, color: 'bg-emerald-500', text: 'text-emerald-400' },
                        { label: 'No llegaron', val: noLlegaron, color: 'bg-red-500', text: 'text-red-400' },
                        { label: 'Pendientes', val: pendientes, color: 'bg-amber-500', text: 'text-amber-400' },
                        { label: 'Canceladas', val: canceladas, color: 'bg-slate-500', text: 'text-slate-400' },
                      ].map(s => (
                        <div key={s.label} className="glass rounded-lg p-2 text-center border border-slate-700/50">
                          <p className={`text-2xl font-bold ${s.text}`}>{s.val}</p>
                          <p className="text-[10px] text-slate-500">{s.label}</p>
                          {totalReservas > 0 && (
                            <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                              <div className={`${s.color} h-full`} style={{ width: `${(s.val / totalReservas) * 100}%` }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Listado de reservas del período */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      <p className="text-xs text-slate-500 font-medium">📋 Reservas del período seleccionado:</p>
                      {reservasFiltradas.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Sin reservas en este período</p>
                        </div>
                      ) : (
                        reservasFiltradas.map((r: any) => {
                          const llego = r.asistio === true || r.estado === 'confirmada' || r.estado === 'completada'
                          const noLlego = r.estado === 'no_asistio'
                          return (
                            <div key={r.id} className={`glass rounded-xl p-3 border transition-colors ${
                              llego ? 'border-emerald-500/20 bg-emerald-500/5' :
                              noLlego ? 'border-red-500/20 bg-red-500/5' :
                              'border-slate-700/40'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-slate-200 text-sm">{r.cliente_nombre}</p>
                                    {r.rp_nombre && (
                                      <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full px-1.5 py-0.5">👑 {r.rp_nombre}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-slate-500">📅 {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                                    <span className="text-xs text-slate-500">🕐 {r.hora}</span>
                                    <span className="text-xs text-slate-500">👥 {r.numero_personas} pax</span>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {llego ? (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">✅ Llegó</span>
                                  ) : noLlego ? (
                                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">❌ No llegó</span>
                                  ) : r.estado === 'cancelada' ? (
                                    <span className="text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full px-2 py-0.5">✗ Cancelada</span>
                                  ) : (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">⏳ Pendiente</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          {/* ---- PESTAÑA: GESTIÓN RPs (SOLO ASHTON) ---- */}
          {vistaGlobal === 'gestion-rps' && esAshton && (
            <div className="space-y-4">
              {/* Stats RPs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass rounded-xl p-3 border border-slate-700 text-center">
                  <p className="text-xs text-slate-400 mb-1">Total RPs</p>
                  <p className="text-2xl font-bold text-white">{rpsListado.length}</p>
                </div>
                <div className="glass rounded-xl p-3 border border-emerald-700 text-center">
                  <p className="text-xs text-emerald-400 mb-1">Activos</p>
                  <p className="text-2xl font-bold text-emerald-400">{rpsListado.filter((rp: any) => rp.activo).length}</p>
                </div>
                <div className="glass rounded-xl p-3 border border-red-700 text-center">
                  <p className="text-xs text-red-400 mb-1">Inactivos</p>
                  <p className="text-2xl font-bold text-red-400">{rpsListado.filter((rp: any) => !rp.activo).length}</p>
                </div>
                <div className="glass rounded-xl p-3 border border-amber-700 text-center">
                  <p className="text-xs text-amber-400 mb-1">Con Abrev.</p>
                  <p className="text-2xl font-bold text-amber-400">{rpsListado.filter((rp: any) => rp.abreviatura).length}</p>
                </div>
              </div>

              {/* Botón Nuevo RP */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setDialogNuevoRP(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Nuevo RP
                </Button>
              </div>

              {/* Lista de RPs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {rpsListado.map((rp: any) => (
                  <div 
                    key={rp.id} 
                    className={`glass rounded-xl p-3 border ${rp.activo ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {rp.abreviatura || rp.rp_nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-200 text-sm truncate">{rp.rp_nombre}</p>
                        <p className="text-xs text-slate-500">
                          {rp.activo ? <span className="text-emerald-400">● Activo</span> : <span className="text-red-400">● Inactivo</span>}
                        </p>
                      </div>
                    </div>
                    
                    {rp.abreviatura && (
                      <div className="mb-2">
                        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">
                          Abreviatura: {rp.abreviatura}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRpSeleccionado(rp)
                          setDialogEditarRP(true)
                        }}
                        className="flex-1 border-slate-600 text-slate-300 text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const { supabase } = await import('@/lib/supabase')
                            await supabase.from('limites_cortesias_rp').update({ activo: !rp.activo }).eq('id', rp.id)
                            alert(`RP ${rp.rp_nombre} ${!rp.activo ? 'activado' : 'desactivado'}`)
                            cargarRPsListado()
                          } catch (e) {
                            alert('Error al cambiar estado')
                          }
                        }}
                        className={`flex-1 text-xs ${rp.activo ? 'border-red-600 text-red-400' : 'border-emerald-600 text-emerald-400'}`}
                      >
                        {rp.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Mesas */}
      <Card className="glass-hover border-0 shadow-none bg-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg text-slate-50">Mis Mesas</CardTitle>
        </CardHeader>
        <CardContent>
          {mesas.length === 0 ? (
            <div className="glass rounded-xl p-8 md:p-12 text-center">
              <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-700 mx-auto mb-3 md:mb-4" />
              <p className="text-slate-400 text-sm md:text-base">No tienes mesas asignadas</p>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {mesas.map((mesa) => (
                <div
                  key={mesa.id}
                  className="glass rounded-xl p-3 md:p-4 border border-slate-700 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex-1 min-w-0">
                      <Badge className="bg-purple-500/20 text-purple-500 mb-1 md:mb-2 text-xs">
                        Mesa {mesa.numero}
                      </Badge>
                      <p className="font-semibold text-slate-200 text-sm md:text-base truncate">{mesa.cliente_nombre}</p>
                      <p className="text-xs text-slate-400">
                        {mesa.numero_personas} personas
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-base md:text-lg font-bold text-emerald-500">
                        ${(mesa.total_actual || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => {
                        setMesaSeleccionada(mesa)
                        setDialogCortesia(true)
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-9 md:h-10 text-xs md:text-sm w-full"
                    >
                      <Gift className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Cortesía
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Autorizar Cortesía */}
      <Dialog open={dialogCortesia} onOpenChange={setDialogCortesia}>
        <DialogContent className="bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-500" />
              Autorizar Cortesía
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Selecciona el tipo de cortesía que deseas autorizar
            </DialogDescription>
          </DialogHeader>

          {mesaSeleccionada && (
            <div className="space-y-4">
              {/* Info Mesa */}
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-slate-400">Mesa</p>
                <p className="text-lg font-semibold text-slate-50">Mesa {mesaSeleccionada.numero}</p>
                <p className="text-sm text-slate-400 mt-1">{mesaSeleccionada.cliente_nombre}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {mesaSeleccionada.numero_personas} personas • {mesaSeleccionada.hostess}
                </p>
              </div>

              {/* Tipo de Cortesía - Solo Bufanda Rosa */}
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Cortesía</Label>
                <div className="glass rounded-xl p-4 border-2 border-pink-500/50 bg-pink-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <span className="text-2xl">🧣</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-pink-400">Bufanda Rosa</p>
                      <p className="text-sm text-slate-400">3 disponibles por reservación</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cantidad - Dinámico según disponibles */}
              <div className="space-y-2">
                <Label className="text-slate-300">
                  Cantidad de Bufandas 
                  <span className="text-pink-400 ml-2">({getCortesiaInfo(cortesiaForm.tipo).disponibles} disponibles)</span>
                </Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {Array.from({ length: getCortesiaInfo(cortesiaForm.tipo).disponibles }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCortesiaForm({...cortesiaForm, cantidad: num, tipo: "bufanda_rosa"})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        cortesiaForm.cantidad === num
                          ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-pink-500/50'
                      }`}
                    >
                      <span className="text-2xl font-bold">{num}</span>
                      <p className="text-xs mt-1">{num === 1 ? 'bufanda' : 'bufandas'}</p>
                    </button>
                  ))}
                </div>
                {getCortesiaInfo(cortesiaForm.tipo).disponibles === 0 && (
                  <p className="text-sm text-amber-400 text-center">⚠️ No hay bufandas disponibles. Espera a que lleguen más reservaciones.</p>
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label className="text-slate-300">Notas (Opcional)</Label>
                <Textarea
                  value={cortesiaForm.notas}
                  onChange={(e) => setCortesiaForm({...cortesiaForm, notas: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Cliente VIP, cumpleaños, etc..."
                  rows={2}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogCortesia(false)}
                  className="flex-1 border-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSolicitarAutorizacion}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  disabled={getCortesiaInfo(cortesiaForm.tipo).disponibles < cortesiaForm.cantidad}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Autorizar Cortesía
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Autorización de Cortesía */}
      <Dialog open={dialogConfirmarCortesia} onOpenChange={setDialogConfirmarCortesia}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Gift className="w-8 h-8 text-white" />
              </div>
              Autorizar Cortesía
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-base mt-2">
              Confirma la autorización de esta cortesía
            </DialogDescription>
          </DialogHeader>

          {mesaSeleccionada && (() => {
            const info = getCortesiaInfo(cortesiaForm.tipo)
            const descripcion = `${cortesiaForm.cantidad} Bufanda${cortesiaForm.cantidad > 1 ? 's' : ''} Rosa 🧣`
            
            return (
              <div className="space-y-6 pt-4">
                {/* Información de la cortesía */}
                <div className="glass rounded-xl p-5 border-2 border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Cortesía</span>
                    <span className="text-2xl font-bold text-purple-400">{descripcion}</span>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Mesa</p>
                      <p className="text-lg font-semibold text-slate-200">#{mesaSeleccionada.numero}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Cliente</p>
                      <p className="text-lg font-semibold text-slate-200 truncate">{mesaSeleccionada.cliente_nombre}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Cantidad</p>
                      <p className="text-lg font-semibold text-emerald-400">{cortesiaForm.cantidad}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Disponibles</p>
                      <p className="text-lg font-semibold text-amber-400">{info.disponibles} / {info.total}</p>
                    </div>
                  </div>

                  {cortesiaForm.notas && (
                    <>
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Notas</p>
                        <p className="text-sm text-slate-300">{cortesiaForm.notas}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Advertencia */}
                <div className="glass rounded-lg p-4 border border-amber-500/30 bg-amber-500/5">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-400">Confirma la autorización</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Esta acción quedará registrada en el historial y se descontará de tus cortesías disponibles.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDialogConfirmarCortesia(false)}
                    className="flex-1 border-slate-700 hover:bg-slate-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAutorizarCortesia}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Confirmar Autorización
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog Historial */}
      <Dialog open={dialogHistorial} onOpenChange={setDialogHistorial}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <History className="w-6 h-6 text-purple-500" />
              Historial de Cortesías - {rpNombre}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Cortesías autorizadas hoy: {cortesiasHoy.length}
            </DialogDescription>
          </DialogHeader>

          {/* Estadísticas del día */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="glass border-slate-700">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Total Hoy</p>
                  <p className="text-2xl font-bold text-purple-500">{cortesiasHoy.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-slate-700">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Shots</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {cortesiasHoy.filter((c: any) => c.tipo_cortesia === 'shots').reduce((sum: number, c: any) => sum + c.cantidad, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-slate-700">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Perlas</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {cortesiasHoy.filter((c: any) => c.tipo_cortesia === 'perlas_negras').reduce((sum: number, c: any) => sum + c.cantidad, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-slate-700">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Descuentos</p>
                  <p className="text-2xl font-bold text-green-500">
                    {cortesiasHoy.filter((c: any) => c.tipo_cortesia === 'descuento_botella').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-[450px]">
            {cortesias.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No has autorizado cortesías aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Agrupar por día */}
                {Object.entries(
                  cortesias.reduce((groups: any, cortesia: any) => {
                    const fecha = new Date(cortesia.fecha_autorizacion).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    if (!groups[fecha]) groups[fecha] = []
                    groups[fecha].push(cortesia)
                    return groups
                  }, {})
                ).map(([fecha, cortesiasDelDia]: [string, any]) => (
                  <div key={fecha}>
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <h3 className="text-sm font-semibold text-slate-300 capitalize">{fecha}</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {cortesiasDelDia.length} cortesías
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 ml-7">
                      {cortesiasDelDia.map((cortesia: any) => (
                        <div key={cortesia.id} className="glass rounded-lg p-4 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Gift className="w-4 h-4 text-purple-400" />
                                <p className="font-semibold text-slate-200">{cortesia.descripcion}</p>
                              </div>
                              <p className="text-sm text-slate-400">
                                Mesa {cortesia.mesa_numero} • {cortesia.cliente_nombre}
                              </p>
                            </div>
                            <Badge className={cortesia.usado ? "bg-green-500/20 text-green-500" : "bg-amber-500/20 text-amber-500"}>
                              {cortesia.usado ? "✓ Canjeado" : "Pendiente"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(cortesia.fecha_autorizacion).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {cortesia.cantidad > 1 && (
                              <span className="text-purple-400">• Cantidad: {cortesia.cantidad}</span>
                            )}
                            {cortesia.notas && (
                              <span>• {cortesia.notas}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog Mis Reservaciones */}
      <Dialog open={dialogReservaciones} onOpenChange={setDialogReservaciones}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl">Mis Reservaciones</DialogTitle>
            <DialogDescription className="text-slate-400">
              Reservaciones creadas por {rpNombre}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              onClick={() => setDialogNuevaReservacion(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Nueva Reservación
            </Button>

            {reservaciones.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No tienes reservaciones activas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservaciones.map((reservacion: any) => (
                  <Card key={reservacion.id} className="glass border-slate-700">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-50">
                            {reservacion.cliente_nombre}
                          </h3>
                          {(reservacion.numero_hombres > 0 || reservacion.numero_mujeres > 0) && (
                            <p className="text-sm text-slate-400">
                              {reservacion.numero_hombres > 0 && `${reservacion.numero_hombres}👨`}
                              {reservacion.numero_hombres > 0 && reservacion.numero_mujeres > 0 && ' '}
                              {reservacion.numero_mujeres > 0 && `${reservacion.numero_mujeres}👩`}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge className={
                            reservacion.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-500' :
                            reservacion.estado === 'completada' ? 'bg-green-500/20 text-green-500' :
                            'bg-red-500/20 text-red-500'
                          }>
                            {reservacion.estado}
                          </Badge>
                          {reservacion.asistio === true && (
                            <Badge className="bg-green-500/20 text-green-500">✓ Llegó</Badge>
                          )}
                          {reservacion.asistio === false && (
                            <Badge className="bg-red-500/20 text-red-500">✗ No llegó</Badge>
                          )}
                          {reservacion.asistio === null && (
                            <Badge className="bg-slate-500/20 text-slate-400">⏳ Pendiente</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                        <div>📅 {new Date(reservacion.fecha + 'T00:00:00').toLocaleDateString('es-MX')}</div>
                        <div>🕐 {reservacion.hora.substring(0, 5)}</div>
                        <div>👥 {reservacion.numero_personas} personas</div>
                        {reservacion.rp_nombre && (
                          <div>✨ RP: {reservacion.rp_nombre}</div>
                        )}
                      </div>
                      {reservacion.notas && (
                        <p className="text-sm text-slate-500 italic mt-2">
                          {reservacion.notas}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            <div className="glass rounded-lg p-3 border border-purple-500/30">
              <p className="text-xs text-purple-400 flex items-center gap-2">
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

            {/* Info: La reservación se asignará automáticamente a este RP */}
            <div className="glass rounded-lg p-3 border border-purple-500/30">
              <p className="text-sm text-slate-300">
                ✨ Esta reservación se asignará automáticamente a: <span className="font-semibold text-purple-400">{rpNombre}</span>
              </p>
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
                  (nuevaReservacion.numero_hombres + nuevaReservacion.numero_mujeres) !== nuevaReservacion.numero_personas
                }
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Crear Reservación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Menú - ESTILO FEVER INTERACTIVO */}
      <Dialog open={dialogMenu} onOpenChange={(open) => {
        setDialogMenu(open)
        if (!open) {
          setCarritoMenu([])
          setMesaSeleccionadaMenu(null)
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-amber-500/20 w-[95vw] max-w-2xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-amber-500/20 shrink-0">
            <DialogTitle className="text-amber-500 text-xl font-bold flex items-center gap-2">
              <Wine className="w-5 h-5" />
              MENÚ FEVER {mesaSeleccionadaMenu && `- Mesa ${mesaSeleccionadaMenu.numero}`}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {mesaSeleccionadaMenu 
                ? `Cliente: ${mesaSeleccionadaMenu.cliente_nombre} • Toca productos para agregar`
                : 'Selecciona tu mesa primero'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Selector de Mesa */}
            {!mesaSeleccionadaMenu && mesas.length > 0 && (
              <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-amber-500/30">
                <p className="text-amber-500 font-bold mb-3">Selecciona tu mesa:</p>
                <div className="grid grid-cols-2 gap-2">
                  {mesas.map((mesa: any) => (
                    <button
                      key={mesa.id}
                      onClick={() => setMesaSeleccionadaMenu(mesa)}
                      className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:scale-105 transition-transform rounded-lg p-3 border border-emerald-400/30"
                    >
                      <p className="text-white font-bold">Mesa {mesa.numero}</p>
                      <p className="text-emerald-100 text-xs">{mesa.cliente_nombre}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mesaSeleccionadaMenu && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {/* Botones de Categorías */}
              {[
                { nombre: 'TEQUILA', color: 'from-amber-600 to-amber-700' },
                { nombre: 'VODKA', color: 'from-amber-500 to-amber-600' },
                { nombre: 'MEZCAL', color: 'from-amber-600 to-amber-700' },
                { nombre: 'GINEBRA', color: 'from-amber-500 to-amber-600' },
                { nombre: 'RON', color: 'from-amber-600 to-amber-700' },
                { nombre: 'WHISKY', color: 'from-amber-500 to-amber-600' },
                { nombre: 'BRANDY', color: 'from-amber-600 to-amber-700' },
                { nombre: 'COGNAC', color: 'from-amber-500 to-amber-600' },
                { nombre: 'CHAMPAGNE', color: 'from-amber-600 to-amber-700' },
                { nombre: 'SHOTS', color: 'from-amber-500 to-amber-600' },
                { nombre: 'COCTELERÍA', color: 'from-amber-600 to-amber-700' },
                { nombre: 'CERVEZA', color: 'from-amber-500 to-amber-600' },
                { nombre: 'MIXOLOGÍA', color: 'from-amber-600 to-amber-700' },
                { nombre: 'ENERGIZANTES', color: 'from-amber-500 to-amber-600' },
                { nombre: 'REFRESCOS', color: 'from-amber-600 to-amber-700' },
              ].map((cat) => {
                const productosCategoria = productos.filter((p: any) => 
                  p.categoria?.toUpperCase() === cat.nombre.toUpperCase()
                )
                
                if (productosCategoria.length === 0) return null
                
                return (
                  <button
                    key={cat.nombre}
                    onClick={() => {
                      const elemento = document.getElementById(`cat-${cat.nombre}`)
                      elemento?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`bg-gradient-to-br ${cat.color} hover:scale-105 transition-transform rounded-xl p-4 border-2 border-amber-400/30 shadow-lg`}
                  >
                    <p className="text-slate-900 font-black text-sm sm:text-base tracking-wide">
                      {cat.nombre}
                    </p>
                    <p className="text-slate-800 text-xs font-semibold mt-1">
                      {productosCategoria.length} items
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Lista de Productos por Categoría */}
            <div className="mt-6 space-y-6">
              {Object.entries(
                productos.reduce((groups: any, producto: any) => {
                  const categoria = producto.categoria || 'Otros'
                  if (!groups[categoria]) groups[categoria] = []
                  groups[categoria].push(producto)
                  return groups
                }, {})
              ).map(([categoria, items]: [string, any]) => (
                <div key={categoria} id={`cat-${categoria.toUpperCase()}`} className="scroll-mt-4">
                  <h3 className="text-amber-500 text-lg font-bold mb-3 pb-2 border-b border-amber-500/30">
                    {categoria.toUpperCase()}
                  </h3>
                  <div className="space-y-2">
                    {items.map((producto: any) => (
                      <div 
                        key={producto.id} 
                        className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:border-amber-500/30 transition-colors"
                      >
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1">
                            <p className="text-slate-200 font-medium text-sm">
                              {producto.nombre}
                            </p>
                            {producto.unidad && (
                              <p className="text-slate-500 text-xs mt-0.5">{producto.unidad}</p>
                            )}
                          </div>
                          <span className="text-amber-500 font-bold text-base shrink-0">
                            ${producto.precio}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </div>

          <div className="px-4 py-3 border-t border-amber-500/20 shrink-0">
            {mesaSeleccionadaMenu && carritoMenu.length > 0 && (
              <div className="mb-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <p className="text-emerald-500 font-bold text-sm mb-2">
                  Carrito ({carritoMenu.length} items)
                </p>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {carritoMenu.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span className="text-emerald-500">${(item.precio * item.cantidad).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-emerald-500/30">
                  <span className="text-emerald-500 font-bold">Total:</span>
                  <span className="text-emerald-500 font-bold">
                    ${carritoMenu.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0).toFixed(0)}
                  </span>
                </div>
              </div>
            )}
            
            {mesaSeleccionadaMenu && carritoMenu.length > 0 ? (
              <Button
                onClick={async () => {
                  try {
                    const { supabase } = await import('@/lib/supabase')
                    const total = carritoMenu.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0)
                    
                    await supabase.from('tickets').insert({
                      cliente_id: mesaSeleccionadaMenu.cliente_id,
                      cliente_nombre: mesaSeleccionadaMenu.cliente_nombre,
                      mesa_numero: mesaSeleccionadaMenu.numero,
                      productos: carritoMenu.map((item: any) => ({
                        nombre: item.nombre,
                        cantidad: item.cantidad,
                        precio: item.precio
                      })),
                      subtotal: total,
                      propina: 0,
                      total: total,
                      metodo_pago: 'Pendiente',
                      mesero: rpNombre,
                      rp_nombre: rpNombre,
                      notas: `Pedido desde menú por RP: ${rpNombre}`
                    })
                    
                    await supabase.from('mesas').update({
                      total_actual: (mesaSeleccionadaMenu.total_actual || 0) + total,
                      pedidos_data: [...(mesaSeleccionadaMenu.pedidos_data || []), ...carritoMenu.map((item: any) => ({
                        nombre: item.nombre,
                        cantidad: item.cantidad,
                        precio: item.precio
                      }))]
                    }).eq('id', mesaSeleccionadaMenu.id)
                    
                    alert('✅ Pedido registrado!')
                    setCarritoMenu([])
                    setMesaSeleccionadaMenu(null)
                    setDialogMenu(false)
                    await cargarDatos()
                  } catch (error) {
                    console.error('Error:', error)
                    alert('❌ Error al registrar')
                  }
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold"
              >
                REGISTRAR PEDIDO
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setDialogMenu(false)
                  setCarritoMenu([])
                  setMesaSeleccionadaMenu(null)
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-900 font-bold"
              >
                CERRAR MENÚ
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cortesías Minimizadas - Badges Flotantes Agrupados por Mesa */}
      {(() => {
        console.log('🎨 Renderizando badges. Cortesías activas:', cortesiasActivas.length)
        
        // Agrupar cortesías por mesa
        const cortesiasPorMesa = cortesiasActivas
          .filter(c => c.id !== cortesiaExpandida)
          .reduce((acc: any, cortesia) => {
            if (!acc[cortesia.mesa_numero]) {
              acc[cortesia.mesa_numero] = []
            }
            acc[cortesia.mesa_numero].push(cortesia)
            return acc
          }, {})
        
        console.log('📦 Cortesías agrupadas por mesa:', Object.keys(cortesiasPorMesa).length, 'mesas')

        return Object.entries(cortesiasPorMesa).map(([mesa, cortesias]: [string, any], index) => {
          const tiempoMenor = Math.min(...cortesias.map((c: any) => c.tiempo_restante))
          
          return (
            <div 
              key={`mesa-${mesa}`}
              onClick={() => setDialogCortesiasMesa(mesa)}
              className="fixed z-50 cursor-pointer animate-bounce"
              style={{ bottom: `${24 + (index * 90)}px`, right: '24px' }}
            >
              <div className="glass rounded-2xl p-3 border-2 border-emerald-500/50 bg-emerald-500/10 backdrop-blur-xl shadow-2xl shadow-emerald-500/30 hover:scale-110 transition-transform">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center relative">
                    <Gift className="w-5 h-5 text-white" />
                    {cortesias.length > 1 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{cortesias.length}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-400">Mesa {mesa}</p>
                    <p className="text-[10px] text-slate-400">{cortesias.length} cortesía{cortesias.length > 1 ? 's' : ''}</p>
                    {cortesias.length === 1 && (
                      <p className="text-[9px] text-amber-400 font-mono">{cortesias[0].folio}</p>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-bold text-amber-500">
                        {Math.floor(tiempoMenor / 60)}:{(tiempoMenor % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      })()}

      {/* Mensaje de Éxito - Cortesía Autorizada Expandida */}
      {cortesiasActivas.find(c => c.id === cortesiaExpandida) && (() => {
        const cortesia = cortesiasActivas.find(c => c.id === cortesiaExpandida)!
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="glass rounded-3xl max-w-md w-full border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20 animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            {/* Header Fijo */}
            <div className="p-6 pb-4">
              {/* Icono de éxito */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
                  <Check className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Título */}
              <h2 className="text-3xl font-bold text-center text-emerald-500 mb-2">
                ¡Cortesía Autorizada!
              </h2>
              <p className="text-center text-slate-400 mb-4">
                Muestra esta pantalla en barra o al mesero
              </p>

              {/* Folio */}
              <div className="glass rounded-xl p-3 border border-amber-500/30 bg-amber-500/5">
                <p className="text-xs text-amber-400 text-center mb-1">Folio</p>
                <p className="text-2xl font-bold text-amber-500 text-center tracking-wider">
                  {cortesia.folio}
                </p>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="overflow-y-auto px-6 pb-4 flex-1">
              <div className="space-y-4">
              <div className="glass rounded-xl p-4 border border-emerald-500/30">
                <p className="text-sm text-slate-400 mb-1">Cortesía</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {cortesia.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Mesa</p>
                  <p className="text-xl font-bold text-slate-50">
                    {cortesia.mesa_numero}
                  </p>
                </div>
                <div className="glass rounded-xl p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Cantidad</p>
                  <p className="text-xl font-bold text-slate-50">
                    {cortesia.cantidad}
                  </p>
                </div>
              </div>

              <div className="glass rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Cliente</p>
                <p className="text-lg font-semibold text-slate-50">
                  {cortesia.cliente_nombre}
                </p>
              </div>

              <div className="glass rounded-xl p-4 border border-purple-500/30 bg-purple-500/5">
                <p className="text-xs text-purple-400 mb-1">Autorizado por</p>
                <p className="text-lg font-semibold text-purple-400">
                  {rpNombre}
                </p>
              </div>

              {/* Temporizador */}
              <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-400">Tiempo restante</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-500">
                    {Math.floor(cortesia.tiempo_restante / 60)}:{(cortesia.tiempo_restante % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              </div>
            </div>

            {/* Botones Fijos Abajo */}
            <div className="p-6 pt-4 space-y-3 border-t border-slate-700">
              {/* Botón Confirmar (antes Cerrar) */}
              <Button
                onClick={() => setCortesiaExpandida(null)}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-lg py-6"
              >
                Confirmar
              </Button>

            </div>
          </div>
        </div>
        )
      })()}

      {/* Diálogo de Cortesías por Mesa */}
      <Dialog open={!!dialogCortesiasMesa} onOpenChange={() => setDialogCortesiasMesa(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Gift className="w-6 h-6 text-emerald-500" />
              Cortesías Activas - Mesa {dialogCortesiasMesa}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {cortesiasActivas.filter(c => c.mesa_numero === dialogCortesiasMesa).length} cortesía(s) autorizada(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {cortesiasActivas
              .filter(c => c.mesa_numero === dialogCortesiasMesa)
              .map((cortesia, index) => (
                <div
                  key={cortesia.id}
                  className="glass rounded-xl p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-emerald-500">{cortesia.descripcion}</p>
                      <p className="text-sm text-slate-400">Cliente: {cortesia.cliente_nombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-500">
                        {Math.floor(cortesia.tiempo_restante / 60)}:{(cortesia.tiempo_restante % 60).toString().padStart(2, '0')}
                      </p>
                      <p className="text-xs text-slate-500">restante</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="glass rounded-lg p-2">
                      <p className="text-xs text-slate-500">Cantidad</p>
                      <p className="text-lg font-bold text-slate-200">{cortesia.cantidad}</p>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-xs text-slate-500">Autorizado</p>
                      <p className="text-xs text-slate-300">
                        {new Date(cortesia.fecha_autorizacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setCortesiaExpandida(cortesia.id)
                        setDialogCortesiasMesa(null)
                      }}
                      variant="outline"
                      className="flex-1 border-emerald-700 hover:bg-emerald-500/10"
                      size="sm"
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      onClick={async () => {
                        await cerrarCortesiaActiva(cortesia.id)
                        if (cortesiasActivas.filter(c => c.mesa_numero === dialogCortesiasMesa).length === 1) {
                          setDialogCortesiasMesa(null)
                        }
                        // El estado se actualiza automáticamente vía suscripción
                      }}
                      variant="outline"
                      className="flex-1 border-red-700 hover:bg-red-500/10 text-red-500"
                      size="sm"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          <Button
            onClick={() => setDialogCortesiasMesa(null)}
            className="w-full bg-slate-800 hover:bg-slate-700"
          >
            Cerrar Lista
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog de Pedido - Menú de Productos */}
      <Dialog open={dialogPedido} onOpenChange={setDialogPedido}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl flex items-center gap-2">
              <Utensils className="w-6 h-6 text-emerald-500" />
              Registrar Pedido - Mesa {mesaParaPedido?.numero}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Cliente: {mesaParaPedido?.cliente_nombre} • Consumo actual: ${mesaParaPedido?.consumo_total?.toFixed(2) || '0.00'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar producto..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-50"
              />
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lista de Productos */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 sticky top-0 bg-slate-900 py-2">Productos Disponibles</h3>
                {productos
                  .filter((p: any) => 
                    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
                    p.categoria.toLowerCase().includes(busquedaProducto.toLowerCase())
                  )
                  .map((producto: any) => (
                    <div
                      key={producto.id}
                      className="glass rounded-lg p-3 border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer"
                      onClick={() => {
                        const existe = carritoPedido.find((item: any) => item.id === producto.id)
                        if (existe) {
                          setCarritoPedido(carritoPedido.map((item: any) =>
                            item.id === producto.id
                              ? { ...item, cantidad: item.cantidad + 1 }
                              : item
                          ))
                        } else {
                          setCarritoPedido([...carritoPedido, { ...producto, cantidad: 1 }])
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-50">{producto.nombre}</p>
                          <p className="text-xs text-slate-400">{producto.categoria}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-500">${producto.precio}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Carrito */}
              <div className="glass rounded-lg p-4 border border-emerald-500/30 h-fit sticky top-0">
                <h3 className="text-lg font-bold text-emerald-500 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrito ({carritoPedido.length})
                </h3>
                
                {carritoPedido.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">
                    Selecciona productos para agregar
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                      {carritoPedido.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-50">{item.nombre}</p>
                            <p className="text-xs text-slate-400">${item.precio} c/u</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                if (item.cantidad > 1) {
                                  setCarritoPedido(carritoPedido.map((i: any) =>
                                    i.id === item.id ? { ...i, cantidad: i.cantidad - 1 } : i
                                  ))
                                } else {
                                  setCarritoPedido(carritoPedido.filter((i: any) => i.id !== item.id))
                                }
                              }}
                            >
                              -
                            </Button>
                            <span className="text-sm font-bold text-slate-50 w-6 text-center">{item.cantidad}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setCarritoPedido(carritoPedido.map((i: any) =>
                                  i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
                                ))
                              }}
                            >
                              +
                            </Button>
                          </div>
                          <p className="text-sm font-bold text-emerald-500 w-16 text-right">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-700 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal:</span>
                        <span className="text-slate-50 font-semibold">
                          ${carritoPedido.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-emerald-500">Total:</span>
                        <span className="text-emerald-500">
                          ${carritoPedido.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={async () => {
                        try {
                          const { supabase } = await import('@/lib/supabase')
                          
                          const total = carritoPedido.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0)
                          
                          // Registrar pedido en tabla tickets
                          const { error: ticketError } = await supabase
                            .from('tickets')
                            .insert({
                              cliente_id: mesaParaPedido.cliente_id,
                              cliente_nombre: mesaParaPedido.cliente_nombre,
                              mesa_numero: mesaParaPedido.numero,
                              productos: carritoPedido.map((item: any) => ({
                                nombre: item.nombre,
                                cantidad: item.cantidad,
                                precio: item.precio
                              })),
                              subtotal: total,
                              propina: 0,
                              total: total,
                              metodo_pago: 'Pendiente',
                              mesero: rpNombre,
                              rp_nombre: rpNombre,
                              notas: `Pedido registrado por RP: ${rpNombre}`
                            })

                          if (ticketError) throw ticketError

                          // Actualizar consumo de la mesa
                          const { error: mesaError } = await supabase
                            .from('mesas')
                            .update({
                              total_actual: (mesaParaPedido.total_actual || 0) + total,
                              pedidos_data: [...(mesaParaPedido.pedidos_data || []), ...carritoPedido.map((item: any) => ({
                                nombre: item.nombre,
                                cantidad: item.cantidad,
                                precio: item.precio
                              }))]
                            })
                            .eq('id', mesaParaPedido.id)

                          if (mesaError) throw mesaError

                          alert('✅ Pedido registrado exitosamente!')
                          setCarritoPedido([])
                          setDialogPedido(false)
                          await cargarDatos() // Recargar consumo
                        } catch (error) {
                          console.error('Error:', error)
                          alert('❌ Error al registrar pedido')
                        }
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    >
                      Registrar Pedido
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== DIALOG PROCESAR CON IA (CLAUDE) ========== */}
      <Dialog open={dialogProcesarIA} onOpenChange={setDialogProcesarIA}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Procesar Reservaciones
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Pega el texto con las reservaciones o sube un archivo. Se extraerán automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Toggle modo */}
            <div className="flex gap-2">
              <Button
                variant={modoIA === 'texto' ? 'default' : 'outline'}
                onClick={() => setModoIA('texto')}
                className={modoIA === 'texto' ? 'bg-violet-600 hover:bg-violet-700' : 'border-slate-700 text-slate-400'}
                size="sm"
              >
                📝 Pegar Texto
              </Button>
              <Button
                variant={modoIA === 'archivo' ? 'default' : 'outline'}
                onClick={() => setModoIA('archivo')}
                className={modoIA === 'archivo' ? 'bg-violet-600 hover:bg-violet-700' : 'border-slate-700 text-slate-400'}
                size="sm"
              >
                📄 Subir Archivo
              </Button>
            </div>

            {/* Fecha del evento - solo en modo archivo */}
            {modoIA === 'archivo' && (
              <div>
                <Label className="text-slate-300">Fecha del Evento *</Label>
                <Input
                  type="date"
                  value={fechaEventoIA}
                  onChange={(e) => setFechaEventoIA(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            )}

            {/* Selector de RP */}
            <div>
              <Label className="text-slate-300">RP (opcional - deja en blanco para detectar automáticamente)</Label>
              <Select value={rpSeleccionadoIA || 'auto'} onValueChange={(val) => setRpSeleccionadoIA(val === 'auto' ? '' : val)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Detectar automáticamente" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="auto">Detectar automáticamente</SelectItem>
                  {rpsUnicos.map(rp => (
                    <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modo texto: textarea */}
            {modoIA === 'texto' && (
              <div>
                <Label className="text-slate-300">Pega aquí las reservaciones *</Label>
                <textarea
                  value={textoIA}
                  onChange={(e) => setTextoIA(e.target.value)}
                  placeholder={"Pega la lista aquí. Incluye la fecha en el texto.\n\nEjemplo:\nVIERNES 18 DE ABRIL 2026\n\nALEJANDRO MACIEL (AT)\nJuan Pérez 4px\nMaría López 2 personas\n\nCARLOS RIVERA (CR)\nAna Ruiz 8:00pm 3px\nLuis García - 6"}
                  rows={10}
                  className="w-full mt-2 bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
                />
                <p className="text-xs text-slate-500 mt-1">
                  La fecha se extrae automáticamente del texto (ej: "VIERNES 18", "18/04/2026", "18 de abril"). Si no se detecta, usa la fecha de hoy.
                </p>
              </div>
            )}

            {/* Modo archivo: subir archivo */}
            {modoIA === 'archivo' && (
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
            )}

            {/* Botón procesar */}
            <Button
              onClick={handleProcesarConClaude}
              disabled={loadingProcesarIA || (modoIA === 'archivo' && !archivoIA) || (modoIA === 'texto' && !textoIA.trim())}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white disabled:opacity-50"
            >
              {loadingProcesarIA ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  {modoIA === 'texto' ? 'Procesar Texto' : 'Procesar con IA'}
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
                      <p className="text-2xl font-bold text-violet-400">{count}</p>
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
                          <Badge className="bg-violet-600/30 text-violet-300 text-xs">
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
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white disabled:opacity-50"
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
      {/* ========== FIN DIALOG IA ========== */}

      {/* ========== DIALOGS GESTIÓN RPs (SOLO ASHTON) ========== */}
      {esAshton && (
        <>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Shots</Label>
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
                <Button
                  onClick={async () => {
                    if (!nuevoRP.rp_nombre || !nuevoRP.password) {
                      alert('Nombre y contraseña son obligatorios')
                      return
                    }
                    try {
                      const { supabase } = await import('@/lib/supabase')
                      const { error } = await supabase.from('limites_cortesias_rp').insert({
                        rp_nombre: nuevoRP.rp_nombre,
                        password: nuevoRP.password,
                        abreviatura: nuevoRP.abreviatura.toUpperCase() || null,
                        abreviatura_asignada_por: nuevoRP.abreviatura ? rpNombre : null,
                        fecha_abreviatura_asignada: nuevoRP.abreviatura ? new Date().toISOString() : null,
                        shots_disponibles: nuevoRP.shots_disponibles,
                        shots_usados: 0,
                        perlas_negras_disponibles: nuevoRP.perlas_negras_disponibles,
                        perlas_negras_usadas: 0,
                        descuento_botella_disponible: 1,
                        descuento_botella_usado: 0,
                        shots_bienvenida_disponibles: 10,
                        shots_bienvenida_usados: 0,
                        activo: true
                      })
                      if (error) throw error
                      alert('✅ RP creado exitosamente')
                      setDialogNuevoRP(false)
                      setNuevoRP({rp_nombre: '', password: '', abreviatura: '', shots_disponibles: 5, perlas_negras_disponibles: 3, descuento_botella_disponible: 1, shots_bienvenida_disponibles: 10})
                      cargarRPsListado()
                    } catch (error) {
                      alert('Error al crear RP')
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                >
                  Crear RP
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
                    <Label className="text-slate-300">Nombre</Label>
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
                      maxLength={2}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rpSeleccionado.activo}
                      onChange={(e) => setRpSeleccionado({...rpSeleccionado, activo: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                    />
                    <Label className="text-slate-300 mb-0">Activo</Label>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        const { supabase } = await import('@/lib/supabase')
                        const { error } = await supabase.from('limites_cortesias_rp').update({
                          rp_nombre: rpSeleccionado.rp_nombre,
                          password: rpSeleccionado.password,
                          abreviatura: rpSeleccionado.abreviatura?.toUpperCase() || null,
                          abreviatura_asignada_por: rpSeleccionado.abreviatura ? rpNombre : null,
                          fecha_abreviatura_asignada: rpSeleccionado.abreviatura ? new Date().toISOString() : null,
                          activo: rpSeleccionado.activo
                        }).eq('id', rpSeleccionado.id)
                        if (error) throw error
                        alert('✅ RP actualizado')
                        setDialogEditarRP(false)
                        cargarRPsListado()
                      } catch (error) {
                        alert('Error al actualizar RP')
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
      {/* ========== FIN DIALOGs GESTIÓN RPs ========== */}

    </div>
  )
}
