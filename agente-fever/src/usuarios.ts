// Registro automático de usuarios: quien escribe al bot queda dado de alta solo.
// Los administradores (TELEGRAM_ALLOWED_IDS) reciben aviso y pueden bloquear.
import { config } from "./config.js"

export interface UsuarioRegistrado {
  nombre: string
  usuario?: string
  desde: string
}

export interface DatosUsuarios {
  usuarios: Record<string, UsuarioRegistrado>
  bloqueados: string[]
}

export type EstadoUsuario = "admin" | "registrado" | "bloqueado" | "nuevo"

/** Dónde se guarda el registro: archivo local o Durable Object en Cloudflare. */
export interface RegistroUsuarios {
  estado(id: number): Promise<EstadoUsuario>
  registrar(id: number, nombre: string, usuario?: string): Promise<void>
  bloquear(id: string): Promise<UsuarioRegistrado | undefined>
  desbloquear(id: string): Promise<UsuarioRegistrado | undefined>
  listar(): Promise<(UsuarioRegistrado & { id: string; bloqueado: boolean })[]>
}

export const esAdmin = (id: number) => config.usuariosPermitidos.has(String(id))

/** Lógica común sobre unos datos que el llamador sabe leer y guardar. */
export function registroSobre(leer: () => Promise<DatosUsuarios>, guardar: (d: DatosUsuarios) => Promise<void>): RegistroUsuarios {
  return {
    async estado(id) {
      const d = await leer()
      if (d.bloqueados.includes(String(id))) return "bloqueado"
      if (esAdmin(id)) return "admin"
      return d.usuarios[String(id)] ? "registrado" : "nuevo"
    },
    async registrar(id, nombre, usuario) {
      const d = await leer()
      d.usuarios[String(id)] = { nombre, usuario, desde: new Date().toISOString() }
      d.bloqueados = d.bloqueados.filter((b) => b !== String(id))
      await guardar(d)
    },
    async bloquear(id) {
      const d = await leer()
      if (!d.bloqueados.includes(id)) d.bloqueados.push(id)
      await guardar(d)
      return d.usuarios[id]
    },
    async desbloquear(id) {
      const d = await leer()
      d.bloqueados = d.bloqueados.filter((b) => b !== id)
      await guardar(d)
      return d.usuarios[id]
    },
    async listar() {
      const d = await leer()
      return Object.entries(d.usuarios).map(([id, r]) => ({ id, ...r, bloqueado: d.bloqueados.includes(id) }))
    },
  }
}

export const datosVacios = (): DatosUsuarios => ({ usuarios: {}, bloqueados: [] })
