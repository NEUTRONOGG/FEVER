'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crown, Users, ShoppingCart, Plus, Minus, Search, LogOut, Utensils, CheckCircle, AlertCircle, Calendar, TrendingUp, UserCheck, UserX, ChevronDown, ChevronUp, BarChart3, Clock, Filter, Upload, FileText, Trash2 } from 'lucide-react'
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
  mesa_asignada?: number
  notas?: string
  creado_en: string
}

interface Mesa {
  id: number
  numero: string
  estado: string
  cliente_nombre?: string
  rp_nombre?: string
  hostess?: string
  mesero?: string
  hora_asignacion?: string
  total_actual?: number
}

interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
  disponible: boolean
}

interface ItemPedido {
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
}

export default function AshtonPage() {
  const router = useRouter()
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [pedido, setPedido] = useState<ItemPedido[]>([])
  const [dialogPedido, setDialogPedido] = useState(false)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [mensajeTipo, setMensajeTipo] = useState<'success' | 'error'>('success')

  // Reservas semanales
  const [reservasSemana, setReservasSemana] = useState<Reservacion[]>([])
  const [vistaActiva, setVistaActiva] = useState<'mesas' | 'reservas' | 'metricas' | 'reservaciones'>('mesas')
  const [filtroRP, setFiltroRP] = useState<string>('todos')
  const [rpExpandido, setRpExpandido] = useState<string | null>(null)
  
  // Reservaciones (nueva pestaña)
  const [todasReservaciones, setTodasReservaciones] = useState<Reservacion[]>([])
  const [filtroEstadoReserva, setFiltroEstadoReserva] = useState<string>('todas')
  const [filtroRPReserva, setFiltroRPReserva] = useState<string>('todos')
  const [dialogNuevaReserva, setDialogNuevaReserva] = useState(false)
  const [nuevaReserva, setNuevaReserva] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    numero_personas: 2,
    rp_nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '19:00',
    notas: ''
  })

  // Importar reservaciones desde archivo (modo texto simple)
  const [dialogImportarArchivo, setDialogImportarArchivo] = useState(false)
  const [archivoTexto, setArchivoTexto] = useState('')
  const [rpParaImportar, setRpParaImportar] = useState('')
  const [fechaParaImportar, setFechaParaImportar] = useState(new Date().toISOString().split('T')[0])
  const [reservasParsadas, setReservasParsadas] = useState<any[]>([])
  const [loadingImport, setLoadingImport] = useState(false)
  const [importMensaje, setImportMensaje] = useState('')

  // Importar con IA (Claude Haiku 4)
  const [dialogProcesarIA, setDialogProcesarIA] = useState(false)
  const [archivoIA, setArchivoIA] = useState<File | null>(null)
  const [fechaEventoIA, setFechaEventoIA] = useState(new Date().toISOString().split('T')[0])
  const [rpSeleccionadoIA, setRpSeleccionadoIA] = useState('')
  const [loadingProcesarIA, setLoadingProcesarIA] = useState(false)
  const [resultadoIA, setResultadoIA] = useState<any>(null)
  const [mensajeIA, setMensajeIA] = useState('')
  const [reservasConfirmadasIA, setReservasConfirmadasIA] = useState<any[]>([])

  // Métricas históricas
  const [reservasHistoricas, setReservasHistoricas] = useState<Reservacion[]>([])
  const [filtroEstadoMetricas, setFiltroEstadoMetricas] = useState<string>('todos')
  const [filtroRPMetricas, setFiltroRPMetricas] = useState<string>('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('mes')

  useEffect(() => {
    const socioData = sessionStorage.getItem('socio')
    if (!socioData) {
      router.push('/socios')
      return
    }

    const socio = JSON.parse(socioData)
    if (socio.nombre !== 'Ashton' && socio.nombre !== 'Socio Principal' && socio.telefono !== '5550000001') {
      router.push('/dashboard/socios')
      return
    }

    cargarDatos()
    cargarReservasSemana()
    cargarReservasHistoricas()
    cargarTodasReservaciones()
    const interval = setInterval(() => {
      cargarDatos()
      cargarReservasSemana()
      cargarTodasReservaciones()
    }, 30000)
    return () => clearInterval(interval)
  }, [router])

  const cargarReservasHistoricas = async () => {
    try {
      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })
      if (!error) setReservasHistoricas(data || [])
    } catch (e) {
      console.error('Error cargando historial:', e)
    }
  }

  const cargarTodasReservaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })
      if (!error) setTodasReservaciones(data || [])
    } catch (e) {
      console.error('Error cargando todas las reservaciones:', e)
    }
  }

  const cargarReservasSemana = async () => {
    try {
      // Inicio de semana (lunes)
      const hoy = new Date()
      const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - diaSemana)
      inicioSemana.setHours(0, 0, 0, 0)
      const finSemana = new Date(inicioSemana)
      finSemana.setDate(inicioSemana.getDate() + 6)
      finSemana.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .gte('fecha', inicioSemana.toISOString().split('T')[0])
        .lte('fecha', finSemana.toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })

      if (error) throw error
      setReservasSemana(data || [])
    } catch (error) {
      console.error('Error cargando reservas:', error)
    }
  }

  const cargarDatos = async () => {
    try {
      // Cargar mesas (todas las columnas están en la tabla mesas directamente)
      const { data: mesasData, error: mesasError } = await supabase
        .from('mesas')
        .select('*')
        .order('numero')

      if (mesasError) throw mesasError

      // Para mesas ocupadas, calcular consumo actual desde tickets
      const mesasConInfo = await Promise.all(
        (mesasData || []).map(async (mesa) => {
          if (mesa.estado === 'ocupada' && mesa.hora_asignacion) {
            const { data: tickets } = await supabase
              .from('tickets')
              .select('total')
              .eq('mesa_numero', mesa.numero)
              .gte('created_at', mesa.hora_asignacion)

            const totalActual = tickets?.reduce((sum, t) => sum + parseFloat(t.total), 0) || 0
            return { ...mesa, total_actual: totalActual }
          }
          return mesa
        })
      )

      setMesas(mesasConInfo)

      // Cargar productos
      const { data: productosData } = await supabase
        .from('productos')
        .select('*')
        .order('categoria, nombre')

      if (productosData) setProductos(productosData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const handleSeleccionarMesa = (mesa: Mesa) => {
    if (mesa.estado !== 'ocupada') {
      setMensaje('Solo puedes registrar pedidos en mesas ocupadas')
      setMensajeTipo('error')
      setTimeout(() => setMensaje(''), 3000)
      return
    }
    setMesaSeleccionada(mesa)
    setPedido([])
    setDialogPedido(true)
  }

  const handleAgregarProducto = (producto: Producto) => {
    const itemExistente = pedido.find(item => item.producto_id === producto.id)
    
    if (itemExistente) {
      setPedido(pedido.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setPedido([...pedido, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }])
    }
  }

  const handleCambiarCantidad = (productoId: string, delta: number) => {
    setPedido(pedido.map(item => {
      if (item.producto_id === productoId) {
        const nuevaCantidad = item.cantidad + delta
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item
      }
      return item
    }).filter(item => item.cantidad > 0))
  }

  const handleCrearReservacion = async () => {
    if (!nuevaReserva.cliente_nombre || !nuevaReserva.rp_nombre) {
      setMensaje('Por favor completa nombre del cliente y RP')
      setMensajeTipo('error')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reservaciones')
        .insert({
          cliente_nombre: nuevaReserva.cliente_nombre,
          cliente_telefono: nuevaReserva.cliente_telefono,
          numero_personas: nuevaReserva.numero_personas,
          rp_nombre: nuevaReserva.rp_nombre,
          fecha: nuevaReserva.fecha,
          hora: nuevaReserva.hora,
          notas: nuevaReserva.notas,
          estado: 'pendiente',
          creado_por: 'Ashton'
        })

      if (error) throw error

      setMensaje('✅ Reservación creada exitosamente')
      setMensajeTipo('success')
      setDialogNuevaReserva(false)
      setNuevaReserva({
        cliente_nombre: '',
        cliente_telefono: '',
        numero_personas: 2,
        rp_nombre: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '19:00',
        notas: ''
      })
      await cargarTodasReservaciones()
    } catch (error) {
      console.error('Error creando reservación:', error)
      setMensaje('Error al crear la reservación')
      setMensajeTipo('error')
    } finally {
      setLoading(false)
    }
  }

  const handleArchivoSubido = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'txt' || ext === 'doc' || ext === 'docx') {
      const texto = await file.text()
      setArchivoTexto(texto)
      parsearTextoReservaciones(texto)
    } else if (ext === 'pdf') {
      setImportMensaje('⚠️ PDF detectado. Copia y pega el contenido del PDF en el cuadro de texto abajo.')
      setArchivoTexto('')
      setReservasParsadas([])
    } else {
      setImportMensaje('❌ Formato no soportado. Usa .txt, .doc, .docx o pega el texto manualmente.')
    }
  }

  const parsearTextoReservaciones = (texto: string) => {
    const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 3)
    const resultado: any[] = []

    // Patrones para extraer info de cada línea
    // Intenta detectar: nombre, hora, personas, teléfono
    const regexHora = /(\d{1,2}[:h]\d{0,2}\s*(am|pm)?)/i
    const regexPersonas = /(\d+)\s*(p(erson(as?)?)?|pax|adulto)/i
    const regexTelefono = /(\d{10})/

    for (const linea of lineas) {
      // Saltar líneas que parecen encabezados o separadores
      if (/^(nombre|cliente|hora|fecha|personas|rp|reserva|lista|---)/i.test(linea)) continue
      if (linea.length < 4) continue

      const horaMatch = linea.match(regexHora)
      const personasMatch = linea.match(regexPersonas)
      const telMatch = linea.match(regexTelefono)

      // Extraer nombre: quitar hora, personas y teléfono del texto
      let nombre = linea
        .replace(regexHora, '')
        .replace(regexPersonas, '')
        .replace(regexTelefono, '')
        .replace(/[-|,;:]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (nombre.length < 2) continue

      // Normalizar hora
      let hora = '20:00'
      if (horaMatch) {
        const raw = horaMatch[1].replace('h', ':').replace(/\s/g, '')
        const parts = raw.toLowerCase().replace('pm','').replace('am','').split(':')
        let h = parseInt(parts[0])
        const m = parts[1] ? parseInt(parts[1]) : 0
        if (horaMatch[0].toLowerCase().includes('pm') && h < 12) h += 12
        hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
      }

      resultado.push({
        cliente_nombre: nombre,
        cliente_telefono: telMatch ? telMatch[1] : '',
        hora,
        numero_personas: personasMatch ? parseInt(personasMatch[1]) : 2,
        rp_nombre: rpParaImportar,
        fecha: fechaParaImportar,
        notas: '',
        estado: 'pendiente'
      })
    }

    setReservasParsadas(resultado)
    if (resultado.length > 0) {
      setImportMensaje(`✅ ${resultado.length} reservaciones detectadas. Revisa y confirma.`)
    } else {
      setImportMensaje('⚠️ No se detectaron reservaciones. Revisa el formato del texto.')
    }
  }

  const handleGuardarReservacionesImportadas = async () => {
    if (reservasParsadas.length === 0) return
    if (!rpParaImportar) {
      setImportMensaje('❌ Selecciona el RP antes de guardar.')
      return
    }

    setLoadingImport(true)
    setImportMensaje('')

    const reservasConRP = reservasParsadas.map(r => ({
      ...r,
      rp_nombre: rpParaImportar,
      fecha: fechaParaImportar,
      estado: 'pendiente',
      creado_por: 'Ashton'
    }))

    const { error } = await supabase.from('reservaciones').insert(reservasConRP)

    if (error) {
      setImportMensaje(`❌ Error al guardar: ${error.message}`)
    } else {
      setImportMensaje(`✅ ${reservasParsadas.length} reservaciones guardadas para ${rpParaImportar}`)
      setReservasParsadas([])
      setArchivoTexto('')
      await cargarTodasReservaciones()
      setTimeout(() => setDialogImportarArchivo(false), 1500)
    }
    setLoadingImport(false)
  }

  // Funciones para procesar reservaciones con IA (Claude)
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
    setMensajeIA('🤖 Procesando con Claude Haiku 4...')
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

    // Si se seleccionó un RP específico, asignar todas a ese RP
    // Si no, usar los RPs detectados por Claude
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

  const handleRegistrarPedido = async () => {
    if (!mesaSeleccionada || pedido.length === 0) return

    setLoading(true)
    setMensaje('')

    try {
      const subtotal = pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)

      // Crear ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          mesa_numero: mesaSeleccionada.numero,
          productos: pedido,
          subtotal: subtotal,
          total: subtotal,
          mesero: 'Ashton',
          hostess: mesaSeleccionada.hostess || 'N/A'
        })

      if (ticketError) throw ticketError

      setMensaje('✅ Pedido registrado exitosamente')
      setMensajeTipo('success')
      setPedido([])
      
      setTimeout(() => {
        setDialogPedido(false)
        setMensaje('')
        cargarDatos()
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setMensaje('Error al registrar pedido')
      setMensajeTipo('error')
    } finally {
      setLoading(false)
    }
  }

  const calcularTotal = () => {
    return pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const categorias = Array.from(new Set(productos.map(p => p.categoria)))

  const handleLogout = () => {
    router.push('/dashboard/socios')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Ashton - Control de Pedidos
              </h1>
              <p className="text-purple-200 text-sm">Sistema exclusivo de gestión</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-purple-400/30 text-purple-100 hover:bg-purple-800/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-2 bg-purple-950/50 p-1 rounded-xl border border-purple-500/20">
          <button
            onClick={() => setVistaActiva('mesas')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              vistaActiva === 'mesas'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'text-purple-300 hover:text-white hover:bg-purple-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Mesas en Vivo
          </button>
          <button
            onClick={() => setVistaActiva('reservas')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              vistaActiva === 'reservas'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'text-purple-300 hover:text-white hover:bg-purple-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas Semana
            {reservasSemana.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {reservasSemana.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setVistaActiva('metricas'); cargarReservasHistoricas() }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              vistaActiva === 'metricas'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'text-purple-300 hover:text-white hover:bg-purple-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Métricas
            {reservasHistoricas.length > 0 && (
              <span className="bg-purple-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {reservasHistoricas.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setVistaActiva('reservaciones')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              vistaActiva === 'reservaciones'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'text-purple-300 hover:text-white hover:bg-purple-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservaciones
            {todasReservaciones.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {todasReservaciones.length}
              </span>
            )}
          </button>
        </div>

        {/* ========== VISTA RESERVAS SEMANALES ========== */}
        {vistaActiva === 'reservas' && (() => {
          // Agrupar por RP
          const rpsUnicos = Array.from(new Set(reservasSemana.map(r => r.rp_nombre || 'Sin RP'))).sort()
          const reservasFiltradas = filtroRP === 'todos'
            ? reservasSemana
            : reservasSemana.filter(r => (r.rp_nombre || 'Sin RP') === filtroRP)

          // Stats globales
          const totalReservas = reservasFiltradas.length
          const llegaron = reservasFiltradas.filter(r => r.asistio === true).length
          const noLlegaron = reservasFiltradas.filter(r => r.asistio === false).length
          const pendientes = reservasFiltradas.filter(r => r.asistio === null).length

          // Agrupar las filtradas por RP para la tabla
          const porRP: Record<string, Reservacion[]> = {}
          reservasFiltradas.forEach(r => {
            const rp = r.rp_nombre || 'Sin RP'
            if (!porRP[rp]) porRP[rp] = []
            porRP[rp].push(r)
          })

          return (
            <div className="space-y-4">
              {/* Stats resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">{totalReservas}</p>
                  <p className="text-purple-300 text-sm mt-1">Total Reservas</p>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{llegaron}</p>
                  <p className="text-emerald-300 text-sm mt-1">Llegaron ✅</p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-400">{noLlegaron}</p>
                  <p className="text-red-300 text-sm mt-1">No llegaron ❌</p>
                </div>
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400">{pendientes}</p>
                  <p className="text-amber-300 text-sm mt-1">Pendientes ⏳</p>
                </div>
              </div>

              {/* Filtro por RP */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-purple-300 text-sm font-medium">Filtrar por RP:</span>
                <button
                  onClick={() => setFiltroRP('todos')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filtroRP === 'todos'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-purple-900/50 text-purple-300 border border-purple-500/30 hover:border-purple-400'
                  }`}
                >
                  Todos ({reservasSemana.length})
                </button>
                {rpsUnicos.map(rp => {
                  const count = reservasSemana.filter(r => (r.rp_nombre || 'Sin RP') === rp).length
                  return (
                    <button
                      key={rp}
                      onClick={() => setFiltroRP(rp)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filtroRP === rp
                          ? 'bg-yellow-500 text-white'
                          : 'bg-purple-900/50 text-purple-300 border border-purple-500/30 hover:border-purple-400'
                      }`}
                    >
                      {rp} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Lista por RP */}
              {totalReservas === 0 ? (
                <div className="text-center py-16 text-purple-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No hay reservas esta semana</p>
                  <p className="text-sm text-purple-500 mt-1">Las reservas aparecerán aquí cuando los RPs las registren</p>
                </div>
              ) : (
                Object.entries(porRP).map(([rp, reservas]) => {
                  const rpLlegaron = reservas.filter(r => r.asistio === true).length
                  const rpNoLlegaron = reservas.filter(r => r.asistio === false).length
                  const rpPendientes = reservas.filter(r => r.asistio === null).length
                  const isExpanded = rpExpandido === rp || filtroRP !== 'todos'

                  return (
                    <div key={rp} className="bg-purple-950/40 border border-purple-500/20 rounded-2xl overflow-hidden">
                      {/* Header del RP */}
                      <button
                        onClick={() => setRpExpandido(isExpanded && filtroRP === 'todos' ? null : rp)}
                        className="w-full flex items-center justify-between p-4 hover:bg-purple-900/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-yellow-500/30">
                            {rp.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className="text-white font-semibold text-base">👑 {rp}</p>
                            <p className="text-purple-400 text-xs">{reservas.length} reserva{reservas.length !== 1 ? 's' : ''} esta semana</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-sm font-medium">{rpLlegaron}✅</span>
                          <span className="text-red-400 text-sm font-medium">{rpNoLlegaron}❌</span>
                          <span className="text-amber-400 text-sm font-medium">{rpPendientes}⏳</span>
                          {filtroRP === 'todos' && (
                            isExpanded
                              ? <ChevronUp className="w-4 h-4 text-purple-400 ml-2" />
                              : <ChevronDown className="w-4 h-4 text-purple-400 ml-2" />
                          )}
                        </div>
                      </button>

                      {/* Reservas del RP */}
                      {isExpanded && (
                        <div className="border-t border-purple-500/20">
                          {reservas.map((r, idx) => (
                            <div
                              key={r.id}
                              className={`flex items-center justify-between px-4 py-3 gap-3 ${
                                idx % 2 === 0 ? 'bg-purple-950/20' : 'bg-transparent'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-white font-medium text-sm">{r.cliente_nombre}</p>
                                  <span className="text-purple-400 text-xs">•</span>
                                  <span className="text-purple-300 text-xs">{r.numero_personas} pax</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-purple-400 text-xs">
                                    📅 {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="text-purple-400 text-xs">🕐 {r.hora}</span>
                                  {r.mesa_asignada && (
                                    <span className="text-yellow-400 text-xs">Mesa {r.mesa_asignada}</span>
                                  )}
                                </div>
                                {r.notas && (
                                  <p className="text-purple-500 text-xs mt-0.5 truncate">📝 {r.notas}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {r.asistio === true ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-1 text-xs font-medium">
                                    <UserCheck className="w-3 h-3" /> Llegó
                                  </span>
                                ) : r.asistio === false ? (
                                  <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2.5 py-1 text-xs font-medium">
                                    <UserX className="w-3 h-3" /> No llegó
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2.5 py-1 text-xs font-medium">
                                    ⏳ Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {/* Botón refrescar */}
              <div className="text-center pt-2">
                <button
                  onClick={cargarReservasSemana}
                  className="text-purple-400 hover:text-purple-200 text-sm underline underline-offset-2 transition-colors"
                >
                  Actualizar datos
                </button>
              </div>
            </div>
          )
        })()}

        {/* ========== VISTA MESAS EN VIVO ========== */}
        {vistaActiva === 'mesas' && <div className="space-y-4">

        {/* Mensaje */}
        {mensaje && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            mensajeTipo === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {mensajeTipo === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{mensaje}</span>
          </div>
        )}

        {/* Grid de Mesas */}
        <div className="space-y-4">
          {[
            ['8', '9', '17', '18', '19', '27'],
            ['28', '29', '7', '6', '16', '5'],
            ['15', '4', '14', '3', '13', '2'],
            ['22', '1', '21', '20', '30', '26'],
            ['25', '24', '23', '12', '11', '10']
          ].map((fila, filaIndex) => (
            <div key={filaIndex} className="grid grid-cols-6 gap-4">
              {fila.map((num) => {
                const mesa = mesas.find(m => m.numero === num)
                return mesa ? (
            <Card
              key={mesa.id}
              onClick={() => handleSeleccionarMesa(mesa)}
              className={`cursor-pointer transition-all duration-300 ${
                mesa.estado === 'disponible'
                  ? 'bg-green-900/30 border-green-500/30 hover:border-green-500/50'
                  : mesa.estado === 'ocupada'
                  ? 'bg-red-900/30 border-red-500/30 hover:border-red-500/50'
                  : 'bg-gray-900/30 border-gray-500/30'
              }`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {mesa.numero}
                  </p>
                  <Badge className={`mt-2 ${
                    mesa.estado === 'disponible' ? 'bg-green-500' :
                    mesa.estado === 'ocupada' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}>
                    {mesa.estado}
                  </Badge>
                </div>

                {mesa.estado === 'ocupada' && (
                  <div className="space-y-1 text-xs text-purple-200">
                    {mesa.cliente_nombre && (
                      <p className="truncate">
                        <Users className="w-3 h-3 inline mr-1" />
                        {mesa.cliente_nombre}
                      </p>
                    )}
                    {mesa.rp_nombre && (
                      <p className="truncate font-semibold text-yellow-400">
                        👑 {mesa.rp_nombre}
                      </p>
                    )}
                    {mesa.total_actual !== undefined && (
                      <p className="font-bold text-emerald-400">
                        ${mesa.total_actual.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
                ) : <div key={num} className="opacity-0"></div>
              })}
            </div>
          ))}
        </div>

        {/* Dialog de Pedido */}
        <Dialog open={dialogPedido} onOpenChange={setDialogPedido}>
          <DialogContent className="bg-gradient-to-br from-purple-950 to-pink-950 border-purple-500/30 text-white max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-2xl">
                Registrar Pedido - Mesa {mesaSeleccionada?.numero}
              </DialogTitle>
              <DialogDescription className="text-purple-200">
                {mesaSeleccionada?.cliente_nombre && (
                  <span>Cliente: {mesaSeleccionada.cliente_nombre}</span>
                )}
                {mesaSeleccionada?.rp_nombre && (
                  <span className="ml-4 text-yellow-400">
                    👑 RP: {mesaSeleccionada.rp_nombre}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Panel de Productos */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    placeholder="Buscar productos..."
                    className="pl-10 bg-purple-950/50 border-purple-500/30 text-white"
                  />
                </div>

                <ScrollArea className="h-[400px]">
                  {categorias.map(categoria => {
                    const productosCategoria = productosFiltrados.filter(p => p.categoria === categoria)
                    if (productosCategoria.length === 0) return null

                    return (
                      <div key={categoria} className="mb-4">
                        <h3 className="text-lg font-semibold text-purple-200 mb-2">{categoria}</h3>
                        <div className="space-y-2">
                          {productosCategoria.map(producto => (
                            <Button
                              key={producto.id}
                              onClick={() => handleAgregarProducto(producto)}
                              className="w-full justify-between bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30"
                            >
                              <span>{producto.nombre}</span>
                              <span className="font-bold text-yellow-400">${producto.precio}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </ScrollArea>
              </div>

              {/* Panel de Pedido */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Pedido Actual
                </h3>

                {pedido.length === 0 ? (
                  <div className="text-center py-12 text-purple-300">
                    <Utensils className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No hay productos en el pedido</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {pedido.map(item => (
                          <div
                            key={item.producto_id}
                            className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/20"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-white">{item.nombre}</span>
                              <span className="text-yellow-400 font-bold">
                                ${(item.precio * item.cantidad).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-purple-300">
                                ${item.precio} c/u
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCambiarCantidad(item.producto_id, -1)}
                                  className="h-8 w-8 p-0 border-purple-500/30"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-bold text-white">
                                  {item.cantidad}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCambiarCantidad(item.producto_id, 1)}
                                  className="h-8 w-8 p-0 border-purple-500/30"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-white">TOTAL</span>
                        <span className="text-2xl font-bold text-yellow-400">
                          ${calcularTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {mensaje && (
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        mensajeTipo === 'success'
                          ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                          : 'bg-red-500/10 border border-red-500/30 text-red-300'
                      }`}>
                        {mensajeTipo === 'success' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm">{mensaje}</span>
                      </div>
                    )}

                    <Button
                      onClick={handleRegistrarPedido}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold h-12"
                    >
                      {loading ? 'Registrando...' : 'Registrar Pedido'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========== DIALOG IMPORTAR ARCHIVO ========== */}
        <Dialog open={dialogImportarArchivo} onOpenChange={setDialogImportarArchivo}>
          <DialogContent className="bg-purple-900 border-purple-500/20 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Importar Reservaciones desde Archivo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* RP y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-200">RP Asignado *</Label>
                  <Select value={rpParaImportar} onValueChange={setRpParaImportar}>
                    <SelectTrigger className="bg-purple-800/50 border-purple-500/20 text-white">
                      <SelectValue placeholder="Selecciona RP" />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-500/20">
                      {Array.from(new Set(todasReservaciones.map(r => r.rp_nombre).filter(Boolean))).sort().map(rp => (
                        <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-200">Fecha del Evento</Label>
                  <Input
                    type="date"
                    value={fechaParaImportar}
                    onChange={(e) => setFechaParaImportar(e.target.value)}
                    className="bg-purple-800/50 border-purple-500/20 text-white"
                  />
                </div>
              </div>

              {/* Subir archivo */}
              <div>
                <Label className="text-purple-200">Subir archivo (.txt, .doc, .docx)</Label>
                <div className="mt-2 border-2 border-dashed border-purple-500/30 rounded-lg p-4 text-center hover:border-purple-400/50 transition-colors">
                  <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-300 text-sm mb-2">Arrastra tu archivo aquí o haz clic</p>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleArchivoSubido}
                    className="block w-full text-sm text-purple-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-700 file:text-white hover:file:bg-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* O pegar texto manualmente */}
              <div>
                <Label className="text-purple-200">O pega el texto del PDF/Word aquí</Label>
                <textarea
                  value={archivoTexto}
                  onChange={(e) => { setArchivoTexto(e.target.value); parsearTextoReservaciones(e.target.value) }}
                  className="w-full h-32 mt-1 bg-purple-800/50 border border-purple-500/20 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-purple-400"
                  placeholder={'Pega aquí el contenido del PDF. Ejemplo:\nJuan García - 21:00 - 4 personas\nMaría López - 22:00h - 2 pax\nCarlos Ruiz 5551234567 - 20:30'}
                />
              </div>

              {/* Mensaje de estado */}
              {importMensaje && (
                <div className={`text-sm p-3 rounded-lg border ${
                  importMensaje.startsWith('✅') ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                  importMensaje.startsWith('❌') ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                  'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                }`}>
                  {importMensaje}
                </div>
              )}

              {/* Preview de reservaciones parseadas */}
              {reservasParsadas.length > 0 && (
                <div>
                  <Label className="text-purple-200 mb-2 block">Vista previa ({reservasParsadas.length} reservaciones)</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {reservasParsadas.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-purple-800/40 rounded-lg px-3 py-2 text-sm">
                        <div className="flex-1">
                          <span className="text-white font-medium">{r.cliente_nombre}</span>
                          <span className="text-purple-300 ml-2">{r.hora} · {r.numero_personas}p</span>
                          {r.cliente_telefono && <span className="text-purple-400 ml-2">📞{r.cliente_telefono}</span>}
                        </div>
                        <button
                          onClick={() => setReservasParsadas(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleGuardarReservacionesImportadas}
                disabled={loadingImport || reservasParsadas.length === 0 || !rpParaImportar}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold disabled:opacity-40"
              >
                {loadingImport ? 'Guardando...' : `Guardar ${reservasParsadas.length} Reservaciones para ${rpParaImportar || '...'}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========== DIALOG PROCESAR CON IA (CLAUDE) ========== */}
        <Dialog open={dialogProcesarIA} onOpenChange={setDialogProcesarIA}>
          <DialogContent className="bg-purple-900 border-purple-500/20 max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Procesar Reservaciones con IA (Claude Haiku 4)
              </DialogTitle>
              <DialogDescription className="text-purple-300">
                Sube un archivo Excel, PDF, Word o imagen. La IA extraerá automáticamente las reservaciones.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Fecha del evento */}
              <div>
                <Label className="text-purple-200">Fecha del Evento/Evento *</Label>
                <Input
                  type="date"
                  value={fechaEventoIA}
                  onChange={(e) => setFechaEventoIA(e.target.value)}
                  className="bg-purple-800/50 border-purple-500/20 text-white"
                />
              </div>

              {/* Selector de RP (opcional) */}
              <div>
                <Label className="text-purple-200">RP (opcional - si no seleccionas, usa los que detecte la IA)</Label>
                <Select value={rpSeleccionadoIA} onValueChange={setRpSeleccionadoIA}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-500/20 text-white">
                    <SelectValue placeholder="Dejar que la IA detecte los RPs" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-900 border-purple-500/20">
                    <SelectItem value="">Detectar automáticamente</SelectItem>
                    {Array.from(new Set(todasReservaciones.map(r => r.rp_nombre).filter(Boolean))).sort().map(rp => (
                      <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subir archivo */}
              <div>
                <Label className="text-purple-200">Archivo (Excel, PDF, Word, Imagen) *</Label>
                <div className="mt-2 border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center hover:border-purple-400/50 transition-colors">
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-300 text-sm mb-2">
                    {archivoIA ? `📄 ${archivoIA.name}` : 'Arrastra tu archivo o haz clic para seleccionar'}
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
                    onChange={(e) => setArchivoIA(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-purple-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-700 file:text-white hover:file:bg-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Botón procesar */}
              <Button
                onClick={handleProcesarConClaude}
                disabled={loadingProcesarIA || !archivoIA}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold disabled:opacity-50"
              >
                {loadingProcesarIA ? (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Procesando con Claude...
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
                  mensajeIA.startsWith('✅') ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                  mensajeIA.startsWith('❌') ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                  'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                }`}>
                  {mensajeIA}
                </div>
              )}

              {/* Resultados por RP */}
              {resultadoIA && resultadoIA.resumen_por_rp && (
                <div className="bg-purple-800/40 rounded-lg p-4">
                  <h4 className="text-purple-200 font-semibold mb-3">📊 Resumen por RP</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(resultadoIA.resumen_por_rp).map(([rp, count]: [string, any]) => (
                      <div key={rp} className="bg-purple-900/60 rounded-lg px-3 py-2 text-center">
                        <p className="text-white font-medium">{rp}</p>
                        <p className="text-2xl font-bold text-purple-400">{count}</p>
                        <p className="text-xs text-purple-500">reservas</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de reservaciones detectadas */}
              {reservasConfirmadasIA.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-purple-200 font-semibold">
                      📋 Reservaciones Detectadas ({reservasConfirmadasIA.length})
                    </h4>
                    {resultadoIA?.errores_detectados?.length > 0 && (
                      <span className="text-xs text-yellow-400">
                        ⚠️ {resultadoIA.errores_detectados.length} líneas no reconocidas
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {reservasConfirmadasIA.map((reserva, i) => (
                      <div key={i} className="flex items-center justify-between bg-purple-800/40 rounded-lg px-3 py-2 text-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{reserva.cliente_nombre}</span>
                            <Badge className="bg-purple-600/30 text-purple-300 text-xs">
                              {reserva.rp_nombre || 'Sin RP'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-purple-400">
                            <span>🕐 {reserva.hora || '20:00'}</span>
                            <span>👥 {reserva.numero_personas || 2} personas</span>
                            {reserva.telefono && <span>📞 {reserva.telefono}</span>}
                          </div>
                          {reserva.notas && (
                            <p className="text-xs text-purple-500 mt-1">📝 {reserva.notas}</p>
                          )}
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
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold disabled:opacity-50"
                >
                  {loadingProcesarIA ? (
                    'Guardando...'
                  ) : (
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

        {/* ========== VISTA RESERVACIONES ========== */}
        {(vistaActiva as string) === 'reservaciones' && (() => {
          const rpsUnicos = Array.from(new Set(todasReservaciones.map(r => r.rp_nombre || 'Sin RP'))).sort()
          const reservasFiltradas = todasReservaciones.filter(r => {
            const matchRP = filtroRPReserva === 'todos' || (r.rp_nombre || 'Sin RP') === filtroRPReserva
            const matchEstado = filtroEstadoReserva === 'todas' || 
              (filtroEstadoReserva === 'llegaron' && r.asistio === true) ||
              (filtroEstadoReserva === 'no_llegaron' && r.asistio === false) ||
              (filtroEstadoReserva === 'pendientes' && r.asistio === null)
            return matchRP && matchEstado
          })

          const stats = {
            total: reservasFiltradas.length,
            llegaron: reservasFiltradas.filter(r => r.asistio === true).length,
            noLlegaron: reservasFiltradas.filter(r => r.asistio === false).length,
            pendientes: reservasFiltradas.filter(r => r.asistio === null).length
          }

          return (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-purple-900/30 border-purple-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-purple-300 text-sm mb-1">Total</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-900/30 border-green-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-green-300 text-sm mb-1">Llegaron</p>
                      <p className="text-3xl font-bold text-green-400">{stats.llegaron}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-900/30 border-red-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-red-300 text-sm mb-1">No Llegaron</p>
                      <p className="text-3xl font-bold text-red-400">{stats.noLlegaron}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-900/30 border-yellow-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-yellow-300 text-sm mb-1">Pendientes</p>
                      <p className="text-3xl font-bold text-yellow-400">{stats.pendientes}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros y Botón Nueva Reservación */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-3 flex-wrap">
                  <Select value={filtroRPReserva} onValueChange={setFiltroRPReserva}>
                    <SelectTrigger className="w-40 bg-purple-900/30 border-purple-500/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-500/20">
                      <SelectItem value="todos">Todos los RPs</SelectItem>
                      {rpsUnicos.map(rp => (
                        <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filtroEstadoReserva} onValueChange={setFiltroEstadoReserva}>
                    <SelectTrigger className="w-40 bg-purple-900/30 border-purple-500/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-500/20">
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="llegaron">Llegaron ✓</SelectItem>
                      <SelectItem value="no_llegaron">No Llegaron ✗</SelectItem>
                      <SelectItem value="pendientes">Pendientes ⏳</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                    onClick={() => { setImportMensaje(''); setReservasParsadas([]); setArchivoTexto(''); setDialogImportarArchivo(true) }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar PDF/Word
                  </Button>

                  <Button
                    onClick={() => { setMensajeIA(''); setResultadoIA(null); setReservasConfirmadasIA([]); setArchivoIA(null); setDialogProcesarIA(true) }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                  >
                    <span className="text-lg mr-2">🤖</span>
                    Procesar con IA (Claude)
                  </Button>

                <Dialog open={dialogNuevaReserva} onOpenChange={setDialogNuevaReserva}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Reservación
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-purple-900 border-purple-500/20 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-white">Crear Nueva Reservación</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-purple-200">Nombre del Cliente</Label>
                        <Input
                          value={nuevaReserva.cliente_nombre}
                          onChange={(e) => setNuevaReserva({...nuevaReserva, cliente_nombre: e.target.value})}
                          className="bg-purple-800/50 border-purple-500/20 text-white"
                          placeholder="Ej: Juan García"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Teléfono</Label>
                        <Input
                          value={nuevaReserva.cliente_telefono}
                          onChange={(e) => setNuevaReserva({...nuevaReserva, cliente_telefono: e.target.value})}
                          className="bg-purple-800/50 border-purple-500/20 text-white"
                          placeholder="Ej: 5551234567"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">RP Asignado</Label>
                        <Select value={nuevaReserva.rp_nombre} onValueChange={(val) => setNuevaReserva({...nuevaReserva, rp_nombre: val})}>
                          <SelectTrigger className="bg-purple-800/50 border-purple-500/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-purple-900 border-purple-500/20">
                            {rpsUnicos.map(rp => (
                              <SelectItem key={rp} value={rp}>{rp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-purple-200">Fecha</Label>
                          <Input
                            type="date"
                            value={nuevaReserva.fecha}
                            onChange={(e) => setNuevaReserva({...nuevaReserva, fecha: e.target.value})}
                            className="bg-purple-800/50 border-purple-500/20 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-200">Hora</Label>
                          <Input
                            type="time"
                            value={nuevaReserva.hora}
                            onChange={(e) => setNuevaReserva({...nuevaReserva, hora: e.target.value})}
                            className="bg-purple-800/50 border-purple-500/20 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-purple-200">Número de Personas</Label>
                        <Input
                          type="number"
                          value={nuevaReserva.numero_personas}
                          onChange={(e) => setNuevaReserva({...nuevaReserva, numero_personas: parseInt(e.target.value)})}
                          className="bg-purple-800/50 border-purple-500/20 text-white"
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-200">Notas</Label>
                        <Input
                          value={nuevaReserva.notas}
                          onChange={(e) => setNuevaReserva({...nuevaReserva, notas: e.target.value})}
                          className="bg-purple-800/50 border-purple-500/20 text-white"
                          placeholder="Ej: Preferencias, alergias, etc."
                        />
                      </div>
                      {mensaje && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${
                          mensajeTipo === 'success'
                            ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                            : 'bg-red-500/10 border border-red-500/30 text-red-300'
                        }`}>
                          {mensajeTipo === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <AlertCircle className="w-5 h-5" />
                          )}
                          <span className="text-sm">{mensaje}</span>
                        </div>
                      )}
                      <Button
                        onClick={handleCrearReservacion}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold"
                      >
                        {loading ? 'Creando...' : 'Crear Reservación'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tabla de Reservaciones */}
              <Card className="bg-purple-900/30 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-purple-500/20">
                          <th className="text-left py-3 px-4 text-purple-300">Cliente</th>
                          <th className="text-left py-3 px-4 text-purple-300">RP</th>
                          <th className="text-left py-3 px-4 text-purple-300">Fecha</th>
                          <th className="text-left py-3 px-4 text-purple-300">Hora</th>
                          <th className="text-left py-3 px-4 text-purple-300">Personas</th>
                          <th className="text-left py-3 px-4 text-purple-300">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservasFiltradas.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-purple-400">
                              No hay reservaciones
                            </td>
                          </tr>
                        ) : (
                          reservasFiltradas.map(reserva => (
                            <tr key={reserva.id} className="border-b border-purple-500/10 hover:bg-purple-800/20 transition-colors">
                              <td className="py-3 px-4 text-white font-medium">{reserva.cliente_nombre}</td>
                              <td className="py-3 px-4 text-purple-300">{reserva.rp_nombre || 'Sin RP'}</td>
                              <td className="py-3 px-4 text-purple-300">{new Date(reserva.fecha).toLocaleDateString('es-MX')}</td>
                              <td className="py-3 px-4 text-purple-300">{reserva.hora}</td>
                              <td className="py-3 px-4 text-purple-300">{reserva.numero_personas}</td>
                              <td className="py-3 px-4">
                                {reserva.asistio === true && (
                                  <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                                    <CheckCircle className="w-3 h-3" />
                                    Llegó
                                  </span>
                                )}
                                {reserva.asistio === false && (
                                  <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
                                    <AlertCircle className="w-3 h-3" />
                                    No llegó
                                  </span>
                                )}
                                {reserva.asistio === null && (
                                  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                                    <Clock className="w-3 h-3" />
                                    Pendiente
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })()}
        </div>}
      </div>
    </div>
  )
}
