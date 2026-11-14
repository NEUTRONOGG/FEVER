// Cliente mínimo de la Bot API de Telegram (long polling, sin dependencias)
import { config } from "./config.js"

const API = () => `https://api.telegram.org/bot${config.telegramToken}`
const ARCHIVOS = () => `https://api.telegram.org/file/bot${config.telegramToken}`

export interface Usuario { id: number; first_name: string; last_name?: string; username?: string }
export interface Mensaje {
  message_id: number
  chat: { id: number; type: string }
  from?: Usuario
  text?: string
  voice?: { file_id: string; duration: number }
  audio?: { file_id: string; mime_type?: string; file_name?: string }
}
export interface Actualizacion {
  update_id: number
  message?: Mensaje
  callback_query?: { id: string; from: Usuario; data?: string; message?: Mensaje }
}

async function llamar<T>(metodo: string, cuerpo?: Record<string, unknown> | FormData, timeoutMs = 30_000): Promise<T> {
  const esForm = cuerpo instanceof FormData
  const r = await fetch(`${API()}/${metodo}`, {
    method: "POST",
    headers: esForm ? undefined : { "Content-Type": "application/json" },
    body: esForm ? cuerpo : JSON.stringify(cuerpo ?? {}),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const json = (await r.json()) as { ok: boolean; result: T; description?: string }
  if (!json.ok) throw new Error(`Telegram ${metodo}: ${json.description}`)
  return json.result
}

export const obtenerActualizaciones = (offset: number) =>
  llamar<Actualizacion[]>("getUpdates", { offset, timeout: 50, allowed_updates: ["message", "callback_query"] }, 65_000)

export const yo = () => llamar<Usuario>("getMe")

export const accion = (chatId: number, tipo: "typing" | "record_voice") =>
  llamar("sendChatAction", { chat_id: chatId, action: tipo }).catch(() => {})

// Telegram limita los mensajes a 4096 caracteres
export async function enviarTexto(chatId: number, texto: string, botones?: { texto: string; dato: string }[][]) {
  const partes = texto.match(/[\s\S]{1,4000}/g) ?? [texto]
  for (let i = 0; i < partes.length; i++) {
    const ultimo = i === partes.length - 1
    await llamar("sendMessage", {
      chat_id: chatId,
      text: partes[i],
      ...(ultimo && botones ? { reply_markup: { inline_keyboard: botones.map((fila) => fila.map((b) => ({ text: b.texto, callback_data: b.dato }))) } } : {}),
    })
  }
}

export async function enviarVoz(chatId: number, audio: Buffer) {
  const form = new FormData()
  form.append("chat_id", String(chatId))
  form.append("voice", new Blob([new Uint8Array(audio)], { type: "audio/ogg" }), "respuesta.ogg")
  await llamar("sendVoice", form, 60_000)
}

export const responderBoton = (id: string, texto?: string) =>
  llamar("answerCallbackQuery", { callback_query_id: id, ...(texto ? { text: texto } : {}) }).catch(() => {})

export const quitarBotones = (chatId: number, messageId: number) =>
  llamar("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } }).catch(() => {})

export async function descargarArchivo(fileId: string): Promise<Buffer> {
  const f = await llamar<{ file_path: string }>("getFile", { file_id: fileId })
  const r = await fetch(`${ARCHIVOS()}/${f.file_path}`, { signal: AbortSignal.timeout(60_000) })
  if (!r.ok) throw new Error(`No se pudo descargar el audio (${r.status})`)
  return Buffer.from(await r.arrayBuffer())
}

export const configurarComandos = () =>
  llamar("setMyCommands", {
    commands: [
      { command: "resumen", description: "Cómo va la noche" },
      { command: "mesas", description: "Estado de las mesas" },
      { command: "reservas", description: "Reservaciones de hoy" },
      { command: "sucursal", description: "Elegir sucursal (León / Aguascalientes)" },
      { command: "nuevo", description: "Empezar conversación nueva" },
      { command: "start", description: "Empezar a platicar" },
      { command: "id", description: "Ver mi ID de Telegram" },
    ],
  }).catch(() => {})

// Modo nube: Telegram envía cada mensaje al Worker
export const configurarWebhook = (url: string, secreto: string) =>
  llamar("setWebhook", { url, secret_token: secreto, allowed_updates: ["message", "callback_query"], drop_pending_updates: false })

export const quitarWebhook = () => llamar("deleteWebhook", { drop_pending_updates: false })
export const infoWebhook = () => llamar<{ url: string; pending_update_count: number; last_error_message?: string }>("getWebhookInfo")
