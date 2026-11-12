// Operaciones del sistema FEVER. Replican exactamente la lógica del panel Hostess
// (app/dashboard/hostess/page.tsx y lib/supabase-clientes.ts) para que todo lo que
// haga el agente se vea igual en el panel y en el mapa 3D en tiempo real.
import { createClient } from "@supabase/supabase-js"
import { config } from "./config.js"
import { fechaLocal, fechaUTC, formatoHora, horaDeNocheAUtc, nocheOperativa } from "./tiempo.js"

const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: { persistSession: false },
})

// Mismas mesas operativas que el panel Hostess
export const MESAS_VALIDAS = ['1', '2', '4', '5', '6', '7', '10', '11', '12', '13', '14', '15', '16', '20', '21', '22', '23', '24', '25', '26', '30', '31', '32', '33', '34', '35', '36', '37']

export class ErrorOperacion extends Error {}

function revisar<T>(r: { data: T; error: { message: string } | null }, contexto: string): T {
  if (r.error) throw new ErrorOperacion(`${contexto}: ${r.error.message}`)
  return r.data
}

// ---------- Lecturas ----------
type Mesa = Record<string, any>

async function todasLasMesas(): Promise<Mesa[]> {
  const data = revisar(await supabase.from("mesas").select("*").order("id"), "No se pudieron leer las mesas")
  return (data ?? []).filter((m: Mesa) => MESAS_VALIDAS.includes(String(m.numero)))
}

async function mesaPorNumero(numero: string): Promise<Mesa> {
  const n = String(numero).trim()
  if (!MESAS_VALIDAS.includes(n)) throw new ErrorOperacion(`La mesa ${n} no existe o no está en operación. Mesas válidas: ${MESAS_VALIDAS.join(", ")}`)
  const data = revisar(await supabase.from("mesas").select("*").eq("numero", n).maybeSingle(), `No se pudo leer la mesa ${n}`)
  if (!data) throw new ErrorOperacion(`La mesa ${n} no está registrada en el sistema`)
  return data
}

function resumenMesa(m: Mesa) {
  return {
    mesa: m.numero,
    estado: m.estado,
    capacidad: m.capacidad,
    cliente: m.cliente_nombre || null,
    personas: m.numero_personas || 0,
    consumo: Number(m.total_actual || 0),
    // Las mesas libres conservan el último RP; solo se reporta si la mesa está en uso
    rp: m.estado === "disponible" ? null : m.rp_asignado || null,
    mesero: m.mesero || null,
    desde: formatoHora(m.hora_asignacion),
  }
}

export async function verMesas(estado?: string) {
  let mesas = await todasLasMesas()
  if (estado) mesas = mesas.filter((m) => m.estado === estado)
  return mesas.map(resumenMesa)
}

export async function verMesa(numero: string) {
  const m = await mesaPorNumero(numero)
  return { ...resumenMesa(m), pedidos: m.pedidos_data || [] }
}

export async function resumenOperacion() {
  const mesas = await todasLasMesas()
  const ocupadas = mesas.filter((m) => m.estado === "ocupada")
  const hoy = nocheOperativa()
  // Algunas pantallas guardan la fecha en UTC: se consultan ambas para no perder reservaciones
  const reservas = revisar(
    await supabase.from("reservaciones").select("estado, numero_personas").in("fecha", [...new Set([hoy, fechaUTC()])]),
    "No se pudieron leer las reservaciones"
  ) ?? []
  return {
    fecha: hoy,
    mesas_total: mesas.length,
    disponibles: mesas.filter((m) => m.estado === "disponible").map((m) => m.numero),
    ocupadas: ocupadas.length,
    reservadas: mesas.filter((m) => m.estado === "reservada").map((m) => m.numero),
    ocupacion_pct: mesas.length ? Math.round((ocupadas.length / mesas.length) * 100) : 0,
    personas_en_mesas: ocupadas.reduce((s, m) => s + (m.numero_personas || 0), 0),
    consumo_abierto: ocupadas.reduce((s, m) => s + Number(m.total_actual || 0), 0),
    reservaciones_hoy: {
      total: reservas.length,
      pendientes: reservas.filter((r: any) => r.estado === "pendiente").length,
      confirmadas: reservas.filter((r: any) => r.estado === "confirmada").length,
      no_asistieron: reservas.filter((r: any) => r.estado === "no_asistio").length,
      canceladas: reservas.filter((r: any) => r.estado === "cancelada").length,
    },
  }
}

export async function verReservaciones(args: { fecha?: string; hasta?: string; estado?: string; buscar?: string }) {
  const desde = args.fecha || nocheOperativa()
  let q = supabase.from("reservaciones").select("*").order("fecha").order("hora")
  if (args.hasta) q = q.gte("fecha", desde).lte("fecha", args.hasta)
  else if (!args.fecha) q = q.in("fecha", [...new Set([desde, fechaUTC()])])
  else q = q.eq("fecha", desde)
  if (args.estado) q = q.eq("estado", args.estado)
  if (args.buscar) q = q.ilike("cliente_nombre", `%${args.buscar}%`)
  const data = revisar(await q.limit(80), "No se pudieron leer las reservaciones") ?? []
  return data.map((r: any) => ({
    id: r.id,
    fecha: r.fecha,
    hora: r.hora,
    cliente: r.cliente_nombre,
    telefono: r.cliente_telefono || null,
    personas: r.numero_personas,
    hombres: r.numero_hombres || 0,
    mujeres: r.numero_mujeres || 0,
    rp: r.rp_nombre || null,
    estado: r.estado,
    mesa_asignada: r.mesa_asignada || null,
    notas: r.notas || null,
  }))
}

export async function buscarCliente(texto: string) {
  const t = texto.trim()
  const soloDigitos = t.replace(/\D/g, "")
  let q = supabase.from("clientes").select("id, nombre, apellido, telefono, total_visitas, ultima_visita, consumo_total, nivel_fidelidad, notas")
  q = soloDigitos.length >= 7 ? q.ilike("telefono", `%${soloDigitos.slice(-10)}%`) : q.or(`nombre.ilike.%${t}%,apellido.ilike.%${t}%`)
  const data = revisar(await q.limit(10), "No se pudo buscar el cliente") ?? []
  return data.map((c: any) => ({
    id: c.id,
    nombre: `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim(),
    telefono: c.telefono,
    visitas: c.total_visitas || 0,
    ultima_visita: c.ultima_visita ? fechaLocal(new Date(c.ultima_visita)) : null,
    consumo_total: Number(c.consumo_total || 0),
    nivel: c.nivel_fidelidad,
    notas: c.notas || null,
  }))
}

export async function verRPs() {
  const data = revisar(
    await supabase.from("limites_cortesias_rp").select("rp_nombre, abreviatura, activo").order("rp_nombre"),
    "No se pudieron leer los RPs"
  ) ?? []
  return data.filter((r: any) => r.activo).map((r: any) => ({ nombre: r.rp_nombre, abreviatura: r.abreviatura || null }))
}

export async function verMeseros() {
  const data = revisar(await supabase.from("meseros").select("id, nombre, apellido").eq("activo", true).order("nombre"), "No se pudieron leer los meseros") ?? []
  return data.map((m: any) => ({ id: m.id, nombre: `${m.nombre} ${m.apellido ?? ""}`.trim() }))
}

// ---------- Utilidades de escritura ----------
async function rpValido(nombre?: string | null): Promise<string | null> {
  if (!nombre) return null
  const rps = await verRPs()
  const buscado = nombre.trim().toLowerCase()
  const n = (s: string) => s.trim().toLowerCase()
  const encontrado = rps.find((r) => n(r.nombre) === buscado)
    ?? rps.find((r) => r.abreviatura && n(r.abreviatura) === buscado)
    ?? rps.find((r) => n(r.nombre).includes(buscado))
  if (!encontrado) throw new ErrorOperacion(`No encontré al RP "${nombre}". RPs activos: ${rps.map((r) => r.nombre.trim()).join(", ")}`)
  // Se devuelve el nombre tal como está guardado para que cuadre con métricas y cortesías
  return encontrado.nombre
}

// Igual que obtenerRPAleatorio() del panel Hostess
async function rpAleatorio(): Promise<string | null> {
  const rps = await verRPs()
  return rps.length ? rps[Math.floor(Math.random() * rps.length)].nombre : null
}

async function meseroValido(nombre?: string | null) {
  if (!nombre) return null
  const meseros = await verMeseros()
  const m = meseros.find((x) => x.nombre.toLowerCase().includes(nombre.trim().toLowerCase()))
  if (!m) throw new ErrorOperacion(`No encontré al mesero "${nombre}". Meseros activos: ${meseros.map((x) => x.nombre).join(", ")}`)
  return m
}

// Igual que crearCliente() del sistema
async function crearCliente(nombreCompleto: string, telefono?: string | null) {
  const [nombre, ...resto] = nombreCompleto.trim().split(/\s+/)
  const data = revisar(
    await supabase.from("clientes").insert([{
      nombre,
      apellido: resto.join(" "),
      telefono: telefono || `+52 555 ${Math.floor(Math.random() * 10000000)}`,
      email: "",
      genero: "no_especifica",
      nivel_fidelidad: "bronce",
      puntos_rewards: 0,
      activo: true,
      qr_wallet_id: `QR-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    }]).select().single(),
    "No se pudo registrar al cliente"
  )
  return data as any
}

async function clienteParaMesa(args: { cliente_id?: string | null; cliente_nombre: string; telefono?: string | null }) {
  if (args.cliente_id) {
    const c = revisar(await supabase.from("clientes").select("id, nombre, apellido").eq("id", args.cliente_id).maybeSingle(), "No se pudo leer el cliente")
    if (!c) throw new ErrorOperacion("El cliente indicado no existe")
    return { id: c.id as string, nombre: `${c.nombre} ${c.apellido ?? ""}`.trim(), nuevo: false }
  }
  if (args.telefono) {
    const c = revisar(await supabase.from("clientes").select("id, nombre, apellido").eq("telefono", args.telefono).maybeSingle(), "No se pudo buscar el cliente")
    if (c) return { id: c.id as string, nombre: `${c.nombre} ${c.apellido ?? ""}`.trim(), nuevo: false }
  }
  const nuevo = await crearCliente(args.cliente_nombre, args.telefono)
  return { id: nuevo.id as string, nombre: args.cliente_nombre.trim(), nuevo: true }
}

// Igual que asignarMesaCliente() del sistema: ocupa la mesa, registra visita y actualiza al cliente
async function ocuparMesa(mesa: Mesa, datos: {
  cliente_id: string | null
  cliente_nombre: string
  numero_personas: number
  hostess: string
  mesero?: string | null
  mesero_id?: number | null
  rp?: string | null
}) {
  const ahora = new Date().toISOString()
  revisar(
    await supabase.from("mesas").update({
      cliente_id: datos.cliente_id,
      cliente_nombre: datos.cliente_nombre,
      numero_personas: datos.numero_personas,
      hostess: datos.hostess,
      mesero: datos.mesero || null,
      ...(datos.mesero_id ? { mesero_id: datos.mesero_id } : {}),
      rp_asignado: datos.rp || null,
      estado: "ocupada",
      hora_asignacion: ahora,
      total_actual: 0,
      pedidos_data: [],
    }).eq("id", mesa.id),
    `No se pudo asignar la mesa ${mesa.numero}`
  )

  await supabase.from("visitas").insert({
    cliente_id: datos.cliente_id,
    cliente_nombre: datos.cliente_nombre,
    mesa_numero: parseInt(mesa.numero),
    fecha: ahora,
    hostess: datos.hostess,
    mesero: datos.mesero || null,
    rp: datos.rp || null,
    created_at: ahora,
  })

  if (datos.cliente_id) {
    const { data: c } = await supabase.from("clientes").select("total_visitas").eq("id", datos.cliente_id).maybeSingle()
    await supabase.from("clientes").update({ ultima_visita: ahora, total_visitas: (c?.total_visitas || 0) + 1 }).eq("id", datos.cliente_id)
  }
}

// Igual que la liberación del panel: si hay consumo se genera ticket y se suma al cliente
async function cerrarYLiberar(mesa: Mesa, metodoPago: string, notas: string) {
  const total = Number(mesa.total_actual || 0)
  if (total > 0) {
    revisar(
      await supabase.from("tickets").insert({
        cliente_id: mesa.cliente_id || null,
        cliente_nombre: mesa.cliente_nombre,
        mesa_numero: parseInt(mesa.numero),
        productos: mesa.pedidos_data || [],
        subtotal: total,
        propina: 0,
        total,
        metodo_pago: metodoPago,
        mesero: mesa.mesero || "Sin mesero",
        rp_nombre: mesa.rp_asignado || null,
        notas,
        created_at: new Date().toISOString(),
      }),
      "Error al crear el ticket de la cuenta"
    )
    if (mesa.cliente_id) {
      const { data: c } = await supabase.from("clientes").select("consumo_total").eq("id", mesa.cliente_id).maybeSingle()
      if (c) {
        await supabase.from("clientes").update({
          consumo_total: (c.consumo_total || 0) + total,
          ultima_visita: new Date().toISOString(),
        }).eq("id", mesa.cliente_id)
      }
    }
  }
  revisar(
    await supabase.from("mesas").update({
      estado: "disponible",
      cliente_id: null,
      cliente_nombre: null,
      numero_personas: 0,
      total_actual: 0,
      hora_asignacion: null,
      hostess: null,
      mesero: null,
      rp: null,
      pedidos_data: [],
    }).eq("id", mesa.id),
    `No se pudo liberar la mesa ${mesa.numero}`
  )
  return total
}

// ---------- Escrituras ----------
export async function asignarMesa(args: {
  mesas: string[]
  cliente_nombre: string
  numero_personas: number
  cliente_id?: string | null
  telefono?: string | null
  rp?: string | null
  mesero?: string | null
}, operador: string) {
  if (!args.mesas?.length) throw new ErrorOperacion("Indica al menos una mesa")
  if (!args.cliente_nombre?.trim()) throw new ErrorOperacion("Falta el nombre del cliente")
  if (!(args.numero_personas > 0)) throw new ErrorOperacion("El número de personas debe ser mayor a 0")

  const mesas = await Promise.all(args.mesas.map(mesaPorNumero))
  const ocupada = mesas.find((m) => m.estado === "ocupada")
  if (ocupada) throw new ErrorOperacion(`La mesa ${ocupada.numero} ya está ocupada por ${ocupada.cliente_nombre || "otro cliente"}`)

  const rp = args.rp ? await rpValido(args.rp) : await rpAleatorio()
  const mesero = await meseroValido(args.mesero)
  const cliente = await clienteParaMesa(args)

  for (const mesa of mesas) {
    await ocuparMesa(mesa, {
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      numero_personas: args.numero_personas,
      hostess: operador,
      mesero: mesero?.nombre,
      mesero_id: mesero?.id,
      rp,
    })
  }
  return {
    ok: true,
    mesas: mesas.map((m) => m.numero),
    cliente: cliente.nombre,
    cliente_nuevo: cliente.nuevo,
    personas: args.numero_personas,
    rp: rp || null,
    rp_asignado_al_azar: !args.rp && !!rp,
    mesero: mesero?.nombre || null,
  }
}

export async function moverMesa(args: { origen: string; destino: string }) {
  const origen = await mesaPorNumero(args.origen)
  const destino = await mesaPorNumero(args.destino)
  if (origen.estado !== "ocupada") throw new ErrorOperacion(`La mesa ${origen.numero} no está ocupada; no hay nada que mover`)
  if (destino.estado !== "disponible") throw new ErrorOperacion(`La mesa ${destino.numero} está ${destino.estado}; elige una mesa disponible`)

  revisar(
    await supabase.from("mesas").update({
      estado: "ocupada",
      cliente_id: origen.cliente_id,
      cliente_nombre: origen.cliente_nombre,
      numero_personas: origen.numero_personas,
      hostess: origen.hostess,
      mesero: origen.mesero,
      mesero_id: origen.mesero_id,
      rp_asignado: origen.rp_asignado,
      hora_asignacion: origen.hora_asignacion,
      total_actual: origen.total_actual || 0,
      pedidos_data: origen.pedidos_data || [],
    }).eq("id", destino.id),
    `No se pudo preparar la mesa ${destino.numero}`
  )
  // La cuenta viaja con el cliente: la mesa de origen se libera sin generar ticket
  revisar(
    await supabase.from("mesas").update({
      estado: "disponible",
      cliente_id: null,
      cliente_nombre: null,
      numero_personas: 0,
      total_actual: 0,
      hora_asignacion: null,
      hostess: null,
      mesero: null,
      rp: null,
      pedidos_data: [],
    }).eq("id", origen.id),
    `No se pudo liberar la mesa ${origen.numero}`
  )
  return { ok: true, cliente: origen.cliente_nombre, de: origen.numero, a: destino.numero, consumo_trasladado: Number(origen.total_actual || 0) }
}

export async function reservarMesa(args: { mesa: string; cliente_nombre: string; numero_personas: number; telefono?: string | null; hora?: string | null }) {
  const mesa = await mesaPorNumero(args.mesa)
  if (mesa.estado !== "disponible") throw new ErrorOperacion(`La mesa ${mesa.numero} está ${mesa.estado}`)

  // Igual que el panel: buscar o crear cliente por teléfono
  let clienteId: string | null = null
  if (args.telefono) {
    const { data: c } = await supabase.from("clientes").select("id").eq("telefono", args.telefono).maybeSingle()
    clienteId = c?.id ?? (await crearCliente(args.cliente_nombre, args.telefono)).id
  }

  let horaReserva = new Date().toISOString()
  if (args.hora && /^\d{1,2}:\d{2}$/.test(args.hora)) {
    horaReserva = horaDeNocheAUtc(nocheOperativa(), args.hora.padStart(5, "0")).toISOString()
  }
  revisar(
    await supabase.from("mesas").update({
      estado: "reservada",
      cliente_nombre: args.cliente_nombre,
      numero_personas: args.numero_personas,
      hora_asignacion: horaReserva,
      ...(clienteId ? { cliente_id: clienteId } : {}),
    }).eq("id", mesa.id),
    `No se pudo reservar la mesa ${mesa.numero}`
  )
  return { ok: true, mesa: mesa.numero, cliente: args.cliente_nombre, personas: args.numero_personas, hora: args.hora || null }
}

export async function crearReservacion(args: {
  cliente_nombre: string
  fecha: string
  hora: string
  numero_personas: number
  numero_hombres?: number | null
  numero_mujeres?: number | null
  rp?: string | null
  telefono?: string | null
  notas?: string | null
}, operador: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.fecha)) throw new ErrorOperacion("La fecha debe tener formato AAAA-MM-DD")
  if (!/^\d{1,2}:\d{2}$/.test(args.hora)) throw new ErrorOperacion("La hora debe tener formato HH:MM (24 h)")
  if (args.fecha < nocheOperativa()) throw new ErrorOperacion(`La fecha ${args.fecha} ya pasó`)
  const rp = await rpValido(args.rp)

  const data = revisar(
    await supabase.from("reservaciones").insert({
      cliente_nombre: args.cliente_nombre.trim(),
      cliente_telefono: args.telefono || null,
      fecha: args.fecha,
      hora: args.hora.padStart(5, "0"),
      numero_personas: args.numero_personas,
      numero_hombres: args.numero_hombres || 0,
      numero_mujeres: args.numero_mujeres || 0,
      numero_ninos: 0,
      numero_ninas: 0,
      rp_nombre: rp,
      notas: args.notas || null,
      estado: "pendiente",
      creado_por: operador,
    }).select("id").single(),
    "No se pudo crear la reservación"
  )
  return { ok: true, id: (data as any).id, cliente: args.cliente_nombre, fecha: args.fecha, hora: args.hora, personas: args.numero_personas, rp }
}

async function reservacionPorId(id: string) {
  const r = revisar(await supabase.from("reservaciones").select("*").eq("id", id).maybeSingle(), "No se pudo leer la reservación")
  if (!r) throw new ErrorOperacion("No encontré esa reservación; búscala primero con ver_reservaciones")
  return r as any
}

export async function modificarReservacion(args: {
  id: string
  cliente_nombre?: string | null
  fecha?: string | null
  hora?: string | null
  numero_personas?: number | null
  numero_hombres?: number | null
  numero_mujeres?: number | null
  rp?: string | null
  telefono?: string | null
  notas?: string | null
}) {
  const r = await reservacionPorId(args.id)
  if (r.estado !== "pendiente") throw new ErrorOperacion(`La reservación está ${r.estado}; solo se pueden modificar las pendientes`)
  const cambios: Record<string, unknown> = {}
  if (args.cliente_nombre) cambios.cliente_nombre = args.cliente_nombre.trim()
  if (args.fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.fecha)) throw new ErrorOperacion("La fecha debe tener formato AAAA-MM-DD")
    cambios.fecha = args.fecha
  }
  if (args.hora) {
    if (!/^\d{1,2}:\d{2}$/.test(args.hora)) throw new ErrorOperacion("La hora debe tener formato HH:MM (24 h)")
    cambios.hora = args.hora.padStart(5, "0")
  }
  if (args.numero_personas) cambios.numero_personas = args.numero_personas
  if (args.numero_hombres != null) cambios.numero_hombres = args.numero_hombres
  if (args.numero_mujeres != null) cambios.numero_mujeres = args.numero_mujeres
  if (args.rp) cambios.rp_nombre = await rpValido(args.rp)
  if (args.telefono) cambios.cliente_telefono = args.telefono
  if (args.notas != null) cambios.notas = args.notas
  if (Object.keys(cambios).length === 0) throw new ErrorOperacion("No indicaste ningún cambio")
  revisar(await supabase.from("reservaciones").update(cambios).eq("id", args.id), "No se pudo modificar la reservación")
  return { ok: true, cliente: r.cliente_nombre, cambios }
}

// Igual que "Confirmar" en Por llegar: confirma la reservación y ocupa la mesa
export async function confirmarLlegada(args: { id: string; mesa: string; personas_llegaron?: number | null }, operador: string) {
  const r = await reservacionPorId(args.id)
  if (r.estado !== "pendiente") throw new ErrorOperacion(`La reservación de ${r.cliente_nombre} ya está ${r.estado}`)
  const mesa = await mesaPorNumero(args.mesa)
  if (mesa.estado === "ocupada") throw new ErrorOperacion(`La mesa ${mesa.numero} está ocupada por ${mesa.cliente_nombre || "otro cliente"}`)

  revisar(
    await supabase.from("reservaciones").update({
      estado: "confirmada",
      asistio: true,
      hora_llegada: new Date().toISOString(),
      mesa_asignada: parseInt(mesa.numero),
      ...(args.personas_llegaron ? { num_personas_llegaron: args.personas_llegaron } : {}),
    }).eq("id", r.id),
    "No se pudo confirmar la reservación"
  )
  await ocuparMesa(mesa, {
    cliente_id: r.cliente_id || null,
    cliente_nombre: r.cliente_nombre,
    numero_personas: args.personas_llegaron || r.numero_personas,
    hostess: operador,
    rp: r.rp_nombre || null,
  })
  return { ok: true, cliente: r.cliente_nombre, mesa: mesa.numero, personas: args.personas_llegaron || r.numero_personas, rp: r.rp_nombre || null }
}

// ---------- Acciones que requieren confirmación del usuario ----------
export async function describirAccion(nombre: string, args: any): Promise<string> {
  switch (nombre) {
    case "liberar_mesa": {
      const m = await mesaPorNumero(args.mesa)
      if (m.estado !== "ocupada") throw new ErrorOperacion(`La mesa ${m.numero} no está ocupada (está ${m.estado})`)
      const total = Number(m.total_actual || 0)
      return `Liberar mesa ${m.numero} de ${m.cliente_nombre || "cliente"}${total > 0 ? ` y cerrar su cuenta de $${total.toFixed(2)} (se genera ticket)` : " (sin consumo)"}`
    }
    case "cerrar_todas_las_mesas": {
      const ocupadas = (await todasLasMesas()).filter((m) => m.estado === "ocupada")
      if (!ocupadas.length) throw new ErrorOperacion("No hay mesas ocupadas")
      const total = ocupadas.reduce((s, m) => s + Number(m.total_actual || 0), 0)
      return `Cerrar TODAS las mesas ocupadas (${ocupadas.length}: ${ocupadas.map((m) => m.numero).join(", ")}) con un consumo total de $${total.toFixed(2)}`
    }
    case "cancelar_reserva_de_mesa": {
      const m = await mesaPorNumero(args.mesa)
      if (m.estado !== "reservada") throw new ErrorOperacion(`La mesa ${m.numero} no está reservada (está ${m.estado})`)
      return `Cancelar la reserva de la mesa ${m.numero} (${m.cliente_nombre || "sin nombre"}) y dejarla disponible`
    }
    case "cancelar_reservacion": {
      const r = await reservacionPorId(args.id)
      if (r.estado !== "pendiente") throw new ErrorOperacion(`La reservación ya está ${r.estado}`)
      return `Cancelar la reservación de ${r.cliente_nombre} (${r.fecha} ${r.hora}, ${r.numero_personas} personas)`
    }
    case "marcar_no_llego": {
      const r = await reservacionPorId(args.id)
      if (r.estado !== "pendiente") throw new ErrorOperacion(`La reservación ya está ${r.estado}`)
      return `Marcar que ${r.cliente_nombre} NO llegó (${r.fecha} ${r.hora})`
    }
  }
  throw new ErrorOperacion(`Acción desconocida: ${nombre}`)
}

export async function ejecutarAccionConfirmada(nombre: string, args: any): Promise<string> {
  switch (nombre) {
    case "liberar_mesa": {
      const m = await mesaPorNumero(args.mesa)
      if (m.estado !== "ocupada") throw new ErrorOperacion(`La mesa ${m.numero} ya no está ocupada`)
      const total = await cerrarYLiberar(m, "Liberado por Hostess", "Mesa liberada por hostess (Agente FEVER). Cuenta cerrada automáticamente.")
      return `Mesa ${m.numero} liberada${total > 0 ? `. Cuenta cerrada: $${total.toFixed(2)}, ticket generado` : ""}.`
    }
    case "cerrar_todas_las_mesas": {
      const ocupadas = (await todasLasMesas()).filter((m) => m.estado === "ocupada")
      let ok = 0
      const fallas: string[] = []
      for (const m of ocupadas) {
        try {
          await cerrarYLiberar(m, "Cierre masivo por Hostess", "Cierre masivo de mesas por hostess (Agente FEVER).")
          ok++
        } catch {
          fallas.push(m.numero)
        }
      }
      return `Cierre masivo: ${ok} mesa(s) liberadas${fallas.length ? `. Fallaron: ${fallas.join(", ")}` : ""}.`
    }
    case "cancelar_reserva_de_mesa": {
      const m = await mesaPorNumero(args.mesa)
      revisar(
        await supabase.from("mesas").update({ estado: "disponible", cliente_nombre: null, numero_personas: null, rp_asignado: null }).eq("id", m.id),
        "No se pudo cancelar la reserva"
      )
      return `Reserva de la mesa ${m.numero} cancelada; la mesa quedó disponible.`
    }
    case "cancelar_reservacion": {
      const r = await reservacionPorId(args.id)
      revisar(await supabase.from("reservaciones").update({ estado: "cancelada" }).eq("id", r.id), "No se pudo cancelar la reservación")
      return `Reservación de ${r.cliente_nombre} cancelada.`
    }
    case "marcar_no_llego": {
      const r = await reservacionPorId(args.id)
      revisar(await supabase.from("reservaciones").update({ estado: "no_asistio" }).eq("id", r.id), "No se pudo actualizar la reservación")
      return `Marcado: ${r.cliente_nombre} no llegó.`
    }
  }
  throw new ErrorOperacion(`Acción desconocida: ${nombre}`)
}
