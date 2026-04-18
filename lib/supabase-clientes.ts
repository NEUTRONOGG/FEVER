import { supabase } from './supabase'

// ============================================
// TIPOS
// ============================================

export interface Cliente {
  id: string
  nombre: string
  apellido?: string
  telefono?: string
  email?: string
  genero?: 'masculino' | 'femenino' | 'otro' | 'no_especifica'
  fecha_nacimiento?: string
  foto_url?: string
  
  // Métricas
  total_visitas: number
  visitas_consecutivas: number
  ultima_visita?: string
  primera_visita: string
  consumo_total: number
  consumo_promedio: number
  ticket_mas_alto: number
  calificacion_promedio: number
  producto_favorito?: string
  horario_preferido?: string
  
  // Rewards
  puntos_rewards: number
  nivel_fidelidad: 'bronce' | 'plata' | 'oro' | 'platino' | 'diamante'
  qr_wallet_id?: string
  
  activo: boolean
  notas?: string
  created_at: string
  updated_at: string
}

export interface Visita {
  id: string
  cliente_id: string
  fecha: string
  mesa_numero: number
  numero_personas: number
  hora_llegada: string
  hora_salida?: string
  duracion_minutos?: number
  total_consumo: number
  productos_consumidos: any[]
  hostess?: string
  mesero?: string
  calificacion_hostess?: number
  calificacion_servicio?: number
  calificacion_comida?: number
  comentarios?: string
  puntos_ganados: number
  recompensa_aplicada?: string
  created_at: string
}

export interface MesaCliente {
  id: number
  numero: string
  mesa_numero?: number
  capacidad: number
  estado: 'disponible' | 'ocupada' | 'reservada' | 'limpieza'
  cliente_id?: string
  cliente_nombre?: string
  numero_personas: number
  hostess?: string
  mesero?: string
  hora_asignacion?: string
  pedidos_data: any[]
  total_actual: number
  updated_at: string
}

export interface CalificacionHostess {
  id: string
  visita_id: string
  cliente_id: string
  hostess: string
  fecha: string
  horario: 'desayuno' | 'comida' | 'cena' | 'tarde'
  mesa_numero: number
  calificacion_atencion?: number
  calificacion_rapidez?: number
  calificacion_amabilidad?: number
  calificacion_general?: number
  comentarios?: string
  created_at: string
}

export interface Ticket {
  id: string
  cliente_id: string
  visita_id: string
  numero_ticket: string
  fecha: string
  mesa_numero: number
  productos: any[]
  subtotal: number
  descuento: number
  propina: number
  total: number
  metodo_pago?: string
  mesero: string
  hostess?: string
  created_at: string
}

export interface Reward {
  id: string
  cliente_id: string
  tipo: 'puntos' | 'descuento' | 'producto_gratis' | 'upgrade' | 'cumpleaños' | 'racha'
  descripcion: string
  puntos: number
  valor_descuento: number
  activo: boolean
  usado: boolean
  fecha_expiracion?: string
  fecha_uso?: string
  visitas_requeridas?: number
  consumo_minimo?: number
  created_at: string
}

export interface Racha {
  id: string
  cliente_id: string
  tipo: 'fines_semana' | 'semanal' | 'mensual' | 'especial'
  nombre: string
  descripcion?: string
  visitas_actuales: number
  visitas_objetivo: number
  completada: boolean
  fecha_inicio: string
  fecha_completada?: string
  recompensa_tipo?: string
  recompensa_valor?: number
  recompensa_otorgada: boolean
  created_at: string
}

export interface FilaEspera {
  id: string
  cliente_id?: string
  nombre_cliente: string
  telefono: string
  numero_personas: number
  estado: 'esperando' | 'notificado' | 'sentado' | 'cancelado'
  posicion?: number
  hora_llegada: string
  tiempo_espera_estimado?: number
  hora_notificacion?: string
  hora_asignacion?: string
  mesa_asignada?: string
  created_at: string
}

// ============================================
// FUNCIONES DE CLIENTES
// ============================================

export async function obtenerClientes() {
  console.log('🔄 Cargando clientes...')
  
  try {
    // 1. Cargar clientes de la tabla clientes
    const { data: clientesData, error: errorClientes } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('updated_at', { ascending: false })
    
    if (errorClientes) {
      console.error('❌ Error al obtener clientes:', errorClientes)
      return []
    }
    
    console.log(`✅ ${clientesData?.length || 0} clientes cargados desde tabla clientes`)
    
    if (!clientesData || clientesData.length === 0) {
      console.warn('⚠️ No hay clientes en tabla clientes. Intentando desde reservaciones...')
      
      // Fallback: cargar desde reservaciones
      const { data: reservaciones, error: errorReservas } = await supabase
        .from('reservaciones')
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })
      
      if (errorReservas) {
        console.error('❌ Error al obtener reservaciones:', errorReservas)
        return []
      }
      
      console.log(`📊 Reservaciones obtenidas: ${reservaciones?.length || 0}`)
      
      // Agrupar por cliente_nombre
      const clientesMap = new Map<string, any>()
      
      reservaciones?.forEach((reserva: any) => {
        const nombreCliente = reserva.cliente_nombre || 'Sin nombre'
        
        if (!clientesMap.has(nombreCliente)) {
          clientesMap.set(nombreCliente, {
            id: `reserva-${reserva.id}`,
            nombre: nombreCliente,
            telefono: reserva.telefono || '',
            email: reserva.email || '',
            rp_nombre: reserva.rp_nombre,
            nivel_fidelidad: 'bronce',
            activo: true,
            total_visitas: 0,
            consumo_total: 0,
            consumo_promedio: 0,
            calificacion_promedio: 0,
            puntos_rewards: 0,
            visitas_consecutivas: 0,
            primera_visita: reserva.fecha,
            ultima_visita_real: reserva.fecha + 'T' + (reserva.hora || '00:00:00'),
            created_at: reserva.created_at,
            updated_at: reserva.updated_at
          })
        }
      })
      
      const clientesFromReservas = Array.from(clientesMap.values())
      console.log(`✅ ${clientesFromReservas.length} clientes cargados desde reservaciones`)
      return clientesFromReservas as Cliente[]
    }
    
    // 2. Enriquecer clientes con última visita real desde reservaciones
    const clientesConVisitas = await Promise.all(
      clientesData.map(async (cliente: any) => {
        // Concatenar nombre y apellido
        const nombreCompleto = cliente.apellido 
          ? `${cliente.nombre} ${cliente.apellido}`.trim()
          : cliente.nombre
        
        const { data: ultimaReserva } = await supabase
          .from('reservaciones')
          .select('fecha, hora')
          .eq('cliente_nombre', nombreCompleto)
          .order('fecha', { ascending: false })
          .limit(1)
          .single()
        
        let fechaReal = cliente.ultima_visita
        if (ultimaReserva?.fecha) {
          fechaReal = ultimaReserva.fecha + 'T' + (ultimaReserva.hora || '00:00:00')
        }
        
        return {
          ...cliente,
          nombre: nombreCompleto,
          ultima_visita_real: fechaReal
        }
      })
    )
    
    console.log(`✅ ${clientesConVisitas.length} clientes enriquecidos con fechas reales`)
    return clientesConVisitas as Cliente[]
  } catch (error) {
    console.error('❌ Error en obtenerClientes:', error)
    return []
  }
}

export async function obtenerClientePorId(id: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error al obtener cliente:', error)
    return null
  }
  return data as Cliente
}

export async function buscarClientePorTelefono(telefono: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('telefono', telefono)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error al buscar cliente:', error)
    return null
  }
  return data as Cliente | null
}

export async function crearCliente(cliente: Partial<Cliente>) {
  console.log('📝 Intentando crear cliente:', cliente)
  
  const { data, error } = await supabase
    .from('clientes')
    .insert([{
      ...cliente,
      qr_wallet_id: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }])
    .select()
    .single()
  
  if (error) {
    console.error('❌ ERROR AL CREAR CLIENTE:', error)
    console.error('Código:', error.code)
    console.error('Mensaje:', error.message)
    console.error('Detalles:', error.details)
    alert(`❌ Error al crear cliente: ${error.message}`)
    return null
  }
  
  console.log('✅ Cliente creado exitosamente:', data)
  return data as Cliente
}

export async function actualizarCliente(id: string, datos: Partial<Cliente>) {
  const { data, error } = await supabase
    .from('clientes')
    .update(datos)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error al actualizar cliente:', error)
    return null
  }
  return data as Cliente
}

export async function obtenerClientesActivos() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .gte('ultima_visita', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // últimos 30 días
    .order('ultima_visita', { ascending: false })
  
  if (error) {
    console.error('Error al obtener clientes activos:', error)
    return []
  }
  return data as Cliente[]
}

export async function obtenerTopClientes(limite: number = 10) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .order('consumo_total', { ascending: false })
    .limit(limite)
  
  if (error) {
    console.error('Error al obtener top clientes:', error)
    return []
  }
  return data as Cliente[]
}

// ============================================
// FUNCIONES DE VISITAS
// ============================================

export async function crearVisita(visita: Partial<Visita>) {
  const { data, error } = await supabase
    .from('visitas')
    .insert([visita])
    .select()
    .single()
  
  if (error) {
    console.error('Error al crear visita:', error)
    return null
  }
  return data as Visita
}

export async function finalizarVisita(
  visitaId: string, 
  datos: { 
    hora_salida: string
    duracion_minutos: number
    total_consumo: number
    productos_consumidos: any[]
    calificacion_servicio?: number
    calificacion_comida?: number
    comentarios?: string
  }
) {
  const { data, error } = await supabase
    .from('visitas')
    .update(datos)
    .eq('id', visitaId)
    .select()
    .single()
  
  if (error) {
    console.error('Error al finalizar visita:', error)
    return null
  }
  return data as Visita
}

export async function obtenerVisitasCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
  
  if (error) {
    console.error('Error al obtener visitas:', error)
    return []
  }
  return data as Visita[]
}

export async function obtenerVisitasHoy() {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .gte('fecha', hoy.toISOString())
    .order('fecha', { ascending: false })
  
  if (error) {
    console.error('Error al obtener visitas de hoy:', error)
    return []
  }
  return data as Visita[]
}

// ============================================
// FUNCIONES DE MESAS
// ============================================

export async function obtenerMesas() {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) {
    console.error('Error al obtener mesas:', error)
    return []
  }
  return data || []
}

export async function asignarMesaCliente(
  mesaId: number,
  datos: {
    cliente_id?: string
    cliente_nombre: string
    numero_personas: number
    hostess?: string
    mesero?: string
    mesero_id?: number
    rp?: string  // ✅ AGREGAR campo RP
  }
) {
  const { data, error } = await supabase
    .from('mesas')
    .update({
      cliente_id: datos.cliente_id || null,
      cliente_nombre: datos.cliente_nombre,
      numero_personas: datos.numero_personas,
      hostess: datos.hostess || null,
      mesero: datos.mesero || null,
      rp: datos.rp || null,
      estado: 'ocupada',
      hora_asignacion: new Date().toISOString(),
      total_actual: 0,
      pedidos_data: []
    })
    .eq('id', mesaId)
    .select()
    .single()
  
  if (error) {
    console.error('Error al asignar mesa:', error)
    return null
  }

  // Registrar visita con fecha y hora de asignación
  const ahora = new Date().toISOString()
  await supabase.from('visitas').insert({
    cliente_id: datos.cliente_id || null,
    cliente_nombre: datos.cliente_nombre,
    mesa_numero: data?.numero ? parseInt(data.numero) : null,
    fecha: ahora,
    hostess: datos.hostess || null,
    mesero: datos.mesero || null,
    created_at: ahora
  })

  // Actualizar ultima_visita y total_visitas en el cliente si tiene ID
  if (datos.cliente_id) {
    const { data: clienteActual } = await supabase
      .from('clientes')
      .select('total_visitas')
      .eq('id', datos.cliente_id)
      .single()

    await supabase.from('clientes').update({
      ultima_visita: ahora,
      total_visitas: (clienteActual?.total_visitas || 0) + 1
    }).eq('id', datos.cliente_id)
  }

  return data
}

export async function liberarMesa(mesaId: number) {
  // SOLO liberar la mesa, sin crear ticket (el ticket se crea desde el mesero)
  
  // Primero obtener el número de la mesa para actualizar mesa_numero
  const { data: mesaData } = await supabase
    .from('mesas')
    .select('numero')
    .eq('id', mesaId)
    .single()
  
  const mesaNumero = mesaData?.numero ? parseInt(mesaData.numero) : null
  
  const { error } = await supabase
    .from('mesas')
    .update({
      estado: 'disponible',
      cliente_id: null,
      cliente_nombre: null,
      numero_personas: 0,
      hostess: null,
      mesero: null,
      rp: null,
      hora_asignacion: null,
      pedidos_data: [],
      total_actual: 0
    })
    .eq('id', mesaId)
  
  if (error) {
    console.error('Error al liberar mesa:', error)
    throw error
  }
  
  console.log('✅ Mesa liberada:', mesaId)
}

export async function reservarMesa(mesaId: number, data: {
  cliente_nombre: string
  numero_personas: number
  telefono?: string
  hora_reserva?: string
}) {
  const { error } = await supabase
    .from('mesas')
    .update({
      estado: 'reservada',
      cliente_nombre: data.cliente_nombre,
      numero_personas: data.numero_personas,
      hora_asignacion: data.hora_reserva || new Date().toISOString()
    })
    .eq('id', mesaId)
  
  if (error) {
    console.error('Error al reservar mesa:', error)
    throw error
  }
}

export async function actualizarPedidosMesa(mesaId: number, pedidos: any[], total: number) {
  const { data, error } = await supabase
    .from('mesas')
    .update({
      pedidos_data: pedidos,
      total_actual: total
    })
    .eq('id', mesaId)
    .select()
    .single()
  
  if (error) {
    console.error('Error al actualizar pedidos:', error)
    return null
  }
  return data as MesaCliente
}

// ============================================
// FUNCIONES DE CALIFICACIONES HOSTESS
// ============================================

export async function crearCalificacionHostess(calificacion: Partial<CalificacionHostess>) {
  const { data, error } = await supabase
    .from('calificaciones_hostess')
    .insert([calificacion])
    .select()
    .single()
  
  if (error) {
    console.error('Error al crear calificación:', error)
    return null
  }
  return data as CalificacionHostess
}

export async function obtenerCalificacionesHostess(hostess: string, fechaInicio?: string, fechaFin?: string) {
  let query = supabase
    .from('calificaciones_hostess')
    .select('*')
    .eq('hostess', hostess)
  
  if (fechaInicio) query = query.gte('fecha', fechaInicio)
  if (fechaFin) query = query.lte('fecha', fechaFin)
  
  const { data, error } = await query.order('fecha', { ascending: false })
  
  if (error) {
    console.error('Error al obtener calificaciones:', error)
    return []
  }
  return data as CalificacionHostess[]
}

export async function obtenerPromedioHostessPorHorario(hostess: string) {
  const { data, error } = await supabase
    .from('calificaciones_hostess')
    .select('horario, calificacion_general')
    .eq('hostess', hostess)
  
  if (error) {
    console.error('Error al obtener promedios:', error)
    return {}
  }
  
  // Calcular promedios por horario
  const promedios: Record<string, number> = {}
  const conteos: Record<string, number> = {}
  
  data.forEach(cal => {
    if (!promedios[cal.horario]) {
      promedios[cal.horario] = 0
      conteos[cal.horario] = 0
    }
    promedios[cal.horario] += cal.calificacion_general || 0
    conteos[cal.horario]++
  })
  
  Object.keys(promedios).forEach(horario => {
    promedios[horario] = promedios[horario] / conteos[horario]
  })
  
  return promedios
}

// ============================================
// FUNCIONES DE TICKETS
// ============================================

export async function crearTicket(ticket: Partial<Ticket>) {
  const numeroTicket = `T-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  
  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      ...ticket,
      numero_ticket: numeroTicket
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error al crear ticket:', error)
    return null
  }
  return data as Ticket
}

export async function obtenerTicketsCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
  
  if (error) {
    console.error('Error al obtener tickets:', error)
    return []
  }
  return data as Ticket[]
}

// ============================================
// FUNCIONES DE REWARDS
// ============================================

export async function crearReward(reward: Partial<Reward>) {
  const { data, error } = await supabase
    .from('rewards')
    .insert([reward])
    .select()
    .single()
  
  if (error) {
    console.error('Error al crear reward:', error)
    return null
  }
  return data as Reward
}

export async function obtenerRewardsActivos(clienteId: string) {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('activo', true)
    .eq('usado', false)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error al obtener rewards:', error)
    return []
  }
  return data as Reward[]
}

export async function usarReward(rewardId: string) {
  const { data, error } = await supabase
    .from('rewards')
    .update({
      usado: true,
      fecha_uso: new Date().toISOString()
    })
    .eq('id', rewardId)
    .select()
    .single()
  
  if (error) {
    console.error('Error al usar reward:', error)
    return null
  }
  return data as Reward
}

// ============================================
// FUNCIONES DE RACHAS
// ============================================

export async function crearRacha(racha: Partial<Racha>) {
  const { data, error } = await supabase
    .from('rachas')
    .insert([racha])
    .select()
    .single()
  
  if (error) {
    console.error('Error al crear racha:', error)
    return null
  }
  return data as Racha
}

export async function actualizarRacha(rachaId: string, visitas: number) {
  const { data: racha } = await supabase
    .from('rachas')
    .select('*')
    .eq('id', rachaId)
    .single()
  
  if (!racha) return null
  
  const completada = visitas >= racha.visitas_objetivo
  
  const { data, error } = await supabase
    .from('rachas')
    .update({
      visitas_actuales: visitas,
      completada,
      fecha_completada: completada ? new Date().toISOString() : null
    })
    .eq('id', rachaId)
    .select()
    .single()
  
  if (error) {
    console.error('Error al actualizar racha:', error)
    return null
  }
  return data as Racha
}

export async function obtenerRachasCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('rachas')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error al obtener rachas:', error)
    return []
  }
  return data as Racha[]
}

// ============================================
// FUNCIONES DE FILA DE ESPERA
// ============================================

export async function agregarAFila(datos: Partial<FilaEspera>) {
  // Obtener la última posición
  const { data: ultimaFila } = await supabase
    .from('fila_espera')
    .select('posicion')
    .eq('estado', 'esperando')
    .order('posicion', { ascending: false })
    .limit(1)
    .single()
  
  const nuevaPosicion = (ultimaFila?.posicion || 0) + 1
  
  const { data, error } = await supabase
    .from('fila_espera')
    .insert([{
      ...datos,
      posicion: nuevaPosicion,
      estado: 'esperando'
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error al agregar a fila:', error)
    return null
  }
  return data as FilaEspera
}

export async function obtenerFilaEspera() {
  const { data, error } = await supabase
    .from('fila_espera')
    .select('*')
    .eq('estado', 'esperando')
    .order('posicion', { ascending: true })
  
  if (error) {
    console.error('Error al obtener fila:', error)
    return []
  }
  return data as FilaEspera[]
}

export async function actualizarEstadoFila(id: string, estado: FilaEspera['estado'], mesaAsignada?: string) {
  const datos: any = { estado }
  
  if (estado === 'notificado') {
    datos.hora_notificacion = new Date().toISOString()
  } else if (estado === 'sentado') {
    datos.hora_asignacion = new Date().toISOString()
    datos.mesa_asignada = mesaAsignada
  }
  
  const { data, error } = await supabase
    .from('fila_espera')
    .update(datos)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error al actualizar fila:', error)
    return null
  }
  return data as FilaEspera
}

// ============================================
// FUNCIONES DE MÉTRICAS Y REPORTES
// ============================================

export async function obtenerMetricasGenero() {
  const { data, error } = await supabase
    .from('clientes')
    .select('genero, total_visitas, consumo_total, consumo_promedio')
    .eq('activo', true)
  
  if (error) {
    console.error('Error al obtener métricas por género:', error)
    return {}
  }
  
  const metricas: Record<string, any> = {}
  
  data.forEach(cliente => {
    const genero = cliente.genero || 'no_especifica'
    if (!metricas[genero]) {
      metricas[genero] = {
        total_clientes: 0,
        total_visitas: 0,
        consumo_total: 0,
        consumo_promedio: 0
      }
    }
    metricas[genero].total_clientes++
    metricas[genero].total_visitas += cliente.total_visitas
    metricas[genero].consumo_total += parseFloat(cliente.consumo_total)
  })
  
  // Calcular promedios
  Object.keys(metricas).forEach(genero => {
    metricas[genero].consumo_promedio = 
      metricas[genero].consumo_total / metricas[genero].total_clientes
  })
  
  return metricas
}

export async function obtenerClientesConRachas() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .gte('visitas_consecutivas', 3)
    .order('visitas_consecutivas', { ascending: false })
  
  if (error) {
    console.error('Error al obtener clientes con rachas:', error)
    return []
  }
  return data as Cliente[]
}

export async function calcularTicketPromedio(clienteId?: string) {
  let query = supabase
    .from('tickets')
    .select('total')
  
  if (clienteId) {
    query = query.eq('cliente_id', clienteId)
  }
  
  const { data, error } = await query
  
  if (error || !data || data.length === 0) {
    return 0
  }
  
  const suma = data.reduce((acc, ticket) => acc + parseFloat(ticket.total), 0)
  return suma / data.length
}

// ============================================
// CALIFICACIONES DE CLIENTES
// ============================================

export interface CalificacionCliente {
  id: string
  cliente_id: string
  visita_id?: string
  calificacion_consumo: number
  calificacion_look_feel: number
  calificacion_vibe: number
  calificacion_promedio: number
  calificado_por: string
  comentarios?: string
  fecha: string
  created_at: string
}

export async function crearCalificacionCliente(data: {
  cliente_id: string
  visita_id?: string
  calificacion_consumo: number
  calificacion_look_feel: number
  calificacion_vibe: number
  calificado_por: string
  comentarios?: string
}) {
  const { data: calificacion, error } = await supabase
    .from('calificaciones_clientes')
    .insert([{
      cliente_id: data.cliente_id,
      visita_id: data.visita_id,
      calificacion_consumo: data.calificacion_consumo,
      calificacion_look_feel: data.calificacion_look_feel,
      calificacion_vibe: data.calificacion_vibe,
      calificado_por: data.calificado_por,
      comentarios: data.comentarios
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error al crear calificación:', error)
    throw error
  }
  
  return calificacion
}

export async function obtenerCalificacionesCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('calificaciones_clientes')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
  
  if (error) {
    console.error('Error al obtener calificaciones:', error)
    return []
  }
  
  return data as CalificacionCliente[]
}

// ============================================
// FUNCIONES DE ESTADÍSTICAS Y REPORTES
// ============================================

export async function obtenerEstadisticasGenerales() {
  try {
    const { data: clientes, error: errorClientes } = await supabase
      .from('clientes')
      .select('*')
    
    const { data: visitas, error: errorVisitas } = await supabase
      .from('visitas')
      .select('*')
    
    const { data: tickets, error: errorTickets } = await supabase
      .from('tickets')
      .select('*')
    
    if (errorClientes || errorVisitas || errorTickets) {
      console.error('Error al obtener estadísticas')
      return null
    }
    
    // Calcular métricas
    const totalClientes = clientes?.length || 0
    const clientesActivos = clientes?.filter(c => c.activo)?.length || 0
    const totalVisitas = visitas?.length || 0
    const totalConsumo = tickets?.reduce((sum, t) => sum + (t.total || 0), 0) || 0
    const ticketPromedio = totalVisitas > 0 ? totalConsumo / totalVisitas : 0
    
    // Clientes por género
    const masculinos = clientes?.filter(c => c.genero === 'masculino')?.length || 0
    const femeninos = clientes?.filter(c => c.genero === 'femenino')?.length || 0
    
    // Clientes por nivel
    const niveles = {
      bronce: clientes?.filter(c => c.nivel_fidelidad === 'bronce')?.length || 0,
      plata: clientes?.filter(c => c.nivel_fidelidad === 'plata')?.length || 0,
      oro: clientes?.filter(c => c.nivel_fidelidad === 'oro')?.length || 0,
      platino: clientes?.filter(c => c.nivel_fidelidad === 'platino')?.length || 0,
      diamante: clientes?.filter(c => c.nivel_fidelidad === 'diamante')?.length || 0
    }
    
    return {
      totalClientes,
      clientesActivos,
      totalVisitas,
      totalConsumo,
      ticketPromedio,
      genero: { masculinos, femeninos },
      niveles
    }
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function obtenerClientesNuevosEsteMes() {
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .gte('created_at', inicioMes.toISOString())
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function obtenerVisitasPorDia(dias: number = 7) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .gte('created_at', fecha.toISOString())
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function obtenerTicketsRecientes(limite: number = 50) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      clientes (
        nombre,
        apellido,
        nivel_fidelidad
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limite)
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

// ============================================
// FUNCIONES DE REPORTES
// ============================================

export async function obtenerVentasPorDia(dias: number = 7) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .gte('created_at', fecha.toISOString())
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function obtenerProductosMasVendidos(limite: number = 10) {
  // Por ahora retorna array vacío hasta que tengamos productos en tickets
  return []
}

export async function obtenerRendimientoMeseros() {
  const { data: visitas, error } = await supabase
    .from('visitas')
    .select('mesero, total_consumo')
    .not('mesero', 'is', null)
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  // Agrupar por mesero
  const meserosMap = new Map()
  
  visitas?.forEach((visita: any) => {
    const mesero = visita.mesero
    if (!meserosMap.has(mesero)) {
      meserosMap.set(mesero, {
        nombre: mesero,
        ventas: 0,
        pedidos: 0,
        propina: 0
      })
    }
    
    const data = meserosMap.get(mesero)
    data.ventas += visita.total_consumo || 0
    data.pedidos += 1
    data.propina += (visita.total_consumo || 0) * 0.1 // 10% estimado
  })
  
  return Array.from(meserosMap.values())
}

// ============================================
// FUNCIONES DE REWARDS (ADICIONALES)
// ============================================

export async function obtenerClientesConPuntos() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .gt('puntos_rewards', 0)
    .eq('activo', true)
    .order('puntos_rewards', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function obtenerClientesPorNivel(nivel: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('nivel_fidelidad', nivel)
    .eq('activo', true)
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function actualizarPuntosCliente(clienteId: string, puntos: number) {
  const { data, error } = await supabase
    .from('clientes')
    .update({ puntos_rewards: puntos })
    .eq('id', clienteId)
    .select()
    .single()
  
  if (error) {
    console.error('Error:', error)
    throw error
  }
  
  return data
}

// ============================================
// FUNCIONES DE CORTESÍAS PARA RP
// ============================================

export async function obtenerLimitesRP(rpNombre: string) {
  const { data, error } = await supabase
    .from('limites_cortesias_rp')
    .select('*')
    .eq('rp_nombre', rpNombre)
    .eq('activo', true)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return null
  }
  
  return data
}

export async function obtenerMesasRP(rpNombre: string) {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('rp', rpNombre)
    .eq('estado', 'ocupada')
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function autorizarCortesia(cortesia: {
  rp_nombre: string
  mesa_id: number
  mesa_numero: number
  cliente_nombre: string
  tipo_cortesia: string
  descripcion: string
  cantidad: number
  valor_descuento?: number
  notas?: string
}) {
  const { data, error } = await supabase
    .from('cortesias')
    .insert([cortesia])
    .select()
    .single()
  
  if (error) {
    console.error('Error al autorizar cortesía:', error)
    throw error
  }
  
  return data
}

export async function obtenerCortesiasRP(rpNombre: string) {
  const { data, error } = await supabase
    .from('cortesias')
    .select('*')
    .eq('rp_nombre', rpNombre)
    .order('fecha_autorizacion', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function obtenerTodasCortesias() {
  const { data, error } = await supabase
    .from('cortesias')
    .select('*')
    .order('fecha_autorizacion', { ascending: false })
    .limit(100)
  
  if (error) {
    console.error('Error:', error)
    return []
  }
  
  return data || []
}

export async function marcarCortesiaUsada(cortesiaId: string) {
  const { data, error } = await supabase
    .from('cortesias')
    .update({ 
      usado: true, 
      fecha_uso: new Date().toISOString() 
    })
    .eq('id', cortesiaId)
    .select()
    .single()
  
  if (error) {
    console.error('Error:', error)
    throw error
  }
  
  return data
}

// ============================================
// CORTESÍAS ACTIVAS (TIEMPO REAL)
// ============================================

export interface CortesiaActiva {
  id: string
  folio: string
  rp_nombre: string
  mesa_id: number
  mesa_numero: string
  cliente_nombre: string
  tipo_cortesia: string
  descripcion: string
  cantidad: number
  fecha_autorizacion: number
  tiempo_restante: number
  notificado_10min: boolean
  notificado_5min: boolean
  estado: 'activa' | 'expirada' | 'cerrada'
}

export async function crearCortesiaActiva(cortesia: {
  id: string
  rp_nombre: string
  mesa_id: number
  mesa_numero: string
  cliente_nombre: string
  tipo_cortesia: string
  descripcion: string
  cantidad: number
  fecha_autorizacion: number
}) {
  const { data, error } = await supabase.rpc('crear_cortesia_activa', {
    p_id: cortesia.id,
    p_rp_nombre: cortesia.rp_nombre,
    p_mesa_id: cortesia.mesa_id,
    p_mesa_numero: cortesia.mesa_numero,
    p_cliente_nombre: cortesia.cliente_nombre,
    p_tipo_cortesia: cortesia.tipo_cortesia,
    p_descripcion: cortesia.descripcion,
    p_cantidad: cortesia.cantidad,
    p_fecha_autorizacion: cortesia.fecha_autorizacion
  })

  if (error) {
    console.error('Error al crear cortesía activa:', error)
    throw error
  }

  return data
}

export async function obtenerCortesiasActivasRP(rpNombre: string): Promise<CortesiaActiva[]> {
  const { data, error } = await supabase.rpc('obtener_cortesias_activas_rp', {
    p_rp_nombre: rpNombre
  })

  if (error) {
    console.error('Error al obtener cortesías activas:', error)
    return []
  }

  return data || []
}

export async function actualizarTiempoCortesias() {
  const { error } = await supabase.rpc('actualizar_tiempo_cortesias')

  if (error) {
    console.error('Error al actualizar tiempo:', error)
    throw error
  }
}

export async function cerrarCortesiaActiva(id: string) {
  const { error } = await supabase.rpc('cerrar_cortesia_activa', {
    p_id: id
  })

  if (error) {
    console.error('Error al cerrar cortesía:', error)
    throw error
  }
}

export async function marcarNotificacionCortesia(id: string, tipo: '10min' | '5min') {
  const { error } = await supabase.rpc('marcar_notificacion_cortesia', {
    p_id: id,
    p_tipo: tipo
  })

  if (error) {
    console.error('Error al marcar notificación:', error)
    throw error
  }
}

export async function obtenerCortesiasParaNotificar() {
  const { data, error } = await supabase
    .from('vista_cortesias_notificar')
    .select('*')

  if (error) {
    console.error('Error al obtener cortesías para notificar:', error)
    return []
  }

  return data || []
}

// Suscripción en tiempo real a cortesías activas
export function suscribirCortesiasActivas(rpNombre: string, callback: (cortesias: CortesiaActiva[]) => void) {
  const channel = supabase
    .channel('cortesias-activas')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cortesias_activas',
        filter: `rp_nombre=eq.${rpNombre}`
      },
      async () => {
        // Recargar cortesías cuando hay cambios
        const cortesias = await obtenerCortesiasActivasRP(rpNombre)
        callback(cortesias)
      }
    )
    .subscribe()

  return channel
}
