// Versión local (Node): long polling contra Telegram. Útil para pruebas.
// En producción el agente corre en Cloudflare (src/worker.ts).
import "dotenv/config"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { config, iniciarConfig } from "./config.js"
import { almacenEnMemoria, type Almacen } from "./agente.js"
import { atenderActualizacion, chatDe, type Contexto } from "./bot.js"
import * as tg from "./telegram.js"
import { datosVacios, registroSobre, type DatosUsuarios } from "./usuarios.js"

try {
  iniciarConfig(process.env)
} catch (e) {
  console.error(`❌ ${(e as Error).message}. Usa .env.example como guía.`)
  process.exit(1)
}

// Registro de usuarios en un archivo local
const ARCHIVO = join(dirname(fileURLToPath(import.meta.url)), "..", "datos", "usuarios.json")
const leerArchivo = async (): Promise<DatosUsuarios> => {
  try { return JSON.parse(readFileSync(ARCHIVO, "utf8")) } catch { return datosVacios() }
}
const guardarArchivo = async (d: DatosUsuarios) => {
  mkdirSync(dirname(ARCHIVO), { recursive: true })
  writeFileSync(ARCHIVO, JSON.stringify(d, null, 2))
}

const almacenes = new Map<number, Almacen>()
const ctx: Contexto = {
  usuarios: registroSobre(leerArchivo, guardarArchivo),
  almacen: (chatId) => {
    let a = almacenes.get(chatId)
    if (!a) almacenes.set(chatId, (a = almacenEnMemoria()))
    return a
  },
}

// Una cola por chat: los mensajes de un mismo chat se atienden en orden
const colas = new Map<number, Promise<void>>()
function enCola(chatId: number, tarea: () => Promise<void>) {
  const siguiente = (colas.get(chatId) ?? Promise.resolve()).then(tarea).catch((e) => console.error("Error en la cola:", e))
  colas.set(chatId, siguiente)
}

async function principal() {
  const webhook = await tg.infoWebhook()
  if (webhook.url && !process.argv.includes("--forzar")) {
    console.error(`⛔ El agente ya está corriendo en la nube (${webhook.url}).\n   Si arrancas aquí le quitarías los mensajes. Para hacerlo de todos modos: npm run local -- --forzar`)
    process.exit(1)
  }
  if (webhook.url) await tg.quitarWebhook()

  const bot = await tg.yo()
  await tg.configurarComandos()
  const registrados = await ctx.usuarios.listar()
  console.log(`🤖 ${config.nombreAgente} en línea (local) como @${bot.username} · modelo ${config.modelo}`)
  console.log(`👥 Registro automático activo${config.codigoAcceso ? " (con código de acceso)" : ""} · ${registrados.length} usuario(s) · administradores: ${[...config.usuariosPermitidos].join(", ") || "ninguno"}`)

  let offset = 0
  let pausa = 1000
  for (;;) {
    try {
      const actualizaciones = await tg.obtenerActualizaciones(offset)
      pausa = 1000
      for (const a of actualizaciones) {
        offset = a.update_id + 1
        const chatId = chatDe(a)
        if (chatId !== null) enCola(chatId, () => atenderActualizacion(a, ctx))
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
