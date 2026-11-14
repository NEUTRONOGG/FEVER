// Lógica del bot de Telegram, común a la versión local (long polling) y a la de Cloudflare (webhook).
import Anthropic from "@anthropic-ai/sdk"
import { config } from "./config.js"
import { procesarMensaje, resolverConfirmacion, type Almacen } from "./agente.js"
import * as tg from "./telegram.js"
import { esAdmin, type RegistroUsuarios } from "./usuarios.js"
import { sintetizar, transcribir } from "./voz.js"
import { SUCURSALES, conSucursal, esSucursal, nombreSucursal } from "./sucursal.js"

export interface Contexto {
  usuarios: RegistroUsuarios
  /** Memoria del chat indicado */
  almacen(chatId: number): Almacen
}

const ATAJOS: Record<string, string> = {
  "/resumen": "Dame el resumen de cómo va la noche.",
  "/mesas": "¿Cómo están las mesas ahorita?",
  "/reservas": "¿Qué reservaciones hay para hoy?",
}

const nombreDe = (u?: tg.Usuario) => (u ? [u.first_name, u.last_name].filter(Boolean).join(" ") : "Equipo")

const saludo = (nombre: string) =>
  `¡Hola ${nombre}! Soy ${config.nombreAgente} 👋\n\nEscríbeme o mándame una nota de voz y yo me encargo. Por ejemplo:\n• "¿Cómo va la noche?"\n• "Sienta a Mariana, 6 personas, en la 22"\n• "Agenda a Diego el sábado a las 11 pm, 8 personas"\n• "Llegó Valeria, pásala a la 16"\n• "Cambia a los de la 5 a la 12"\n\n¿En qué te ayudo?`

/** Chat al que pertenece una actualización (para ordenarlas por chat). */
export function chatDe(a: tg.Actualizacion): number | null {
  return a.message?.chat.id ?? a.callback_query?.message?.chat.id ?? a.callback_query?.from.id ?? null
}

export async function atenderActualizacion(a: tg.Actualizacion, ctx: Contexto) {
  if (a.message) await atenderMensaje(a.message, ctx)
  else if (a.callback_query) await atenderBoton(a.callback_query, ctx)
}

const botonesSucursal = () => [SUCURSALES.map((s) => ({ texto: `📍 ${s.nombre}`, dato: `suc:${s.id}` }))]

async function pedirSucursal(chatId: number, texto = "¿En qué sucursal trabajas?") {
  await tg.enviarTexto(chatId, texto, botonesSucursal())
}

// Avisa a los administradores cuando alguien nuevo empieza a usar el bot
async function avisarNuevoUsuario(u: tg.Usuario) {
  const texto = `🆕 ${nombreDe(u)}${u.username ? ` (@${u.username})` : ""} empezó a usar ${config.nombreAgente}. ID ${u.id}.`
  for (const admin of config.usuariosPermitidos) {
    if (admin === String(u.id)) continue
    await tg.enviarTexto(Number(admin), texto, [[{ texto: "🚫 Bloquear", dato: `bloq:${u.id}` }]]).catch(() => {})
  }
}

/** Devuelve true si el usuario puede seguir; registra solo a los nuevos. */
async function darAcceso(m: tg.Mensaje, ctx: Contexto): Promise<boolean> {
  const u = m.from
  if (!u) return false
  const estado = await ctx.usuarios.estado(u.id)
  if (estado === "bloqueado") {
    await tg.enviarTexto(m.chat.id, "Tu acceso a este asistente fue desactivado. Habla con gerencia.")
    return false
  }
  if (estado !== "nuevo") return true

  if (config.codigoAcceso && m.text?.trim() !== config.codigoAcceso) {
    await tg.enviarTexto(m.chat.id, `¡Hola ${u.first_name}! Para empezar, escríbeme el código de acceso del equipo.`)
    return false
  }
  await ctx.usuarios.registrar(u.id, nombreDe(u), u.username)
  console.log(`🆕 Usuario registrado: ${nombreDe(u)} (${u.id})`)
  await avisarNuevoUsuario(u)
  await tg.enviarTexto(m.chat.id, saludo(u.first_name))
  // Si su primer mensaje fue el código o /start, ya quedó saludado; si fue una petición, se atiende
  return !(m.text?.trim() === config.codigoAcceso || m.text?.trim().startsWith("/start"))
}

function mensajeDeError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "La clave de Anthropic no es válida. Revisa ANTHROPIC_API_KEY."
  if (e instanceof Anthropic.RateLimitError) return "Estoy recibiendo demasiadas peticiones; intenta en un momento."
  if (e instanceof Anthropic.APIConnectionError) return "No pude conectarme con el modelo; intenta de nuevo en un momento."
  if (e instanceof Anthropic.APIError) return `El modelo devolvió un error (${e.status}). Intenta de nuevo.`
  return "Algo falló procesando tu mensaje. Intenta de nuevo."
}

async function atenderMensaje(m: tg.Mensaje, ctx: Contexto) {
  const chatId = m.chat.id
  const operador = nombreDe(m.from)
  const texto = m.text?.trim()
  const almacen = ctx.almacen(chatId)

  if (!(await darAcceso(m, ctx))) return

  if (texto?.startsWith("/start")) {
    await almacen.borrarConversacion()
    await tg.enviarTexto(chatId, saludo(m.from?.first_name ?? ""))
    if (!(await almacen.leerSucursal())) await pedirSucursal(chatId)
    return
  }
  if (texto === "/sucursal") {
    const actual = await almacen.leerSucursal()
    await pedirSucursal(chatId, actual ? `Trabajas en FEVER ${nombreSucursal(actual)}. ¿Cambiar a otra?` : "¿En qué sucursal trabajas?")
    return
  }
  if (texto === "/id") {
    await tg.enviarTexto(chatId, `Tu ID de Telegram es ${m.from?.id}.`)
    return
  }
  if (texto === "/usuarios" && m.from && esAdmin(m.from.id)) {
    const lista = await ctx.usuarios.listar()
    if (!lista.length) {
      await tg.enviarTexto(chatId, "Todavía no se ha registrado nadie más.")
      return
    }
    for (const u of lista) {
      await tg.enviarTexto(chatId, `${u.bloqueado ? "🚫" : "✅"} ${u.nombre}${u.usuario ? ` (@${u.usuario})` : ""} · ID ${u.id}`, [[
        u.bloqueado ? { texto: "Desbloquear", dato: `desbloq:${u.id}` } : { texto: "🚫 Bloquear", dato: `bloq:${u.id}` },
      ]])
    }
    return
  }
  if (texto === "/nuevo") {
    await almacen.borrarConversacion()
    await tg.enviarTexto(chatId, "Listo, empezamos de cero.")
    return
  }

  const sucursal = await almacen.leerSucursal()
  if (!sucursal) {
    await pedirSucursal(chatId, "Antes de empezar, ¿en qué sucursal trabajas? Elige y luego me repites lo que necesitas.")
    return
  }

  const audio = m.voice ?? m.audio
  let peticion = texto ? (ATAJOS[texto.split("@")[0]] ?? texto) : ""
  const porVoz = !!audio && !peticion

  try {
    if (porVoz) {
      await tg.accion(chatId, "typing")
      peticion = await transcribir(await tg.descargarArchivo(audio!.file_id))
      if (!peticion) {
        await tg.enviarTexto(chatId, "No alcancé a entender el audio, ¿me lo repites?")
        return
      }
      await tg.enviarTexto(chatId, `🎙️ "${peticion}"`)
    }
    if (!peticion) return

    await tg.accion(chatId, "typing")
    const latido = setInterval(() => tg.accion(chatId, "typing"), 4500)
    let respuesta
    try {
      respuesta = await conSucursal(sucursal, () => procesarMensaje(chatId, operador, peticion, almacen))
    } finally {
      clearInterval(latido)
    }

    await tg.enviarTexto(chatId, respuesta.texto)
    for (const p of respuesta.confirmaciones) {
      await tg.enviarTexto(chatId, `⚠️ ${p.descripcion}`, [[
        { texto: "✅ Confirmar", dato: `si:${p.id}` },
        { texto: "✖️ Cancelar", dato: `no:${p.id}` },
      ]])
    }

    if (porVoz && config.responderConVoz) {
      await tg.accion(chatId, "record_voice")
      await tg.enviarVoz(chatId, await sintetizar(respuesta.texto)).catch((e) => console.error("Voz:", e.message))
    }
  } catch (e) {
    console.error("❌ Error atendiendo mensaje:", e)
    await tg.enviarTexto(chatId, mensajeDeError(e)).catch(() => {})
  }
}

async function atenderBoton(q: NonNullable<tg.Actualizacion["callback_query"]>, ctx: Contexto) {
  const chatId = q.message?.chat.id
  const estado = await ctx.usuarios.estado(q.from.id)
  if (!chatId || !q.data || estado === "bloqueado" || estado === "nuevo") {
    await tg.responderBoton(q.id, "No autorizado")
    return
  }
  const [decision, id] = q.data.split(":")

  if (decision === "bloq" || decision === "desbloq") {
    if (!esAdmin(q.from.id)) {
      await tg.responderBoton(q.id, "Solo un administrador puede hacer esto")
      return
    }
    const r = decision === "bloq" ? await ctx.usuarios.bloquear(id) : await ctx.usuarios.desbloquear(id)
    await tg.responderBoton(q.id, decision === "bloq" ? "Bloqueado" : "Desbloqueado")
    if (q.message) await tg.quitarBotones(chatId, q.message.message_id)
    await tg.enviarTexto(chatId, `${decision === "bloq" ? "🚫 Bloqueado" : "✅ Desbloqueado"}: ${r?.nombre ?? "usuario"} (ID ${id})`)
    if (decision === "bloq") await ctx.almacen(Number(id)).borrarConversacion()
    return
  }

  if (decision === "suc" && esSucursal(id)) {
    const almacen = ctx.almacen(chatId)
    await almacen.guardarSucursal(id)
    // Conversación nueva para no mezclar datos de una sucursal con la otra
    await almacen.borrarConversacion()
    await tg.responderBoton(q.id, nombreSucursal(id))
    if (q.message) await tg.quitarBotones(chatId, q.message.message_id)
    await tg.enviarTexto(chatId, `📍 Listo, trabajas en FEVER ${nombreSucursal(id)}. Cámbiala cuando quieras con /sucursal. ¿En qué te ayudo?`)
    return
  }

  await tg.responderBoton(q.id, decision === "si" ? "Ejecutando…" : "Cancelado")
  if (q.message) await tg.quitarBotones(chatId, q.message.message_id)
  const resultado = await resolverConfirmacion(id, chatId, decision === "si", nombreDe(q.from), ctx.almacen(chatId))
  await tg.enviarTexto(chatId, `${decision === "si" ? "✅" : "✖️"} ${resultado}`)
}
