"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Building2, Layers } from "lucide-react"
import { SUCURSALES, cambiarSucursal, nombreSucursal, sucursalElegida, type VistaSucursal } from "@/lib/sucursal"

/** Lee la sucursal elegida en el navegador (null mientras carga o si nunca se eligió). */
export function useSucursal() {
  const [sucursal, setSucursal] = useState<VistaSucursal | null | undefined>(undefined)
  useEffect(() => setSucursal(sucursalElegida()), [])
  return sucursal
}

/** Botones León · Aguascalientes · (Todas) para cambiar de sucursal. */
export function SelectorSucursal({ permitirTodas = false, compacto = false }: { permitirTodas?: boolean; compacto?: boolean }) {
  const actual = useSucursal()
  const opciones: { id: VistaSucursal; texto: string }[] = [
    ...SUCURSALES.map((s) => ({ id: s.id as VistaSucursal, texto: compacto ? s.corto : s.nombre })),
    ...(permitirTodas ? [{ id: "todas" as const, texto: compacto ? "TODAS" : "Todas" }] : []),
  ]
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-amber-500/25 bg-black/40 p-0.5" role="group" aria-label="Sucursal">
      {opciones.map((o) => {
        const activa = (actual ?? "leon") === o.id
        return (
          <button
            key={o.id}
            onClick={() => !activa && cambiarSucursal(o.id)}
            className={`flex items-center gap-1 rounded-lg font-bold transition-colors ${compacto ? "h-8 px-2 text-[10px] tracking-wider" : "h-9 px-3 text-xs"} ${
              activa ? "bg-gradient-to-b from-amber-400 to-amber-600 text-black" : "text-slate-300 hover:bg-white/5 hover:text-amber-300"
            }`}
            aria-pressed={activa}
          >
            {o.id === "todas" ? <Layers className="h-3 w-3" /> : !compacto && <Building2 className="h-3 w-3" />}
            {o.texto}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Pide elegir sucursal antes de mostrar la pantalla.
 * Las pantallas operativas (hostess, mesero, RP…) necesitan una sucursal concreta;
 * las de reportes aceptan "Todas" (acumulado).
 */
export function GuardiaSucursal({ children, permitirTodas = false }: { children: ReactNode; permitirTodas?: boolean }) {
  const sucursal = useSucursal()
  if (sucursal === undefined) return null
  const valida = sucursal !== null && (permitirTodas || sucursal !== "todas")
  if (valida) return <>{children}</>

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#070503] p-6">
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-black tracking-[0.3em] text-amber-400">FEVER</p>
        <h1 className="mt-2 text-2xl font-black text-white">¿En qué sucursal estás?</h1>
        <p className="mt-2 text-sm text-slate-400">
          {sucursal === "todas"
            ? "Esta pantalla opera una sucursal a la vez. Elige cuál."
            : "Este dispositivo trabajará con la sucursal que elijas. Puedes cambiarla después."}
        </p>
        <div className="mt-6 grid gap-3">
          {SUCURSALES.map((s) => (
            <button
              key={s.id}
              onClick={() => cambiarSucursal(s.id)}
              className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-white/[0.03] px-5 py-4 text-left transition-colors hover:border-amber-400 hover:bg-amber-500/10"
            >
              <span>
                <span className="block text-lg font-bold text-white">FEVER {s.nombre}</span>
                <span className="text-xs text-slate-400">{s.id === "leon" ? "León, Guanajuato" : "Aguascalientes, Ags."}</span>
              </span>
              <Building2 className="h-5 w-5 text-amber-400" />
            </button>
          ))}
          {permitirTodas && (
            <button
              onClick={() => cambiarSucursal("todas")}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left transition-colors hover:border-amber-400/60"
            >
              <span>
                <span className="block text-lg font-bold text-white">{nombreSucursal("todas")}</span>
                <span className="text-xs text-slate-400">Acumulado de León y Aguascalientes (solo consulta)</span>
              </span>
              <Layers className="h-5 w-5 text-amber-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
