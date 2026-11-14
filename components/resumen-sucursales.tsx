"use client"

import { useEffect, useState } from "react"
import { Building2, Layers } from "lucide-react"
import { clienteDeSucursal } from "@/lib/supabase"
import { SUCURSALES, type SucursalId } from "@/lib/sucursal"

interface Cifras {
  mesas: number
  ocupadas: number
  personas: number
  consumo: number
  reservaciones: number
  pendientes: number
}

const vacias = (): Cifras => ({ mesas: 0, ocupadas: 0, personas: 0, consumo: 0, reservaciones: 0, pendientes: 0 })

// La noche en curso puede estar guardada con fecha local (antes de las 6:00 cuenta la noche anterior) o UTC
function fechasNoche() {
  const ahora = new Date()
  const noche = new Date(ahora.getTime() - (ahora.getHours() < 6 ? 24 * 3600 * 1000 : 0))
  return Array.from(new Set([noche.toLocaleDateString("en-CA"), ahora.toISOString().split("T")[0]]))
}

async function cifrasDe(sucursal: SucursalId): Promise<Cifras> {
  const db = clienteDeSucursal(sucursal)
  const [mesas, reservas] = await Promise.all([
    db.from("mesas").select("estado, numero_personas, total_actual"),
    db.from("reservaciones").select("estado").in("fecha", fechasNoche()),
  ])
  const ocupadas = (mesas.data ?? []).filter((m) => m.estado === "ocupada")
  return {
    mesas: mesas.data?.length ?? 0,
    ocupadas: ocupadas.length,
    personas: ocupadas.reduce((s, m) => s + (m.numero_personas || 0), 0),
    consumo: ocupadas.reduce((s, m) => s + Number(m.total_actual || 0), 0),
    reservaciones: reservas.data?.length ?? 0,
    pendientes: (reservas.data ?? []).filter((r) => r.estado === "pendiente").length,
  }
}

const pesos = (n: number) => `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`

/** Comparativo en vivo de la noche: cada sucursal y el acumulado. */
export default function ResumenSucursales() {
  const [datos, setDatos] = useState<Record<SucursalId, Cifras> | null>(null)

  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const resultados = await Promise.all(SUCURSALES.map((s) => cifrasDe(s.id).catch(() => vacias())))
      if (vivo) setDatos(Object.fromEntries(SUCURSALES.map((s, i) => [s.id, resultados[i]])) as Record<SucursalId, Cifras>)
    }
    cargar()
    const intervalo = setInterval(cargar, 15000)
    return () => {
      vivo = false
      clearInterval(intervalo)
    }
  }, [])

  const total = datos
    ? Object.values(datos).reduce((t, c) => ({
        mesas: t.mesas + c.mesas,
        ocupadas: t.ocupadas + c.ocupadas,
        personas: t.personas + c.personas,
        consumo: t.consumo + c.consumo,
        reservaciones: t.reservaciones + c.reservaciones,
        pendientes: t.pendientes + c.pendientes,
      }), vacias())
    : null

  const columnas: { clave: string; titulo: string; c: Cifras | null; acumulado?: boolean }[] = [
    ...SUCURSALES.map((s) => ({ clave: s.id, titulo: s.nombre, c: datos?.[s.id] ?? null })),
    { clave: "total", titulo: "Acumulado", c: total, acumulado: true },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {columnas.map(({ clave, titulo, c, acumulado }) => (
        <div
          key={clave}
          className={`rounded-2xl border p-4 ${acumulado ? "border-amber-500/40 bg-amber-500/[0.07]" : "border-white/10 bg-white/[0.03]"}`}
        >
          <div className="mb-3 flex items-center gap-2">
            {acumulado ? <Layers className="h-4 w-4 text-amber-400" /> : <Building2 className="h-4 w-4 text-amber-400" />}
            <span className="text-sm font-bold text-white">{acumulado ? titulo : `FEVER ${titulo}`}</span>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-slate-500">Esta noche</span>
          </div>
          {!c ? (
            <div className="h-24 animate-pulse rounded-xl bg-white/5" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Dato etiqueta="Ocupación" valor={`${c.mesas ? Math.round((c.ocupadas / c.mesas) * 100) : 0}%`} detalle={`${c.ocupadas}/${c.mesas} mesas`} />
              <Dato etiqueta="Personas" valor={String(c.personas)} detalle="en mesas" />
              <Dato etiqueta="Consumo abierto" valor={pesos(c.consumo)} detalle="cuentas sin cerrar" />
              <Dato etiqueta="Reservaciones" valor={String(c.reservaciones)} detalle={`${c.pendientes} por llegar`} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Dato({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400">{etiqueta}</p>
      <p className="text-xl font-black leading-tight text-white">{valor}</p>
      <p className="text-[10px] text-slate-500">{detalle}</p>
    </div>
  )
}
