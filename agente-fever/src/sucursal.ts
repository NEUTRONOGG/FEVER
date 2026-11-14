// Sucursal con la que trabaja cada petición del agente ('leon' | 'ags').
// Viaja con la ejecución (AsyncLocalStorage) para que dos chats de sucursales distintas no se mezclen.
import { AsyncLocalStorage } from "node:async_hooks"

export type Sucursal = "leon" | "ags"

export const SUCURSALES: { id: Sucursal; nombre: string }[] = [
  { id: "leon", nombre: "León" },
  { id: "ags", nombre: "Aguascalientes" },
]

export const nombreSucursal = (s: Sucursal) => SUCURSALES.find((x) => x.id === s)?.nombre ?? "León"
export const esSucursal = (s: unknown): s is Sucursal => s === "leon" || s === "ags"

const actual = new AsyncLocalStorage<Sucursal>()

/** Ejecuta fn con la sucursal indicada como activa para todas las consultas que haga. */
export const conSucursal = <T>(s: Sucursal, fn: () => Promise<T>) => actual.run(s, fn)

export const sucursalActiva = (): Sucursal => actual.getStore() ?? "leon"
