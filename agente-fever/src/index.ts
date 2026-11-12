import Anthropic from "@anthropic-ai/sdk"
import { config } from "./config.js"
import { procesarMensaje, reiniciarConversacion, resolverConfirmacion } from "./agente.js"
import * as tg from "./telegram.js"
import { sintetizar, transcribir } from "./voz.js"
import * as usuarios from "./usuarios.js"

const ATAJOS: Record<string, string> = {
  "/resumen": "Dame el resumen de cómo va la noche.",
  "/mesas": "¿Cómo están las mesas ahorita?",
  "/reservas": "¿Qué reservaciones hay para hoy?",
}

const nombreDe = (u?: tg.Usuario) => (u ? [u.first_name, u.last_name].filter(Boolean).join(" ") : "Equipo")

const saludo = (nombre: string) =>
  `¡Hola ${nombre}! Soy ${config.nombreAgente} 👋\n\nEscríbeme o mándame una nota de voz y yo me encargo. Por ejemplo:\n• "¿Cómo va la noche?"\n• "Sienta a Mariana, 6 personas, en la 22"\n• "Agenda a Diego el sábado a las 11 pm, 8 personas"\n• "Llegó Valeria, pásala a la 16"\n• "Cambia a los de la 5 a la 12"\n\n¿En qué te ayudo?`

// Avisa a los administradores cuando alguien nuevo empieza a usar el bot
async function avisarNuevoUsuario(u: tg.Usuario) {
  const texto = `🆕 ${nombreDe(u)}${u.username ? ` (@${u.username})` : ""} empezó a usar ${config.nombreAgente}. ID ${u.id}.`
  for (const admin of config.usuariosPermitidos) {
    if (admin === String(u.id)) continue
    await tg.enviarTexto(Number(admin), texto, [[{ texto: "🚫 Bloquear", dato: `bloq:${u.id}` }]]).catch(() => {})
  }
}

/** Devuelve true si el usuario puede seguir; registra solo a los nuevos. */
async function darAcceso(m: tg.Mensaje): Promise<boolean> {
  const u = m.from
  if (!u) return false
  if (usuarios.estaBloqueado(u.id)) {
    await tg.enviarTexto(m.chat.id, "Tu acceso a este asistente fue desactivado. Habla con gerencia.")
    return false
  }
  if (usuarios.estaRegistrado(u.id)) return true

  if (config.codigoAcceso && m.text?.trim() !== config.codigoAcceso) {
    await tg.enviarTexto(m.chat.id, `¡Hola ${u.first_name}! Para empezar, escríbeme el código de acceso del equipo.`)
    return false
  }
  usuarios.registrar(u.id, nombreDe(u), u.username)
  console.log(`🆕 Usuario registrado: ${nombreDe(u)} (${u.id})`)
  await avisarNuevoUsuario(u)
  await tg.enviarTexto(m.chat.id, saludo(u.first_name))
  // Si su primer mensaje fue el código o /start, ya quedó saludado; si fue una petición, se atiende
  return !(m.text?.trim() === config.codigoAcceso || m.text?.trim().startsWith("/start"))
}

// Una cola por chat: los mensajes de un mismo chat se atienden en orden
const colas = new Map<number, Promise<void>>()
function enCola(chatId: number, tarea: () => Promise<void>) {
  const anterior = colas.get(chatId) ?? Promise.resolve()
  const siguiente = anterior.then(tarea).catch((e) => console.error("Error en la cola:", e))
  colas.set(chatId, siguiente)
}

function mensajeDeError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "La clave de Anthropic no es válida. Revisa ANTHROPIC_API_KEY."
  if (e instanceof Anthropic.RateLimitError) return "Estoy recibiendo demasiadas peticiones; intenta en un momento."
  if (e instanceof Anthropic.APIConnectionError) return "No pude conectarme con el modelo; revisa el internet e intenta de nuevo."
  if (e instanceof Anthropic.APIError) return `El modelo devolvió un error (${e.status}). Intenta de nuevo.`
  return "Algo falló procesando tu mensaje. Intenta de nuevo."
}

async function atenderMensaje(m: tg.Mensaje) {
  const chatId = m.chat.id
  const operador = nombreDe(m.from)
  const texto = m.text?.trim()

  if (!(await darAcceso(m))) return

  if (texto?.startsWith("/start")) {
    reiniciarConversacion(chatId)
    await tg.enviarTexto(chatId, saludo(m.from?.first_name ?? ""))
    return
  }
  if (texto === "/id") {
    await tg.enviarTexto(chatId, `Tu ID de Telegram es ${m.from?.id}.`)
    return
  }
  if (texto === "/usuarios" && m.from && usuarios.esAdmin(m.from.id)) {
    const lista = usuarios.listar()
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
    reiniciarConversacion(chatId)
    await tg.enviarTexto(chatId, "Listo, empezamos de cero.")
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
      respuesta = await procesarMensaje(chatId, operador, peticion)
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

async function atenderBoton(q: NonNullable<tg.Actualizacion["callback_query"]>) {
  const chatId = q.message?.chat.id
  if (!chatId || !q.data || !usuarios.estaRegistrado(q.from.id)) {
    await tg.responderBoton(q.id, "No autorizado")
    return
  }
  const [decision, id] = q.data.split(":")

  if (decision === "bloq" || decision === "desbloq") {
    if (!usuarios.esAdmin(q.from.id)) {
      await tg.responderBoton(q.id, "Solo un administrador puede hacer esto")
      return
    }
    const r = decision === "bloq" ? usuarios.bloquear(id) : usuarios.desbloquear(id)
    await tg.responderBoton(q.id, decision === "bloq" ? "Bloqueado" : "Desbloqueado")
    if (q.message) await tg.quitarBotones(chatId, q.message.message_id)
    await tg.enviarTexto(chatId, `${decision === "bloq" ? "🚫 Bloqueado" : "✅ Desbloqueado"}: ${r?.nombre ?? "usuario"} (ID ${id})`)
    if (decision === "bloq") reiniciarConversacion(Number(id))
    return
  }

  await tg.responderBoton(q.id, decision === "si" ? "Ejecutando…" : "Cancelado")
  if (q.message) await tg.quitarBotones(chatId, q.message.message_id)
  const resultado = await resolverConfirmacion(id, chatId, decision === "si", nombreDe(q.from))
  await tg.enviarTexto(chatId, `${decision === "si" ? "✅" : "✖️"} ${resultado}`)
}

async function principal() {
  const bot = await tg.yo()
  await tg.configurarComandos()
  console.log(`🤖 ${config.nombreAgente} en línea como @${bot.username} · modelo ${config.modelo}`)
  console.log(`👥 Registro automático activo${config.codigoAcceso ? " (con código de acceso)" : ""} · ${usuarios.listar().length} usuario(s) · administradores: ${[...config.usuariosPermitidos].join(", ") || "ninguno"}`)

  let offset = 0
  let pausa = 1000
  for (;;) {
    try {
      const actualizaciones = await tg.obtenerActualizaciones(offset)
      pausa = 1000
      for (const a of actualizaciones) {
        offset = a.update_id + 1
        if (a.message) {
          const m = a.message
          enCola(m.chat.id, () => atenderMensaje(m))
        } else if (a.callback_query) {
          const q = a.callback_query
          const chatId = q.message?.chat.id ?? q.from.id
          enCola(chatId, () => atenderBoton(q))
        }
      }
    } catch (e) {
      console.error("Telegram:", (e as Error).message)
      await new Promise((r) => setTimeout(r, pausa))
      pausa = Math.min(pausa * 2, 30_000)
    }
  }
}

process.on("SIGINT", () => { console.log("\n👋 Agente detenido"); process.exit(0) })
principal().catch((e) => {
  console.error("No se pudo iniciar el agente:", e.message)
  process.exit(1)
})
