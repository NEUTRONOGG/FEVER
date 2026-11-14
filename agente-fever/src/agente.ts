import Anthropic from "@anthropic-ai/sdk"
import { config, perezoso } from "./config.js"
import { HERRAMIENTAS, REQUIEREN_CONFIRMACION, ejecutarHerramienta } from "./herramientas.js"
import { ErrorOperacion, describirAccion, ejecutarAccionConfirmada } from "./operaciones.js"
import { marcaTiempo } from "./tiempo.js"
import { conSucursal, nombreSucursal, sucursalActiva, type Sucursal } from "./sucursal.js"

const claude = perezoso(() => new Anthropic({ apiKey: config.anthropicKey }))

const sistema = perezoso(() => `Eres ${config.nombreAgente}, el asistente de operación del antro FEVER. Hablas con el equipo (gerencia, hostess, RPs) por Telegram, por texto o por notas de voz, y operas el sistema real: mesas, clientes y reservaciones. Todo lo que cambias se refleja al instante en el panel Hostess y en el mapa 3D.

Cómo trabajar:
- Español de México, directo y breve. Tus respuestas pueden leerse en voz alta: nada de tablas ni markdown; usa frases cortas y, para listas, una línea por elemento.
- FEVER tiene dos sucursales: León y Aguascalientes. Cada mensaje dice con qué sucursal trabaja este chat; todas las herramientas operan sobre esa sucursal. Para comparar sucursales o dar el acumulado usa resumen_sucursales. Si piden operar en la otra sucursal, diles que la cambien con /sucursal.
- Antes de afirmar algo sobre el estado del lugar, consúltalo con las herramientas; nunca inventes mesas, clientes, ids ni cifras.
- Las fechas relativas ("hoy", "mañana", "el sábado") se resuelven con la fecha y la noche operativa que vienen en cada mensaje. El antro trabaja de noche: antes de las 6:00 "hoy" es la noche operativa en curso. Las reservaciones se guardan con la fecha de su noche (una de la 1:00 del sábado de madrugada va con la noche del viernes); pregunta solo si hay duda real.
- Si falta un dato indispensable (nombre, personas, mesa, fecha u hora de una reservación), pregúntalo en una sola pregunta. No pidas datos opcionales.
- Si piden sentar a alguien por nombre, busca primero si ya existe como cliente o si tiene reservación de hoy; si tiene reservación, usa confirmar_llegada en lugar de asignar_mesa.
- Para grupos grandes sugiere mesas unidas cercanas; para "acomodar" o "cambiar de mesa" usa mover_mesa.
- Las acciones que liberan, cancelan o cierran solo se preparan: el sistema muestra un botón de confirmar. Di qué se va a hacer y que lo confirmen con el botón; no lo des por hecho.
- Si una herramienta devuelve un error, explica el problema en palabras simples y ofrece la alternativa concreta.
- Cada vez que te pidan reintentar algo que falló antes, vuelve a llamar la herramienta: el sistema pudo haberse corregido. Nunca respondas con un error anterior sin haber reintentado.
- Al terminar una acción, confirma en una línea qué quedó hecho (mesa, cliente, personas, RP).`)

const MAX_PASOS = 12
const MAX_MENSAJES = 80
const INACTIVIDAD_MS = 6 * 60 * 60 * 1000
const CONFIRMACION_MS = 15 * 60 * 1000

export interface Conversacion {
  mensajes: Anthropic.Beta.Messages.BetaMessageParam[]
  ultimaActividad: number
}

export interface Pendiente {
  id: string
  chatId: number
  /** Sucursal en la que se preparó: se ejecuta ahí aunque el chat cambie de sucursal */
  sucursal?: Sucursal
  nombre: string
  args: unknown
  descripcion: string
  expira: number
}

export interface RespuestaAgente {
  texto: string
  confirmaciones: Pendiente[]
}

/** Memoria de un chat: en RAM (versión local) o en un Durable Object (Cloudflare). */
export interface Almacen {
  leerConversacion(): Promise<Conversacion | null>
  guardarConversacion(c: Conversacion): Promise<void>
  borrarConversacion(): Promise<void>
  guardarPendiente(p: Pendiente): Promise<void>
  /** Devuelve el pendiente y lo elimina (cada botón se usa una sola vez) */
  tomarPendiente(id: string): Promise<Pendiente | null>
  /** Sucursal con la que trabaja este chat */
  leerSucursal(): Promise<Sucursal | null>
  guardarSucursal(s: Sucursal): Promise<void>
}

export function almacenEnMemoria(): Almacen {
  let conversacion: Conversacion | null = null
  let sucursal: Sucursal | null = null
  const pendientes = new Map<string, Pendiente>()
  return {
    leerSucursal: async () => sucursal,
    guardarSucursal: async (s) => { sucursal = s },
    leerConversacion: async () => conversacion,
    guardarConversacion: async (c) => { conversacion = c },
    borrarConversacion: async () => { conversacion = null },
    guardarPendiente: async (p) => {
      const ahora = Date.now()
      for (const [id, x] of pendientes) if (x.expira < ahora) pendientes.delete(id)
      pendientes.set(p.id, p)
    },
    tomarPendiente: async (id) => {
      const p = pendientes.get(id) ?? null
      pendientes.delete(id)
      return p
    },
  }
}

async function cargarConversacion(almacen: Almacen): Promise<Conversacion> {
  const c = await almacen.leerConversacion()
  // El historial solo crece (nunca se edita): cuando se vuelve largo o viejo se empieza uno nuevo
  if (!c || Date.now() - c.ultimaActividad > INACTIVIDAD_MS || c.mensajes.length > MAX_MENSAJES) {
    return { mensajes: [], ultimaActividad: Date.now() }
  }
  return c
}

async function ejecutarBloque(bloque: Anthropic.Beta.Messages.BetaToolUseBlock, chatId: number, operador: string, almacen: Almacen, nuevasConfirmaciones: Pendiente[]) {
  const args = bloque.input as Record<string, unknown>
  console.log(`🔧 ${operador} → ${bloque.name}`, JSON.stringify(args))
  try {
    if (REQUIEREN_CONFIRMACION.has(bloque.name)) {
      const descripcion = await describirAccion(bloque.name, args)
      const p: Pendiente = { id: crypto.randomUUID().slice(0, 8), chatId, sucursal: sucursalActiva(), nombre: bloque.name, args, descripcion, expira: Date.now() + CONFIRMACION_MS }
      await almacen.guardarPendiente(p)
      nuevasConfirmaciones.push(p)
      return { contenido: `PENDIENTE DE CONFIRMACIÓN. Se mostró al usuario un botón para: ${descripcion}. Aún no se ha ejecutado.`, error: false }
    }
    const resultado = await ejecutarHerramienta(bloque.name, args, operador)
    return { contenido: JSON.stringify(resultado), error: false }
  } catch (e) {
    const mensaje = e instanceof ErrorOperacion ? e.message : `Error inesperado: ${(e as Error).message}`
    if (e instanceof ErrorOperacion) console.warn(`⚠️ ${bloque.name}: ${mensaje}`)
    else console.error(`❌ ${bloque.name}`, e)
    return { contenido: mensaje, error: true }
  }
}

export async function procesarMensaje(chatId: number, operador: string, texto: string, almacen: Almacen): Promise<RespuestaAgente> {
  const c = await cargarConversacion(almacen)
  c.mensajes.push({
    role: "user",
    content: `[${marcaTiempo()} Sucursal: ${nombreSucursal(sucursalActiva())}. Habla: ${operador}]\n${texto}`,
  })

  // El respaldo automático del servidor ante rechazos existe en Opus, Sonnet y Fable; Haiku no lo tiene
  const conRespaldo = /opus|sonnet|fable/.test(config.modelo)
  const confirmaciones: Pendiente[] = []
  const textos: string[] = []

  for (let paso = 0; paso < MAX_PASOS; paso++) {
    const respuesta = await claude().beta.messages.create({
      model: config.modelo,
      max_tokens: 16000,
      system: sistema(),
      tools: HERRAMIENTAS,
      messages: c.mensajes,
      output_config: { effort: config.esfuerzo },
      cache_control: { type: "ephemeral" },
      ...(conRespaldo ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    })

    // Se guarda el contenido completo (incluidos bloques de razonamiento) tal cual
    c.mensajes.push({ role: "assistant", content: respuesta.content })

    for (const b of respuesta.content) if (b.type === "text" && b.text.trim()) textos.push(b.text.trim())

    if (respuesta.stop_reason === "refusal") {
      textos.push("No puedo ayudar con eso.")
      break
    }
    if (respuesta.stop_reason === "pause_turn") continue
    if (respuesta.stop_reason !== "tool_use") {
      if (respuesta.stop_reason === "max_tokens") textos.push("(La respuesta se cortó; pídeme que continúe.)")
      break
    }

    // Se ejecutan en orden para que dos acciones sobre la misma mesa no choquen;
    // todos los resultados vuelven juntos en un solo mensaje
    const resultados: Anthropic.Beta.Messages.BetaToolResultBlockParam[] = []
    for (const bloque of respuesta.content) {
      if (bloque.type !== "tool_use") continue
      const r = await ejecutarBloque(bloque, chatId, operador, almacen, confirmaciones)
      resultados.push({ type: "tool_result", tool_use_id: bloque.id, content: r.contenido, is_error: r.error })
    }
    c.mensajes.push({ role: "user", content: resultados })

    if (paso === MAX_PASOS - 1) textos.push("Me quedé a medias con esta petición; dime cómo seguimos.")
  }

  // Se guarda al final del turno: si algo falla a la mitad, el historial queda consistente
  c.ultimaActividad = Date.now()
  await almacen.guardarConversacion(c)
  return { texto: textos.join("\n\n") || "Listo.", confirmaciones }
}

// Resuelve un botón de confirmar/cancelar y deja constancia en la conversación
export async function resolverConfirmacion(id: string, chatId: number, aceptar: boolean, operador: string, almacen: Almacen): Promise<string> {
  const p = await almacen.tomarPendiente(id)
  if (!p || p.chatId !== chatId) return "Esta acción ya no está disponible."
  if (Date.now() > p.expira) return "Esta confirmación expiró; vuelve a pedirlo."

  let resultado: string
  if (!aceptar) {
    resultado = `Cancelado: no se hizo "${p.descripcion}".`
  } else {
    try {
      resultado = await conSucursal(p.sucursal ?? "leon", () => ejecutarAccionConfirmada(p.nombre, p.args))
      console.log(`✅ ${operador} confirmó → ${p.nombre}`, JSON.stringify(p.args))
    } catch (e) {
      resultado = e instanceof ErrorOperacion ? `No se pudo: ${e.message}` : `Error inesperado: ${(e as Error).message}`
    }
  }
  const c = await almacen.leerConversacion()
  if (c) {
    c.mensajes.push({ role: "user", content: `[Sistema: ${operador} ${aceptar ? "CONFIRMÓ" : "RECHAZÓ"} con el botón "${p.descripcion}". Resultado: ${resultado}]` })
    await almacen.guardarConversacion(c)
  }
  return resultado
}
