import { config } from "./config.js"

// La operación es nocturna: lo que pasa antes de las 6:00 pertenece a la noche anterior.
const HORA_CORTE_NOCHE = 6

interface Partes {
  anio: number
  mes: number
  dia: number
  hora: number
  minuto: number
}

function partes(fecha: Date): Partes {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha)
  const v = (t: string) => Number(p.find((x) => x.type === t)?.value)
  return { anio: v("year"), mes: v("month"), dia: v("day"), hora: v("hour"), minuto: v("minute") }
}

const dos = (n: number) => String(n).padStart(2, "0")

export function fechaLocal(fecha = new Date()): string {
  const p = partes(fecha)
  return `${p.anio}-${dos(p.mes)}-${dos(p.dia)}`
}

export function horaLocal(fecha = new Date()): string {
  const p = partes(fecha)
  return `${dos(p.hora)}:${dos(p.minuto)}`
}

/** Fecha (YYYY-MM-DD) de la noche de operación en curso. */
export function nocheOperativa(fecha = new Date()): string {
  const p = partes(fecha)
  if (p.hora >= HORA_CORTE_NOCHE) return fechaLocal(fecha)
  return fechaLocal(new Date(fecha.getTime() - 24 * 3600 * 1000))
}

/** Algunas pantallas del sistema guardan la fecha en UTC; se consulta también para no perder registros. */
export function fechaUTC(fecha = new Date()): string {
  return fecha.toISOString().split("T")[0]
}

/** Convierte una fecha y hora locales (zona del negocio) a un Date real (UTC). */
export function localAUtc(fechaYmd: string, hhmm: string): Date {
  const [a, m, d] = fechaYmd.split("-").map(Number)
  const [h, mi] = hhmm.split(":").map(Number)
  const supuesto = Date.UTC(a, m - 1, d, h, mi)
  const p = partes(new Date(supuesto))
  const comoLocal = Date.UTC(p.anio, p.mes - 1, p.dia, p.hora, p.minuto)
  return new Date(supuesto - (comoLocal - supuesto))
}

/** Ventana [inicio, fin) de una noche operativa: de las 6:00 de ese día a las 6:00 del siguiente. */
export function ventanaNoche(nocheYmd: string): { inicio: Date; fin: Date } {
  const inicio = localAUtc(nocheYmd, `${dos(HORA_CORTE_NOCHE)}:00`)
  return { inicio, fin: new Date(inicio.getTime() + 24 * 3600 * 1000) }
}

/** Hora "HH:MM" de una reserva para la noche indicada (las horas de madrugada caen al día siguiente). */
export function horaDeNocheAUtc(nocheYmd: string, hhmm: string): Date {
  const [h] = hhmm.split(":").map(Number)
  if (h >= HORA_CORTE_NOCHE) return localAUtc(nocheYmd, hhmm)
  const siguiente = fechaLocal(new Date(localAUtc(nocheYmd, "12:00").getTime() + 24 * 3600 * 1000))
  return localAUtc(siguiente, hhmm)
}

export function marcaTiempo(): string {
  const ahora = new Date()
  const texto = new Intl.DateTimeFormat("es-MX", {
    timeZone: config.zonaHoraria,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ahora)
  return `Ahora: ${texto} (${config.zonaHoraria}). Noche operativa en curso: ${nocheOperativa(ahora)}.`
}

export function formatoHora(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return horaLocal(d)
}
