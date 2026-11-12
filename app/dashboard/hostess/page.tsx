"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea"
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"
import { 
  Users, UserPlus, Armchair, Clock, Star,
  CheckCircle2, AlertCircle, Search, Phone,
  Calendar, User, LayoutGrid, QrCode, Unlock, X, PowerOff, Download, FileSpreadsheet,
  Box, Map as MapIcon, Radio, PanelRightClose, PanelRightOpen, ChevronUp, ChevronDown
} from "lucide-react"
import QRScanner from "@/components/QRScanner"

const MapaMesas3D = dynamic(() => import("@/components/mapa-mesas-3d"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#070503] text-sm font-semibold tracking-widest text-amber-500/70">
      CARGANDO MAPA 3D…
    </div>
  ),
})
import { 
  obtenerMesas, 
  asignarMesaCliente, 
  crearCliente,
  buscarClientePorTelefono,
  crearCalificacionHostess,
  crearCalificacionCliente,
  liberarMesa,
  reservarMesa
} from "@/lib/supabase-clientes"

interface Mesa {
  id: number
  numero: string
  capacidad: number
  estado: string
  cliente_nombre?: string
  cliente_id?: string
  numero_personas?: number
  hora_asignacion?: string
  total_actual?: number
  rp_asignado?: string
  mesero?: string
  pedidos_data?: any[]
}

// Fechas con las que puede estar guardada la noche en curso: la local (antes de las 6:00
// cuenta como la noche anterior) y la UTC que usan algunas pantallas al crear reservaciones
function fechasNocheActual() {
  const ahora = new Date()
  const noche = new Date(ahora.getTime() - (ahora.getHours() < 6 ? 24 * 3600 * 1000 : 0))
  return Array.from(new Set([noche.toLocaleDateString('en-CA'), ahora.toISOString().split('T')[0]]))
}

export default function HostessPage() {
  // Lista de mesas válidas que existen en el restaurante
  const MESAS_VALIDAS = ['1', '2', '4', '5', '6', '7', '10', '11', '12', '13', '14', '15', '16', '20', '21', '22', '23', '24', '25', '26', '30', '31', '32', '33', '34', '35', '36', '37']
  
  const [mesas, setMesas] = useState<Mesa[]>([])
  const firmaMesasRef = useRef('')
  const firmaReservacionesRef = useRef('')
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<Mesa[]>([])
  const [dialogRegistro, setDialogRegistro] = useState(false)
  const [dialogUnirMesas, setDialogUnirMesas] = useState(false)
  const [dialogReservar, setDialogReservar] = useState(false)
  const [dialogConfirmarReserva, setDialogConfirmarReserva] = useState(false)
  const [dialogAsignarMesaReserva, setDialogAsignarMesaReserva] = useState(false)
  const [reservacionParaAsignar, setReservacionParaAsignar] = useState<any>(null)
  const [mesaSeleccionadaReserva, setMesaSeleccionadaReserva] = useState<number | null>(null)
  const [mostrarQRScanner, setMostrarQRScanner] = useState(false)
  
  // Datos del cliente
  const [busquedaNombre, setBusquedaNombre] = useState("")
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([])
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    genero: ""
  })
  const [numeroPersonas, setNumeroPersonas] = useState(2)
  const [numeroHombres, setNumeroHombres] = useState(0)
  const [numeroMujeres, setNumeroMujeres] = useState(0)
  const [rpSeleccionado, setRpSeleccionado] = useState<string>("")
  const [rpsDisponibles, setRpsDisponibles] = useState<any[]>([])
  const [meseroSeleccionado, setMeseroSeleccionado] = useState<number | null>(null)
  const [meserosDisponibles, setMeserosDisponibles] = useState<any[]>([])
  
  // Calificación Cliente (solo Hostess califica al cliente, no al servicio)
  const [calificacionCliente, setCalificacionCliente] = useState({
    consumo: 5,
    look_feel: 5,
    vibe: 5,
    comentarios: ""
  })
  
  // Reservación
  const [reservacion, setReservacion] = useState({
    nombre: "",
    telefono: "",
    personas: 2,
    hora: ""
  })

  const [hostessNombre, setHostessNombre] = useState("Hostess")
  const [hostessId] = useState(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem("hostessId") || localStorage.getItem("userId")
      return id ? parseInt(id) : null
    }
    return null
  })
  const [reservaciones, setReservaciones] = useState<any[]>([])
  const [mesaOcupadaDetalle, setMesaOcupadaDetalle] = useState<Mesa | null>(null)
  const [dialogMesaOcupada, setDialogMesaOcupada] = useState(false)
  const [sugerenciasNombre, setSugerenciasNombre] = useState<any[]>([])
  
  // Vista del mapa de mesas (3D en tiempo real o plano 2D)
  const [vistaMapa, setVistaMapa] = useState<'3d' | '2d'>('3d')
  const [mapaEnVivo, setMapaEnVivo] = useState(false)
  const [esMovil, setEsMovil] = useState(false)
  useEffect(() => {
    const evaluar = () => {
      const w = window.innerWidth
      setEsMovil(w < 900 || (w < 1200 && window.innerHeight > w))
    }
    evaluar()
    window.addEventListener('resize', evaluar)
    return () => window.removeEventListener('resize', evaluar)
  }, [])
  const [panelTab, setPanelTab] = useState<'ocupadas' | 'reservadas' | 'llegadas'>('ocupadas')
  const [panelAbierto, setPanelAbierto] = useState(true)
  const [hojaExpandida, setHojaExpandida] = useState(false)
  const [mesaResaltada, setMesaResaltada] = useState<string | null>(null)
  const [enfoque, setEnfoque] = useState<{ numero: string; t: number } | null>(null)

  // Mapa de abreviaturas de RPs (nombre -> abreviatura)
  const [rpAbreviaturas, setRpAbreviaturas] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    // Exponer función de escaneo QR globalmente
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.handleQRScanGlobal = handleQRScan
    }
    
    cargarDatosHostess()
    cargarMesas()
    cargarRPs()
    cargarMeseros()
    cargarReservaciones()
    const interval = setInterval(() => {
      cargarMesas()
      cargarReservaciones()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    try {
      if (localStorage.getItem('hostessVistaMapa') === '2d') setVistaMapa('2d')
    } catch {}
  }, [])

  // Tiempo real: cualquier registro/liberación/reserva de mesa actualiza el mapa al instante
  useEffect(() => {
    let cancelado = false
    let canal: any = null
    let espera: ReturnType<typeof setTimeout> | null = null

    ;(async () => {
      const { supabase } = await import('@/lib/supabase')
      if (cancelado) return
      canal = supabase
        .channel('mesas-hostess-mapa')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, () => {
          if (espera) clearTimeout(espera)
          espera = setTimeout(cargarMesas, 150)
        })
        .subscribe((status: string) => setMapaEnVivo(status === 'SUBSCRIBED'))
    })()

    return () => {
      cancelado = true
      if (espera) clearTimeout(espera)
      canal?.unsubscribe()
    }
  }, [])

  const cambiarVistaMapa = (vista: '3d' | '2d') => {
    setVistaMapa(vista)
    try { localStorage.setItem('hostessVistaMapa', vista) } catch {}
  }
  
  async function cargarMeseros() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('meseros')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true })
      
      if (error) throw error
      setMeserosDisponibles(data || [])
    } catch (error) {
      console.error('Error cargando meseros:', error)
    }
  }

  async function cargarRPs() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // RPs y sus abreviaturas viven en limites_cortesias_rp
      const { data, error } = await supabase
        .from('limites_cortesias_rp')
        .select('rp_nombre, abreviatura, activo')
        .order('rp_nombre')
      
      if (error) throw error
      setRpsDisponibles((data || []).filter((rp: any) => rp.activo))
      
      // Mapa nombre -> abreviatura (incluye inactivos para mesas ya asignadas)
      const abreviaturasMap = new Map<string, string>()
      data?.forEach((rp: any) => {
        if (rp.abreviatura) {
          abreviaturasMap.set(rp.rp_nombre, rp.abreviatura)
        }
      })
      setRpAbreviaturas(abreviaturasMap)
    } catch (error) {
      console.error('Error cargando RPs:', error)
    }
  }

  async function cargarReservaciones() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .in('fecha', fechasNocheActual())
        .eq('estado', 'pendiente')
        .order('hora', { ascending: true })
      
      if (error) throw error
      const firma = JSON.stringify(data || [])
      if (firma === firmaReservacionesRef.current) return
      firmaReservacionesRef.current = firma
      setReservaciones(data || [])
    } catch (error) {
      console.error('Error cargando reservaciones:', error)
      setReservaciones([])
    }
  }

  function obtenerRPAleatorio() {
    if (rpsDisponibles.length === 0) return null
    const indiceAleatorio = Math.floor(Math.random() * rpsDisponibles.length)
    return rpsDisponibles[indiceAleatorio].rp_nombre
  }

  async function cargarDatosHostess() {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Si hay hostessId, buscar por ID
      if (hostessId) {
        const { data: hostessData, error } = await supabase
          .from('hostess')
          .select('nombre')
          .eq('id', hostessId)
          .single()
        
        if (hostessData && !error) {
          setHostessNombre(hostessData.nombre)
          localStorage.setItem("userName", hostessData.nombre)
          return
        }
      }
      
      // Si no hay ID, buscar la primera hostess activa
      const { data: hostessList, error: listError } = await supabase
        .from('hostess')
        .select('id, nombre')
        .eq('activo', true)
        .limit(1)
        .single()
      
      if (hostessList && !listError) {
        setHostessNombre(hostessList.nombre)
        localStorage.setItem("userName", hostessList.nombre)
        localStorage.setItem("hostessId", hostessList.id.toString())
        return
      }
      
      // Fallback: usar localStorage
      const nombreGuardado = localStorage.getItem("userName")
      if (nombreGuardado) {
        setHostessNombre(nombreGuardado)
      }
    } catch (error) {
      console.error('Error cargando datos de hostess:', error)
      // Fallback final
      const nombreGuardado = localStorage.getItem("userName") || "Verónica"
      setHostessNombre(nombreGuardado)
      localStorage.setItem("userName", nombreGuardado)
    }
  }

  async function cargarMesas() {
    const mesasData = await obtenerMesas()
    const firma = JSON.stringify(mesasData)
    if (firma === firmaMesasRef.current) return
    firmaMesasRef.current = firma
    setMesas(mesasData)
  }

  function handleConfirmarAsistencia(reservacion: any) {
    // Abrir dialog para seleccionar mesa
    setReservacionParaAsignar(reservacion)
    setDialogAsignarMesaReserva(true)
  }

  async function handleAsignarMesaAReserva() {
    if (!mesaSeleccionadaReserva || !reservacionParaAsignar) return

    try {
      const { supabase } = await import('@/lib/supabase')
      const { asignarMesaCliente } = await import('@/lib/supabase-clientes')
      
      // 1. Actualizar estado de la reservación a 'confirmada'
      const { error: errorReserva } = await supabase
        .from('reservaciones')
        .update({ 
          estado: 'confirmada',
          asistio: true,
          hora_llegada: new Date().toISOString(),
          mesa_asignada: parseInt(mesaSeleccionadaReserva.toString())
        })
        .eq('id', reservacionParaAsignar.id)
      
      if (errorReserva) throw errorReserva

      // 2. Buscar la mesa por número
      const { data: mesaData } = await supabase
        .from('mesas')
        .select('id')
        .eq('numero', mesaSeleccionadaReserva.toString())
        .single()

      if (!mesaData) throw new Error('Mesa no encontrada')

      // 3. Asignar la mesa usando la función correcta
      await asignarMesaCliente(mesaData.id, {
        cliente_nombre: reservacionParaAsignar.cliente_nombre,
        numero_personas: reservacionParaAsignar.numero_personas,
        hostess: hostessNombre,
        rp: reservacionParaAsignar.rp_nombre || null
      })
      
      alert(`✅ Mesa ${mesaSeleccionadaReserva} asignada a ${reservacionParaAsignar.cliente_nombre}`)
      
      // Limpiar y cerrar
      setDialogAsignarMesaReserva(false)
      setReservacionParaAsignar(null)
      setMesaSeleccionadaReserva(null)
      await cargarReservaciones()
      await cargarMesas()
    } catch (error: any) {
      console.error('Error asignando mesa:', error)
      alert(`Error: ${error.message || 'No se pudo asignar la mesa'}`)
    }
  }

  async function handleNoLlego(reservacion: any) {
    if (!confirm(`¿Confirmar que ${reservacion.cliente_nombre} NO llegó?`)) return
    
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Actualizar estado de la reservación a 'no_asistio'
      const { error } = await supabase
        .from('reservaciones')
        .update({ estado: 'no_asistio' })
        .eq('id', reservacion.id)
      
      if (error) {
        console.error('Error en Supabase:', error)
        throw error
      }
      
      alert(`❌ Marcado como no asistió: ${reservacion.cliente_nombre}`)
      await cargarReservaciones()
    } catch (error: any) {
      console.error('Error marcando no asistió:', error)
      alert(`Error: ${error.message || 'No se pudo marcar como no asistido'}`)
    }
  }

  const handleBuscarCliente = async () => {
    if (!busquedaNombre.trim()) return
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .ilike('nombre', `%${busquedaNombre}%`)
      .eq('activo', true)
      .limit(10)
    if (error) { setClientesEncontrados([]); return }
    if (data && data.length > 0) {
      setClientesEncontrados(data)
      setSugerenciasNombre([])
      if (data.length === 1) handleSeleccionarClienteEncontrado(data[0])
    } else {
      setClientesEncontrados([])
      setClienteEncontrado(null)
      setSugerenciasNombre([])
      setNuevoCliente({ ...nuevoCliente, nombre: busquedaNombre })
    }
  }

  const handleBusquedaEnTiempoReal = async (valor: string) => {
    setBusquedaNombre(valor)
    if (valor.length < 2) { setSugerenciasNombre([]); return }
    const { supabase } = await import('@/lib/supabase')
    const { data } = await supabase
      .from('clientes')
      .select('id, nombre, telefono, nivel_fidelidad, total_visitas')
      .ilike('nombre', `%${valor}%`)
      .eq('activo', true)
      .limit(6)
    setSugerenciasNombre(data || [])
  }

  const handleSeleccionarClienteEncontrado = (cliente: any) => {
    setClienteEncontrado(cliente)
    setClientesEncontrados([])
    setNuevoCliente({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      telefono: cliente.telefono || "",
      genero: cliente.genero || ""
    })
  }

  const handleQRScan = async (qrData: string) => {
    try {
      setMostrarQRScanner(false)
      
      // El QR contiene el ID del cliente
      const { supabase } = await import('@/lib/supabase')
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', qrData)
        .eq('activo', true)
        .single()
      
      if (error || !cliente) {
        alert('❌ Cliente no encontrado. Verifica el código QR.')
        return
      }
      
      // Cliente encontrado, seleccionarlo automáticamente
      handleSeleccionarClienteEncontrado(cliente)
      
      // Abrir dialog de asignación
      setDialogRegistro(true)
      
      // Mostrar notificación de éxito
      alert(`✅ Cliente encontrado: ${cliente.nombre}\n📊 Nivel: ${cliente.nivel_fidelidad}\n⭐ Visitas: ${cliente.total_visitas}`)
      
    } catch (error) {
      console.error('Error procesando QR:', error)
      alert('❌ Error al procesar el código QR')
    }
  }

  const handleAsignarClienteDirecto = async () => {
    if (!mesaSeleccionada || !clienteEncontrado) return

    try {
      // Determinar RP
      const rpFinal = rpSeleccionado || obtenerRPAleatorio()

      // Asignar mesa directamente con cliente existente
      const meseroAsignado = meserosDisponibles.find(m => m.id === meseroSeleccionado)
      await asignarMesaCliente(mesaSeleccionada.id, {
        cliente_id: clienteEncontrado.id,
        cliente_nombre: clienteEncontrado.nombre,
        numero_personas: numeroPersonas,
        mesero: meseroAsignado ? `${meseroAsignado.nombre} ${meseroAsignado.apellido}` : undefined,
        mesero_id: meseroSeleccionado || undefined,
        rp: rpFinal
      } as any)

      // Limpiar y recargar
      setDialogRegistro(false)
      setMesaSeleccionada(null)
      setBusquedaNombre("")
      setClientesEncontrados([])
      setClienteEncontrado(null)
      setRpSeleccionado("")
      setMeseroSeleccionado(null)
      setNuevoCliente({
        nombre: "",
        apellido: "",
        telefono: "",
        genero: ""
      })
      setNumeroPersonas(2)
      setNumeroHombres(0)
      setNumeroMujeres(0)
      await cargarMesas()
      
      const mensajeRP = rpFinal ? ` (RP: ${rpFinal})` : ''
      alert(`✅ Mesa ${mesaSeleccionada.numero} asignada a ${clienteEncontrado.nombre}${mensajeRP}`)
    } catch (error) {
      console.error('Error al asignar mesa:', error)
      alert('Error al asignar la mesa')
    }
  }

  const handleSeleccionarMesa = (mesa: Mesa) => {
    if (mesa.estado === 'ocupada') {
      setMesaOcupadaDetalle(mesa)
      setDialogMesaOcupada(true)
      return
    }
    if (numeroPersonas > 10) {
      setDialogUnirMesas(true)
      setMesasSeleccionadas([mesa])
    } else {
      setMesaSeleccionada(mesa)
      setDialogRegistro(true)
    }
  }

  const toggleMesaUnion = (mesa: Mesa) => {
    if (mesasSeleccionadas.find(m => m.id === mesa.id)) {
      setMesasSeleccionadas(mesasSeleccionadas.filter(m => m.id !== mesa.id))
    } else {
      setMesasSeleccionadas([...mesasSeleccionadas, mesa])
    }
  }

  const capacidadTotal = mesasSeleccionadas.reduce((sum, m) => sum + m.capacidad, 0)

  const handleAsignarMesasUnidas = async () => {
    if (mesasSeleccionadas.length === 0) return

    try {
      let clienteId = clienteEncontrado?.id
      let nombreCompleto = clienteEncontrado?.nombre || `${nuevoCliente.nombre} ${nuevoCliente.apellido}`.trim()

      // SIEMPRE crear cliente si no existe
      if (!clienteId) {
        console.log('🆕 Creando nuevo cliente automáticamente (mesas unidas)...')
        
        const nuevoClienteData = await crearCliente({
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido || '',
          telefono: nuevoCliente.telefono || `+52 555 ${Math.floor(Math.random() * 10000000)}`,
          email: '',
          genero: (nuevoCliente.genero as any) || 'no_especifica',
          fecha_nacimiento: undefined,
          nivel_fidelidad: 'bronce',
          puntos_rewards: 0,
          activo: true
        })
        
        if (nuevoClienteData) {
          clienteId = nuevoClienteData.id
          console.log('✅ Cliente creado:', {
            id: clienteId,
            nombre: nombreCompleto
          })
          
          alert(`✅ Cliente "${nombreCompleto}" registrado en el sistema`)
        }
      } else {
        console.log('✅ Cliente existente encontrado:', nombreCompleto)
      }

      // Determinar RP
      const rpFinal = rpSeleccionado || obtenerRPAleatorio()

      // Asignar todas las mesas seleccionadas
      const mesasNumeros = mesasSeleccionadas.map(m => m.numero).join('+')
      const meseroAsignado = meserosDisponibles.find(m => m.id === meseroSeleccionado)
      
      for (const mesa of mesasSeleccionadas) {
        await asignarMesaCliente(mesa.id, {
          cliente_id: clienteId || '',
          cliente_nombre: nombreCompleto,
          numero_personas: numeroPersonas,
          mesero: meseroAsignado ? `${meseroAsignado.nombre} ${meseroAsignado.apellido}` : undefined,
          mesero_id: meseroSeleccionado || undefined,
          rp: rpFinal
        } as any)
      }

      // Limpiar y recargar
      setDialogUnirMesas(false)
      setDialogRegistro(false)
      setMesasSeleccionadas([])
      setMesaSeleccionada(null)
      setBusquedaNombre("")
      setClientesEncontrados([])
      setClienteEncontrado(null)
      setRpSeleccionado("")
      setMeseroSeleccionado(null)
      setNuevoCliente({
        nombre: "",
        apellido: "",
        telefono: "",
        genero: ""
      })
      await cargarMesas()
      
      const mensajeRP = rpFinal ? ` (RP: ${rpFinal})` : ''
      alert(`✅ Mesas ${mesasNumeros} unidas y asignadas a ${nombreCompleto}${mensajeRP}`)
    } catch (error) {
      console.error('Error al asignar mesas:', error)
      alert('Error al asignar las mesas')
    }
  }

  const handleAsignarMesa = async () => {
    if (!mesaSeleccionada) return

    try {
      let clienteId = clienteEncontrado?.id
      let nombreCompleto = clienteEncontrado?.nombre || `${nuevoCliente.nombre} ${nuevoCliente.apellido}`.trim()

      // SIEMPRE crear cliente si no existe
      if (!clienteId) {
        console.log('🆕 Creando nuevo cliente automáticamente...')
        
        const nuevoClienteData = await crearCliente({
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido || '',
          telefono: nuevoCliente.telefono || `+52 555 ${Math.floor(Math.random() * 10000000)}`,
          email: '',
          genero: (nuevoCliente.genero as any) || 'no_especifica',
          fecha_nacimiento: undefined,
          nivel_fidelidad: 'bronce',
          puntos_rewards: 0,
          activo: true
        })
        
        if (nuevoClienteData) {
          clienteId = nuevoClienteData.id
          console.log('✅ Cliente creado:', {
            id: clienteId,
            nombre: nombreCompleto,
            telefono: nuevoClienteData.telefono
          })
          
          alert(`✅ Cliente "${nombreCompleto}" registrado en el sistema`)
        }
      } else {
        console.log('✅ Cliente existente encontrado:', nombreCompleto)
      }

      // Determinar RP
      const rpFinal = rpSeleccionado || obtenerRPAleatorio()

      // Asignar mesa
      const meseroAsignado = meserosDisponibles.find(m => m.id === meseroSeleccionado)
      await asignarMesaCliente(mesaSeleccionada.id, {
        cliente_id: clienteId || '',
        cliente_nombre: nombreCompleto,
        numero_personas: numeroPersonas,
        mesero: meseroAsignado ? `${meseroAsignado.nombre} ${meseroAsignado.apellido}` : undefined,
        mesero_id: meseroSeleccionado || undefined,
        rp: rpFinal
      } as any)

      // Limpiar y recargar
      setDialogRegistro(false)
      setMesaSeleccionada(null)
      setBusquedaNombre("")
      setClientesEncontrados([])
      setClienteEncontrado(null)
      setMeseroSeleccionado(null)
      setNuevoCliente({
        nombre: "",
        apellido: "",
        telefono: "",
        genero: ""
      })
      await cargarMesas()
      
      alert(`✅ Mesa ${mesaSeleccionada.numero} asignada a ${nombreCompleto}`)
    } catch (error) {
      console.error('Error al asignar mesa:', error)
      alert('Error al asignar la mesa')
    }
  }

  const handleCerrarTodasMesas = async () => {
    if (mesasOcupadas.length === 0) {
      alert('No hay mesas ocupadas en este momento.')
      return
    }
    const confirmacion = confirm(
      `⚠️ ¿Cerrar TODAS las mesas ocupadas?\n\n${mesasOcupadas.length} mesa(s) activa(s).\n\nSe generarán tickets para todas las mesas con consumo y quedarán disponibles.`
    )
    if (!confirmacion) return

    const { supabase } = await import('@/lib/supabase')
    let exitosas = 0
    let errores = 0

    for (const mesa of mesasOcupadas) {
      try {
        const totalConsumo = mesa.total_actual || 0
        if (totalConsumo > 0) {
          await supabase.from('tickets').insert({
            cliente_id: mesa.cliente_id || null,
            cliente_nombre: mesa.cliente_nombre,
            mesa_numero: parseInt(mesa.numero),
            productos: mesa.pedidos_data || [],
            subtotal: totalConsumo,
            propina: 0,
            total: totalConsumo,
            metodo_pago: 'Cierre masivo por Hostess',
            mesero: mesa.mesero || 'Sin mesero',
            rp_nombre: mesa.rp_asignado || null,
            notas: `Cierre masivo de mesas por hostess.`,
            created_at: new Date().toISOString()
          })
          if (mesa.cliente_id) {
            const { data: clienteData } = await supabase
              .from('clientes').select('consumo_total').eq('id', mesa.cliente_id).single()
            if (clienteData) {
              await supabase.from('clientes').update({
                consumo_total: (clienteData.consumo_total || 0) + totalConsumo,
                ultima_visita: new Date().toISOString()
              }).eq('id', mesa.cliente_id)
            }
          }
        }
        await supabase.from('mesas').update({
          estado: 'disponible',
          cliente_id: null,
          cliente_nombre: null,
          numero_personas: 0,
          total_actual: 0,
          hora_asignacion: null,
          hostess: null,
          mesero: null,
          rp: null,
          pedidos_data: []
        }).eq('id', mesa.id)
        exitosas++
      } catch (e) {
        console.error(`Error cerrando mesa ${mesa.numero}:`, e)
        errores++
      }
    }

    alert(`✅ Cierre masivo completado\n${exitosas} mesa(s) liberadas${errores > 0 ? `\n❌ ${errores} error(es)` : ''}`)
    await cargarMesas()
  }

  const generarReporteOcupacion = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Obtener fecha actual
      const hoy = new Date()
      const fechaStr = hoy.toISOString().split('T')[0]
      const horaStr = hoy.toTimeString().slice(0, 5)
      
      // 1. Obtener mesas ocupadas con detalles
      const { data: mesasOcupadasData, error: errorMesas } = await supabase
        .from('mesas')
        .select('*')
        .eq('estado', 'ocupada')
      
      if (errorMesas) throw errorMesas
      
      // 2. Obtener reservaciones del día
      const { data: reservacionesData, error: errorReservas } = await supabase
        .from('reservaciones')
        .select('*')
        .in('fecha', fechasNocheActual())
      
      if (errorReservas) throw errorReservas
      
      // 3. Calcular estadísticas
      const totalMesas = mesas.length
      const ocupadas = mesasOcupadasData?.length || 0
      const disponibles = totalMesas - ocupadas
      const porcentajeOcupacion = totalMesas > 0 ? Math.round((ocupadas / totalMesas) * 100) : 0
      
      // 4. Agrupar por RP
      const porRP: Record<string, { mesas: number, personas: number }> = {}
      mesasOcupadasData?.forEach((mesa: any) => {
        const rp = mesa.rp_asignado || 'Sin RP'
        if (!porRP[rp]) {
          porRP[rp] = { mesas: 0, personas: 0 }
        }
        porRP[rp].mesas++
        porRP[rp].personas += (mesa.numero_personas || 0)
      })
      
      // 5. Reservaciones por estado
      const reservasConfirmadas = reservacionesData?.filter((r: any) => r.estado === 'completada').length || 0
      const reservasPendientes = reservacionesData?.filter((r: any) => r.estado === 'pendiente').length || 0
      const reservasNoAsistieron = reservacionesData?.filter((r: any) => r.estado === 'no_asistio').length || 0
      const totalPersonasReservas = reservacionesData?.reduce((sum: number, r: any) => sum + (r.numero_personas || 0), 0) || 0
      
      // 6. Crear CSV
      let csvContent = `REPORTE DE OCUPACIÓN - ${fechaStr}\n`
      csvContent += `Generado: ${horaStr}\n`
      csvContent += `Hostess: ${hostessNombre}\n\n`
      
      csvContent += `RESUMEN GENERAL\n`
      csvContent += `Total Mesas,${totalMesas}\n`
      csvContent += `Mesas Ocupadas,${ocupadas}\n`
      csvContent += `Mesas Disponibles,${disponibles}\n`
      csvContent += `% Ocupación,${porcentajeOcupacion}%\n\n`
      
      csvContent += `RESERVACIONES DEL DÍA\n`
      csvContent += `Total Reservaciones,${reservacionesData?.length || 0}\n`
      csvContent += `Confirmadas (Llegaron),${reservasConfirmadas}\n`
      csvContent += `Pendientes,${reservasPendientes}\n`
      csvContent += `No Asistieron,${reservasNoAsistieron}\n`
      csvContent += `Total Personas (Reservas),${totalPersonasReservas}\n\n`
      
      csvContent += `OCUPACIÓN POR RP\n`
      csvContent += `RP,Abreviatura,Mesas Activas,Personas\n`
      Object.entries(porRP).forEach(([rp, data]) => {
        const abreviatura = rpAbreviaturas.get(rp) || ''
        csvContent += `${rp},${abreviatura},${data.mesas},${data.personas}\n`
      })
      csvContent += `\n`
      
      csvContent += `DETALLE DE MESAS OCUPADAS\n`
      csvContent += `Mesa,Cliente,Personas,RP,Abreviatura,Hora Asignación\n`
      mesasOcupadasData?.forEach((mesa: any) => {
        const abreviatura = rpAbreviaturas.get(mesa.rp_asignado) || ''
        const horaAsignacion = mesa.hora_asignacion 
          ? new Date(mesa.hora_asignacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : ''
        csvContent += `${mesa.numero},${mesa.cliente_nombre || ''},${mesa.numero_personas || 0},${mesa.rp_asignado || ''},${abreviatura},${horaAsignacion}\n`
      })
      csvContent += `\n`
      
      csvContent += `DETALLE DE RESERVACIONES\n`
      csvContent += `Hora,Cliente,Personas,Estado,RP,Abreviatura,Mesa Asignada\n`
      reservacionesData?.forEach((res: any) => {
        const abreviatura = rpAbreviaturas.get(res.rp_nombre) || ''
        csvContent += `${res.hora},${res.cliente_nombre},${res.numero_personas},${res.estado},${res.rp_nombre || ''},${abreviatura},${res.mesa_asignada || ''}\n`
      })
      
      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte-ocupacion-${fechaStr}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert(`✅ Reporte descargado: reporte-ocupacion-${fechaStr}.csv`)
    } catch (error) {
      console.error('Error generando reporte:', error)
      alert('❌ Error al generar el reporte')
    }
  }

  const handleLiberarMesa = async (mesa: any) => {
    const totalConsumo = mesa.total_actual || 0
    const mensajeConfirmacion = totalConsumo > 0 
      ? `¿Liberar Mesa ${mesa.numero}?\n\nCliente: ${mesa.cliente_nombre}\nConsumo: $${totalConsumo.toFixed(2)}\n\nSe cerrará la cuenta automáticamente.`
      : `¿Liberar Mesa ${mesa.numero}?\n\nCliente: ${mesa.cliente_nombre}\n\nNo hay consumo registrado.`
    
    if (!confirm(mensajeConfirmacion)) {
      return
    }

    try {
      const { supabase } = await import('@/lib/supabase')
      
      // 1. Si hay consumo, crear ticket automáticamente
      if (totalConsumo > 0) {
        const ticketData = {
          cliente_id: mesa.cliente_id || null,
          cliente_nombre: mesa.cliente_nombre,
          mesa_numero: parseInt(mesa.numero),
          productos: mesa.pedidos_data || [],
          subtotal: totalConsumo,
          propina: 0,
          total: totalConsumo,
          metodo_pago: 'Liberado por Hostess',
          mesero: mesa.mesero || 'Sin mesero',
          rp_nombre: mesa.rp_asignado || null,
          notas: `Mesa liberada por hostess. Cuenta cerrada automáticamente.`,
          created_at: new Date().toISOString()
        }

        const { error: ticketError } = await supabase
          .from('tickets')
          .insert(ticketData)
        
        if (ticketError) {
          console.error('Error creando ticket:', ticketError)
          throw new Error('Error al crear el ticket de la cuenta')
        }

        // 2. Actualizar consumo total del cliente si existe
        if (mesa.cliente_id) {
          const { data: clienteData } = await supabase
            .from('clientes')
            .select('consumo_total')
            .eq('id', mesa.cliente_id)
            .single()
          
          if (clienteData) {
            await supabase
              .from('clientes')
              .update({
                consumo_total: (clienteData.consumo_total || 0) + totalConsumo,
                ultima_visita: new Date().toISOString()
              })
              .eq('id', mesa.cliente_id)
          }
        }
      }
      
      // 3. Liberar la mesa completamente
      const { error: mesaError } = await supabase
        .from('mesas')
        .update({
          estado: 'disponible',
          cliente_id: null,
          cliente_nombre: null,
          numero_personas: 0,
          total_actual: 0,
          hora_asignacion: null,
          hostess: null,
          mesero: null,
          rp: null,
          pedidos_data: []
        })
        .eq('id', mesa.id)
      
      if (mesaError) {
        console.error('Error al liberar mesa:', mesaError)
        throw mesaError
      }
      
      const mensaje = totalConsumo > 0
        ? `✅ Mesa ${mesa.numero} liberada\n💰 Cuenta cerrada: $${totalConsumo.toFixed(2)}\n📋 Ticket generado en historial`
        : `✅ Mesa ${mesa.numero} liberada correctamente`
      
      alert(mensaje)
      await cargarMesas()
    } catch (error) {
      console.error('Error al liberar mesa:', error)
      alert(`❌ Error al liberar la mesa: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const obtenerHorario = () => {
    const hora = new Date().getHours()
    if (hora >= 8 && hora < 12) return 'desayuno'
    if (hora >= 12 && hora < 17) return 'comida'
    if (hora >= 17 && hora < 20) return 'tarde'
    return 'cena'
  }

  const handleReservarMesa = async () => {
    if (!mesaSeleccionada) return

    try {
      // 1. Buscar o crear cliente
      let cliente = await buscarClientePorTelefono(reservacion.telefono)
      
      if (!cliente) {
        // Crear nuevo cliente
        const nuevoCliente = await crearCliente({
          nombre: reservacion.nombre,
          telefono: reservacion.telefono,
          genero: 'no_especifica',
          nivel_fidelidad: 'bronce',
          puntos_rewards: 0,
          activo: true
        })
        cliente = nuevoCliente
      }

      // 2. Crear RESERVA (no ocupada, solo reservada)
      await reservarMesa(mesaSeleccionada.id, {
        cliente_nombre: reservacion.nombre,
        numero_personas: reservacion.personas,
        telefono: reservacion.telefono,
        hora_reserva: reservacion.hora ? new Date(reservacion.hora).toISOString() : undefined
      })
      
      // 3. Actualizar mesa con cliente_id
      if (cliente) {
        const { supabase } = await import('@/lib/supabase')
        await supabase
          .from('mesas')
          .update({ cliente_id: cliente.id })
          .eq('id', mesaSeleccionada.id)
      }

      // 4. Cerrar dialog y limpiar
      setDialogReservar(false)
      setReservacion({
        nombre: "",
        telefono: "",
        personas: 2,
        hora: ""
      })
      setMesaSeleccionada(null)
      
      // 5. Recargar mesas
      await cargarMesas()
      
      alert(`✅ Reserva creada - Mesa ${mesaSeleccionada.numero} reservada para ${reservacion.nombre}`)
      alert(`Cuando llegue el cliente, haz click en "Confirmar" para activar la mesa`)
    } catch (error) {
      console.error('Error al crear reserva:', error)
      alert('Error al crear la reserva')
    }
  }

  const mesasDisponibles = mesas.filter(m => m.estado === 'disponible' && MESAS_VALIDAS.includes(m.numero))
  const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada' && MESAS_VALIDAS.includes(m.numero))
  const mesasReservadas = mesas.filter(m => m.estado === 'reservada' && MESAS_VALIDAS.includes(m.numero))

  // ===== Integración mapa ↔ panel de operación =====
  const ALTO_HOJA_CERRADA = 84
  const margenesMapa = esMovil
    ? { arriba: 104, abajo: ALTO_HOJA_CERRADA, izquierda: 0, derecha: 0 }
    : { arriba: 124, abajo: 0, izquierda: 0, derecha: panelAbierto ? 412 : 0 }

  const enfocarMesa = (numero: string) => {
    setMesaResaltada(numero)
    setEnfoque({ numero, t: Date.now() })
    if (esMovil) setHojaExpandida(false)
  }

  const alSeleccionarMesaMapa = (mesa: { id: number }) => {
    const completa = mesas.find(m => m.id === mesa.id)
    if (!completa) return
    if (completa.estado === 'reservada') {
      setPanelTab('reservadas')
      setPanelAbierto(true)
      setHojaExpandida(true)
      setMesaResaltada(completa.numero)
      return
    }
    handleSeleccionarMesa(completa)
  }

  const cancelarReservaMesa = async (mesa: Mesa) => {
    if (confirm(`¿Cancelar reserva de Mesa ${mesa.numero}?`)) {
      const { supabase } = await import('@/lib/supabase')
      await supabase
        .from('mesas')
        .update({
          estado: 'disponible',
          cliente_nombre: null,
          numero_personas: null,
          rp_asignado: null
        })
        .eq('id', mesa.id)
      await cargarMesas()
    }
  }

  const porcentajeOcupacion = mesas.length > 0 ? Math.round((mesasOcupadas.length / mesas.length) * 100) : 0
  const kpis = [
    { texto: 'Disponibles', valor: mesasDisponibles.length, color: '#10b981' },
    { texto: 'Ocupadas', valor: mesasOcupadas.length, color: '#ef4444' },
    { texto: 'Reservadas', valor: mesasReservadas.length, color: '#f59e0b' },
    { texto: 'Por llegar', valor: reservaciones.length, color: '#a855f7' },
    { texto: 'Ocupación', valor: `${porcentajeOcupacion}%`, color: '#fbbf24' },
  ]

  const chipRP = (nombre?: string) => {
    if (!nombre) return null
    const abrev = rpAbreviaturas.get(nombre)
    return (
      <div className="mt-1 flex items-center gap-1">
        {abrev ? (
          <>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
              <span className="text-[10px] font-bold text-white">{abrev}</span>
            </div>
            <span className="truncate text-xs text-slate-400">{nombre}</span>
          </>
        ) : (
          <span className="truncate text-xs text-amber-400">👑 RP: {nombre}</span>
        )}
      </div>
    )
  }

  const insigniaMesa = (numero: string, color: string) => (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 bg-black/40 text-base font-black text-white"
      style={{ borderColor: color, boxShadow: `0 0 14px ${color}55, inset 0 0 10px ${color}33`, textShadow: `0 0 8px ${color}` }}
    >
      {numero}
    </div>
  )

  const vacio = (texto: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="mb-2 h-10 w-10 text-slate-700" />
      <p className="text-xs text-slate-500">{texto}</p>
    </div>
  )

  const propsTarjetaMesa = (numero: string) => ({
    onMouseEnter: () => setMesaResaltada(numero),
    onMouseLeave: () => setMesaResaltada(null),
    onClick: () => enfocarMesa(numero),
  })

  const pestanasPanel = (
    <>
      {([
        ['ocupadas', 'Ocupadas', mesasOcupadas.length, 'bg-red-500/20 text-red-300'],
        ['reservadas', 'Reservadas', mesasReservadas.length, 'bg-amber-500/20 text-amber-300'],
        ['llegadas', 'Por llegar', reservaciones.length, 'bg-purple-500/20 text-purple-300'],
      ] as const).map(([id, texto, total, colorTotal]) => (
        <button
          key={id}
          onClick={() => { setPanelTab(id); if (esMovil) setHojaExpandida(true) }}
          className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-all ${panelTab === id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          {texto}
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${colorTotal}`}>{total}</span>
        </button>
      ))}
    </>
  )

  const contenidoPanel = panelTab === 'ocupadas' ? (
    mesasOcupadas.length === 0 ? vacio('No hay mesas ocupadas') : mesasOcupadas.map((mesa) => (
      <div
        key={mesa.id}
        {...propsTarjetaMesa(mesa.numero)}
        className={`cursor-pointer rounded-xl border p-3 transition-all ${mesaResaltada === mesa.numero ? 'border-red-500/50 bg-red-500/[0.08]' : 'border-white/5 bg-white/[0.03] hover:border-red-500/40 hover:bg-red-500/[0.06]'}`}
      >
        <div className="flex items-center gap-3">
          {insigniaMesa(mesa.numero, '#ef4444')}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{mesa.cliente_nombre}</p>
            <p className="text-xs text-slate-400">
              {mesa.numero_personas} personas
              {mesa.hora_asignacion ? ` · ${new Date(mesa.hora_asignacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
            {chipRP(mesa.rp_asignado)}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-base font-black text-emerald-400">${(mesa.total_actual || 0).toFixed(2)}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); handleLiberarMesa(mesa) }}
              className="h-7 rounded-lg border-red-500/40 bg-transparent px-2 text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300"
            >
              <Unlock className="mr-1 h-3 w-3" />
              Liberar
            </Button>
          </div>
        </div>
      </div>
    ))
  ) : panelTab === 'reservadas' ? (
    mesasReservadas.length === 0 ? vacio('No hay mesas reservadas') : mesasReservadas.map((mesa) => (
      <div
        key={mesa.id}
        {...propsTarjetaMesa(mesa.numero)}
        className={`cursor-pointer rounded-xl border p-3 transition-all ${mesaResaltada === mesa.numero ? 'border-amber-500/50 bg-amber-500/[0.08]' : 'border-white/5 bg-white/[0.03] hover:border-amber-500/40 hover:bg-amber-500/[0.06]'}`}
      >
        <div className="flex items-center gap-3">
          {insigniaMesa(mesa.numero, '#f59e0b')}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{mesa.cliente_nombre || 'Reservada'}</p>
            <p className="text-xs text-slate-400">{mesa.numero_personas} personas</p>
            {chipRP(mesa.rp_asignado)}
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // Convertir reserva a ocupada
                const mesaData = mesas.find(m => m.id === mesa.id)
                if (mesaData) handleSeleccionarMesa(mesaData)
              }}
              className="h-7 rounded-lg bg-emerald-600 px-2 text-xs hover:bg-emerald-500"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Llegó
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); cancelarReservaMesa(mesa) }}
              className="h-7 rounded-lg border-red-500/40 bg-transparent px-2 text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300"
            >
              <X className="mr-1 h-3 w-3" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    ))
  ) : (
    reservaciones.length === 0 ? vacio('No hay reservaciones pendientes') : reservaciones.map((reservacion) => (
      <div key={reservacion.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-purple-500/40">
        <div className="flex items-start gap-3">
          <div className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border-2 border-purple-500 bg-black/40 px-1.5 text-xs font-black text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.35)]">
            {reservacion.hora}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{reservacion.cliente_nombre}</p>
            <p className="text-xs text-slate-400">
              👥 {reservacion.numero_personas} personas
              {reservacion.numero_hombres > 0 && ` • ${reservacion.numero_hombres} 👨`}
              {reservacion.numero_mujeres > 0 && ` • ${reservacion.numero_mujeres} 👩`}
            </p>
            {chipRP(reservacion.rp_nombre)}
            {reservacion.notas && (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">📝 {reservacion.notas}</p>
            )}
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={() => handleConfirmarAsistencia(reservacion)}
            className="h-8 rounded-lg bg-emerald-600 text-xs hover:bg-emerald-500"
          >
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNoLlego(reservacion)}
            className="h-8 rounded-lg border-red-500/40 bg-transparent text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300"
          >
            <AlertCircle className="mr-1 h-3.5 w-3.5" />
            No Llegó
          </Button>
        </div>
      </div>
    ))
  )

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-[#070503] text-slate-100">
      {/* ===== Mapa a pantalla completa ===== */}
      {vistaMapa === '3d' ? (
        <MapaMesas3D
          mesas={mesas.filter(m => MESAS_VALIDAS.includes(m.numero))}
          onSelectMesa={alSeleccionarMesaMapa}
          onSinWebGL={() => cambiarVistaMapa('2d')}
          pausado={dialogRegistro || dialogUnirMesas || dialogAsignarMesaReserva || dialogMesaOcupada || mostrarQRScanner}
          margenes={margenesMapa}
          mesaResaltada={mesaResaltada}
          enfoque={enfoque}
          accesorios={
            <>
              <div className="mx-0.5 h-6 w-px bg-white/10" />
              <button
                onClick={() => cambiarVistaMapa('2d')}
                className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-300 transition-colors hover:bg-white/5 hover:text-amber-300"
              >
                <MapIcon className="h-3.5 w-3.5" /> Plano
              </button>
            </>
          }
        />
      ) : (
        <div
          className="absolute inset-0 overflow-auto px-3"
          style={{ paddingTop: margenesMapa.arriba + 8, paddingBottom: margenesMapa.abajo + 80, paddingRight: margenesMapa.derecha + 12 }}
        >
          {/* Plano del restaurante con mesas interactivas */}
          <div className="relative mx-auto overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-950 shadow-2xl" style={{ width: '100%', maxWidth: '640px' }}>
              <svg viewBox="0 0 640 1000" className="w-full h-auto" style={{ maxHeight: '900px' }}>
                {/* Fondo oscuro */}
                <rect width="640" height="1000" fill="#0f172a"/>
                
                {/* Definiciones de filtros y gradientes */}
                <defs>
                  {/* Sombra para CABINA y BARRA */}
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
                  </filter>
                  
                  {/* Sombra suave para mesas */}
                  <filter id="tableShadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
                  </filter>
                  
                  {/* Glow para mesas disponibles */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Gradiente dorado */}
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#EAB308', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                
                <rect x="105" y="30" width="420" height="110" fill="url(#goldGradient)" rx="12" filter="url(#shadow)"/>
                <text x="320" y="95" fontSize="48" fontWeight="bold" textAnchor="middle" fill="#000">CABINA</text>
                
                {/* Pasillo central - Zona amarilla clara con borde definido */}
                <path 
                  d="M 260 170 L 260 540 Q 260 560 280 560 L 360 560 Q 380 560 380 580 L 380 870 Q 380 880 370 880 L 260 880 Q 250 880 250 870 L 250 180 Q 250 170 260 170 Z" 
                  fill="#fef3c7" 
                  opacity="0.25"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                />
                
                {/* Círculos laterales grandes (mesas redondas) con sombra */}
                <ellipse cx="30" cy="90" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="30" cy="200" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="30" cy="310" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="30" cy="420" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="30" cy="530" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                
                <ellipse cx="610" cy="90" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="610" cy="200" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="610" cy="310" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="610" cy="420" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                
                <ellipse cx="610" cy="600" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="610" cy="710" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                <ellipse cx="610" cy="820" rx="25" ry="35" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" filter="url(#tableShadow)"/>
                
                {/* Mesas rectangulares - Números de mesa */}
                {/* Columna izquierda */}
                <rect x="68" y="80" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="88" y="110" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">37</text>
                
                <rect x="68" y="190" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="88" y="220" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">36</text>
                
                <rect x="68" y="300" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="88" y="330" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">35</text>
                
                <rect x="68" y="410" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="88" y="440" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">34</text>
                
                <rect x="68" y="520" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="88" y="550" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">33</text>
                
                {/* Centro-izquierda */}
                <rect x="150" y="160" width="50" height="60" fill="none" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <rect x="207" y="180" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="227" y="210" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">26</text>
                
                <rect x="207" y="270" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="227" y="300" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">25</text>
                
                <rect x="207" y="360" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="227" y="390" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">24</text>
                
                <rect x="207" y="450" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="227" y="480" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">23</text>
                
                {/* Centro - Zona amarilla */}
                <rect x="287" y="180" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="307" y="210" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">16</text>
                
                <rect x="287" y="270" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="307" y="300" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">15</text>
                
                <rect x="287" y="360" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="307" y="390" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">14</text>
                
                <rect x="287" y="450" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="307" y="480" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">13</text>
                
                {/* Derecha */}
                <rect x="532" y="80" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="552" y="110" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">7</text>
                
                <rect x="532" y="190" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="552" y="220" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">6</text>
                
                <rect x="532" y="300" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="552" y="330" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">5</text>
                
                <rect x="532" y="410" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="552" y="440" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">4</text>
                
                {/* Fila inferior */}
                <rect x="147" y="590" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="167" y="620" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">32</text>
                
                <rect x="147" y="680" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="167" y="710" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">31</text>
                
                <rect x="147" y="770" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="167" y="800" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">30</text>
                
                <rect x="287" y="590" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="307" y="620" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">22</text>
                
                <rect x="287" y="680" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="307" y="710" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">21</text>
                
                <rect x="287" y="770" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="307" y="800" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">20</text>
                
                <rect x="393" y="590" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="413" y="620" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">12</text>
                
                <rect x="393" y="680" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="413" y="710" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">11</text>
                
                <rect x="393" y="770" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="413" y="800" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">10</text>
                
                <rect x="532" y="590" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="552" y="620" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">3</text>
                
                <rect x="532" y="700" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="552" y="730" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">2</text>
                
                <rect x="532" y="810" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="2.5" rx="5" filter="url(#tableShadow)"/>
                <text x="552" y="840" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#cbd5e1">1</text>
                
                {/* BARRA - Abajo con gradiente y sombra */}
                <rect x="105" y="920" width="530" height="70" fill="url(#goldGradient)" rx="12" filter="url(#shadow)"/>
                <text x="370" y="965" fontSize="48" fontWeight="bold" textAnchor="middle" fill="#000">BARRA</text>
                
                {/* Overlays verdes para mesas disponibles con glow */}
                {mesasDisponibles.filter(m => m.numero !== '3' && m.numero !== '37').map((mesa) => {
                  const positions: Record<string, {x: number, y: number, isCircle?: boolean}> = {
                    '36': {x: 88, y: 215}, '35': {x: 88, y: 325}, '34': {x: 88, y: 435}, '33': {x: 88, y: 545},
                    '26': {x: 227, y: 205}, '25': {x: 227, y: 295}, '24': {x: 227, y: 385}, '23': {x: 227, y: 475},
                    '16': {x: 307, y: 205}, '15': {x: 307, y: 295}, '14': {x: 307, y: 385}, '13': {x: 307, y: 475},
                    '7': {x: 552, y: 105}, '6': {x: 552, y: 215}, '5': {x: 552, y: 325}, '4': {x: 552, y: 435},
                    '32': {x: 167, y: 615}, '31': {x: 167, y: 705}, '30': {x: 167, y: 795},
                    '22': {x: 307, y: 615}, '21': {x: 307, y: 705}, '20': {x: 307, y: 795},
                    '12': {x: 413, y: 615}, '11': {x: 413, y: 705}, '10': {x: 413, y: 795},
                    '2': {x: 552, y: 725}, '1': {x: 552, y: 835}
                  }
                  const pos = positions[mesa.numero]
                  if (!pos) return null
                  return (
                    <g key={mesa.id} onClick={() => handleSeleccionarMesa(mesa)} className="cursor-pointer hover:opacity-90 transition-all" filter="url(#glow)">
                      <circle cx={pos.x} cy={pos.y} r="28" fill="#10b981" opacity="0.85"/>
                      <text x={pos.x} y={pos.y + 6} fontSize="18" fontWeight="bold" textAnchor="middle" fill="#fff">{mesa.numero}</text>
                    </g>
                  )
                })}
                
                {/* Overlays rojos para mesas ocupadas con glow */}
                {mesasOcupadas.filter(m => m.numero !== '3' && m.numero !== '37').map((mesa) => {
                  const positions: Record<string, {x: number, y: number, isCircle?: boolean}> = {
                    '36': {x: 88, y: 215}, '35': {x: 88, y: 325}, '34': {x: 88, y: 435}, '33': {x: 88, y: 545},
                    '26': {x: 227, y: 205}, '25': {x: 227, y: 295}, '24': {x: 227, y: 385}, '23': {x: 227, y: 475},
                    '16': {x: 307, y: 205}, '15': {x: 307, y: 295}, '14': {x: 307, y: 385}, '13': {x: 307, y: 475},
                    '7': {x: 552, y: 105}, '6': {x: 552, y: 215}, '5': {x: 552, y: 325}, '4': {x: 552, y: 435},
                    '32': {x: 167, y: 615}, '31': {x: 167, y: 705}, '30': {x: 167, y: 795},
                    '22': {x: 307, y: 615}, '21': {x: 307, y: 705}, '20': {x: 307, y: 795},
                    '12': {x: 413, y: 615}, '11': {x: 413, y: 705}, '10': {x: 413, y: 795},
                    '2': {x: 552, y: 725}, '1': {x: 552, y: 835}
                  }
                  const pos = positions[mesa.numero]
                  if (!pos) return null
                  return (
                    <g key={mesa.id} className="cursor-pointer" filter="url(#glow)">
                      <circle cx={pos.x} cy={pos.y} r="28" fill="#ef4444" opacity="0.85"/>
                      <text x={pos.x} y={pos.y + 6} fontSize="18" fontWeight="bold" textAnchor="middle" fill="#fff">{mesa.numero}</text>
                    </g>
                  )
                })}
                
                {/* Overlays amarillos para mesas reservadas con glow */}
                {mesasReservadas.filter(m => m.numero !== '3' && m.numero !== '37').map((mesa) => {
                  const positions: Record<string, {x: number, y: number, isCircle?: boolean}> = {
                    '36': {x: 88, y: 215}, '35': {x: 88, y: 325}, '34': {x: 88, y: 435}, '33': {x: 88, y: 545},
                    '26': {x: 227, y: 205}, '25': {x: 227, y: 295}, '24': {x: 227, y: 385}, '23': {x: 227, y: 475},
                    '16': {x: 307, y: 205}, '15': {x: 307, y: 295}, '14': {x: 307, y: 385}, '13': {x: 307, y: 475},
                    '7': {x: 552, y: 105}, '6': {x: 552, y: 215}, '5': {x: 552, y: 325}, '4': {x: 552, y: 435},
                    '32': {x: 167, y: 615}, '31': {x: 167, y: 705}, '30': {x: 167, y: 795},
                    '22': {x: 307, y: 615}, '21': {x: 307, y: 705}, '20': {x: 307, y: 795},
                    '12': {x: 413, y: 615}, '11': {x: 413, y: 705}, '10': {x: 413, y: 795},
                    '2': {x: 552, y: 725}, '1': {x: 552, y: 835}
                  }
                  const pos = positions[mesa.numero]
                  if (!pos) return null
                  return (
                    <g key={mesa.id} className="cursor-pointer" filter="url(#glow)">
                      <circle cx={pos.x} cy={pos.y} r="28" fill="#f59e0b" opacity="0.85"/>
                      <text x={pos.x} y={pos.y + 6} fontSize="18" fontWeight="bold" textAnchor="middle" fill="#fff">{mesa.numero}</text>
                    </g>
                  )
                })}
              </svg>
          </div>
          <div className="pointer-events-auto fixed z-10" style={{ left: 12, bottom: margenesMapa.abajo + 12 }}>
            <button
              onClick={() => cambiarVistaMapa('3d')}
              className="flex h-11 items-center gap-2 rounded-2xl border border-amber-500/30 bg-[#0d0a07]/95 px-4 text-sm font-bold text-amber-300 shadow-2xl hover:bg-[#15100a]"
            >
              <Box className="h-4 w-4" /> Vista 3D
            </button>
          </div>
        </div>
      )}

      {/* ===== Barra superior ===== */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-6">
        <div className="pointer-events-auto mx-2 mt-2 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-[#0d0a07]/92 px-2.5 py-2 shadow-2xl shadow-black/60 md:mx-3 md:mt-3 md:gap-3 md:px-3">
          <div
            role="img"
            aria-label="FEVER"
            className="h-5 w-[72px] shrink-0 bg-center bg-no-repeat md:h-7 md:w-[100px]"
            style={{ backgroundImage: 'url(/fever-logo.png)', backgroundSize: '337% auto', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.45))' }}
          />
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="min-w-0 max-w-[40vw] shrink sm:max-w-none">
            <p className="text-sm font-black leading-tight tracking-wide text-amber-300 md:text-base">HOSTESS</p>
            <p className="truncate text-[11px] text-slate-400 md:text-xs">Bienvenida, {hostessNombre}</p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2">
            <div className={`hidden items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-black tracking-widest sm:flex ${mapaEnVivo ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-slate-500'}`}>
              <Radio className={`h-3 w-3 ${mapaEnVivo ? 'animate-pulse' : ''}`} />
              EN VIVO
            </div>
            <Button
              onClick={() => setMostrarQRScanner(true)}
              className="h-10 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-3 font-bold text-black shadow-lg shadow-amber-500/25 hover:from-amber-300 hover:to-amber-500"
            >
              <QrCode className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Escanear</span>
            </Button>
            <Button
              onClick={generarReporteOcupacion}
              variant="outline"
              className="hidden h-10 rounded-xl border-white/10 bg-white/5 px-3 text-slate-200 hover:bg-white/10 hover:text-emerald-300 sm:flex"
              title="Reporte de ocupación"
            >
              <FileSpreadsheet className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Reporte</span>
            </Button>
            <NotificacionesEmergencia />
            <Button
              onClick={() => window.location.href = '/dashboard/selector-rol'}
              variant="outline"
              className="h-10 rounded-xl border-white/10 bg-white/5 px-3 text-slate-200 hover:bg-white/10 hover:text-amber-300"
              title="Menú"
            >
              <LayoutGrid className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Menú</span>
            </Button>
            <Button
              onClick={handleCerrarTodasMesas}
              className="h-10 rounded-xl border border-red-500/40 bg-red-600/20 px-3 text-red-300 hover:bg-red-600/40 hover:text-white"
              title="Cerrar todo"
            >
              <PowerOff className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Cerrar Todo</span>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="pointer-events-auto mt-2 flex gap-1.5 overflow-x-auto px-2 md:px-3 [&::-webkit-scrollbar]:hidden">
          {kpis.map((k) => (
            <div key={k.texto} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d0a07]/90 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: k.color, boxShadow: `0 0 8px ${k.color}` }} />
              <span className="text-sm font-black leading-none text-white">{k.valor}</span>
              <span className="text-[10px] leading-none text-slate-400">{k.texto}</span>
            </div>
          ))}
          <button
            onClick={generarReporteOcupacion}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d0a07]/90 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-300 sm:hidden"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Reporte
          </button>
        </div>
      </header>

      {/* ===== Panel de operación (escritorio) ===== */}
      {!esMovil && (
        <>
          <aside
            className="absolute bottom-3 right-3 z-20 flex w-[396px] flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-[#0b0806]/95 shadow-2xl shadow-black/70 transition-transform duration-300 will-change-transform"
            style={{ top: margenesMapa.arriba, transform: panelAbierto ? 'none' : 'translateX(calc(100% + 16px))' }}
          >
            <div className="flex items-center gap-1 border-b border-white/5 p-2">
              {pestanasPanel}
              <button
                onClick={() => setPanelAbierto(false)}
                className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white"
                title="Ocultar panel"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
              {contenidoPanel}
            </div>
          </aside>
          {!panelAbierto && (
            <button
              onClick={() => setPanelAbierto(true)}
              className="absolute right-3 z-20 flex h-11 items-center gap-2 rounded-2xl border border-amber-500/30 bg-[#0d0a07]/95 px-4 text-sm font-bold text-amber-300 shadow-2xl hover:bg-[#15100a]"
              style={{ top: margenesMapa.arriba }}
            >
              <PanelRightOpen className="h-4 w-4" />
              Operación
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] text-red-300">{mesasOcupadas.length}</span>
            </button>
          )}
        </>
      )}

      {/* ===== Hoja inferior (móvil) ===== */}
      {esMovil && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex h-[64vh] flex-col overflow-hidden rounded-t-3xl border-t border-amber-500/25 bg-[#0b0806]/97 shadow-[0_-12px_40px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: hojaExpandida ? 'translateY(0)' : `translateY(calc(64vh - ${ALTO_HOJA_CERRADA}px))` }}
        >
          <button
            onClick={() => setHojaExpandida(!hojaExpandida)}
            className="flex shrink-0 flex-col items-center pt-2"
            aria-label={hojaExpandida ? 'Contraer panel' : 'Expandir panel'}
          >
            <span className="h-1 w-10 rounded-full bg-white/25" />
          </button>
          <div className="flex shrink-0 items-center gap-1 px-2 pb-2 pt-1">
            {pestanasPanel}
            <button
              onClick={() => setHojaExpandida(!hojaExpandida)}
              className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400"
            >
              {hojaExpandida ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-2.5 pb-6">
            {contenidoPanel}
          </div>
        </div>
      )}

      {/* Dialog Registro Cliente */}
      <Dialog open={dialogRegistro} onOpenChange={setDialogRegistro}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl">
              Registrar Cliente - {mesasSeleccionadas.length > 0 
                ? `Mesas ${mesasSeleccionadas.map(m => m.numero).join(' + ')}`
                : `Mesa ${mesaSeleccionada?.numero}`
              }
            </DialogTitle>
            <DialogDescription className="sr-only">Busca o registra al cliente y asigna personas, RP y mesero a la mesa.</DialogDescription>
            {mesasSeleccionadas.length > 0 && (
              <p className="text-slate-400 text-sm mt-2">
                Capacidad total: {capacidadTotal} personas
              </p>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {/* Buscar por nombre */}
            <div className="space-y-2">
              <Label className="text-slate-300">Buscar por Nombre</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Juan Pérez"
                    value={busquedaNombre}
                    onChange={(e) => handleBusquedaEnTiempoReal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBuscarCliente()}
                    className="pl-10 bg-slate-800/50 border-slate-700"
                    autoComplete="off"
                  />
                  {/* Sugerencias en tiempo real */}
                  {sugerenciasNombre.length > 0 && !clienteEncontrado && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                      {sugerenciasNombre.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => { handleSeleccionarClienteEncontrado(c); setSugerenciasNombre([]) }}
                          className="flex items-center justify-between px-3 py-2 hover:bg-slate-700 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-slate-100 text-sm font-medium">{c.nombre}</p>
                            <p className="text-slate-400 text-xs">{c.telefono || 'Sin teléfono'} · {c.total_visitas || 0} visitas</p>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs">{c.nivel_fidelidad}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleBuscarCliente} className="bg-blue-600">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Resultados de búsqueda */}
              {clientesEncontrados.length > 0 && (
                <div className="glass rounded-lg p-3 space-y-2">
                  <p className="text-xs text-slate-400">Clientes encontrados:</p>
                  {clientesEncontrados.map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => handleSeleccionarClienteEncontrado(cliente)}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-slate-200 font-semibold">{cliente.nombre}</p>
                        <p className="text-xs text-slate-400">{cliente.telefono}</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-500">
                        {cliente.nivel_fidelidad}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Cliente seleccionado */}
              {clienteEncontrado && (
                <div className="glass rounded-xl p-4 border-2 border-emerald-500/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-slate-400">Cliente Encontrado</p>
                      <p className="text-lg font-semibold text-emerald-500">{clienteEncontrado.nombre}</p>
                      <p className="text-sm text-slate-400">{clienteEncontrado.telefono}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-500">
                          {clienteEncontrado.nivel_fidelidad}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-500">
                          {clienteEncontrado.total_visitas || 0} visitas
                        </Badge>
                      </div>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  
                  {/* Selector de personas */}
                  <div className="space-y-2 mb-3">
                    <Label className="text-slate-300">Número de Personas *</Label>
                    <Select
                      value={numeroPersonas.toString()}
                      onValueChange={(value) => setNumeroPersonas(parseInt(value))}
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

                  {/* Selector de RP */}
                  <div className="space-y-2 mb-3">
                    <Label className="text-slate-300">¿Con quién tiene reservación?</Label>
                    <Select
                      value={rpSeleccionado || "sin_rp"}
                      onValueChange={(value) => setRpSeleccionado(value === "sin_rp" ? "" : value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue placeholder="Sin reservación (RP aleatorio)" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="sin_rp">Sin reservación (RP aleatorio)</SelectItem>
                        {rpsDisponibles.map((rp) => (
                          <SelectItem key={rp.rp_nombre} value={rp.rp_nombre}>
                            {rp.rp_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Si no tiene reservación, se asignará un RP aleatorio
                    </p>
                  </div>

                  {/* Selector de Mesero */}
                  <div className="space-y-2 mb-3">
                    <Label className="text-slate-300">Asignar Mesero (Opcional)</Label>
                    <Select
                      value={meseroSeleccionado?.toString() || "sin_mesero"}
                      onValueChange={(value) => setMeseroSeleccionado(value === "sin_mesero" ? null : parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue placeholder="Sin mesero asignado" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="sin_mesero">Sin mesero asignado</SelectItem>
                        {meserosDisponibles.map((mesero) => (
                          <SelectItem key={mesero.id} value={mesero.id.toString()}>
                            {mesero.nombre} {mesero.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Selecciona el mesero que atenderá esta mesa
                    </p>
                  </div>

                  {/* Botón Asignar Directo */}
                  <Button
                    onClick={handleAsignarClienteDirecto}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Asignar Mesa Directo
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setClienteEncontrado(null)}
                    className="w-full mt-2 text-slate-400 hover:text-slate-200"
                    size="sm"
                  >
                    Buscar otro cliente
                  </Button>
                </div>
              )}
            </div>

            {/* Datos del cliente - Solo mostrar si NO hay cliente encontrado */}
            {!clienteEncontrado && (
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nombre *</Label>
                <Input
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Carlos"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Apellido</Label>
                <Input
                  value={nuevoCliente.apellido}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, apellido: e.target.value})}
                  className="bg-slate-800/50 border-slate-700"
                  placeholder="Méndez"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Género *</Label>
                <Select
                  value={nuevoCliente.genero}
                  onValueChange={(value) => setNuevoCliente({...nuevoCliente, genero: value})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Número Total de Personas *</Label>
                <Select
                  value={numeroPersonas.toString()}
                  onValueChange={(value) => setNumeroPersonas(parseInt(value))}
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

              {/* Distribución de personas */}
              <div className="col-span-2 space-y-3">
                <Label className="text-slate-300">Distribución de Personas</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Hombres 👨</Label>
                    <Select
                      value={numeroHombres.toString()}
                      onValueChange={(value) => setNumeroHombres(parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Array.from({length: numeroPersonas + 1}, (_, i) => i).map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Mujeres 👩</Label>
                    <Select
                      value={numeroMujeres.toString()}
                      onValueChange={(value) => setNumeroMujeres(parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Array.from({length: numeroPersonas + 1}, (_, i) => i).map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Validación visual */}
                {(() => {
                  const total = numeroHombres + numeroMujeres
                  const esValido = total === numeroPersonas
                  return (
                    <div className={`text-xs p-2 rounded-lg ${
                      esValido 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                      {esValido ? (
                        <span>✓ Distribución correcta: {total} de {numeroPersonas} personas</span>
                      ) : (
                        <span>⚠ La suma debe ser {numeroPersonas} personas (actual: {total})</span>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-slate-300">¿Con quién tiene reservación? *</Label>
                <Select
                  value={rpSeleccionado || "sin_rp"}
                  onValueChange={(value) => setRpSeleccionado(value === "sin_rp" ? "" : value)}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Selecciona un RP" />
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
                <p className="text-xs text-slate-500">
                  Selecciona el RP o "Sin RP específico" si no aplica
                </p>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-slate-300">Asignar Mesero (Opcional)</Label>
                <Select
                  value={meseroSeleccionado?.toString() || "sin_mesero"}
                  onValueChange={(value) => setMeseroSeleccionado(value === "sin_mesero" ? null : parseInt(value))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Sin mesero asignado" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="sin_mesero">Sin mesero asignado</SelectItem>
                    {meserosDisponibles.map((mesero) => (
                      <SelectItem key={mesero.id} value={mesero.id.toString()}>
                        {mesero.nombre} {mesero.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Selecciona el mesero que atenderá esta mesa
                </p>
              </div>
              </div>
            )}

            {/* Botones - Solo mostrar si NO hay cliente encontrado */}
            {!clienteEncontrado && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogRegistro(false)}
                  className="flex-1 border-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={mesasSeleccionadas.length > 0 ? handleAsignarMesasUnidas : handleAsignarMesa}
                  disabled={
                    !nuevoCliente.nombre || 
                    !nuevoCliente.genero ||
                    (numeroHombres + numeroMujeres) !== numeroPersonas
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {mesasSeleccionadas.length > 0 ? `Asignar ${mesasSeleccionadas.length} Mesas` : 'Asignar Mesa'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Unir Mesas */}
      <Dialog open={dialogUnirMesas} onOpenChange={setDialogUnirMesas}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh] overflow-y-auto"> 
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl">
              Unir Mesas - {numeroPersonas} personas
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-2">
              Selecciona las mesas que deseas unir (máximo 10 personas por mesa)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Info de capacidad */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Mesas seleccionadas</p>
                  <p className="text-2xl font-bold text-slate-50">
                    {mesasSeleccionadas.length} mesa{mesasSeleccionadas.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Capacidad total</p>
                  <p className={`text-2xl font-bold ${
                    capacidadTotal >= numeroPersonas ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {capacidadTotal} personas
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Necesitas</p>
                  <p className="text-2xl font-bold text-amber-500">{numeroPersonas} personas</p>
                </div>
              </div>
              {capacidadTotal < numeroPersonas && (
                <p className="text-sm text-red-500 mt-2">
                  ⚠️ Necesitas seleccionar más mesas
                </p>
              )}
            </div>

            {/* Grid de mesas disponibles */}
            <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {mesasDisponibles.map((mesa) => {
                const isSelected = mesasSeleccionadas.find(m => m.id === mesa.id)
                return (
                  <div
                    key={mesa.id}
                    onClick={() => toggleMesaUnion(mesa)}
                    className={`glass rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-2 border-emerald-500'
                        : 'border-2 border-slate-700 hover:border-emerald-500/50'
                    }`}
                  >
                    <p className={`text-2xl font-bold mb-1 ${
                      isSelected ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                      {mesa.numero}
                    </p>
                    <p className="text-xs text-slate-400">Cap: {mesa.capacidad}</p>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mt-2" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogUnirMesas(false)
                  setMesasSeleccionadas([])
                }}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setDialogUnirMesas(false)
                  setDialogRegistro(true)
                }}
                disabled={capacidadTotal < numeroPersonas || mesasSeleccionadas.length === 0}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Continuar con Registro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Asignar Mesa a Reservación */}
      <Dialog open={dialogAsignarMesaReserva} onOpenChange={setDialogAsignarMesaReserva}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-2xl">
              Asignar Mesa - {reservacionParaAsignar?.cliente_nombre}
            </DialogTitle>
            <DialogDescription className="sr-only">Elige la mesa donde se sentará esta reservación.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-slate-400">Reservación</p>
              <p className="text-lg font-semibold text-slate-50">{reservacionParaAsignar?.cliente_nombre}</p>
              <p className="text-sm text-slate-400 mt-1">
                👥 {reservacionParaAsignar?.numero_personas} personas
              </p>
              {reservacionParaAsignar?.rp_nombre && (
                <p className="text-sm text-amber-400 mt-1">
                  ✨ RP: {reservacionParaAsignar.rp_nombre}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Seleccionar Mesa Disponible *</Label>
              <select
                value={mesaSeleccionadaReserva || ""}
                onChange={(e) => setMesaSeleccionadaReserva(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full h-[200px] bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 overflow-y-auto"
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
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogAsignarMesaReserva(false)
                  setReservacionParaAsignar(null)
                  setMesaSeleccionadaReserva(null)
                }}
                className="flex-1 border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAsignarMesaAReserva}
                disabled={!mesaSeleccionadaReserva}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar y Asignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Mesa Ocupada - Detalle */}
      <Dialog open={dialogMesaOcupada} onOpenChange={setDialogMesaOcupada}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-50 text-xl flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-400 text-base px-3 py-1">Mesa {mesaOcupadaDetalle?.numero}</Badge>
              Ocupada
            </DialogTitle>
            <DialogDescription className="sr-only">Detalle de la mesa ocupada: cliente, personas y consumo actual.</DialogDescription>
          </DialogHeader>
          {mesaOcupadaDetalle && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-sm">Cliente</p>
                  <p className="text-slate-100 font-semibold">{mesaOcupadaDetalle.cliente_nombre}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-sm">Personas</p>
                  <p className="text-slate-100">{mesaOcupadaDetalle.numero_personas}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-sm">Hora entrada</p>
                  <p className="text-slate-100 text-sm">
                    {mesaOcupadaDetalle.hora_asignacion
                      ? new Date(mesaOcupadaDetalle.hora_asignacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </p>
                </div>
                {(mesaOcupadaDetalle as any).rp && (
                  <div className="flex justify-between items-center">
                    <p className="text-slate-400 text-sm">RP</p>
                    <p className="text-purple-400 text-sm">👑 {(mesaOcupadaDetalle as any).rp}</p>
                  </div>
                )}
                <div className="h-px bg-slate-700 my-1" />
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-sm">Consumo actual</p>
                  <p className="text-2xl font-bold text-emerald-400">${(mesaOcupadaDetalle.total_actual || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    setDialogMesaOcupada(false)
                    window.location.href = `/dashboard/mesero?mesa=${mesaOcupadaDetalle.numero}`
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-12"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ver Comanda
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogMesaOcupada(false)
                    handleLiberarMesa(mesaOcupadaDetalle)
                  }}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-12"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Liberar
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setDialogMesaOcupada(false)}
                className="w-full text-slate-500 hover:text-slate-300"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Scanner */}
      {mostrarQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setMostrarQRScanner(false)}
        />
      )}
    </div>
  )
}
