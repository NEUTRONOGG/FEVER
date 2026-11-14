// Versión en la nube (Cloudflare Workers): Telegram envía cada mensaje por webhook.
// - El Worker valida el webhook, deja la actualización en la cola de su chat y responde al instante.
// - Un Durable Object por chat guarda la conversación y procesa su cola en orden con una alarma
//   (hasta 15 min por ejecución), así Telegram nunca reintenta ni duplica mensajes.
// - Un Durable Object "registro" guarda los usuarios registrados y bloqueados.
import { DurableObject } from "cloudflare:workers"
import { config, iniciarConfig } from "./config.js"
import type { Almacen, Conversacion, Pendiente } from "./agente.js"
import { atenderActualizacion, chatDe, type Contexto } from "./bot.js"
import * as tg from "./telegram.js"
import type { Sucursal } from "./sucursal.js"
import { datosVacios, registroSobre, type DatosUsuarios, type RegistroUsuarios } from "./usuarios.js"

export interface Env {
  CHAT: DurableObjectNamespace<ChatFever>
  REGISTRO: DurableObjectNamespace<RegistroFever>
  [variable: string]: unknown
}

/** Registro de usuarios con la lógica común, guardado en el almacenamiento del Durable Object. */
export class RegistroFever extends DurableObject<Env> {
  private registro: RegistroUsuarios

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    iniciarConfig(env)
    this.registro = registroSobre(
      async () => (await this.ctx.storage.get<DatosUsuarios>("datos")) ?? datosVacios(),
      async (d) => { await this.ctx.storage.put("datos", d) }
    )
  }

  estado(id: number) { return this.registro.estado(id) }
  registrar(id: number, nombre: string, usuario?: string) { return this.registro.registrar(id, nombre, usuario) }
  bloquear(id: string) { return this.registro.bloquear(id) }
  desbloquear(id: string) { return this.registro.desbloquear(id) }
  listar() { return this.registro.listar() }
}

/** Un chat de Telegram: su conversación, sus botones pendientes y su cola de mensajes. */
export class ChatFever extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    iniciarConfig(env)
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS mensajes (orden INTEGER PRIMARY KEY, json TEXT NOT NULL)`)
    })
  }

  /** Recibe una actualización de Telegram y agenda su procesamiento inmediato. */
  async encolar(actualizacion: tg.Actualizacion) {
    const cola = (await this.ctx.storage.get<tg.Actualizacion[]>("cola")) ?? []
    if (cola.some((a) => a.update_id === actualizacion.update_id)) return
    cola.push(actualizacion)
    await this.ctx.storage.put("cola", cola)
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(Date.now())
  }

  async alarm() {
    for (;;) {
      const cola = (await this.ctx.storage.get<tg.Actualizacion[]>("cola")) ?? []
      const siguiente = cola.shift()
      if (!siguiente) return
      // Se saca de la cola antes de procesarla: un mensaje nunca se ejecuta dos veces
      await this.ctx.storage.put("cola", cola)
      try {
        await atenderActualizacion(siguiente, contexto(this.env, this, chatDe(siguiente)))
      } catch (e) {
        console.error("❌ Error procesando actualización:", e)
      }
    }
  }

  // ---------- Almacén de este chat ----------
  async leerConversacion(): Promise<Conversacion | null> {
    const filas = this.ctx.storage.sql.exec<{ json: string }>("SELECT json FROM mensajes ORDER BY orden").toArray()
    const ultimaActividad = await this.ctx.storage.get<number>("ultimaActividad")
    if (!filas.length || !ultimaActividad) return null
    return { mensajes: filas.map((f) => JSON.parse(f.json)), ultimaActividad }
  }

  async guardarConversacion(c: Conversacion) {
    // Sin await entre escrituras: el reemplazo es atómico
    this.ctx.storage.sql.exec("DELETE FROM mensajes")
    c.mensajes.forEach((m, i) => this.ctx.storage.sql.exec("INSERT INTO mensajes (orden, json) VALUES (?, ?)", i, JSON.stringify(m)))
    await this.ctx.storage.put("ultimaActividad", c.ultimaActividad)
  }

  async borrarConversacion() {
    this.ctx.storage.sql.exec("DELETE FROM mensajes")
    await this.ctx.storage.delete("ultimaActividad")
  }

  async guardarPendiente(p: Pendiente) {
    const ahora = Date.now()
    const viejos = [...(await this.ctx.storage.list<Pendiente>({ prefix: "p:" })).entries()].filter(([, x]) => x.expira < ahora).map(([k]) => k)
    if (viejos.length) await this.ctx.storage.delete(viejos)
    await this.ctx.storage.put(`p:${p.id}`, p)
  }

  async leerSucursal(): Promise<Sucursal | null> {
    return (await this.ctx.storage.get<Sucursal>("sucursal")) ?? null
  }

  async guardarSucursal(s: Sucursal) {
    await this.ctx.storage.put("sucursal", s)
  }

  async tomarPendiente(id: string): Promise<Pendiente | null> {
    const p = (await this.ctx.storage.get<Pendiente>(`p:${id}`)) ?? null
    await this.ctx.storage.delete(`p:${id}`)
    return p
  }
}

function contexto(env: Env, chatActual: ChatFever, chatIdActual: number | null): Contexto {
  const registro = env.REGISTRO.getByName("registro")
  return {
    usuarios: {
      estado: (id) => registro.estado(id),
      registrar: (id, nombre, usuario) => registro.registrar(id, nombre, usuario),
      bloquear: (id) => registro.bloquear(id),
      desbloquear: (id) => registro.desbloquear(id),
      listar: () => registro.listar(),
    },
    almacen: (chatId): Almacen => {
      // El chat actual se usa directo; otro chat (p. ej. al bloquear a alguien) se alcanza por RPC
      if (chatId === chatIdActual) return chatActual
      const destino = env.CHAT.getByName(String(chatId))
      return {
        leerConversacion: () => destino.leerConversacion(),
        guardarConversacion: (c) => destino.guardarConversacion(c),
        borrarConversacion: () => destino.borrarConversacion(),
        guardarPendiente: (p) => destino.guardarPendiente(p),
        tomarPendiente: (id) => destino.tomarPendiente(id),
        leerSucursal: () => destino.leerSucursal(),
        guardarSucursal: (s) => destino.guardarSucursal(s),
      }
    },
  }
}

// Comparación en tiempo constante para el secreto del webhook
function iguales(a: string, b: string) {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    iniciarConfig(env)
    const url = new URL(request.url)

    // Telegram → agente
    if (request.method === "POST" && url.pathname === "/telegram") {
      const recibido = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? ""
      if (!config.telegramSecreto || !iguales(recibido, config.telegramSecreto)) return new Response("No autorizado", { status: 401 })
      const actualizacion = (await request.json()) as tg.Actualizacion
      const chatId = chatDe(actualizacion)
      if (chatId !== null) await env.CHAT.getByName(String(chatId)).encolar(actualizacion)
      return new Response("ok")
    }

    // Conecta el bot a este Worker (una sola vez después de publicar)
    if (url.pathname === "/configurar") {
      if (!config.telegramSecreto || !iguales(url.searchParams.get("clave") ?? "", config.telegramSecreto)) {
        return new Response("No autorizado", { status: 401 })
      }
      await tg.configurarWebhook(`${url.origin}/telegram`, config.telegramSecreto)
      await tg.configurarComandos()
      const bot = await tg.yo()
      return Response.json({ ok: true, bot: `@${bot.username}`, webhook: await tg.infoWebhook() })
    }

    return new Response(`${config.nombreAgente} en línea`)
  },
} satisfies ExportedHandler<Env>
