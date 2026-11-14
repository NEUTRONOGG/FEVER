// Sucursal que se está viendo en este dispositivo: 'leon', 'ags' o 'todas' (acumulado).
// La base de datos filtra sola con la cabecera x-sucursal (ver SUCURSALES-AGUASCALIENTES.sql).

export type SucursalId = "leon" | "ags"
export type VistaSucursal = SucursalId | "todas"

export const SUCURSALES: { id: SucursalId; nombre: string; corto: string }[] = [
  { id: "leon", nombre: "León", corto: "LEÓN" },
  { id: "ags", nombre: "Aguascalientes", corto: "AGS" },
]

const CLAVE = "feverSucursal"
const VALIDAS: VistaSucursal[] = ["leon", "ags", "todas"]

const esValida = (s: unknown): s is VistaSucursal => typeof s === "string" && (VALIDAS as string[]).includes(s)

function leerGuardada(): VistaSucursal | null {
  if (typeof window === "undefined") return null
  try {
    // Un enlace con ?sucursal=ags (p. ej. el QR de una mesa) fija la sucursal del dispositivo
    const enUrl = new URLSearchParams(window.location.search).get("sucursal")
    if (esValida(enUrl)) {
      localStorage.setItem(CLAVE, enUrl)
      return enUrl
    }
    const guardada = localStorage.getItem(CLAVE)
    return esValida(guardada) ? guardada : null
  } catch {
    return null
  }
}

/** Sucursal elegida en este dispositivo, o null si nunca se ha elegido. */
export function sucursalElegida(): VistaSucursal | null {
  return leerGuardada()
}

/** Sucursal para consultar: la elegida o León (comportamiento histórico). */
export function sucursalActual(): VistaSucursal {
  return leerGuardada() ?? "leon"
}

export function nombreSucursal(s: VistaSucursal | null | undefined): string {
  if (s === "todas") return "Todas las sucursales"
  return SUCURSALES.find((x) => x.id === s)?.nombre ?? "León"
}

/** Cambia la sucursal y recarga para que todas las pantallas consulten de nuevo. */
export function cambiarSucursal(s: VistaSucursal) {
  try {
    localStorage.setItem(CLAVE, s)
  } catch {}
  const url = new URL(window.location.href)
  url.searchParams.delete("sucursal")
  window.location.replace(url.toString())
}
