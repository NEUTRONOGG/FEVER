// Registro automático de usuarios: quien escribe al bot queda dado de alta solo.
// Los administradores (TELEGRAM_ALLOWED_IDS) reciben aviso y pueden bloquear.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { config } from "./config.js"

interface Registro {
  nombre: string
  usuario?: string
  desde: string
}
interface Datos {
  usuarios: Record<string, Registro>
  bloqueados: string[]
}

const ARCHIVO = join(dirname(fileURLToPath(import.meta.url)), "..", "datos", "usuarios.json")

function cargar(): Datos {
  try {
    return JSON.parse(readFileSync(ARCHIVO, "utf8")) as Datos
  } catch {
    return { usuarios: {}, bloqueados: [] }
  }
}

const datos = cargar()

function guardar() {
  mkdirSync(dirname(ARCHIVO), { recursive: true })
  writeFileSync(ARCHIVO, JSON.stringify(datos, null, 2))
}

export const esAdmin = (id: number) => config.usuariosPermitidos.has(String(id))
export const estaBloqueado = (id: number) => datos.bloqueados.includes(String(id))
export const estaRegistrado = (id: number) => esAdmin(id) || (!!datos.usuarios[String(id)] && !estaBloqueado(id))

export function registrar(id: number, nombre: string, usuario?: string) {
  datos.usuarios[String(id)] = { nombre, usuario, desde: new Date().toISOString() }
  datos.bloqueados = datos.bloqueados.filter((b) => b !== String(id))
  guardar()
}

export function bloquear(id: string): Registro | undefined {
  if (!datos.bloqueados.includes(id)) datos.bloqueados.push(id)
  guardar()
  return datos.usuarios[id]
}

export function desbloquear(id: string): Registro | undefined {
  datos.bloqueados = datos.bloqueados.filter((b) => b !== id)
  guardar()
  return datos.usuarios[id]
}

export function listar() {
  return Object.entries(datos.usuarios).map(([id, r]) => ({ id, ...r, bloqueado: datos.bloqueados.includes(id) }))
}
