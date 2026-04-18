"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"
import { 
  Users, UserPlus, Armchair, Clock, Star,
  CheckCircle2, AlertCircle, Search, Phone,
  Calendar, User, LayoutGrid, QrCode, Unlock, X, PowerOff
} from "lucide-react"
import QRScanner from "@/components/QRScanner"
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
}

export default function HostessPage() {
  // Lista de mesas válidas que existen en el restaurante
  const MESAS_VALIDAS = ['1', '2', '4', '5', '6', '7', '10', '11', '12', '13', '14', '15', '16', '20', '21', '22', '23', '24', '25', '26', '30', '31', '32', '33', '34', '35', '36', '37']
  
  const [mesas, setMesas] = useState<Mesa[]>([])
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
      const { data, error } = await supabase
        .from('limites_cortesias_rp')
        .select('rp_nombre')
        .eq('activo', true)
        .order('rp_nombre')
      
      if (error) throw error
      setRpsDisponibles(data || [])
    } catch (error) {
      console.error('Error cargando RPs:', error)
    }
  }

  async function cargarReservaciones() {
    try {
      const { supabase } = await import('@/lib/supabase')
      const hoy = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('reservaciones')
        .select('*')
        .eq('fecha', hoy)
        .eq('estado', 'pendiente')
        .order('hora', { ascending: true })
      
      if (error) throw error
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

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 glow-amber">Panel Hostess</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Bienvenida, {hostessNombre}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <Button
            onClick={handleCerrarTodasMesas}
            className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 h-10 text-sm flex-1 md:flex-none"
          >
            <PowerOff className="w-4 h-4 mr-2" />
            Cerrar Todo
          </Button>
          <Button
            onClick={() => setMostrarQRScanner(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 h-10 text-sm flex-1 md:flex-none"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Escanear
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard/selector-rol'}
            variant="outline"
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 h-10 text-sm flex-1 md:flex-none"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Menú
          </Button>
          <NotificacionesEmergencia />
          <Badge className="bg-emerald-500/20 text-emerald-500 text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5">
            {mesasDisponibles.length} Disp
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-500 text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5">
            {mesasOcupadas.length} Ocup
          </Badge>
          <Badge className="bg-amber-500/20 text-amber-500 text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5">
            {mesasReservadas.length} Res
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-500 text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5">
            {reservaciones.length} Rev
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Armchair className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Total</p>
              <p className="text-xl md:text-3xl font-bold text-slate-50">{mesas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Disponibles</p>
              <p className="text-xl md:text-3xl font-bold text-emerald-500">{mesasDisponibles.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Ocupadas</p>
              <p className="text-xl md:text-3xl font-bold text-blue-500">{mesasOcupadas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardContent className="pt-4 md:pt-6 pb-4 px-3 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-amber-500 mb-1 md:mb-2" />
              <p className="text-xs md:text-sm text-slate-400">Ocupación</p>
              <p className="text-xl md:text-3xl font-bold text-amber-500">
                {mesas.length > 0 ? Math.round((mesasOcupadas.length / mesas.length) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mesas */}
      <div className="grid gap-4 md:gap-6 grid-cols-1">
        {/* Mesas Disponibles */}
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              Mesas Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Plano del restaurante con mesas interactivas */}
            <div className="relative bg-slate-950 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
              
              {/* SVG del plano del restaurante */}
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
          </CardContent>
        </Card>

        {/* Mesas Ocupadas */}
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              Mesas Ocupadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {mesasOcupadas.map((mesa) => (
                <div
                  key={mesa.id}
                  className="glass rounded-xl p-3 md:p-4 border border-blue-500/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Badge className="bg-blue-500/20 text-blue-500 mb-1 md:mb-2 text-xs">
                        Mesa {mesa.numero}
                      </Badge>
                      <p className="font-semibold text-slate-200 text-sm md:text-base truncate">{mesa.cliente_nombre}</p>
                      <p className="text-xs text-slate-400">
                        {mesa.numero_personas} personas
                      </p>
                      {mesa.rp_asignado && (
                        <p className="text-xs text-purple-400 mt-1">
                          👑 RP: {mesa.rp_asignado}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-500">
                        ${(mesa.total_actual || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        {mesa.hora_asignacion ? new Date(mesa.hora_asignacion).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLiberarMesa(mesa)}
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10 text-xs h-7"
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        Liberar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mesas Reservadas */}
        {mesasReservadas.length > 0 && (
          <Card className="glass-hover border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                Mesas Reservadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-3">
                {mesasReservadas.map((mesa) => (
                  <div
                    key={mesa.id}
                    className="glass rounded-xl p-3 md:p-4 border border-amber-500/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Badge className="bg-amber-500/20 text-amber-500 mb-1 md:mb-2 text-xs">
                          Mesa {mesa.numero}
                        </Badge>
                        <p className="font-semibold text-slate-200 text-sm md:text-base truncate">{mesa.cliente_nombre}</p>
                        <p className="text-xs text-slate-400">
                          {mesa.numero_personas} personas
                        </p>
                        {mesa.rp_asignado && (
                          <p className="text-xs text-purple-400 mt-1">
                            👑 RP: {mesa.rp_asignado}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-amber-500 mb-2">
                          📅 Reservada
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Convertir reserva a ocupada
                            const mesaData = mesas.find(m => m.id === mesa.id)
                            if (mesaData) {
                              handleSeleccionarMesa(mesaData)
                            }
                          }}
                          className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 text-xs h-7 mb-1"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Llegó
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
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
                          }}
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10 text-xs h-7"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reservaciones Pendientes */}
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              Reservaciones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {reservaciones.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <Calendar className="w-10 h-10 md:w-12 md:h-12 text-slate-700 mx-auto mb-2 md:mb-3" />
                  <p className="text-slate-400 text-xs md:text-sm">No hay reservaciones pendientes</p>
                </div>
              ) : (
                reservaciones.map((reservacion) => (
                  <div
                    key={reservacion.id}
                    className="glass rounded-xl p-3 md:p-4 border border-purple-500/30 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-2 md:mb-3">
                      <div className="flex-1 min-w-0 w-full">
                        <Badge className="bg-purple-500/20 text-purple-500 mb-1 md:mb-2 text-xs">
                          {reservacion.hora}
                        </Badge>
                        <p className="font-semibold text-slate-200 text-base md:text-lg truncate">{reservacion.cliente_nombre}</p>
                        <p className="text-xs md:text-sm text-slate-400">
                          👥 {reservacion.numero_personas} personas
                          {reservacion.numero_hombres > 0 && ` • ${reservacion.numero_hombres} 👨`}
                          {reservacion.numero_mujeres > 0 && ` • ${reservacion.numero_mujeres} 👩`}
                        </p>
                        {reservacion.rp_nombre && (
                          <p className="text-xs text-amber-400 mt-1">
                            ✨ RP: {reservacion.rp_nombre}
                          </p>
                        )}
                        {reservacion.notas && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            📝 {reservacion.notas}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmarAsistencia(reservacion)}
                          className="bg-emerald-600 hover:bg-emerald-700 flex-1 md:flex-none text-xs md:text-sm h-9 md:h-auto"
                        >
                          <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNoLlego(reservacion)}
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10 flex-1 md:flex-none text-xs md:text-sm h-9 md:h-auto"
                        >
                          <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          No Llegó
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mesas Reservadas */}
        <Card className="glass-hover border-0 shadow-none bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg text-slate-50 flex items-center gap-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
              Mesas Reservadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {mesasReservadas.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <Calendar className="w-10 h-10 md:w-12 md:h-12 text-slate-700 mx-auto mb-2 md:mb-3" />
                  <p className="text-slate-400 text-xs md:text-sm">No hay reservaciones</p>
                </div>
              ) : (
                mesasReservadas.map((mesa) => (
                  <div
                    key={mesa.id}
                    className="glass rounded-xl p-3 md:p-4 border border-amber-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Badge className="bg-amber-500/20 text-amber-500 mb-1 md:mb-2 text-xs">
                          Mesa {mesa.numero}
                        </Badge>
                        <p className="font-semibold text-slate-200 text-sm md:text-base truncate">{mesa.cliente_nombre || 'Reservada'}</p>
                        <p className="text-xs text-slate-400">
                          {mesa.numero_personas} personas
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setMesaSeleccionada(mesa)
                          setDialogConfirmarReserva(true)
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 ml-2 h-9 md:h-auto text-xs md:text-sm"
                      >
                        Confirmar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
            <p className="text-slate-400 text-sm mt-2">
              Selecciona las mesas que deseas unir (máximo 10 personas por mesa)
            </p>
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
